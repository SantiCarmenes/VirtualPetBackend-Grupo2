import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import type {
  ILlmClient,
  InternalMessage,
  InternalToolCall,
  LlmResponse,
  LlmTool,
} from './llm-client.interface';

// ─── OpenRouter / OpenAI-compatible API types ────────────────────────────────

interface ORMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: ORToolCall[];
  tool_call_id?: string;
}

interface ORToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

interface ORRequest {
  model?: string;
  models?: string[];
  messages: ORMessage[];
  tools?: ORToolDefinition[];
  tool_choice?: 'auto' | 'none';
  max_tokens?: number;
}

interface ORToolDefinition {
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

interface ORResponse {
  choices?: Array<{
    message: {
      role: string;
      content: string | null;
      tool_calls?: ORToolCall[];
    };
    finish_reason: string;
  }>;
  error?: { message: string; type?: string };
}

// ─── Client ─────────────────────────────────────────────────────────────────

@Injectable()
export class OpenRouterLlmClient implements ILlmClient {
  private readonly logger  = new Logger(OpenRouterLlmClient.name);
  private readonly apiKey: string;
  private readonly model:  string;
  private readonly baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  private readonly modelFallback: string;
  // Optional headers recommended by OpenRouter for attribution/ranking
  private readonly siteUrl: string;
  private readonly appName: string;

  constructor() {
    this.apiKey        = process.env.LLM_API_KEY        ?? '';
    this.model         = process.env.LLM_MODEL          ?? 'meta-llama/llama-3.3-70b-instruct';
    this.modelFallback = process.env.LLM_MODEL_FALLBACK ?? '';
    this.siteUrl       = process.env.OR_SITE_URL        ?? '';
    this.appName       = process.env.OR_APP_NAME        ?? 'VirtualPet';

    if (!this.apiKey) {
      this.logger.warn('LLM_API_KEY is not set — chatbot LLM calls will fail');
    }
  }

  async chat(
    systemPrompt: string,
    messages: InternalMessage[],
    tools: LlmTool[],
  ): Promise<LlmResponse> {
    const orMessages: ORMessage[] = [
      { role: 'system', content: systemPrompt },
      ...this.toORMessages(messages),
    ];

    const body: ORRequest = {
      ...(this.modelFallback
        ? { models: [this.model, this.modelFallback] }
        : { model:   this.model }),
      messages:   orMessages,
      max_tokens: 1024,
    };

    if (tools.length) {
      body.tools       = this.toORTools(tools);
      body.tool_choice = 'auto';
    }

    const headers: Record<string, string> = {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
    if (this.siteUrl) headers['HTTP-Referer'] = this.siteUrl;
    if (this.appName) headers['X-Title']      = this.appName;

    let raw: Response;
    try {
      raw = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body:   JSON.stringify(body),
      });
    } catch (err) {
      this.logger.error('Network error calling OpenRouter', err);
      throw new InternalServerErrorException('Error al conectar con el servicio de IA');
    }

    const data = (await raw.json()) as ORResponse;

    if (!raw.ok || data.error) {
      if (raw.status === 429) {
        this.logger.warn('OpenRouter rate limit hit (429)');
        return {
          textContent: 'Estoy un poco ocupado en este momento 🐾 Esperá unos segundos y volvé a escribirme.',
          toolCalls:   [],
          stopReason:  'end_turn',
        };
      }
      this.logger.error('OpenRouter API error', { status: raw.status, error: data.error });
      throw new InternalServerErrorException('El servicio de IA no está disponible en este momento');
    }

    const choice = data.choices?.[0];
    if (!choice) {
      return { textContent: '', toolCalls: [], stopReason: 'error' };
    }

    const { message } = choice;

    if (message.tool_calls?.length) {
      const toolCalls: InternalToolCall[] = message.tool_calls.map(tc => ({
        id:    tc.id,
        name:  tc.function.name,
        input: this.parseArgs(tc.function.arguments),
      }));
      return { textContent: '', toolCalls, stopReason: 'tool_use' };
    }

    // Fallback: some models (e.g. Llama variants) output tool calls as text
    const textContent = message.content ?? '';
    const textCalls   = this.parseTextFunctionCalls(textContent);
    if (textCalls.length) {
      return { textContent: '', toolCalls: textCalls, stopReason: 'tool_use' };
    }

    return { textContent, toolCalls: [], stopReason: 'end_turn' };
  }

  // ─── Conversion helpers ──────────────────────────────────────────────────

  private toORMessages(messages: InternalMessage[]): ORMessage[] {
    return messages.map(msg => {
      if (msg.role === 'user') {
        return { role: 'user' as const, content: msg.content };
      }

      if (msg.role === 'assistant') {
        const out: ORMessage = { role: 'assistant', content: msg.content || null };
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

  private toORTools(tools: LlmTool[]): ORToolDefinition[] {
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

  private parseTextFunctionCalls(text: string): InternalToolCall[] {
    const pattern = /<function=(\w+)>(.*?)<\/function>/gs;
    const calls: InternalToolCall[] = [];
    let match: RegExpExecArray | null;
    let idx = 0;

    while ((match = pattern.exec(text)) !== null) {
      const argsRaw = match[2].trim();
      calls.push({
        id:    `call-text-${Date.now()}-${idx++}`,
        name:  match[1],
        input: argsRaw ? this.parseArgs(argsRaw) : {},
      });
    }

    return calls;
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
