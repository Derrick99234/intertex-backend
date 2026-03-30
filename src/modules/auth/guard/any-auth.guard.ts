import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AnyAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    const token = authorization && authorization.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const secrets = [
      {
        secret: this.configService.get<string>('jwt.secret'),
        type: 'user',
      },
      {
        secret: this.configService.get<string>('jwt.adminSecret'),
        type: 'admin',
      },
    ];

    for (const option of secrets) {
      if (!option.secret) {
        continue;
      }

      try {
        const tokenPayload = await this.jwtService.verifyAsync(token, {
          secret: option.secret,
        });

        request.user = {
          userId: tokenPayload.sub,
          role: tokenPayload.role,
          tokenType: option.type,
        };
        return true;
      } catch {
        continue;
      }
    }

    throw new UnauthorizedException('Invalid token');
  }
}
