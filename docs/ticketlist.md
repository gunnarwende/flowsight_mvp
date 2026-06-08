# Ticketlist — FlowSight (SSOT)

**Updated:** 2026-06-08 — **🛠️ ONBOARDING-COCKPIT WELLE 1 + 2 GEBAUT & LIVE.** Co-Pilot `/aufbau/[token]` durchklickbar auf `flowsight.ch`. Welle 1: roter Faden + einklappbare Hinweise + Verantwortungs-Transfer; Lisa (T1 Telefonanbieter, T2/T3 Notfall&Notdienst, T4 Feiertags-Voice-Scripting durch alle 3 Ebenen, Grenzen), Website (W1 Agentur, W4 Foto), Leitsystem (L3 Nachrichten vorausgefüllt+Kanalwahl, R2 Place-ID, R3 Schwelle, R4 End-User-Aha), N3-Korrektur, Go-live-Validierung, Optik-Top-4. Welle 2: #1 Entlastungs-Karten+N7+G5, #2 N5+G4, #3 M3 PDF-Export, #4 M2 „Meine Einstellungen" (über `/ops/settings`+Setup-PDF). Google im Cockpit = reibungslos angenommen (kein „in Vorbereitung"), Intent+Konto erfasst → wir richten ein. Founder-Feedback wortgetreu in Git (`Chat.txt`+Protokoll+Backlog). PRs #579–#584.

## 🔭 OFFENE / VERTAGTE TICKETS (bewusst, bei echtem Bedarf — 0 Kunden = nicht vorbauen)
- **[K4] Google-Kalender im Code (OAuth + Free/Busy).** *Offen:* eigener Google-OAuth-Flow (Consent/Callback/verschlüsselte Token) + Google-Free/Busy-Client (spiegelt `outlookClient`) + Terminpicker-Anbindung + E2E-Test. *Lösung:* fokussierter ~Halbtages-Bau, sobald ein echter Kunde Google-Kalender nutzt. *Warten auf:* (a) solcher Kunde; (b) Google-Cloud-OAuth-App (Client-ID/Secret → Vercel-Env) = Founder-Schritt (~5–10 Min, Anleitung folgt bei Bedarf). *Vorgebaut:* Cockpit erfasst Provider=google + optional Google-Konto (`modules.calendar_google_account`) → kein Daten-Verlust. *Kein Risiko aktuell:* Outlook/M365 deckt ~80–90 %.
- **[P5] Lisa-Website-Job-Scan (1×/Tag offene Stellen ziehen).** *Offen:* neues Feature (Crawl + Voice-Wissen-Update). *Lösung/Warten:* bei echtem Bedarf bauen.
- **[Wartungs-Erinnerungen] (z. B. jährl. Heizungsservice).** *Offen:* neues Feature. *Warten:* echter Bedarf.
- **[Notfall-SMS an Inhaber]** statt nur Push+E-Mail. *Offen:* Trigger auf Notfall-Case → `sendSms` an `emergency_contact`. *Lösung:* eigener E2E-getesteter Bau **nach** dem Dörfler-Versand (Live-Case-Pfad). *Vorgebaut:* Empfänger im Cockpit erfasst.
- **Geparkt (Welle-3-Visual):** radiale 5-Sterne-Ebene pro Knoten — Spec in `cockpit_requirements_backlog.md`.

**Updated:** 2026-06-06 — **🧭 ONBOARDING-COCKPIT — DESIGN-PHASE KOMPLETT (Wochenend-Sprint).** Onboarding komplett neu als **Self-Service-Cockpit** (Co-Pilot, IKEA/Self-Checkout) spezifiziert — alte Bible → `docs/archive/onboarding/Onboarding_bible_v0.md`, frisch unter `docs/gtm/onboarding/` (Master + Phase-1-Playbook + 4 Phase-2-Specs). **4 Phasen:** 1 Das Gespräch (Live-Playbook) · 2 Cockpit (Bau) · 3 Review & Go-live (Pay) · 4 Validierung. **Pricing-Modell (Founder-bestätigt):** Premium — Aktivierung + Monat, monatlich kündbar, **kein Trial**, zahlend am Go-live (Richtwerte; 0 Kunden → erste 3-5 = Preis-Findung). Seam: `tenant_config.json` = Through-Line. Voice = 7 Dispositionen → 3 Körbe (Fall/Nachricht/nichts). **Bau-Backlog OC1-OC7 unten.** Vorlauf:

