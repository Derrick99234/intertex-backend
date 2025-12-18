import { Body, Controller, Post } from '@nestjs/common';
import { PlatformLoginService } from './platform-login.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('platform-login')
export class PlatformLoginController {
  constructor(private readonly platformLoginService: PlatformLoginService) {}

  @Post('google')
  async google(@Body() createUserDto: CreateUserDto) {
    return this.platformLoginService.google(createUserDto);
  }
}
