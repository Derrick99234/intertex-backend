import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guard/auth.guard';
import { AdminAuthGuard } from './guard/admin.guard';
import { AnyAuthGuard } from './guard/any-auth.guard';

@Global()
@Module({
  imports: [UserModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, AdminAuthGuard, AnyAuthGuard],
  exports: [
    AuthService,
    AuthGuard,
    AdminAuthGuard,
    AnyAuthGuard,
    JwtModule,
  ],
})
export class AuthModule {}
