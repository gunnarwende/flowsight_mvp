# FlowSight Sales Pipeline

**Owner:** Founder
**Aktualisiert:** 2026-03-11
**Regel:** Jeder Prospect wird maximal 3× kontaktiert, dann ruhen lassen.
**Operating Model:** `docs/gtm/operating_model.md` (6 Phasen, Trial Lifecycle)

---

## Daten

**Pipeline-CSV:** `docs/sales/pipeline.csv` — 14 Prospects, ICP Scores, Leckerli-Pakete
**Scout-CSV:** `docs/sales/scout_raw.csv` — Rohdaten aus `scout.mjs`

> Die CSV-Dateien sind die SSOT für Prospect-Daten. Diese Markdown-Datei beschreibt den Prozess.

---

## Ablauf (Operating Model Kurzversion)

```
Phase 0: Scout     → 20 Prospects/Tag identifizieren (scout.mjs)
Phase 1: Outreach  → Personalisierter Erstkontakt (Founder, persönlich)
Phase 2: Provision → Trial in <20 Min (provision_trial.mjs)
Phase 3: Trial     → 14 Tage eigenes System
Phase 4: Decision  → Convert / Live-Dock / Offboard
Phase 5: Delivery  → Nur bei Conversion (Vertrag, Portierung)
```

**Vollständiges Modell:** `docs/gtm/operating_model.md`

---

## Tenant Lifecycle Status

| Status | Bedeutung | Nächster Schritt |
|--------|-----------|--------------------|
| `scouted` | In Pipeline, kein Kontakt | Outreach |
| `contacted` | Outreach gesendet | Auf Signal warten |
| `interested` | Prospect hat reagiert | Provisioning |
| `trial_active` | Trial läuft (14d) | Follow-up Tag 10 |
| `follow_up_due` | Tag 10 erreicht | Founder ruft an |
| `decision_pending` | Tag 14 erreicht | Convert / Dock / Offboard |
| `converted` | Vertrag, wird Kunde | Delivery |
| `live_dock` | Echte Calls, Verlängerung (14d) | Final Decision Tag 24 |
| `offboarded` | Sauber gelöscht | — |
| `parked` | Kein Interesse jetzt | Re-Outreach in 3 Monaten |

---

## Gewonnene Kunden

| # | Firma | Ort | Module | MRR (CHF) | Go-Live |
|---|-------|-----|--------|-----------|---------|
| 1 | Dörfler AG | Oberrieden | Voice, Wizard, Ops, Reviews | — | PENDING |

---

## Provisioning Tools

| Tool | Zweck |
|------|-------|
| `provision_trial.mjs` | Unified Trial Setup (tenant + phone + seed + magic link) |
| `offboard_tenant.mjs` | Clean Delete (cases + agents + auth + status) |
| `retell_sync.mjs` | Voice Agent publish (B-Full, DE + INTL) |
| `seed_demo_data.mjs` | Demo-Cases generieren |
| `scout.mjs` | Prospect Discovery + ICP Scoring |

---

## Outreach Templates

Siehe `docs/gtm/outreach_templates.md` — 3 Templates (nach ICP Tier) + Anruf-Skript.

---

## Quality Gates

Siehe `docs/gtm/quality_gates.md` — 5 Gates müssen PASS sein vor Outreach.

---

## Notizen / Learnings

(Hier nach jeder Woche festhalten: Was hat funktioniert? Was nicht? Was anpassen?)

