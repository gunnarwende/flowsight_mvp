# FlowSight Dokumentations-Konsolidierung — Aktionsplan + Ziel-Architektur

> Erstellt 2026-06-21 durch Mehr-Agenten-Analyse (17 Auditoren, Datei-für-Datei über alle 377 docs-Dateien, gegengeprüft an STATUS/ticketlist/Bibles + Repo-Realität). Arbeitsdokument — wird nach Ausführung selbst archiviert. NICHTS wird ausgeführt ohne Founder-Freigabe pro Abschnitt.

---

## 1. Überblick

| Kategorie | Anzahl | Bedeutung |
|---|---|---|
| KEEP | ~118 | Kanonisch oder legitime Pro-Betrieb-Datei (founder_review/links/status/index pro Slug) — bleibt |
| ARCHIVE | ~115 | Wissen historisch/abgelöst → nach `docs/_archive/`, nicht löschen |
| MERGE | 4 | Echte Dublette → in Master einarbeiten, Quelle entfernen |
| DELETE | ~32 | Echter Müll (ffmpeg-concat, generierte verify-Reports, node_modules) |
| DECIDE | ~22 | Founder-Entscheidung nötig |

Wirkung: aktiver `docs/`-Lesepfad schrumpft von ~377 auf ~120 lebende Dateien (~43 % weniger Fläche, die gegen Drift gepflegt werden muss). Tote Cluster (`redesign/`, `gtm/website/`, alte Takes/Timelines, `_generated/`) raus aus Suche/Navigation. Zwei node_modules-Bäume raus aus Git-Index.

**Bei fast keinem ARCHIVE/DELETE geht Wissen verloren — der Wert steckt in den `preserve`-Notizen (Abschnitt 2). Die MÜSSEN zuerst gesichert werden.**

---

## 2. WISSENS-SICHERUNG ZUERST (der kritische Teil)

Vor jeder Archivierung/Löschung in die kanonischen Dateien einarbeiten. „Prüfen" = ist es schon drin? Wenn ja, nichts tun.

### → docs/gtm/sales/SALES_BIBLE.md
- Verkaufspsychologie-Hebel (aus `gold_contact.md` + `schatztruhe_final.md`): 5-Stufen-Kaufmodell, Spiegel-Effekt, 6 Psychologie-Hebel, „Was darf nie passieren"-Liste, defensives Verkaufen.
- Versand-Timing-Heuristik (`pipeline/feedback/versand_timing_analyse.md`): Di–Do; 06:30–07:15 / 12:00 / 18:30–19:30; Saison Sep–Nov hoch.
- Discovery + Einwand-Tabelle (`docs/sales/discovery_questions.md`): 3 Mom-Test-Fragen + Referral; 8 Sanitär-Einwände; Doerfler-Discovery-Wedge.
- Founder-Release-Gate-Logik (`redesign/plan.md`): 10 Berührungspunkte.
- Segment-A/B/C-ICP-Lehre (`gtm/website/analyse_modul1_vs_modul2.md`): website-schwach = mehr Reibung/Churn/weniger Zahlungsbereitschaft.
- Markt-/Sweetspot (`redesign/leitstand/pricing_und_marge.md`): Kern-ICP 5–15 MA, ~970 ZH / ~5700 CH, SMS = Hauptkostentreiber, FSM-Kategorie.

### → docs/gtm/sales/lessons_learned_sales.md
- Existenz-Validierungs-Gates (`gtm/website/korrektur_widmer_fehlselektion.md`): Website-Health-Check, Review-Plausibilität (>20J UND <5 Reviews), zefix-Check, Vor-Ort/Telefon. „Google-Maps ≠ Existenzbeweis." HOCH relevant für Lead-Motor.
- Roh-Call-Funde (`gtm/sales/customers/2026-06-17/Mitschrift.txt`): Crawl-MA-Zahl-Fehler, „30-Sek-Reframe löst Neins aus", Pipeline-Go-Liste.
- Goldene Regel #1 prospect_card: keine erfundenen Fakten, data_sources Pflicht.

