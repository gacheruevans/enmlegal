import { Global, Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { LogBufferService } from './log-buffer.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [AdminService, LogBufferService],
  exports: [AdminService, LogBufferService],
})
export class AdminModule {}
