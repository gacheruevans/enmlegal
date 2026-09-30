import { Body, Controller, Get, Patch, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorators';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { PublicResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Get('captcha')
  getCaptcha() {
    return this.authService.generateCaptcha();
  }

  @Public()
  @Post('reset-password')
  publicResetPassword(@Body() dto: PublicResetPasswordDto) {
    return this.authService.publicResetPassword(dto);
  }

  @Public()
  @Post('google')
  loginWithGoogle(@Body() dto: GoogleLoginDto) {
    return this.authService.loginWithGoogle(dto);
  }

  @Get('me')
  getProfile(@Req() req: Request & { user: { sub?: string; id?: string } }) {
    const userId = req.user?.sub || req.user?.id;
    return this.authService.getProfile(userId as string);
  }

  @Patch('profile')
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const userId = req.user?.id || req.user?.sub;
    return this.authService.updateProfile(userId, dto);
  }
}


