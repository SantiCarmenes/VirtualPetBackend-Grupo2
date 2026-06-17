import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ChatbotService } from './chatbot.service';
import { ChatDto } from './dto/chat.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Public()
  @Post('message')
  @HttpCode(HttpStatus.OK)
  async sendMessage(
    @CurrentUser() user: User | undefined,
    @Body() dto: ChatDto,
  ): Promise<{ reply: string }> {
    const reply = await this.chatbotService.processMessage(dto.messages, user?.id);
    return { reply };
  }
}
