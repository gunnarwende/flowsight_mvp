# FlowSight — Business Briefing (Vollständiger Kontext)

> Dieses Dokument ist der komplette Kontext für ChatGPT, Claude und externe Partner.
> Copy-paste als System-Prompt oder ersten Message. Deckt Business, Produkt, Technik und Strategie ab.
> Letzte Aktualisierung: **2026-06-19 — Welle 1 komplett: 10 Simulationen live an echte Thurgau-Betriebe versandt (Burkhardt, Schäfli + Dieterich, Serafini, Rickenbach, musa, Hutt, Künzi, Wattinger + Schwendener, R. Gerber, Brühwiler), 2 zurückgestellt (MS Gebäudetechnik + Regiotherm = reine Heizung → T2-Rohrbruch passt nicht, Heizungs-Notfall-T2-Variante fehlt). Weiterhin 0 zahlende Kunden; Tracking scharf, warmer Follow-up ab nächster Woche. Härtungen: E-Mail-Empfänger-Disziplin (harter Pre-Send-Domain-Check, Cockpit-Kontaktliste = authoritative Quelle statt Crawl — Künzi-myls.ch-Fehler gefangen), dynamische Inhaber-Anrede „Grüezi Herr X" in Seite + Mail, Copy-NoGos (nie „durchgespielt"/Video-Dauer/erfundenes Erlebnis), feste Schablone „nicht erreicht" `docs/gtm/sales/templates/email_nicht_erreicht.md`.** ▸ **2026-06-18 — Erster echter Kalt-Rep-Tag: 3 Treffer (Burkhardt, Schäfli + Dieterich, Serafini) komplett über die Pipeline produziert + live an die Betriebe versandt (erste Simulationen an echte Betriebe via Kalt-Call; weiterhin 0 zahlende Kunden). Pipeline gehärtet: kanonischer Liefer-Weg `build_take*_final`, `produce_videos.mjs` (Ein-Kommando), Hochkant-Variante als Pflichtschritt, Tracking-Scharfschaltung beim Live-Versand (S8). Retell-Deprecations gefixt (publish-agent-version mit {version}, inbound_agents[]). Lead-Motor `thurgau_list`/`assemble_thurgau` (vor-qualifizierte Liste).** ▸ **2026-06-17 — Customer Journey Bible = oberstes Orchestrator-Dokument (`docs/gtm/CUSTOMER_JOURNEY_BIBLE.md`); FlowSight als EINE Customer Journey / ein Schwungkreis (8 Sterne 1 Kontakt→8 Begleitung, Schleife 8→1), weg vom 3-Säulen-Framing (D103) — die drei Bibles = Handbücher für Abschnitte der Reise. Stern-5-Warmgespräch v1; OC8 Rückmelde-Versprechen/Wunschtermin (Lisa per-Tenant ohne falsche Terminversprechen).** ▸ **2026-06-16 — Sales als eigene Säule (3-Säulen-Architektur Sales → Pipeline → Onboarding, D102). ICP zweistufig (Leitsignal „Inhaber-am-Telefon?"; Solo 1–3 MA → CHF 950 / Premium 4–12 → CHF 2'000). Lead-Motor (`build_leads`/`todays_list`/`enrich_leads` P12) + Audio-Roleplay-Training (`roleplay_audio.mjs` + `lernblatt.txt`). SSOT: `docs/gtm/sales/SALES_BIBLE.md`. §4 Pricing auf Premium-Pivot aktualisiert (299/499/799 abgelöst).** ▸ **2026-06-06 — Onboarding komplett neu als Self-Service-Cockpit (Phase 1-4) spezifiziert; Pricing-Pivot zu Premium (Aktivierung + Monat, kein Trial, zahlend am Go-live).** Onboarding = Co-Pilot („Sie bauen Ihr System, wir führen Sie"); alte Bible → v0 archiviert, frisch in `docs/gtm/onboarding/`; Voice = 7 Dispositionen → 3 Körbe; Seam = `tenant_config.json`. Build-Backlog OC1-OC7 in `ticketlist.md`, Decision D101. **Bau 06.06. (autonom):** OC1–OC5 als gestapelte, rein additive, live-sichere PRs #572–#576 (dormant bis Retell `call_type`); Founder merged (#571→#576) + baut Cockpit-Daten-Layer/Flows. **Vorlauf: 2026-06-05 — Phase 3 (E-Mail/Outreach) im Aufbau.** „Mail = Deckel, Seite = Schatz": private Beweis-Seite `/p/[token]` (Bunny Stream + View-Tracking) als EIN Link; **automatisierter Versand** `send_outreach.mjs` aus der Founder-Adresse gunnar.wende@flowsight.ch (Resend, Foto inline, NULL Copy-Paste, Test-Default=Founder, `--live`-gated, **kein M365-Graph**). **Canonical T1** = EIN Founder-Intro für ALLE Betriebe (md5-bewiesen → eine Bunny-GUID + ein Poster, spart Zeit/Speicher/Komplexität dauerhaft). **B-Vorlage Kalt-Outreach** (99 % der Kunden): fixe 4-Beat-Struktur, variabler Haken nach Profil (Archetyp A Erreichbarkeit / B Notdienst / C Bewertungs-Lücke + Slots Geo/Gewerk; Prinzip „Bedrohung senken vor Spannung"). Mail = Hell-Premium-Standard. **Montags-Paket 08.06.:** Outreach-Copy-Schritt (Signale→Archetyp→`email.json`) + Inhaber-E-Mail-Anreicherung (noch offen, ohne Qualitätsverlust einzubauen); Dörfler+Walter Re-Run für frische Daten. Erster echter Versand: Dörfler Di 09.06. Vorher: **2026-06-03 — Video-Pipeline funktional + gesichert (~95%).** 7 Betriebe produziert + founder-abgenommen; Quality-Gate-System live; PIPELINE_BIBLE als autoritative replikations-bereite Referenz neugefasst (siehe §3.13 + `docs/gtm/pipeline/PIPELINE_BIBLE.md`). Nächste Phase: E-Mail-Verpackung + View-Tracking. Vorherige Historie: 2026-04-30 Day-30 Pre-Reise EOD (**🎬 T3 LOOM-AFTER-BUILD ARCHITEKTUR LIVE für alle 4 Tenants. PIPELINE_BIBLE §62 etabliert als Pipeline-Standard.** FB14/FB15/FB16 Founder-Findings: Overlay-on-Overlay-Approach veto'd ("wird nie skalierend funktionieren"). Architektur-Pivot: Loom kommt NACH Phase-Build via `apply_loom_to_t3_master.mjs`. Pipeline: NEW Loom in mini_takes/Take3/Take3_cut.mp4 → Source-Swap auf no-loom → `LOOM_GUARD_SKIP=1 build_from_phase_schedule` → continuous Loom-Overlay mit W=105.0 (Founder-Wahl: 0.5s später als initial). 4 Tenants × T3 mit NEW Loom gebaut, Loom-Continuity verifiziert via SHA256-Hash auf Loom-Region-Crops. Master-Backups gesichert in `master_takes/_backups/`. **Founder reist heute Abend Philippinen, ~25 Tage offline-mobile.** Carry-Forward post-Reise: T3+T4 Mouse-Layer (per `scripts/_ops/mouse_layer/`), Founder-Sichtung Leins/Stark/Wälti T3, Onboarding-Maschine + 6-Wochen-Roadmap zum Reality-Gap-Closing. Day-30-Mittag-Kontext:) 2026-04-30 Day-30 Mittag (**🏆 DÖRFLER AG T1-T4 KOMPLETT ABGENOMMEN.** Take 4 Master-Schablone gebaut + dokumentiert in PIPELINE_BIBLE §60-§61: 3-Phasen-Architektur (small Loom mirror/centered 0-1:37, xfade Iris 1:37-1:39, big Loom +40-shift 1:39-Ende) mit smooth fade-in/out an den Phasen-Boundaries. Audio End.wav loudness-matched zu master pre-section, mit 1.95s pause am xfade-start für synchrone Lippenlesbarkeit. Sync-Calibration via 11-Clip Verify-Approach (±0.5s mittel, 0.1s Schritte; finer 0.01s) etabliert. Modul-Skalierung-Konzept §61: mini_takes/<modul>/Take4/ Recordings + screenflows/_shared/<modul>/ Cuts + per-tenant Pipeline-Run. Noch offen: Maus-Layer Phase 4 T3+T4 (heute home-office vor Reise). Day-30-Late-Night-T2-Kontext:) 2026-04-30 Day-30 Late-Night (**🎬 T2-PIPELINE UNIVERSELL GEFIXT — alle 4 Tenants × 2 Varianten produktionsfertig.** Drei Architektur-Patches in einem Sprint: §56 Universal CALL_END_TOTAL (`apply_loom_take2.mjs` rechnet jetzt dynamisch `CALL_START + phoneExtended.duration` → "Anruf beendet"-Hold vollständig sichtbar in allen Tenants/Varianten — vorher nur 1.2s wegen Hard-Code-Boundary), §57 Anruf-beendet Display synchron zu live-Timer (`take2_samsung.html` snap on `endCall()` → behebt Founder-Defekt "Live-Timer 02:47 vs Anruf-beendet 02:43"), §58 T2 High-End Quality Gate (`scripts/_ops/quality_gate_take2.mjs`: Phone-Region Color-SSIM gegen Dörfler-Gold-Reference, threshold 0.92, fand alle Real-Defekte). §59 Loom-Avatar-Hierarchy etabliert (per-tenant + shared + legacy fallback) + 3 Founder-recorded Loom-Videos cut + integriert: Dörfler T2 Notruf (von 0:20), Leins T2 Preis (von 0:43), Take 3 universal (von 1:44). 4 Master-Takes promoted für Founder-Review morgen. T3-Loom-Pipeline-Plumbing offen. Day-29-Recovery-Kontext:) 2026-04-29 Day-29 Recovery (**🚨 PIPELINE-CRASH + RECOVERY.** Mausphase 29.04. nachts hat Apr-28-Pipeline-Stand zerstört (Source-Recordings überschrieben + Phase-Library-Override regeneriert). Apr-27-Backup hat Dörfler+Leins T1-T4 Anchors gerettet. Recovery-Status: 5 Takes APPROVED in `master_takes/` (Dörfler T1+T4, Leins T1+T2-Preis+T4); 4 PENDING Founder-Verifikation (Dörfler T2-Notruf+T3, Leins T3); Stark+Wälti T2+T3 müssen NEU. Loom-during-active-call ist Known-Open für T2-Anchors. **Wiedereinstieg:** lies `docs/gtm/pipeline/RESUME_HERE.md` ZUERST. Pipeline-Lessons: TaskStop killt ffmpeg subprocess NICHT (Stop-Process nötig); FFmpeg-overlay-postproduction zu langsam; nächster Loom-Approach: HTML-Layer in `take2_samsung.html` statt Re-Encode. Day-28-Kontext (überholt):) 2026-04-28 Day-28 nachmittag (**PIPELINE-CUT für BigBen Live morgen.** §43 Master-Source-Brand-Overlay LIVE, alle 4 Sanitär-Tenants T3 10/10. Aktiver Fokus: BigBen Pub Live-Schaltung 29.04.) — vorher:
> 2026-04-27 Day-27 EOD (**🏗️ SKALIERUNGS-MASCHINE LIVE.** PIPELINE_BIBLE §40-§45 verbindlich. §43 Single-Source-Master + Brand-Overlay-Architektur. §44 **Pipeline-Standard NICHT-VERHANDELBAR**: HIGH-END + PERSÖNLICH + ZERO TECH ERRORS + MAX SKALIERBAR + AUDIO-AUTHORITY HEILIG + DATEN-AUTHORITY SAKROSANKT. Heute gebaut: Master-Wizard-Source-Convention, `build_wizard_brand_overlay.mjs`, SHORT-Greeting-Bucket, Take-2-Schedule-Generator, 10-Sub-Gate Quality-Gate. Quality: Take 2 preis Leins + Take 4 Dörfler/Leins + Take 3 Dörfler ABGENOMMEN. Take 3 Leins 9/10 wartet auf Auto-Calibration v2. Backup `_backup_27_04_evening_pre_skalability_v2/` (502 MB + RESTORE.md). Nächster Schritt bei Re-Login: Auto-Calibration v2 via Pixel-State-Detection bauen → `RESUME_HERE.md` + PIPELINE_BIBLE §43+§45. Day-26-Kontext:) 2026-04-26 Day-26 Evening (**🎬 TAKE 2+3 DÖRFLER ABGENOMMEN, TAKE 4 IM REVIEW.** Phase B-2 Screenflow-Retiming abgeschlossen für Dörfler. Take 2 Notruf+Preis ✅ final. Take 3 ✅ 28 Segmente mit Loom-Face-Move. Take 4 erster Build durch (18 Segmente, Custom Per-Segment-Gaps 1.1/2.0/3.0/2.0s). Pipeline-Bible §36-§38: Audio/Screen/Schedule-Triade + Take-3-Workflow + Per-Segment-Loudnorm Pflicht. 12 neue Architektur-Patterns FB100-FB111 jetzt SOP. Tag-23-Kontext:) 2026-04-23 Late-Night (Sales Day 23. **Take-4-Review-Flow Gold-Standard für alle 3 Betriebe (Leins + Stark + Wälti) erreicht. Round-3-Iteration: FB32-FB41 gefixt.** Milestones: FB32 Samsung-Pop-from-Link Animation (Mini-Review-Preview ploppt zentral aus SMS-Link, Samsung One UI Easing), FB34 Review-Layout (140px grey padding + 4px brand-bar + 60px pt-6 für Leins-AG-Heading), FB37 Dual-.min-h-dvh Selector-Falle aufgelöst (CSS-Selector muss outer via `.bg-gray-100` disambiguieren, sonst doppelt padding), FB38 Reveal-Overlay Smart-Gate (MIN_HOLD 3500ms + checkReady-Polling für Hydration-Flash-Schutz), FB39 deterministische Seed-Zeiten (Andreas Gerber Heute 07:12 aus demoTime.today statt wallclock-hoursAgo), FB40 Homescreen-Wallpaper crop (height:105% Overflow hinter Viewport), FB41 Samsung One UI 6 authentische Nav-Icons (3-bar Recent + rounded-square Home + chevron Back, dark-bg auf Homescreen via wallpaper vs light-bg auf SMS/Review). Alle 3 Betriebe: Take 2 ~153s + Take 3 ~61s + Take 4 ~106s = ~5min/Tenant. 35/35 QG PASS pro Tenant. Pipeline-Bible §31 dokumentiert komplette Round-3-Learnings. Production-Ready für 10/Tag-Skalierung. Nächster Schritt: Founder-Review + Audio-Layer + Outreach-Freigabe.)

