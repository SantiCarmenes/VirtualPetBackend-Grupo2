/** Maximum LLM ↔ tool iterations per user message to prevent infinite loops. */
export const MAX_AGENT_ITERATIONS = 5;

/** Sliding window: only the last N messages are sent to the LLM to keep context lean. */
export const MAX_CONTEXT_MESSAGES = 20;
