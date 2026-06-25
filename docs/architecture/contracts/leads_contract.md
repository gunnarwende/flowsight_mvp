# Leads Contract (SSOT) — darf nicht driften

Diese Datei definiert die SSOT-Form des **Lead-Objekts** (Top-of-Funnel, Stern 1).
Pendant zu [`case_contract.md`](case_contract.md), nur eine Stufe früher: der Case ist
eine *eingegangene Kundenanfrage*, der Lead ist ein *noch nicht kontaktierter Betrieb*.

Alle Producer (Discovery/Crawl/Enrichment) und Consumer (`/ceo/journey`, Cold-Call-Logik,
Audit) müssen exakt an dieser Form ausrichten.

- **Tabelle:** `leads` (Supabase). Migrationen: `20260619000000_customer_journey.sql`
  (Wurzel) + `20260625000000_leads_kanton.sql` (`kanton`).
- **Sichtbarkeit:** RLS aktiviert, **bewusst KEINE Policies** → die komplette Lead-Liste
  bleibt founder-privat, Zugriff ausschliesslich über `getServiceClient()` (CEO-App-Server
  + CLI-Scripts). Niemals client-seitig lesbar.
- **Natürlicher Schlüssel:** `place_id` (Google Places). UNIQUE → **Upsert-Identität**.
  Jeder Producer matcht auf `place_id`; nie blind inserten, nie Duplikat anlegen.

## Hoheits-Regel (wer darf welche Spalte schreiben)

Die wichtigste Invariante. Der Lead-Motor (Discovery/Crawl/Enrichment) und der Founder
teilen sich die Zeile **konfliktfrei**, weil jede Spalte genau einen Besitzer hat:

| Klasse | Besitzer | Schreibt | Überschreibt der Lead-Motor? |
|---|---|---|---|
| **Daten-Spalten** | Maschine (Scout/Crawl/Enrich) | abgeleitete Fakten | ja — additiv, leere Felder werden gefüllt |
| **Status-Spalten** | Founder | Disposition/Verlauf | **NIE** — vom Lead-Motor unangetastet |

> Konsequenz: ein Re-Crawl oder erneutes „Anreichern" darf `status`, `notiz`,
> `letzter_kontakt`, `naechster_schritt`, `naechster_am` **niemals** berühren. Durchgesetzt
> in `crawl_to_leads.mjs` / `discover_to_leads.mjs` (Match `place_id` → Founder-Felder
> geschützt → nur leere Daten-Felder gefüllt).

## Daten-Spalten (Maschine — aus Scout / Crawl / Override abgeleitet)

