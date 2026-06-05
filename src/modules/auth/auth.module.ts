import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guard/auth.guard';
import { AdminAuthGuard } from './guard/admin.guard';
import { AnyAuthGuard } from './guard/any-auth.guard';
import { EmailService } from '../../common/utils/email.service';

@Global()
@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, AdminAuthGuard, AnyAuthGuard, EmailService],
  exports: [
    AuthService,
    AuthGuard,
    AdminAuthGuard,
    AnyAuthGuard,
    JwtModule,
  ],
})
export class AuthModule {}
