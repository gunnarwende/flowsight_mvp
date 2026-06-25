# Stern 1 — Lead-Motor Runbook (Go / Vollerfassung / Anreichern)

> Operatives Schritt-für-Schritt für den **Lead-Motor** (Top-of-Funnel). Pendant zum
> [`NEUER_BETRIEB_VIDEO_RUNBOOK.md`](../pipeline/NEUER_BETRIEB_VIDEO_RUNBOOK.md) (Stern 3).
> Stabile Fakten (ICP, Region, Preis) sind SSOT in der [SALES_BIBLE](SALES_BIBLE.md);
> die Datenform ist SSOT im [Leads-Contract](../../architecture/contracts/leads_contract.md).
> Dieses Runbook beschreibt nur **wie man den Motor bedient**.

## Prinzip (Handy fasst keinen Key an)

Jede key-pflichtige Operation läuft als **`workflow_dispatch` in GitHub Actions** mit vollem
Key-Zugriff. Das Handy/Cockpit triggert nur — die Keys (Google Places, Supabase Service-Role)
bleiben in CI, nie in der Sandbox. Bedienung aus dem **Bedienpult** in `/ceo/journey`
(`JourneyView.tsx` → `/api/ceo/ops/dispatch`, admin-gated + Workflow-Whitelist).

SSOT der Liste ist die **`leads`-Tabelle** (nicht mehr `leads.csv` — das ist Legacy). Live
sichtbar in `/ceo/journey` (Handy + Desktop).

---

## A. Go — Betriebe finden (`discover.yml`)

Der „Go"-Knopf im Bedienpult. Zwei Modi (Schalter oben):

### A1 · Modus „Vollerfassung" (Default — Landkarte zuerst)

**Wann:** Eine neue Region erschließen. Parkt **JEDEN** Sanitär-Betrieb des Kantons
(alle Größen), region-/branchen-sauber, **ohne Crawl** → schnell, Größe bleibt `?`.
Kein 1–3-Ziel-Stop; läuft bis Zeitbudget, die Frontier rückt vor.

- **Bedienpult:** Modus = `Vollerfassung`, Kanton wählen → **Go**. (Anzahl + Gemeinde sind
  hier ausgeblendet — in der Vollerfassung keine Grenze.)
- **Dispatch:** `discover.yml` mit `mode=vollerfassung`, `kanton=<K>`.
- **CLI-Äquivalent:**
  ```
  node scripts/_ops/discover_targeted.mjs --kanton "<Kanton>" --locate-only --minutes 45 --execute
  ```
- **Ergebnis:** alle Betriebe der Region als Leads geparkt, `kanton` autoritativ gesetzt,
  Größe/Inhaber/Mail noch `?` → danach segmentweise mit „Anreichern" (Schritt B) füllen.
- **Mehr als ein Lauf:** Reicht ein 45-Min-Budget nicht für den ganzen Kanton, rückt die
  Frontier vor — ein **zweites „Go"** macht nahtlos weiter (additiv, keine Dopplungen).

### A2 · Modus „1–3 jagen" (gezielt kleine Betriebe)

**Wann:** Gezielt cold-call-fähige 1–3-Mann-Betriebe ziehen + sofort crawlen.

- **Bedienpult:** Modus = `1–3 jagen`, Kanton + (optional) Gemeinde + Anzahl `10/20/30/40` → **Go**.
- **Dispatch:** `discover.yml` mit `mode=jagen`, `kanton`, `gemeinde`, `count`.
- **CLI-Äquivalent (Kanton-Sweep, Gemeinde leer):**
  ```
  node scripts/_ops/discover_targeted.mjs --kanton "<Kanton>" --target <N> --minutes 45 --execute
  ```
- **CLI-Äquivalent (Einzel-Ort, Gemeinde gesetzt):**
  ```
  node scripts/_ops/scout.mjs --gemeinde "<Ort> <Kanton>"
  node scripts/_ops/discover_to_leads.mjs --gemeinde "<Ort>" --count <N> --execute
  ```
- **Stop:** Ziel erreicht (`smallFound >= target`); Zeit nur als Sicherheitsnetz. Bleibt
  **strikt im gewählten Kanton** (kein Cross-Kanton-Roll — falsche Region wäre verheerend).

