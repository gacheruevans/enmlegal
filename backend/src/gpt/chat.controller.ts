/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Post, Body } from '@nestjs/common';
import { GptService } from './gpt.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly gptService: GptService) {}
  @Post()
  async chat(
    @Body()
    body: {
      message: string;
      history?: { role: string; content: string }[];
    },
  ) {
    const { message, history = [] } = body;
    const reply = await this.gptService.chatWithGPT(message, history);
    return { reply };
  }
}
