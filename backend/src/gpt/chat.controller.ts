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
    const { message } = body;
    if (typeof message !== 'string') {
      throw new Error('Message must be a string');
    }
    const reply = await this.gptService.chatWithGPT(message);
    return { reply };
  }
}
