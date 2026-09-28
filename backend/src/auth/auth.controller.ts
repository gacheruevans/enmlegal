import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorators';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
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
  @Post('google')
  loginWithGoogle(@Body() dto: GoogleLoginDto) {
    return this.authService.loginWithGoogle(dto);
  }

  @Get('me')
  getProfile(@Req() req: Request & { user: { sub: string } }) {
    return this.authService.getProfile(req.user.sub);
  }
}