### → docs/gtm/CUSTOMER_JOURNEY_BIBLE.md
- D83-Fallback-Kriterien (`gtm/website/entscheidung_final.md`): 4 Bedingungen für Basis-Website + „Ihre Website bleibt wie sie ist".
- North-Star (`archive/onboarding/FlowSight_Customer_Journey_Long.md`): „vom Reagieren zum Steuern", „verkauft Leitsystem nicht KI".

### → docs/gtm/pipeline/PIPELINE_BIBLE.md
- Voice-Provisioning (`gtm/machine_manifest.md`): 23 Platzhalter, is_transfer_cf, inbound_agent_id-Gotcha.
- Greeting-Fixlänge (`AUDIO_PIPELINE_PLAN.md` + feedback.txt + `_lisa_greeting_originale/_README.txt`): über alle Tenants exakt gleich lang; Notruf=Doerfler, Preis=Leins; Voice-IDs.
- Reminder-/Werktag-Regel (`pictureflow/feedback/Archiv/Feedback.txt`): Termin Folgetag +24h; Videos nur Werktag→Werktag.
- QG-Learnings (`_generated/qg/T2_QG_FINDINGS_*.md`): Phone-Region-SSIM, Color, Doerfler-Notruf-Referenz.
- Konsistenz-Matrix (`vorstellungsmaschine_plan.md`): Uhrzeit/Datum/Firmenname/Fallnummer.
- ffmpeg/Re-Encode-Lessons (`RESUME_HERE.md`): nie overlay+enable auf 1440x900; Backup nach Approval.
- Scalability-Kontrakt (`pictureflow/.../FEEDBACK_TRACKER.md`): Take-2 liest nur aus tenant_config.json.
- Self-Sufficiency-Blocker (`07_stresstest/README.md`).
- Bewusste ABLEHNUNGEN (`pipeline/feedback/verbesserungsvorschlaege_video_pipeline.md`): kein salesiger/emotionaler Closer (CH passiv), kein Verpasst-Anruf-Kontrast — sonst nirgends erfasst.
- Evidence-Prinzip (`archive/customer_modernization_pipeline.md`): Verified/Assumption/TBD.
- Take-Voiceover-Wortlaute (`speakflow_template.md` / `Final_generic_scripting.txt`) — siehe D4.

### → docs/architecture/zielarchitektur.md (bzw. contracts/)
- Variablen-Referenz-Tabelle (`contracts/prospect_manifest.md`): Feld→Touchpoint-Mapping.
- Identity-Rules R1–R7 + E1–E6 (`redesign/identity_contract.md`) → nach `architecture/contracts/`.
- Outlook-Kalender-Architektur (`redesign/leitstand/kalender_integration_outlook_implementation_log.md`): Application Permissions, AES-256-GCM-Tokenablage.
- Cookie-Switcher (`redesign/scaling_access.md`): fs_active_tenant nur admin, resolveTenantScope.
- archived-Status-Semantik (`runbooks/archive_test_data.md`); FALLBACK_TENANT_ID (`runbooks/supabase_seed_tenant.md`).
- Nicht-geheime Identifier (`archive/architecture/runtime_bindings.md`): Supabase project-ref, Sentry, Vercel — falls nicht in env_vars.md.
- Leitstand-Produktvertrag (`redesign/leitstand/leitstand.md`): 5 Bereiche, Rollenmodell, Anti-Drift.

### → docs/ticketlist.md
- 37 Lint-Errors (`gtm/sales/Kommunikatin chat gpt/mobile_founder_command_diagnose.md`) — bereits gefixt/gemerged, als Eintrag + Mobile-Command-Hebel.
- Kommunikations-Regeln I1–I5 (`kommunikationsmatrix_v2.md`).
- Voice-Kosten-Entscheidung (`redesign/leitstand/ceo_voice_decision.md`): Retell + GPT-4o-mini, kein OpenAI Realtime.
- Offene Kalender-Phasen (`plan_kalender_integration.md` + `plan_google_bewertungen.md`).

