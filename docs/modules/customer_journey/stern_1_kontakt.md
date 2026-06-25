# Stern 1 — Kontakt

> Arbeitsraum. Stabile Fakten (Zweck/Konversion/Owner/Kennzahl) sind SSOT in der
> [Customer Journey Bible §3](../../gtm/CUSTOMER_JOURNEY_BIBLE.md). Durchtrage-Logik
> + `?`-Härtung: [`_index.md`](_index.md). **Abschnitt: Sales.**

## Durchtrage-Kopf (REIN · HIER · RAUS)

- **REIN (Schleife von Stern 8):** Referenz/Weiterempfehlung wird ein neuer Lead — läuft
  **immer durch Stern 1**, weil du zuerst den Überblick über den Betrieb brauchst.
- **HIER gehärtet (Pflicht):** **Inhaber + Größe** — Founder-Gegenprüfung. `?` ist nie das
  Endergebnis; was der Crawl nicht sicher findet, klärst du persönlich, bevor gewählt wird.
- **RAUS (an Stern 2):** qualifizierter Betrieb auf der Tagesliste + **Inhaber-Name** +
  **Gewerk** + **Haken** → anrufen. Einzig die **E-Mail** darf `?` bleiben (wird im „Ja"
  des Cold Calls verifiziert).

## Zweck & Konversion

- **Zweck:** Lead-Liste füllen + kurz gegenchecken (Website), bevor gewählt wird. Funnel-Einstieg.
- **Konversions-Ereignis:** Betrieb steht **qualifiziert** auf der Tagesliste → anrufen.
- **Kennzahl:** Wählversuche.

## Das „go customer Journey" / „Go Schwungrad"-Ritual

Trigger-Wörter des Founders. Mein Zeichen, die Maschine anzukurbeln — **es beginnt immer
mit dem Crawlen der Betriebe**:

1. **Scope laden** (ICP · Region · Reihenfolge — unten).
2. **Crawlen:** pro Betrieb die 10 Spalten füllen. **Was nicht sicher ist, bleibt `?` — nie
   geraten.** Eine falsche Nummer/Mail/MA-Zahl ist schlimmer als ein ehrliches `?`.
3. **Upsert in die `leads`-DB** → erscheint live in `/ceo/journey` (Monitor *und* Handy).
4. **Founder-Gegenprüfung:** **Inhaber + Größe** klären (Pflicht), `?` auflösen. So wird die
   Liste von Mal zu Mal besser — der Mensch härtet vorne.
5. **Bereit für Cold Call** (Stern 2).

### Crawl-Scope (aktuell)

- **ICP:** Sanitär, zweistufig — **Solo 1–3 MA** / **Premium 4–15 MA** (kanonisch
  [SALES_BIBLE §3](../../gtm/sales/SALES_BIBLE.md)). **>15 MA = DQ.**
