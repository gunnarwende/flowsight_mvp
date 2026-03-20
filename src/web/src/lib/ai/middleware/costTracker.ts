// ---------------------------------------------------------------------------
// AI Cost Tracker Middleware — Phase 6
// Logs AI usage to console as JSON. DB persistence deferred until
// ceo_ai_usage table is confirmed deployed.
// ---------------------------------------------------------------------------

/**
 * Wraps an AI provider call, measuring latency and logging usage.
 * Returns the AI response string (or error message on failure).
 */
export async function trackAiCall(
  provider: string,
  model: string,
  feature: string,
  fn: () => Promise<string>,
): Promise<string> {
  const start = Date.now();
  let success = true;
  let result: string;

  try {
    result = await fn();
    // Detect provider-level error messages returned as strings
    if (result.startsWith("[AI-Fehler]")) {
      success = false;
    }
  } catch (e) {
    success = false;
    result =
      e instanceof Error ? `[AI-Fehler] ${e.message}` : "[AI-Fehler] Unknown";
  }

  const latencyMs = Date.now() - start;

  // Structured log — parseable by log aggregators
  console.log(
    JSON.stringify({
      _tag: "ai_usage",
      provider,
      model,
      feature,
      latency_ms: latencyMs,
      success,
      ts: new Date().toISOString(),
    }),
  );

  return result;
}
