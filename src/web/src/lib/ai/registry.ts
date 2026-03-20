import type { AiProvider, AiModelConfig, AI_CONFIG } from "./types";

/**
 * Get an AI provider instance for a given feature.
 * Phase 6: Implements actual provider loading.
 * For now: throws "not configured" to prevent accidental use.
 */
export function getAiProvider(_feature: keyof typeof AI_CONFIG): AiProvider {
  throw new Error(`AI providers not yet configured. Coming in Phase 6.`);
}
