import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GptService } from './gpt/gpt.service';
import { ChatController } from './gpt/chat.controller';

@Module({
  imports: [],
  controllers: [AppController, ChatController],
  providers: [AppService, GptService],
})
export class AppModule {}
