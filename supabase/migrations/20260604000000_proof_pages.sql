-- Proof pages — the private "Schatztruhe" behind the outreach email.
--
-- E-Mail-/Outreach-Phase (gelockt 03.06.2026, siehe PIPELINE_BIBLE Phase 3 +
-- docs/gtm/outreach_templates.md). Modell: "Mail = Deckel, Seite = Schatz."
-- Statt drei kalten Links (Test-Nummer + Website + Video) bekommt jeder
-- Prospect EINEN privaten, token-geschützten Link auf eine mobil-first Seite
-- mit seinen 4 personalisierten Video-Takes (T1 Intro, T2 Anruf, T3 Wizard,
-- T4 Bewertung), gehostet auf Bunny Stream.
--
-- Dies ist KEIN Tenant/Case — es ist ein Sales-Artefakt pro Prospect. Eigene
-- Tabelle, weil cases/tenants ein anderes Schema haben und der Token-Lookup
-- ohne Auth (vom Prospect-Handy) laufen muss.

CREATE TABLE IF NOT EXISTS proof_pages (
  -- Random secret token = der private Pfad. /p/<token>. Kein HMAC nötig:
  -- der Token IST das Geheimnis (rate-limit-resistent durch hohe Entropie).
  token TEXT PRIMARY KEY,

  -- Welcher Betrieb (Pipeline-Slug, z.B. "walter-leuthold"). Für Re-Runs +
  -- Founder-Übersicht; nicht für Auth.
  tenant_slug TEXT NOT NULL,

  -- Anzeige auf der Seite
  company_name TEXT NOT NULL,
  contact_name TEXT,                 -- Inhaber (Anreicherung), z.B. "Walter Leuthold"
  contact_salutation TEXT,           -- Begrüssung auf der Seite, z.B. "Herr Leuthold"

  -- Welche T2-Variante im Set steckt (steuert Label/Reihenfolge)
  variant TEXT NOT NULL DEFAULT 'preis'
    CHECK (variant IN ('notruf', 'preis')),

  -- Bunny-Stream-GUIDs der 4 Takes: { "t1": guid, "t2": guid, "t3": guid, "t4": guid }
  videos JSONB NOT NULL DEFAULT '{}'::jsonb,
  bunny_library_id TEXT,             -- denormalisiert (Player braucht Library-ID + GUID)

  -- Optionaler dynamischer CTA-Text (Variante A: Termin-Window). NULL = Default.
  cta_slot_window TEXT,

  -- Lifecycle. "expired" wird vom Lifecycle-Job gesetzt (Video-Löschung nach
  -- 14 Tagen ohne Engagement); "disabled" = manuell abgeschaltet.
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'disabled')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,            -- created_at + 14 Tage (Bunny-Storage-Lifecycle)

  -- Eigenes Page-Open-Tracking (Bunny liefert die detaillierte Watch-/Geräte-
  -- Analytik pro Video; das hier ist das "wurde überhaupt geöffnet"-Signal für
  -- die tracking-gesteuerte Kadenz Tag 0/3/6-7).
  first_viewed_at TIMESTAMPTZ,
  last_viewed_at TIMESTAMPTZ,
  view_count INT NOT NULL DEFAULT 0
);

-- Founder-Übersicht / Re-Run-Lookup je Betrieb
CREATE INDEX IF NOT EXISTS idx_proof_pages_tenant
  ON proof_pages (tenant_slug, created_at DESC);

-- Lifecycle-Job: aktive, abgelaufene Seiten finden
CREATE INDEX IF NOT EXISTS idx_proof_pages_status_expiry
  ON proof_pages (status, expires_at);

ALTER TABLE proof_pages ENABLE ROW LEVEL SECURITY;

-- Bewusst KEINE Policies: anon/authed Clients dürfen nicht direkt lesen.
-- Zugriff ausschliesslich über getServiceClient() (Beweis-Seite-Server +
-- CLI-Scripts), der service_role nutzt und RLS umgeht. So bleibt die Liste
-- aller Prospect-Tokens privat.
