/**
 * Cockpit-Datenvertrag (Onboarding-Cockpit Phase 2, OC6).
 *
 * Zwei Ebenen pro Session (siehe phase2_datamodel_backend.md §0):
 *  - `prefill` = Snapshot aus tenant_config.json bei Session-Erstellung. Read-only
 *    Default. Das meiste Voice-Wissen + Branding kommt hierher (≈70 % „confirm").
 *  - `draft`   = die Antworten des Betriebs (Autosave). Überschreibt den prefill-
 *    Default Feld für Feld. SoT WÄHREND des Baus. Effektiver Wert = draft ?? prefill.
 *
 * 🆕-Felder (kein Crawl weiss das) starten LEER und sind der eigentliche
 * Erfassungs-Job: echte Staff, notification_email, google_review_url, echte
 * Admin-E-Mail, Dispositions-Policy, Wizard-Verteilung, Greeting/KI-Hinweis.
 *
 * Spec: docs/gtm/onboarding/phase2_cockpit_manifest.md (das „Was")
 *     + docs/gtm/onboarding/phase2_voice_dispositions.md (die 7 Dispositionen)
 */

// ── Bausteine ───────────────────────────────────────────────────────────────

export interface WizardCategory {
  value: string;
  label: string;
  hint?: string;
  iconKey?: string;
  fixed?: boolean;
}

/** Eine echte Person im Betrieb (🆕 — ersetzt die seed-Video-Dummys). */
export interface StaffMember {
  name: string;
  role: "admin" | "techniker";
  email: string;
}

/**
 * Die 7 Dispositionen → je ein Korb + Notify (phase2_voice_dispositions.md).
 * D7 (Live-Transfer) ist im MVP raus. Defaults = CC-Empfehlung (Founder:
 * „nimm deine Empfehlungen").
 */
export type DispositionKorb = "fall" | "nachricht" | "nichts";
export type DispositionNotify = "none" | "board" | "push";

export interface DispositionPolicy {
  korb: DispositionKorb;
  notify: DispositionNotify;
}

export type DispositionKey =
  | "d1_auftrag"
  | "d2_info"
  | "d3_rueckruf"
  | "d4_nachfrage"
  | "d5_reklamation"
  | "d6_privat";

export type DispositionsConfig = Record<DispositionKey, DispositionPolicy>;

/** Sanitär-Defaults — Alarmierungs-Schwelle: nur Notfall + Reklamation stören sofort. */
export const DISPOSITION_DEFAULTS: DispositionsConfig = {
  d1_auftrag: { korb: "fall", notify: "push" }, // Notfall → Push; sonst Board (UI-Detail)
  d2_info: { korb: "nichts", notify: "none" }, // latenter Lead → Fall (Lisa-Logik), kein Müll-Fall
  d3_rueckruf: { korb: "nachricht", notify: "board" },
  d4_nachfrage: { korb: "nachricht", notify: "board" },
  d5_reklamation: { korb: "fall", notify: "push" },
  d6_privat: { korb: "nichts", notify: "none" },
};

// ── Prefill (Snapshot, read-only Default) ────────────────────────────────────

/** Das Voice-Wissen für „Das sagt Ihre Lisa" (Manifest 1b — alles ✅ vorbefüllt). */
export interface VoiceWissen {
  openingHours: string;
  openingHoursSpoken: string;
  serviceArea: string;
  serviceAreaSpoken: string;
  address: string;
  addressSpoken: string;
  servicesList: string;
  memberships: string;
  emergencyPolicy: string;
  priceDeflect: string;
  jobsSpoken: string;
  phone: string;
  email: string;
  website: string;
  googleRating: string;
  ownerNames: string;
  founded: string;
  teamSection: string;
}

export interface CockpitPrefill {
  branding: {
    companyName: string;
    brandColor: string;
    caseIdPrefix: string;
    smsSenderName: string;
  };
  voice: {
    companyName: string;
    domain: string;
    /** Default-Vorschlag für Begrüssung + revDSG-Mindesthinweis (KI). */
    greetingSuggestion: string;
    kiDisclosureMin: string;
    languagesDefault: { de: boolean; intl: boolean };
    wissen: VoiceWissen;
  };
  wizard: {
    categories: WizardCategory[];
    brandColor: string;
  };
  review: {
    smsSenderName: string;
    chipsDefault: string[];
  };
  /**
   * Hinweise, die NICHT als Wahrheit übernommen werden dürfen — nur als sichtbarer
   * Ausgangspunkt, den der Betrieb ersetzen MUSS (Anti-Dummy-Schutz).
   */
  hints: {
    /** Generische Crawl-Mail (z.B. info@…). KEIN Default für notification/admin. */
    crawledEmail: string | null;
    /** seed-Dummys (Max Mustermann …) — NUR Doku, NIE als Staff übernehmen. */
    dummyStaffNames: string[];
  };
}

// ── Draft (Antworten des Betriebs, Autosave; alles optional) ─────────────────

export interface CockpitDraft {
  branding?: {
    brandColor?: string;
    caseIdPrefix?: string;
  };
  /** Echte Personen (🆕). Leer/fehlend = noch nicht erfasst. */
  staff?: StaffMember[];
  voice?: {
    greetingText?: string;
    kiDisclosure?: string;
    languages?: { de: boolean; intl: boolean };
    /** Korrekturen am vorbefüllten Wissen (nur geänderte Felder). */
    wissen?: Partial<VoiceWissen>;
    dispositions?: DispositionsConfig;
    /** Pickup = Telco-Weiterleitungs-Wahl (Next-Step, keine Lisa-Config). */
    pickup?: "sofort" | "nach_15s" | "nach_30s";
    notfallAlarm?: "push" | "anruf";
  };
  wizard?: {
    categories?: WizardCategory[];
    distribution?: "gbp_button" | "link" | "embed" | "subdomain" | "agentur_mail";
    replaceOldForm?: boolean;
  };
  review?: {
    notificationEmail?: string; // 🆕 echte Ops-Mail
    googleReviewUrl?: string; // 🆕
    smsSenderName?: string;
    chips?: string[];
  };
  golive?: {
    adminEmail?: string; // 🆕 OTP-Login (B1-Pre-Provision)
    avvAccepted?: boolean;
  };
  /** Pro Strang/Schritt: erledigt? (treibt das Fortschritts-Band). */
  stepDone?: Record<string, boolean>;
}

// ── Session (DB-Zeile) ───────────────────────────────────────────────────────

export type CockpitStatus =
  | "building"
  | "submitted"
  | "approved"
  | "live"
  | "abandoned";

export interface CockpitSession {
  token: string;
  tenant_id: string;
  slug: string;
  company_name: string;
  prefill: CockpitPrefill;
  draft: CockpitDraft;
  progress: Record<string, boolean>;
  status: CockpitStatus;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  approved_at: string | null;
  live_at: string | null;
}
