import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guard/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() input: { username: string; password: string }) {
    return this.authService.Authenticate(input);
  }

  @UseGuards(AuthGuard)
  @Get('register')
  async getProfile(@Request() req) {
    return req.user;
  }
}
