# Ticketlist — FlowSight (SSOT)

**Updated:** 2026-03-22 (Grossumbau: Website-Redesign Leitsystem, Voice Agent 4-Modi, Pipeline Tracking, Video-Drehbuch.)
**Rule:** CC updates after every deliverable. Founder reviews weekly.
**Einziger Ticket-Tracker.** Alle offenen Tickets leben hier.
**Bug-Klassen:** `[STOPP]` = blockiert E2E/Proof/Versand. Wird sofort gefixt. Alles andere = Ticketliste.

---

## Snapshot

- **Produkt:** 25+ Module LIVE. Voice: Laura (DE) + Juniper (INTL). CEO-App komplett. Outlook Kalender live.
- **Kunden:** 7 Websites live, Weinberger = GTM Goldstandard
- **Voice:** Partial Cases Fix live (PR #336) — kein Fall geht mehr verloren. Laura als DE-Stimme auf 4 Agents. Urgency-Aliases normalisiert. SMS-Sender alphanumerisch.
- **Pricing:** FINAL — Standard CHF 299 (120 Fälle), Professional CHF 499 (250 Fälle), Enterprise Custom. Sweetspot: 3-8 MA. Dokument: `pricing_und_marge.md`
- **BLOCKER:** 0
- **Sentry-Bugs:** voice_case_missing_fields durch Partial Cases Fix entschärft (Fälle werden jetzt mit Defaults angelegt statt verworfen). Historische Events (68x) werden abnehmen.
- **Phase:** Grossumbau (22.03.) — Website-Redesign, Voice Agent, Pipeline Tracking, Video-Drehbuch. PRs #348-#350.
- **Nächste Schritte:** 1) PRs mergen (CI prüfen) 2) retell_sync.mjs für Sales Agents 3) DEMO_SIP_CALLER_ID verifizieren 4) Voice-Bugs V2-V6 Founder-Test 5) Video aufnehmen (generisch)
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

## OFFEN — Founder-Actions

| # | Titel | Beschreibung | Status |
|---|-------|-------------|--------|
| RM2.1 | **support@flowsight.ch einrichten** | E-Mail in Outlook aktivieren (Founder-Task) | OFFEN — Founder |
| RM2.2 | **Lisa auf Support-Tickets trainieren** | Voice Agent soll Support-Anfragen sauber verarbeiten | OFFEN |
| KAL1 | **Outlook OAuth App anlegen** | Azure App Registration für Kalender-Integration (Phase 2). Anleitung: `docs/runbooks/founder_kalender_setup.md` | OFFEN — Founder |
| KAL2 | **Google Calendar OAuth App anlegen** | Google Cloud Console für Kalender-Integration (Phase 2). Gleiche Anleitung. | OFFEN — Founder |

## ERLEDIGT — Feedback Session 19.03. (PRs #286-#290)

| # | Titel | Status |
|---|-------|--------|
| RM1 | Nav-Reihenfolge + Techniker-Nav aufgeräumt | DONE (PR #286) |
| RM3-RM6 | Role Toggle, Settings Tenant, Techniker-View, hooks crash | DONE (PR #286) |
| RM7 | Bewertungs-Weiche (≤3★ intern, ≥4★ → Google) | DONE (PR #288) — Review Pre-Filter live |
| FB1 | FlowBar: Grid, YTD, Quellen, Badge, Gold-Sterne | DONE (PR #287) |
| FB2/FB4 | Mobile 2x2 Grid | DONE (PR #287) |
| FB3 | Techniker Pagination + Icons + Period-Toggle | DONE (PR #287) |
| FB5 | "Kategorie" ausgeschrieben | DONE (PR #287) |
| FB6 | Status-Farben (orange/grau/gold) | DONE (PR #287) |
| 6a-6g | PLZ-Lookup, Pflichtfelder, Kollision, Mobile PageSize, Ramon | DONE (PR #288) |

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
