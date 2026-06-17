import { Inject, Injectable, Logger } from '@nestjs/common';
import { ChatbotConfigService } from './chatbot-config.service';
import { MAX_AGENT_ITERATIONS, MAX_CONTEXT_MESSAGES } from './chatbot.constants';
import { LLM_CLIENT } from './llm/llm-client.interface';
import type { ILlmClient, InternalMessage } from './llm/llm-client.interface';
import { ToolRegistry } from './tools/tool-registry';
import { ToolExecutor } from './tools/tool-executor';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    @Inject(LLM_CLIENT) private readonly llmClient: ILlmClient,
    private readonly toolRegistry:    ToolRegistry,
    private readonly toolExecutor:    ToolExecutor,
    private readonly configService:   ChatbotConfigService,
  ) {}

  async processMessage(
    userMessages: Array<{ role: 'user' | 'assistant'; content: string }>,
    userId: string | undefined,
  ): Promise<string> {
    const tools        = this.toolRegistry.getTools();
    const systemPrompt = await this.configService.getSystemPrompt();

    const windowed = userMessages.slice(-MAX_CONTEXT_MESSAGES);

    let messages: InternalMessage[] = windowed.map(m => ({
      role:    m.role,
      content: m.content,
    }));

    for (let i = 0; i < MAX_AGENT_ITERATIONS; i++) {
      const response = await this.llmClient.chat(systemPrompt, messages, tools);

      if (response.stopReason === 'error') {
        return 'Lo siento, hubo un problema al procesar tu consulta. Intentá de nuevo en unos momentos.';
      }

      if (response.stopReason === 'end_turn') {
        return response.textContent;
      }

      // tool_use — execute each tool call and add results to conversation
      const assistantMsg: InternalMessage = {
        role:      'assistant',
        content:   response.textContent,
        toolCalls: response.toolCalls,
      };
      messages = [...messages, assistantMsg];

      for (const toolCall of response.toolCalls) {
        this.logger.debug(`Executing tool: ${toolCall.name}`, toolCall.input);
        const result = await this.toolExecutor.execute(toolCall, userId);
        messages.push({
          role:       'tool_result',
          content:    result,
          toolCallId: toolCall.id,
          toolName:   toolCall.name,
        });
      }
    }

    return 'No pude resolver tu consulta en el número de pasos permitidos. Por favor intentá reformular tu pregunta.';
  }
}
