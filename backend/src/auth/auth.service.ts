import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      // Check if user exists, otherwise create them
      let user = await this.prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            imageUrl: payload.picture,
            role: 'Author',
          },
        });
      }

      // Generate local JWT token
      const jwtToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return {
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          imageUrl: user.imageUrl,
          role: user.role,
        },
      };
    } catch (error: any) {
      throw new UnauthorizedException(`Google auth failed: ${error.message}`);
    }
  }
}