---

## 1. Was ist FlowSight?

FlowSight ist das Leitsystem f&uuml;r Schweizer Handwerksbetriebe. Wir digitalisieren den gesamten Kundenkontakt — vom ersten Anruf über die Fallerfassung bis zur Bewertung.

**Elevator Pitch (30 Sekunden):**
"Die meisten Handwerksbetriebe in der Schweiz verpassen Anrufe, verlieren Meldungen und haben keine Zeit für Organisation. FlowSight gibt ihnen ein Leitsystem: eine professionelle Anrufannahme rund um die Uhr, ein Online-Meldungsformular, einen strukturierten Überblick für alle Fälle, und eine Bewertungs-Engine. Persönlich eingerichtet, inklusive, ohne IT-Kenntnisse."

**Firma:** FlowSight GmbH (Schweizer GmbH)
**Gründer:** Gunnar Wende, Solo-Founder, Zürich
**LinkedIn:** linkedin.com/company/flowsight-gmbh
**Website:** flowsight.ch
**Geschäftsnummer:** +41 44 552 09 19 (Digitale Assistentin Lisa)

---

## 2. Zielkunde (ICP)

**Primär:** Inhaber eines Sanitär-/Heizungsbetriebs
- 3-30 Mitarbeiter, inhabergeführt
- Standort: Deutschschweiz (Fokus: Kanton Zürich, linkes Zürichseeufer)
- Website: veraltet oder nicht vorhanden
- Digitalisierungsgrad: gering

