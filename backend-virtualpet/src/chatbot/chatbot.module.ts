import { Module } from '@nestjs/common';
import { OrderModule } from '../order/order.module';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { GeminiLlmClient } from './llm/gemini-llm-client';
import { LLM_CLIENT } from './llm/llm-client.interface';
import { ToolExecutor } from './tools/tool-executor';
import { ToolRegistry } from './tools/tool-registry';

@Module({
  imports: [OrderModule],
  controllers: [ChatbotController],
  providers: [
    ChatbotService,
    ToolRegistry,
    ToolExecutor,
    { provide: LLM_CLIENT, useClass: GeminiLlmClient },
  ],
})
export class ChatbotModule {}
