import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UserService } from '../user/user.service';
import { AdminAuthGuard } from '../auth/guard/admin.guard';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private userService: UserService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: AdminLoginDto) {
    return this.adminService.login(loginDto.email, loginDto.password);
  }

  @UseGuards(AdminAuthGuard)
  @Get('users')
  async getAllUsers() {
    return this.userService.findAll();
  }
}
