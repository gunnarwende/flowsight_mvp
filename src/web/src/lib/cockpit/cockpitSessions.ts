import { getServiceClient } from "@/src/lib/supabase/server";
import type {
  CockpitDraft,
  CockpitPrefill,
  CockpitSession,
  CockpitStatus,
} from "./types";

/**
 * cockpit_sessions — Datenschicht des Onboarding-Cockpits (Phase 2, OC6).
 *
 * Token-privat (wie proof_pages): Zugriff ausschliesslich via Service-Client
 * (RLS umgangen). Genutzt von den Cockpit-Server-Routes (/aufbau, /api/aufbau)
 * + dem Promote-CLI. Der Prospect öffnet /aufbau/<token> OHNE Login.
 *
 * DISZIPLIN: Diese Schicht schreibt NIE in `tenants.modules`/`staff`/Retell.
 * Sie verwaltet nur den Bau-Zustand (`draft`). Das Live-Schalten ist der
 * separate, founder-getestete Promote-Schritt (Phase 3 Go-live-Gate).
 *
 * Spec: docs/gtm/onboarding/phase2_datamodel_backend.md
 */

const SELECT_COLS =
  "token, tenant_id, slug, company_name, prefill, draft, progress, status, created_at, updated_at, submitted_at, approved_at, live_at";

const PGRST_NO_ROWS = "PGRST116";

function errorCode(error: unknown): string | undefined {
  return (error as { code?: string } | null)?.code;
}

export interface CreateCockpitSessionInput {
  token: string;
  tenantId: string;
  slug: string;
  companyName: string;
  prefill: CockpitPrefill;
}

/** Legt eine Session an (idempotent über den Token-PK ist Sache des Callers). */
export async function createCockpitSession(
  input: CreateCockpitSessionInput,
): Promise<CockpitSession> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("cockpit_sessions")
    .insert({
      token: input.token,
      tenant_id: input.tenantId,
      slug: input.slug,
      company_name: input.companyName,
      prefill: input.prefill,
      draft: {},
      progress: {},
    })
    .select(SELECT_COLS)
    .single();
  if (error) throw new Error(`cockpit_sessions insert failed: ${error.message}`);
  return data as CockpitSession;
}

/** Lädt eine Session per Token. null, wenn unbekannt. */
export async function getCockpitSessionByToken(
  token: string,
): Promise<CockpitSession | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("cockpit_sessions")
    .select(SELECT_COLS)
    .eq("token", token)
    .maybeSingle();
  if (error) throw new Error(`cockpit_sessions read failed: ${error.message}`);
  return (data as CockpitSession) ?? null;
}

/**
 * Merge-Strategie (bewusst einfach + vorhersehbar):
 *  - Top-Level-Stränge (branding/voice/wizard/review/golive/staff) werden
 *    ERSETZT → der Client sendet beim Speichern jeweils den VOLLSTÄNDIGEN Strang.
 *  - `stepDone` (flache Map) wird key-weise gemerged → Teil-Updates akkumulieren.
 */
function mergeDraft(existing: CockpitDraft, patch: CockpitDraft): CockpitDraft {
  const merged: CockpitDraft = { ...existing, ...patch };
  if (existing.stepDone || patch.stepDone) {
    merged.stepDone = { ...existing.stepDone, ...patch.stepDone };
  }
  return merged;
}

export interface SaveCockpitDraftInput {
  token: string;
  draftPatch: CockpitDraft;
  /** Fähigkeits-Flags fürs Fortschritts-Band (key-weise gemerged). */
  progressPatch?: Record<string, boolean>;
}

/**
 * Autosave. Liest die aktuelle Session, merged den Patch und schreibt zurück.
 * Nur im Status "building" erlaubt (nach dem Absenden ist der Draft eingefroren).
 * Gibt die aktualisierte Session zurück; null, wenn Token unbekannt.
 */
export async function saveCockpitDraft(
  input: SaveCockpitDraftInput,
): Promise<{ ok: boolean; reason?: "not_found" | "locked"; session: CockpitSession | null }> {
  const supabase = getServiceClient();
  const current = await getCockpitSessionByToken(input.token);
  if (!current) return { ok: false, reason: "not_found", session: null };
  if (current.status !== "building") {
    return { ok: false, reason: "locked", session: current };
  }

  const nextDraft = mergeDraft(current.draft ?? {}, input.draftPatch ?? {});
  const nextProgress = { ...(current.progress ?? {}), ...(input.progressPatch ?? {}) };

  const { data, error } = await supabase
    .from("cockpit_sessions")
    .update({
      draft: nextDraft,
      progress: nextProgress,
      updated_at: new Date().toISOString(),
    })
    .eq("token", input.token)
    .eq("status", "building") // Defence: nicht überschreiben, falls zwischenzeitlich submitted
    .select(SELECT_COLS)
    .single();

  if (error) {
    if (errorCode(error) === PGRST_NO_ROWS) {
      return { ok: false, reason: "locked", session: current };
    }
    throw new Error(`cockpit_sessions save failed: ${error.message}`);
  }
  return { ok: true, session: data as CockpitSession };
}

const STATUS_TIMESTAMP: Partial<Record<CockpitStatus, string>> = {
  submitted: "submitted_at",
  approved: "approved_at",
  live: "live_at",
};

/**
 * Setzt den Lifecycle-Status (+ passenden Zeitstempel). Genutzt von der
 * Submit-Route ("building"→"submitted") und vom Promote-CLI ("approved"/"live").
 * Gibt die aktualisierte Session zurück; null, wenn Token unbekannt.
 */
export async function setCockpitStatus(args: {
  token: string;
  status: CockpitStatus;
}): Promise<CockpitSession | null> {
  const supabase = getServiceClient();
  const patch: Record<string, unknown> = {
    status: args.status,
    updated_at: new Date().toISOString(),
  };
  const tsCol = STATUS_TIMESTAMP[args.status];
  if (tsCol) patch[tsCol] = new Date().toISOString();

  const { data, error } = await supabase
    .from("cockpit_sessions")
    .update(patch)
    .eq("token", args.token)
    .select(SELECT_COLS)
    .single();

  if (error) {
    if (errorCode(error) === PGRST_NO_ROWS) return null;
    throw new Error(`cockpit_sessions status update failed: ${error.message}`);
  }
  return (data as CockpitSession) ?? null;
}

/**
 * Effektiver Wert = draft ?? prefill, Feld für Feld. Helper für Page + Promote:
 * confirm-not-create heisst, der gespeicherte Draft-Wert gewinnt über die
 * Vorbefüllung; fehlt er, gilt der prefill-Default.
 */
export function effectiveString(
  draftVal: string | undefined | null,
  prefillVal: string | undefined | null,
): string {
  const d = typeof draftVal === "string" ? draftVal.trim() : "";
  if (d) return d;
  return (prefillVal ?? "").toString();
}
