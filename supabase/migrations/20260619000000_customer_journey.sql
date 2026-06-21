-- Customer Journey — Daten-Fundament (Phase 1)
--
-- Bauplan: docs/gtm/customer_journey_buildplan.md
-- Orchestrator/SSOT der Reise: docs/gtm/CUSTOMER_JOURNEY_BIBLE.md
--
-- Ziel: EINE Wahrheit für den Sales-Funnel. Heute leben die Leads dreifach
-- (docs/sales/leads.csv · Hardcode im HTML · localStorage), der Entscheider-Name
-- nirgends sauber in der DB. Diese Migration legt die Wurzel an:
--   1. leads          — DB-Spiegel von leads.csv (Top-of-Funnel, founder-only)
--   2. journey_events — append-only Log, macht den Funnel echt + CC-lesbar
--   3. lead_id-Spalten auf proof_pages + cockpit_sessions = Join-Achse
--      (Lead → Simulation → Cockpit → Tenant)
--
-- Rein additiv: neue Tabellen + neue nullable Spalten. Kein bestehendes
-- Verhalten (versandte Beweis-Seiten, Cockpit) wird berührt.
--
-- Sicherheit: founder-privat nach dem bewährten Muster (proof_pages,
-- cockpit_sessions) — RLS aktiviert, BEWUSST KEINE Policies. Zugriff
-- ausschliesslich über getServiceClient() (CEO-App-Server + CLI-Scripts).

-- ── 1. leads — die Wurzel des Funnels ────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Natürlicher Schlüssel aus dem Scout (Google place_id). Eindeutig → Upsert.
  place_id TEXT UNIQUE NOT NULL,

  -- Maschinen-Daten (aus Scout/Crawl/Override abgeleitet)
  firma TEXT NOT NULL,
  ort TEXT,
  plz TEXT,
  ring TEXT,                          -- 0 Vor-Ort / 1 Telefon / 2 Kanton
  ma_proxy TEXT,                      -- Größen-Proxy ("2", "?", "klein?")
  tariff TEXT,                        -- "Solo (950)" / "Premium (2000)" / TBD / DQ
  inhaber_am_telefon TEXT,            -- Leitsignal: ja / nein / teils / ?
  entscheider TEXT,                   -- Entscheider-/Inhaber-Name (DIE Quelle)
  rolle TEXT,                         -- z.B. "GL Sanitär & Heizung"
  mail TEXT,
  telefon TEXT,
  website TEXT,
  rating NUMERIC,                     -- Google-Rating, z.B. 4.9
  reviews INTEGER,                    -- Google-Review-Anzahl
  icp_score INTEGER,
  tier TEXT,                          -- HOT / WARM / ...
  signale TEXT,                       -- Trust-/Gap-Signale (Freitext)

  -- Founder-Hoheit (Status-Spalten — vom Lead-Motor NIE überschrieben)
  status TEXT NOT NULL DEFAULT 'neu', -- neu / kontaktiert / ja / abgelehnt / ...
  letzter_kontakt DATE,
  naechster_schritt TEXT,
  naechster_am DATE,
  notiz TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_ring_score ON leads (ring, icp_score DESC);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- Bewusst KEINE Policies: die komplette Lead-Liste bleibt privat (nur service_role).

-- ── 2. journey_events — append-only Funnel-/Verlaufs-Log ──────────────────
CREATE TABLE IF NOT EXISTS journey_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Bezug. lead_id ist die Hauptachse; tenant_id/proof_token für Ereignisse,
  -- die an einem Artefakt hängen (Post-Conversion bzw. Beweis-Seite).
  lead_id UUID REFERENCES leads (id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants (id) ON DELETE SET NULL,
  proof_token TEXT,

  -- Was geschah: call_dialed / call_reached / call_no_answer / ja_to_sim /
  -- sim_built / sim_sent / proof_viewed / warm_call / cockpit_started /
  -- cockpit_submitted / go_live / ...
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT NOT NULL DEFAULT 'manual',  -- manual / track / script

  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_journey_events_lead ON journey_events (lead_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_journey_events_type ON journey_events (event_type, occurred_at DESC);

ALTER TABLE journey_events ENABLE ROW LEVEL SECURITY;
-- Bewusst KEINE Policies: nur service_role (CEO-App-Server + Scripts).

-- ── 3. Join-Achse: lead_id auf bestehende Sales-Artefakte ─────────────────
-- Verbindet die Kette CSV/leads → proof_pages → cockpit_sessions → tenants.
-- Nullable: bereits existierende Zeilen (versandte Beweis-Seiten) bleiben gültig.
ALTER TABLE proof_pages
  ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads (id) ON DELETE SET NULL;

ALTER TABLE cockpit_sessions
  ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads (id) ON DELETE SET NULL;
