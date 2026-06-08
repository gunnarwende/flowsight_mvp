/**
 * Per-Betrieb Voice-Dispositions-Policy (Onboarding-Cockpit Phase 2, OC3).
 *
 * Liegt in `tenants.modules.voice_dispositions` (JSONB). Das Cockpit (OC5)
 * schreibt sie; der Webhook liest sie, um Benachrichtigungen zu steuern.
 *
 * BACKWARD-COMPATIBLE: fehlt die Config (heute bei allen Tenants), gelten die
 * Sanitär-Defaults aus docs/gtm/onboarding/phase2_voice_dispositions.md
 * (Alarmierungs-Schwelle: sofort-Push nur bei Notfall + Reklamation; Rückrufe
 * landen still in der Nachrichten-Liste, ohne Push).
 */

export interface VoiceDispositionsConfig {
  /** Reklamation → sofortiger Push an Inhaber (business-kritisch). */
  reklamationPush?: boolean;
  /** Rückruf/Nachricht → Push (Default: nur Liste, kein Push). */
  callbackPush?: boolean;
}

export interface ResolvedVoiceDispositions {
  reklamationPush: boolean;
  callbackPush: boolean;
}

/** Sanitär-Defaults = Alarmierungs-Schwelle (nur Notfall + Reklamation stören sofort). */
export const VOICE_DISPOSITIONS_DEFAULTS: ResolvedVoiceDispositions = {
  reklamationPush: true,
  callbackPush: false,
};

/**
 * Liest die per-Tenant-Policy aus `modules.voice_dispositions` mit sicheren
 * Defaults. Unbekannte/fehlende Felder fallen auf den Default zurück.
 */
export function resolveVoiceDispositions(
  modules: Record<string, unknown> | null | undefined,
): ResolvedVoiceDispositions {
  const raw = modules?.voice_dispositions;
  if (!raw || typeof raw !== "object") return { ...VOICE_DISPOSITIONS_DEFAULTS };
  const cfg = raw as VoiceDispositionsConfig;
  return {
    reklamationPush:
      typeof cfg.reklamationPush === "boolean"
        ? cfg.reklamationPush
        : VOICE_DISPOSITIONS_DEFAULTS.reklamationPush,
    callbackPush:
      typeof cfg.callbackPush === "boolean"
        ? cfg.callbackPush
        : VOICE_DISPOSITIONS_DEFAULTS.callbackPush,
  };
}

// ── OC3-Vollausbau: per-Anruf-Art-Korb (Fall/Nachricht/nichts) live (Runde 6 #1) ──
import { DISPOSITION_DEFAULTS } from "@/src/lib/cockpit/types";
import type { DispositionsConfig, DispositionKey } from "@/src/lib/cockpit/types";

const CALLTYPE_TO_DISPOSITION: Record<string, DispositionKey> = {
  auftrag: "d1_auftrag", order: "d1_auftrag", schaden: "d1_auftrag",
  info: "d2_info",
  callback: "d3_rueckruf", rueckruf: "d3_rueckruf", lieferant: "d3_rueckruf",
  order_followup: "d4_nachfrage", nachfrage: "d4_nachfrage",
  reklamation: "d5_reklamation",
  private: "d6_privat", privat: "d6_privat", spam: "d6_privat",
};

/** call_type (vom Agenten) → Disposition. null = unbekannt/abwesend → Fall-Fallback. */
export function dispositionForCallType(callType: string | null | undefined): DispositionKey | null {
  if (!callType) return null;
  return CALLTYPE_TO_DISPOSITION[callType.toLowerCase()] ?? null;
}

/** Volle per-Disposition-Policy (korb+notify, d1-d6) aus modules.voice_dispositions,
 *  feldweise mit Sanitär-Defaults. Backward-compatible: fehlt die Config → Defaults
 *  = exakt heutiges Verhalten. */
export function resolveDispositionsConfig(
  modules: Record<string, unknown> | null | undefined,
): DispositionsConfig {
  const raw = (modules?.voice_dispositions ?? undefined) as Partial<DispositionsConfig> | undefined;
  const out = {} as DispositionsConfig;
  (Object.keys(DISPOSITION_DEFAULTS) as DispositionKey[]).forEach((k) => {
    const d = raw && typeof raw === "object" ? raw[k] : undefined;
    const def = DISPOSITION_DEFAULTS[k];
    out[k] = {
      korb: d && (d.korb === "fall" || d.korb === "nachricht" || d.korb === "nichts") ? d.korb : def.korb,
      notify: d && (d.notify === "none" || d.notify === "board" || d.notify === "push") ? d.notify : def.notify,
    };
  });
  return out;
}
