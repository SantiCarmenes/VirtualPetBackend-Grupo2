export const LLM_CLIENT = 'LLM_CLIENT';

/** Standard message passed to and from the LLM, agnostic of provider format. */
export interface InternalMessage {
  role: 'user' | 'assistant' | 'tool_result';
  /** Plain text for user/assistant turns; JSON-stringified for tool_result turns. */
  content: string;
  /** Present only on tool_result turns */
  toolCallId?: string;
  /** Present only on tool_result turns — the function name (required by Gemini) */
  toolName?: string;
  /** Present only on assistant turns that triggered tool calls */
  toolCalls?: InternalToolCall[];
}

export interface InternalToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  /** Provider-specific extras (e.g. Gemini thought_signature). Ignored by other providers. */
  metadata?: Record<string, unknown>;
}

export interface LlmTool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface LlmResponse {
  /** Extracted plain text from the response (empty string when stop was tool_use) */
  textContent: string;
  /** Tool calls requested by the model (empty array when stop was end_turn) */
  toolCalls: InternalToolCall[];
  stopReason: 'end_turn' | 'tool_use' | 'error';
}

export interface ILlmClient {
  chat(
    systemPrompt: string,
    messages: InternalMessage[],
    tools: LlmTool[],
  ): Promise<LlmResponse>;
}