### → docs/gtm/onboarding/lessons_learned.md / ONBOARDING_BIBLE.md
- Goldene Regeln G1–G12 (`archive/onboarding/Onboarding_bible_v0.md`).
- v0-Go-live-Ops (`playbook_6_phases.md` + `customer_runbook_template.md`): Provider-Weiterleitung, PWA-Install, E2E-Testanruf, Run-Sheet.
- Gastro-Onboarding (`bigben-pub/onboarding_plan.md` + `e2e_quality_gates.md`): DB-Schema, ~30–40h, 3-Kanal-QG, L1–L3.

### → SMS/Compliance-Doc (eCall.ch)
- CH-SMS-Regeln (`runbooks/twilio_a2p_registration.md`): alphanumerische Sender, transactional only, STOP/HELP, <10/Tag, max 11 Zeichen.
- Finale SMS-Templates (`redesign/leitstand/plan_Leitsystem.md`): ≤160 Zeichen.

### → Verifizieren bevor Verschieben (Betriebsdaten)
- `customers/sanitaer-kilchberg/founder_review.md` trägt Waelti-Daten (gleiche Zefix), aber Inhaber „Heinz Waelti" + Prefix WO fehlen im Waelti-Review → falls verifiziert in `waelti-sohn-ag/status.md`, dann archivieren.
- Doerfler GBP-Werte kanonisch aus `founder_review.md`, nicht aus `FACTS_VERIFIED.md`.

---

## 3. Echte Dubletten & Merges

### 3.1 FlowSight_Customer_Journey_SSOT.md (2 Kopien — verifiziert divergent)
- Master: `docs/gtm/sales/FlowSight_Customer_Journey_SSOT.md` (hat Bible-Cross-Pointer §3/§5).
- Geht: `docs/gtm/onboarding/FlowSight_Customer_Journey_SSOT.md`.
- VORHER rüber: der „Kanäle (Entscheidung 11.06.)"-Block (vor Ort > Anruf > WhatsApp > SMS > E-Mail; WhatsApp = warmer Kanal; Mail-Copy S6–S8) — fehlt in der Sales-Kopie.

