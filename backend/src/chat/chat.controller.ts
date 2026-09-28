import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';
import { Public } from '../auth/decorators/public.decorators';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Public()
  @Post()
  async chat(@Body() dto: ChatDto) {
    return this.chatService.generateReply(dto);
  }
}
