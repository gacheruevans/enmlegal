import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED'])
  status?: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;
}

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED'])
  status?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;
}
