# Ticketlist — FlowSight (SSOT)

**Updated:** 2026-03-14 (Founder E2E-Verification — 22 neue Tickets aus Walkthrough)
**Rule:** CC updates after every deliverable. Founder reviews weekly.
**Einziger Ticket-Tracker.** Alle offenen Tickets leben hier.
**Bug-Klassen:** `[STOPP]` = blockiert E2E/Proof/Versand. Wird sofort gefixt. Alles andere = Ticketliste.

---

## Snapshot

- **Produkt:** 17 Module LIVE (Website, Voice, Wizard, Ops, Reviews, Review Surface, Morning Report, Entitlements, Email, Peoplefone, Sales Agent, Demo Booking, Demo-Strang, SMS Channel, CoreBot, Customer Links Page, BigBen Pub)
- **Kunden:** 7 Websites live (Doerfler, Brunner HT, Walter Leuthold, Orlandini, Widmer, **Weinberger AG**, BigBen Pub)
- **BLOCKER:** 0 (S3 + V2/V3/V5/V6 = READY TO TEST)
- **Phase:** Voice version-pin fix + SMS-Qualitaet deployed (PR #202). Root cause: Phone-Nummern waren auf alte Agent-Version gepinnt → alle Voice-Fixes wirkungslos. Jetzt unpinned + auto-unpin in retell_sync.mjs. SMS zeigt jetzt Meldername. Founder muss Testanruf machen.
- **Redesign-Docs:** `docs/redesign/` — plan.md + 6 Zielbilder + 4 IST-Audits + identity_contract.md
- **Gold Contact:** `docs/gtm/gold_contact.md` — Nordstern (unveraendert)
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

## [STOPP] — E2E-Blocker (CC fixt sofort)

| # | Titel | Pfad | Root Cause | Status |
|---|-------|------|-----------|--------|
| S1 | **Weinberger SMS kommt nicht an** | Voice→Webhook→SMS | `+41435051101` fehlte in TWILIO_OWNED_NUMBERS → SMS ging an Twilio-Nr statt Founder-Handy | **DONE** (PR #189) |
| S2 | **SMS_ALLOWED_NUMBERS Whitelist pruefen** | Vercel Env | `+41764458942` ist in Whitelist → kein Blocker | **PASS** |
| S3 | **eCall SMS kommt nicht an** | Servicenummer +41766012739 beschafft + auf Vercel gesetzt. Direkt-Sender (PR #200): immer ECALL_SENDER_NUMBER, kein Alpha-Fallback. Test-SMS kommt an. | Founder: Testanruf Weinberger → SMS muss ankommen | **READY TO TEST** (PR #200) |

**Status:** S1+S2 DONE. **S3 = READY TO TEST.** Servicenummer live, Direkt-Sender deployed (PR #200). Founder muss Testanruf machen um E2E zu verifizieren.

---

## OFFEN — Voice-Agent-Bugs

> Aus Founder E2E-Walkthrough 13.03. + **14.03. (call_e2fa645d00d0bd3b2ed94a98918)**. Bewertung: Nicht Gold Contact.

| # | Titel | Root Cause | Schwere | Status |
|---|-------|-----------|---------|--------|
| V1 | **Voice auf Juniper umstellen (alle Agents)** | Agent-JSONs verwenden falsche voice_id | hoch | **DONE** (PR #193) |
| V2 | **"Jul" aus Greeting entfernen** | Global gefixt (PR #198). Root cause fuer Nicht-Wirkung: Phone-Nr version-pinned auf v1 → Fix in PR #202 (auto-unpin). | hoch | **READY TO TEST** (PR #198 + #202) |
| V3 | **Ortsnamen NICHT wiederholen** | NIEMALS-Regel auf allen DE-Agents (PR #198). Phone-Nr version-pin war root cause → Fix PR #202. | mittel | **READY TO TEST** (PR #198 + #202) |
| V4 | **Dringlichkeits-Echo korrigieren** | Agent-Prompt mappt nicht 1:1 | mittel | **DONE** (PR #193) |
| V5 | **SMS kommt nicht an (eCall)** | Identisch mit S3. Direkt-Sender (PR #200) + SMS-Qualitaet mit Meldername (PR #202). | hoch | **READY TO TEST** (PR #200 + #202) |
| V6 | **Namens-Frage falsch formuliert** | Global gefixt (PR #198). Phone-Nr version-pin war root cause → Fix PR #202. | mittel | **READY TO TEST** (PR #198 + #202) |

---

## Leitstand-Renovation — Status

> Renovation 13.03. — Code deployed. **Founder E2E-Verification 14.03. deckt erhebliche UX-Gaps auf.**
> Referenz: `docs/redesign/leitstand.md` (Zielbild) + `docs/redesign/identity_contract.md`

### Phase 1 (Code deployed, PRs #192-#196)

| # | Titel | Status | Evidence |
|---|-------|--------|----------|
| L1 | **Sidebar: Tenant-Branding** | **REOPENED** → D8 | Zeigt "LS" in Orange statt Tenant-Initialen (JW) in Tenant-Farbe |
| L2 | **"Bald"-Badges entfernt** | **DONE** | PR #192 |
| L3 | **Puls-Ansicht** | **REOPENED** → D2, D6 | Cards-Design nicht Gold-tauglich, inkonsistent mit Tabelle |
| L4 | **KPI-Click filtert Tabelle** | **REOPENED** → D5, D7 | Filter + Tab-Interaktion broken, KPI-Klick springt auf falschen Tab |
| L5 | **Einsatzplan** | Code deployed | Founder-Review steht aus (→ D9) |
| L6 | **Zahlen (Metrics)** | Code deployed | Founder-Review steht aus (→ D9) |
| L7 | **Einstellungen** | **REOPENED** → D11.9 | Kalender-E-Mail/ICS kommt nicht an, Rollen unklar |
| L8 | **Case-ID-Prefix** | **REOPENED** → D10.1, D11.10 | Prefix soll auto-2-Buchstaben sein (JW statt WB), "ProfiTicketNr." statt UUID |
| L9 | **Termin als eigenes Objekt** | **REOPENED** → D11.9 | ICS-E-Mail kommt nicht an bei Termin-Erstellung |
| L10 | **Mitarbeiter als eigenes Objekt** | **REOPENED** → D11.8 | Rollen reduzieren (nur Admin + Techniker), E-Mail bei Anlage kommt nicht |

### Phase 2 — OFFEN: Leitstand-Redesign R2 (Founder E2E 14.03.)

> Aus Weinberger-Testanruf + Leitstand-Walkthrough. Screenshots: `Weinberger Leitsystem1.jpeg`, `Weinberger Leitsystem2.png`

| # | Titel | Beschreibung | Schwere | Status |
|---|-------|-------------|---------|--------|
| D1 | **Pagination — Max 15 Faelle pro Seite** | Aktuell alle Faelle auf einer Seite → endloses Scrollen. Max 15, dann Seite wechseln. | hoch | OFFEN |
| D2 | **Falluebersicht: Tabelle statt Cards** | PulsView-Cards wirken unuebersichtlich. Stattdessen: saubere, gut designte Tabelle mit Sortierung. Gold Contact = sofort scannbar. | hoch | OFFEN |
| D3 | **Sortierung/Zahlen inkonsistent** | "32 Achtung" angezeigt, 33 Faelle in Liste, 57 Total. Zahlen muessen 1:1 stimmen. | hoch | OFFEN |
| D4 | **"Ihre Faelle" vs "Demo" Tabs — Langfriststrategie** | Demo-Tab fuer Testphase sinnvoll, aber: Was passiert nach Trial? Demo-Cases loeschen oder archivieren? Klare Trennung definieren. | mittel | OFFEN |
| D5 | **KPI-Klick + Tab-Interaktion broken** | Bei "Demo" gefiltert → Klick auf "Total Faelle" springt auf "Ihre Faelle" und zeigt 57 statt 15. KPI-Filter muss im aktiven Tab bleiben. | hoch | OFFEN |
| D6 | **Inkonsistente Ansichten: Cards vs Tabelle** | Klick auf "Offen" → Cards. Klick auf "Alle" → alte Tabelle. EINE konsistente Darstellung noetig. | hoch | OFFEN |
| D7 | **KPI-Klick zeigt exakte Menge** | "Erledigt (7d) = 5" → Klick muss exakt diese 5 zeigen. Gleiches fuer alle KPIs. Keine Unschaerfe. | hoch | OFFEN |
| D8 | **Tenant-Branding statt Orange** | "LS" in Orange → soll "JW" in Tenant-Farbe sein. ALLE orangen Akzente durch dynamische Tenant-Farbe ersetzen (aus Website des Betriebs). Betrieb muss sich wiederfinden. | hoch | OFFEN |
| D9 | **Einsatzplan/Mitarbeiter/Kennzahlen/Einstellungen — Review** | Grundstruktur steht. Pflicht: 2 Grafiken einbauen die das Unternehmen widerspiegeln. Langfristige Inhalte muessen besprochen werden. | mittel | OFFEN — Founder-Review |
| D10 | **Falldetail-Ansicht: nicht Gold Contact** | Gesamtdesign der Falldetail-Seite muss ueberarbeitet werden (siehe D10.1-D10.4). | hoch | OFFEN |
| D10.1 | **Case-ID: "ProfiTicketNr." statt WB-0022** | Oben rechts steht WB-0022. Soll professioneller wirken, z.B. "Ticket #JW-0022" oder aehnlich. Prefix auto-2-Buchstaben. | mittel | OFFEN |
| D10.2 | **11 Kacheln unuebersichtlich** | Status, Dringlichkeit, Kategorie, PLZ, Ort, Strasse, Nr, Melder, Telefon, E-Mail, Zustaendig — alle wichtig, aber Layout braucht klare Gruppierung (Kontakt / Adresse / Fall-Meta). | hoch | OFFEN |
| D10.3 | **Google Maps staerker hervorheben** | Aktuell nur kleiner Link. Low hanging fruit — soll prominent sein, Lust machen es zu nutzen. Evtl. Mini-Map-Preview. | mittel | OFFEN |
| D10.4 | **Design insgesamt nicht High End** | Orange-Akzente unpassend (→ D8), Gesamteindruck muss professioneller. Tenant-Farbe + saubere Typografie. | hoch | OFFEN |
| D11.8 | **Mitarbeiter: nur 2 Rollen (Admin + Techniker)** | Aktuell zu viele Rollen. Reduzieren auf Admin + Techniker. Funktionen klar definieren. Bei Mitarbeiter-Anlage: keine E-Mail erwartet? Klaeren. | mittel | OFFEN |
| D11.9 | **Einstellungen: ICS/Kalender-E-Mail kommt nicht an** | Kalender-E-Mail fuer ICS-Einladungen eingetragen + gespeichert, SMS+E-Mail aktiviert — aber ICS-Mail kommt nie an. Muss debuggt werden. | hoch | OFFEN |
| D11.10 | **Case-ID-Prefix: auto 2-Buchstaben aus Firmenname** | Aktuell manuell "WB". Soll automatisch aus Firmenname abgeleitet werden: "Jul. Weinberger AG" → "JW". Dynamisch, nicht hardcoded. | mittel | OFFEN |

---

## OFFEN — Sonstige Tickets

| # | Titel | Labels | Status |
|---|-------|--------|--------|
| #80 | BigBen Pub — Ruecksprache Paul erfolgt | telephony, voice | OFFEN — Paul interessiert, Tier 3 |
| #79 | BigBen Pub — Paul zeigt sich interessiert | decision, voice | OFFEN — Follow-up noetig |

---

## Backlog (trigger-basiert, Post-Build)

| # | Deliverable | Trigger | Status |
|---|-------------|---------|--------|
| N7 | Ops-light UI (reviews-only mode) | Reviews-only Kunde signed | OFFEN |
| N11 | **Adress-Autocomplete** — Swiss Post API / Google Places | Post-MVP | OFFEN |
| N15 | **Terminerinnerung 24h vorher** | Post-Go-Live | OFFEN |
| N16 | **Kunden-Historie** | Post-Go-Live, Kundenfeedback | OFFEN |
| N24 | **Mobile App / PWA** | Erste zahlende Kunden + Feedback | OFFEN |

### Bewusst entfernt (12.03. — Build-Phase Clean Slate)

| Ehemals | Grund |
|---------|-------|
| ~~N3 Kalender-Sync~~ | Nicht im Gold Contact Scope, trigger-basiert |
| ~~N22 Tenant Brand Color → OPS~~ | Geloest durch Leitstand-Redesign (leitstand.md) |
| ~~N23 Analytics Dashboard~~ | Nicht im Gold Contact Scope |
| ~~N25 MS Bookings UX~~ | Nicht im Gold Contact Scope |
| ~~N29 PLZ/Ort Smart Verification~~ | Geloest durch PLZ_CITY_MAP (wizard.md §8, voice.md) |
| ~~N33 Demo-Booking SMS~~ | Obsolet durch Demo→Test-Flow (PR #148) |
| ~~GitHub Issues #81-#93~~ | Bugs werden nach Build-Phase E2E neu getestet |
| ~~Doerfler Go-Live Blocks (D-G, F9)~~ | Superseded durch Founder Release Gate (plan.md) |

---

## LATER (parked, explicit triggers)

| # | Deliverable | Trigger |
|---|-------------|---------|
| L2 | Vertraege / AGB Vorlage | Vor Kunde #2. SaaS-Vertrag CH-Recht. |
| L3 | Failure drills (telephony) | First real incident |
| L5 | LinkedIn Unternehmensseite | 1 Post/Woche nach Go-Live |
| L6 | Bitwarden komplett einrichten | ~4h. Alle Zugaenge. |
| L10 | Retention decisions | Case + attachment retention periods |
| L11 | WhatsApp Sandbox → Prod | Ops Alerts need SLA |
| L12 | Data protection statements | Voice disclosure + Wizard checkbox + DPA |
| L13 | **Demo-Video aufnehmen** | Go-Live + Demo-Strang shipped |

---

## GTM Pipeline v2

**Living docs:** `docs/gtm/` (operating_model, gtm_tracker, gold_contact, outreach_templates, einsatzlogik)
**Redesign-Docs:** `docs/redesign/` (plan.md + 6 Zielbilder + 4 IST-Audits + identity_contract.md)
**Pipeline:** `docs/sales/pipeline.md`

Alle GTM Building Blocks (G1-G12, S1-S9) = DONE. Details → `docs/gtm/gtm_tracker.md`.

---

## Completed (Archiv — kondensiert)

### SMS-Architektur Vereinfachung (14.03.)

| Deliverable | Evidence |
|-------------|----------|
| sendSmsEcall.ts — eCall.ch REST API Client (Swiss Gateway) | PR #197 |
| Twilio-SMS-Pfad komplett entfernt — eCall = einziger SMS-Provider (CH) | PR #199 |
| 2-Tier Sender: alphanumerisch (Tenant) → ECALL_SENDER_NUMBER (FlowSight-Servicenr) | PR #199 |
| Tote `fromNumber`-Logik entfernt (getTenantSmsConfig, postCallSms, API routes) | PR #199 |
| Docs aligned: zielarchitektur.md §12, STATUS.md, env_vars.md, ticketlist.md | PR #199 |
| Voice V2/V3/V6 global gefixt + alle 8 Agents republished | PR #198 |

### Renovation Gold Contact (13.03.)

| Deliverable | Evidence |
|-------------|----------|
| Phase 0: DB Migrations (staff, appointments, case_id_prefix) + shared utilities | PR #192 |
| Phase 1: Identity Sweep R4 (FlowSight unsichtbar, Tenant-Branding) | PR #192 |
| Phase 2: Voice V1-V4 (Juniper, no city echo, urgency 1:1) + Wizard Success Gold | PR #193, #195 |
| Phase 3: Puls-Ansicht (4 Prioritaets-Gruppen) | PR #192 |
| Phase 4: Staff CRUD + Appointments + Einsatzplan + ICS v2 | PR #192 |
| Phase 5: Kennzahlen (8 KPIs) + Einstellungen (Google Review, Termine, Benachrichtigungen) | PR #192, #195 |
| L4 KPI-Click Filter + L9 ICS-E-Mail + L10 Staff-Dropdown | PR #196 |
| Voice Agents published (4 Tenants, retell_sync) | PR #194 |

### S4 Enablement (13.03.)

| Deliverable | Evidence |
|-------------|----------|
| S3 Journey Verification — Trial Expiry Hard Gate + follow_up_due fix | PR #181 |
| Walter Leuthold Voice Agent JSONs (DE + INTL) | retell/exports/walter-leuthold_agent*.json |
| Walter Leuthold Prospect Card + Status | docs/customers/walter-leuthold/ |
| Video-Ordnerstruktur mit vorkonfektionierten Skripten (3 Prospects) | docs/gtm/videos/ |
| SSOT-Update (STATUS, ticketlist) | This commit |

### S1.6: Kategorie-Vereinheitlichung (13.03.)

| Deliverable | Evidence |
|-------------|----------|
| `categories[]` per CustomerSite — SSOT fuer Wizard + Voice | PR #173 |
| CASE_POOL + deriveWizardCategories() eliminiert | PR #173 |
| Shared FIXED_CATEGORIES (Allgemein, Angebot, Kontakt) | PR #173 |
| Values aligned: "Leck" (nicht "Leck / Wasserschaden"), "Heizung" (nicht "Heizungsausfall") | PR #173 |

### Block B: Wizard + Review Gold (13.03.)

| Deliverable | Evidence |
|-------------|----------|
| Wizard Notfall-Logik (N1-N7): Phone-CTA-Screen | PR #171 (S1.5) |
| Review Surface Gold (RS1-RS10): Komplett-Rewrite | PR #171 (S1.7) |
| Nachlauf-System (NS1-NS3): 6 Status, Resend, Skip | PR #171 (S1.8) |
| Leitstand Review-Badges + Aktionen | PR #171 (S1.9) |
| deriveReviewStatus() — shared lib | PR #171 |
| Skip-Review + Track API routes | PR #171 |

### Block A: Identity + Lifecycle (13.03.)

| Deliverable | Evidence |
|-------------|----------|
| Identity Contract auf alle 7 E-Mail-Templates | PR #168 (S1.1) |
| Day-5 Engagement-Nudge (Suppression bei >=3 Cases) | PR #169 (S1.2) |
| Day-7 Engagement-Snapshot (JSONB) | PR #169 (S1.4) |
| Demo-Case-Tabs ("Ihre Fälle" / "Demo") | PR #169 (S1.3) |
| Welcome-Page Trial-Countdown | PR #169 (S1.10 partial) |
| Tab-Titel `{short_name} OPS` | PR #168 (S2.6) |
| DB Migration: day5_nudge_sent_at, day7_snapshot, is_demo | PR #169 |

### Redesign-Phase (12.03.)

| Deliverable | Evidence |
|-------------|----------|
| Leitstand Zielbild | docs/redesign/leitstand.md |
| Voice IST + Zielbild | docs/redesign/voice_ist.md + voice.md (PRs #153-#155) |
| Identity Contract | docs/redesign/identity_contract.md (PR #156) |
| Prospect Journey IST + Zielbild + Schaerfung | docs/redesign/prospect_journey_ist.md + prospect_journey.md (PRs #157-#158, #164) |
| Wizard IST + Zielbild | docs/redesign/wizard_ist.md + wizard.md (PRs #160-#161) |
| Review IST + Zielbild | docs/redesign/review_ist.md + review.md (PRs #162-#163) |

### Trial Machine + Monitoring (11.03.)

| Deliverable | Evidence |
|-------------|----------|
| Operating Model (6 Phasen) + Trial Lifecycle DB | PR #131 |
| provision_trial.mjs + offboard_tenant.mjs | PR #131 |
| Trial Lifecycle Emails (Welcome, Offboarding) | PR #134 |
| Scout v3 (Voice Fit Scoring) | PR #135 |
| Lifecycle Runner (Tick-Route, Milestones, Day 13 Email) | PR #136 |
| Prospect Welcome Page (/ops/welcome) | PR #136 |
| Monitoring-Haertung (Morning Report Cron, Tick-Failure Alert, Health Check) | PR #138 |
| Reise-Haertung (Runbook, Trial-Timing-Regel, Deep Health) | PR #139 |

### GTM Foundation (09.-11.03.)

| Deliverable | Evidence |
|-------------|----------|
| Weinberger AG Website (GTM Goldstandard) | PR #116 |
| Weinberger Lisa DE + INTL (B-Full) | PR #118 |
| GTM Building Blocks (G1-G12) | PRs #131-#150 |
| Gold Contact Nordstern | PR #145 |
| 299 Flat Pricing | PR #147 |
| Demo→Test Flow | PR #148 |
| Lisa Interest Capture | PR #150 |

### Architecture + Quality Wave (10.03.)

| Deliverable | Evidence |
|-------------|----------|
| RLS Migration (tenant isolation) | PR #128 |
| Tenant Scoping (resolveTenantScope.ts) | PR #128 |
| Review Surface (Google-style, HMAC) | PR #127-#128 |
| Demo-Dataset (seed_demo_data.mjs) | PR #128 |
| Voice Fixes (Closing, Greeting, PLZ Lookup) | PR #126-#127 |
| Dashboard Branding (Tenant Name + Initials) | PR #127 |
| Prospect Magic-Link + Rollenmodell | PR #130 |

### Web-Engine + Voice (04.-09.03.)

| Deliverable | Evidence |
|-------------|----------|
| 7 Customer Websites auf einheitlichem Standard | PRs #62-#97 |
| Wizard Restructure (Anliegen, Top-3, Photos) | PR #113 |
| Voice Agent v4 (reporter_name, closing, empathy) | PRs #83-#86 |
| BigBen Pub Custom Demo | PRs #62-#72 |
| Scout v2 (ICP Scoring, Multi-Query) | PRs #73-#75 |

**Aeltere Completed (vor 04.03.):** Siehe `docs/archive/wave_log.md`
