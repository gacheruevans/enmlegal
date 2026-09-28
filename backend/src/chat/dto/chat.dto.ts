import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageItemDto {
  @IsString()
  @IsIn(['user', 'assistant', 'system'])
  role!: 'user' | 'assistant' | 'system';

  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageItemDto)
  history?: ChatMessageItemDto[];
}
