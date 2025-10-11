import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConsultationController } from './consultation/consultation.controller';
import { ConsultationService } from './consultation/consultation.service';
import { ChatController } from './gpt/chat.controller';
import { GptService } from './gpt/gpt.service';

@Module({
  imports: [],
  controllers: [AppController, ChatController, ConsultationController],
  providers: [AppService, GptService, ConsultationService],
})
export class AppModule {}
