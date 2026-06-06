import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { User } from '../../schemas/user.schema';
import { EmailService } from '../../common/utils/email.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

type AuthInput = {
  email: string;
  password: string;
};

type SignInPayload = {
  userId: string;
};

type AuthResult = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    return this.userService.createUser(createUserDto);
  }

  async authenticate(input: AuthInput): Promise<AuthResult> {
    const user = await this.validateUser(input);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.signIn(user);
  }

  private async validateUser(input: AuthInput): Promise<SignInPayload | null> {
    const user = await this.userModel
      .findOne({ email: input.email.toLowerCase() })
      .select('+password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatch = await bcrypt.compare(input.password, user.password);
    if (!passwordMatch) {
      return null;
    }

    return {
      userId: user._id.toString(),
    };
  }

  async signIn(user: SignInPayload): Promise<AuthResult> {
    const accessPayload = {
      sub: user.userId,
      type: 'user',
    };
    const refreshPayload = {
      sub: user.userId,
      type: 'user',
    };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: '1d',
    });
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret:
        this.configService.get<string>('jwt.refreshSecret') ||
        this.configService.get<string>('jwt.secret'),
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshSession(refreshToken: string): Promise<AuthResult> {
    let decoded: { sub: string; type?: string };
    try {
      decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret:
          this.configService.get<string>('jwt.refreshSecret') ||
          this.configService.get<string>('jwt.secret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    if (decoded.type && decoded.type !== 'user') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.signIn({ userId: decoded.sub });
  }

  async requestPasswordReset(email: string) {
    const user = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+passwordResetOtp +passwordResetOtpExpiresAt')
      .exec();

    if (!user) {
      throw new NotFoundException('Account not found');
    }

    const otp = `${randomInt(100000, 999999)}`;
    const hashedOtp = await bcrypt.hash(otp, 10);
    user.passwordResetOtp = hashedOtp;
    user.passwordResetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save();

    await this.emailService.sendPasswordResetOtp(email, otp);

    return {
      message: 'Password reset OTP sent successfully',
    };
  }

  async resendPasswordResetOtp(email: string) {
    await this.requestPasswordReset(email);
    return {
      message: 'Password reset OTP resent successfully',
    };
  }

  async verifyPasswordResetOtp(email: string, otp: string) {
    const user = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .select(
        '+passwordResetOtp +passwordResetOtpExpiresAt +passwordResetToken +passwordResetTokenExpiresAt',
      )
      .exec();

    if (!user) {
      throw new NotFoundException('Account not found');
    }

    if (!user.passwordResetOtp || !user.passwordResetOtpExpiresAt) {
      throw new BadRequestException('No password reset OTP found');
    }

    if (user.passwordResetOtpExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP has expired');
    }

    const isOtpMatch = await bcrypt.compare(otp, user.passwordResetOtp);
    if (!isOtpMatch) {
      throw new BadRequestException('Invalid OTP');
    }

    const resetToken = await this.jwtService.signAsync(
      { sub: user._id.toString(), purpose: 'user-reset' },
      {
        secret:
          this.configService.get<string>('jwt.resetSecret') ||
          this.configService.get<string>('jwt.secret'),
        expiresIn: '15m',
      },
    );

    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpiresAt = undefined;
    user.passwordResetToken = await bcrypt.hash(resetToken, 10);
    user.passwordResetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    return { resetToken };
  }

  async resetPassword(token: string, newPassword: string) {
    let decoded: { sub: string; purpose?: string };
    try {
      decoded = await this.jwtService.verifyAsync(token, {
        secret:
          this.configService.get<string>('jwt.resetSecret') ||
          this.configService.get<string>('jwt.secret'),
      });
    } catch {
      throw new BadRequestException('Reset token is invalid or expired');
    }

    if (decoded.purpose && decoded.purpose !== 'user-reset') {
      throw new BadRequestException('Invalid reset token');
    }

    const user = await this.userModel
      .findById(decoded.sub)
      .select('+password +passwordResetToken +passwordResetTokenExpiresAt')
      .exec();

    if (!user) {
      throw new NotFoundException('Account not found');
    }

    if (!user.passwordResetToken || !user.passwordResetTokenExpiresAt) {
      throw new BadRequestException('Reset token is invalid');
    }

    if (user.passwordResetTokenExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Reset token has expired');
    }

    const isTokenMatch = await bcrypt.compare(token, user.passwordResetToken);
    if (!isTokenMatch) {
      throw new BadRequestException('Reset token is invalid');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpiresAt = undefined;
    await user.save();

    return {
      message: 'Password reset successfully',
    };
  }
}
