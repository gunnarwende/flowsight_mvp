-- proof_watch — ehrliche Per-Take-Watch-Tiefe (MR2).
--
-- proof_pages.view_count = "wurde die Seite geöffnet?" (Kadenz-Signal Tag 0/3/6-7).
-- DIESE Tabelle = "wie tief hat der Prospect jeden Take wirklich geschaut?" — das
-- eigentliche Hitze-Signal, v.a. T2 (= die Anruf-Demo = Kauf-Signal).
--
-- Warum nicht Bunny-Aggregat: Bunnys Statistik mischt ALLE Views (inkl. der eigenen
-- Founder-/Vorschau-Aufrufe) und ist ein 14-Tage-Aggregat — als Per-Prospect-Signal
-- wertlos. Hier erfassen wir clientseitig pro (Seite, Take, Sitzung) den MAX-Fortschritt,
-- und markieren eigene Aufrufe (`?preview=1`) als is_preview, damit der Morning-Report
-- sie ausschliessen kann. T1 wird mitgespeichert, im Report aber ignoriert (geteiltes
-- canonical Video → kein Per-Prospect-Signal).

CREATE TABLE IF NOT EXISTS proof_watch (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  token TEXT NOT NULL REFERENCES proof_pages(token) ON DELETE CASCADE,
  take TEXT NOT NULL CHECK (take IN ('t1', 't2', 't2_portrait', 't3', 't4')),

  -- Zufalls-ID pro Browser-Sitzung (sessionStorage). Eine Zeile je (Seite, Take, Sitzung);
  -- wir behalten den höchsten erreichten Fortschritt dieser Sitzung.
  session_id TEXT NOT NULL,

  max_pct SMALLINT NOT NULL DEFAULT 0 CHECK (max_pct BETWEEN 0 AND 100),
  seconds_watched INT NOT NULL DEFAULT 0,

  -- true, wenn die Seite mit ?preview=1 geöffnet wurde (Founder-Eigenaufruf) →
  -- vom Hitze-Signal ausgeschlossen.
  is_preview BOOLEAN NOT NULL DEFAULT false,

  first_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (token, take, session_id)
);

CREATE INDEX IF NOT EXISTS idx_proof_watch_token ON proof_watch (token, take);

ALTER TABLE proof_watch ENABLE ROW LEVEL SECURITY;

-- Bewusst KEINE Policies: Zugriff nur über getServiceClient() (Track-Endpoint +
-- Report-Script mit service_role, RLS-bypass) — analog proof_pages.
