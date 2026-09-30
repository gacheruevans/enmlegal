import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorators';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminService } from '../../admin/admin.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private prisma: PrismaService,
    @Optional() private adminService?: AdminService,
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

      // Verify that user exists in database and remains active
      if (payload.sub && typeof payload.sub === 'string') {
        const dbUser = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, name: true, email: true, role: true, isActive: true, lastActiveAt: true },
        });

        if (!dbUser || !dbUser.isActive) {
          throw new UnauthorizedException('User account is inactive or revoked');
        }

        request.user = {
          ...payload,
          ...dbUser,
        };

        // Touch active session in memory and keep lastActiveAt fresh
        if (this.adminService) {
          const rawIp =
            (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
            request.socket?.remoteAddress ||
            request.ip;
          const userAgent = (request.headers['user-agent'] as string) || undefined;

          this.adminService.touchSession({
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role as any,
            ipAddress: rawIp || undefined,
            userAgent,
          });

          // Throttle database update to at most once per 60 seconds
          const now = Date.now();
          if (!dbUser.lastActiveAt || now - dbUser.lastActiveAt.getTime() > 60000) {
            this.prisma.user
              .update({
                where: { id: dbUser.id },
                data: { lastActiveAt: new Date() },
              })
              .catch(() => {});
          }
        }
      } else {
        request.user = payload;
      }
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired token');
    }
    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      return token;
    }

    // Support extracting from session cookie if configured
    const sessionCookieName =
      process.env.SESSION_COOKIE ||
      'session';

    const cookies = (request as any).cookies;
    if (cookies && cookies[sessionCookieName]) {
      return cookies[sessionCookieName];
    }

    return undefined;
  }
}
