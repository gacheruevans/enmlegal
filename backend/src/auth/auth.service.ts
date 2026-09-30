import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    const googleClientId =
      process.env.GOOGLE_CLIENT_ID ||
      '1041339102270-e1fpe2b6v6u1didfndh7jkjmpcashs4f.apps.googleusercontent.com';
    this.googleClient = new OAuth2Client(googleClientId);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      await this.prisma.activityLog
        .create({
          data: {
            userEmail: dto.email,
            action: 'LOGIN_FAILED',
            details: 'Failed login attempt: incorrect password',
          },
        })
        .catch(() => {});
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Update login timestamps & audit log
    await this.prisma.user
      .update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          lastActiveAt: new Date(),
        },
      })
      .catch(() => {});

    await this.prisma.activityLog
      .create({
        data: {
          userId: user.id,
          userEmail: user.email,
          action: 'USER_LOGIN',
          details: `User ${user.name} logged in successfully`,
        },
      })
      .catch(() => {});

    return {
      token,
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        imageUrl: user.imageUrl,
      },
    };
  }

  async loginWithGoogle(dto: GoogleLoginDto) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token: email missing');
      }

      const email = payload.email.toLowerCase().trim();
      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Enforce explicit authorization for administrative access
        const authorizedAdmins = (process.env.ADMIN_EMAILS || 'eva.nduta@enmlegal.com,admin@enmlegal.com')
          .split(',')
          .map((e) => e.trim().toLowerCase());

        if (!authorizedAdmins.includes(email)) {
          this.logger.warn(`Unauthorized Google login attempt: ${email}`);
          throw new UnauthorizedException(
            'Your email is not authorized for administrative access. Please contact ENM Legal administration.',
          );
        }

        const randomPassword = await bcrypt.hash(uuidv4(), 12);
        user = await this.prisma.user.create({
          data: {
            email,
            name: payload.name || email.split('@')[0],
            imageUrl: payload.picture || null,
            password: randomPassword,
            role: 'ADMIN',
            isActive: true,
          },
        });
        this.logger.log(`Created authorized admin user via Google login: ${user.email}`);
      } else if (!user.isActive) {
        throw new UnauthorizedException('User account has been deactivated');
      }

      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        accessToken: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          imageUrl: user.imageUrl,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Google authentication error: ${msg}`);
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        imageUrl: true,
        createdAt: true,
      },
    });
  }
}