**ICP-Analyse (32 Betriebe Kanton ZH, Februar 2026):**
- 97% zeigen KEINE Google-Bewertungen auf ihrer Website
- 50% haben kein Online-Kontaktformular
- 0% haben Online-Terminbuchung oder automatische Bestätigungen
- Top-Services: Sanitär (100%), Heizung (94%), Wartung (88%), Badsanierung (69%), Notdienst (59%)
- Typische Teamgrösse: 5-15 MA
- "Seit 19xx" ist der #1 Trust-Signal
- Schnelle Reaktionszeit und Sauberkeit sind die meistgenannten Review-Themen

**Spätere Branchen-Erweiterung:** Elektriker, Gastronomie (BigBen Pub = erster zahlender Kunde, Pub/Gastro-Modul LIVE), Friseur (ab Phase 3, 15+ Kunden)

**Typische Kunden-Aussagen:**
- "Ich bin den ganzen Tag auf der Baustelle, kann nicht ans Telefon."
- "Unsere Website sieht veraltet aus, aber wir haben keine Zeit dafür."
- "Ich schreibe mir die Aufträge auf Zettel und vergesse manchmal was."
- "Google-Bewertungen? Dazu kommen wir nie."

---

## 3. Module — Was FlowSight bietet

### 3.1 Moderne Website
- High-End Website im Firmenlook, mobil-optimiert, SEO
- Template-System: 12 Sektionen (Hero, Leistungen mit Detail-Overlays, Notdienst, Bewertungen, Team, Einzugsgebiet, Karriere, Kontakt, etc.)
- **ServiceDetailOverlay:** Klick auf Service → Overlay mit Beschreibung, Bullet Points, Bilder-Galerie
- **Bild-Galerie:** Horizontal-Scroll + Lightbox (z-[200]), per Service
- Pro Kunde konfigurierbar via Config-Datei (Farben, Texte, Bilder, Services)
- SSG (Static Site Generation) für maximale Performance
- **Customer Links Page:** /kunden/[slug]/links — alle URLs auf einen Blick (noindex)
- URL: flowsight.ch/kunden/[firmen-slug]
- **6 Kunden-Websites live** (inkl. Demo-Tenant und BigBen Pub)
- **Erstellungszeit: ~20 Minuten pro Kunde** (standardisierter 10-Regeln Intake-Prozess)

### 3.2 Schadenmelde-Wizard
- 3-Schritt Online-Formular auf der Kunden-Website
- **Branded pro Kunde** — Farben, Logo, Kategorien aus `services[]` abgeleitet
- Schritt 1: Kategorie wählen (dynamisch aus Kunden-Services)
- Schritt 2: Kontaktdaten (Name, Telefon, E-Mail, Adresse mit PLZ)
- Schritt 3: Beschreibung + optionale Fotos (Supabase Storage)
- **Photo Upload auf Success-Screen** (nach Fallanlage)
- **reporter_name** als Pflichtfeld (Wizard, Voice, Verify, E-Mail)
- Ergebnis: Fall wird in Supabase erstellt, Ops-E-Mail + Melder-Bestätigung gesendet
- Mobil-optimiert, branded im Kunden-Look

### 3.3 KI-Telefonassistent (Voice Agent)
- **Technologie:** Retell AI (Conversational Voice AI)
- **Flow:** Anruf → Peoplefone (Schweizer Nummer) → Twilio SIP → Retell Agent → Webhook → Supabase → E-Mail
- **Dual-Agent:** Deutsch (Stimme "Ela" / ElevenLabs) + International (Stimme "Juniper" / Retell, EN/FR/IT)
- **Language Gate:** Erkennt automatisch ob Deutsch oder andere Sprache
- **Zwei Modi (automatische Erkennung):**
  - **Intake-Modus:** Schadensmeldung aufnehmen (max 7 Fragen: Name, Kategorie, PLZ/Ort, Adresse, Dringlichkeit, Beschreibung) → Fall in Supabase + E-Mails
  - **Info-Modus:** Allgemeine Fragen beantworten (Öffnungszeiten, Preise, Einzugsgebiet, Team, Bewerbungen, Beratung) → kein Ticket
