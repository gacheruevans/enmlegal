import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum ContentAction {
  SAVE_DRAFT = 'SAVE_DRAFT',
  PUBLISH = 'PUBLISH',
}

export class ContentCardDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty({ message: 'Card title is required' })
  title!: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsOptional()
  subtext?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class UpdateContentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsOptional()
  subtext?: string;

  @IsArray()
  @IsOptional()
  cards?: ContentCardDto[];

  @IsString()
  @IsOptional()
  addressDetails?: string;

  @IsEnum(ContentAction, {
    message: 'Action must be either SAVE_DRAFT or PUBLISH',
  })
  @IsOptional()
  action?: ContentAction;
}
