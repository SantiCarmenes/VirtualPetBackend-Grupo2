import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import type {
  ILlmClient,
  InternalMessage,
  InternalToolCall,
  LlmResponse,
  LlmTool,
} from './llm-client.interface';

// ─── Gemini REST API types (minimal subset) ─────────────────────────────────

interface GeminiPart {
  text?: string;
  thought?: boolean;
  functionCall?: { name: string; args: Record<string, unknown>; thought_signature?: string };
  functionResponse?: { name: string; response: { content: string } };
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

interface GeminiRequest {
  contents: GeminiContent[];
  system_instruction?: { parts: [{ text: string }] };
  tools?: [{ function_declarations: GeminiToolDeclaration[] }];
  generationConfig?: { maxOutputTokens: number };
}

interface GeminiToolDeclaration {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content: GeminiContent;
    finishReason?: string;
  }>;
  error?: { message: string };
}

// ─── Client ─────────────────────────────────────────────────────────────────

@Injectable()
export class GeminiLlmClient implements ILlmClient {
  private readonly logger = new Logger(GeminiLlmClient.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor() {
    this.apiKey = process.env.LLM_API_KEY ?? '';
    this.model  = process.env.LLM_MODEL ?? 'gemini-2.5-flash-lite';

    if (!this.apiKey) {
      this.logger.warn('LLM_API_KEY is not set — chatbot LLM calls will fail');
    }
  }

  async chat(
    systemPrompt: string,
    messages: InternalMessage[],
    tools: LlmTool[],
  ): Promise<LlmResponse> {
    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

    const body: GeminiRequest = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents:           this.toGeminiContents(messages),
      tools:              tools.length ? [{ function_declarations: this.toGeminiTools(tools) }] : undefined,
      generationConfig:   { maxOutputTokens: 1024 },
    };

    let raw: Response;
    try {
      raw = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
    } catch (err) {
      this.logger.error('Network error calling Gemini', err);
      throw new InternalServerErrorException('Error al conectar con el servicio de IA');
    }

    const data = (await raw.json()) as GeminiResponse;

    if (!raw.ok || data.error) {
      const apiStatus = (data.error as any)?.status ?? '';
      if (raw.status === 429 || apiStatus === 'RESOURCE_EXHAUSTED') {
        this.logger.warn('Gemini quota exhausted (429 RESOURCE_EXHAUSTED)');
        return {
          textContent: 'Estoy un poco ocupado en este momento 🐾 Esperá unos segundos y volvé a escribirme.',
          toolCalls:   [],
          stopReason:  'end_turn',
        };
      }
      this.logger.error('Gemini API error', { status: apiStatus || raw.status, body: data.error });
      throw new InternalServerErrorException('El servicio de IA no está disponible en este momento');
    }

    const candidate = data.candidates?.[0];
    if (!candidate) {
      return { textContent: '', toolCalls: [], stopReason: 'error' };
    }

    const parts = candidate.content.parts ?? [];

    const textContent = parts
      .filter(p => typeof p.text === 'string' && !p.thought)
      .map(p => p.text!)
      .join('');

    const toolCalls: InternalToolCall[] = parts
      .filter(p => p.functionCall)
      .map((p, i) => {
        const fc = p.functionCall!;
        const tc: InternalToolCall = {
          id:    `call-${Date.now()}-${i}`,
          name:  fc.name,
          input: fc.args ?? {},
        };
        if (fc.thought_signature) {
          tc.metadata = { thoughtSignature: fc.thought_signature };
        }
        return tc;
      });

    const stopReason = toolCalls.length > 0 ? 'tool_use' : 'end_turn';

    return { textContent, toolCalls, stopReason };
  }

  // ─── Conversion helpers ──────────────────────────────────────────────────

  private toGeminiContents(messages: InternalMessage[]): GeminiContent[] {
    const result: GeminiContent[] = [];
    let i = 0;

    while (i < messages.length) {
      const msg = messages[i];

      if (msg.role === 'user') {
        result.push({ role: 'user', parts: [{ text: msg.content }] });
        i++;
        continue;
      }

      if (msg.role === 'assistant') {
        const parts: GeminiPart[] = [];
        if (msg.content) parts.push({ text: msg.content });
        if (msg.toolCalls?.length) {
          for (const tc of msg.toolCalls) {
            const fc: GeminiPart['functionCall'] = { name: tc.name, args: tc.input };
            if (tc.metadata?.thoughtSignature) {
              fc.thought_signature = tc.metadata.thoughtSignature as string;
            }
            parts.push({ functionCall: fc });
          }
        }
        result.push({ role: 'model', parts });
        i++;
        continue;
      }

      // tool_result — collect consecutive tool results into one user message
      if (msg.role === 'tool_result') {
        const fnParts: GeminiPart[] = [];
        while (i < messages.length && messages[i].role === 'tool_result') {
          const tr = messages[i];
          fnParts.push({
            functionResponse: {
              name:     tr.toolName ?? 'unknown_tool',
              response: { content: tr.content },
            },
          });
          i++;
        }
        result.push({ role: 'user', parts: fnParts });
        continue;
      }

      i++;
    }

    return result;
  }

  private toGeminiTools(tools: LlmTool[]): GeminiToolDeclaration[] {
    return tools.map(t => ({
      name:        t.name,
      description: t.description,
      parameters:  {
        type:       t.input_schema.type,
        properties: t.input_schema.properties,
        required:   t.input_schema.required,
      },
    }));
  }
}