- **Dynamic SIP Routing** (Twilio → richtiger Agent per Nummer)
- **Deterministic Closing:** Farewell no-repeat, end_call tool, ß→ss in Analyse
- **Recording: OFF** (Datenschutz)
- **24/7 erreichbar**, keine verpassten Anrufe
- **Template-System:** Gold-Standard-Schablone mit 23 Platzhaltern (~20 Min pro Kunde)
- **Persona:** "Lisa" — digitale Assistentin mit Firmen-Wissen (Öffnungszeiten, Services, Einzugsgebiet, Team)
- **18 Verhaltens-Szenarien:** Intake, Info, Rückruf, Reklamation, Angebotsanfrage, Sicherheits-Eskalation, Erste-Hilfe, Sprachwechsel, Themenfremde Fragen, Preis-Deflekt
- **14 No-Go's:** Keine Preise erfinden, keine Garantie versprechen, keine Diagnose stellen, keine Termine zusagen, nie "FlowSight" sagen
- **Sprachwechsel:** DE→EN/FR/IT mit Brückensatz in eigener Sprache, Rückswitch ohne Akzent-Probleme
- **Agent Hangup Monitoring:** RED Alert an Founder bei Bug-bedingtem Auflegen (Webhook + Morning Report)

### 3.4 Leitzentrale (Ops Dashboard)
- Web-App unter /ops (Login via Custom OTP: 6-Digit Code per E-Mail, server-side Session. Sender: noreply@send.flowsight.ch)
- **Leitzentrale v3 (FlowBar):** CSS Grid KPIs (Neu/Bei uns/Erledigt/Bewertung), gleiche Breiten, Jahres-Dropdown (2024-2026) + 7d/30d Filter
- **Soft Delete + Papierkorb:** Fälle löschen (Mülleimer-Icon) + Papierkorb-Ansicht (Trash-Icon in Pagination) mit Restore. Gelöschte Fälle fallen aus KPIs raus, bleiben in DB.
- **Quellen-Aufschlüsselung:** "Neu" KPI zeigt 📞 Tel / 🌐 Web / ✏️ Stift mit Anzahl
- **Gold-Sterne:** Bewertungs-KPI immer goldene Sterne, Durchschnitt + "erhalten / angefragt"
- **Admin-Ansicht:** Begrüssung, alle Betrieb-Fälle, Smart Sort, Spaltenfilter
- **Techniker-Ansicht:** "Meine Arbeit" (nur zugewiesene Fälle), nächster Einsatz mit Maps-Link, Pagination
- **Adaptiver Rollen-Toggle:** Admin/Techniker-Switch nur bei Betrieben mit >2 Mitarbeitern sichtbar. Kleine Betriebe (2 Personen) sehen nur die Admin-Ansicht — kein unnötiger UI-Ballast.
- **Fall-Detailansicht:** 2-Zeilen-Header (Kategorie volle Breite), Scroll-to-Top, Status, Termin (mit Kollisions-Warnung), Staff-Zuweisung, Bewertungs-Workflow, Timeline
- **Status-Farben:** Neu=blau, Geplant=violett, In Arbeit=orange, Warten=grau, Erledigt=grün, Erledigt+4★=gold
- **Mobile:** 2x2 Grid KPIs, 8 Fälle/Seite, 48px Tap-Targets
- **PLZ Auto-Fill:** Bei Fallerfassung → Stadt automatisch aus Schweizer PLZ-Map
- **Light Theme**, Sidebar-Navigation, responsive, PWA-installierbar

### 3.5 Google Review Engine v2 (seit 05.04.2026)
- Nach erledigtem Fall: Button "Bewertung anfragen" im Ops Dashboard
- **HTML-E-Mail:** Gebrandete Karte mit Tenant-Farbe, Auftragsreferenz (Kategorie + Ort), grosser CTA-Button "★ Service bewerten — dauert 30 Sekunden". Plain-Text-Fallback.
- **Review Surface v2** (`/review/[caseId]`):
  - Grosse Sterne (48px Tap-Targets, Hover-Animation)
  - **Positiv (4-5★):** 4 klickbare Text-Chips ("Schnell & zuverlässig", "Saubere Arbeit", "Kompetente Beratung", "Jederzeit wieder") + Freitextfeld + "Jetzt auf Google bewerten" CTA
  - **Negativ (1-3★):** Empathie + Textarea "Was können wir besser machen?" + "Feedback senden" — kein Google-Redirect, Feedback wird intern gespeichert
  - **review_text** in DB gespeichert (positiv UND negativ) — Betrieb sieht Kundenfeedback
  - Push-Notification mit Textvorschau an Betrieb
- **KPI-Conversion:** FlowBar zeigt "X/Y erhalten (Z%)" statt nur "gesendet". SystemCard zeigt received/sent Ratio.
- **Google-Count:** Google-Bewertungsanzahl aus weekly Crawl im FlowBar sichtbar
- **Gold-Status:** Fälle mit rating ≥ 4 werden gold markiert in der Leitzentrale
- Google Review URL pro Tenant konfigurierbar (Settings-Seite)
- **E2E-Plan:** `docs/_archive/redesign/leitstand/plan_google_bewertungen.md`

### 3.6 Morning Report
- Täglicher Statusbericht: 15 KPIs + Trial Status + Health, Severity-Ampel (GREEN/YELLOW/RED)
- Versand via Telegram (primary) + E-Mail bei RED/YELLOW (Resend)
- GH Actions Cron (daily 07:30 UTC)
- Nur System-Alerts, keine Kundendaten (PII)

### 3.7 E-Mail-Notifications
- **Ops Notification:** Neuer Fall → E-Mail an Betrieb
- **Melder-Bestätigung:** "Wir haben Ihre Meldung erhalten" → E-Mail an Endkunden
- **Review-Anfrage:** "Wie war unser Service?" → E-Mail mit Google-Review-Link
- **Demo-Anfrage:** /demo Formular → E-Mail an Founder
- **Sales Lead:** Voice Agent Lead → E-Mail an Founder
- Provider: Resend (SPF/DKIM/DMARC verifiziert)

