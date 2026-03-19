# Ticketlist — FlowSight (SSOT)

**Updated:** 2026-03-18 (Leitzentrale v2 + Scaling & Access deployed)
**Rule:** CC updates after every deliverable. Founder reviews weekly.
**Einziger Ticket-Tracker.** Alle offenen Tickets leben hier.
**Bug-Klassen:** `[STOPP]` = blockiert E2E/Proof/Versand. Wird sofort gefixt. Alles andere = Ticketliste.

---

## Snapshot

- **Produkt:** 17 Module LIVE + Tenant-Switcher + Support-System + Leitzentrale v2
- **Kunden:** 7 Websites live (Doerfler, Brunner HT, Walter Leuthold, Orlandini, Widmer, **Weinberger AG**, BigBen Pub)
- **BLOCKER:** 0
- **Phase:** Leitzentrale v2 deployed (18.03.). Scaling & Access live. Go-Live-Vorbereitung.
- **CI/CD:** GitHub Actions (lint + build + Telegram notify + lifecycle-tick + morning-report). Branch Protection: PR required.

### How to Operate (Founder via Handy)

```
1. CC erstellt Feature-Branch + PR
2. Telegram "FlowSight Ops": CI Status + Preview-Link + PR-Link
3. Founder: GitHub Mobile App → PR reviewen → Approve + Merge
4. Telegram: Shipped → Vercel deployt Prod (~90s)
5. Done. Kein Terminal noetig.
```

---

## [STOPP] — E2E-Blocker

Keine.

---

## OFFEN — Founder-Feedback (aus Session 18.03.)

> Feedback B1/B2 zu Leitzentrale v2 steht noch aus (Founder testet morgen 19.03.)

| # | Titel | Beschreibung | Status |
|---|-------|-------------|--------|
| FB-OPEN | **Leitzentrale v2 Feedback** | Systemfluss, Handlungsbedarf, Wirkungszone, Techniker-View — Founder-Feedback ausstehend | READY TO TEST |
| FB-OPEN | **Tenant-Switcher Feedback** | Settings bei Switch, Rollen-Switch — Founder-Feedback ausstehend | READY TO TEST |

---

## OFFEN — Voice-Agent-Bugs

| # | Titel | Schwere | Status |
|---|-------|---------|--------|
| V2 | **"Jul" aus Greeting entfernen** | hoch | READY TO TEST (PRs #198 + #202) |
| V3 | **Ortsnamen NICHT wiederholen** | mittel | READY TO TEST (PRs #198 + #202) |
| V5 | **SMS kommt nicht an (eCall)** | hoch | READY TO TEST (PR #200 + #202) |
| V6 | **Namens-Frage falsch formuliert** | mittel | READY TO TEST (PRs #198 + #202) |

---

## OFFEN — Sonstige

| # | Titel | Status |
|---|-------|--------|
| #80 | BigBen Pub — Ruecksprache Paul | Tier 3, Paul interessiert |

---

## Backlog (trigger-basiert, Post-Build)

| # | Deliverable | Trigger | Status |
|---|-------------|---------|--------|
| N7 | Ops-light UI (reviews-only mode) | Reviews-only Kunde signed | OFFEN |
| N11 | Adress-Autocomplete (Swiss Post API / Google Places) | Post-MVP | OFFEN |
| N15 | Terminerinnerung 24h vorher | Post-Go-Live | OFFEN |
| N16 | Kunden-Historie | Post-Go-Live | OFFEN |

---

## LATER (parked)

| # | Deliverable | Trigger |
|---|-------------|---------|
| L2 | Vertraege / AGB Vorlage | Vor Kunde #2 |
| L5 | LinkedIn Unternehmensseite | 1 Post/Woche nach Go-Live |
| L10 | Retention decisions | Case + attachment retention periods |
| L12 | Data protection statements | Voice disclosure + Wizard checkbox + DPA |
| L13 | Demo-Video aufnehmen | Go-Live + Demo-Strang shipped |

---

## Thema C (geparkt)

**FlowSight CEO-App** — Eigene Betreiber-PWA für Monitoring, Dev/Prod-Übersicht, Prozessketten, Fehlererkennung. Einstieg in Betrieb-Leitsysteme. Details: `memory/project_thema_c_ceo_app.md`

---

## Archiv — Gelöst durch Session 18.03. (PRs #268-#280)

Alle D-Tickets (D1-D11), S-Tickets (S1-S3), L-Tickets (L1-L10) aus der Leitstand-Renovation und dem Founder E2E-Walkthrough sind durch die heutigen 11 PRs gelöst:
- D1 Pagination → DONE (15 pro Seite)
- D2 Tabelle statt Cards → DONE (Leitzentrale v2)
- D3 Zahlen-Inkonsistenz → DONE (Systemfluss-Pipeline)
- D5/D7 KPI-Klick → SUPERSEDED (Systemfluss ist read-only, Tabelle hat eigene Filter)
- D6 Inkonsistente Ansichten → DONE (eine konsistente Tabelle)
- D8 Tenant-Branding → DONE (Brand Color Pipeline)
- D10 Falldetail → DONE (Leitsystem Phase 1, 8/8 Tasks)
- D11.8 Rollen → DONE (nur Admin + Techniker)
- D11.9 ICS-E-Mail → Separate Issue, nicht blockierend
- D11.10 Case-ID-Prefix → DONE (auto aus Firmenname)

## GTM Pipeline v2

**Living docs:** `docs/gtm/` (operating_model, gtm_tracker, gold_contact, outreach_templates, einsatzlogik)
**Redesign-Docs:** `docs/redesign/` (plan.md + scaling_access.md + plan_leitzentrale_v2.md + identity_contract.md)
**Pipeline:** `docs/sales/pipeline.md`
**Machine:** `docs/gtm/machine_manifest.md`
