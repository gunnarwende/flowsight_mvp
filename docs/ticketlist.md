# Ticketlist — FlowSight (SSOT)

**Updated:** 2026-04-23 (Sales Day 23: **Pipeline Screenflow Take 2+3+4 FINAL für Dörfler AG** (Masterbetrieb 10/10). 57+ Feedback-Punkte (A1-A19, B1-B8, C1-C29) abgearbeitet. Demo-Time-Architektur + DEMO_NO_DISPATCH env-Flag + Take 4 komplett (Termin → Reminder → D15 → Review Mobile → Closing Gold → Windows-Toast). Quality-Gates-Framework etabliert. Morgen: 3-Betrieb-Dry-Run Lens+Wälti+Stark.)
**Rule:** CC updates after every deliverable. Founder reviews weekly.
**Einziger Ticket-Tracker.** Alle offenen Tickets leben hier.
**Bug-Klassen:** `[STOPP]` = blockiert E2E/Proof/Versand. Wird sofort gefixt. Alles andere = Ticketliste.

---

## Snapshot

- **Produkt:** Voice + Wizard + Leitzentrale + Reviews + SMS. **Website ist KEIN Produktbestandteil.** CEO-App, Outlook Kalender, Papierkorb, Seed v3.
- **Website-Entscheidung (14.04.):** Modul 2 = Standard. Website nur als Basis-Fallback (kaputt/fehlend). Modul-1-Maschine beendet. ICP-Analyse: 71% der 42 Betriebe brauchen keine Website.
- **Kunden:** 7 bestehende Sites bleiben als Legacy. Keine neuen Website-Builds. Wizard-Einstieg: /start/[slug].
- **Voice:** Gold-Standard-Schablone (23 Platzhalter), Ela DE + Juniper INTL, 18 Szenarien, 14 No-Go's.
- **Speakflow:** Take 1 + Take 2 FINAL. Generisches Template: `docs/gtm/speakflow_template.md`
- **Pipeline V2:** Phase 1 DONE (Crawl+Extract+Derive+Provision). `pipeline_run.mjs` = Ein-Befehl-Orchestrator. `tenant_config.json` = SSOT für alles downstream.
- **Take 2+3+4 Screenflow-Pipeline FINAL (Day 23):** Pipeline komplett für Dörfler AG (Masterbetrieb 10/10). Demo-Time-Architektur (`demo_time.mjs` + Werktag-Gate CH-Feiertage + compressed Timeline 08:04→morgen 08:00-10:00). DEMO_NO_DISPATCH env-Flag unterdrückt echte SMS/Mails in Pipeline-Runs. Take 4 Feature-Set: Akt1 Termin versenden → Phone1 Reminder → Akt2 D15 → Phone2 SMS → Review Mobile redesigned → Closing Gold → Windows-Toast tenant-branded (Navy+Gold). Samsung-Chrome (Status-Bar + Bottom-Nav) + Phone-Platter-Backstop + Sidebar-Profile-Overlay. 57+ Feedback-Punkte (A1-A19, B1-B8, C1-C29) abgearbeitet.
- **Quality-Gates-Framework (Day 23):** Pre-Flight, Take 2, Take 3, Take 4, Composite, Cross-Tenant Checks in PIPELINE_BIBLE §-Quality-Gates. Automation-Script `dry_run_qg.mjs` in Bau für 24.04.
- **Pricing:** FINAL — Standard CHF 299 (100 Fälle), Professional CHF 499 (200 Fälle), Enterprise Custom.
- **BLOCKER:** 0
- **BigBen Pub:** ERSTER KUNDE (Paul). Barter-Deal. Voice EN+DE LIVE (+41445054818), PCA structured extraction. Dashboard 6 Cards. Go-Live prep 90% complete, waiting for Paul's photos/videos. 35 PRs (#457-#467 + #479-#499).
- **Phase:** Sales Day 23. Take 2+3+4 Pipeline komplett für Dörfler AG. Audio Take 1-4 hochgeladen. Nächste Schritte: 3-Betrieb-Dry-Run Lens+Wälti+Stark mit Quality-Gates-Automation (24.04.).
- **Nächste Schritte (Tag 24, 24.04.):** **3-Betrieb-Dry-Run Lens+Wälti+Stark mit Quality-Gates-Automation.** Reihenfolge: (1) Take 2 × 3 Betriebe sequential (Lens, Wälti, Stark), (2) Take 3+4 Lens AG solo als Masterprobe, (3) Take 3+4 Dörfler + Wälti + Stark parallel. Quality-Gates-Script (`dry_run_qg.mjs`) parallel fertig bauen. Ziel: Pipeline reproducibly over 4 Betriebe, Loom-PiP-Integration final, Outreach-Phase 3 vorbereitet.
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
| RM2.1 | **support@flowsight.ch einrichten** | E-Mail in Outlook aktivieren (Founder-Task) | DONE — 26.03. |
| RM2.2 | **Lisa auf Support-Tickets trainieren** | Voice Agent soll Support-Anfragen sauber verarbeiten | OFFEN |
| KAL1 | **Outlook OAuth App anlegen** | Azure App Registration für Kalender-Integration (Phase 2). Anleitung: `docs/runbooks/founder_kalender_setup.md` | DONE — 26.03. |
| KAL2 | **Google Calendar OAuth App anlegen** | Google Cloud Console für Kalender-Integration (Phase 2). Gleiche Anleitung. | DONE — 26.03. |

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
| #80 | BigBen Pub — Pauls Fotos/Videos | Wartet auf Paul (Go-Live 30.04.) |

