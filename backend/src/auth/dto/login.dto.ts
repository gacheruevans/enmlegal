import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @IsString()
  @IsOptional()
  captchaToken?: string;

  @IsString()
  @IsOptional()
  captchaAnswer?: string;

  @IsString()
  @IsOptional()
  honeypot?: string;
}
