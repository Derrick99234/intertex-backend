import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Admin } from 'src/schemas/admin.schema';
import { ConfigService } from '@nestjs/config';
import { AdminRoles } from 'src/common/utils/enums.utils';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private configService: ConfigService,
    private readonly jwtService: JwtService,
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
    const admin = await this.adminModel.findOne({ email }).select('+password'); // explicitly select password

    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: admin._id, role: admin.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}