### 3.2 email_nicht_erreicht.md (2 Dateien — verifiziert unterschiedlich)
- Master: `docs/gtm/sales/templates/email_nicht_erreicht.md` (Founder-freigegeben 19.06.).
- Geht: `docs/gtm/sales/email_nicht_erreicht.md` (ältere „verloren"-Variante).

### 3.3 business_briefing.md ↔ zielarchitektur.md
- Keine Datei-Dublette, Inhalts-Überlappung. BEIDE KEEP. Im INDEX Rollen trennen: business_briefing = Executive-One-Pager, zielarchitektur = technische SSOT.

### 3.4 Sonstige
- `gtm/sales/phase1_gespraech_playbook.md` → in SSOT (Doerfler-§9 zuerst sichern).
- `archive/onboarding/FlowSight_Customer_Journey_Short.md` → in `_Long.md`.

---

## 4. Archiv-Liste → docs/_archive/

- **4.1 redesign** (kompletter Ordner) → `_archive/redesign/`. Ausnahme: `redesign/flowsight_ceo_app.md` → KEEP nach `architecture/`. Ausnahme: identity/wizard/review/voice/scaling_access → erst D2/D3.
- **4.2 website** (D83 tot) `docs/gtm/website/` → `_archive/gtm-website/` (Existenz-Gates + Markt-Daten zuerst sichern). Auch `architecture/website_playbook.md`.
- **4.3 alte GTM-Konzepte** → `_archive/gtm-legacy/`: gold_contact, schatztruhe_final, operating_model, gtm_tracker, einsatzlogik, quality_gates, qa_gate, machine_manifest, video_manifest, video_template, video_production_plan, vorstellung, vorstellungsmaschine_plan, screenflow_pipeline_architektur, take2_storyboard.
- **4.4 Pipeline-Historie/Stresstests/Timelines** → `_archive/pipeline-history/`: AUDIO_PIPELINE_PLAN, RESUME_HERE, 07_stresstest/*, pictureflow/feedback/Archiv/*, feedback/*, _generated/qg/*, timelines/*.
- **4.5 alte Takes Doerfler** → `_archive/customers-doerfler/`: INPUTS_REQUIRED, ONBOARDING_QUESTIONNAIRE.autofill, web_demo_evidence, web_discovery, takes/.../speakflow_*.txt.
- **4.6 BigBen-Build-Historie** → `_archive/customers-bigben/`: projekt_briefing, onboarding_plan, bug_analysis_28_04, e2e_quality_gates, live_setup_29_04.
- **4.7 archive/* vereinheitlichen** (niedrige Prio).
- **4.8 Runbooks selektiv** → `_archive/runbooks/`: archive_test_data, supabase_seed_tenant, twilio_a2p_registration (CH-SMS zuerst sichern).
- **4.9 Sales-Tagesordner** → `_archive/sales-tage/`: `2026-06-16/` + `2026-06-17/` komplett (Mitschrift-Funde + Leads zuerst destillieren).
- **4.10 Evidence** → `_archive/evidence/`.
- **4.11 Inaktive Betriebe** (orlandini/widmer/sanitaer-kilchberg) → D6.

---

## 5. Delete-Liste (echter Müll, regenerierbar)

- node_modules: `redesign/redesign_website/production/node_modules/**` + `.../Screens/node_modules/**` (+ .gitignore).
- ffmpeg-concat-Listen: roleplay `_tmp_*/concat_*.mp3.txt` (4), `_generated/qg/.../_audio_test/*.txt` (5), `_generated/previews/.../concat.txt`, doerfler `_splice_concat.txt`, redesign animatic `concat.txt`.
- generierte Reports: `_generated/verify/take4_*.md` (~8), `_generated/transcripts/doerfler-ag/*.md`, `_generated/phase_library/.../schedule.template.txt`.
- Byte-Dublette: `gtm/sales/customers/2026-06-16/roleplay/lernblatt.txt` (= `gtm/sales/lernblatt.txt`).
- `redesign/leitstand/analyse/11_screenshot_anleitung.md`; `docs/sales/todays_list.md` (regenerierbar).

---

## 6. Decide-Liste (Founder entscheidet)

| # | Datei(en) | Frage | A (empfohlen) | B |
|---|---|---|---|---|
| D1 | 2× Customer_Journey_SSOT | Master? | **Sales** (Kanäle-Block einarbeiten, onboarding löschen) | onboarding |
| D2 | redesign/identity_contract.md | Kanonisieren? | nach `architecture/contracts/` | Archiv |
| D3 | redesign/wizard, review, voice, scaling_access | Referenz oder Archiv? | Kern-Specs nach `architecture/` | Archiv + in zielarchitektur |
| D4 | speakflow_template + Final_generic_scripting | Kanonische Sprechvorlage? | EINE in PIPELINE_BIBLE verankern | beide Archiv falls Skripte Texte halten |
| D5 | redesign_website/video_final.md | Video-Spec behalten? | als einziges Video-Doc | Archiv |
| D6 | orlandini, widmer, sanitaer-kilchberg | Reaktivieren? | reaktivieren | Archiv (kilchberg: Waelti-Inhaber sichern) |
| D7 | runbooks/peoplefone_front_door.md | Merge? | in phone_routing_registry mergen | Mechanik-Doc behalten |
| D8 | demo_script + reise_checklist + pipeline.md | Trial/299 (D101-Konflikt) | Trial raus, Rest behalten | komplett Archiv |
| D9 | contracts/prospect_card + prospect_manifest | Schema gültig? | Variablen-Tabelle in zielarchitektur, dann Archiv | weiterpflegen |
| D10 | gtm/pipeline/README.md | Pointer oder Archiv? | auf Pointer reduzieren | Archiv |
| D11 | onboarding/Customer_Journey_Short.md | Live-Call-Karte? | behalten (Bible §9 verlinkt) | in SSOT auflösen |
| D12 | gtm/sales/`Kommunikatin chat gpt`/ | Tippfehler-Ordner | Datei → runbooks, Ordner weg | belassen |
| D13 | doerfler/ONBOARDING_QUESTIONNAIRE.md | generische Vorlage | → gtm/onboarding/ als Template | Archiv |
| D14 | walter/feedback/Feedback.txt | Website-Feedback offen? | abarbeiten falls Site bleibt | Archiv |
| D15 | archive/*templates (DECISION/RESEARCH/TICKET) | DEC-Praxis? | wiederbeleben | löschen |
| D16 | brand/LinkedIn + speech_clone-Skripte | 299/Trial-Pricing | auf D101 aktualisieren | unverändert |
| D17 | contracts/analytics_events.md | Tracking je bauen? | behalten (Namens-SSOT) | Archiv |

---

## 7. Ziel-Architektur: docs/INDEX.md als Orchestrator

```
docs/INDEX.md  ← START (Wegweiser, kein Inhalt; 1 Bildschirm)
│
├─ EINSTIEG
│   ├─ business_briefing.md ........ Executive/Investor-One-Pager (5 Min)
│   └─ STATUS.md ................... Firmen-Log + Dokument-Map (was ist live)
│
├─ ZWEI ORCHESTRATOREN
│   ├─ architecture/zielarchitektur.md . TECHNISCHE SSOT + Decision-Map
│   └─ gtm/CUSTOMER_JOURNEY_BIBLE.md ... BUSINESS-SSOT (8-Sterne-Schwungkreis)
│
├─ DIE 4 BIBLES (Domänen-Tiefe)
│   ├─ gtm/sales/SALES_BIBLE.md ........ ICP §3 + Preis §5 (SSOT) + Verkauf
│   ├─ gtm/onboarding/ONBOARDING_BIBLE.md  Cockpit / Go-live
│   ├─ gtm/pipeline/PIPELINE_BIBLE.md .. Video-Maschine
│   └─ (Customer Journey Bible oben = der oberste/vierte)
│
├─ TASK-TRACKER
│   └─ ticketlist.md
│
├─ DOMÄNEN-DOCS  (architecture/ · gtm/sales/ · gtm/onboarding/ · gtm/pipeline/ ·
│                  gtm/icp/ · brand/ · runbooks/ · compliance/ · sales/)
│
├─ KUNDEN (dünn — Live-Stand im System, NICHT dupliziert)
│   └─ customers/<slug>/ : status.md · links.md · founder_review.md
│                          (Doerfler/BigBen: + voice/onboarding-Detail)
│
└─ _archive/ ... tote Cluster, nur Historie, nie editieren
```

Prinzip: jede Wahrheit existiert **genau einmal** (SSOT). `customers/<slug>` bleibt dünn — Stamm-/Konfig-Daten leben im System (Supabase/tenant_config/Retell), nicht in Docs.

---

## 8. Empfohlene Ausführungs-Reihenfolge (kein Wissensverlust zwischen Schritten)

1. Branch + `docs/_archive/<gruppen>/`-Skelett anlegen. Noch nichts verschieben.
2. **Wissens-Sicherung (Abschnitt 2) ZUERST.** Alle `preserve` in die kanonischen Dateien. Erst wenn committed, darf archiviert werden. Sicherheits-Anker.
3. Merges (Abschnitt 3): D1-Kanäle-Block, email, 3.4.
4. DECIDE (Abschnitt 6) einsammeln; Kanonisierungen (D2/D3) verschieben solange redesign noch komplett da ist.
5. node_modules aus Git + .gitignore (Abschnitt 5).
6. ARCHIVE-Move (Abschnitt 4), Ordner für Ordner, nach jedem `git status`.
7. DELETE-Rest (Abschnitt 5).
8. `docs/INDEX.md` schreiben (Abschnitt 7) als letzten Schritt.
9. STATUS.md + ticketlist.md final (Map auf INDEX).
10. Commits gestaffelt (Sicherung / Merges / Archive / Delete / INDEX getrennt), einzeln rückrollbar. Kein force-push.
