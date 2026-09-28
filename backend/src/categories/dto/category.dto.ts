import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  title!: string;
}

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  title?: string;
}
