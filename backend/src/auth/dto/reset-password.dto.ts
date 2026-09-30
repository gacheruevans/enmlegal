import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class PublicResetPasswordDto {
  @IsEmail({}, { message: 'Please provide a valid registered email address' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  newPassword!: string;

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
