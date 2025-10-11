import { IsEmail, IsISO8601, IsOptional, IsString } from 'class-validator';

export class BookConsultationDto {
  @IsEmail()
  applicantEmail!: string;

  // Name of the person booking
  @IsString()
  @IsOptional()
  applicantName?: string;

  // RFC3339 timestamp string for start time
  @IsISO8601()
  start!: string;

  // Optional explicit end; if omitted backend will add 30m.
  @IsISO8601()
  @IsOptional()
  end?: string;
}
