import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

type AuthInput = {
  email: string;
  password: string;
};

type SignInPayload = {
  userId: string;
};

type AuthResult = {
  accessToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

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
    };
  }

  async signIn(user: SignInPayload): Promise<AuthResult> {
    const payload = {
      sub: user.userId,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: '1d',
    });

    return {
      accessToken,
    };
  }
}
