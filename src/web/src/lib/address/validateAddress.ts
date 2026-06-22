import "server-only";

// ── Adress-Validierung (Swiss Post Address Web Services REST) ─────────────────
// Wahrheit = „existiert diese Adresse?" (BuildingVerification), NICHT „ist sie korrekt".
// Ampel-Vertrag (Founder 2026-06-22): nur ROT ist sichtbar, alles andere neutral.
//   unconfirmed → Teil-/kein Treffer (Strasse/Hausnr)  → rotes Flag + Klartext-Grund
//   confirmed   → Adresse existiert vollständig         → neutral (kein Flag)
//   skipped     → Swiss Post nicht konfiguriert         → neutral (wir behaupten nichts)
//   error       → Prüfung versucht, API nicht erreichbar → neutral (kein Fehlalarm pro Fall)

export type AddressStatus = "confirmed" | "unconfirmed" | "error" | "skipped";

export interface AddressInput {
  plz: string;
  city: string;
  street?: string;
  houseNumber?: string;
}

export interface AddressValidation {
  status: AddressStatus;
  /** Klartext-Grund — nur gesetzt wenn status !== "confirmed" (für Flag + Inhaber-Anzeige). */
  reason?: string;
  /** Von Swiss Post normalisierte Felder bei Treffer. */
  normalized?: Partial<AddressInput>;
}

/** Liegt eine Swiss-Post-Konfiguration vor? (Runtime-Env, SSOT = Vercel.) */
function swissPostConfigured(): boolean {
  return Boolean(process.env.SWISSPOST_API_KEY || process.env.SWISSPOST_CLIENT_ID);
}

/**
 * Prüft eine Schweizer Adresse gegen die Swiss Post Address Web Services.
 * **Fail-safe: wirft NIE** — die Fall-Erstellung darf nie an der Adressprüfung scheitern.
 * Ohne Konfiguration / bei Fehler → `error` (= flaggen), damit nie eine ungeprüfte
 * Adresse still als bestätigt durchgeht.
 */
export async function validateAddress(input: AddressInput): Promise<AddressValidation> {
  if (!input.plz || !input.city) {
    return { status: "unconfirmed", reason: "Adresse unvollständig" };
  }
  if (!swissPostConfigured()) {
    // Noch keine Swiss-Post-Credentials → wir behaupten nichts (neutral, kein Flag).
    return { status: "skipped" };
  }
  try {
    return await callSwissPost(input);
  } catch {
    return { status: "error", reason: "Adressprüfung momentan nicht erreichbar" };
  }
}

/**
 * INTEGRATIONS-PUNKT — Swiss Post Address Web Services REST (developer.post.ch):
 *   • BuildingVerification: existiert <Strasse Hausnr, PLZ Ort>? → confirmed / unconfirmed
 *   • AutoComplete: Strasse gegen die realen Strassen der PLZ fuzzen → Grund bei Teil-Treffer
 * Auth + exakte Request/Response-Felder stammen aus der OpenAPI (Credentials nötig).
 * Bis verdrahtet: bewusst Wurf → validateAddress() liefert `error` (= rotes Flag).
 */
function callSwissPost(input: AddressInput): Promise<AddressValidation> {
  void input;
  return Promise.reject(new Error("swiss-post adapter not wired"));
}