**Updated:** 2026-05-25 Re-Entry Pfingstmontag — **🌋 POST-REISE Operative Hygiene + Strategie-Pivot.** PR #525 (Morning-Report tenant-scope + Pub-Mode + Resend) merged. Damien-Cusack-Fall (23.05. 2× pending) = Founder-Action heute. Dörfler T3 with-mouse-MP4 gerendert (5.8 MB, 1113 Mouse-Events). Strategische Entscheidungen: Premium-Pricing 1.5-2.5k CHF/Mo, Max-10/Monat-Cap, Website-Modul tot, ICP 300-400 statt 5'400, Self-Service-Onboarding geparkt bis Kunde 5+. Neue Docs: `docs/sales/discovery_questions.md`, `docs/gtm/icp_filter.md`, `docs/gtm/loom_cta_v2.md`. **Offene Punkte heute:** Damien-Call (Founder), T4 Mouse-Recording (Founder), 14.05.-agent_hangup-Investigation. Day-30-Pre-Reise-Kontext:

**Updated:** 2026-04-30 Day-30 Pre-Reise EOD — **🎬 T3 LOOM-AFTER-BUILD ARCHITEKTUR LIVE für alle 4 Tenants. PIPELINE_BIBLE §62 etabliert.** FB14/FB15/FB16: Overlay-on-Overlay-Approach veto'd ("wird nie skalierend funktionieren"). Architektur-Pivot: Loom kommt NACH Phase-Build via `apply_loom_to_t3_master.mjs`. 4 Tenants × T3 mit NEW Loom (mini_takes/Take3/Take3_cut.mp4) + W=105.0 (0.5s später als initial — Founder-Wahl) gebaut. Loom-Continuity verifiziert (no freeze). Master-Backup gesichert. **Carry-Forward (post-Reise):** T3+T4 Mouse-Layer (per `scripts/_ops/mouse_layer/`), Founder-Sichtung Leins/Stark/Wälti T3, Onboarding-Maschine + 6-Wochen-Roadmap. Day-30-Mittag-Kontext:

**Updated:** 2026-04-30 Day-30 Mittag — **🏆 DÖRFLER AG T1-T4 KOMPLETT ABGENOMMEN.** Take 4 Master-Schablone gebaut: 3-Phasen (small Loom mit FB9 mirror+shift+offset+fade-out 97-99s, hide-circle navy darunter gegen FB12-Doppel-Flicker; big Loom +40 shift mit fade-in 97-99s smooth iris-transition; audio End.wav loudness-matched +0.6dB ab master 97s mit 1.95s pause). PIPELINE_BIBLE §60 (T4 Schablone) + §61 (Modul-Skalierung) ergänzt. Noch offen: Maus-Layer Phase 4 für T3+T4 (heute home-office vor Founder-Reise). Day-30-Late-Night-T2-Kontext:

