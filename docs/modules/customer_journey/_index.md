# Modul: Customer Journey

> Teil der [FlowSight Bible](../../flowsight_bible.md). Das Modul mit innerer
> Hierarchie: **8 Sterne, ein Schwungkreis** (Kontakt → Begleitung → zurück zu Kontakt).

## Dach (SSOT)

Die Wahrheit über die Journey lebt kanonisch in der
**[Customer Journey Bible](../../gtm/CUSTOMER_JOURNEY_BIBLE.md)** — Zweck,
Konversions-Ereignis, Owner und Kennzahl je Stern, plus ICP/Preis-Anker und das
Schwungkreis-Modell. Diese Karten **duplizieren das nicht**; sie sind die
**Arbeitsräume** je Stern (offene Arbeit, Detail-Quellen, Dateibereich für
Parallel-Arbeit) und zeigen für stabile Fakten auf die Bible.

## Der Schwungkreis

```
        8 Begleitung & Wert ── (Referenz) ──► 1 Kontakt
       ▲                                               │
   7 Go-live & Vertrag                            2 Cold Call
       ▲                                               │
   6 Cockpit                                      3 Simulation
       ▲                                               │
   5 Verkaufsgespräch ◄──────────────────────── 4 Gesehen
```

Sales klammert die Pipeline: verkauft wird **kalt bei Stern 2** und **warm bei
Stern 5**; dazwischen (3 + 4) arbeitet die Pipeline still im Hintergrund.

## Region (führend) & Steuerung

- **Führende Region: Thurgau** (letzter Stand). Die Stern-1-Kontaktliste lebt operativ
  in **`/ceo/journey`** (`JourneyView`, DB-gestützt = SSOT). `docs/sales/leads.csv` (Zürichsee)
  ist **nicht** die SSOT der heutigen Liste — die `leads`-DB-Tabelle ist es.
- **Von Monitor UND Handy steuerbar.** Schwungkreis + alle 8 Sterne sind
  **Handymodus-fähig** (responsive). Regel für jede neue Stern-Fläche: am Handy bedienbar
  bleiben (Kontaktliste → Karten, fingerfreundliche Dispositions-Tipps).

## Durchtrage-Logik — die 3 Spines (Metaebene)

Durch die ganze Reise laufen drei Stränge. Jede Stern-Karte hängt daran:

1. **Identität** — wächst `place_id → tenant_id`. Ein Betrieb ist über die ganze Reise
   *dasselbe* Objekt, das nur reicher wird (Lead → Tenant). Alles hängt an diesem Faden.
2. **Konfiguration** — `tenant_config` = die technische Through-Line (Journey-Bible §5):
   in Stern 1/3 aus dem Crawl *abgeleitet* → in Stern 5 *angereichert* → in Stern 6
   *bestätigt* (confirm-not-create) → in Stern 7 *scharfgeschaltet* (DB + Retell).
3. **Status / Funnel-Signal** — jeder Stern emittiert *ein* heiliges Konversions-Ereignis:
   `Wählversuche → Erreicht → Ja → Gesehen → Warmes Gespräch → Onboarding → Kunde`.

**Meta-Mechanismus: die Reise = progressives Härten von Unsicherheit (`?`-Regel).**
Ein Feld startet als `?` und wird erst an dem Stern verifiziert, wo ein Mensch es
bestätigt — **nie vorher geraten** (eine Fehlinfo verbrennt am Erstkontakt mehr Vertrauen
als ein ehrliches `?`):

| Feld | startet | gehärtet in … | wodurch |
|---|---|---|---|
| **Inhaber-Name** | `?` | **Stern 1** | Founder prüft die Liste gegen + klärt vor dem ersten Call — Pflicht |
| **Größe/MA** (= Preis-Schalter) | `?` | **Stern 1** | muss *immer* rausgefunden werden (Founder-Gegenprüfung) — Pflicht |
| **E-Mail** | `?` | **Stern 2** | Inhaber nennt sie im Cold Call → verifizierte Empfänger-Wahrheit |
| **Pain/Schmerz** | Hypothese (Haken) | **Stern 5** | selbst-entdeckt im Discovery (nie präsentiert) |

