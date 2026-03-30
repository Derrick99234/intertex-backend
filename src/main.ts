import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MongooseExceptionFilter } from './common/decorators/mongoose-exception.decorator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
      : true,
    credentials: true,
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

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
