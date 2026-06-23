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
- **Region:** **Thurgau** (Lernphase — s. „Warum Thurgau").
- **Reihenfolge:** **Gemeinde für Gemeinde** — eine PLZ/Ort komplett crawlen + abarbeiten,
  dann die nächste benachbarte (geografische Welle).

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
- Lead-Motor: `build_leads.mjs` → `docs/sales/leads.csv`, `todays_list.mjs`, `enrich_leads.mjs`.
- Existenz-Validierung: [lessons_learned_sales](../../gtm/sales/lessons_learned_sales.md) („Google-Maps ≠ Existenzbeweis").

## Dateibereich (Parallel-Konflikt-Regel)

- **Besitzt:** diese Karte + die Stern-1-Fläche in `JourneyView` (`/ceo/journey`) + `docs/sales/` (leads, crawl) + Lead-Motor-Scripts.
- **Kollidiert mit:** Stern 2 + 5 (teilen sich `SALES_BIBLE.md`) → nicht gleichzeitig in der SALES_BIBLE schreiben.

## Offen / nächster Schritt

- **Nordstern-Takt:** täglich 20 Betriebe kontaktierbar — Lead-Nachschub Thurgau, Gemeinde für Gemeinde.
- DB-Fundament steht (`leads`-Tabelle = SSOT, `/api/ceo/journey`). Nächster Schritt: go-Crawl schreibt **nur neue `place_id`** dazu, ohne Tool-Edits zu überschreiben (s. `sync_leads_to_db.mjs`).
