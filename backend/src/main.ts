/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

function createValidationPipe() {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
}

function configureSwagger(app: NestExpressApplication) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle('ENM LEGAL API')
    .setDescription('API documentation for ENM LEGAL')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  Logger.log(
    `Swagger documentation: http://localhost:${process.env.PORT ?? 3000}/api/docs`,
  );
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(createValidationPipe());
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  configureSwagger(app);

  await app.listen(process.env.PORT ?? 3000);

  Logger.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
}
void bootstrap();
