// ---------------------------------------------------------------------------
// AI Provider Registry — Phase 6
// Returns configured provider or null (graceful degradation)
// ---------------------------------------------------------------------------

import type { AiProvider } from "./types";
import { AI_CONFIG } from "./types";
import { AnthropicProvider } from "./providers/anthropic";
import { OpenAiProvider } from "./providers/openai";

/** Singleton cache so we don't re-create providers on every call */
const cache = new Map<string, AiProvider>();

/**
 * Get an AI provider instance for a given feature.
 * Returns null if the required API key is not configured.
 */
export function getAiProvider(
  feature: keyof typeof AI_CONFIG,
): AiProvider | null {
  const config = AI_CONFIG[feature];
  if (!config) return null;

  const cacheKey = `${config.provider}:${config.model}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  let provider: AiProvider | null = null;

  switch (config.provider) {
    case "anthropic": {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) return null;
      provider = new AnthropicProvider(key, config.model);
      break;
    }
    case "openai": {
      const key = process.env.OPENAI_API_KEY;
      if (!key) return null;
      provider = new OpenAiProvider(key, config.model);
      break;
    }
    default:
      return null;
  }

  if (provider) cache.set(cacheKey, provider);
  return provider;
}