**Updated:** 2026-04-30 Day-30 Late-Night — **🎬 T2-PIPELINE UNIVERSELL GEFIXT.** Drei Architektur-Patches: §56 Universal CALL_END_TOTAL (`apply_loom_take2.mjs` dynamisch = `CALL_START + phoneExtended.duration` → "Anruf beendet"-Hold vollständig sichtbar in allen Tenants/Varianten), §57 Anruf-beendet Display synchron zu live-Timer (`take2_samsung.html` snap on `endCall()`), §58 T2 High-End QG (`scripts/_ops/quality_gate_take2.mjs` Phone-Region Color-SSIM gegen Dörfler-Gold). §59 Loom-Avatar-Hierarchy (per-tenant + shared + legacy fallback). 4 Master-Takes promoted: Dörfler T2 Notruf + Leins T2 Preis (mit neuem Founder-Loom aus mini_takes), Stark T2 Notruf + Wälti T2 Preis. T3-Loom-Source platziert (`_shared/loom_t3_final.mp4`), volle Re-Integration ist Pipeline-Plumbing-Folge-Schritt. **Review morgen früh:** alle 4 T2-Master-Files. Day-29-Recovery-Kontext:

**Updated:** 2026-04-29 Day-29 Recovery — **🚨 PIPELINE-CRASH + RECOVERY.** Mausphase 29.04. nachts hat Apr-28-State zerstört, Apr-27-Backup hat Dörfler+Leins gerettet. Wiedereinstieg: lies `docs/gtm/pipeline/RESUME_HERE.md` ZUERST. Status: 5 Takes APPROVED + master_takes/ Backup (Dörfler T1+T4, Leins T1+T2-Preis+T4). 4 Takes PENDING Founder-Verifikation (Dörfler T2-Notruf+T3, Leins T3, Loom-during-call ist Known-Open). Stark+Wälti T1+T4 preserved Apr 28; T2+T3 müssen NEU gebaut. **Pipeline-Lessons:** TaskStop killt ffmpeg subprocess NICHT (Stop-Process nötig); FFmpeg-overlay-postproduction zu langsam (1h+ pro File auf 1440×900); Loom-Fix-Approach jetzt HTML-Layer in take2_samsung.html statt Re-Encode. **Founder-Schablone-Approach genehmigt:** Leins T2 Preis als Master für alle Preis-Tenants, swap nur 8 tenant-specific Differenzen. Day-25-Kontext (überholt):
**Updated:** 2026-04-25 Day-25 Morning — **🔊 AUDIO-PIPELINE PHASE A DONE (autonom Nacht 24→25.04.).** Während Founder schlief autonom gebaut: 13 Scripts unter `scripts/_ops/audio/`, 36 cleaned Founder-Audios, 15 Lisa-TTS (9 generic + 2 variant + 4 tenant greetings), 8 assemblierte Calls, 20 Take-Audios (4 Tenants × 5 Takes), 20 Preview-Videos, HTML-QG-Report. **80/80 Gates PASS.** Review: `docs/gtm/pipeline/06_video_production/_generated/QUALITY_GATE_REPORT.html`. Bible §35 ergänzt. **Nächster Schritt (Phase B):** Screenflow-Retiming (Take 2 93s→340s, Take 3 61s→170s, Take 4 106s→152s) + Take 1 Screenflow für Leins/Stark/Wälti. — Kontext Tag 24:

**Updated:** 2026-04-24 Day-24 Evening — **🔒 PRODUCTION-BASELINE FIXED.** Pipeline Screenflow Take 2+3+4 ist 10/10 für alle 4 Referenz-Betriebe (Dörfler, Leins, Stark, Wälti). Round-15 abgeschlossen (FB42-FB60 alle gefixt, direkte Review-Page-Pop-Animation, Viewport-Meta-Root-Cause, No-Regression-Lock in PIPELINE_BIBLE §34). **Pipeline bereit für Scale 10-30 Betriebe/Tag.** Nächster Schritt: Audio-Layer (Founder-Aufnahme Take 2-4 Master + Audio×Screenflow-Mapping). — Kontext Tag 23:

**Updated:** 2026-04-23 Late-Night (Sales Day 23: **3-Betrieb-Gold-Standard erreicht (Leins + Stark + Wälti).** Take 4 Review-Flow Round-3-Iteration: FB32 Samsung-Pop-Animation + FB34 Review-Layout + FB37 Dual-Selector-Fix + FB38 Reveal-Overlay Smart-Gate + FB39 Andreas Gerber deterministische Zeit + FB40 Wallpaper-Crop + FB41 Samsung One UI 6 Nav-Icons. Alle 3 Betriebe Take 2+3+4 neu gebaut (35/35 QG PASS pro Tenant). Pipeline-Bible §31 ergänzt. **Ready für Founder-Review + 10/Tag-Skalierung.**)
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
- **Pricing:** **PIVOT zu Premium (06.06., Founder-bestätigt für Neukunden-Akquise):** einmalige Aktivierung (~CHF 1'500–2'500) + Premium-Monat (~CHF 1'900–2'400), monatlich kündbar, **kein Gratis-Trial**, zahlend am Go-live. Anker = Empfangskraft/verpasster Auftrag, nicht Software. 0 Kunden → Richtwerte, erste 3-5 = Preis-Findung, nie rabattieren (Scarcity 10/Mo). Altes 299/499/799-Tier-Modell für Akquise abgelöst. Detail: D101 zielarchitektur + Onboarding-Bible §4.
- **BLOCKER:** 0
- **BigBen Pub:** ERSTER KUNDE (Paul). Barter-Deal. Voice EN+DE LIVE (+41445054818), PCA structured extraction. Dashboard 6 Cards. Go-Live prep 90% complete, waiting for Paul's photos/videos. 35 PRs (#457-#467 + #479-#499).
- **Phase:** Sales Day 23 Late-Night. **Take 4 Review-Flow Gold-Standard für 3 Betriebe (Leins + Stark + Wälti).** FB32-FB41 gefixt: Samsung-Pop-from-Link Animation, Review-Layout-Konstanten, Dual-min-h-dvh-Selector-Falle, Reveal-Overlay Smart-Gate, deterministische Seed-Zeiten, Wallpaper-Crop, Samsung One UI 6 Nav-Icons (3-bar+square+chevron). Pipeline-Bible §31 ergänzt. Alle 3 Betriebe verifiziert Phone2-Ende + Review-Start auf identischer Y-Position.
- **Nächste Schritte (Tag 24, 24.04.):** **Founder-Review 3-Betrieb-Set (Leins + Stark + Wälti Take 2/3/4).** Parallel: Audio+Voice-Layer Master-Segmente (Founder-Aufgabe). Danach: 10/Tag-Skalierung produktiv (run_pipeline_multi.mjs --parallel=2), Loom-PiP-Integration Audio-sync, Outreach-Phase vorbereitet. Take 1 (Website-Video) fehlt noch.
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

## ONBOARDING-COCKPIT — Bau-Backlog (Phase 2, Code · backend-first)

> **Bau-Stand 06.06. (Sa-Abend):** OC1–OC5 autonom als gestapelte, **rein additive, live-sichere** PRs **#572–#576** gebaut — dormant bis Retell `call_type` emittiert; nichts live bis Merge + `supabase db push`. OC6/OC7 = Founder-involviert. **Merge-Reihenfolge:** #571 → #572 → #573 → #574 → #575 → #576. Specs: `docs/gtm/onboarding/phase2_*`.

