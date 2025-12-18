import { Module } from '@nestjs/common';
import { PlatformLoginService } from './platform-login.service';
import { PlatformLoginController } from './platform-login.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [PlatformLoginController],
  providers: [PlatformLoginService],
})
export class PlatformLoginModule {}
