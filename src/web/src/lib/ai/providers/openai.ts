// ---------------------------------------------------------------------------
// OpenAI AI Provider — Phase 6
// ---------------------------------------------------------------------------

import type { AiProvider, AiMessage, AiOpts } from "../types";
import { AI_CONFIG } from "../types";

const API_URL = "https://api.openai.com/v1/chat/completions";

export class OpenAiProvider implements AiProvider {
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel?: string) {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel ?? AI_CONFIG.outreach.model;
  }

  async chat(messages: AiMessage[], opts?: AiOpts): Promise<string> {
    try {
      const body: Record<string, unknown> = {
        model: this.defaultModel,
        max_tokens: opts?.maxTokens ?? 1024,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      };
      if (opts?.temperature !== undefined) body.temperature = opts.temperature;

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.text().catch(() => "unknown");
        return `[AI-Fehler] OpenAI ${res.status}: ${err.slice(0, 200)}`;
      }

      const json = await res.json();
      const text =
        json.choices?.[0]?.message?.content ??
        "[AI-Fehler] Keine Antwort erhalten.";
      return text;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return `[AI-Fehler] OpenAI: ${msg}`;
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