| # | Titel | Beschreibung | Status |
|---|-------|-------------|--------|
| OC1 | `tenant_callbacks` generalisieren | aus `pub_callback_requests` tenant-agnostisch (reason = callback / order_followup). Webhook- + Leitsystem-Pfad. | ✅ PR #572 |
| OC2 | Webhook `call_type`-Verzweigung | FALL→`cases` / NACHRICHT→`tenant_callbacks` / NICHTS→suppress. Fallback: Intake-Daten→FALL. Ersetzt „jeder Call→Fall". | ✅ PR #573 |
| OC3 | `modules.voice_dispositions` + Notify | JSONB-Policy je Disposition; Webhook liest Notify/Suppress; Reklamation/Notfall→Push an Inhaber; Info/Privat→Case-Suppression. | ✅ PR #574 |
| OC4 | Leitsystem „Nachrichten"-Ansicht | neuer Tab liest `tenant_callbacks` (Resolve/Dismiss), analog BigBen-Callback-Seite. | ✅ PR #575 |
| OC5 | **Cockpit-UI (Hauptbau)** | 3 Stränge/Screens aus Manifest+Struktur; confirm-not-create; Beweis-Loops; Finale. Navy+Gold. **Mehrtägig.** | 🟡 PR #576 (Gerüst; Daten-Layer/Flows offen) |
| OC6 | Cockpit↔DB/Retell + is_demo-Test | Cockpit liest `tenant_config` → schreibt DB (`modules`+`staff`) + Retell-Prompt (publish); Test-Calls `is_demo`. | OFFEN (Founder) |
| OC7 | Onboarding-Mail-Versand | `send_onboarding.mjs` (Resend, Founder-Absender, `--preview`); Dörfler-Content steht; Ziel-Link = Cockpit. | OFFEN — am Ende |

---

## [STOPP] — E2E-Blocker

Keine.

---

## OFFEN — Founder-Actions

| # | Titel | Beschreibung | Status |
|---|-------|-------------|--------|
| RE1 | **Paul anrufen → Damien-Cusack-Reservation** | 2× pending Reservierungen 23.05. für 24.05. 17:00 (Irisches Hurling-Match). Paul nie bestätigt. Damien `+41796366248` zurückrufen lassen. | OFFEN — HEUTE |
| RE2 | **Dörfler T3 with-mouse-MP4 reviewen** | `master_takes/take3/doerfler-ag_with_mouse.mp4` (5.8 MB) — 4489 frames mit 1113 Mouse-Events. Approve oder Re-record. | OFFEN — HEUTE |
| RE3 | **14.05.-agent_hangup-Investigation** | Retell call_id im Zeitfenster 2026-05-14 14:56:27 (von +41784053440, dur=24s, disconnect=agent_hangup). Wieso hat Lisa aufgelegt? Transcript analysieren. | OFFEN |
| T3.1 | **Founder-Sichtung Leins/Stark/Wälti T3 (NEW Loom)** | Visuelle Abnahme der 3 weiteren T3 Master mit NEW Loom + W=105.0 (Dörfler abgenommen) | OFFEN — Pfingstwoche |
| T3.2 | **Mouse-Layer T3 Recording (Dörfler)** | DONE: with_mouse.mp4 rendered 25.05. (5.8 MB). Wartet auf Founder-Approve (RE2). | DONE — Review pending |
| T3.3 | **Mouse-Layer T4 Recording (Dörfler)** | `node scripts/_ops/mouse_layer/record.mjs --slug doerfler-ag --take 4` — Founder im Browser klickt ▶. Nach Aufnahme: `render.mjs`. | OFFEN — Founder-Touch |
| T3.4 | **Mouse-Layer Skalierung Leins/Stark/Wälti** | T3+T4 Mouse-Render pro Tenant nach Approve Schablone (sollten tenant-agnostic sein, Pfad identisch) | OFFEN — nach RE2 |
| GTM1 | **ICP-Re-Filtering 5'400→300-400** | Bestehende Marktanalyse durch ICP-Filter-v2 jagen (`docs/gtm/icp_filter.md`). Crawler `crawl-website.mjs` + `crawl_google_reviews.mjs` mit Keyword-Match erweitern. | OFFEN |
| GTM2 | **Loom-CTA Variante A Audio-Re-Recording** | `docs/gtm/loom_cta_v2.md` Variante A. Speakflow-Template aktualisieren + Audio-Take 4 Closing neu aufnehmen. | OFFEN |
| GTM3 | **Premium-Pricing-Implementierung** | Pricing-Page + Outreach-Templates auf 1'500-2'500 CHF/Mo umstellen. Stripe-Side später. | OFFEN |
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