### 3.8 SMS Channel
- Post-call SMS mit Korrekturlink an Melder (eCall.ch Swiss Gateway, Business Account Typ A)
- **Sender: Alphanumerisch** (Tenant-Markenname, z.B. "Doerfler AG", max 11 Zeichen) — eCall-verifiziert
- Kurzlink `/v/[caseId]?t=<16hex>` auf flowsight.ch (~85 Zeichen), HMAC-gesichert
- Foto-Upload via Verify-Seite (Supabase Storage)
- **Quality Gates:** 25s Minimum-Duration (kein SMS bei Kurzanruf) + Content-Check (≥2 Felder vom Caller)
- Akzeptiert sowohl Full-Token (64-hex) als auch Short-Token (16-hex)

### 3.9 Push-Notifications (seit 04.04.2026)
- **Per-Tenant Push-Subscriptions:** Jeder Mitarbeiter kann Push-Benachrichtigungen aktivieren
- **Trigger:** Notfall-Fälle (sofort), Zuweisung an Techniker, Bewertung erhalten (★ mit Rating)
- **Stummschalten:** Preferences pro User (Nur Notfälle / Alles / Stumm)
- **Onboarding:** Nicht-aggressiver Banner nach 3s, "Aktivieren" / "Später" (30 Tage dismiss)
- **App-Badge:** Zähler auf dem Homescreen-Icon (Android Chrome/Edge). Zeigt ungelesene Events.
- **Service Worker:** Push-Handler + Notification-Click → Deep-Link in die App
- iOS: Push ab iOS 16.4 ✅, Badge ❌ (Push als Alternative)

### Kanal-Routing-Regeln (seit 15.04.2026)
- **Ein Kanal pro Empfänger pro Ereignis** — keine doppelten Benachrichtigungen
- **SMS für zeitkritische Nachrichten** (Post-Call, Review-Fallback), **E-Mail für informative** (Bestätigungen, Termindetails)
- **Push = Ergänzung** für sofortige Aufmerksamkeit (Notfall, Negative Review), nicht Kopie der E-Mail
- **Self-Assignment unterdrückt** bei ≤3 MA (kein Spam bei Kleinbetrieben)
- **Negativ-Review: immer E-Mail-Alert** zusätzlich zu Push (darf nicht untergehen)
- **SMS-Budget-Schutz:** Email-Fallback wo möglich (~38% SMS-Einsparung)
- Vollständige Analyse: `docs/_archive/redesign/leitstand/kommunikationsmatrix_v2.md`, Architektur-Regeln: §12a in `zielarchitektur.md`

### 3.10 Google Review Crawl (seit 04.04.2026)
- **Wöchentlicher Crawl:** GH Actions Cron (Montag 06:00 UTC)
- **Google Places API (New):** Rating + Review-Count + letzte 5 Review-Texte
- **DB-Update:** `modules.google_review_avg`, `google_review_count`, `google_latest_reviews`
- **Kosten:** ~$3.50/Monat bei 50 Betrieben
- **Immer synchron mit Google:** Kein manuelles Eintragen nötig

### 3.11 Wöchentlicher Rapport (seit 04.04.2026)
- **Jeden Montag 07:00 UTC** per Email an Betriebsinhaber
- **Inhalt:** Neue Fälle (Voice/Web/Manual), Erledigt, Bewertungen (erhalten + Ø), Google-Rating, geplante Termine, Notfall-Count
- **Branded:** Tenant-Farbe im Email-Header, Firmenname als Absender
- **Automatisch:** Nur an Tenants mit notification_email (Phase B aktiv)
- **Differenzierung:** Founder wird sichtbar, Betrieb sieht den Wert des Leitsystems

### 3.12 CoreBot (Ops-Assistent)
- Telegram Bot → GitHub Issues (automatische Klassifizierung)
- **Voice→STT→Issue:** Sprachnachricht → OpenAI Whisper → GitHub Issue
- **Photo/Doc Attachments:** Fotos + Dokumente an Tickets (Supabase Storage)
- **/ticket** und **/status** Befehle
- Session-Persistenz: L1 In-Memory + L2 Supabase Storage

### 3.10 Entitlements
- Per-Tenant Module Gating via hasModule()
- Module: voice, wizard, ops, reviews, morning_report, sms
- Konfiguration in Supabase tenants-Tabelle

### 3.11 FlowSight CEO-App (Thema C)
- **Eigene installierbare PWA** unter /ceo — das Nervenzentrum des gesamten Business
- **9 Seiten:** Pulse (Ampel+KPIs+Alerts), Betriebe (Grid+Health Score+Deep-Dive), Pipeline, Finanzen, Monitoring, Benachrichtigungen, Wissen, Team, Admin
- **Betriebe-Seite (02.04.):** Tabs Live/Entwicklung/Archiv, Quick-Actions pro Betrieb (Testnummer, Website, Wizard, Copy), Leitsystem-iframe embedded (Cookie-Switch, Mini-Toolbar, Reload), Tenant-Switcher mit Status-Sortierung + Demo-Badge
- **Update-System (02.04.):** Intelligentes 30s-Polling, Badge mit Änderungszähler, Changelog-Popover ("Neue Fälle: +5"), "Jetzt aktualisieren" Button
- **Smartphone-Preview:** Gesamte CEO-App als Phone-Frame darstellbar (Desktop-Toggle)
- **PWA-Installation:** Eigener ceo-sw.js, Install-Prompt in Sidebar, Gold-Rand auf Icon
- **AI-Copilot:** Model-agnostisch (Claude + GPT). Pulse-Kommentar, Tenant-Insights
- **Design:** Navy+Gold, Mobile-first, PWA installierbar (CEO + pro Tenant getrennt)
- **Skalierbar für 500+ Betriebe:** Pagination, Search, Filter, Server-side Aggregation
- **Gesamtplan:** `docs/architecture/references/flowsight_ceo_app.md` (27 Features, 10 Phasen, alle LIVE)

