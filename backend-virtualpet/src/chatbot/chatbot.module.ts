import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { OrderModule } from '../order/order.module';
import { ShippingModule } from '../shipping/shipping.module';
import { ChatbotConfigService } from './chatbot-config.service';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { GeminiLlmClient } from './llm/gemini-llm-client';
import { GroqLlmClient } from './llm/groq-llm-client';
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
    {
      provide:    LLM_CLIENT,
      useFactory: () => {
        const registry = {
          gemini: GeminiLlmClient,
          groq:   GroqLlmClient,
        };
        const name = process.env.LLM_PROVIDER?.toLowerCase();
        if (!name) {
          throw new Error('LLM_PROVIDER env var is required. Available: ' + Object.keys(registry).join(', '));
        }
        const Ctor = registry[name];
        if (!Ctor) {
          throw new Error(`Unknown LLM_PROVIDER: "${name}". Available: ${Object.keys(registry).join(', ')}`);
        }
        return new Ctor();
      },
    },
  ],
})
export class ChatbotModule {}
