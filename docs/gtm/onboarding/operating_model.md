# Onboarding-Maschine — Operating Model

> Wie wir Lessons-Learned **operationalisieren** statt sie nur zu dokumentieren.
> Querverweis: `tenant_architecture.md` §4 (G-Rules-Reife-Tabelle).
>
> **Stand:** 2026-04-28 EOD (post-BigBen-Onboarding)

---

## §1 · Reife-Stufen pro Learning

Jedes Learning hat 4 mögliche Wohn-Orte — von billig+schwach zu teuer+stark:

| Stufe | Wo wohnt das Learning | Greift wann | Kosten | Beispiel |
|---|---|---|---|---|
| **1. Doc** | Bible / lessons_learned.md als Text | Wenn Mensch es liest | gering | "Customer-Sprache erkennen" als Hinweis |
| **2. Checklist** | Item in `customer_runbook_template.md` / Phase-Checklist | Wenn Founder das Run-Sheet abarbeitet | mittel | "[ ] Datepicker-Locale geprüft?" |
| **3. Skript-Check** | `provision_trial.mjs` / `pre_flight_check.mjs` schlägt fehl wenn Bedingung verletzt | Beim Skript-Lauf | höher | Skript-fail wenn `staff_record_for_customer_email` fehlt |
| **4. Automated Gate** | CI-Test / Cron-Test / Live-Smoke-Test, Telegram-Alarm bei Drift | Kontinuierlich, automatisch | hoch | Voice-Knowledge-Coverage-Test daily, Hard-Fail bei Score < 80% |

**Reife-Progression:** Doc → Checklist → Skript → Gate.

Nicht jedes Learning muss bis Stufe 4. Aber je kritischer (Schmerz-Wahrscheinlichkeit × Schmerz-Höhe), desto höher die Ziel-Stufe.

---

## §2 · G-Rules — Aktueller Stand + Migration-Plan

Siehe `docs/architecture/tenant_architecture.md` §4 für die kanonische G-Rule-Tabelle. Kurz-Status:

- **Stufe 4 (Code-Gate):** G2, G4, G5, G8, G9 — abgesichert
- **Stufe 3 (Skript-Check):** G3, G6, G11 — laufen aber kein Hard-Fail
- **Stufe 1-2 (Doc / Run-Sheet):** G1, G7, G10, G12 — wartet auf Skript-Migration

**Pre-Trip-Realität:** Wir migrieren KEINE Stufen während der 30-Tage-Reise. Aktueller Stand bleibt eingefroren bis Founder zurück ist. Migrations-Sprint danach (siehe `tenant_architecture.md` §6 Roadmap).

---

## §3 · Per-Customer Ritual

Nach jedem Onboarding (Phase 6 Convert) — 15-Min Founder + CC Review:

```
1. Lessons-Learned-Entry für diesen Kunden schreiben
   → docs/gtm/onboarding/lessons_learned.md
   → Pflicht innerhalb 24h (G10)

2. Diff gegen letzten Kunden:
   - Pattern wiederholt (>= 2x bei verschiedenen Customer)?
     → Kandidat für G-Promotion in nächste Stufe
   - Neuer einmaliger Vorfall?
     → bleibt im Per-Customer-Log

3. Pro G-Promotion:
   - Aktuelle Stufe?
   - Ziel-Stufe?
   - Wer baut die nächste Stufe? (CC implementiert, Founder reviewt)
   - Wann? (in Roadmap einplanen)

4. Eintrag in `bible_changelog.md`:
   - YYYY-MM-DD: G_n promoted from Stufe X → Stufe Y, trigger=<customer>
```

**Wann nicht promoten?**
- Wenn das Pattern nur 1× aufgetreten ist und unklar ist ob's wiederkehrt
- Wenn die Migrations-Stufe mehr Code als nötig kostet (z.B. Stufe-4-Gate für ein Edge-Case-Learning)
- Wenn der Founder kapazitiv keine Zeit hat zu reviewen — dann Doc reicht

---

## §4 · Pipeline ↔ Onboarding Feedback-Loop

Die zwei Maschinen sind nicht isoliert. Lessons fließen bidirektional:

### Pipeline → Onboarding

| Was lernt die Pipeline? | Was bekommt das Onboarding? |
|---|---|
| Prospect-Modus (1/2/3) aus Website-Audit | Tier-Plan-Default (Modus 1 → T2-T3, Modus 3 → T3-T4) |
| Prospect-Branche (Sanitär / Pub / ...) | Modul-spezifische Provisioning-Skripte vorgeladen |
| Prospect-Website-Stärke | Voice-Knowledge-Extract-Aufwand-Schätzung |
| Conversion-Signal (Trial-Engagement-Score) | Onboarding-Termin-Priorität |

### Onboarding → Pipeline

| Was lernt das Onboarding? | Was bekommt die Pipeline? |
|---|---|
| Customer-Pflege-Bereitschaft (pflegt GBP? Website?) | Pipeline-Promise wird realistischer ("Sync mit GBP nur wenn du es pflegst") |
| Häufige Painpoints in Phase 4 (z.B. Push-Setup) | Pipeline-Demo zeigt Lösung explizit |
| Customer-Anforderungen die wir nicht haben (z.B. Multi-Staff-View) | Pipeline-Outreach-Templates erwähnen Capability erst wenn vorhanden |
| Customer-Sprache & Tonalität | Pipeline personalisiert Outreach in Customer-Sprache |

### Schnittstelle

Beim Übergang Phase 3 (Trial) → Phase 4 (Onboarding):
```
prospect_card.json  →  onboarding_plan.md
                       data_sources.md
                       tier_plan.md
```

Diese Übergangs-Auflösung ist heute manuell (Founder-Brain). Stufe-3-Migration: `prospect_to_onboarding.mjs` Skript.

---

## §5 · Bible-Wachstum als Maschine

Die Pipeline-Bible ist über Wochen von §1 bis §35 gewachsen. Onboarding-Bible startet heute mit G1-G12. Beide wachsen je Customer.

**Operating-Pattern:**
1. Customer-Onboarding → Vorfälle in lessons_learned.md
2. Vorfälle → Pattern-Detection im Per-Customer-Ritual
3. Pattern → neue G-Rule oder Verschärfung bestehender
4. G-Rule → Stufen-Migration in §4-Tabelle
5. Migration → Code/Skript/Doc-Update
6. Doc-Update → Anchor in STATUS + business_briefing
7. Memory aktualisieren damit nächste CC-Session weiss

**Wachstums-Disziplin:**
- Nicht jedes Single-Event verdient G-Status. Mindestens 2× bei verschiedenen Customers.
- Nicht jede G-Rule muss auf Stufe 4. Hängt von Schmerz × Wahrscheinlichkeit ab.
- Bible ist Living Document. Outdated Sektionen werden archiviert (`docs/archive/onboarding/`), nicht gelöscht — Migration-History ist wertvoll.
