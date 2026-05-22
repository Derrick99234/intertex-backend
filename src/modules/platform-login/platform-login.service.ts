import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';

@Injectable()
export class PlatformLoginService {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async google(createUserDto: CreateUserDto & { googleToken?: string }) {
    if (!createUserDto.googleToken) {
      throw new UnauthorizedException('Google ID token is required');
    }

    try {
      const res = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${createUserDto.googleToken}`,
      );
      if (!res.ok) {
        throw new UnauthorizedException('Invalid Google token');
      }
      const payload = await res.json();
      if (payload.email !== createUserDto.email) {
        throw new UnauthorizedException('Token email does not match request email');
      }
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Failed to verify Google token');
    }

    const user = await this.userService.findByEmail(createUserDto.email);

    if (user) {
      return await this.authService.signIn({
        userId: user._id.toString(),
      });
    } else {
      await this.authService.createUser(createUserDto);
      const newUser = await this.userService.findByEmail(createUserDto.email);
      return await this.authService.signIn({
        userId: newUser._id.toString(),
      });
    }
  }
}
