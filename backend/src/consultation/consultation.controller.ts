import { Body, Controller, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BookConsultationDto } from './consultation.dto';
import { ConsultationService } from './consultation.service';

@Controller('consultations')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Post('book')
  async book(@Body() body: any) {
    // Manual validation (alternatively use ValidationPipe globally)
    const dto = plainToInstance(BookConsultationDto, body);
    const errors = await validate(dto);
    if (errors.length) {
      return { message: 'Validation failed', errors: errors.map(e => e.toString()) };
    }
    const result = await this.consultationService.book(dto);
    return result;
  }
}
