import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { OrderModule } from '../order/order.module';
import { ShippingModule } from '../shipping/shipping.module';
import { ChatbotConfigService } from './chatbot-config.service';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { GeminiLlmClient } from './llm/gemini-llm-client';
import { LLM_CLIENT } from './llm/llm-client.interface';
import { ToolExecutor } from './tools/tool-executor';
import { ToolRegistry } from './tools/tool-registry';

@Module({
  imports: [OrderModule, CatalogModule, ShippingModule],
  controllers: [ChatbotController],
  providers: [
    ChatbotConfigService,
    ChatbotService,
    ToolRegistry,
    ToolExecutor,
    { provide: LLM_CLIENT, useClass: GeminiLlmClient },
  ],
})
export class ChatbotModule {}
