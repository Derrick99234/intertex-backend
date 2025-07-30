import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Body() loginDto: AdminLoginDto) {
    return this.adminService.login(loginDto.email, loginDto.password);
  }
}
