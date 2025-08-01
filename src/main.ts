import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AdminService } from './modules/admin/admin.service';
import { UserService } from './modules/user/user.service';
import { MongooseExceptionFilter } from './common/decorators/mongoose-exception.decorator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new MongooseExceptionFilter());
  // const adminService = app.get(AdminService);
  // await adminService.createSuperAdmin();

  // const userService = app.get(UserService);
  // await userService.generateFakeUsers(100);

  await app.listen(process.env.PORT ?? 2025);
}
bootstrap();
