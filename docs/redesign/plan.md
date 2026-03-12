# Gold Contact Redesign — Kompromisslose Vollumsetzung

**Zeitraum:** 12.03. – 10.04.2026 | **Maschinenstart:** 11.04. | **Flug:** 01.05.
**170h Founder-Fokus | CC parallel**
**Status:** ACTIVE — Phase 0 (Zielbilder) DONE, Phase 1 (Build) beginnt.

---

## Stand 12.03. — Wo wir sind

### Phase 0: Redesign-Zielbilder — DONE ✅

Alle 6 Straenge haben Gold-Level-Zielbilder. 4 IST-Audits (aus Code). 1 bindendes Querschnittsdokument (Identity Contract). Jeder Strang geschaerft und querverwiesen.

| Strang | Dokument | PRs | Status |
|--------|----------|-----|--------|
| Leitstand | leitstand.md | — | DONE |
| Voice | voice_ist.md + voice.md | #153-#155 | DONE |
| Identity Contract | identity_contract.md | #156 | DONE (Querschnitt) |
| Prospect Journey | prospect_journey_ist.md + prospect_journey.md | #157-#158, #164 | DONE (geschaerft) |
| Wizard | wizard_ist.md + wizard.md | #160-#161 | DONE |
| Review | review_ist.md + review.md | #162-#163 | DONE |

**Was die Zielbilder liefern (neu fuer den Build):**
- **Wizard:** Notfall→Telefon-Logik (N1-N7), Kategorie-Vereinheitlichung Voice+Wizard, PLZ_CITY_MAP als Shared Module, gebrandete Correction Page
- **Review:** Bewertungs-Vorbereiter (kein Google-Klon), Nachlauf als System (6 Status-Badges, Tracking, max 2 Anfragen), refresh_reviews.mjs
- **Prospect Journey:** 18 Touchpoints inkl. T13b (Review PoV), Stille-Logik, Day-10-Call-Scripts, Profil-Differenzierung (Meister/Betrieb)
- **Voice:** PLZ-Verzeichnis erweitert, Partial-Case-Handling, Chain-Cron, FAQ-Persistenz
- **Leitstand:** Nachlauf-Badges, Review-Spalte, Demo-Case-Tabs, Prospect-View-Polish
- **Identity Contract:** 7 verbindliche Regeln (R1-R7), Dual-SSOT (Supabase gewinnt), alle E-Mails auf Tenant-Branding

### Phase 1: Build — NAECHSTER SCHRITT

**Wo wir stehen:** Start von Woche 1 (12.03.). Die Zielbilder haben Tag 1 der Woche 1 verbraucht. Ab morgen (13.03.): Build beginnt.

**Was sich gegenueber dem Original-Plan aendert:**
1. **Specs sind jetzt klar.** Jeder Build-Task hat ein Zielbild als Referenz. Kein Raten, keine offenen Designfragen.
2. **Bugs entfernt.** Ticketlist bereinigt — alte Bugs (Voice, Doerfler, Kalender etc.) werden nach Build E2E neu getestet. Clean Slate.
3. **Wizard + Review haben eigene Build-Specs.** Die Zielbilder definieren exakt was gebaut werden muss (RS1-RS10, N1-N7, NS1-NS3 etc.).
4. **Identity Contract ist bindend.** Alle 7 E-Mail-Templates muessen auf Tenant-Branding umgestellt werden — das ist jetzt eine klare Liste, nicht eine vage Anforderung.

### Grober Zeithorizont

```
WOCHE 1 (12.-18.03.)     Build-Start. Blocker Kill + Weinberger = Gold.
                          Identity Contract auf alle E-Mails durchschlagen.
                          Day-5-Email + Demo-Case-Tabs + Welcome-Polish.
                          ~6 verbleibende Tage nach Zielbild-Phase.

WOCHE 2 (19.-25.03.)     Standard auf alle 7 Websites + alle Agents.
                          Review Surface = Bewertungs-Vorbereiter (review.md).
                          Wizard Gold (Notfall-Logik, Kategorie-Vereinheitlichung).
                          Video-Produktion (Founder).

WOCHE 3 (26.03.-01.04.)  Trial Journey E2E Dry-Run (beide Profile).
                          Nachlauf-System (Review-Badges, Tracking, Resend).
                          Vertrag. Call-Scripts ueben.

WOCHE 4 (02.-10.04.)     5 Prospects provisionieren + QA.
                          Founder Release Gate (10 Beruehrungspunkte).
                          Maschinenstart-Freigabe.

11.04.                    MASCHINENSTART — Erste E-Mail geht raus.
01.05.                    FLUG — System laeuft founder-arm.
```

---

## Rahmung

Kein Minimum. Maximum.

Alle Gold-Contact-Berührungspunkte werden bis 10.04. kompromisslos umgesetzt.
Es gibt kein "später" für Erlebnis- und Berührungspunkte, die im Gold Contact benannt sind.
Der Standard wird nicht an einem Goldstandard sichtbar, sondern schlägt auf alle aktiven Flächen durch.

Wir optimieren nicht auf "gerade genug für den Start", sondern auf eine brutal gute, persönliche, ausgereifte Contact-to-Test Experience vor Marktöffnung.

**Teuerster Fehler:** Den Umfang unterschätzen und in Woche 3 merken, dass 4 von 7 Websites noch nicht angefasst wurden. Der Feind ist nicht mangelnde Qualität an einem Punkt — sondern vergessene Stränge, die erst spät sichtbar werden.

---

## Definitionen: Modus vs Tier

### Modus-Logik = Leistungs-/Deliverable-Logik

Was FlowSight dem Betrieb liefert. Bestimmt durch Website-Qualität des Prospects.

| Modus | Name | Kriterium | FlowSight liefert |
|-------|------|-----------|-------------------|
| **Modus 1** | Full | Keine/schwache Website (≤ 5/10) | Komplette Website + Wizard + Voice + Ops |
| **Modus 2** | Extend | Bestehende Website funktional (6+/10) | Website intelligent erweitern + Wizard/CTA + Voice + Ops |
| **Modus 3** | Pure System | Starke bestehende Website (8+/10) | Voice + Ops + Reviews + Systemlayer, keine Website als Hauptdeliverable |

**Schnelltest:** Hat er eine Website? → NEIN → Modus 1. Würdest du dort anfragen? → NEIN → Modus 1, JA → Modus 2.

### Tier-Logik = Prioritäts-/Fokuslogik im Redesign

Wo im Redesign der Fokus liegt. Bestimmt durch strategische Rolle im Gold Contact.

