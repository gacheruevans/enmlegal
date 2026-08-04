import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guards';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret =
          config.get<string>('JWT_SECRET') ||
          'enmlegal-blog-jwt-secret-key-2026!';
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is required');
        }
        const expiresInValue = config.get<string>('JWT_EXPIRES_IN') || '7d';
        const signOptions: JwtSignOptions = {
          expiresIn: expiresInValue as JwtSignOptions['expiresIn'],
        };
        return {
          secret,
          signOptions,
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
