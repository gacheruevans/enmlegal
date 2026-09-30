import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30, { message: 'Phone number cannot exceed 30 characters' })
  phone?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  currentPassword?: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  newPassword?: string;
}
