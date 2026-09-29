import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorators';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: Record<string, unknown> }>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Access token missing');
    }
    try {
      const secret =
        this.configService.get<string>('JWT_SECRET') ||
        this.configService.get<string>('SESSION_KEY') ||
        process.env.JWT_SECRET ||
        process.env.SESSION_KEY;

      if (!secret) {
        throw new UnauthorizedException('JWT_SECRET or SESSION_KEY is not configured in .env');
      }

      const payload = await this.jwtService.verifyAsync<
        Record<string, unknown>
      >(token, {
        secret,
      });
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      return token;
    }

    // Support extracting from session cookie if configured
    const sessionCookieName =
      this.configService.get<string>('SESSION_COOKIE') ||
      process.env.SESSION_COOKIE ||
      'session';

    const cookies = (request as any).cookies;
    if (cookies && cookies[sessionCookieName]) {
      return cookies[sessionCookieName];
    }

    return undefined;
  }
}
