import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';

@Injectable()
export class PlatformLoginService {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async google(createUserDto: CreateUserDto) {
    const user = await this.userService.findByEmail(createUserDto.email);

    if (user) {
      return await this.authService.signIn({
        userId: user._id.toString(),
      });
    } else {
      await this.authService.createUser(createUserDto);
      const user = await this.userService.findByEmail(createUserDto.email);
      return await this.authService.signIn({
        userId: user._id.toString(),
      });
    }
  }
}