### 3.12 Sales Voice Agent "Lisa"
- Auf Geschäftsnummer +41 44 552 09 19
- DE + INTL (auto language swap)
- **4 Modi:** Video-Rückruf (Prio), Kaltanruf (Default), Testnummer-Verwechslung, Support
- Beantwortet Fragen zu FlowSight, sammelt Rückruf-Anfragen für Founder
- **Knowledge Update 23.03.:** Pricing Deflect ("ab 299, monatlich kündbar"), 4-Schritt-Prozess (= Website), DSGVO-konform (nicht "keine Daten ausserhalb Europas"), kein Zeitversprechen für Einrichtung, "monatlich kündbar" statt "14 Tage kostenlos"
- **12 Blind Spots abgedeckt:** Wettbewerbs-Handler ("Leitsystem ersetzt niemanden"), Telefon-Integration ("bestehende Nummer behalten"), Founder-Credibility, Notfall-Handling, Eager-Buyer-Pfad, Sprach-Grenzen, Callback-Timing ("noch am selben Tag"), Saisonalität, Video-Awareness
- **Preise:** Werden am Telefon NICHT beziffert (GTM3b, 09.06. — „ab 299" entfernt, da Premium-Pivot) — Wert-Anker statt Zahl, „den Preis bespricht Herr Wende persönlich." (Sales-Agent-Prompt entsprechend hochgestuft, DE+INTL.)

### 3.13 Gold-Contact-Pipeline (Vorstellungsmaschine)
- **Status (03.06.2026):** **funktional + steuerbar.** 7 Betriebe vollständig produziert + founder-abgenommen (Weinberger, Obrist, Wälti, Walter, Schaub, Marti, Stark). Quality-Gate-System live + scharf. Pipeline-Vollständigkeit ~95 %.
- **Ziel:** ~10 Betriebe/Tag, maximal persönlich, high-end, gate-geprüft, automatisiert. Replizierbar auf neue Branchen (Elektriker, Garage, …).
- **`tenant_config.json` = SSOT:** Ein JSON pro Betrieb steuert ALLES (Voice Agent, Wizard, Seed, Video, Outreach). Brand-Farbe wird zu Sanitär-Blau saniert (`sanitizeBrandColor`); Variante C (notruf) / B (preis) aus `call_proof_variante`.
- **3 Phasen:** Phase 1 (Extract+Decide: Crawl + Zefix + Google → `derive_config`) → **Phase 2 (Video, 4 Takes — diese Pipeline)** → Phase 3 (Outreach E-Mail, nächster Block).
- **Die 4 Takes:** T1 Intro (~63s) · T2 Anruf notruf/preis (~377-380s) · T3 Wizard (~149s) · T4 Bewertung (~177s).
- **Video = 3 Schichten:** per-Betrieb-Screenflow (Playwright: Samsung-Phone + Leitsystem) + **universelles locked Audio** (Master + per-Tenant-Greeting-Swap) + **universelle Maus/Loom** (Dörfler-Aufnahme als Layer). `holdUntilMaster`-Anker gegen Aufnahme-Jitter; deterministische Overlays (canonical-stars aus Weinberger-Referenz, SMS-Thread-Detektion).
- **Build pro Betrieb:** `seed_screenflow_from_config` → `insert_take3_wizard_case` → `compose_take1_hero` / `build_take2_final` / `build_take3_final` / `build_take4_final --with-mouse`. Strikt sequenziell, je gate-geprüft.
- **Quality-Gates** (`qg_video.mjs` + Daten-Gate): G_START0, G_HOMESCREEN0, G_T2_PAUSE/BEEP/TAIL/SMS_OPEN, G_GREETING (STT), G_T4_STARSYNC/CASEOPEN/DOUBLESTAR, G_T3_KPI_NEU. **fail-on-broken/pass-on-good — kein Video wird bei rotem Gate platziert.**
- **Platzierung:** Builds → `07_stresstest/<slug>/`; founder-abgenommen → `07_stresstest/abgenommen/<slug>/`.
- **Bekannter 5 %-Rest:** T4-Recording-Timing-Jitter (caseopen ±1s + Part-5/Erledigt unverankert) → nächste Wochen.
- **Founder-Aufwand pro Betrieb:** Brand-Farbe bestätigen (~30s-Review) + Takes abnehmen. Kein Text schreiben.
- **Twilio-Nummern:** Erst nach positiver Rückmeldung kaufen (Kosten-Optimierung).
- **Schlüsseldokument:** `docs/gtm/pipeline/PIPELINE_BIBLE.md` — autoritative, replikations-bereite Referenz (12 Abschnitte, neugefasst 03.06.; Historie in `docs/archive/PIPELINE_BIBLE_historie_bis_20260603.md`).
- **Marktanalyse:** ~585 Betriebe Kanton Zürich; goldenes Segment ~278 (≥4.5★ + wenige Reviews); Hochrechnung Deutschschweiz ~2'457. Plus ~3'000 Elektriker als nächste Branche (Replikation).

---

## 4. Pricing (Premium-Pivot, gültig seit 06.06.2026 — ersetzt 299/499/799)

> Das alte Tier-Modell (Standard 299 / Professional 499 / Enterprise 799, 21.03.) ist für die Neukunden-Akquise **abgelöst** (D101/D102). Kanonisch: `docs/gtm/sales/SALES_BIBLE.md` §5.

**Zweistufig, grössen-basiert (Leitsignal: „Klingelt das Telefon noch beim Inhaber auf der Baustelle?"):**

| Stufe | Größe | Monat | Aktivierung |
|------|------|-------|-------------|
| **Solo-Leitsystem** | 1–3 MA | **~CHF 950** | ~CHF 1'000 |
| **Premium-Leitsystem** | 4–12 MA (Bullseye 4–8) | **~CHF 2'000** | ~CHF 2'500 |

- **Monatlich kündbar = Risiko-Umkehr, KEIN Gratis-Trial.** Gezahlt am Go-live (build-love-then-pay).
- Preis **transparent, hängt von der Grösse ab** — nicht verhandelbar, nicht aus Kundenangaben ableitbar.
- Anker = verpasster Auftrag / Teilzeit-Empfangskraft, nie „andere Apps". Sprache raus: Tool / Abo / günstig / teuer.
- 0 Kunden → Richtwerte; erste 3–5 = Preis-Findung (nie rabattieren, Scarcity 10/Mo).
- Preis **nicht öffentlich** auf der Website (Pricing-Seite entfernt, PR #544) — wird im Gespräch genannt, nie im Video.
- Detail: SALES_BIBLE §5 + Onboarding-Bible §4; alte Tier-Analyse `docs/_archive/redesign/leitstand/pricing_und_marge.md` (Historie).

---

## 5. Technische Architektur

### Tech Stack

| Layer | Technologie | Plan |
|-------|------------|------|
| Frontend + API | Next.js App Router (Vercel Frankfurt) | Pro ($20/mo) |
| Datenbank | Supabase (PostgreSQL + Storage + Auth) | Pro ($25/mo) |
| Voice | Retell AI → Twilio SIP → Peoplefone | Pay-as-you-go |
| Email | Resend | Free (100/Tag) |
| Monitoring | Sentry | Free |

### Datenfluss (End-to-End)

```
EINGANG (3 Wege):
  Telefon → Peoplefone → Twilio → Retell → /api/retell/webhook
  Website → Wizard-Formular → /api/cases
  Dashboard → Manueller Fall → /api/cases

VERARBEITUNG:
  → Case in Supabase erstellt (cases-Tabelle)
  → case_events Eintrag ("Fall erstellt")
  → seq_number vergeben (FS-XXXX, auto-increment)

OUTPUT:
  → Ops E-Mail an Betrieb (Resend)
  → Bestätigungs-E-Mail an Melder (Resend)
  → SMS mit Korrekturlink (eCall.ch, wenn Voice)
  → case_events Eintrag ("Benachrichtigung gesendet")

NACH ERLEDIGUNG:
  → Status → "Erledigt" (im Dashboard). Kette: Neu → Geplant → In Arbeit → Warten → Erledigt
  → Optional: Review-Anfrage per E-Mail
```

### Multi-Tenancy

- Jeder Kunde = 1 Tenant in Supabase (tenants-Tabelle)
- tenant_id auf jedem Case
- Entitlements (modules) pro Tenant
- Website-Config pro Tenant (TypeScript-Datei)
- Voice Agent pro Tenant (eigene Retell-Agent-ID + Telefonnummer)

### Fixe Architektur-Entscheidungen

- Voice: Intake-only, max 7 Fragen, branchenspezifisch, Recording OFF
- Output: E-Mail für Kunden. WhatsApp nur Founder-Ops-Alerts (kein PII)
- SSOT: Supabase = Daten, Vercel Env = Secrets
- Deploy: Vercel Frankfurt (fra1), Root Directory = src/web
- Keine Secrets im Repo

---

## 6. Kunden

| Kunde | Status | Module | URL |
|-------|--------|--------|-----|
| **Dörfler AG** (Oberrieden) | **TRIAL_PREP** (Phase A) — Take 2 Video assembliert, Video-Pipeline v1 LIVE | voice, wizard, ops, reviews, sms | flowsight.ch/kunden/doerfler-ag |
| **Brunner Haustechnik AG** (Thalwil) | DEMO (fiktiv) | voice, wizard, ops, reviews, sms | flowsight.ch/kunden/brunner-haustechnik |
| **Jul. Weinberger AG** (Thalwil) | **GTM Goldstandard** | voice, wizard, ops, reviews, sms | flowsight.ch/kunden/weinberger-ag |
| **Walter Leuthold** (Oberrieden) | **TRIAL_PREP** (Phase A) | voice, wizard, ops, reviews, sms | flowsight.ch/kunden/walter-leuthold |
| **Orlandini Sanitär** (Horgen) | Website LIVE | wizard | flowsight.ch/kunden/orlandini |
| **Widmer H. & Co. AG** (Horgen) | Website LIVE | wizard | flowsight.ch/kunden/widmer-sanitaer |
| **BigBen Pub** (Oberrieden) | **ERSTER KUNDE** — Go-Live prep complete, Barter-Deal | voice, ops, events, reservations | flowsight.ch/bigben-pub |

### Dörfler AG — Erster Prospect durch die GTM-Maschine (Gold-Standard)
- Sanitär/Heizung seit 1926, Oberrieden ZH, 3. Generation (Ramon + Luzian Dörfler)
- Voice Agent Gold-Standard: Lisa-Persona, Info+Intake Dual-Mode, 18 Szenarien, Sprachwechsel DE↔EN/FR/IT
- 70 realistische Demo-Cases (2024-2026, saisonal verteilt, Reviews Ø 4.8★)
- Vorstellungsmaschine in Entwicklung: Scripts gefroren (Take 1-4), Screenflow-Spec (19 Screens), Pipeline-Architektur definiert. Alte Assets OBSOLET — Neuproduktion ab 18.04.
- Noch KEIN Kontakt mit Betrieb. Outreach nach Video-Produktion.
- Pain Types: erreichbarkeit, aussenwirkung, bewertung, notfall, buerochaos (5/5)

### Walter Leuthold — Zweiter Prospect durch die GTM-Maschine
- Sanitär/Spenglerei, Ein-Mann-Betrieb seit 2001, Oberrieden ZH
- Phase A provisioniert (01.04.2026): Website, Voice (Ela), Demo-Cases, Leitzentrale
- ICP 8 (HOT), 4.9 Sterne / 44 Google Reviews — herausragend
- Pain Types: erreichbarkeit (Ein-Mann-Betrieb!), buerochaos, bewertung
- Testnummer: +41 44 505 30 19

### Brunner Haustechnik AG — Demo-Tenant
- Fiktiver Betrieb für Sales-Demos (Thalwil ZH)
- Voice Agent (DE + INTL) auf **+41 44 505 48 18**
- 10 Seed Cases im Ops Dashboard
- Agent-Configs = Schablone für alle künftigen Kunden

### Walter Leuthold, Orlandini, Widmer — Prospect-Websites
- High-End Websites mit ServiceDetailOverlay, Galleries, realen Google Reviews
- Template v3: Standardisierter 10-Regeln Intake-Prozess
- Jeder Kunde hat `docs/customers/<slug>/links.md` mit allen URLs

### BigBen Pub — Erster zahlender Kunde (Gastro/Pub-Modul)
- **Erster zahlender Kunde.** Paul, Big Ben Pub, Oberrieden. 300 CHF einmalig + ~23 CHF/Mo. Barter-Deal (Free Drinks).
- **Go-Live Target: 30.04.2026** (Founder danach auf Philippinen, 4 Wochen Testphase)
- **Pub/Gastro = eigenes Produkt-Modul:** Events, Reservierungen, No-Show Tracking (Yellow/Red Card), Walk-in — separat von Cases/Tickets
- Website dark theme (flowsight.ch/bigben-pub), Voice Agent EN+DE (Lisa, +41445054818)
- Pub Dashboard (EN), Event-Pflege (Sport/Events Tabs), Reservierungs-System (Walk-in, Confirm/Decline, SMS)
- 24h SMS Reminder + Confirmation SMS = No-Show-Prävention
- **Architektur:** Polling statt Webhook für Voice→Reservation (Retell webhook_url unzuverlässig für BigBen)
- PRs #457-#467 (Onboarding) + #479-#491 (Go-Live prep) = 24 PRs total

---

## 7. GTM — Product-Led Trial Machine (ab 11.03.2026)

**Kernprinzip:** Kein Pitch-Deck, kein Demo-Call, kein Freemium. Jeder qualifizierte Prospect bekommt sein eigenes System und fühlt das Produkt auf seiner eigenen Nummer.

**Kein B-Quick.** Jeder Prospect bekommt einen dedizierten B-Full Voice Agent (personalisiert mit Firmenname, Services, Region). Qualität vor Skalierung.

### Phasen-Modell (Phase A/B Architektur, ab 01.04.2026)

```
Phase A:   Vorbereitung    → provision_trial.mjs --no-welcome-mail (kein Kontakt)
Phase B-1: Outreach        → Founder schickt Mail 1 (Video + Feedback-Bitte)
Phase B-2: Aktivierung     → Prospect sagt Go + gibt Email → activate_prospect.mjs
Phase B-3: Trial           → 14 Tage eigenes System (Timer startet bei B-2)
Phase B-4: Decision        → Convert / Live-Dock / Offboard
Phase B-5: Delivery        → Nur bei Conversion (Vertrag, Portierung)
```

### Was der Prospect bekommt (nach Phase B-2)
- **Eigene Schweizer Nummer** (Twilio Festnetz)
- **Telefonassistentin (B-Full)** — personalisiert mit Firmenname, Services, PLZ
- **Leitzentrale** via OTP-Login (6-Digit Code per E-Mail, Prospect-View)
- **15 Demo-Cases** (realistische Schweizer Daten)
- **SMS-Flow** (Post-Call Korrekturlink)
- **Review-Surface** (Google-Style mit Firmenname)
- **PWA-App** (installierbar auf Handy)
- **Ops-Email-Benachrichtigungen** (bei neuen Fällen)

### Trial-Timeline
| Tag | Was |
|-----|-----|
| 0 | Prospect sagt Go → activate_prospect.mjs → Welcome-Mail + Leitzentrale-Zugang |
| 0-2 | Prospect testet selbst (Anruf, SMS, Leitzentrale) |
| 10 | **Follow-up** (Pflicht) — Founder ruft persönlich an |
| 14 | **Decision Day** — Convert / Live-Dock / Offboard |

### Funnel-Erwartung
20 Outreach/Tag → ~5 reagieren (25%) → ~3 wollen testen (60%) → ~1 converted (25-30%)

**Operating Model:** `docs/gtm/operating_model.md`
**Pipeline:** `docs/sales/pipeline.md` + `docs/sales/pipeline.csv`

### Zwei Maschinen — die End-to-End-Skalierung

FlowSight skaliert über **zwei** Maschinen, die nahtlos ineinander greifen:

```
PROSPECT ──→ [PIPELINE-MASCHINE]   ──→ [ONBOARDING-MASCHINE]   ──→ KUNDE
              demo + outreach           live-setup + hand-over
```

| Maschine | Zweck | Bible | Lessons-Learned |
|---|---|---|---|
| **Pipeline-Maschine** | Pre-Conversion: Demo-Video personalisiert, Outreach, Trial provisionieren | `docs/gtm/pipeline/PIPELINE_BIBLE.md` | `docs/customers/lessons-learned.md` |
| **Onboarding-Maschine** | Post-Conversion: Live-Setup, Hand-Over, Validation, Convert | `docs/gtm/onboarding/ONBOARDING_BIBLE.md` | `docs/gtm/onboarding/lessons_learned.md` |

Beide Maschinen lösen denselben Bottleneck: **Founder-Zeit pro Kunde**. Jeder neue Kunde, der durch beide Maschinen läuft, hinterlässt Lessons-Learned-Einträge → die Maschinen werden je Kunde 1× besser.

**Onboarding-Maschine North Star:** Founder kann 5 Kunden pro Woche onboarden ohne Kontextwechsel. Heute: 1-2/Tag mit voller Aufmerksamkeit. Gap → Stufe 1-3 Roadmap in `docs/gtm/onboarding/ONBOARDING_BIBLE.md` §5.

**Erster Kunde durch beide Maschinen:** Big Ben Pub (Paul, Oberrieden) — Live ab 29.04.2026.

---

## 8. Wettbewerb

**Direkte Konkurrenz:** Kaum vorhanden. Keine Schweizer SaaS-Lösung bietet Website + Voice + Ops + Reviews als Paket für Handwerksbetriebe.

**Indirekte Konkurrenz:**
- Web-Agenturen (CHF 5'000-15'000 einmalig, kein Service)
- Offertenportale (renovero, local.ch — generisch)
- CRM/Ticketing (Freshdesk, Zendesk — zu komplex, nicht branchenspezifisch)

**FlowSight-Vorteile:**
- Branchenspezifisch, nicht generisch
- All-in-one statt 5 verschiedene Tools
- Persönlich eingerichtet, kein IT-Projekt
- CHF 299/Monat statt CHF 10'000 einmalig
- Schweizer Nummer, 100% DSGVO-konform (EU-Server Frankfurt), Deutsch

---

## 9. Skalierungs-Vision

| Phase | Kunden | Zeitrahmen | Fokus |
|-------|--------|-----------|-------|
| 1 | 1-5 | 0-6 Monate | Dörfler live, erste Akquise, manuell |
| 2 | 5-15 | 6-18 Monate | Website-Content → Supabase, einfaches Admin-UI |
| 3 | 15-30 | 18-30 Monate | Branchen-Templates (Elektriker, Gastro), Teilzeit-Hilfe |
| 4 | 30-100 | 30-48 Monate | Auto-Provisioning, Self-Service, Mitarbeiter |

**Entscheidung:** Produkt-Agents (Voice, Reviews) = selbst bauen. Business-Admin (Rechnungen, Buchhaltung) = kaufen (Bexio).

---

## 10. Bekannte Limitationen & offene Punkte

- **Outlook-Kalender Phase 1 LIVE** — Free/Busy im Terminpicker (grün/rote Balken), Kollisionsprüfung intern + Outlook, Application Permissions (client_credentials). Exchange Online Postfach pro MA nötig. Runbook: `docs/runbooks/outlook_kalender_onboarding.md`
- **Review-Anfrage manuell** — kein Auto-Trigger nach Fall-Abschluss
- **Terminerinnerung fehlt** — 24h-Reminder an Melder geplant (N15)
- **Kunden-Historie fehlt** — kein Matching bei wiederholtem Kontakt (N16)
- **Vercel Hobby-Limits** — 1 Log pro Invocation, keine Cron-Jobs
- **Supabase Free** — keine automatischen Backups

---

## 11. Tonalität

- **Sprache:** Hochdeutsch mit Schweizer Einschlag. Du-Form intern, Sie-Form auf Website.
- **Ton:** Professionell aber nahbar. Kein Corporate-Sprech. Direkt, lösungsorientiert.
- **Keine Buzzwords:** "Ihr digitaler Telefonassistent", nicht "KI-Revolution"
- **Branchensprache:** Sanitär, Heizung, Spenglerei, Notdienst, Rohrbruch, Badsanierung
- **Schweizer Kontext:** CHF, Kantone, Gemeinden, suissetec

---

## 12. Links

- **Website:** flowsight.ch
- **Pricing:** flowsight.ch/pricing
- **Referenz:** flowsight.ch/kunden/doerfler-ag
- **Demo:** flowsight.ch/kunden/brunner-haustechnik
- **Demo-Wizard:** flowsight.ch/kunden/brunner-haustechnik/meldung
- **Geschäftsnummer:** +41 44 552 09 19 (Lisa)
- **LinkedIn:** linkedin.com/company/flowsight-gmbh
- **Roadmap:** docs/ticketlist.md
- **Sales Pipeline:** docs/sales/pipeline.md
