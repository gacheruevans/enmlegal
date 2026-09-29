import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookConsultationDto, UpdateConsultationStatusDto } from './consultation.dto';
import {
  ConsultationService,
  CreateConsultationResult,
} from './consultation.service';
import { Public } from '../auth/decorators/public.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('consultations')
@Controller('consultations')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Public()
  @Post('book')
  async book(@Body() dto: BookConsultationDto): Promise<CreateConsultationResult> {
    return this.consultationService.book(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.consultationService.findAll({ page, limit, status });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async findOne(@Param('id') id: string) {
    return this.consultationService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateConsultationStatusDto,
  ) {
    return this.consultationService.updateStatus(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async remove(@Param('id') id: string) {
    return this.consultationService.remove(id);
  }
}

