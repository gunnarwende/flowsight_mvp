# Customer Journey — Bauplan

Version: 1 (2026-06-19)
Status: lebendes Bau- und Architekturdokument
Owner: Founder + CC
Stil: nüchtern, ein Lesepfad

---

## 0. Was dieses Dokument ist

Der Bauplan für die Customer Journey als Software — den täglichen Dreh- und
Angelpunkt des Geschäfts. Es trägt Architektur-Entscheidungen, das Datenmodell,
die Phasen und ein laufendes Fund-Protokoll.

Verhältnis zur Bible: `CUSTOMER_JOURNEY_BIBLE.md` ist und bleibt der Orchestrator
und die SSOT der Reise (Sterne, Übergänge, Owner, Vokabular). Dieses Dokument
dupliziert das nicht — es hält das Bau-Detail, das nicht in die Bible gehört.
Tasks leben weiterhin in `docs/ticketlist.md` (einziger Task-Tracker).

---

## 1. Architektur-Entscheidungen (gelockt 19.06.)

- **Heimat: CEO-App (`/ceo`).** Founder-only, Auth/PWA/Mobil sind dort vorhanden.
  Die Journey wird das Herzstück der CEO-App, nicht eine Seite unter vielen.
- **Lead-SSOT: die Datenbank.** `leads.csv` wird zum generierten Export.
  Der Lead-Motor (`build_leads`/`enrich_leads`) schreibt künftig in die DB.
  Grund: eine Wahrheit, keine Drift (heute: CSV vs. HTML-Hardcode vs. localStorage).
- **Ein Funnel, eine Wahrheit.** Die 8-Sterne-Journey ist der kanonische Funnel.
  Die alte `/ceo/pipeline`-Seite (Trial-Lifecycle-Modell, derzeit HTTP 500,
  vom Founder ungenutzt) wird absorbiert: brauchbare Teile (Anruf-/Follow-up-Liste)
  wandern in die Journey, der Rest wird Legacy.
- **Sicherheit: founder-privat.** Neue Tabellen nach bewährtem Muster
  `ENABLE ROW LEVEL SECURITY` ohne Policies, Zugriff nur über `getServiceClient()`
  (wie `proof_pages` und `cockpit_sessions`). Kein anon/authed Direct-Read.
- **Through-Line bleibt `tenant_config.json`** für Pipeline + Cockpit; die DB-Leads
  sind die vorgelagerte Wurzel (Top-of-Funnel), `lead_id` ist die Join-Achse.

---

## 2. Daten-Fundament (Schema, vorgeschlagen)

Zwei neue Tabellen plus zwei Verknüpfungs-Spalten. `lead_id` näht die Kette
Lead → Simulation → Cockpit → Tenant zusammen.

**`leads`** (Wurzel, founder-only) — DB-Spiegel von `leads.csv`:
`id` (uuid pk), `place_id` (text unique, natürlicher Schlüssel), `firma`, `ort`,
`plz`, `ring`, `ma_proxy`, `tariff` (Solo/Premium), `inhaber_am_telefon`,
**`entscheider`**, **`rolle`**, `mail`, `telefon`, `website`, `rating`, `reviews`,
`icp_score`, `tier`, `signale`, `status` (Funnel-Status), `letzter_kontakt`,
`naechster_schritt`, `naechster_am`, `notiz`, `created_at`, `updated_at`.
Hier lebt ab jetzt der Entscheider-/Inhaber-Name — die eine Quelle.

**`journey_events`** (append-only Log): `id` (uuid pk), `lead_id` (fk → leads,
nullable), `event_type`, `payload` (jsonb), `source` (manual/track/script),
`occurred_at`. Macht den Funnel echt und historisch — und für CC lesbar.

**Verknüpfung:** `proof_pages.lead_id` + `cockpit_sessions.lead_id` (je nullable
fk, gesetzt bei Erstellung).

**Funnel-Ableitung (8 Sterne → Datenquelle):**

| Stern | Quelle |
|---|---|
| 1 Kontakt | `leads.status` |
| 2 Cold Call | `journey_events` (call_dialed / reached / ja_to_sim) |
| 3 Simulation | `proof_pages` (erstellt + sim_sent-Event) |
| 4 Gesehen | `proof_pages.view_count > 0` |
| 5 Verkaufsgespräch | `journey_events` (warm_call) |
| 6 Aufbau | `cockpit_sessions.status` = building |
| 7 Go-live | `cockpit_sessions.status` = live / `tenants` converted |
| 8 Begleitung | post-live (`tenants` + weekly_report) |

---

## 3. Inhaber-Connection (offener Task gelöst durch das Fundament)

`leads.entscheider` (+ abgeleitete Anrede) ist der Ursprung. Beim Bauen der
Beweis-Seite wird er nach `proof_pages.contact_name`/`contact_salutation`
übernommen; E-Mail-Greeting und Cockpit lesen denselben Ursprung. Ein Name,
eine Quelle — „Grüezi Herr X" in Seite und Mail stammt aus derselben Connection.

---

## 4. Phasen

