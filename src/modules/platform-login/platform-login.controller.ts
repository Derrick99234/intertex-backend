import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { PlatformLoginService } from './platform-login.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('platform-login')
export class PlatformLoginController {
  constructor(private readonly platformLoginService: PlatformLoginService) {}

  @Post('google')
  async google(
    @Body(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false }))
    body: CreateUserDto & { googleToken?: string },
  ) {
    return this.platformLoginService.google(body);
  }
}
