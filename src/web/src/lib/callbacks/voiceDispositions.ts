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
