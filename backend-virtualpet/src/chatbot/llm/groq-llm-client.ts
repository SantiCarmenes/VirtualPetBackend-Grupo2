import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import type {
  ILlmClient,
  InternalMessage,
  InternalToolCall,
  LlmResponse,
  LlmTool,
} from './llm-client.interface';

// ─── Groq / OpenAI-compatible API types ─────────────────────────────────────

interface GroqMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: GroqToolCall[];
  tool_call_id?: string;
}

interface GroqToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

interface GroqRequest {
  model: string;
  messages: GroqMessage[];
  tools?: GroqToolDefinition[];
  tool_choice?: 'auto' | 'none';
  max_tokens?: number;
}

interface GroqToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

interface GroqResponse {
  choices?: Array<{
    message: {
      role: string;
      content: string | null;
      tool_calls?: GroqToolCall[];
    };
    finish_reason: string;
  }>;
  error?: { message: string; type?: string };
}

// ─── Client ─────────────────────────────────────────────────────────────────

@Injectable()
export class GroqLlmClient implements ILlmClient {
  private readonly logger = new Logger(GroqLlmClient.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.LLM_API_KEY ?? '';
    this.model  = process.env.LLM_MODEL ?? 'llama-3.3-70b-versatile';

    if (!this.apiKey) {
      this.logger.warn('LLM_API_KEY is not set — chatbot LLM calls will fail');
    }
  }

  async chat(
    systemPrompt: string,
    messages: InternalMessage[],
    tools: LlmTool[],
  ): Promise<LlmResponse> {
    const groqMessages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      ...this.toGroqMessages(messages),
    ];

    const body: GroqRequest = {
      model:      this.model,
      messages:   groqMessages,
      max_tokens: 1024,
    };

    if (tools.length) {
      body.tools       = this.toGroqTools(tools);
      body.tool_choice = 'auto';
    }

    let raw: Response;
    try {
      raw = await fetch(this.baseUrl, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      this.logger.error('Network error calling Groq', err);
      throw new InternalServerErrorException('Error al conectar con el servicio de IA');
    }

    const data = (await raw.json()) as GroqResponse;

    if (!raw.ok || data.error) {
      if (raw.status === 429) {
        this.logger.warn('Groq rate limit hit (429)');
        return {
          textContent: 'Estoy un poco ocupado en este momento 🐾 Esperá unos segundos y volvé a escribirme.',
          toolCalls:   [],
          stopReason:  'end_turn',
        };
      }
      this.logger.error('Groq API error', { status: raw.status, error: data.error });
      throw new InternalServerErrorException('El servicio de IA no está disponible en este momento');
    }

    const choice = data.choices?.[0];
    if (!choice) {
      return { textContent: '', toolCalls: [], stopReason: 'error' };
    }

    const { message } = choice;

    // Check tool_calls by presence — some Llama models return finish_reason:'stop'
    // even when tool_calls are present. Content is discarded when tool calls exist
    // because Llama often mirrors the call syntax inside the text (e.g. <function=...>).
    if (message.tool_calls?.length) {
      const toolCalls: InternalToolCall[] = message.tool_calls.map(tc => ({
        id:    tc.id,
        name:  tc.function.name,
        input: this.parseArgs(tc.function.arguments),
      }));
      return { textContent: '', toolCalls, stopReason: 'tool_use' };
    }

    return {
      textContent: message.content ?? '',
      toolCalls:   [],
      stopReason:  'end_turn',
    };
  }

  // ─── Conversion helpers ──────────────────────────────────────────────────

  private toGroqMessages(messages: InternalMessage[]): GroqMessage[] {
    return messages.map(msg => {
      if (msg.role === 'user') {
        return { role: 'user' as const, content: msg.content };
      }

      if (msg.role === 'assistant') {
        const out: GroqMessage = { role: 'assistant', content: msg.content || null };
        if (msg.toolCalls?.length) {
          out.tool_calls = msg.toolCalls.map(tc => ({
            id:       tc.id,
            type:     'function' as const,
            function: { name: tc.name, arguments: JSON.stringify(tc.input) },
          }));
        }
        return out;
      }

      // tool_result
      return {
        role:         'tool' as const,
        content:      msg.content,
        tool_call_id: msg.toolCallId ?? '',
      };
    });
  }

  private toGroqTools(tools: LlmTool[]): GroqToolDefinition[] {
    return tools.map(t => ({
      type: 'function' as const,
      function: {
        name:        t.name,
        description: t.description,
        parameters:  {
          type:       t.input_schema.type,
          properties: t.input_schema.properties,
          required:   t.input_schema.required,
        },
      },
    }));
  }

  private parseArgs(raw: string): Record<string, unknown> {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      this.logger.warn('Failed to parse tool call arguments', raw);
      return {};
    }
  }
}
