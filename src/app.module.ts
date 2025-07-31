import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envConfig } from './configs/env.config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './modules/admin/admin.module';
import { CategoryModule } from './modules/category/category.module';
import { SubcategoryModule } from './modules/subcategory/subcategory.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('db.uri'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [envConfig],
    }),
    AuthModule,
    UserModule,
    AdminModule,
    CategoryModule,
    SubcategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
