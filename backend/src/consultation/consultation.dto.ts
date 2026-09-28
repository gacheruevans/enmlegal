import {
  IsEmail,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class BookConsultationDto {
  @IsEmail()
  applicantEmail!: string;

  @IsString()
  @IsOptional()
  applicantName?: string;

  @IsString()
  @IsOptional()
  applicantPhone?: string;

  @IsISO8601()
  start!: string;

  @IsISO8601()
  @IsOptional()
  end?: string;

  @IsNumber()
  @Min(15)
  @IsOptional()
  durationMinutes?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateConsultationStatusDto {
  @IsString()
  status!: string; // PENDING, CONFIRMED, CANCELLED, COMPLETED

  @IsString()
  @IsOptional()
  notes?: string;
}

