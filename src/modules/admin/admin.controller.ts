import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UserService } from '../user/user.service';
import { AdminAuthGuard } from '../auth/guard/admin.guard';
import { AuthUser } from '../../common/decorators/auth-user.decorator';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private userService: UserService,
  ) {}

  @Post('create')
  async createAdmin() {
    return this.adminService.createSuperAdmin();
  }

  @Post('login')
  async login(@Body() loginDto: AdminLoginDto) {
    return this.adminService.login(loginDto.email, loginDto.password);
  }

  @UseGuards(AdminAuthGuard)
  @Get('users')
  async getAllUsers() {
    return this.userService.findAll();
  }

  @UseGuards(AdminAuthGuard)
  @Get('get-admin')
  getAdmin(@AuthUser() authUser: any) {
    const { userId } = authUser;
    return this.adminService.findOne(userId);
  }

  @UseGuards(AdminAuthGuard)
  @Get('get-admin-by-id')
  getAdminById(@Body() { id }: { id: string }) {
    return this.adminService.findOne(id);
  }
}
