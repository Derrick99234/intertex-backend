import { Body, Controller, Post, ValidationPipe, Res } from '@nestjs/common';
import { PlatformLoginService } from './platform-login.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Response } from 'express';

@Controller('platform-login')
export class PlatformLoginController {
  constructor(private readonly platformLoginService: PlatformLoginService) {}

  @Post('google')
  async google(
    @Body(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false }))
    body: CreateUserDto & { googleToken?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.platformLoginService.google(body);
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return { message: 'Login successful', accessToken: result.accessToken };
  }
}
