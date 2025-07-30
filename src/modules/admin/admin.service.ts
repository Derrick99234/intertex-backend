import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Admin } from 'src/schemas/admin.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private configService: ConfigService,
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
      role: 'super-admin',
      phoneNumber,
      password: hashedPassword,
    });

    return superAdmin.save();
  }
}
