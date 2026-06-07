-- cockpit_sessions — der Zustand eines Onboarding-Cockpit-Durchlaufs
-- (Onboarding-Cockpit Phase 2, OC6).
--
-- Die Brücke Pipeline → Onboarding. Nach dem „Ja" im Gespräch (Phase 1) legt
-- der Founder per CLI (create_cockpit_session.mjs) eine Session an: ein
-- privater Token (= der /aufbau/<token>-Link in der Onboarding-Mail) + ein
-- Snapshot der Vorbefüllung aus tenant_config.json. Der Betrieb baut sein
-- System dann selbst im Cockpit („Sie bauen Ihr System, wir führen Sie").
-- Spec: docs/gtm/onboarding/phase2_datamodel_backend.md + phase2_cockpit_structure.md
--
-- KERN-DISZIPLIN (G6/G11, „build-love-then-pay"): Während des Baus wird NICHTS
-- live. Der Kunde schreibt ausschliesslich in `draft` (SoT während des Baus).
-- Erst der founder-getestete promote-Schritt (nach dem Review-Gate, Phase 3)
-- schreibt draft → tenants.modules + staff + Retell-Prompt. Diese Tabelle hält
-- bewusst KEINE Live-Config.
--
-- TOKEN-PRIVAT (gleiches Muster wie proof_pages): Der Prospect öffnet
-- /aufbau/<token> OHNE Login (vom Handy). Der Token IST das Geheimnis (hohe
-- Entropie). Zugriff ausschliesslich via getServiceClient() (RLS umgangen).

CREATE TABLE IF NOT EXISTS cockpit_sessions (
  -- Random secret token = der private Pfad /aufbau/<token>. Kein HMAC nötig.
  token TEXT PRIMARY KEY,

  -- Der vor-provisionierte (noch NICHT live geschaltete) Tenant. Beim Promote
  -- werden die Antworten auf genau diesen Tenant geschrieben.
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Pipeline-Slug (z.B. "doerfler-ag") — Founder-Übersicht + Rück-Referenz auf
  -- docs/customers/<slug>/. Nicht für Auth.
  slug TEXT NOT NULL,

  -- Anzeige im Cockpit-Header ("Bauen wir <company_name> auf").
  company_name TEXT NOT NULL,

  -- Snapshot der Vorbefüllung aus tenant_config.json (zum Erstellungs-Zeitpunkt).
  -- BEWUSST kopiert statt zur Laufzeit aus der Datei gelesen → kein Filesystem-
  -- Zugriff auf Vercel, robust + deterministisch. Shape = das Cockpit-Manifest
  -- (voice/wizard/branding/staff-Platzhalter/...).
  prefill JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Die laufenden Antworten des Betriebs (Autosave). SoT WÄHREND des Baus.
  -- confirm-not-create: startet leer, der Kunde bestätigt/feilt die prefill-Werte.
  draft JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Welche Stränge/Fähigkeiten startklar sind (für das Fortschritts-Band +
  -- Founder-Übersicht), z.B. { "quickwin": true, "voice": false, ... }.
  progress JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Lifecycle des Durchlaufs:
  --   building  → Kunde baut (Default)
  --   submitted → „An Gunnar gesendet" (Founder-Review-Gate, Phase 3)
  --   approved  → Founder-Review grün (vor dem Promote)
  --   live      → promote gelaufen, System scharf
  --   abandoned → manuell abgebrochen
  status TEXT NOT NULL DEFAULT 'building'
    CHECK (status IN ('building', 'submitted', 'approved', 'live', 'abandoned')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  live_at TIMESTAMPTZ
);

-- Founder-Übersicht / Re-Run-Lookup je Betrieb (neueste zuerst).
CREATE INDEX IF NOT EXISTS idx_cockpit_sessions_slug
  ON cockpit_sessions (slug, created_at DESC);

-- Founder-Übersicht: offene Durchläufe je Status.
CREATE INDEX IF NOT EXISTS idx_cockpit_sessions_status
  ON cockpit_sessions (status, created_at DESC);

ALTER TABLE cockpit_sessions ENABLE ROW LEVEL SECURITY;

-- Bewusst KEINE Policies: anon/authed Clients dürfen nicht direkt lesen/schreiben.
-- Zugriff ausschliesslich über getServiceClient() (Cockpit-Server-Routes +
-- CLI-Scripts), der service_role nutzt und RLS umgeht. So bleiben Tokens +
-- Draft-Inhalte privat — und der Promote bleibt ein bewusster Founder-Schritt,
-- nicht etwas, das ein Client direkt auslösen könnte.
