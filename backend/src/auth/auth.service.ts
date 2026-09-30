import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { PublicResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';

import * as crypto from 'crypto';

export function normalizeAvatarUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string' || !url.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/${trimmed}`;
}

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

  /**
   * Generates a signed cryptographic CAPTCHA challenge
   */
  generateCaptcha() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const timestamp = Date.now();
    const secret = process.env.JWT_SECRET || 'enmlegal-captcha-secret';
    const hash = crypto
      .createHmac('sha256', secret)
      .update(`${code.toUpperCase()}:${timestamp}`)
      .digest('hex');

    return {
      token: `${timestamp}:${hash}`,
      code,
      expiresIn: 300,
    };
  }

  /**
   * Cryptographically verifies CAPTCHA token and answer
   */
  verifyCaptcha(token: string, answer: string): boolean {
    if (!token || !answer) return false;
    const parts = token.split(':');
    if (parts.length !== 2) return false;

    const timestamp = parseInt(parts[0], 10);
    const expectedHash = parts[1];

    if (Date.now() - timestamp > 300000) {
      return false; // Expired after 5 minutes
    }

    const secret = process.env.JWT_SECRET || 'enmlegal-captcha-secret';
    const computedHash = crypto
      .createHmac('sha256', secret)
      .update(`${answer.trim().toUpperCase()}:${timestamp}`)
      .digest('hex');

    return computedHash === expectedHash;
  }

  async login(dto: LoginDto) {
    // 1. Bot Honeypot Check: trap headless automated scripts
    if (dto.honeypot && dto.honeypot.trim().length > 0) {
      this.logger.warn(`Bot detected via honeypot trap: ${dto.email}`);
      await this.prisma.activityLog
        .create({
          data: {
            userEmail: dto.email,
            action: 'BOT_TRAP_TRIGGERED',
            details: 'Automated login blocked via hidden honeypot trap',
          },
        })
        .catch(() => {});
      throw new UnauthorizedException('Security validation failed');
    }

    // 2. Server-side CAPTCHA verification if token provided
    if (dto.captchaToken && dto.captchaAnswer) {
      const isCaptchaValid = this.verifyCaptcha(dto.captchaToken, dto.captchaAnswer);
      if (!isCaptchaValid) {
        throw new UnauthorizedException('Security verification failed. Please enter the correct CAPTCHA code.');
      }
    }
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
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

    if (!user.isActive) {
      await this.prisma.activityLog
        .create({
          data: {
            userId: user.id,
            userEmail: user.email,
            action: 'LOGIN_DEACTIVATED_ACCOUNT',
            details: 'Login attempted on deactivated user account',
          },
        })
        .catch(() => {});
      throw new UnauthorizedException(
        'Your account has been deactivated (e.g. following a password reset). Please contact an Administrator or Super Administrator for reactivation.',
      );
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
        phone: user.phone,
        role: user.role,
        imageUrl: normalizeAvatarUrl(user.imageUrl),
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
          phone: user.phone,
          role: user.role,
          imageUrl: normalizeAvatarUrl(user.imageUrl),
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Google authentication error: ${msg}`);
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
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

    if (!user) return null;

    return {
      ...user,
      imageUrl: normalizeAvatarUrl(user.imageUrl),
    };
  }

  /**
   * Update Profile Details (Strictly excludes email)
   * Any authenticated user can update their name, phone, imageUrl, and password.
   * Email is immutable to protect system identity and security compliance.
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User account not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    const dataToUpdate: {
      name?: string;
      phone?: string | null;
      imageUrl?: string | null;
      password?: string;
    } = {};
    const updatedFields: string[] = [];

    if (dto.name !== undefined && dto.name.trim().length > 0) {
      dataToUpdate.name = dto.name.trim();
      updatedFields.push('name');
    }

    if (dto.phone !== undefined) {
      dataToUpdate.phone = dto.phone.trim() || null;
      updatedFields.push('phone');
    }

    if (dto.imageUrl !== undefined) {
      dataToUpdate.imageUrl = normalizeAvatarUrl(dto.imageUrl);
      updatedFields.push('profile photo');
    }

    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Current password is required to change password');
      }
      const isCurrentValid = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isCurrentValid) {
        throw new BadRequestException('Current password does not match');
      }
      if (dto.newPassword.length < 6) {
        throw new BadRequestException('New password must be at least 6 characters long');
      }
      dataToUpdate.password = await bcrypt.hash(dto.newPassword, 12);
      updatedFields.push('password');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
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

    await this.prisma.activityLog
      .create({
        data: {
          userId: user.id,
          userEmail: user.email,
          action: 'USER_PROFILE_UPDATED',
          details: `User ${user.name} (${user.email}) updated profile details: ${
            updatedFields.length > 0 ? updatedFields.join(', ') : 'no changes'
          }`,
        },
      })
      .catch(() => {});

    return {
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        imageUrl: normalizeAvatarUrl(updatedUser.imageUrl),
      },
    };
  }


  /**
   * Public password reset request:
   * Resets the old password with the new one, and sets the user account to DEACTIVATED.
   * Only an Administrator or Super Administrator can subsequently reactivate the account.
   */
  async publicResetPassword(dto: PublicResetPasswordDto) {
    // 1. Bot Honeypot Check: trap headless automated scripts
    if (dto.honeypot && dto.honeypot.trim().length > 0) {
      this.logger.warn(`Bot detected on password reset honeypot: ${dto.email}`);
      throw new UnauthorizedException('Security validation failed');
    }

    // 2. Server-side CAPTCHA verification if token provided
    if (dto.captchaToken && dto.captchaAnswer) {
      const isCaptchaValid = this.verifyCaptcha(dto.captchaToken, dto.captchaAnswer);
      if (!isCaptchaValid) {
        throw new UnauthorizedException(
          'Security verification failed. Please enter the correct CAPTCHA code.',
        );
      }
    }

    const cleanEmail = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      this.logger.warn(`Password reset requested for unregistered email: ${cleanEmail}`);
      // Generic message to prevent user enumeration
      return {
        success: true,
        message:
          'If this email is registered in our portal, your password has been updated and the account has been placed in DEACTIVATED status pending Administrator review.',
        accountDeactivated: true,
      };
    }

    // 3. Hash new password with 12 salt rounds
    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    // 4. Update password and DEACTIVATE account
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isActive: false, // Account is deactivated as required!
      },
    });

    // 5. Audit record
    await this.prisma.activityLog
      .create({
        data: {
          userId: user.id,
          userEmail: user.email,
          action: 'PASSWORD_RESET_DEACTIVATED',
          details: `User ${user.name} reset their password via portal. Account set to DEACTIVATED pending Administrator reactivation.`,
        },
      })
      .catch(() => {});

    this.logger.log(
      `Password successfully reset for ${user.email}. Account DEACTIVATED pending Administrator/SuperAdmin reactivation.`,
    );

    return {
      success: true,
      message:
        'Your password has been successfully updated. In accordance with ENM Legal security policy, your account has been placed in DEACTIVATED status. An Administrator or Super Administrator must reactivate your account before you can log in.',
      accountDeactivated: true,
    };
  }
}
