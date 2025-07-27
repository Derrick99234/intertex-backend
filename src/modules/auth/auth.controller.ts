import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.createUser(createUserDto);
    return {
      message: 'User registered successfully',
      user,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const result = await this.authService.authenticate(body);
    return {
      message: 'Login successful',
      ...result,
    };
  }
}