**Stern 1 härtet sich vorne, durch Founder-Input — nicht durch Rückkopplung aus späteren
Sternen.** Inhaber + Größe werden am Anfang *immer* persönlich gegengeprüft und die `?`
geklärt; so wird die Liste von Mal zu Mal besser. Einzig die E-Mail darf bis zum „Ja"
(Stern 2) offen bleiben. Der Mensch klärt vorne — die Maschine rät nie.

## Was von Stern zu Stern wandert

| Übergang | inhaltlich / fachlich / technisch |
|---|---|
| **1 → 2** | Firma + **Inhaber-Name** (→ `[Name]`) + **Gewerk** (→ `[Gewerk]`, via `gewerkPhrase()`) + Tarif-Hypothese + **Haken** (A/B/C/D). Tech: `BIZ={firma,name,gewerk}` ins Skript injiziert. |
| **2 → 3** | das **„Ja"** (Trigger) + **verifizierte Mail** + Kanal. Erst dieses Ja zündet die teure Pipeline (Ökonomie-Umkehr). Tech: Lead-Record → `tenant_config`-Seed. |
| **3 → 4** | der **`/p/[token]`-Link** + scharfes Tracking (view=0). Tech: `proof_pages`-Row, Bunny-GUIDs, Resend-Versand. |
| **4 → 5** | das **Gesehen-Signal + Watch-Tiefe** = *wie warm* → priorisiert den warmen Rückruf. Bleibt **intern** — nie als Prüf-Frage an den Prospect („angeschaut?/gefallen?" = Kontrollfreak, S10). |
| **5 → 6** | die **Zusage** + Discovery (Pain, Größe→Preis, Wunschtermin/Rückmelde OC8). Tech: füllt `tenant_config` ~70 % vor. |
| **6 → 7** | die **review-fertige Config** (Lisa, Dispositionen, Leitsystem gebaut). Tech: Cockpit-Session → DB. |
| **7 → 8** | der **zahlende Kunde** + live `tenant_id` + scharfe Config (Retell published). |
| **8 → 1** | die **Referenz** → schließt den Kreis: neuer Lead in Stern 1 *und* Social Proof für Stern 2/5. |

## Ziel-Architektur (die 4 Hebel — Phase 2)

Heute trägt *nichts* die Identität durch; jeder Stern hat seinen eigenen Topf
(localStorage + `leads.csv` + `proof_pages` + `tenant_config`). Die Richtung:

1. **Ein Durchtrage-Record** statt vier getrennter Flächen — Schlüssel `place_id → tenant_id`,
   den jeder Stern liest/schreibt (das „raus aus localStorage" aus dem STATUS).
2. **Konversions-Ereignis schreibt zurück** in diesen Record → der Funnel wird *echt*,
   nicht browser-lokal.
3. **Feld-Provenance** mitführen (`?` / gecrawlt / mensch-verifiziert + wann) → die
   `?`-Härtung wird nachvollziehbar, nicht nur Konvention.
4. **Loop 8→1 explizit machen:** ein Referenz-Feld, damit eine Weiterempfehlung real einen
   neuen (vorgewärmten) Lead in Stern 1 sät — sonst bleibt der Schwungkreis nur ein Bild.

## Die 8 Sterne (Arbeitsräume)

| Stern | Karte | Abschnitt |
|---|---|---|
| 1 — Kontakt | [→](stern_1_kontakt.md) | Sales |
| 2 — Cold Call | [→](stern_2_cold_call.md) | Sales |
| 3 — Simulation | [→](stern_3_simulation.md) | Pipeline |
| 4 — Gesehen | [→](stern_4_gesehen.md) | Pipeline → Sales |
| 5 — Verkaufsgespräch | [→](stern_5_verkaufsgespraech.md) | Sales |
| 6 — Cockpit | [→](stern_6_cockpit.md) | Onboarding |
| 7 — Go-live & Vertrag | [→](stern_7_go_live.md) | Onboarding |
| 8 — Begleitung & Wert | [→](stern_8_begleitung.md) | Onboarding → Sales |

## Parallel-Arbeit

Die Sterne teilen sich heute Quell-Dateien (v. a. `gtm/sales/SALES_BIBLE.md`).
Damit zwei Sterne **echt parallel** laufen, gilt: in der jeweiligen Stern-Karte
arbeiten, nicht gleichzeitig in derselben Quell-Bible. Die Bible bleibt der
SSOT-Anker, die Stern-Karte der Arbeitsraum.
