import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  name!: string;

  @IsEmail({}, { message: 'A valid email address is required' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsEnum(Role, { message: 'Invalid role specified' })
  @IsOptional()
  role?: Role;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsOptional()
  newPassword?: string;
}

export class UpdateUserStatusDto {
  @IsBoolean()
  isActive!: boolean;
}

export class UpdateUserRoleDto {
  @IsEnum(Role, { message: 'Invalid role specified' })
  role!: Role;
}

export class ActivityQueryDto {
  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  action?: string;
}

export class ProcessLogsQueryDto {
  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}
