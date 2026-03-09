# Provisioning Runbook — Prospect → Outreach-Ready (<25 Min)

**Erstellt:** 2026-03-09 | **Owner:** CC
**Referenz:** `docs/gtm/gtm_pipeline_plan_v2.md` (Abschnitt 9 — G3)
**Validiert durch:** Weinberger AG Goldstandard (ICP 90+, A+B+C+D)

---

## Voraussetzungen

- [ ] Prospect Card existiert: `docs/customers/<slug>/prospect_card.json`
- [ ] ICP Score ≥ 6 (WARM oder HOT)
- [ ] Leckerli-Empfehlung bestimmt (aus Einsatzlogik)
- [ ] `.env.local` vorhanden mit Retell + Supabase Keys

---

## Schritt 1: Website (Leckerli D) — ~15 Min

### 1a. Crawl

```bash
node scripts/_tools/crawl-website.mjs \
  --url https://www.<domain>.ch \
  --slug <slug> \
  --output .crawl-images/<slug>
```

**Fallback bei JS-heavy Sites (Elementor/WordPress):**
- Crawl liefert nur Bilder, kein Text
- Text-Daten aus Verzeichnissen: local.ch, search.ch, handwerker.ch, daibau.ch, sanitaervergleich.ch
- Team-Daten aus LinkedIn (nur verifizierte Personen)

**Output:** `.crawl-images/<slug>/` mit Bildern

### 1b. Bilder sortieren

```
src/web/public/kunden/<slug>/
  <service-slug>/01.ext, 02.ext, ...
```

- Max 4-5 Bilder pro Service
- Dateiendung EXAKT wie gecrawlt (.webp, .jpeg, .png — NICHT umbenennen)
- Visuell prüfen: keine Duplikate, keine Logos als Service-Bilder

### 1c. Customer Config erstellen

Datei: `src/web/src/lib/customers/<slug>.ts`

```typescript
import type { CustomerSite } from "./types";
const IMG = "/kunden/<slug>";
export const <camelCase>: CustomerSite = { /* ... */ };
```

**Checkliste:**
- [ ] Alle Services aus Prospect Card (`verified: true`)
- [ ] Alle Bild-Pfade matchen tatsächliche Dateien
- [ ] `contact`, `emergency`, `reviews` aus verifizierten Quellen
- [ ] `history` nur wenn Gründungsjahr verifiziert
- [ ] `team` nur verifizierte Personen mit Quelle
- [ ] `careers` nur wenn Lehrstellen nachweisbar

### 1d. Registry eintragen

Datei: `src/web/src/lib/customers/registry.ts`

```typescript
import { <camelCase> } from "./<slug>";
// In customers object:
"<slug>": <camelCase>,
```

### 1e. Build + Verify

```bash
cd src/web && npx next build
# Prüfen: /kunden/<slug> in Static-Output
```

### 1f. Docs erstellen

- [ ] `docs/customers/<slug>/links.md` (PFLICHT)
- [ ] `docs/customers/<slug>/status.md`

---

## Schritt 2: Voice Agent (Leckerli B) — ~10 Min

### B-Full (ICP 90+)

#### 2a. Template kopieren + anpassen

Basis: `retell/exports/brunner_agent.json` (Master-Template)

Ersetzen:
1. **FIRMEN-WISSEN Block** im `global_prompt` — komplett ersetzen mit Prospect-Daten
2. **Node-Texte** (Begrüssung, Info-Modus) — Firmenname, E-Mail, Kategorien
3. **post_call_analysis** — Kategorien anpassen an Services
4. **agent_swap Platzhalter** — INTL Agent-ID nach Erstellung

**Goldene Regel:** Grep nach altem Firmennamen → 0 Treffer = OK

#### 2b. Sync + Publish

```bash
node --env-file=src/web/.env.local scripts/_ops/retell_sync.mjs \
  --prefix <slug> \
  retell/exports/<slug>_agent.json \
  retell/exports/<slug>_agent_intl.json
```

**Output:** Agent IDs in `retell/agent_ids.json`

#### 2c. Verify

- [ ] `is_published: true` für DE + INTL Agent
- [ ] Agent IDs in `retell/agent_ids.json` eingetragen
- [ ] Greeting korrekt (Firmenname, KI-Disclosure)
- [ ] Kategorien matchen Services

### B-Quick (ICP 60-89)

> Noch nicht implementiert (G2). Wird ein parametrisierter Universal-Agent mit Dynamic Variables.

---

## Schritt 3: Twilio-Nummer zuweisen — ~2 Min

```bash
# Via Twilio Console oder API:
# 1. Neue Nummer kaufen oder bestehende zuweisen
# 2. Voice → SIP Trunk → Retell Agent ID (DE)
# 3. Testen: Anruf → Greeting hören
```

---

## Schritt 4: Tenant in Supabase (Leckerli C) — ~3 Min

> Nur für E2E Proof (C) nötig. Nicht für D-only oder B+D.

```bash
node --env-file=src/web/.env.local scripts/_ops/onboard_tenant.mjs \
  --name "<Firmenname>" \
  --slug <slug> \
  --phone "<E.164 Nummer>" \
  --modules voice,website_wizard,ops,reviews
```

**Verify:** Tenant in Supabase → Wizard funktioniert → Case landet in Ops

---

## Schritt 5: Pipeline Tracker Update — ~1 Min

`docs/sales/pipeline.csv` — Zeile aktualisieren:

```
status → DEMO
demo_url → flowsight.ch/kunden/<slug>
```

---

## Schritt 6: Quality Gates prüfen — ~2 Min

Siehe `docs/gtm/quality_gates.md` — alle Gates für das gewählte Leckerli-Paket durchlaufen.

---

## Schritt 7: SSOT Update — ~2 Min

Nach jedem Provisioning:

1. `docs/customers/<slug>/status.md` — Leckerli-Status aktualisieren
2. `docs/gtm/gtm_tracker.md` — Prospect-Zähler erhöhen
3. `docs/STATUS.md` — Kundenzahl + Aktueller Stand
4. `docs/OPS_BOARD.md` — Snapshot aktualisieren

---

## Timing pro Leckerli-Paket

| Paket | Schritte | Zeit |
|-------|----------|------|
| D only | 1 + 5 + 6 + 7 | ~20 Min |
| B-Quick + D | 1 + 2(Quick) + 3 + 5 + 6 + 7 | ~25 Min |
| B-Full + D | 1 + 2(Full) + 3 + 5 + 6 + 7 | ~30 Min |
| A + B-Full + C + D | 1 + 2(Full) + 3 + 4 + 5 + 6 + 7 + Founder(Video) | ~45 Min |

---

## Erfahrungswerte (Weinberger AG)

- **JS-heavy Websites:** Crawl liefert nur Bilder. Text immer aus Verzeichnissen holen.
- **Bild-Extensions:** NIEMALS raten. Immer `ls` prüfen (.webp ≠ .jpg ≠ .jpeg).
- **Brunner-Referenzen:** Nach Template-Ersetzung IMMER grep nach altem Firmennamen.
- **INTL Agent:** Erst nach DE Agent erstellen (braucht DE Agent-ID für agent_swap).
- **retell_sync.mjs:** Publiziert automatisch. Kein manuelles Publishen nötig.
- **Crawl mit --click-thumbs:** Kann bei Elementor-Sites hängen. Ohne Flag starten.