---

## Pipeline V2 — OFFEN

| # | Schritt | Status | Nächste Aktion |
|---|---------|--------|----------------|
| P1 | Phase 1: Crawl+Extract+Derive+Provision | ✅ DONE | 3 Betriebe getestet. Seed erweitert (50 Cases, Demo-Cases, Dummy-Staff) |
| P2 | Phase 2: Take 2 Screenflow-Pipeline (Samsung + Leitsystem + Splice) | ✅ DONE (21.04.) | 4 Betriebe end-to-end. One-Command `pipeline_screenflow.mjs`. 61+ FBs abgearbeitet. |
| P2.1 | Audio Take 1 + Take 2 Master | ✅ DONE (21.04.) | Founder-seitig hochgeladen |
| P3 | Phase 2: Take 3 (Wizard) Screenflow-Pipeline | ✅ DONE (22.04.) | Pipeline für Dörfler komplett, FB76-FB101 gefixt |
| P3.1 | Audio Take 3 Master | ✅ DONE (22.04.) | Founder-seitig hochgeladen |
| P4 | Phase 2: Take 4 (Review + FAKE-ENDSCREEN) Screenflow-Pipeline | ✅ DONE (23.04.) | Dörfler AG 10/10 Masterbetrieb. Feature-Set: Termin → Reminder → D15 → Review Mobile → Closing Gold → Windows-Toast |
| P4.1 | Audio Take 4 Master | ✅ DONE (22.04.) | Founder-seitig |
| P4.2 | Screenflows + Audio verknüpfen (alle 4 Takes) | ✅ DONE (23.04.) | Composite-Videos take2/3/4_with_loom.mp4 |
| P5 | Loom-PiP + Final Assembly (Founder-Face overlay) | ✅ DONE (23.04.) | Composite-Videos in `docs/gtm/pipeline/06_video_production/screenflows/doerfler-ag/` |
| P5.1 | Demo-Time-Architektur (demo_time.mjs + Werktag-Gate + compressed Timeline) | ✅ DONE (23.04.) | Zentrale Zeit-Quelle, CH-Feiertage, 08:04→morgen 08:00-10:00 |
| P5.2 | DEMO_NO_DISPATCH env-Flag | ✅ DONE (23.04.) | Unterdrückt echte SMS/Mails in Pipeline-Runs |
| P5.3 | Script-Helper: demo_time, renderSidebarProfile, renderWindowsToast, renderSamsungNav, renderPhoneBezel | ✅ DONE (23.04.) | Mit ensureContentMask + ensurePhonePlatter-Backstop |
| P5.4 | 3-Betrieb-Dry-Run Lens+Wälti+Stark (Take 2+3+4) + Quality-Gates-Automation | OFFEN (24.04.) | dry_run_qg.mjs bauen. Reihenfolge: Take2×3 sequential → Take3+4 Lens solo → Take3+4 Dörfler+Wälti+Stark parallel |
| P6 | Phase 3: Outreach-E-Mail dynamisieren | OFFEN | Template + tenant_config statt hardcoded |
| P7 | Phase 3: Pipeline Orchestrator erweitern (video + outreach steps) | OFFEN | Wartet auf Phase 2 Dry-Run |
| P8 | Marktanalyse + ICP | ✅ DONE | 585 Betriebe, 4 Quellen, Pipeline Bible |
| P9 | Take 2: Call-Scripts FINAL (Notruf + Preis) | ✅ DONE | 2-Video-Ansatz, Pipeline wählt per call_proof_variante |
| P10 | Founder Review Prozess (7 Abschnitte, regenerate_review.mjs) | ✅ DONE | 13 Fixes, 3 Betriebe quality-hardened |
| P11 | Remotion Animation Pipeline Setup | OFFEN (später) | Scrcpy-Clip-Zwischenlösung bleibt vorerst stabil |

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
