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
    /** Pickup = Telco-Weiterleitungs-Wahl (Next-Step, keine Lisa-Config). 5 Stufen. */
    pickup?: "sofort" | "nach_10s" | "nach_15s" | "nach_20s" | "nach_30s";
    /** T1: Telefonanbieter — bestimmt die anbieter-spezifische Weiterleitungs-Anleitung. */
    telco?: { provider?: "swisscom" | "sunrise" | "salt" | "quickline" | "yallo" | "other"; otherName?: string };
    /** T3: Bietet der Betrieb Notdienst an? Weiche für T2 + Feiertags-Reaktion. */
    emergencyService?: boolean;
    /** T2: Wer wird bei einem Notfall sofort alarmiert. Lisa stellt NICHT durch — sie nimmt auf + alarmiert. */
    emergencyContact?: { name?: string; phone?: string };
    /** T4: An Feiertagen/ausserhalb Öffnungszeiten geschlossen — Fall wird TROTZDEM aufgenommen. */
    holidaysClosed?: boolean;
    /** Betriebsferien o. Ä. (optionaler Freitext für Lisa). */
    vacationNote?: string;
  };
  wizard?: {
    categories?: WizardCategory[];
    /** „link" entfernt; QR für website-lose Betriebe. */
    distribution?: "gbp_button" | "embed" | "agentur_mail" | "qr";
    /** Bei Embed: wer baut ein? */
    embedBy?: "intern" | "agentur";
    hasWebsite?: boolean;
    /** W1: Web-Agentur-Kontakt, wenn der Einbau dort liegt (sonst Sackgasse). */
    agencyName?: string;
    agencyEmail?: string;
  };
  review?: {
    notificationEmail?: string; // 🆕 echte Ops-Mail
    googleReviewUrl?: string; // 🆕
    smsSenderName?: string;
    /** Editierbarer SMS-Inhalt (≤160 Zeichen). Leer = Default-Template. */
    smsContent?: string;
    /** Nachrichten/Rückrufe zusätzlich per E-Mail melden (Default aus). */
    notifyMessagesByEmail?: boolean;
    chips?: string[];
    /** R2: Google Place-ID / Profilname für den wöchentlichen Rating-Crawl. */
    googlePlaceId?: string;
    /** R3: Bewertungen mit ≤ Schwelle bleiben intern; 0 = alle öffentlich. Default 3. */
    internalThreshold?: 0 | 2 | 3 | 4;
  };
  /** L3: die 3 automatischen Kunden-Nachrichten — Wortlaut (SMS ≤160) + Kanal-Wahl (Founder F: der Betrieb entscheidet). */
  messages?: {
    confirmSms?: string;
    reminderChannel?: "sms" | "email";
    reviewChannel?: "sms" | "email";
  };
  /** Kalender-Anbindung für Free/Busy (keine Doppelbuchung). Die technische MS-Tenant-ID
   *  wird beim 1-Klick-OAuth NACH Go-live automatisch erfasst — hier NICHT gefragt (zu technisch).
   *  adminName/adminEmail = wer den Microsoft-365-Consent gibt (Q3/K6: „Wer ist Ihr Admin?"). */
  calendar?: {
    connect?: boolean;
    provider?: "outlook" | "google" | "none";
    adminName?: string;
    adminEmail?: string;
    /** Bei Google: das geschäftliche Konto, dessen Kalender wir anbinden (wir richten ein, K4). */
    googleAccountEmail?: string;
  };
  golive?: {
    adminEmail?: string; // 🆕 OTP-Login (B1-Pre-Provision)
    avvAccepted?: boolean;
    /** Welche AVV-Version akzeptiert wurde + wann (revDSG-Nachweis). */
    avvVersion?: string;
    avvAcceptedAt?: string;
  };
  /** Freitext-Hinweise des Inhabers je Strang (fängt die „20 %, die nur er kennt"). */
  notes?: { vorort?: string; voice?: string; website?: string; system?: string };
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
