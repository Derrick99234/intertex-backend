import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from 'src/schemas/user.schema';
import * as bcrypt from 'bcryptjs';

type AuthInput = {
  email: string;
  password: string;
};

type SignInPayload = {
  userId: string;
  username: string;
};

type AuthResult = {
  accessToken: string;
  username: string;
  userId: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  async authenticate(input: AuthInput): Promise<AuthResult> {
    const user = await this.validateUser(input);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.signIn(user);
  }

  private async validateUser(input: AuthInput): Promise<SignInPayload | null> {
    const user = await this.userService.findByEmail(input.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatch = await bcrypt.compare(input.password, user.password);
    if (!passwordMatch) {
      return null;
    }

    return {
      userId: user._id.toString(),
      username: user.firstName, // Or use email if no username
    };
  }

  private async signIn(user: SignInPayload): Promise<AuthResult> {
    const payload = {
      sub: user.userId,
      username: user.username,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      userId: user.userId,
      username: user.username,
    };
  }
}