- **Phase 0 — Bauplan + Architektur.** DONE (dieses Dokument).
- **Phase 1 — Daten-Fundament. DONE (19.06.).**
  - Migration `20260619000000_customer_journey.sql` auf Remote-DB angewendet:
    `leads` (425 Zeilen importiert), `journey_events` (append-only),
    `lead_id`-Spalten auf `proof_pages` + `cockpit_sessions`. Alles RLS-no-policy.
  - Import via `scripts/_ops/sync_leads_to_db.mjs` (CSV → DB, Upsert per place_id,
    nie löschend). Verteilung: Ring 0/1/2 = 23/6/396; HOT/WARM/COLD = 38/89/298.
  - Track-Route schreibt beim First-View ein `proof_viewed`-Event (Stern 3→4).
  - Ergebnis: Funnel-Wurzel liegt in der DB, CC kann sie lesen.
  - **Übergang (bewusst):** CSV bleibt vorerst Arbeits-Wahrheit (Lead-Motor
    unverändert); `sync_leads_to_db` hält die DB frisch. Der Flip „DB = SSOT,
    CSV = Export" passiert in Phase 2, sobald das Tool die CSV-Bearbeitung ersetzt
    — sonst verliert der Founder seinen Sales-Workflow vor dem Ersatz.
  - **Offen (nach Phase 2):** `proof_pages.lead_id` der Welle-1-Seiten backfillen
    (Slug↔Lead-Match), damit „Gesehen" rückwirkend an den Leads hängt.
- **Phase 2 — Tool auf den Server, Stern für Stern. IN ARBEIT.**
  - **Tranche 1 (DONE 19.06.):** `/ceo/journey` lebt in der CEO-App (Nav „Journey"
    an Position 2; alte broken `/ceo/pipeline` aus der Nav entfernt). API:
    `GET /api/ceo/journey` (Funnel aus leads + journey_events + proof_pages +
    cockpit_sessions), `PATCH /api/ceo/journey/lead` (Inline-Edit), `POST
    /api/ceo/journey/event` (Outcome → Funnel-Signal). UI (`JourneyView.tsx`,
    hell, Navy/Gold): Funnel-Dashboard + Stern-Navigation; Stern 1 Kontaktliste
    DB-gestützt mit Inline-Edit (Inhaber/Größe/Mail) + Outcome-Buttons; Stern 2
    Cold Call (Übersicht/Live/Drill, Wortlaut 1:1 aus `coldCallScript.ts`).
    Stern 3–8 vorerst Info-Panels. TS sauber, neue Dateien ESLint-sauber.
  - **Tranche 2a (DONE 19.06.):** Stern 5 warmes Verkaufsgespräch als Hub —
    Übersicht/Live (Phasen-Stepper 1–9) + Drill (Einwand-Katalog 7.1–7.28).
    Wortlaut 1:1 aus `warmCallScript.ts` (eingefroren, Version 1). Stern-5-Kachel
    öffnet jetzt den Hub statt eines Info-Panels. TS + ESLint sauber, Smoke grün.
  - **Tranche 2b (DONE 19.06.):** alte `/ceo/pipeline` (Trial-Modell, 500,
    ungenutzt) entfernt — Seite + API + `PipelineView` gelöscht (Journey ist der
    kanonische Funnel). `proof_pages.lead_id`-Backfill gelaufen
    (`backfill_proof_lead_ids.mjs`, 16/18 Seiten an Lead verknüpft, Präfix-Match
    eindeutig). Sterne 3/4/6/7/8 sind jetzt echte Listen (versandte Simulationen,
    Gesehen mit View-Count, Cockpit-Sessions) statt Info-Panels — API liefert
    `proofs` + `cockpits`. `sync_leads_to_db` mit `--bootstrap`-Riegel geschützt
    (DB ist SSOT; voller CSV-Upsert würde Tool-Edits überschreiben).
  - **Tranche 2c (offen — bewusster Stopp):** Lead-Motor-Flip. `build_leads`
    soll DB-autoritativ werden (Founder-Spalten aus DB bewahren, Maschinen-Spalten
    aus dem Crawl mergen, CSV als Export schreiben). Braucht den echten
    Scout-Zyklus des Founders zum Verifizieren — nicht blind umbauen, sonst
    Risiko für den Lead-Crawl. Bis dahin: Tool-Edits sind via Riegel sicher.
  - **Augen offen:** Vorbestehender ESLint-Fehler `CeoShell.tsx:97`
    (`react-hooks/set-state-in-effect`, neue Regel) — codebase-weit, separat von
    diesem Projekt; ggf. eslint-Config-Severity klären, nicht per Datei flicken.
- **Phase 3 — Daily-Driver.** Mobil, Ritual „Sales-Maschine go" integriert,
  „Ja → Pipeline-Trigger" automatisiert.

Code läuft auf einem eigenen Feature-Branch, Merge via PR (Founder-Review).

---

## 5. Augen-offen-Protokoll (laufende Funde)

- `/ceo/pipeline` wirft HTTP 500 und wird vom Founder nicht genutzt — beim
  Absorbieren prüfen/entfernen (Phase 2).
- Lead-Daten heute dreifach (leads.csv · HTML-Hardcode `LEADS_TG` · localStorage)
  — wird durch das DB-Fundament aufgelöst.
- `customer_journey.html`: tote Konstanten (`FUNNEL`/`GOALS` werden nie gerendert);
  Funnel-Stufen unter „Ja" hart auf 0; Inhaber/Größe/Mail/Services nur localStorage.
- Stage-Konstanten in `ceo/pipeline/route.ts` lokal dupliziert — bei Bedarf in
  ein gemeinsames Modul ziehen statt erneut kopieren.
- 265 untracked Log-Artefakte im Repo-Root (Hygiene, unabhängig vom Projekt).

---

## 6. Pflege-Regel

- Bible bleibt Orchestrator/SSOT der Reise; dieses Dokument trägt das Bau-Detail;
  `ticketlist.md` bleibt der einzige Task-Tracker. Keine Doppelpflege.
- Ein Fakt, ein Ort. Ändert sich eine Architektur-Entscheidung, hier zuerst.

Verlinkt: CUSTOMER_JOURNEY_BIBLE · PIPELINE_BIBLE · SALES_BIBLE · ONBOARDING_BIBLE
