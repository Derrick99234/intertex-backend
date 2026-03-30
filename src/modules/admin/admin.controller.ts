import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminAuthGuard } from '../auth/guard/admin.guard';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { RequestAdminPasswordResetDto } from './dto/request-admin-password-reset.dto';
import { VerifyAdminPasswordResetOtpDto } from './dto/verify-admin-password-reset-otp.dto';
import { ResetAdminPasswordDto } from './dto/reset-admin-password.dto';
import { SendAdminEmailDto } from './dto/send-admin-email.dto';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  async createAdmin() {
    return this.adminService.createSuperAdmin();
  }

  @Post('login')
  async login(@Body() loginDto: AdminLoginDto) {
    return this.adminService.login(loginDto.email, loginDto.password);
  }

  @Post('password-reset/request')
  async requestPasswordReset(
    @Body() dto: RequestAdminPasswordResetDto,
  ) {
    return this.adminService.requestPasswordReset(dto.email);
  }

  @Post('password-reset/verify-otp')
  async verifyPasswordResetOtp(
    @Body() dto: VerifyAdminPasswordResetOtpDto,
  ) {
    return this.adminService.verifyPasswordResetOtp(dto.email, dto.otp);
  }

  @Post('password-reset/resend-otp')
  async resendPasswordResetOtp(
    @Body() dto: RequestAdminPasswordResetDto,
  ) {
    return this.adminService.resendPasswordResetOtp(dto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetAdminPasswordDto) {
    return this.adminService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('reset-password/:token')
  async resetPasswordWithParam(
    @Param('token') token: string,
    @Body() dto: Omit<ResetAdminPasswordDto, 'token'>,
  ) {
    return this.adminService.resetPassword(token, dto.newPassword);
  }

  @UseGuards(AdminAuthGuard)
  @Get('users')
  async getAllUsers() {
    return this.adminService.getDashboardUsers();
  }

  @UseGuards(AdminAuthGuard)
  @Get('get-admin')
  getAdmin(@AuthUser() authUser: any) {
    const { userId } = authUser;
    return this.adminService.findOne(userId);
  }

  @UseGuards(AdminAuthGuard)
  @Get('get-admin-by-id/:id')
  getAdminById(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @Get('feedback')
  async getFeedback() {
    return this.adminService.getFeedback();
  }

  @UseGuards(AdminAuthGuard)
  @Post('email/send')
  async sendEmail(@Body() dto: SendAdminEmailDto) {
    return this.adminService.sendEmailCampaign(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Get('promotions')
  async getPromotions() {
    return this.adminService.getPromotions();
  }

  @UseGuards(AdminAuthGuard)
  @Post('promotions')
  async createPromotion(@Body() dto: CreatePromotionDto) {
    return this.adminService.createPromotion(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('promotions/:id')
  async updatePromotion(
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    return this.adminService.updatePromotion(id, dto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('promotions/:id')
  async deletePromotion(@Param('id') id: string) {
    return this.adminService.deletePromotion(id);
  }
}
