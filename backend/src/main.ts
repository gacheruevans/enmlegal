/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import helmet from 'helmet';
import * as express from 'express';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { tmpdir } from 'os';


let cachedApp: NestExpressApplication;

export async function bootstrapApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Production security assertions (evaluated after ConfigModule loads .env)
  const configService = app.get(ConfigService);
  const jwtSecret = configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.includes('change-in-production') || jwtSecret.length < 32) {
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      throw new Error(
        'SECURITY CRITICAL: JWT_SECRET must be configured with a high-entropy secret (at least 32 chars) in production.',
      );
    } else {
      console.warn(
        '⚠️ WARNING: JWT_SECRET is not configured or is under 32 characters. Please set JWT_SECRET in environment variables.',
      );
    }
  }

  // Security HTTP headers
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xContentTypeOptions: true,
      frameguard: { action: 'sameorigin' },
      dnsPrefetchControl: { allow: false },
    }),
  );

  // Payload body size limits — safeguard against buffer exhaustion / Memory DoS
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // Global prefix — exclude root so GET / serves the health check
  app.setGlobalPrefix('api/v1', {
    exclude: ['/'],
  });

  // CORS — allow Next.js frontend (production, preview deployments, local dev)
  const allowedOrigins = [
    'http://localhost:5174',
    'http://localhost:5173',
    'https://enmlegal-9jm9.vercel.app',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('vercel.app')) {
        callback(null, true);
      }
      else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Global Validation pipe with strict sanitization and whitelist
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  // Swagger / OpenAPI docs
  const config = new DocumentBuilder()
    .setTitle('ENM LEGAL API')
    .setDescription('API documentation for ENM LEGAL')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const uploadsPath = process.env.VERCEL ? tmpdir() : join(process.cwd(), 'uploads');
  if (fs.existsSync(uploadsPath)) {
    app.useStaticAssets(uploadsPath, {
      prefix: '/uploads/',
    });
  }

  await app.init();
  return app;
}

// Handler for Vercel Serverless Functions
let cachedServer: any;
export default async function (req: any, res: any) {
  try {
    if (!cachedApp) {
      cachedApp = await bootstrapApp();
      await cachedApp.init();
      cachedServer = cachedApp.getHttpAdapter().getInstance();
    }
    return cachedServer(req, res);
  } catch (err: any) {
    console.error('⚠️ Vercel serverless handler bootstrap error:', err);
    if (res && typeof res.status === 'function') {
      return res.status(500).json({
        statusCode: 500,
        message: 'Internal server error occurred during application bootstrap',
      });
    }
    throw err;
  }
}

// Standalone listener for local development and Vercel zero-config framework runner
export async function bootstrap() {
  const app = await bootstrapApp();
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  Logger.log(`ENMLegal API is running on: http://localhost:${port}`);
  Logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
  return app;
}

bootstrap().catch((err) => {
  Logger.error('Failed to start NestJS application:', err);
});