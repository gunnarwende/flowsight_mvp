// ---------------------------------------------------------------------------
// Anthropic (Claude) AI Provider — Phase 6
// ---------------------------------------------------------------------------

import type { AiProvider, AiMessage, AiOpts } from "../types";
import { AI_CONFIG } from "../types";

const API_URL = "https://api.anthropic.com/v1/messages";

export class AnthropicProvider implements AiProvider {
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel?: string) {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel ?? AI_CONFIG.triage.model;
  }

  async chat(messages: AiMessage[], opts?: AiOpts): Promise<string> {
    try {
      // Anthropic API uses system as a top-level param, not in messages array
      const systemMsg = messages.find((m) => m.role === "system")?.content;
      const userMessages = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content }));

      const body: Record<string, unknown> = {
        model: this.defaultModel,
        max_tokens: opts?.maxTokens ?? 1024,
        messages: userMessages,
      };
      if (systemMsg) body.system = systemMsg;
      if (opts?.temperature !== undefined) body.temperature = opts.temperature;

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.text().catch(() => "unknown");
        return `[AI-Fehler] Anthropic ${res.status}: ${err.slice(0, 200)}`;
      }

      const json = await res.json();
      const text =
        json.content?.[0]?.text ?? "[AI-Fehler] Keine Antwort erhalten.";
      return text;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return `[AI-Fehler] Anthropic: ${msg}`;
    }
  }

  async summarize(text: string, opts?: AiOpts): Promise<string> {
    return this.chat(
      [
        {
          role: "system",
          content:
            "Du bist ein präziser Business-Analyst. Fasse den folgenden Text in 2-3 Sätzen auf Deutsch zusammen.",
        },
        { role: "user", content: text },
      ],
      { maxTokens: 300, ...opts },
    );
  }

  async classify(
    text: string,
    categories: string[],
    opts?: AiOpts,
  ): Promise<string> {
    return this.chat(
      [
        {
          role: "system",
          content: `Klassifiziere den folgenden Text in GENAU eine dieser Kategorien: ${categories.join(", ")}. Antworte NUR mit dem Kategorienamen, nichts anderes.`,
        },
        { role: "user", content: text },
      ],
      { maxTokens: 50, temperature: 0, ...opts },
    );
  }
}
