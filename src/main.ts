import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as moment from 'moment-timezone';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true,
      // forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors();
  moment().tz('America/Bogota').format();
  moment.tz.setDefault('America/Bogota');
  await app.listen(3100);
}
bootstrap();