| Tier | Name | Kriterium | Redesign-Fokus |
|------|------|-----------|---------------|
| **Tier 1** | Kernfokus | Sanitär/Heizung/Spengler, aktive Gold-Contact-Kernflächen | Voller Gold Standard, jeder Berührungspunkt perfekt |
| **Tier 2** | Demo/Referenz | Demo-Tenant, Referenz-System, nicht für realen Prospect-Kontakt | Muss professionell aussehen (wer Brunner sieht, denkt "so sähe mein Betrieb aus"), aber kein Outreach-Material |
| **Tier 3** | Aktiver Sonderfall | Reales Interesse, ausserhalb Kernvertikale, spezifischer Lernwert | Gezielter Scope: was lernen wir hier? Kein voller Gold-Standard-Durchlauf, aber operativ wertvoll. |

**Wichtig:** Modus und Tier sind unabhängig. Ein Case kann Modus 1 + Tier 1 sein. Oder Tier 3 und trotzdem operativ wertvoll.

### Aktive Cases: Modus × Tier

| Case | Modus | Tier | Begründung |
|------|-------|------|------------|
| **Jul. Weinberger AG** | 2 (Extend) | 1 (Kern) | Goldstandard, ICP 90+, eigene Website vorhanden. Referenz für alles. |
| **Dörfler AG** | 1 (Full) | 1 (Kern) | Erster Kunde, Founder wohnt um die Ecke, persönlicher Start. Keine eigene Website. |
| **Widmer Sanitär** | 1 (Full) | 1 (Kern) | Spenglerei, Oberrieden. Website von FlowSight. |
| **Orlandini** | 1 (Full) | 1 (Kern) | Sanitär, Horgen. Website von FlowSight. Partner-Daten offen (#89). |
| **Walter Leuthold** | 1 (Full) | 1 (Kern) | Sanitär, Oberrieden. Website von FlowSight. |
| **Brunner Haustechnik** | 1 (Full) | 2 (Demo) | Demo-Tenant, Thalwil. Showroom-Fläche. Kein realer Prospect, aber: wer Brunner sieht, muss beeindruckt sein. |
| **BigBen Pub / Paul** | 1 (Full) | 3 (Sonderfall) | Gastro, nicht Sanitär. Aber: persönliche Beziehung, reales Interesse an Voice, sehr kurze Feedbackschleife. Spezifischer Lernwert: Swisscom-Einzelnummer → Weiterleitung auf Voice-Agent. Dieses Pattern wird später generisch relevant. |

### BigBen / Paul: Scope und Lernziel

BigBen ist kein irrelevanter Ausreisser. BigBen ist ein aktiver Sonderfall mit konkretem Wert:

**Warum drin:**
- Paul ist persönlich bekannt, interessiert, kurze Feedbackschleife
- Website steht im Wesentlichen (wartet auf Material/Fotos)
- Realer Lernfall: Swisscom Einzelnummer → Weiterleitung auf Voice-Agent
- Telefonie-/Weiterleitungs-Pattern wird generisch relevant (viele KMU haben Swisscom Festnetz)
- Frühes reales Feedback zu Voice im Nicht-Sanitär-Kontext

**Was wir konkret von BigBen lernen wollen:**
1. Swisscom-Festnetz → Twilio-Weiterleitung: funktioniert das zuverlässig? Latenz? Qualität?
2. Voice-Agent für Gastro (Reservierung, Events): wie anders ist der Prompt vs Sanitär?
3. Founder-Touch bei persönlich bekanntem Prospect: wie fühlt sich der Gold-Contact-Flow an?

**Was BigBen im Redesign bekommt (Tier 3):**
- Website fertigstellen wenn Material/Fotos kommen (CC)
- Voice-Agent verifizieren (CC + Founder)
- Swisscom-Weiterleitung testen wenn Paul bereit (Founder)
- Kein eigenes Video, keine eigene Outreach-Sequenz, kein Full Dry-Run

**Was BigBen NICHT bekommt:**
- Nicht denselben QA-Durchlauf wie Tier-1-Kernflächen
- Kein Pre-Contact-Check Gate (Paul wird persönlich kontaktiert, nicht über Maschine)
- Kein Platz im Founder Release Gate (eigener Strang, eigenes Timing)

---

## Die 9 Redesign-Stränge

### Strang A: Contact / Outreach / Founder Touch

| Scope | Definition of Done |
|-------|-------------------|
| 3 Outreach-Templates (HOT/WARM/COLD) — Gold-Contact-konform | Kein "Demo", kein "10 Min Gespräch", kein Preis. "Wir haben Lisa für Sie gebaut. Rufen Sie an." |
| Call-Scripts für beide Profile (Meister + Betrieb) | Geübt, laut vorgelesen, Varianten durchgespielt (begeistert/skeptisch/Bürokraft) |
| Day-10-Call Script | Meister: "Hat Ihre Frau es gesehen?" Betrieb: "Hat Ihre Bürokraft die Übersicht gesehen?" |
| Weiterempfehlungs-Frage eingebaut | Nach positivem Day-10-Call: "Kennen Sie einen Kollegen?" |
| Persönliche Outreach-E-Mails für erste 5 Prospects | Geschrieben (nicht generiert), Firmenname im Betreff, kein Template-Gefühl |

**Owner:** 70% Founder, 30% CC (Template-Basis + Alignment-Review)

### Strang B: Video-Maschine

| Scope | Definition of Done |
|-------|-------------------|
| Equipment + Workflow | Loom oder OBS, gutes Mikro, Licht, Screen-Recording, Edit-Workflow. Setup steht, reproduzierbar. |
| Weinberger-Video (45-60s) | "Das habe ich für die Jul. Weinberger AG gebaut." Website → Lisa-Anruf → SMS. Mehrere Takes, geschnitten. |
| Generisches Intro-Video (30-45s) | Kein Firmenname. "So funktioniert Lisa." Wiederverwendbar für Modus 2/WARM. |
| 3-5 Prospect-spezifische Videos auf Vorrat | Für die Top-5 Prospects, die am 11.04. kontaktiert werden. |
| Video-Hosting + Einbindung | Loom-Link in E-Mail oder embedded — entschieden + umgesetzt. |
| Produktions-Playbook | "Neues Prospect-Video in 30 Min" — Schritt-für-Schritt, Routine. |

Video ist Kernbestandteil des High-End-Systems, nicht Nice-to-have. Der Strang durchzieht Woche 1-4.

**Owner:** 90% Founder (Aufnahme + Schnitt), 10% CC (Hosting-Integration)

### Strang C: Gold Standard — Alle 7 Kunden-Websites

| Website | Modus | Tier | Status heute | Was fehlt für Gold Standard |
|---------|-------|------|-------------|---------------------------|
| **Weinberger AG** | 2 | 1 | 95% | Final-QA, Performance, Video-Integration |
| **Dörfler AG** | 1 | 1 | 85% | Mobile QA, Brand Color verifiziert, Reviews aktuell?, links.md |
| **Walter Leuthold** | 1 | 1 | 80% | links.md fehlt, Mobile QA, Reviews verifizieren |
| **Orlandini** | 1 | 1 | 80% | links.md fehlt, Partner-Daten prüfen (#89), Mobile QA |
| **Widmer** | 1 | 1 | 80% | links.md fehlt, Spenglerei-Kategorien verifizieren, Mobile QA |
| **Brunner HT** | 1 | 2 | 80% | Demo muss genauso beeindrucken wie Echtbetrieb. Showroom-Qualität. |
| **BigBen Pub** | 1 | 3 | 75% | Material/Fotos von Paul ausstehend. Fertigstellen wenn Material kommt. |

**Definition of Done pro Tier-1-Website:**
- [ ] Mobile + Desktop: pixel-perfect, keine 404s, alle Bilder laden
- [ ] Brand Color korrekt
- [ ] Services korrekt + aktuell
- [ ] Reviews korrekt + aktuell (Crawl-Daten verifiziert)
- [ ] Emergency-Banner korrekt (wenn aktiv)
- [ ] Wizard funktioniert mit richtigen Kategorien
- [ ] links.md existiert
- [ ] Lighthouse Performance Score > 90
- [ ] Lighthouse Accessibility Score > 90

**Definition of Done Tier-2 (Brunner):** Gleich wie Tier 1 minus links.md. Plus: wirkt als Demo überzeugend.
**Definition of Done Tier-3 (BigBen):** Website komplett wenn Material da. Keine Lighthouse-Optimierung, kein Pre-Contact-Check.

**Owner:** 80% CC (Code + Performance + QA), 20% Founder (inhaltliche Verifikation + iPhone-Test)

### Strang D: Voice-Agent-Standard

| Agent | Tier | Status | Was fehlt |
|-------|------|--------|-----------|
| Weinberger DE (Intake) | 1 | LIVE | Final E2E, Gold-Contact-Greeting verifiziert |
| Weinberger INTL (Intake) | 1 | LIVE | Final E2E |
| Flowsight Sales DE (Lisa Interest Capture) | — | LIVE (PR #150) | Verifiziert, published |
| Flowsight Sales INTL (Lisa Interest Capture) | — | LIVE (PR #150) | Verifiziert, published |
| Dörfler Intake | 1 | prüfen | Status prüfen. Wenn live: Gold-Standard-QA. Wenn nicht: aufbauen. |
| Brunner HT Intake | 2 | prüfen | Demo-Agent. Muss genauso professionell sein. |
| BigBen Intake | 3 | prüfen | Verifizieren wenn Paul bereit. |

**Definition of Done pro Agent:**
- [ ] Greeting: korrekter Firmenname, "mein Name ist Lisa"
- [ ] PLZ-Erkennung funktioniert
- [ ] Notfall-Empathie-Branch getestet
- [ ] Closing: deterministic, kein Loop, max 7 Fragen
- [ ] FAQ-Edge: sauber abgefangen
- [ ] Keine falschen Infos (Preise, Zeiten, Team)
- [ ] Published via retell_sync.mjs
- [ ] E2E: Anruf → SMS → Dashboard-Fall korrekt

**Owner:** 60% CC (Agent-JSON + Sync + Verification), 40% Founder (Live-Anrufe als QA)

### Strang E: SMS / Welcome / Magic Link / Prospect Experience Layer

| Element | Gold-Contact-Anforderung | Status | Was fehlt |
|---------|--------------------------|--------|-----------|
| **SMS Absendername** | "Von Weinberger" (sein Name) | LIVE | DEMO_SIP_CALLER_ID verifizieren (BLOCKER) |
| **SMS Inhalt** | Zusammenfassung + Korrekturlink + Foto-Upload | LIVE | Template-Review: Ist der Text wirklich gut? |
| **SMS Latenz** | < 10 Sekunden nach Anruf | LIVE (ungemessen) | Latenz messen + dokumentieren |
| **Welcome-Mail** | Persönlich: "{NACHNAME}", Testnummer, 3 Schritte | Teilweise | `{NACHNAME}` + `{FIRMA}` einbauen |
| **Magic Link** | Click → Dashboard, kein Passwort | LIVE | Funktioniert — Final QA |
| **Welcome Page** | "/ops/welcome" — CTA: "Rufen Sie an" | LIVE | Polish: sieht das BRUTAL GUT aus, oder nur "funktioniert"? |
| **Day-5-Email** | "Tipp: Testen Sie Lisa mit einem echten Anruf" | FEHLT | Bauen. Gold-Contact-Pflichtbestandteil (WOW 6 Enabler). |
| **Day-13-Email** | "Ihr Test läuft morgen ab" — warm, kein Druck | Implementiert | Verifizieren: wird sie gesendet? Stimmt der Ton? |

**Owner:** 80% CC (Code), 20% Founder (Ton + Text-Review)

### Strang F: Leitstand / Mobile Experience

| Element | Gold-Contact-Anforderung | Status | Was fehlt |
|---------|--------------------------|--------|-----------|
| **Prospect First Visit** | Welcome-Banner, Testnummer prominent, klare Orientierung | LIVE | Polish: Ist der erste Eindruck "WOW" oder "Backend"? |
| **Case List** | KPI-Kacheln, Filter, Suche | LIVE | Demo-Case Filtering: `is_demo=true` RAUS aus Default-View |
| **Case Detail** | Kategorie, PLZ, Dringlichkeit, Timeline, SMS-Status | LIVE | Final Review |
| **Case-Creation Email** | "Neue Meldung: {Kategorie} in {Ort}" an Betrieb | UNVERIFIZIERT | Verifizieren/bauen |
| **Review Button** | Nur wenn status=done + Kontaktdaten | LIVE | E2E testen |
| **Mobile Experience** | Meister öffnet auf iPhone | LIVE | Expliziter Mobile-QA-Pass für Dashboard |
| **Tenant Branding** | Name + Initials statt "FlowSight" | LIVE | Verifizieren für alle aktiven Tenants |

**Owner:** 70% CC (Code), 30% Founder (UX-Review auf echtem Gerät)

### Strang G: Trial Journey Tag 0–14

Jeder Tag hat einen definierten Zustand. Jeder Zustand wird real durchgespielt — für BEIDE Profile (Meister + Betrieb).

| Tag | Was passiert | Automatisch? | Verifiziert? |
|-----|------------|-------------|-------------|
| **0** | Welcome-Mail + Magic Link + Testnummer | Ja (provision_trial) | Ja |
| **0** | Prospect ruft an → WOW 2+3 (Lisa + SMS) | System | Weinberger: ja. Alle anderen: NEIN |
| **0-1** | Prospect öffnet Dashboard → WOW 4 | System | Teilweise |
| **2-5** | Prospect testet abends → WOW 5 | System | Nicht explizit getestet |
| **5** | **Day-5-Email: "Testen Sie mit einem echten Anruf"** | FEHLT → Bauen | — |
| **5-10** | Echte Anrufe → WOW 6 | Prospect-Initiative | Day-5-Email als Nudge |
| **7** | Lifecycle Tick: Engagement-Check | Ja | Ja |
| **10** | **Founder ruft an** (Pflicht) | Nein (Morning Report Alert) | Call-Script vorbereiten + üben |
| **10** | Weiterempfehlungs-Frage | Nein (Founder) | Im Call-Script integriert |
| **13** | Auto-Email: "Ihr Test läuft morgen ab" | Ja (Tick) | Versand verifizieren |
| **14** | Decision: Convert / Dock / Offboard | Founder | Vertrag muss stehen |

**Definition of Done:** Full Dry-Run für Profil "Meister" UND Profil "Betrieb" durchgespielt. Jeder Tag, jede E-Mail, jeder Bildschirm. Dokumentiert.

**Owner:** 50/50 Founder + CC

### Strang H: Provisioning / QA / Quality Gates / SSOT

| Element | Ziel | Status |
|---------|------|--------|
| `provision_trial.mjs` | < 15 Min E2E | Funktioniert, Timing ungemessen |
| `pre_contact_check.mjs` | Pflicht vor jedem Kontakt (kein optional) | Existiert, optional |
| `offboard_tenant.mjs` | Clean Delete funktioniert | LIVE |
| Quality Gate 1-7 | Alle 7 Checks pro Prospect bestanden | Checkliste da, Enforcement fehlt |
| Demo-Case Seeding | Profil-angepasst (Meister: 3, Betrieb: 15) | Default 15, kein Auto-Routing |
| Morning Report | Zeigt: Outreach-ready, Active Trials, Health | Teilweise |
| SSOT Docs | STATUS + Ticketlist + gold_contact aktuell | Aktuell bis PR #150 |

**Owner:** 90% CC, 10% Founder (Verification)

### Strang I: Vertrags-/Closing-Readiness

| Element | Ziel | Status |
|---------|------|--------|
| SaaS-Vertrag CH-Recht | Template fertig, Anwalt abgestimmt | FEHLT |
| Pricing | 299 CHF/Monat, monatlich kündbar | Entschieden, nicht im Vertrag |
| Konversions-Flow | Prospect sagt Ja → Schritt-für-Schritt dokumentiert + getestet | Dokumentiert, nicht getestet |
| Offboarding-Flow | Prospect sagt Nein → Clean Delete + E-Mail | LIVE |
| AVV/DSGVO | Auftragsverarbeitung, Löschrechte | Referenziert, nicht formalisiert |

**Owner:** 90% Founder (Legal), 10% CC (Docs + Flow-Dokumentation)

---

## Kritischer Pfad

```
WOCHE 1                    WOCHE 2                    WOCHE 3                    WOCHE 4
────────                   ────────                   ────────                   ────────

[BLOCKER KILL]─────────┐
  DEMO_SIP_CALLER_ID   │
  Case-Creation Email   │
  Demo-Case Filtering   │
  Day-5-Email bauen     │
                        │
[WEINBERGER = GOLD]────┼──[STANDARD → ALLE 7]──────[FINAL QA ALLE 7]
  Website perfekt       │    Tier 1: 5 Websites       Performance + Content
  Agent verifiziert     │    Tier 2: Brunner HT
  SMS verifiziert       │    Tier 3: BigBen (wenn
  Welcome-Flow perfekt  │      Material da)
                        │
[VIDEO SETUP]──────────┼──[VIDEO PRODUKTION]────────[VIDEO INTEGRATION]────[VIDEOS FÜR 5 PROSPECTS]
  Equipment             │    Weinberger-Video          Generisches Video      Prospect-spezifisch
  Workflow              │    Schnitt-Routine           Hosting entschieden    Auf Vorrat
  Test-Recording        │
                        │
[OUTREACH ALIGNMENT]───┼──[TEMPLATES FINAL]─────────[CALL-SCRIPTS ÜBEN]────[5 EMAILS GESCHRIEBEN]
  Gold-Contact-Sprache  │    HOT/WARM/COLD             Meister + Betrieb      Personalisiert
  "Test" statt "Demo"   │    Video integriert           Varianten              Ready to send
                        │
                        └──────────────────────────[FULL DRY RUN]──────────[FOUNDER RELEASE GATE]
                                                      Tag 0-14 Meister        5 Prospects geprüft
                                                      Tag 0-14 Betrieb        Go/No-Go pro Prospect
                                                      Fix was bricht          Maschinenstart-Freigabe

                           [VERTRAG START]──────────[VERTRAG FINAL]
                             Template + Anwalt        Unterschriftsreif

                                                    [PROVISIONING HÄRTEN]──[5 × PROVISIONIERT]
                                                      < 15 Min                Pre-Contact ✓
                                                      Auto-Scaling            QA bestanden
```

**Abhängigkeiten:**
1. **Blocker Kill → alles andere.** Ohne DEMO_SIP_CALLER_ID kann kein SMS-Test funktionieren. Tag 1-2 Woche 1.
2. **Weinberger Gold → Standard Rollout.** Erst wenn Weinberger perfekt ist, wissen wir was "Gold Standard" konkret bedeutet.
3. **Video Setup → Video Produktion.** Equipment + Workflow Woche 1, Produktion ab Woche 2.
4. **Full Dry Run → Machine.** Erst wenn Tag 0-14 komplett durchgespielt ist, können wir Prospects provisionieren.
5. **Vertrag → Conversion-Readiness.** Parallel, aber muss Ende Woche 3 stehen.
6. **Alle 7 Websites → Founder Release Gate.** Gate in Woche 4 prüft auch Website-Qualität.

---

## 4-Wochen-Plan

### Woche 1: REFERENZ-STANDARD (12.–18.03.)

**Ziel:** Weinberger AG ist das perfekte Referenz-System. Alle Blocker eliminiert. Video-Setup steht.

**Aktive Stränge:** A (Outreach Alignment), B (Video Setup), C (Weinberger), D (Weinberger Agent), E (SMS/Welcome), F (Dashboard), H (QA)

| # | Task | Owner | h | Strang | Typ |
|---|------|-------|---|--------|-----|
| 1.1 | DEMO_SIP_CALLER_ID auf Vercel setzen + SMS E2E testen | Founder | 1 | E | **GC-Pflicht** |
| 1.2 | Case-Creation Email Notification verifizieren/bauen | CC | 2 | F | **GC-Pflicht** |
| 1.3 | Demo-Case Filtering: Prospect-View filtert `is_demo=true` raus | CC | 1 | F | **GC-Pflicht** |
| 1.4 | Day-5-Email bauen ("Tipp: Testen Sie mit echtem Anruf") | CC | 3 | G | **GC-Pflicht** |
| 1.5 | Welcome-Mail: `{NACHNAME}` + `{FIRMA}` Personalisierung | CC | 2 | E | **GC-Pflicht** |
| 1.6 | Pre-Contact-Check als Pflicht-Gate (nicht optional) | CC | 2 | H | **Standardisierung** |
| 1.7 | Outreach-Templates: "Demo"→"Test", Pricing raus, Gold-Contact-Sprache | CC | 3 | A | **GC-Pflicht** |
| 1.8 | Provisioning: Auto-Scale Demo-Cases nach team_size | CC | 1 | H | **Standardisierung** |
| 1.9 | links.md für Walter Leuthold, Orlandini, Widmer | CC | 1 | C | **Standardisierung** |
| 1.10 | Weinberger Website: Lighthouse > 90, Mobile Final-QA | CC | 3 | C | **GC-Pflicht** |
| 1.11 | Weinberger Agent DE + INTL: Full E2E (Anruf → SMS → Dashboard) | CC+F | 2+2 | D | **GC-Pflicht** |
| 1.12 | Welcome Page "/ops/welcome" Polish: brutal gut, nicht nur funktional | CC | 3 | F | **GC-Pflicht** |
| 1.13 | Day-13-Email: Versand verifizieren, Ton prüfen | CC+F | 2+1 | G | **GC-Pflicht** |
| 1.14 | **Video-Setup:** Equipment, Loom/OBS, Mikro, Licht, Test-Recording | Founder | 4 | B | **Enablement** |
| 1.15 | **Video-Hosting-Entscheid:** Loom-Link in E-Mail oder Website-Embed? | Founder | 1 | B | **Enablement** |
| 1.16 | **Weinberger E2E Dry-Run:** Website → Anruf → SMS → Dashboard → Welcome → Magic Link | Founder | 3 | G | **GC-Pflicht** |
| 1.17 | Outreach-Templates lesen + Gold-Contact-Drift markieren | Founder | 2 | A | **GC-Pflicht** |
| 1.18 | Vertrag: SaaS-Template CH-Recht recherchieren, Anwalt kontaktieren | Founder | 4 | I | **GC-Pflicht** |
| 1.19 | Modus-1-Betriebe Inventur (Dörfler/Widmer/Orlandini/Leuthold): Status-Notiz pro Betrieb | Founder | 3 | C | **Standardisierung** |
| 1.20 | Fixes aus Weinberger Dry-Run (1.16) | CC | 5 | — | **Puffer** |

**Founder: ~21h | CC: ~30h**

**Entscheidungen Woche 1:**
- Video-Hosting: Loom oder Self-hosted?
- Vertrag: Anwalt, SaaS-Vorlage, oder selbst entwerfen?

**Gate/Exit-Kriterien:**
- [ ] DEMO_SIP_CALLER_ID gesetzt + SMS kommt an
- [ ] Weinberger E2E fehlerfrei (WOW 1-4 durchgespielt)
- [ ] Alle 6 Blocker/Gaps geschlossen
- [ ] Video-Setup funktioniert (Test-Recording gemacht)
- [ ] Outreach-Templates Gold-Contact-konform

**SSOT-Folgen:** Ticketlist Q1 gelöst. Neue PRs archiviert. STATUS.md Datum-Bump.

---

### Woche 2: STANDARD DURCHSCHLAGEN (19.–25.03.)

**Ziel:** Der Weinberger-Standard gilt für alle 7 Websites, alle Agents, alle SMS-Configs. Erstes Video fertig. Outreach-Templates final.

**Aktive Stränge:** B (Video Produktion), C (alle 7 Websites), D (alle Agents), E (SMS alle Tenants), A (Templates Final)

| # | Task | Owner | h | Strang | Typ |
|---|------|-------|---|--------|-----|
| 2.1 | **Tier 1: Dörfler → Gold Standard** (Mobile QA, Brand Color, Reviews, Kategorien, Lighthouse > 90) | CC | 3 | C | **Standardisierung** |
| 2.2 | **Tier 1: Walter Leuthold → Gold Standard** | CC | 3 | C | **Standardisierung** |
| 2.3 | **Tier 1: Orlandini → Gold Standard** (Partner-Daten klären #89) | CC | 3 | C | **Standardisierung** |
| 2.4 | **Tier 1: Widmer → Gold Standard** (Spenglerei-Kategorien) | CC | 3 | C | **Standardisierung** |
| 2.5 | **Tier 2: Brunner HT → Gold Standard** (Demo = Showroom-Qualität) | CC | 3 | C | **Standardisierung** |
| 2.6 | **Tier 3: BigBen Pub** — fertigstellen wenn Material/Fotos da. Sonst: Status quo beibehalten. | CC | 2 | C | **Sonderfall** |
| 2.7 | Weinberger Website: Video-Embed oder Loom-Link-Integration | CC | 2 | B+C | **GC-Pflicht** |
| 2.8 | **Alle aktiven Intake-Agents:** Gold-Standard-QA (Greeting, PLZ, Empathie, Closing, FAQ) | CC | 5 | D | **GC-Pflicht** |
| 2.9 | **SMS-Config Review:** Absendername + Inhalt + Link für JEDEN aktiven Tenant | CC | 2 | E | **GC-Pflicht** |
| 2.10 | Outreach-Templates HOT/WARM/COLD: Final-Version, Video-Link integriert | CC | 2 | A | **GC-Pflicht** |
| 2.11 | **Video #1: Weinberger AG** (45-60s, Screen-Recording, mehrere Takes, Schnitt) | Founder | 10 | B | **GC-Pflicht** |
| 2.12 | **Video #2: Generisches Intro** (30-45s, kein Firmenname, wiederverwendbar) | Founder | 5 | B | **GC-Pflicht** |
| 2.13 | **Mobile QA: Alle 7 Websites auf iPhone** — Screenshot-Protokoll pro Website | Founder | 5 | C | **GC-Pflicht** |
| 2.14 | **Alle Agents live-testen:** Jede Nummer anrufen, Lisa-Qualität bewerten | Founder | 4 | D | **GC-Pflicht** |
| 2.15 | Outreach E-Mail #1 für Weinberger persönlich schreiben (kein Template) | Founder | 2 | A | **GC-Pflicht** |
| 2.16 | Vertrag: Template-Entwurf, Anwalt-Feedback verarbeiten | Founder | 4 | I | **GC-Pflicht** |
| 2.17 | Fixes aus Mobile QA + Agent-Tests (2.13, 2.14) | CC | 5 | — | **Puffer** |

**Founder: ~30h | CC: ~33h**

**Entscheidungen Woche 2:**
- Orlandini Partner (#89): rein oder raus?
- BigBen: Material da? Wenn ja: fertigstellen. Wenn nein: zurückstellen.

**Gate/Exit-Kriterien:**
- [ ] Alle 5 Tier-1-Websites: Lighthouse > 90, Mobile QA bestanden, keine 404s
- [ ] Tier-2 (Brunner): Showroom-Qualität bestätigt
- [ ] Alle aktiven Agents: E2E verifiziert, Gold-Standard-QA bestanden
- [ ] SMS-Config für alle aktiven Tenants verifiziert
- [ ] Video #1 (Weinberger) + Video #2 (Generisch) fertig
- [ ] Outreach-Templates final (3 Varianten, Video integriert)

**SSOT-Folgen:** Jede Website-Änderung → PR. Agent-Updates → retell_sync.mjs. STATUS.md + Ticketlist aktualisieren.

---

### Woche 3: JOURNEY PERFEKTIONIEREN (26.03.–01.04.)

**Ziel:** Trial-Journey Tag 0-14 für BEIDE Profile real durchgespielt. Vertrag steht. 5 Videos fertig. Provisioning gehärtet.

**Aktive Stränge:** G (Trial Journey), B (weitere Videos), I (Vertrag), F (Dashboard Polish), H (Provisioning), A (Call-Scripts)

| # | Task | Owner | h | Strang | Typ |
|---|------|-------|---|--------|-----|
| 3.1 | **Full Dry-Run Profil "Meister":** Tag 0 (Outreach+Video an sich selbst senden) → Tag 1 (Magic Link) → Tag 5 (Day-5-Email prüfen, echten Anruf simulieren) → Tag 10 (Call-Script üben) → Tag 13 (Auto-Email prüfen) → Tag 14 (Entscheidung durchspielen) | Founder | 8 | G | **GC-Pflicht** |
| 3.2 | **Full Dry-Run Profil "Betrieb":** Gleicher Durchlauf, Betrieb-Perspektive (Bürokraft, Dashboard-Fokus, 2. Magic Link) | Founder | 5 | G | **GC-Pflicht** |
| 3.3 | **Video #3-5: Prospect-spezifisch** (3 Hot-Prospects aus Scout-Auswahl) | Founder | 10 | B | **GC-Pflicht** |
| 3.4 | **Day-10-Call Scripts üben:** 3 Varianten laut vorlesen (begeistert / skeptisch / Bürokraft) | Founder | 3 | A | **GC-Pflicht** |
| 3.5 | **Vertrag finalisieren:** SaaS-Template final, AVV-Entwurf, mit Anwalt abgestimmt | Founder | 5 | I | **GC-Pflicht** |
| 3.6 | Scout: Top-20 Prospects identifizieren, Top-5 für Woche 4 auswählen | F+CC | 2+2 | H | **Enablement** |
| 3.7 | BigBen: Swisscom-Weiterleitung testen wenn Paul bereit. Ergebnisse dokumentieren. | Founder | 2 | Sonderfall | **Sonderfall** |
| 3.8 | Alle Trial-Emails verifizieren: Welcome, Day-5, Day-13. Versand testen, Ton prüfen. | CC | 3 | G | **GC-Pflicht** |
| 3.9 | Dashboard Prospect-View: Willkommens-Banner, "Ihre Nummer", Case-Filter, mobile Polish | CC | 4 | F | **GC-Pflicht** |
| 3.10 | Review Engine E2E: Case → Done → Review-Button → Email → Surface → Google-Link | CC | 2 | F | **GC-Pflicht** |
| 3.11 | Provisioning Pipeline messen + optimieren (Ziel: < 15 Min) | CC | 3 | H | **Standardisierung** |
| 3.12 | Morning Report erweitern: "Outreach-ready Prospects", "System Health" | CC | 2 | H | **Standardisierung** |
| 3.13 | Konversions-Flow dokumentieren + testen: Prospect Ja → Vertrag → Peoplefone → Agent finalisieren → Demo-Cases löschen | CC | 2 | I | **GC-Pflicht** |
| 3.14 | Fixes aus Dry-Runs (3.1, 3.2) | CC | 6 | — | **Puffer** |

**Founder: ~35h | CC: ~24h**

**Gate/Exit-Kriterien:**
- [ ] Full Dry-Run "Meister" bestanden: jeder Tag, jede E-Mail, jeder Bildschirm
- [ ] Full Dry-Run "Betrieb" bestanden: dasselbe
- [ ] 5 Videos fertig (2 aus Woche 2 + 3 neu)
- [ ] Vertrag unterschriftsreif (mindestens Founder-approved Entwurf)
- [ ] Provisioning < 15 Min gemessen
- [ ] Review Engine E2E verifiziert
- [ ] Day-10-Call Script sitzt (geübt, nicht nur geschrieben)

**SSOT-Folgen:** Trial Journey als verifizierte Realität dokumentieren. Konversions-Flow in Operating Model aufnehmen. BigBen Learnings dokumentieren.

---

### Woche 4: MASCHINE SCHARF + FOUNDER RELEASE GATE (02.–10.04.)

**Ziel:** 5 Prospects provisioniert, QA-bestanden. Founder Release Gate bestanden. Am 11.04. geht die erste E-Mail raus.

**Aktive Stränge:** H (Provisioning 5×), A (5 persönliche Mails), B (Video-Feinschliff), C (neue Websites), alle Stränge Final-QA

| # | Task | Owner | h | Strang | Typ |
|---|------|-------|---|--------|-----|
| 4.1 | **Prospect #1 provisionieren:** Crawl → Website → Agent → Tenant → SMS → Demo-Cases → Pre-Contact-Check | CC | 3 | H | **Enablement** |
| 4.2 | **Prospect #2 provisionieren** | CC | 3 | H | **Enablement** |
| 4.3 | **Prospect #3 provisionieren** | CC | 3 | H | **Enablement** |
| 4.4 | **Prospect #4 provisionieren** | CC | 3 | H | **Enablement** |
| 4.5 | **Prospect #5 provisionieren** | CC | 3 | H | **Enablement** |
| 4.6 | **QA alle 5 Prospects:** Founder ruft jede Nummer an, prüft SMS, öffnet Dashboard, testet Website auf iPhone | Founder | 5 | H | **GC-Pflicht** |
| 4.7 | **5 persönliche Outreach-E-Mails schreiben** | Founder | 5 | A | **GC-Pflicht** |
| 4.8 | **Outreach-Sequenz Prospect #1 komplett:** E-Mail + Video + Call-Script + Day-10-Script | Founder | 3 | A | **GC-Pflicht** |
| 4.9 | Video-Feinschliff: Alle 5 Prospect-Videos fertig? Retakes wo nötig. | Founder | 4 | B | **GC-Pflicht** |
| 4.10 | Video-Produktions-Playbook finalisieren: "Neues Video in 30 Min" | Founder | 2 | B | **Standardisierung** |
| 4.11 | Reise-Checklist durchgehen: Founder fliegt 01.05. Monitoring, Eskalation, Morning Report. | Founder | 2 | H | **Enablement** |
| 4.12 | Quality Gate Enforcement: Pre-Contact-Check Ergebnis pro Prospect dokumentieren | CC | 2 | H | **Standardisierung** |
| 4.13 | Morning Report: "5 Prospects outreach-ready, 0 active trials, system healthy" | CC | 1 | H | **Standardisierung** |
| 4.14 | Final System-Check: Health grün, Sentry konfiguriert, Telegram läuft, Lifecycle Tick OK | CC | 2 | H | **GC-Pflicht** |
| 4.15 | SSOT Final Review: STATUS.md, Ticketlist.md, gold_contact.md — Stand 10.04. | CC+F | 2+2 | H | **Standardisierung** |
| 4.16 | **FOUNDER RELEASE GATE** (siehe unten) | Founder | 4 | ALLE | **GC-Pflicht** |
| 4.17 | Puffer | F+CC | 3+2 | — | **Puffer** |

**Founder: ~30h | CC: ~21h**

---

## Founder Release Gate: "Maschinenstart-Freigabe"

### Was ist das

Am Ende von Woche 4, vor dem 11.04., durchläuft der Founder einen strukturierten Go/No-Go-Entscheid pro Prospect. Die Frage ist nicht "funktioniert die Technik?" — sondern:

> **"Würde ich diesen Prospect jetzt ohne Bauchweh kontaktieren — ja oder nein?"**

### Wer prüft

Founder persönlich. Nicht delegierbar. Jeder Prospect wird einzeln bewertet.

### Prüfkriterien pro Prospect (10 Berührungspunkte)

| # | Berührungspunkt | Prüfung | Bestanden? |
|---|----------------|---------|------------|
| 1 | **Persönliche E-Mail** | Gelesen. Klingt persönlich, nicht nach Template. Firmenname im Betreff. Würde ich das an einen Freund weiterleiten? | [ ] |
| 2 | **Prospect-spezifisches Video** | Angeschaut. Zeigt SEINEN Betrieb. Kein Versprecher, kein Rauschen, guter Ton. Würde ich das meiner Mutter zeigen? | [ ] |
| 3 | **Website / Webfläche** | Auf iPhone geöffnet. Sieht professionell aus. Sein Name, seine Services, seine Reviews. Keine 404s. Lädt schnell. | [ ] |
| 4 | **Voice-Agent** | Angerufen. Lisa sagt seinen Firmennamen. PLZ funktioniert. Kein Fehler. Höflich, schnell, kompetent. | [ ] |
| 5 | **SMS-Moment** | SMS kam an. Richtiger Absendername. Inhalt stimmt. Link funktioniert. Foto-Upload funktioniert. | [ ] |
| 6 | **Welcome / Magic Link** | Link geklickt. Dashboard öffnet sich. Kein Passwort. Welcome Page zeigt seine Nummer. | [ ] |
| 7 | **Dashboard / Mobile** | Auf iPhone geöffnet. Sein Testfall ist da. Filter funktioniert. Demo-Cases nicht störend. Sieht professionell aus. | [ ] |
| 8 | **Trial-Journey Tag 0-14** | Day-5 Email: kommt, richtiger Ton. Day-13 Email: kommt, richtiger Ton. Lifecycle Tick: läuft. | [ ] |
| 9 | **Day-10 Call-Script** | Für diesen Prospect vorbereitet. Meister oder Betrieb? Welche Frage? Welche Variante bei Skepsis? | [ ] |
| 10 | **Vertrags-/Closing-Readiness** | Wenn er Ja sagt: Vertrag da? Preis klar? Nächster Schritt definiert? | [ ] |

### Bewertung

- **10/10:** Prospect geht raus am 11.04.
- **8-9/10:** Prospect geht raus, fehlende Punkte werden in Woche 1 nach Maschinenstart nachgezogen (nur wenn kein Kill-Szenario betroffen).
- **< 8/10:** Prospect geht NICHT raus. CC fixt. Founder re-prüft.

### Was bei "Nein"

Prospect wird nicht kontaktiert am 11.04. CC fixt die fehlenden Punkte. Founder prüft erneut. Prospect geht raus, sobald Gate bestanden — auch nach dem 11.04.

**Kein Prospect geht raus, der das Gate nicht bestanden hat.** Lieber 3 perfekte Kontakte als 5 mittelmässige.

### Minimum für Maschinenstart

- **Mindestens 3 von 5 Prospects** müssen das Founder Release Gate bestehen.
- Wenn weniger als 3: Maschinenstart verschieben auf den Tag, an dem 3 Prospects Gate bestanden haben.
- Das ist kein Scheitern — das ist Qualitätskontrolle.

---

## Task-Typen im Redesign

| Typ | Bedeutung | Beispiele |
|-----|-----------|----------|
| **GC-Pflicht** | Direkt im Gold Contact als Berührungspunkt benannt. Nicht verhandelbar. | Video, SMS, Lisa-Greeting, Day-5-Email, Day-10-Call, Welcome-Flow |
| **Standardisierung** | Gold-Contact-Standard auf alle Flächen durchschlagen. Der Unterschied zwischen "einem guten Beispiel" und "einem System". | Alle 7 Websites, alle Agents, alle SMS-Configs, Provisioning-Auto-Scaling |
| **Enablement** | Support-Arbeit, die GC-Pflicht-Punkte ermöglicht. | Provisioning, Scout, Video-Setup, Equipment |
| **Sonderfall** | BigBen / Tier-3 Arbeit. Gezielt, nicht aufgeblasen. | BigBen Website, Swisscom-Test, Gastro-Agent |
| **Puffer** | Fixes für das, was in Dry-Runs und QA bricht. 15-20% des Plans. | "Fixes aus Dry-Run" Blöcke |

---

## Anti-Drift

### NICHT Teil dieses 4-Wochen-Redesigns

| Thema | Warum raus | Gold-Contact-Bezug |
|-------|-----------|-------------------|
| Google Reviews API Import | Gold Contact sagt "Bewertungsseite → Google-Link klicken." Nicht "automatisch importieren." Das IST der Standard. | §12: Reviews one-way outbound |
| Stripe / automatisierte Billing | Gold Contact sagt "Founder aktiviert Abo." Vertrag + manuelle Rechnung reicht für 1-5 Kunden. | §11: "Founder aktiviert" |
| Mobile App / PWA | Gold Contact sagt "Magic Link → Dashboard." Kein App Store. | §3: "Kein Setup nötig" |
| Kalender-Sync (N3) | Kundenfeedback-Trigger, nicht Gold-Contact-Bestandteil. | Nicht referenziert |
| Analytics Dashboard (N23) | Post-Go-Live Metrik-Tool. | §15: Metriken = Founder-Notiz |
| LinkedIn Unternehmensseite (L5) | Marketing-Kanal, nicht Contact-to-Test Experience. | Nicht referenziert |
| Twilio Number-Pool Automation | Operational convenience. Manuelles Reassign reicht für < 10 Trials. | Nicht referenziert |

### Wo Website-first Drift droht

**Gefahr:** CC verbringt 40h mit Lighthouse-Optimierung und CSS-Feinschliff an 7 Websites, während Trial-Journey-Emails nicht getestet sind.

**Gegenmittel:** Websites = Strang C. Trial Journey = Strang G. Eigene Exit-Kriterien pro Strang. Woche 2 = Website-Woche, Woche 3 = Journey-Woche. Nicht umgekehrt, nicht verschmelzen.

### Wo Architektur-Selbstzweck droht

**Gefahr:** CC baut automatisierte Lighthouse-CI-Pipeline, Pre-Contact-Check als GitHub Action, Demo-Case-Routing-Engine — technisch sauber, merkt keiner.

**Gegenmittel:** Jeder CC-Task muss diese Frage bestehen: *"Merkt der Prospect den Unterschied?"* Pre-Contact-Check als Script mit --pass Flag = ja. CI-Pipeline dafür = overengineered für 5 Prospects.

### Wo "viel gebaut, aber Erlebnis nicht brutal gut" droht

**Gefahr:** Am 10.04. alle Checklisten grün, aber: Video mittelmässig, Outreach-Mail Template-Gefühl, Day-10-Call improvisiert.

**Gegenmittel:** Der Founder Release Gate testet das Erlebnis, nicht das System. "Würde ich das meiner Mutter zeigen?" schlägt "Lighthouse Score 94."

### Wo BigBen den Kernfokus verwässert

**Gefahr:** Founder verbringt 15h mit Swisscom-Debugging für Paul, während Tier-1-Call-Scripts nicht geübt sind.

**Gegenmittel:** BigBen = Tier 3. Feste Zeitbox: max 4h im gesamten Redesign (2h Woche 3, 2h Puffer). Swisscom-Test nur wenn Paul bereit UND Tier-1-Gates on track.

---

## Stunden-Übersicht

| Woche | Founder | CC | Thema |
|-------|---------|-----|-------|
| 1 | 21h | 30h | Referenz-Standard + Blocker Kill |
| 2 | 30h | 33h | Standard Durchschlagen (alle 7 + Videos) |
| 3 | 35h | 24h | Journey Perfektionieren + Vertrag |
| 4 | 30h | 21h | Maschine Scharf + Founder Release Gate |
| **Total** | **116h** | **108h** | |

**Founder: 116h von 170h** → 54h Reserve für Video-Retakes, Vertragsverhandlung, Dry-Run-Fixes, weitere Prospects, oder BigBen.

Die 54h Reserve ist kein Budget für neue Features. Es ist der Unterschied zwischen "Plan geschafft" und "brutal gut." Die Reserve fliesst dorthin, wo Dry-Runs und das Founder Release Gate zeigen, dass es noch nicht reicht.

---

## Top 5 Entscheidungen, die wir erzwingen müssen

1. **Video-Hosting (Woche 1):** Loom-Link in E-Mail oder embedded auf Website? Muss vor Produktion feststehen.
2. **Orlandini Partner-Daten #89 (Woche 2):** Rein oder raus? Blockiert Website-Gold-Standard.
3. **Vertrag-Template-Quelle (Woche 1-2):** Anwalt, SaaS-Vorlage, oder selbst entwerfen?
4. **Day-5-Email Ton (Woche 1):** Wie direktiv? Muss zum Gold-Contact-Ton passen ("beiläufig, nicht drängend").
5. **Maschinenstart-Schwelle (Woche 4):** Mindestens 3/5 Prospects müssen Founder Release Gate bestehen. Wenn weniger: verschieben?

## Top 5 Artefakte, die am 10.04. stehen müssen

1. **5 Prospect-spezifische Videos** — aufgenommen, geschnitten, gehostet, in Outreach-E-Mails eingebunden
2. **5 outreach-ready Prospects** — Website + Agent + SMS + Dashboard + Pre-Contact-Check + Founder Release Gate bestanden
3. **SaaS-Vertrag** — unterschriftsreif, 299 CHF/Monat, monatlich kündbar, AVV inklusive
4. **Trial-Journey verifiziert** — für beide Profile (Meister + Betrieb) Tag 0-14 real durchgespielt
5. **7 Kunden-Websites auf Gold Standard** — Tier 1 (5×): Lighthouse > 90, Mobile QA, Content verifiziert. Tier 2 (1×): Showroom-Qualität. Tier 3 (1×): fertig wenn Material da.

## Woran wir am 10.04. erkennen, dass Gold Contact materialisiert ist

Am 11.04. öffnet Gunnar sein Handy, wählt Prospect #1 aus, und drückt "Senden" auf eine E-Mail, die den Namen des Betriebs im Betreff hat, ein 45-Sekunden-Video enthält das seinen Betrieb zeigt, und eine Testnummer die sofort funktioniert. Alles dahinter — Website, Lisa, SMS, Dashboard, Welcome-Flow, Review-Engine, Trial-Emails, Day-10-Script, Vertrag — steht. Nicht "meistens." Nicht "für Weinberger." Für jeden Prospect, der das Founder Release Gate bestanden hat. Kompromisslos.

---

## Änderungen gegenüber V1

| Punkt | V1 | V2 |
|-------|----|----|
| **Rahmung** | Implizit Minimum-Go-Live ("was muss mindestens stehen") | Explizit kompromisslose Vollumsetzung |
| **BigBen** | "Sonderfall, gleicher Standard?" als offene Frage | Klar gerahmt: Tier 3, Sonderfall ausserhalb Kernvertikale, im Scope mit spezifischem Lernziel (Swisscom), Zeitbox 4h |
| **Modus/Tier** | Vermischt (Modus 1 = Tier 1 implizit) | Sauber getrennt: Modus = Deliverable-Logik, Tier = Prioritäts-Logik. 7 Cases explizit zugeordnet. |
| **Founder Release Gate** | Fehlte | Strukturiertes Go/No-Go pro Prospect, 10 Berührungspunkte, Minimum 3/5 für Maschinenstart |
| **Anti-Drift BigBen** | Nicht adressiert | Explizite Zeitbox (4h), Gegenmittel gegen Verwässerung |
| **Video als Strang** | Unterpunkt in Woche 2 | Eigener Produktionsstrang B, durchzieht Woche 1-4, Playbook als Deliverable |
| **Websites** | Weinberger Gold, Rest "kommt mit" | Alle 7 explizit mit Tier-spezifischer Definition of Done |