---

## B. Anreichern — Karten-Lücken schließen (`enrich.yml`)

Der „Anreichern"-Knopf. Geht **alle unvollständigen** Leads durch (Website vorhanden, aber
Inhaber/Mail/Größe leer), crawlt sie und füllt die Felder. Entkoppelt vom Discovery-Budget,
damit auch nach einer Vollerfassung ungecrawlte Betriebe drankommen.

- **Bedienpult:** **Anreichern** → Zeitbudget (Default 45 Min).
- **Dispatch:** `enrich.yml` mit `minutes`, `mode` (`full` / `reformat-only`).
- **CLI-Äquivalent:**
  ```
  node scripts/_ops/enrich_new_leads.mjs --minutes 45            # full (Crawl + Umformat)
  node scripts/_ops/enrich_new_leads.mjs --minutes 15 --skip-crawl   # reformat-only (schnell)
  ```
- **Was es tut:**
  1. **Crawl-Pass:** unvollständige Leads (bestes ICP zuerst), 90s-Limit je Website → füllt
     Inhaber (`Herr/Frau Nachname`), Mail, Größe. Zeit-budgetiert; Rest bleibt für den
     nächsten Lauf.
  2. **Umformat-Pass:** bringt ALLE Inhaber-Felder auf `Herr/Frau Nachname` + putzt Müll
     (z. B. „Unsere Niederlassungen") raus.
  3. **Founder-Gegenprüf-Liste:** Betriebe ohne online auffindbaren Inhaber — die klärt der
     Mensch vor dem ersten Call (die Maschine rät nie).

---

## C. Founder-Gegenprüfung (Pflicht vor dem Call)

Stern 1 ist erst „fertig", wenn pro Betrieb **Inhaber + Größe** stehen. `?` ist nie das
Endergebnis — was der Crawl nicht sicher findet, härtet der Mensch vorne:

- In `/ceo/journey` editierbar: **Inhaber, Größe, E-Mail, Leistungen** (DB-gespeichert).
- Einzig die **E-Mail** darf `?` bleiben — sie wird im „Ja" des Cold Calls verifiziert.
- Disposition pro Lead: `▶ Cold Call` · `∅ kein Anschluss` · `↻ Rückruf` ·
  `✕ abgelehnt (2 Mt gesperrt)` · `✓ Ja` → füllt `status` + Funnel (`journey_events`).

---

## D. Verifizieren (nach jedem Lauf)

1. **CI-Log lesen** (GitHub Actions → `discover.yml`/`enrich.yml`-Lauf): wie viele Betriebe
   geparkt/angereichert, Größen-/Kanton-Verteilung, Founder-Gegenprüf-Liste am Ende.
2. **Cockpit prüfen:** `/ceo/journey` hart neu laden → die Größen-Tabs `1–3 · 4–15 · >15 · ?`
   partitionieren „Alle" vollständig (kein unsichtbares Delta).
3. **Region-Sauberkeit:** `node scripts/_ops/analyze_leads.mjs` (Audit liest `kanton` direkt
   → keine Homonym-Falschalarme).

---

## E. Bereinigen (`purge.yml`)

Alt-Crawl-/Müll-Leads entfernen, **ohne** aktive/gepflegte Leads zu verlieren:

```
node scripts/_ops/purge_stale_leads.mjs            # Dry-Run zuerst (zeigt, was wegfiele)
node scripts/_ops/purge_stale_leads.mjs --execute  # erst nach Sichtung
```

> **Regel:** Dry-Run ist Pflicht. Founder-Felder (`status`/`notiz`/…) markieren einen Lead
> als „angefasst" → bleibt geschützt.

---

## Reihenfolge in der Praxis (eine Region abschließen)

1. **Vollerfassung** des Kantons (A1) → Landkarte steht, alle Größen geparkt.
2. **Anreichern** (B) → `?` verteilen sich auf `1–3 / 4–15 / >15`, Inhaber/Mail gefüllt.
3. **Founder-Gegenprüfung** (C) → offene Inhaber/Größen klären.
4. **Verifizieren** (D) → Zahlen + Region sauber.
5. Region ist cold-call-fähig → Übergabe an **Stern 2** (Cold Call).