| Spalte | Typ | Bedeutung |
|---|---|---|
| `place_id` | text, UNIQUE, NOT NULL | Google-Places-ID = Upsert-Schlüssel |
| `firma` | text, NOT NULL | Firmenname |
| `ort` | text | Gemeinde (Anzeige) |
| `plz` | text | PLZ |
| `kanton` | text | **Autoritativer Kanton** aus Google `addressComponents` (admin_area_level_1), beim Discovery geschrieben. Trennt Homonyme (Wetzikon/Eschlikon/Berg liegen in TG *und* ZH) — das Audit liest den Kanton direkt statt ihn aus `ort` abzuleiten. |
| `ring` | text | `0` Vor-Ort / `1` Telefon / `2` Kanton (Region-Nähe, [SALES_BIBLE §4](../../gtm/sales/SALES_BIBLE.md)) |
| `ma_proxy` | text | Größen-Proxy (`"2"`, `"?"`, `"klein?"`). Roh; die UI leitet daraus den Größen-Tier ab (s. u.) |
| `tariff` | text | `Solo (950)` / `Premium (2000)` / `TBD` / `DQ` |
| `inhaber_am_telefon` | text | Leitsignal: `ja` / `nein` / `teils` / `?` |
| `entscheider` | text | **Inhaber-/Entscheider-Name** — DIE Quelle für die Anrede. Format: `Herr/Frau Nachname` (kein Vorname), erzeugt über [`_anrede.mjs`](../../../scripts/_ops/_anrede.mjs) |
| `rolle` | text | z. B. `GL Sanitär & Heizung` |
| `mail` | text | E-Mail (darf bis zum Cold-Call-„Ja" `?`/leer bleiben) |
| `telefon` | text | Telefon |
| `website` | text | **Eigene, prüfbare Website. ICP-Pflicht** — Betriebe ohne eigene Website oder nur mit Verzeichnis-Link sind KEIN ICP und werden nie erfasst (s. „ICP-Gate") |
| `rating` | numeric | Google-Rating (z. B. `4.9`) |
| `reviews` | integer | Google-Review-Anzahl |
| `icp_score` | integer | Score des Scout-Modells (Sortierachse; „starke Reviews + schwache Website = hoch") |
| `tier` | text | `HOT` / `WARM` / … |
| `signale` | text | Trust-/Gap-Signale (Freitext) |

## Status-Spalten (Founder — vom Lead-Motor NIE überschrieben)

| Spalte | Typ | Bedeutung |
|---|---|---|
| `status` | text, default `neu` | `neu` / `kontaktiert` / `ja` / `abgelehnt` / … |
| `letzter_kontakt` | date | letzter Wählversuch |
| `naechster_schritt` | text | nächste Aktion |
| `naechster_am` | date | Termin der nächsten Aktion |
| `notiz` | text | Founder-Notiz |

## System-Spalten (read-only)

| Spalte | Typ | Bedeutung |
|---|---|---|
| `id` | uuid, PK | Primärschlüssel (Join-Achse für `proof_pages`/`cockpit_sessions`/`journey_events`) |
| `created_at` | timestamptz | auto |
| `updated_at` | timestamptz | auto |

**Indizes:** `idx_leads_status (status)` · `idx_leads_ring_score (ring, icp_score DESC)`.

## Abgeleitete Felder (kein DB-Spalte — nur Anzeige)

- **Größen-Tier** (`/ceo/journey`-Tabs `1–3 · 4–15 · >15 · ?`): aus `ma_proxy` in
  `JourneyView.tsx` abgeleitet, **nicht persistiert**. `?` = Größe noch offen (z. B. nach
  Vollerfassung ohne Crawl). Die vier Tabs partitionieren „Alle" vollständig.

## ICP-Gate (HART — durchgesetzt im Discovery, nicht im Doc)

Ein Betrieb wird **nur dann** als Lead erfasst, wenn er beide Tore passiert:

1. **Eigene, prüfbare Website** — kein Verzeichnis-/Branchenbuch-Link (yellow.ch, local.ch,
   search.ch, Facebook, Instagram, LinkedIn, business.site, wixsite/jimdo-free …).
   Durchgesetzt via `usableWebsite()` / `DIRECTORY_HOSTS`.
2. **Sanitär-Gewerk + richtiger Kanton** — Branche und Region sauber. Hard-Non-Sanitär
   (Schreiner/Maler/Gipser/Elektriker/Gärtner …) wird abgewiesen; der Kanton muss exakt der
   gewählte sein (autoritativ via `kanton`). Durchgesetzt in
   [`_geo_icp.mjs`](../../../scripts/_ops/_geo_icp.mjs) (`isLikelyNonICP`, `kantonMatchesTarget`).

## Funnel-Log: `journey_events` (append-only)

Tabelle `journey_events` — macht den Funnel echt + maschinenlesbar. Append-only, nie updaten.

| Spalte | Typ | Bedeutung |
|---|---|---|
| `id` | uuid, PK | |
| `lead_id` | uuid | FK → `leads(id)` ON DELETE CASCADE (Hauptachse) |
| `tenant_id` | uuid | FK → `tenants(id)` ON DELETE SET NULL (Post-Conversion) |
| `proof_token` | text | Beweis-Seite (Artefakt-Ereignisse) |
| `event_type` | text | s. u. |
| `payload` | jsonb, default `{}` | Strukturdaten |
| `source` | text, default `manual` | `manual` / `track` / `script` |
| `occurred_at` | timestamptz | auto |
| `created_at` | timestamptz | auto |

Event-Typen (Funnel-Kette): `call_dialed` · `call_reached` · `call_no_answer` ·
`ja_to_sim` · `sim_built` · `sim_sent` · `proof_viewed` · `warm_call` ·
`cockpit_started` · `cockpit_submitted` · `go_live`.

## Join-Achse (Lead → Simulation → Cockpit → Tenant)

`proof_pages.lead_id` und `cockpit_sessions.lead_id` (beide nullable, FK → `leads(id)`
ON DELETE SET NULL) verbinden den Lead mit seiner Beweis-Seite (Stern 3) und seinem
Onboarding-Cockpit (Stern 6). So ist die ganze Reise von einem Lead aus traversierbar.

## Producer / Consumer (wer berührt die Tabelle)

- **Producer:** `discover_targeted.mjs` (Go/Vollerfassung), `scout.mjs` + `discover_to_leads.mjs`
  (Einzel-Ort), `crawl_to_leads.mjs` (additiver Merge nach Crawl), `enrich_new_leads.mjs`
  (Anreichern). Betrieb/Befehle: [`STERN_1_RUNBOOK.md`](../../gtm/sales/STERN_1_RUNBOOK.md).
- **Consumer:** `/ceo/journey` (`JourneyView.tsx` + `app/api/ceo/journey/*`),
  `analyze_leads.mjs` (Audit), Cold-Call-Disposition.
- **Bereinigung:** `purge_stale_leads.mjs` / `purge.yml` (Dry-Run zuerst — schützt aktive,
  gepflegte Leads).