- **Region:** **Thurgau** (Lernphase — s. „Warum Thurgau"). Kanton autoritativ am Lead
  (`kanton` aus Google `addressComponents`) → keine Homonym-Verwechslung (Wetzikon TG/ZH).
- **Reihenfolge (census-first):** **Vollerfassung** des Kantons zuerst — ALLE Sanitär-Betriebe
  (alle Größen) parken, Größe bleibt `?`, kein Crawl. Dann segmentweise **Anreichern**
  (Inhaber/Mail/Größe) + abarbeiten. So steht die komplette Landkarte, bevor man später
  4–15-Mann hochfährt. (Gezielter Modus „1–3 jagen" findet+crawlt N kleine Betriebe sofort.)
  Bedienung: [STERN_1_RUNBOOK](../../gtm/sales/STERN_1_RUNBOOK.md).

### Die 10 Spalten (Kontaktliste — Spec; Implementierung: `/ceo/journey`)

`# · Firma · Inhaber · Größe · Leistungen · Website prüfen · Telefon · E-Mail · Status · Aktion`

- **Editierbar** (DB-gespeichert via `/api/ceo/journey/lead`): Inhaber, Größe, E-Mail, Leistungen.
- **Aktion:** `▶ Cold Call` + Dispositionen `∅ kein Anschluss · ↻ Rückruf · ✕ abgelehnt
  (2 Mt gesperrt) · ✓ Ja`. Status + Funnel füllen sich aus den geloggten Calls.
- **`?`-Disziplin** im Code verankert (Inhaber/Größe/Mail/Leistungen: „nie raten — leer = offen").

### Größen-differenzierte Positionierung (gleiches Produkt, anderer Painpoint)

- **Solo 1–3 MA:** Inhaber = alles, Telefon einziger Kanal → **Erreichbarkeits-Pain max**.
  Haken A: „Wer fängt die Anfrage, wenn Sie grad im Schacht sind?"
- **Premium 4–15 MA:** Büro da, fällt trotzdem durch → **operative Komplexität / Steuerbarkeit**.
  Haken B: „Was reinkommt, bleibt sichtbar, priorisiert, nachvollziehbar."

Das Leitsystem ist dasselbe — die **Darstellung** richtet sich nach Größe (Haken-Matrix
[SALES_BIBLE §11](../../gtm/sales/SALES_BIBLE.md)).

## Warum Thurgau (Lernphase)

Übungsgelände, wo ein vergraulter Betrieb wenig kostet — **nicht** das Ring-0-Heimatrevier
(dort sitzt die lokale Nähe *und* das Referenz-Gold). Erst den Pitch im Thurgau schärfen
(Modus LERNEN, [SALES_BIBLE §10](../../gtm/sales/SALES_BIBLE.md)), dann poliert nach Ring 0.
**Opener-Folge:** im Thurgau trägt „Gunnar Wende aus Oberrieden" nicht → Nähe-Hebel raus,
Wert/Haken führt; lokale Nähe kommt mit Ring 0 zurück.

## Kanonische Quelle (SSOT)

- [SALES_BIBLE](../../gtm/sales/SALES_BIBLE.md) — ICP (§3), Region (§4), Abend-Ritual (§1).
- Operatives Tool (SSOT): **`/ceo/journey`** (`src/web/src/components/ceo/JourneyView.tsx`) — DB-gestützte Stern-1-Kontaktliste + Schwungrad + Cold-Call, auth-geschützte PWA (Handy + Desktop). *Die frühere `customer_journey.html` (Prototyp, localStorage) wurde abgelöst und entfernt.*
- **Datenform (SSOT):** [Leads-Contract](../../architecture/contracts/leads_contract.md) — Schema der `leads`-Tabelle, Hoheits-Regel (Daten=Maschine / Status=Founder), `place_id`-Upsert, ICP-Gate, `kanton`.
- **Lead-Motor (Bedienung):** [STERN_1_RUNBOOK](../../gtm/sales/STERN_1_RUNBOOK.md) — Go (jagen/Vollerfassung) · Anreichern · Gegenprüfung · Purge. Code: `discover_targeted.mjs`, `scout.mjs`+`discover_to_leads.mjs`, `crawl_to_leads.mjs` (additiver Merge), `enrich_new_leads.mjs`, `_geo_icp.mjs`/`_anrede.mjs`. *(`build_leads.mjs`/`leads.csv`/`todays_list.mjs`/`enrich_leads.mjs` = Legacy aus der CSV-Ära, abgelöst durch die DB-Pipeline.)*
- Existenz-Validierung: [lessons_learned_sales](../../gtm/sales/lessons_learned_sales.md) („Google-Maps ≠ Existenzbeweis").

## Dateibereich (Parallel-Konflikt-Regel)

- **Besitzt:** diese Karte + die Stern-1-Fläche in `JourneyView` (`/ceo/journey`) + `docs/sales/` (leads, crawl) + Lead-Motor-Scripts.
- **Kollidiert mit:** Stern 2 + 5 (teilen sich `SALES_BIBLE.md`) → nicht gleichzeitig in der SALES_BIBLE schreiben.

## Offen / nächster Schritt

- **Nordstern-Takt:** täglich 20 Betriebe kontaktierbar — Lead-Nachschub Thurgau (census-first).
- **Erledigt:** DB-Fundament (`leads` = SSOT) · additiver Merge (nur neue `place_id`, Founder-Felder
  geschützt — `crawl_to_leads`/`discover_to_leads`) · Größen-Tabs vollständig (`?`-Tab) ·
  Vollerfassungs- + Anreichern-Knopf · `kanton` autoritativ am Lead.
- **Offen:** Thurgau-Vollerfassung anreichern (Inhaber/Mail/Größe) → Gegenprüfung; **425 Alt-Crawl-Leads
  bereinigen** (`purge.yml`, Dry-Run zuerst); Lauf-Status in der App statt Actions-Log (v2).
