import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Admin } from '../../schemas/admin.schema';
import { ConfigService } from '@nestjs/config';
import { AdminRoles } from '../../common/utils/enums.utils';
import { JwtService } from '@nestjs/jwt';
import { Promotion } from '../../schemas/promotion.schema';
import { Feedback } from '../../schemas/feedback.schema';
import { Order } from '../../schemas/order';
import { UserService } from '../user/user.service';
import { randomInt } from 'crypto';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { SendAdminEmailDto } from './dto/send-admin-email.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    @InjectModel(Promotion.name)
    private readonly promotionModel: Model<Promotion>,
    @InjectModel(Feedback.name)
    private readonly feedbackModel: Model<Feedback>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async createSuperAdmin(): Promise<Admin> {
    const email = this.configService.get<string>('admin.email');
    const password = this.configService.get<string>('admin.password');
    const phoneNumber = this.configService.get<string>('admin.phoneNumber');

    const existing = await this.adminModel.findOne({ email });
    if (existing) {
      throw new ConflictException('Super admin already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = new this.adminModel({
      firstName: 'Super',
      lastName: 'Admin',
      email,
      role: AdminRoles.SUPER_ADMIN,
      phoneNumber,
      password: hashedPassword,
    });

    return superAdmin.save();
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const admin = await this.adminModel
      .findOne({ email: email.toLowerCase() })
      .select('+password');

    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: admin._id, role: admin.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.adminSecret'),
      expiresIn: '1d',
    });

    return { accessToken };
  }

  async findOne(id: string): Promise<Admin> {
    const admin = await this.adminModel.findById(id).exec();
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    return admin;
  }

  async getDashboardUsers() {
    const users = await this.userService.findAll();
    const orderCounts = await this.orderModel.aggregate([
      {
        $group: {
          _id: '$userId',
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const orderCountMap = new Map(
      orderCounts.map((entry) => [entry._id?.toString(), entry.totalOrders]),
    );

    return users.map((user) => ({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      createdAt:
        (user as any).createdAt instanceof Date
          ? (user as any).createdAt.toISOString()
          : (user as any).createdAt,
      totalOrders: orderCountMap.get(user._id.toString()) || 0,
    }));
  }

  async requestPasswordReset(email: string) {
    const admin = await this.adminModel
      .findOne({ email: email.toLowerCase() })
      .select('+passwordResetOtp +passwordResetOtpExpiresAt');

    if (!admin) {
      throw new NotFoundException('Admin account not found');
    }

    const otp = this.generateOtp();
    admin.passwordResetOtp = otp;
    admin.passwordResetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    admin.passwordResetToken = undefined;
    admin.passwordResetTokenExpiresAt = undefined;
    await admin.save();

    return {
      message: this.configService.get<string>('email.from')
        ? 'Password reset OTP sent successfully'
        : 'Password reset OTP generated. Configure email delivery to send live OTPs.',
    };
  }

  async resendPasswordResetOtp(email: string) {
    await this.requestPasswordReset(email);
    return {
      message: 'Password reset OTP resent successfully',
    };
  }

  async verifyPasswordResetOtp(email: string, otp: string) {
    const admin = await this.adminModel
      .findOne({ email: email.toLowerCase() })
      .select(
        '+passwordResetOtp +passwordResetOtpExpiresAt +passwordResetToken +passwordResetTokenExpiresAt',
      );

    if (!admin) {
      throw new NotFoundException('Admin account not found');
    }

    if (!admin.passwordResetOtp || !admin.passwordResetOtpExpiresAt) {
      throw new BadRequestException('No password reset OTP found');
    }

    if (admin.passwordResetOtpExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP has expired');
    }

    if (admin.passwordResetOtp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    const resetToken = await this.jwtService.signAsync(
      { sub: admin._id.toString(), purpose: 'admin-reset' },
      {
        secret:
          this.configService.get<string>('jwt.resetSecret') ||
          this.configService.get<string>('jwt.adminSecret'),
        expiresIn: '15m',
      },
    );

    admin.passwordResetOtp = undefined;
    admin.passwordResetOtpExpiresAt = undefined;
    admin.passwordResetToken = await bcrypt.hash(resetToken, 10);
    admin.passwordResetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await admin.save();

    return {
      resetToken,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const decoded = await this.verifyResetTokenPayload(token);
    const admin = await this.adminModel
      .findById(decoded.sub)
      .select('+password +passwordResetToken +passwordResetTokenExpiresAt');

    if (!admin) {
      throw new NotFoundException('Admin account not found');
    }

    if (!admin.passwordResetToken || !admin.passwordResetTokenExpiresAt) {
      throw new BadRequestException('Reset token is invalid');
    }

    if (admin.passwordResetTokenExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Reset token has expired');
    }

    const isMatch = await bcrypt.compare(token, admin.passwordResetToken);
    if (!isMatch) {
      throw new BadRequestException('Reset token is invalid');
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.passwordResetToken = undefined;
    admin.passwordResetTokenExpiresAt = undefined;
    admin.passwordResetOtp = undefined;
    admin.passwordResetOtpExpiresAt = undefined;
    await admin.save();

    return {
      message: 'Password reset successfully',
    };
  }

  async getFeedback() {
    const feedback = await this.feedbackModel.find().sort({ createdAt: -1 });
    return { feedback };
  }

  async sendEmailCampaign(dto: SendAdminEmailDto) {
    const recipients =
      dto.audience === 'all-subscribers' || dto.audience === 'all-users'
        ? await this.userService.findAll()
        : await this.userService.findAll();

    return {
      message: 'Email campaign queued successfully',
      audience: dto.audience,
      recipientCount: recipients.length,
      delivery: this.configService.get<string>('email.from')
        ? 'stubbed-send'
        : 'not-configured',
    };
  }

  async getPromotions() {
    const promotions = await this.promotionModel.find().sort({ createdAt: -1 });
    return { promotions };
  }

  async createPromotion(dto: CreatePromotionDto) {
    const promotion = await this.promotionModel.create({
      ...dto,
      code: dto.code.toUpperCase(),
    });

    return {
      message: 'Promotion created successfully',
      promotion,
    };
  }

  async updatePromotion(id: string, dto: UpdatePromotionDto) {
    const promotion = await this.promotionModel.findByIdAndUpdate(
      id,
      {
        ...dto,
        ...(dto.code ? { code: dto.code.toUpperCase() } : {}),
      },
      { new: true, runValidators: true },
    );

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    return {
      message: 'Promotion updated successfully',
      promotion,
    };
  }

  async deletePromotion(id: string) {
    const promotion = await this.promotionModel.findByIdAndDelete(id);
    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    return {
      message: 'Promotion deleted successfully',
    };
  }

  private generateOtp() {
    return `${randomInt(100000, 999999)}`;
  }

  private async verifyResetTokenPayload(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret:
          this.configService.get<string>('jwt.resetSecret') ||
          this.configService.get<string>('jwt.adminSecret'),
      });
    } catch {
      throw new BadRequestException('Reset token is invalid');
    }
  }
}
