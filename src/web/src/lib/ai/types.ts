// ---------------------------------------------------------------------------
// AI Provider Interface — Model-agnostic foundation
// Implementations: anthropic.ts, openai.ts (Phase 6)
// ---------------------------------------------------------------------------

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiOpts {
  maxTokens?: number;
  temperature?: number;
  /** Feature name for cost tracking */
  feature?: string;
}

export interface AiProvider {
  chat(messages: AiMessage[], opts?: AiOpts): Promise<string>;
  summarize(text: string, opts?: AiOpts): Promise<string>;
  classify(text: string, categories: string[], opts?: AiOpts): Promise<string>;
}

export interface AiModelConfig {
  provider: "anthropic" | "openai" | "google";
  model: string;
}

/** Feature → Model mapping. Configurable without code change. */
export const AI_CONFIG: Record<string, AiModelConfig> = {
  triage:        { provider: "anthropic", model: "claude-haiku-4-5-20251001" },
  analysis:      { provider: "anthropic", model: "claude-opus-4-6" },
  outreach:      { provider: "openai",    model: "gpt-4o" },
  pulse_comment: { provider: "anthropic", model: "claude-haiku-4-5-20251001" },
  forecast:      { provider: "openai",    model: "gpt-4o" },
};
