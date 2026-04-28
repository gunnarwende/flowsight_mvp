# Gold-Contact-Pipeline — Die komplette Referenz

**Version:** 2.0 — **PRODUCTION BASELINE** | **Datum:** 2026-04-24
**Zweck:** Dieses Dokument beschreibt die GESAMTE Pipeline in allerhöchster Detailtiefe. Es dient als einzige Wahrheitsquelle für alle Beteiligten (Founder, CC, externe AI-Module). Wer dieses Dokument liest, versteht die Pipeline vollständig — von der Idee bis zur letzten Schraube.

**🔒 PRODUCTION-BASELINE 24.04.2026 (Round-15 FINAL):**
Pipeline Screenflow Take 2+3+4 ist **10/10 production-ready** für alle 4 Referenz-Betriebe (Dörfler, Leins, Stark, Wälti). Ab diesem Zeitpunkt ist dies der **DAUERHAFTE Ausgangszustand** — jeder neue Betrieb (Nr. 5 bis 100+) läuft durch exakt dieselbe Pipeline und erreicht automatisch dasselbe Niveau. Siehe **§34 Production-Baseline Lock** für die verbindliche Regel-Liste. Round-1 bis Round-15-Learnings (FB1-FB60) sind in §31-§33 dokumentiert und MÜSSEN bei jeder Pipeline-Änderung respektiert werden — keine Regression erlaubt.

**Day-23-Status (23.04.2026):** Pipeline Screenflow Take 2+3+4 FINAL für Dörfler AG (Masterbetrieb, 10/10 durchgejagt). 57+ Feedback-Punkte (A1-A19, B1-B8, C1-C29). Neu in §24-§28: Demo-Time-Architektur, DEMO_NO_DISPATCH env-Flag, Take 4 Feature-Set Final, Sidebar-Profile-Overlay + Phone-Platter-Backstop, Quality-Gates-Framework, 3-Betrieb-Dry-Run Plan (Lens + Wälti + Stark).

---

## 1. Idee & Vision

### Was ist die Gold-Contact-Pipeline?

Eine vollautomatisierte, maximal persönliche Outreach-Maschine die Schweizer Handwerksbetriebe (Sanitär, Heizung, Haustechnik, Spenglerei) kontaktiert — mit einem Erlebnis das sich anfühlt als hätte jemand tagelang nur für DIESEN EINEN Betrieb gearbeitet. In Wahrheit dauert es pro Betrieb ~20 Minuten automatisiert + ~2 Minuten Founder-Review.

### Warum existiert diese Pipeline?

FlowSight ist ein Leitsystem für Handwerksbetriebe. Das Problem: Handwerker reagieren nicht auf generische SaaS-E-Mails. Sie reagieren auf PERSÖNLICHES. Die Pipeline löst das, indem sie jedem Betrieb ein massgeschneidertes Video-Paket schickt — mit seinem Firmennamen, seinem Google-Rating, seinen Leistungen, seiner Brand-Color, seiner eigenen digitalen Assistentin die SEINEN Betrieb kennt.

### Das Ziel

**10 Betriebe pro Tag kontaktieren.** Jeder bekommt eine persönliche E-Mail mit 4 Video-Takes die sein eigenes Leitsystem zeigen. Realistische Conversion: 20% antworten, 10% davon kaufen → ~1 Neukunde pro Tag.

### Der Markt

- **Kanton Zürich:** 585 aktive Betriebe (search.ch, verifiziert)
- **Deutschschweiz:** ~2'457 Betriebe (Hochrechnung)
- **Goldenes Segment:** ≥4.5★ Google Rating + wenige Reviews (278 Betriebe in ZH) = gute Arbeit, aber unsichtbar
- **Daten:** `docs/gtm/icp/market/marktanalyse.md` + 4 JSON-Rohdateien

---

## 2. Die 3 Phasen

```
PHASE 1: EXTRACT + DECIDE          PHASE 2: VIDEO                    PHASE 3: OUTREACH
━━━━━━━━━━━━━━━━━━━━━━━━           ━━━━━━━━━━━━━━━━━━━━━━━━          ━━━━━━━━━━━━━━━━━━━
Crawl Website (Playwright)          Samsung-Screens (HTML+PW)         E-Mail-Template
+ Zefix Handelsregister             Leitsystem-Recording (PW)         + Thumbnail (Screenshot)
+ Google Places API                 Wizard-Recording (PW)             + 4 Video-Links
→ crawl_extract.json                Review-Surface (PW)               + Betreff mit Firmenname
                                    STS Audio-Swap (11Labs)           → Versand Di/Mi 06:45
Derive Config (Entscheidungs-       Lisa Greeting (TTS)               → Resend Do 18:30
matrix, 23 Voice-Platzhalter)       Lisa Betriebsfrage (TTS)          → Follow-Up nä. Di 12:15
→ tenant_config.json                Founder-Audio (Rode/Audacity)
→ founder_review.md                 PiP-Video (Loom, einmalig)
                                    → 4 MP4s (Take 1-4)
── STOP: Founder Review ──
founder_review.md prüfen             ── STOP: Founder Freigabe ──     ── STOP: Founder Freigabe ──
Korrekturen eintragen                E-Mail-Preview prüfen             Versand bestätigen
CC übernimmt Änderungen
→ regenerate_review.mjs

Provision (Supabase)
→ Tenant + Voice Agent + Seed

✅ DONE                             🔨 IN ARBEIT                      📋 OFFEN
```

---

## 3. tenant_config.json — Das Herz der Pipeline

**Prinzip:** Ein einziges JSON pro Betrieb steuert ALLES downstream. Kein Script liest CLI-Argumente für Betriebsdaten. Kein Script hat hardcoded Firmennamen. Alles kommt aus `tenant_config.json`.

### Struktur (aktuell)

```json
{
  "_derived_from": "crawl_extract.json",
  "_derived_at": "2026-04-19T...",
  "_zefix": {
    "official_name": "Stark Haustechnik GmbH",
    "uid": "CHE-339.375.820",
    "legal_seat": "Adliswil",
    "status": "EXISTIEREND"
  },

  "tenant": {
    "slug": "stark-haustechnik",
    "name": "Stark Haustechnik GmbH",
    "case_id_prefix": "SH",
    "brand_color": "#003478",
    "sms_sender_name": "Stark GmbH"
  },

  "voice_agent": {
    "company_name": "Stark Haustechnik GmbH",
    "domain": "Sanitär und Heizung",
    "owner_names": "",
    "address": "Zürichstrasse 103, 8134 Adliswil",
    "phone": "+41 79 961 76 91",
    "email": "info@stark-haustechnik.ch",
    "website": "https://www.stark-haustechnik.ch",
    "founded": "",
    "team_section": "",
    "memberships": "",
    "google_rating": "4.8 Sterne bei 18 Bewertungen",
    "opening_hours": "",
    "opening_hours_spoken": "...",
    "emergency_policy": "...",
    "services_list": "...",
    "service_area": "...",
    "service_area_spoken": "...",
    "price_section": "",
    "price_deflect": "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an...",
    "jobs_section": "",
    "jobs_spoken": "...",
    "address_spoken": "...",
    "categories": "Heizung | Lüftung | Umbau/Sanierung | Allgemein | Angebot | Kontakt"
  },

  "wizard": {
    "categories": [
      {"value": "Heizung", "label": "Heizung", "hint": "...", "iconKey": "flame"},
      {"value": "Lüftung", "label": "Lüftung", "hint": "...", "iconKey": "wind"},
      ...
    ]
  },

  "seed": {
    "case_count": 50,
    "google_rating": 4.8,
    "google_review_count": 18,
    "staff_names": ["Max Mustermann", "Anna Beispiel", "Peter Muster"],
    "categories_weighted": {"Heizung": 28, "Lüftung": 28, ...},
    "service_area_plz": ["8001", "8002", ...],
    "featured_case": {"kategorie": "Heizung", "beschreibung": "...", "stadt": "Adliswil", "plz": "8134", "dringlichkeit": "Dringend"},
    "phone_demo_case": {"kategorie": "Rohrbruch", "beschreibung": "Der Anrufer steht im Keller knöcheltief im Wasser...", "dringlichkeit": "Dringend"},
    "wizard_demo_case": {"kategorie": "Leck", "beschreibung": "Dachrinne undicht, bei Regen tropft es...", "dringlichkeit": "Normal"},
    "include_2025_data": true
  },

  "video": {
    "firma_display": "Stark Haustechnik GmbH",
    "firma_silben": 4,
    "telefon_display": "+41 79 961 76 91",
    "prefix": "ST",
    "modus": 2,
    "google_stars": 4.8,
    "video_hook": "...",
    "call_proof_variante": "C"
  },

  "prospect": {
    "email": "info@stark-haustechnik.ch"
  }
}
```

### Woher die Daten kommen

| Feld | Quelle | Methode |
|------|--------|---------|
| Firmenname | Website `<title>` + Zefix | Automatisch, Zefix verifiziert |
| Adresse | Website Kontakt-Seite | Regex-Extraktion, Newline-bereinigt |
| Telefon | Website | Regex-Extraktion |
| E-Mail | Website | Regex, info@ bevorzugt |
| Google Rating | Google Places API | GOOGLE_SCOUT_KEY |
| Brand Color | Website CSS (Header/Hero) | Playwright getComputedStyle |
| Leistungen | Website Services-Seite | Keyword-Matching, dedupliziert |
| Zefix (Name, UID, Sitz) | Zefix REST API | POST firm/search.json |
| Kategorien | Aus Leistungen abgeleitet | Entscheidungsmatrix in derive_config |
| Staff-Namen | IMMER Dummy-Daten | "Max Mustermann", "Anna Beispiel", "Peter Muster" |

---

## 4. Founder Review — Der zentrale Prüfpunkt

### Was ist die founder_review.md?

Das EINZIGE Dokument das der Founder pro Betrieb prüft. Es zeigt ALLES was die Pipeline extrahiert und abgeleitet hat — auf einer Seite, in einem Dokument. 7 Abschnitte:

1. **Was die Pipeline gemacht hat** — Crawl, Zefix, Google, Voice Agent, Wizard, Seed
2. **Betriebsdaten** — Firma, Adresse, Telefon, Inhaber, Team, Mitgliedschaften
3. **Pipeline-Konfiguration** — Domain, Prefix, SMS-Sender, Wizard, Cases, Call-Proof
4. **Was Lisa am Telefon sagen wird** — JEDE einzelne Antwort (Öffnungszeiten, Einzugsgebiet, Preise, Notdienst, Leistungen...)
5. **SMS & Wizard Preview** — Wie SMS aussieht, wie Wizard aussieht, wie Review-Seite aussieht
6. **Video-Konfiguration** — Display-Name, Silben, Telefon, Proof-Variante
7. **Staff** — Dummy-Namen für Video-Dropdown

### Der Prüfprozess

```
Pipeline läuft → crawl_extract.json + tenant_config.json + founder_review.md
                                                                    │
                                                    Founder öffnet founder_review.md
                                                                    │
                                                    Prüft alle 7 Abschnitte
                                                                    │
                                          ┌─────────────────────────┼────────────────────────┐
                                          │                         │                        │
                                    Alles stimmt              Korrekturen nötig         Daten fehlen
                                          │                         │                        │
                                    "Go" an CC              Founder trägt Korrektur     Founder recherchiert
                                          │                 in Spalte "Korrektur         und trägt ein
                                          │                 Founder" ein                      │
                                          │                         │                        │
                                          │                    CC übernimmt              CC übernimmt
                                          │                    in tenant_config           in tenant_config
                                          │                         │                        │
                                          │                    regenerate_review.mjs          │
                                          │                         │                        │
                                          └─────────────────────────┼────────────────────────┘
                                                                    │
                                                              Provision starten
```

### Regeln

- **Founder ändert NUR die founder_review.md** (Spalte "Korrektur Founder"). Nie die tenant_config.json direkt.
- **CC übernimmt die Korrekturen** in tenant_config.json und regeneriert die Review.
- **Lieber keine Information als falsche Information.** Leere Felder sind okay. Falsche Felder sind fatal.
- **Wenn Founder nichts einträgt → Wert stimmt.** Nur Abweichungen werden dokumentiert.
- **Nach Onboarding:** Wenn Voice Agent falsch antwortet → Founder korrigiert in founder_review.md, CC passt an.

### Scripts

| Script | Zweck |
|--------|-------|
| `derive_config.mjs` | Erstellt tenant_config.json + founder_review.md aus Crawl-Daten |
| `regenerate_review.mjs` | Regeneriert NUR die founder_review.md aus bestehender Config (überschreibt Config NICHT) |
| `regenerate_review.mjs --slug all` | Regeneriert Reviews für ALLE Betriebe |

### Ableitungsregeln (was die Pipeline automatisch entscheidet)

| Entscheidung | Logik |
|-------------|-------|
| **Domain** | Alle Leistungsbereiche mit ≥2 Treffern. "Sanitär, Heizung und Lüftung" |
| **SMS Sender** | "Firma Rechtsform" wenn ≤11 Zeichen (z.B. "Stark GmbH"). Fallback: Kurzname. |
| **Case-ID Prefix** | Initialen der ersten 2 Wörter. KEINE Umlaute, KEINE Zahlen. "WS" für Wälti & Sohn. |
| **Wizard Top 3** | Typische KUNDENPROBLEME (nicht Leistungen!). Sanitär → Verstopfung, Leck, Heizung. Ein Wort, simpel. |
| **Phone-Fall** | IMMER Rohrbruch (Dringend) — aus dem Call-Script. Stadt/PLZ variabel. |
| **Wizard-Fall** | Zweitkategorie, Normal. ANDERE Kategorie als Phone-Fall. |
| **Call-Proof** | Notdienst (C) NUR bei starkem Beweis (24h/Pikett/7 Tage). Sonst Preis (B). |
| **Staff** | IMMER Dummy-Namen (Max Mustermann, Anna Beispiel, Peter Muster). Nie echte Namen. |
| **Öffnungszeiten spoken** | Natürliches Deutsch: "Montag bis Freitag von acht bis siebzehn Uhr" (nicht "Mo-Fr: 08:00-17:00"). |
| **Adresse spoken** | Ohne PLZ, ausgeschrieben: "Zürichstrasse hundertdrei in Adliswil" (nicht "8134 Adliswil"). |

---

## 5. Die Scripts — Was existiert, was fehlt

### Phase 1 Scripts (✅ DONE)

| Script | Input | Output | Status |
|--------|-------|--------|--------|
| `pipeline_run.mjs` | --url + --slug | Orchestriert alles | ✅ |
| `crawl_extract.mjs` | URL | `crawl_extract.json` | ✅ (Playwright + Zefix + Google) |
| `derive_config.mjs` | crawl_extract.json | `tenant_config.json` + `founder_review.md` | ✅ |
| `regenerate_review.mjs` | tenant_config.json | `founder_review.md` (ohne Config zu überschreiben) | ✅ NEU |
| `generate_voice_agent.mjs` | tenant_config.json | `voice_agent_de.json` | ✅ (23 Platzhalter aus Template) |
| `provision_from_config.mjs` | tenant_config.json | Supabase Tenant + Seed + Auth | ✅ |

### Phase 2 Scripts (🔨 IN ARBEIT / 📋 OFFEN)

| Script | Input | Output | Status |
|--------|-------|--------|--------|
| `render_samsung_screens.mjs` | tenant_config.json | Samsung PNGs (Kontakt, Anruf, SMS, Reminder) | ✅ Ersetzt durch take2_samsung.html (animiert) |
| `build_take2_screens.mjs` | tenant_config.json + Supabase | Leitsystem PNGs (Übersicht, Detail, FlowBar) | ✅ Ersetzt durch produce_screenflow.mjs (Video-Recording) |
| `produce_videos.mjs` | tenant_config.json + Master-Audio | 4 MP4s | 📋 OFFEN |
| STS Audio-Pipeline | tenant_config.json + Master-Audio | Firmenname-Swap pro Betrieb | 📋 OFFEN |
| Lisa Greeting TTS | tenant_config.json | "Hallo, hier ist Lisa von [FIRMA]..." (fixe Länge) | 📋 OFFEN |
| Lisa Proof-Antwort TTS | tenant_config.json (call_proof_variante C oder B) | Notdienst- oder Preis-Antwort (fixe Länge) | 📋 OFFEN |
| Wizard-Recording | tenant_config.json | Playwright-Video des Wizards mit Tippen-Simulation | ✅ take3_wizard.html + Playwright Video |
| Review-Surface Screenshot | tenant_config.json | Review-Seite in Brand-Color | ✅ take4_review HTML + Playwright Video |
| FAKE-ENDSCREEN | tenant_config.json | Abschluss-Screen (Kreis schliesst sich) | ✅ Integriert in take4_review |

### Phase 3 Scripts (📋 OFFEN)

| Script | Input | Output | Status |
|--------|-------|--------|--------|
| `send_outreach.mjs` | tenant_config.json + Video-URLs | E-Mail mit Thumbnail + Videos | 📋 OFFEN |
| E-Mail Template | tenant_config.json | HTML mit Firmennamen + Leitsystem-Screenshot | 📋 OFFEN |

---

## 5. Die 4 Video-Takes — Aufbau und Personalisierung

### Überblick

| Take | Titel | Dauer | Kamera | Was gezeigt wird |
|------|-------|-------|--------|-----------------|
| 1 | Ihr Alltag | ~80s | Gross (Founder) | Kein Screen. Founder spricht persönlich über den Alltag-Pain. |
| 2 | Telefon + Leitsystem | ~338s | Klein (PiP) | Samsung-Screens + Leitsystem-App + Lisa-Anruf — 2 Videos (Notruf + Preis) |
| 3 | Online/Wizard | ~90s | Klein (PiP) | Wizard mit Betrieb-Kategorien + Brand-Color + Tippen |
| 4 | Bewertung + Abschluss | ~90-100s | Klein→Gross | Review-Workflow + SMS-Reminder + Abschluss |

### Was pro Betrieb AUTOMATISCH personalisiert wird

| Element | Wo | Wie | Quelle |
|---------|-----|-----|--------|
| Firmenname im Audio | Take 1-4 | STS-Swap (ElevenLabs) | `video.firma_display` |
| Lisa Greeting | Take 2 | TTS (Ela-Stimme) | `voice_agent.company_name` |
| Lisa Proof-Antwort (C oder B) | Take 2 | TTS, Variante aus `video.call_proof_variante` | `crawl_extract.notdienst` |
| Samsung Kontakt-Screen | Take 2 | HTML Template | `tenant.name`, `voice_agent.phone` |
| Samsung Anruf-Screen | Take 2 | HTML Template | `tenant.name`, Anrufdauer |
| Samsung SMS-Screen | Take 2 | HTML Template | `tenant.sms_sender_name`, `case_id_prefix` |
| Samsung SMS-Reminder | Take 4 | HTML Template | `tenant.name`, Termin-Zeit |
| Leitsystem Übersicht | Take 2+3+4 | Playwright Screenshot | Seed-Daten (50 Cases, Brand-Color) |
| Leitsystem FlowBar | Take 2 | Playwright Screenshot | `seed.google_rating`, `seed.google_review_count` |
| Leitsystem Falldetail | Take 2 | Playwright Screenshot | `seed.phone_demo_case` |
| Staff-Dropdown | Take 2 | Playwright Screenshot | `seed.staff_names` (Dummy) |
| Wizard Kategorien | Take 3 | Playwright Video | `wizard.categories`, `tenant.brand_color` |
| Wizard Fall | Take 3 | Playwright Video | `seed.wizard_demo_case` |
| Review-Seite | Take 4 | Playwright Screenshot | `tenant.name`, `tenant.brand_color` |
| FAKE-ENDSCREEN | Take 4 | Generiert | `tenant.name`, `tenant.brand_color` |
| Datum/Uhrzeit | ALLE Screens | Tagesfrisch | Pipeline-Laufzeit |

### Was der Founder EINMAL aufnimmt (Master-Assets)

| Asset | Format | Wo abgelegt | Wiederverwendung |
|-------|--------|------------|-----------------|
| Take 1 komplett | WAV | `pipeline/06_video_production/master_takes/take1/` | Für ALLE Betriebe (STS-Swap Firmenname) |
| Take 2 Segmente | WAV (je Segment) | `pipeline/06_video_production/master_takes/take2/segments/` | Für ALLE Betriebe |
| Take 3 Segmente | WAV | `pipeline/06_video_production/master_takes/take3/segments/` | Für ALLE Betriebe |
| Take 4 Segmente | WAV | `pipeline/06_video_production/master_takes/take4/segments/` | Für ALLE Betriebe |
| PiP-Video (Loom) | MP4 | `pipeline/06_video_production/master_takes/pip/` | Für ALLE Betriebe (EINMAL aufgenommen) |
| Proof-Frage Variante C (Notdienst) | WAV (1 Stück) | `pipeline/06_video_production/master_takes/minitakes/variante_c_frage.wav` | Für Betriebe MIT Notdienst (60%) |
| Proof-Frage Variante B (Preis) | WAV (1 Stück) | `pipeline/06_video_production/master_takes/minitakes/variante_b_frage.wav` | Für Betriebe OHNE Notdienst (40%) |

### Was NICHT vom Founder kommt

- Firmenname im Audio → STS-Swap (automatisch)
- Lisa Greeting → TTS (automatisch)
- Lisa Proof-Antwort (C: Notdienst / B: Preis) → TTS (automatisch)
- Alle Screens → Playwright (automatisch)
- Alle Samsung-Screens → HTML Templates (automatisch)

---

## 6. Video-Architektur — 3 Schichten, millisekundengenau

### Die 3 Schichten

```
Schicht 3: PiP (Loom)    ─── EINMAL aufgenommen, für ALLE Betriebe wiederverwendet
Schicht 2: Screen         ─── PRO BETRIEB dynamisch (Playwright + Samsung HTML)
Schicht 1: Audio (WAV)    ─── PRO BETRIEB zusammengesetzt (Founder + Lisa + STS)
```

### Take 2 = ZWEI separate Videos (Founder Decision 19.04.)

Take 2 wird in ZWEI komplette Videos produziert:
- **take2_notruf.mp4** — Für Betriebe MIT Notdienst (60%)
- **take2_preis.mp4** — Für Betriebe OHNE Notdienst (40%)

Beide sind identisch AUSSER dem Call-Kern (Zeile 16-17 im Script). Produktions-Flow pro Video:
1. Audio zusammenbauen (Founder-Segmente + Lisa TTS)
2. Screenflow exakt passend zum Audio erstellen
3. Founder nimmt sich via Loom auf WÄHREND Audio+Screen laufen → perfekte Sync
4. Assembly: Audio + Screen + Loom = fertiges MP4

**Vorteil:** Null Timing-Risiko. Keine fixe Zeitfenster nötig für den Call-Kern. Founder reagiert auf das was er HÖRT und SIEHT. Lippen, Gestik, Blick = 100% synchron.

**Pipeline-Logik:** `derive_config.mjs → video.call_proof_variante` = "C" (Notdienst) oder "B" (Preis) → Pipeline wählt das richtige Video.

**Call-Scripts FINAL:** `pipeline/06_video_production/master_takes/minitakes/Take2/final/notruf.txt` + `preis.txt`

### KRITISCH: Timing-Constraints

Weil Schicht 3 (PiP) für ALLE Betriebe identisch ist, MÜSSEN alle variablen Elemente in Schicht 1 und 2 EXAKT gleich lang sein.

| Variables Element | Wo | Constraint |
|------------------|-----|-----------|
| Lisa Greeting | Take 2, Anruf-Beginn | Fixe Sekunden (egal Firmenname-Länge) |
| Betriebsspezifische Frage (Founder) | Take 2, im Anruf | Fixe Silbenzahl pro Frage |
| Betriebsspezifische Antwort (Lisa) | Take 2, im Anruf | Fixe Sekunden (ElevenLabs Pacing) |
| Firmenname STS-Swap | Take 1-4, diverse Stellen | Silbenzahl beachten, Pacing anpassen |

**Warum:** Wenn Lisas Antwort für Betrieb A 4 Sekunden dauert und für Betrieb B 6 Sekunden, verschiebt sich Schicht 2 (Screen) und Schicht 3 (PiP). Gunnars Nicken passt nicht mehr, der Screen-Wechsel kommt zu früh. → Video kaputt, Vertrauensverlust.

**ENTSCHÄRFT durch 2-Video-Ansatz:** Weil jede Variante ihr eigenes Loom hat, müssen Notruf-Antwort und Preis-Antwort NICHT mehr exakt gleich lang sein. Jedes Video hat seine eigene Timeline.

### Betriebsspezifische Frage — 2 Varianten (Founder Decision 19.04.)

Statt 10 Pool-Fragen: **2 strategisch clevere Varianten**, automatisch pro Betrieb gewählt.

| Variante | Bedingung | Founder-Frage | Lisa-Antwort | Strategie |
|----------|-----------|--------------|-------------|-----------|
| **C (Notdienst)** | Betrieb bietet Notdienst an (60%) | "Stellen Sie sich mal vor, es wäre jetzt Feiertag oder Wochenende gewesen — was wenn das dann passiert wäre?" | "Ja, dann hätte ich den Fall genauso aufgenommen und sofort den zuständigen Techniker kontaktiert. Wir bieten Notdienst rund um die Uhr an — auch an Sonn- und Feiertagen." | Notfall = Umsatz. Lisa fängt das auf. |
| **B (Preis)** | Kein Notdienst erkennbar (40%) | "Oh, okay, das könnte ja ziemlich teuer werden. Was kostet denn sowas ungefähr?" | "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an — je nach Situation kann das sehr unterschiedlich sein. Soll ich das als Anfrage aufnehmen?" | Professioneller Preis-Deflekt. |

**Regel:** Beide Fragen EXAKT gleich lang. Beide Antworten EXAKT gleich lang. PiP-Reaktion identisch.
**Regel:** Founder sagt NIE den Firmennamen. Lisa auch NICHT in dieser Antwort — Personalisierung liegt im Inhalt.
**DEFAULT = Variante B (Preis).** Immer korrekt, kein Risiko.
**Variante C NUR bei STARKEM Beweis:** notdienst.value vorhanden UND enthält "24" / "rund um die Uhr" / "Pikett" / "7 Tage". Nicht nur das Wort "Notfall" (könnte Fehlinterpretation sein).
**Worst Case vermeiden:** Betrieb OHNE Notdienst bekommt Video in dem Lisa "Notdienst rund um die Uhr" sagt → Lüge → Vertrauensbruch → Game Over.

---

## 7. Seed-Daten — Der realistische Alltag

### Seite-1-Komposition (was der Betrieb im Video SIEHT)

**Handy (8 Fälle sichtbar):**

| Position | Fall | Status | Prio | Quelle | Besonderheit |
|----------|------|--------|------|--------|-------------|
| 1 | Notfall (z.B. Rohrbruch) | In Arbeit | Notfall | Seed | Immer an Pos. 1 |
| 2 | **Telefon-Fall (NEU)** | **Neu** | **Dringend** | **phone_demo_case** | **Erscheint LIVE in Take 2** |
| 3 | Grossprojekt (Badsanierung) | Geplant | Normal | Seed | Zeigt: auch Projekte, nicht nur Notfälle |
| 4 | Anfrage/Offerte | Neu | Normal | Seed | Zeigt: auch Anfragen |
| 5 | Regulärer Fall | In Arbeit | Normal | Seed | Alltag |
| 6 | Erledigter Fall (mit Bewertung) | Erledigt | - | Seed | Zeigt Review-Flow |
| 7 | **Wizard-Fall (NEU)** | **Neu** | **Normal** | **wizard_demo_case** | **Erscheint LIVE in Take 3** |
| 8 | Regulärer Fall | Geplant | Normal | Seed | Alltag |

**Laptop (15 Fälle):** Wie Handy + 7 weitere erledigte/geplante Fälle.

### Daten-Zeitraum

- **2025:** ~20% der Fälle (zeigt: System läuft schon)
- **2026 (aktuell):** ~80% der Fälle
- **Datum auf Screens:** TAGESAKTUELL (Versandtag)

### Staff

- **Immer Dummy-Namen:** Max Mustermann, Anna Beispiel, Peter Muster
- **Keine echten Namen** (Datenschutz + Vermeidung von Verwechslung)
- **3-4 Namen** als goldene Mitte (Solo bis Gross passend)

---

## 8. Outreach — Die E-Mail

### Betreffzeile

`[Firmenname] — etwas Persönliches für Ihren Betrieb`

Kein Marketing-Sprech. Kein "FlowSight". Kein "Digitale Assistentin". Nur der Firmenname + persönlicher Bezug.

### Body

- **Thumbnail:** Screenshot des Leitsystems mit IHREM Firmennamen + Brand-Color
- **Play-Button:** → Link zu den 4 Videos
- **Text:** Kurz, persönlich, nicht-salesig (Schweizer Kultur)
- **Absender:** Gunnar Wende (persönlich, nicht "FlowSight GmbH")

### Versand-Timing

| Schritt | Wann | Was |
|---------|------|-----|
| Erstversand | Di oder Mi, 06:45 | Personalisierte E-Mail |
| Resend (wenn nicht geöffnet) | Do 18:30 | Gleiche E-Mail, neue Betreffzeile |
| Follow-Up | Nächster Di, 12:15 | Kürzere Nachfass-E-Mail |
| Saisonaler Push | Sept–Nov | Volumen hochfahren (Heizungssaison) |

### Twilio-Nummern

- Werden NICHT vorab gekauft
- Erst nach positiver Rückmeldung des Betriebs
- Für das Video wird der Anruf SIMULIERT (Screen-Recording)
- Kosten-Optimierung: Keine ungenutzten Nummern

---

## 9. Entscheidungen (Founder-bestätigt)

### Grundsätzlich

- **Modul 2 = Standard.** Keine Website bauen. Betrieb hat eigene Website.
- **Script ist FROZEN.** `Final_generic_scripting.txt` wird NIE von CC geändert.
- **tenant_config.json = EINZIGER Input.** Kein Script hat hardcoded Betriebsdaten.
- **Kein per-Business Text.** Founder schreibt KEINEN individuellen Text. Alles aus Daten.
- **Founder-Aufwand pro Betrieb: ~2 Min.** Video-Hook + Betriebsfrage bestätigen.

### 20 Video-Verbesserungen (19.04.2026)

Vollständige Dokumentation: `docs/gtm/pipeline/feedback/verbesserungsvorschlaege_video_pipeline.md`

**16× ✅ Einbau | 3× ❌ Kein Einbau | 1× DONE**

Highlights:
- #1 Pain-Broadening ✅ DONE (im Script)
- #2 Staff-Dropdown mit Dummy-Namen ✅
- #3 50 Cases + realistische Komposition ✅
- #4 Echtes Google-Rating (100% Übereinstimmung) ✅
- #12 Lisa nennt Firmennamen = stärkster Proof-Moment ✅
- #13 Proof-Frage (2 Varianten: C/B) = höchster Wow-Moment ✅
- #15 Review-Seite + FAKE-ENDSCREEN = Kreis muss sich schliessen ✅
- #18 Tagesfrisches Datum auf ALLEN Screens ✅
- #10 Emotionaler Closer ❌ (Schweiz: passiv, nicht salesig)
- #11 Verpasster-Anruf-Kontrast ❌
- #19 Einstieg sofort fesseln ❌

---

## 10. Ordnerstruktur

### Pipeline (generisch — `docs/gtm/pipeline/`)

```
docs/gtm/pipeline/
├── PIPELINE_BIBLE.md                       ← DIESES DOKUMENT
├── README.md                               ← Kurzübersicht
├── 02_crawl_extract/spec.md                ← Crawl-Spezifikation
├── 03_derive_config/spec.md                ← Entscheidungsmatrix
├── 05_provision/
│   └── voice_agent_template_de.json        ← Retell Template (23 Platzhalter)
├── 06_video_production/
│   └── master_takes/                       ← Founder Audio + PiP
│       ├── take1/
│       ├── take2/segments/
│       ├── take3/segments/
│       ├── take4/segments/
│       ├── minitakes/                      ← 2 Proof-Fragen (C: Notdienst, B: Preis)
│       └── pip/
├── feedback/
│   ├── verbesserungsvorschlaege_video_pipeline.md
│   └── versand_timing_analyse.md
└── _templates/
    ├── crawl_extract_template.json
    └── tenant_config_template.json
```

### Pro Betrieb — Customer-Docs (generiert — `docs/customers/{slug}/`)

**Nur Customer-spezifische Konfiguration + Status.** Videos & Pipeline-Outputs gehen in die Pipeline-Struktur (siehe unten).

```
docs/customers/{slug}/
├── crawl_extract.json                      ← Gecrawlte Website-Daten + Zefix + Google
├── tenant_config.json                      ← SSOT für ALLES downstream (inkl. _seed_time für Video-Sync)
├── founder_review.md                       ← Zentrales Prüfdokument (7 Abschnitte, ~160 Zeilen)
├── voice_agent_de.json                     ← Generierter Voice Agent (DE)
├── status.md                               ← Milestone-Tracker
└── links.md                                ← URLs
```

### Pro Betrieb — Pipeline-Assets (Video-Outputs — `docs/gtm/pipeline/06_video_production/screenflows/{slug}/`)

**Alle Video-Outputs der Pipeline.** Dörfler = Master-Blueprint für alle Sanitärbetriebe. Bei neuem Betrieb durch die Pipeline entsteht automatisch ein neuer Unterordner.

```
docs/gtm/pipeline/06_video_production/screenflows/
├── doerfler-ag/                            ← Master-Betrieb (Blueprint)
│   ├── take2_samsung.webm                  ← Samsung-HTML rendered via Playwright
│   ├── take2_leitsystem.webm               ← Leitsystem rendered via Playwright
│   ├── take2_complete.mp4                  ← Assembly: samsung + scrcpy_app_open + leitsystem
│   ├── _app_open_clip.mp4                  ← Cropped scrcpy App-Open (Zwischenlösung bis Remotion)
│   └── _archive/                           ← Alte Versionen (v2-v4)
├── stark-haustechnik/                      ← (generiert wenn durch Pipeline)
├── waelti-sohn-ag/
└── leins-ag/
```

**Warum getrennt von customers/:** Die Videos sind **Pipeline-Outputs**, keine Customer-Dokumente. Bei Take 3/4 kommen weitere Outputs dazu (Wizard-Recording, Review-Screens). Alle in derselben screenflows/{slug}/-Struktur.

---

## 11. Offene Punkte — Was noch gebaut werden muss

### Wartet auf Founder-Audio

| # | Was | Blockiert durch | Dann |
|---|-----|----------------|------|
| A1 | Lisa Greeting TTS | Call-ID vom Founder | Greeting pro Betrieb generieren (fixe Länge) |
| A2 | Proof-Frage (2 Varianten) | Founder nimmt 2 Fragen auf (C + B) | derive_config wählt automatisch, Lisa-Antwort TTS |
| A3 | Review + FAKE-ENDSCREEN | Provision + Seed im System | Playwright-Screenshots |
| A8 | Live-Moment (Fall erscheint) | Provision + Seed | Vorher/Nachher Screenshots |
| A9 | Wizard-Fall erscheint | Provision + Seed | Screenshot mit 2 neuen Fällen |

### Kann parallel gebaut werden

| # | Was | Status |
|---|-----|--------|
| Samsung-Screens auf Config umstellen | render_samsung_screens → tenant_config.json lesen | 📋 OFFEN |
| Leitsystem-Screens auf Config umstellen | build_take2_screens → tenant_config.json lesen | 📋 OFFEN |
| Wizard-Recording Automation | Playwright simuliert Tippen + Scrollen im Wizard | 📋 OFFEN |
| Video Assembly (4 Takes) | produce_videos.mjs Orchestrator | 📋 OFFEN |
| E-Mail Template | HTML mit Firmennamen + Thumbnail | 📋 OFFEN |
| Outreach Script | send_outreach.mjs → tenant_config + Videos | 📋 OFFEN |

### Erledigt

| # | Was | Datum |
|---|-----|-------|
| Phase 1 Pipeline (Crawl→Derive→Provision) | ✅ | 18.04. |
| 5 Crawler-Fixes (Title, Adresse, Zefix, Dedup, ALLCAPS) | ✅ | 18.04. |
| Voice Agent Template (23 Platzhalter) | ✅ | 18.04. |
| Google Places API Integration | ✅ | 18.04. |
| Marktanalyse (585 Betriebe) | ✅ | 19.04. |
| 20 Verbesserungsvorschläge + Founder-Feedback | ✅ | 19.04. |
| Seed: 50 Cases, phone_demo_case, wizard_demo_case, Dummy-Staff | ✅ | 19.04. |
| 24h SMS Reminder Bug Fix | ✅ | 19.04. |
| Versand-Timing Analyse | ✅ | 19.04. |
| Call-Scripts FINAL (Notruf + Preis) | ✅ | 19.04. |
| Take 2 = 2 Videos (D93) | ✅ | 19.04. |
| Founder Review Prozess (7 Abschnitte, regenerate_review.mjs) | ✅ | 20.04. |
| Crawler-Fix Öffnungszeiten (Time-first Pattern) | ✅ | 20.04. |
| Wizard-Kategorien = Kundenprobleme (Sanitär → Verstopfung, Leck, Heizung) | ✅ | 20.04. |
| Case-ID Prefix ohne Umlaute (WS statt WÄ) | ✅ | 20.04. |
| SMS Sender "Firma Rechtsform" (Stark GmbH, Leins AG) | ✅ | 20.04. |
| Phone-Fall IMMER Rohrbruch/Wasserschaden | ✅ | 20.04. |
| Notdienst-Feld gesäubert (kein Navigation-Müll) | ✅ | 20.04. |
| Spoken-Felder natürliches Deutsch (keine Rohdaten) | ✅ | 20.04. |
| Screenflow Phase A+B: Samsung + Leitsystem + Wizard + Review (12 Videos) | ✅ | 20.04. |
| produce_screenflow.mjs — Orchestrator für alle Screenflow-Videos | ✅ | 20.04. |
| take2_samsung.html — Animierte Samsung-Sequenz (Gradient, Timer, SMS) | ✅ | 20.04. |
| take3_wizard.html — Wizard mit realistischem Tippen + Brand-Color | ✅ | 20.04. |
| Take 4 Review + FAKE-ENDSCREEN (5-Sterne-Animation, Brand-Color) | ✅ | 20.04. |
| Take 2 Screenflow v4: 27 Feedback-Punkte (FB2-FB27), 22 gefixt | ✅ | 20.04. |
| Samsung Screens: Echtes Homescreen + SVG-Icons + Anrufliste + Anruf-beendet neu | ✅ | 20.04. |
| Leitsystem Recording: OTP-Auth + KPI-Klicks (alle 4) + Falldetail komplett | ✅ | 20.04. |
| record_leitsystem_take2.mjs — Dediziertes Leitsystem-Recording Script | ✅ | 20.04. |
| Seed-Fix: is_demo=false (RLS), Notfall-Case, Zeitstempel konsistent | ✅ | 20.04. |
| **Take 2 Pipeline FINAL: 4 Betriebe (Dörfler, Leins, Wälti, Stark) end-to-end** | ✅ | **21.04.** |
| `pipeline_screenflow.mjs` — One-Command-Runner (seed + status-bar + produce + splice) | ✅ | 21.04. |
| Scrcpy-App-Open-Clip als authentische Samsung→Leitsystem Transition | ✅ | 21.04. |
| Status-Bar persistent via PNG-Overlay + FFmpeg vstack (zuverlässiger als JS-Injection) | ✅ | 21.04. |
| `render_status_bar.mjs` — Playwright rendert 412×36 status_bar.html | ✅ | 21.04. |
| Branchen-agnostischer Seed (`seed_screenflow_from_config.mjs`) — liest NUR tenant_config | ✅ | 21.04. |
| Admin Auto-Scoping: Seed setzt admin@flowsight.ch app_metadata (role + tenant_id) | ✅ | 21.04. |
| Zeit-Sync Seed↔Produce via `_seed_time` ISO in tenant_config.json | ✅ | 21.04. |
| `display_phone` Konstante `+41 44 505 74 21` für alle Betriebe (Samsung Contact/Call/Ended) | ✅ | 21.04. |
| `reporter_phone` `076 489 89 80` separat für Case-Detail contact_phone | ✅ | 21.04. |
| Phone-Case aus Notruf-Call-Script (Wende, Seestrasse 14, Oberrieden) universell | ✅ | 21.04. |
| Notfall-Case Branchen-Map (Sanitär→Boiler, Elektrik→Stromausfall) in derive_config | ✅ | 21.04. |
| Reveal-Overlay: Brand-Color Fade-Out (800ms hold + 400ms transition) statt harter Splice | ✅ | 21.04. |
| Word-Wrap CSS für lange Firmennamen (2-zeilig, zentriert, keine Bindestriche) | ✅ | 21.04. |
| `shortenDisplayName.ts` — strippt GmbH/AG/Sohn AG Suffixe bei Overflow im Header | ✅ | 21.04. |
| Case-ID Prefix Fix (DB-Column = config) + Name-Sync in tenants UPDATE | ✅ | 21.04. |
| Uhrzeit-Flash Fix: Initial clock-display empty + applyConfig() immediately | ✅ | 21.04. |
| Review-Status-Verteilung (7 amber-ring + 10 gold + 4 plain) auf Seite 1 Mix sichtbar | ✅ | 21.04. |
| Audio Master Take 1 + Take 2 Founder-seitig hochgeladen | ✅ | 21.04. |
| 61+ Feedback-Punkte Runde 1-7 systematisch abgearbeitet (FB28-FB61) | ✅ | 21.04. |

---

## 12. Qualitätsprinzipien

1. **Niemals herleiten.** Nur verwenden was schwarz auf weiss auf der Website steht.
2. **Niemals echte Mitarbeiternamen.** Immer Dummy-Daten (Max Mustermann etc.).
3. **Google-Rating muss zu 100% stimmen.** Jede Abweichung = Vertrauensverlust.
4. **Datum muss tagesaktuell sein.** Altes Datum = "Massenproduktion" statt "für mich gemacht".
5. **SMS-Sender = Firmenname.** Kein generischer Absender.
6. **Alle Screens in Brand-Color.** Leitsystem, Wizard, Review, FAKE-ENDSCREEN.
7. **Lisa nennt den Firmennamen.** Stärkster Proof-Moment — muss natürlich klingen.
8. **Schweizer Kultur: nicht salesig.** Passiv, ehrlich, zielstrebig. Kein Druck.
9. **Final_generic_scripting.txt ist FROZEN.** CC ändert das Script NIEMALS.
10. **Take 2 = 2 Videos (Notruf + Preis).** Jedes mit eigenem Audio→Screenflow→Loom. Timing-Constraint entschärft.
11. **Founder prüft NUR founder_review.md.** Nie tenant_config.json direkt. CC übernimmt Korrekturen.
12. **Case-ID Prefix: KEINE Umlaute, KEINE Zahlen.** Immer 2 Buchstaben ASCII (WS, SH, LN).
13. **Öffnungszeiten gesprochen = natürliches Deutsch.** "Montag bis Freitag von acht bis siebzehn Uhr" — nicht "Mo-Fr: 08:00-17:00".
14. **Adresse gesprochen = ohne PLZ.** "Zürichstrasse hundertdrei in Adliswil" — nicht "8134 Adliswil".
15. **Crawler-Müll bereinigen.** Navigation-Text, ALLCAPS-Boilerplate aus Notdienst/Leistungen entfernen.

---

## 13. Test-Telefonnummer (pipeline-weit)

**`+41 44 505 74 21`** = EINE globale fiktive Zürcher Nummer für ALLE Betriebe visuell.

Diese Nummer ist nirgends vergeben/scharf (Founder-verifiziert). Sie zieht durch ALLE Videos und Case-Details:
- Samsung Kontaktsuche + Call + Call-Ended → `video.display_phone`
- Leitsystem Case-Detail Kontakt → `cases.contact_phone` via `seed.phone_demo_case`
- Pro Betrieb nur der **Firmenname** variiert ("Dörfler AG Test", "Stark Haustechnik Test", "Gebrüder Au GmbH Test"), **die Nummer bleibt konstant**.

Source: `derive_config.mjs::deriveDisplayPhone()` → returnt immer die Konstante. Dadurch kein Risiko dass ein Testviewer beim echten Betrieb landet.

Die **echte Betriebsnummer** bleibt in `voice_agent.phone` für echte Anrufe (wird NIE im Video gezeigt).

---

## 14. Remotion Animation Pipeline (geplant für 22.04.2026)

### Zweck

Alle Klick-/Tap-/App-Open-/Button-/Transition-Animationen werden über eine zentrale **Remotion-basierte Animation-Pipeline** produziert. Remotion = React-basiertes Programmatic Video Rendering. Der Founder gibt einen Prompt → CC schreibt React-Component → Remotion rendert MP4 → ffmpeg-Splice in die Take-Videos.

### Langfristige Bedeutung

Die Pipeline liefert wiederverwendbare, skalierbare High-End-Animationen für:

| Use-Case | Wo verwendet |
|----------|-------------|
| **Take 2** | App-Open (Leitsystem-Icon → Fullscreen) |
| **Take 3** | Wizard-Submit-Button-Klick, Kategorie-Wahl, Typing-Cursor, Foto-Upload-Animation |
| **Take 4** | Review-Stars-Animation, Google-Bewertung-CTA, FAKE-ENDSCREEN Closing-Animation |
| **FlowSight Website** | Hero-Animationen, Feature-Demos, CTA-Button-Interaktionen |
| **Instagram** | Reels mit animierten Screen-Recordings, Story-Transitions |
| **LinkedIn** | Post-Carousels mit Motion-Graphics, Product-Demo-Videos |

**Ohne Pipeline:** Jede Animation = einmalige Designer-Arbeit (AE/Lottie) oder manuelles Recording — 2-4h pro Animation, nicht skalierbar.

**Mit Pipeline:** Founder-Prompt → 30-60min CC-Code → MP4 exportiert. Components wiederverwendbar.

### Initial Components (Setup Phase)

| Component | Zweck |
|-----------|-------|
| `<TapAnimation />` | Finger-Press + Ripple-Effect auf beliebiger Position (x, y, size) |
| `<AppOpenZoom />` | Icon expandiert zu Fullscreen-Container (Samsung-Style Material Container Transform). Props: iconSrc, iconPosition, targetContent, duration |
| `<ButtonPress />` | Button-Klick mit Material Design Ripple + Scale |
| `<NotificationFlyIn />` | SMS/Push-Notification Banner von oben (Bezier-Easing) |
| `<ScrollMomentum />` | Natürliches Scrollen mit Easing + Mikro-Pausen (eliminiert "zu mechanisch") |
| `<TypingCursor />` | Simuliertes Tippen mit realistischer Variation (nicht gleichmässig) |
| `<StarFill />` | Sterne-Animation für Bewertungs-Screen (sequential fill + scale pop) |
| `<FadeTransition />` | Cross-fade zwischen Video-Segmenten |

### Workflow (pro Animation)

```
1. Founder-Prompt: "App-Open Leitsystem-Icon, 800ms, Brand-Color Dörfler"
      ↓
2. CC: Component mit Props (icon, color, duration) + Composition-File
      ↓
3. npx remotion render src/App-Open.tsx AppOpen out.mp4 --props='{...}'
      ↓
4. ffmpeg splice: [samsung][app_open_out][leitsystem] concat
      ↓
5. Founder Review → Feedback oder GO
```

### Ordnerstruktur (geplant)

```
production/animations/
├── package.json (remotion + react + typescript)
├── remotion.config.ts
├── src/
│   ├── compositions/
│   │   ├── AppOpenZoom.tsx        # <AppOpenZoom />
│   │   ├── TapAnimation.tsx
│   │   ├── ButtonPress.tsx
│   │   ├── NotificationFlyIn.tsx
│   │   ├── ScrollMomentum.tsx
│   │   ├── TypingCursor.tsx
│   │   ├── StarFill.tsx
│   │   └── FadeTransition.tsx
│   ├── primitives/                # Shared utilities (easing, colors, timing)
│   └── Root.tsx                   # Composition registrations
├── out/                           # Rendered MP4s (gitignored)
└── docs/README.md                 # Wie benutzt man die Pipeline
```

### Setup-Plan (22.04.2026)

| Schritt | Dauer | Output |
|---------|-------|--------|
| 1. Remotion install + basic Composition | 1h | Hello-World-Composition rendert |
| 2. `<AppOpenZoom />` Component + Props-System | 2h | Samsung-Style App-Open MP4 für Take 2 |
| 3. `<TapAnimation />` + `<ButtonPress />` | 2h | Wiederverwendbare Click-Animations |
| 4. Pipeline-Integration (produce_screenflow.mjs) | 1h | App-Open wird automatisch aus Remotion gerendert |
| 5. Take 2 Re-Render mit Remotion-App-Open | 30min | 10/10 Version ersetzt scrcpy-Splice |
| 6. Dokumentation + Beispiel-Prompts | 1h | `docs/README.md` + 3 Beispiel-Rendering |

**Total: ~7-8h einmalig.** Danach: **30-60min pro neuer Animation.**

### Zwischenlösung (bis Remotion steht)

Für Take 2 v-heute: User hat manuell per **scrcpy-Recording** den echten Samsung App-Open aufgenommen. Wird in `pictureflow/feedback/open Leitsystem.mp4` gespeichert und per ffmpeg in Take 2 gespliced. Funktioniert für aktuellen Demo-Betrieb Dörfler AG (weil echte Daten im scrcpy-Recording). Wird durch Remotion-Component ersetzt sobald Pipeline steht.

### Qualitätsprinzipien für Animations

- **Brand-Color** kommt aus `tenant_config.tenant.brand_color` (durchzieht)
- **Timing** basiert auf Material Design / iOS Human Interface Guidelines (standard-Duration, Easing)
- **Mikro-Irregularität** bei Typing/Scrolling (nie gleichmässig → wirkt echt)
- **Icon-Masks** + Shadow-Spread für Container Transform (Samsung-authentisch)
- **Output**: MP4, 412×914 px (Samsung-viewport-match), 30fps, libx264

---

## 15. Take 2 Screenflow-Pipeline — Architektur-Referenz (21.04.2026)

**Status:** FINAL für 4 Betriebe (Dörfler, Leins, Wälti, Stark). Jeder künftige Betrieb läuft ein-Kommando-weise durch.

### 15.1 One-Command Runner

```bash
APP_URL=http://localhost:3000 node --env-file=src/web/.env.local \
  scripts/_ops/pipeline_screenflow.mjs --slug <slug> --take 2
```

**Was passiert:** (1) Seed → (2) Status-Bar render → (3) Produce (Samsung + Leitsystem) → (4) FFmpeg Splice.
**Dauer:** ~60-90s pro Tenant. **Output:** `docs/gtm/pipeline/06_video_production/screenflows/<slug>/take2_complete.mp4` (~1.9 MB, 30fps, 412×915).

### 15.2 Die 4 Schritte im Detail

| Schritt | Script | Output | Kern-Logik |
|---------|--------|--------|------------|
| **1. Seed** | `seed_screenflow_from_config.mjs` | Supabase DB-State (49 Cases) + `tenants.name/case_id_prefix/modules` + admin.app_metadata + `_seed_time` in config | Liest NUR `tenant_config.json`. Branchen-agnostisch. Notfall (Boiler, rot) + Phone-Case (seq=49 last, Wende, 076 489 89 80) + Wizard + 5 Bei-uns + 21 Done (7 plain + 12 gold + 2 amber-ring) + 20 alte 2025. |
| **2. Status-Bar** | `render_status_bar.mjs` | `status_bar.png` (412×36) | Playwright rendert `status_bar.html` mit Samsung-Icons (Volume-off, WiFi, 1× Signal, Battery-pill green) |
| **3. Produce** | `produce_screenflow.mjs --slug X --take 2` | `take2_samsung.webm` + `take2_leitsystem.webm` | Samsung HTML (Homescreen → Contact → Call → Ended → SMS-Notif) + Leitsystem via Playwright (Login OTP + KPI-Klicks + Phone-Case Scroll) |
| **4. Splice** | FFmpeg (inline in pipeline_screenflow) | `take2_complete.mp4` | vstack für Status-Bar über Leitsystem + concat: Samsung + scrcpy-App-Open + (Status-Bar + Leitsystem) |

### 15.3 FFmpeg Splice-Formel (verifiziert)

```
ffmpeg -y \
  -ss 0.3 -i take2_samsung.webm \
  -i _app_open_clip.mp4 \
  -ss 2.0 -i take2_leitsystem.webm \
  -loop 1 -t 60 -i status_bar.png \
  -filter_complex "[0:v]fps=30,scale=412:914,setsar=1,setpts=PTS-STARTPTS[s]; \
                   [1:v]fps=30,scale=412:914,setsar=1,setpts=PTS-STARTPTS[c]; \
                   [2:v]fps=30,scale=412:878,setsar=1,setpts=PTS-STARTPTS[lscaled]; \
                   [3:v]fps=30,scale=412:36,setsar=1[bar]; \
                   [bar][lscaled]vstack[l]; \
                   [s][c][l]concat=n=3:v=1[out]" \
  -map "[out]" -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p \
  take2_complete.mp4
```

**Kritische Parameter:**
- `-ss 0.3` auf Samsung → trimmt weissen Start-Frame (Context-Recording Latency)
- `-ss 2.0` auf Leitsystem → überspringt Layout-Shift-Phase bis App fertig geladen
- `-loop 1 -t 60` auf Status-Bar → verhindert infinite PNG stream
- vstack[bar,lscaled] → Status-Bar PERSISTENT über Leitsystem-Content (36px oben + 878px Leitsystem = 914px total)

### 15.4 Zentrale Invarianten

| Invariante | Quelle | Warum kritisch |
|------------|--------|----------------|
| `display_phone = +41 44 505 74 21` | `derive_config.mjs::deriveDisplayPhone()` (Konstante für alle) | Fiktive Zürcher Nummer, nicht vergeben. Testviewer darf nie beim echten Betrieb landen. |
| `reporter_phone = 076 489 89 80` | `derive_config.mjs::derivePhoneDemoCase()` | Case-Detail Kontakt ≠ Samsung-Display. Fiktive Kunden-Nummer. |
| `_seed_time` ISO in tenant_config | Seed-Step schreibt → Produce liest via `getVideoBaseTime()` | CONFIG.uhrzeit matcht `case.created_at` exakt. Kein Zeit-Desync mehr. |
| Phone-Case reporter_name = "Wende" | Call-Script `notruf.txt` — universell für Sanitär | Alle Sanitär-Betriebe nutzen gleiches Master-Audio → gleicher Reporter. |
| Notfall-Case Branchen-Map | `deriveNotfallCase(domain)` in derive_config | Sanitär=Boiler, Elektrik=Stromausfall. Sichtbar an Pos.1 rot/notfall. |
| Admin scope = active tenant | Seed setzt admin@flowsight.ch app_metadata `{role:"admin", tenant_id}` | Leitsystem-Recording zeigt den richtigen Tenant mit korrekter Begrüssung. |
| Samsung viewport 412×915 | Playwright launch config | Matched echte Samsung-Device-Proportionen. |

### 15.5 Word-Wrap für lange Firmennamen

**Problem:** "Stark Haustechnik GmbH Test" (27 Zeichen) passte nicht in Call-Screen.
**Lösung:** CSS `word-break: normal; overflow-wrap: break-word; hyphens: none` auf `.call-contact .name`, `.ended-contact .name`, `.result-card .details .name`. Padding 24px an Rändern. Font-size 36px (von 38px).
**Resultat:**
- Stark → "Stark Haustechnik" / "GmbH Test" (2 Zeilen, zentriert)
- Dörfler/Leins/Wälti → einzeilig (Namen unter der Grenze)
- **NIE** Bindestriche/Abkürzungen — ganzes Wort in nächste Zeile.

Zusätzlich: `src/web/src/lib/tenants/shortenDisplayName.ts` strippt Business-Suffixe (GmbH, AG, Sohn AG) wenn Name im OpsShell-Header > 19 Zeichen. Greift in Leitsystem-Navigation.

### 15.6 Lessons Learned (die heute gelernt wurden)

1. **JS-Injection ist unzuverlässig** für Context-Recordings — die DOM zeigt das Element, aber Playwright-Video capturt es nicht. Lösung: Als Overlay via FFmpeg nachträglich drauflegen.
2. **63 MB ffmpeg output = infinite PNG stream.** `-loop 1 -i status_bar.png` ohne `-t` läuft ewig. Fix: `-loop 1 -t 60`.
3. **Weisser Start-Frame in Video** — Context-Recording capturt vor HTML-Ready. Fix: `-ss 0.3` trim.
4. **Weisser Screen bei 0.5s Leitsystem** — App-Load-Gap. Fix: `-ss 2.0` trim.
5. **Truncation "Stark Haustechnik Gm..."** — `<=` vs `<` Grenze. Fix: maxLen=19 exakt.
6. **FS-0001 Prefix Bug** trotz "LN" in config — DB-Column war "FS", config wurde nie gesynced. Fix: seed UPDATE auch case_id_prefix + name in tenants.
7. **Admin sah alle Tenants** — admin@flowsight.ch hatte keine role/tenant_id in app_metadata. Fix: Seed setzt das jedes Mal.
8. **Uhrzeit-Flash bei t=0** — Initial HTML hardcoded "19:41" dann applyConfig überschreibt → sichtbarer Sprung. Fix: Initial empty strings + applyConfig sofort.
9. **Dual-Phone Mix-up** — display_phone ≠ reporter_phone. Samsung zeigt Fake-Nummer, Case-Detail zeigt Kunden-Nummer. Klar getrennt halten.
10. **Word-Wrap vs Hyphenation** — CSS `hyphens: auto` macht "Haus-technik". User wollte ganze Wörter umbrechen. Fix: `hyphens: none; overflow-wrap: break-word`.

---

## 16. Day-22 Plan (22.04.2026) — Take 3 + Take 4 Pipeline

**Ausgangslage (EOD 21.04.):** Take 2 komplett fertig für 4 Betriebe. Audio Master Take 1+2 hochgeladen. Audio Take 3+4 folgen morgen (Founder-seitig).

### 16.1 Der exakte Flow (analog zu Take 2)

**Phase A — Take 3 (Wizard) Pipeline bauen:**

| Schritt | Was | Wer |
|---------|-----|-----|
| A1 | **Dörfler AG Take 3 bauen** — Wizard-Recording (Category-Auswahl, Typing-Simulation, Kontaktdaten, Foto-Upload, Submit → Leitsystem-Fall erscheint live) | CC |
| A2 | **Founder Feedback-Loop** — gleiches Vorgehen wie Take 2: Founder sieht file:// Link, gibt FB-Punkte, CC arbeitet alle ab bis Dörfler 10/10 | Founder + CC |
| A3 | **Leins AG Take 3** durch Pipeline (Stress-Test 1) | CC |
| A4 | **Wälti + Stark Take 3 parallel** (Stress-Test 2) | CC |

**Phase B — Take 4 (Review + FAKE-ENDSCREEN) Pipeline bauen:** Exakt gleicher Flow wie Phase A, nur mit Review-Surface + Star-Animation + Closing-Kreis.

**Phase C — Audio-Merge:** Wenn Founder Audio Take 3+4 hochgeladen hat → Screenflows + Audio verknüpfen (alle 4 Takes, pro Betrieb).

### 16.2 Was schon steht (wiederverwendbar aus Take 2)

- `pipeline_screenflow.mjs` — Orchestrator-Pattern, nur `--take 3/4` hinzufügen
- `seed_screenflow_from_config.mjs` — DB-Seed komplett (inkl. Wizard-Demo-Case aus `seed.wizard_demo_case`)
- `render_status_bar.mjs` — Status-Bar bleibt identisch
- `_app_open_clip.mp4` — Master-Clip Dörfler, wird pro Tenant kopiert
- `tenant_config.json` Struktur — alle Wizard-Kategorien + Brand-Color bereits drin
- CSS Word-Wrap, shortenDisplayName, display_phone, Zeit-Sync — alles pipeline-weit bereits aktiv

### 16.3 Was NEU gebaut werden muss für Take 3

| Komponente | Analog zu | Neu-Anteil |
|------------|-----------|------------|
| `take3_wizard.html` | `take2_samsung.html` | Wizard-Formular statt Samsung-Phone. Brand-Color Background, 3-Schritt-UI, realistisches Tippen |
| `record_wizard_take3.mjs` | `record_leitsystem_take2.mjs` | Playwright navigiert /kunden/[slug]/meldung, wählt Kategorie, tippt Beschreibung, uploadet Foto, submittet |
| `produceTake3Wizard()` in produce_screenflow | `produceTake2Samsung/Leitsystem` | Orchestriert Wizard-HTML + Leitsystem-Re-Open (neuer Fall erscheint) |
| FFmpeg Splice für Take 3 | Samsung+Leitsystem Splice | Wizard → Transition → Leitsystem (Fall erscheint live) |

### 16.4 Was NEU gebaut werden muss für Take 4

| Komponente | Analog zu | Neu-Anteil |
|------------|-----------|------------|
| `take4_review.html` | `take3_wizard.html` | Review-Surface (5-Sterne-Animation, 4 Text-Chips, Textfeld) |
| `record_review_take4.mjs` | record_wizard | Playwright navigiert /review/[caseId], klickt Sterne, tippt Review-Text |
| FAKE-ENDSCREEN | — | Abschluss-Screen: Kreis schliesst sich, Brand-Color Closing, optional Logo |
| `produceTake4Review()` | produce_screenflow | Review + FAKE-ENDSCREEN concatenated |

### 16.5 Donnerstag (23.04.2026) — Final Assembly

- **Founder nimmt Loom-PiP-Video** auf (Founder-Face, einmalig für alle Betriebe)
- **Final Assembly Script** — 3-Schichten-Composite: Audio (pro Betrieb) + Screenflow (pro Betrieb) + Loom-PiP (universell)
- **Output:** `take1_complete.mp4` + `take2_complete.mp4` + `take3_complete.mp4` + `take4_complete.mp4` pro Betrieb
- **Meilenstein:** Komplette Pipeline End-to-End für beliebigen Sanitär-Betrieb in <5 Minuten produzierbar.

### 16.6 Prinzipien die sich bewährt haben (übernehmen für Take 3/4)

1. **One-Command pro Take** — kein manuelles Herumklicken.
2. **tenant_config.json = SSOT** — kein Hardcoding.
3. **Founder prüft file:// Links** — Markdown-Format, keine Uploads nötig.
4. **Feedback-Loop bis 10/10** — alle Punkte fixen bevor neue Version ausgeliefert wird.
5. **Branchen-agnostisch by design** — wenn's für 4 Betriebe geht, geht's für 400.
6. **Dörfler = Master/Basis** — dort erstmal perfekt. Andere folgen durch die Pipeline.
7. **Ask when uncertain** — nie random output erzeugen.

---

## 17. Take 3 Screenflow-Pipeline — Architektur-Plan (21.04.2026)

**Status:** GEPLANT, Umsetzung nach Take-4-Plan-Freigabe. Founder-bestätigte Entscheidungen aus Planungs-Session 21.04.

### 17.1 Storyline-Kontext

Take 3 ist die direkte Fortsetzung von Take 2:
- **Zeitpunkt:** Gleicher Tag, **+30 Minuten** nach Phone-Case aus Take 2.
- **Kunde:** Gunnar Wende (gleicher Name — wird bewusst als "Prüfkunde" gezeigt, authentische Founder-Identität).
- **Anderer Fall:** Leck (Normal) statt Rohrbruch (Dringend) — demonstriert zweiten Meldeweg.
- **Andere Adresse:** Bahnhofstrasse 15, 8942 Oberrieden (nicht Seestrasse 14 wie Take 2).

### 17.2 Founder-Entscheidungen (21.04.2026)

| Entscheidung | Wahl | Warum |
|-------------|------|-------|
| **Viewport** | Desktop/Laptop 1280×720 | "Handy haben wir mit Take 2 bewiesen, jetzt Monitor." Realistische Handwerker-Auflösung. |
| **Zeit-Offset** | +30 Minuten | Realistischer als +2 min. **Gilt universell für ALLE Follow-up-Zeiten** (auch Take 4 Termine). |
| **Live-Typing** | Ja, inkl. **Vertipper + Korrektur mid-word** an einer Stelle | Wirkt echt, nicht künstlich. Beschreibung-Feld bietet sich an. |
| **Wizard-Submit** | **Ansatz B** — Seed legt Wizard-Case fest an (seq=50, feste Zeit +30min), Playwright mocked den Submit via `route.fulfill()`, Success-Page zeigt deterministisch DA-0050 | Reproduzierbar. Keine DB-Pollution bei Re-Render. Pipeline-tauglich. |
| **Produktions-Reihenfolge** | **Gemeinsamer Run Take 2 + Take 3** (und später Take 4) — ein Seed-State, durchgehende Chronologie | Garantiert Zeit-Sync über alle Videos. Phone-Case bleibt sichtbar in Take-3-Leitsystem-Liste. |
| **Transition Wizard↔Leitsystem** | Nicht relevant (keine scrcpy-Clip nötig — Desktop-Kontext, Producer-Perspektive wechselt) | Fade reicht |

### 17.3 Die 4-Schritt-Architektur (analog Take 2)

```
1. SEED (erweitert: Wizard-Case hinzufügen)
   → Wizard-Case seq=50, created_at = _seed_time + 30 min
   → category=Leck, urgency=normal, status=neu, source=wizard
   → reporter: Gunnar Wende / 076 489 89 80 / gunnar.wende@flowsight.ch
   → address: Bahnhofstrasse 15, 8942 Oberrieden
   → description: "Irgendetwas scheint undicht zu sein"
   → 2 case_events: "Fall erstellt via Website-Formular", "Bestätigungs-SMS an Kunden gesendet"
   → _wizard_time ISO in tenant_config.json

2. PRODUCE WIZARD (Desktop 1280×720, kein Status-Bar)
   → Playwright navigiert zu /kunden/<slug>/meldung
   → DOM-Patch: Header-Phone echt → display_phone (+41 44 505 74 21)
   → C1: Initial Wizard-Step 1 (Kategorien + Dringlichkeiten)
   → C2: Klick "Leck" (Mouse-move, 400ms)
   → C3: Klick "Normal" (Mouse-move, 400ms) → Weiter-Button wird aktiv
   → Click Weiter
   → C4: Wizard-Step 2 (leer)
   → C5: Live-Typing mit realistischen Delays (50-120ms zufällig):
       - Strasse-Feld: "Bahnhofstrasse"
       - Nr-Feld: "15"
       - PLZ-Feld: "8942"
       - Ort-Feld: "Oberrieden"
   → Click Weiter
   → C6: Wizard-Step 3 (Name/Phone/Email pre-filled aus URL-Params)
       - Beschreibung LIVE TIPPEN mit VERTIPPER+KORREKTUR:
         "Irgendwtas" → Backspace×4 → "etwas scheint undicht zu sein"
   → Playwright route.fulfill() für POST /api/cases → Mock-Response mit DA-0050
   → Click "Meldung absenden"
   → C7: Success-Page (DA-0050, Leck, Normal, 8942 Oberrieden)
   → Wait 2.5s
   → take3_wizard.webm

3. PRODUCE LEITSYSTEM (1280×720)
   → Reuse Auth-Session von Take 2 (Cookie-Reuse)
   → Navigate /ops/cases (Admin-Scope Dörfler)
   → Warte auf DA-0050 in Liste sichtbar (Position 4 laut Bild)
   → C8: Case-Liste mit neuem Fall, 7 Tage KPIs "3 Neu / 6 Bei uns / 21 Erledigt / 4.7 Bewertung"
   → Scroll zu DA-0050 (falls nicht sichtbar)
   → Click DA-0050
   → C9: Case-Detail Scroll-Choreo:
       - Übersicht (Status Neu, Prio Normal)
       - Beschreibung + Kontakt
       - Verlauf mit "Fall erstellt via Website-Formular" + "Bestätigungs-SMS"
   → Click Zurück
   → C10: Zurück zur Liste
   → Click "+ Neuer Fall" Button
   → C11: Modal öffnet (Neuer-Fall-Formular) — 3s halten
   → Click Abbrechen
   → C12: Modal geschlossen, zurück zur Liste
   → take3_leitsystem.webm

4. FFMPEG SPLICE
   → [wizard][leitsystem] concat — KEINE Status-Bar-Overlay (Desktop-Kontext)
   → -ss Trim an beiden Inputs (weisse Start-Frames weg)
   → take3_complete.mp4 (1280×720, 30fps, libx264)
```

### 17.4 Kritische Invarianten (neu für Take 3)

| Invariante | Warum | Implementation |
|-----------|-------|----------------|
| Wizard-Header-Phone = `display_phone` (nicht echte) | Script-Hinweis C7 "21 hinten". Testviewer darf nie echten Betrieb anrufen | Playwright `page.evaluate()` DOM-patch nach goto |
| Wizard-Case `created_at = _seed_time + 30 min` | Glaubwürdige Chronologie — Kunde ruft an, 30 min später meldet er sich online | Seed schreibt `_wizard_time` in tenant_config |
| Reporter-Daten = Founder-Daten | Gunnar Wende / 076 489 89 80 / gunnar.wende@flowsight.ch | Via URL-Params pre-filled, Beschreibung wird live getippt |
| Typing-Delays 50-120ms zufällig | Wirkt nicht künstlich | `page.keyboard.type(text, { delay: 50+Math.random()*70 })` |
| Vertipper+Korrektur 1×/Take | Realistisch | In Beschreibung: type "Irgendwtas" → pause 300ms → backspace×4 → type "etwas scheint undicht zu sein" |
| Submit-API gemockt | Stabile Reproduktion | `page.route('**/api/cases', r => r.fulfill({ body: {case_id:"DA-0050", ...} }))` |
| Fall-ID = `{case_id_prefix}-0050` | Per Tenant unterschiedlich, immer seq=50 | Dörfler=DA-0050, Leins=LN-0050, Wälti=WS-0050, Stark=SH-0050 |
| KPI-Counts konsistent zu Take 2 + neuer Fall | +1 bei "NEU" (von 2 auf 3) | Seed setzt korrekte Zählungen, Leitsystem rendert live |

### 17.5 Quality-Check-Framework (10 Punkte)

| # | Qualitätspunkt | Pass-Kriterium |
|---|----------------|----------------|
| Q1 | **High-End persönlich** | Tenant-Brand-Color im Wizard-Button. Dörfler AG Header sichtbar. Case-ID-Prefix korrekt. Wizard-Kategorien aus `tenant_config.wizard.categories`. |
| Q2 | **Skalierbar (Pipeline-tauglich)** | One-Command `pipeline_screenflow.mjs --slug X --take 3`. Zero Hardcoding. Stark/Wälti/Leins laufen ohne Code-Änderung durch. |
| Q3 | **Authentisch (kein künstlicher Effekt)** | Mikro-Irregularität Typing (50-120ms). Vertipper+Korrektur an 1 Stelle. Realistische Mouse-Moves zwischen Clicks. Pausen an sinnigen Stellen (nach Step-Wechsel ~400ms, beim Lesen ~800ms). |
| Q4 | **Storyline-Kontinuität Take 2** | Phone-Case DA-0049 in Leitsystem-Liste drüber sichtbar. Wizard-Case DA-0050 +30 min später. Gleicher Tenant-State, gleicher Tag. |
| Q5 | **Zeit-Sync (+30min Konvention)** | Success-Page-Zeit = Case-Detail "Heute HH:MM" = Leitsystem-Liste "Heute HH:MM" = `_seed_time + 30min`. Keine Drift. |
| Q6 | **Telefonnummer-Integrität** | Wizard-Header zeigt `display_phone` (+41 44 505 74 21). Case-Detail Kontakt zeigt `reporter_phone` (076 489 89 80). Klar getrennt. |
| Q7 | **Fall-ID-Konsistenz** | DA-0050 auf Success-Page = Leitsystem-Liste = Case-Detail. Bei Leins LN-0050, bei Wälti WS-0050, bei Stark SH-0050 (aus `case_id_prefix`). |
| Q8 | **Case-Detail vollständig** | Verlauf zeigt "Fall erstellt via Website-Formular" + "Bestätigungs-SMS an Kunden gesendet" + "Sichten und einordnen"-Highlight (aktiver Status). Alle anderen Sektionen (Beschreibung, Kontakt, Interne Notizen, Anhänge) korrekt. |
| Q9 | **Keine Artefakte** | Keine white flashes (`-ss` Trim). Keine dev-badges (`killPortals()`). Keine Console-Errors. Sauberer Splice Wizard↔Leitsystem. |
| Q10 | **Desktop-Viewport stimmig** | 1280×720. Browser-Chrome minimal (kein URL-Bar). Wizard-Content zentriert. Leitsystem-Tabelle komplett sichtbar ohne Horizontal-Scroll. |

### 17.6 Scripts die neu gebaut werden (wiederverwenden wo möglich)

| Script | Status | Analog zu |
|--------|--------|-----------|
| `seed_screenflow_from_config.mjs` erweitern | Anpassen | + Wizard-Case mit `_seed_time + 30min`, + 2 case_events |
| `record_wizard_take3.mjs` | Neu | `record_leitsystem_take2.mjs` (Playwright-Pattern übernehmen, aber 1280×720 statt 412×915, kein Status-Bar-Mount, DOM-Patch für Phone) |
| `produceTake3Wizard()` in produce_screenflow.mjs | Neu | `produceTake2Samsung()` |
| `produceTake3Leitsystem()` in produce_screenflow.mjs | Neu | `produceTake2Leitsystem()` — aber `/ops/cases` + DA-0050 Click statt Phone-Case |
| `pipeline_screenflow.mjs` erweitern | Anpassen | `--take 3` (und `--take all` für Take 2+3 gemeinsam) |

### 17.7 Gemeinsamer Pipeline-Run (Take 2 + Take 3)

```bash
# Neue Syntax für gemeinsamen Run:
APP_URL=http://localhost:3000 node --env-file=src/web/.env.local \
  scripts/_ops/pipeline_screenflow.mjs --slug <slug> --take all
```

**Was passiert intern:**
1. Einmal Seed (49 Cases + 1 Notfall + 1 Phone-Case seq=49 + 1 Wizard-Case seq=50, `_seed_time` + `_wizard_time = _seed_time + 30min`)
2. Einmal Status-Bar render (nur für Take 2 relevant)
3. Produce Take 2 Samsung + Leitsystem → `take2_samsung.webm` + `take2_leitsystem.webm` → Splice → `take2_complete.mp4`
4. Produce Take 3 Wizard + Leitsystem → `take3_wizard.webm` + `take3_leitsystem.webm` → Splice → `take3_complete.mp4`
5. Später: Take 4 dazu (gleicher Run-State)

**Garantiert:** Perfekte Chronologie zwischen allen Takes. Derselbe Tenant-State, derselbe Tag, zeitlich durchgehend.

---

## 18. Take 4 Screenflow-Pipeline — Architektur-Plan (21.04.2026)

**Status:** GEPLANT, Umsetzung nach Take-3-Fertigstellung. Founder-bestätigte Entscheidungen aus Planungs-Session 21.04. Wird zusammen mit Take 2+3 im gemeinsamen Pipeline-Run produziert.

### 18.1 Storyline-Kontext

Take 4 ist die direkte Fortsetzung von Take 3. Gleicher Case (DA-0050 aus Wizard-Fall), wir führen ihn zum Abschluss durch den gesamten Lifecycle bis zur Bewertung.

- **Akt 1 (Tag 0 Nachmittag, ~14:24):** Fall auf "In Arbeit" setzen + Termin festlegen
- **Visual Time-Jump 1** (Tag 0 → Tag +1): 24h-Reminder-SMS erscheint im Handy-Verlauf
- **Visual Time-Jump 2** (Tag +1 → Tag +2): Termintag angebrochen
- **Akt 2 (Tag +2 Vormittag):** Fall auf "Erledigt" setzen + Bewertungsanfrage auslösen
- **Akt 3 (Handy):** SMS-Verlauf mit 3 chronologischen SMS + Link zur Review-Seite
- **Akt 4:** Review-Surface 5-Sterne-Animation → FAKE-ENDSCREEN

### 18.2 Founder-Entscheidungen (21.04.2026)

| Entscheidung | Wahl | Warum |
|-------------|------|-------|
| **Termin-Regel** | **+48h nächster Werktag, 09:00-11:00**, Wochenende/Feiertag-Skip | **Challenges die ursprüngliche "Folgewoche-Dienstag"-Regel.** Bei +24h käme der 24h-Reminder VOR Fallerstellung → chronologisch unmöglich. Bei +48h liegt der Reminder sauber dazwischen (Tag+1 Vormittag). |
| **SMS-Verlauf im Handy** | **3 SMS chronologisch sichtbar** | Bestätigung (Tag 0, aus Take 2) + 24h-Reminder (Tag +1) + Bewertungsanfrage (Tag +2) |
| **Time-Jumps** | **2 visuelle Time-Jumps** mit dezenten Datum-Overlays | Brücke Tag 0 → Tag +1 → Tag +2. Eleganter Fade mit Datum-Einblendung oben rechts (~1.5s) |
| **Viewport** | Desktop 1280×720 für Leitsystem-Teil + Samsung 412×915 für Handy-SMS-Teil | Take 4 ist **hybrid:** Desktop (Akte 1+2) + Mobile (Akt 3+4) |
| **Zeit-Offset zu Take 3** | +21 Minuten (14:03 Wizard → 14:24 In Arbeit) — realistisch für "Fall gesichtet und bearbeitet" | Passt zu User-Konvention "+30 min" als grobe Orientierung |
| **Review-Link-Bug** | **MUSS GEFIXT werden** (D17 zeigt "Link ungültig") | Aktueller Bug: `/v/DA-77?t=290f3fd4e29898c2` generiert ungültiges Token. Pipeline muss gültigen HMAC-signierten Link erzeugen. |

### 18.3 Die 4-Schritt-Architektur

```
1. SEED (erweitert: Wizard-Case-State evolviert mit)
   → Wizard-Case aus Take 3 bleibt (seq=50, DA-0050)
   → Nachträgliche State-Updates via Seed-Skript oder Playwright-Actions:
     - case_events: "Priorität, Zuständig, Termin, Termin-Ende aktualisiert" (Tag 0, 14:24)
     - case_events: "Priorität, Zuständig, Termin, Termin-Ende aktualisiert" (Tag +2, 10:30) — Erledigt-Aktion
     - case_events: "Bewertungsanfrage gesendet" (Tag +2, 10:31)
   → Termin-Feld wird gesetzt auf deriveAppointmentDate(_seed_time)
   → 3 ops_sms_log Einträge (Bestätigung Tag 0 14:03 / 24h-Reminder Tag +1 09:00 / Bewertungsanfrage Tag +2 10:31)

2. PRODUCE LEITSYSTEM AKT 1 (Desktop 1280×720)
   → Navigate to /ops/cases → D1: Liste mit DA-0050
   → Click DA-0050 → D2: Case-Detail "Neu"-State
   → Click "Bearbeiten" → D3: Dropdowns erscheinen
   → D4: Status-Dropdown öffnen
   → D5: Hover "In Arbeit"
   → D6: Click "In Arbeit" → Status=In Arbeit, Speichern-Button aktiv
   → Click Termin-Feld → D7: Kalender öffnet, scroll Zeit-Auswahl
   → Click nächster-Werktag-Tag + 09:00 VON + 11:00 BIS
   → D8: Termin "Di 28.04. 09:00-11:00" (bzw. dynamisch nächster Werktag+48h)
   → D9: "Termin versenden" + Notice "Kunde wird per E-Mail + SMS benachrichtigt"
   → Click Speichern
   → D10: Case-Detail mit neuen Werten, Verlauf zeigt "Priorität, Zuständig, Termin aktualisiert 14:24"
   → take4_leitsystem_akt1.webm

3. VISUAL TIME-JUMP 1 (1.5s Overlay)
   → Fade-Out Leitsystem
   → Fullscreen Datum-Overlay "Einen Tag später..." / "22.04.2026 · 09:00"
   → Samsung-Viewport einblenden: SMS-Verlauf zeigt NEUE SMS "24h-Reminder: Termin morgen 09:00 — Dörfler AG"
   → Fade-In (2s Hold)
   → time_jump_1.mp4

4. VISUAL TIME-JUMP 2 (1.5s Overlay)
   → Fade-Out
   → Fullscreen Datum-Overlay "Am Termintag..." / "23.04.2026 · 10:30"
   → Leitsystem öffnet wieder (Case DA-0050 Detail)
   → time_jump_2.mp4

5. PRODUCE LEITSYSTEM AKT 2 (Desktop 1280×720)
   → D11: Case-Detail zurück im Bearbeitungsmodus
   → D12: Status-Dropdown öffnen, hover "Erledigt"
   → D13: Click "Erledigt"
   → Click Speichern
   → D14: Case-Detail: Status=Erledigt (grün), "Gespeichert"-Hinweis, Sterne aktiviert, "Bewertung anfragen"-Button
   → Click "Bewertung anfragen"
   → D15: Verlauf zeigt "Bewertungsanfrage gesendet 10:31" + Sterne "Bewertung angefragt" "Gesendet"
   → take4_leitsystem_akt2.webm

6. PRODUCE HANDY SMS-VERLAUF (Samsung 412×915, mit Status-Bar)
   → Eigene HTML (take4_sms.html) — Samsung-Messaging-App Look
   → 3 SMS chronologisch sichtbar:
     1. "Dörfler AG: Ihre Meldung wurde aufgenommen..." (Tag 0, 14:03)
     2. "Dörfler AG: Erinnerung an Termin morgen 09:00..." (Tag +1, 09:00)
     3. "Dörfler AG: Vielen Dank für Ihr Vertrauen. Über eine kurze Bewertung freuen wir uns: https://flowsight.ch/r/DA-XXXX?t=..." (Tag +2, 10:31)
   → Click auf Link in SMS 3 → öffnet Review-Seite (Chrome-in-Samsung)
   → take4_sms.webm

7. PRODUCE REVIEW-SURFACE (Samsung 412×915)
   → Navigate /review/[caseId]?t=<hmac> mit GÜLTIGEM Token
   → D17 Problem: Link muss funktionieren → Seed erzeugt gültigen HMAC
   → 4 Text-Chips sichtbar, 5 Sterne, Textfeld
   → Click 5 Sterne (sequential fill animation)
   → Click 1 Chip ("Schnell & zuverlässig")
   → Click "Senden"
   → Success-Screen
   → take4_review.webm

8. FAKE-ENDSCREEN
   → Brand-Color Fullscreen
   → Kreis-Animation "Aus dem, was im Alltag nebeneinander herläuft, wird Ihr betriebseigenes Leitsystem"
   → Dörfler AG Logo + "Vielen Dank"
   → ~3s
   → take4_endscreen.webm

9. FFMPEG SPLICE
   → [akt1][jump1][jump2][akt2][sms][review][endscreen] concat
   → Mobile-Teile mit Status-Bar-vstack (analog Take 2)
   → Desktop-Teile ohne Status-Bar
   → Smooth crossfades zwischen Mobile/Desktop-Wechseln
   → take4_complete.mp4
```

### 18.4 Die Termin-Regel im Detail (skalierbar)

**Funktion:** `deriveAppointmentDate(baseTime: ISO)` in `derive_config.mjs` (neu).

**Algorithmus:**
```
1. candidate = baseTime + 48h (also Tag +2)
2. Setze Uhrzeit auf 09:00
3. Prüfe Wochentag von candidate:
   - Mo-Fr → return candidate (09:00-11:00)
   - Sa     → candidate + 2 Tage (= Mo)
   - So     → candidate + 1 Tag  (= Mo)
4. Prüfe CH-Feiertage (hardcoded Liste für aktuelle+nächste Jahre):
   - 1.1., Karfreitag, Ostermontag, 1.5., Auffahrt, Pfingstmontag, 1.8., 25.12., 26.12.
   - Wenn candidate = Feiertag → candidate + 1 Tag, prüfe erneut
5. return {start: candidate, end: candidate + 2h}
```

**Testfälle:**
| baseTime (Wizard-Fall) | +48h Kandidat | Werktag? | Feiertag? | Finaler Termin |
|------------------------|---------------|----------|-----------|----------------|
| Di 21.04. 14:03 | Do 23.04. 09:00 | Ja | Nein | Do 23.04. 09:00-11:00 |
| Mi 22.04. 14:03 | Fr 24.04. 09:00 | Ja | Nein | Fr 24.04. 09:00-11:00 |
| Do 23.04. 14:03 | Sa 25.04. → +2 → Mo 27.04. | Ja | Nein | Mo 27.04. 09:00-11:00 |
| Fr 24.04. 14:03 | So 26.04. → +1 → Mo 27.04. | Ja | Nein | Mo 27.04. 09:00-11:00 |
| Mi 29.04. 14:03 | Fr 1.05. (Tag der Arbeit) → +1 → Sa → +2 → Mo 4.05. | Ja | Nein | Mo 4.05. 09:00-11:00 |

**24h-Reminder-Zeitstempel:** `appointment.start - 24h` (automatisch aus Termin abgeleitet).

### 18.5 Kritische Invarianten (neu für Take 4)

| Invariante | Warum | Implementation |
|-----------|-------|----------------|
| Termin liegt auf Werktag 09:00-11:00 | Natürlicher Handwerker-Alltag. Keine Wochenend-/Feiertags-Termine. | `deriveAppointmentDate()` in derive_config |
| 24h-Reminder chronologisch NACH Case-Erstellung | Sonst SMS aus der Vergangenheit = Unsinn | +48h-Regel garantiert das |
| SMS-Verlauf zeigt exakt 3 SMS | Bestätigung (Take 2 legt) + Reminder (Take 4 legt) + Bewertung (Take 4 legt) | Seed setzt `ops_sms_log` entsprechend |
| Review-Link funktioniert | D17-Bug fixen. Token muss HMAC-gültig für Case sein. | Seed erzeugt gültigen HMAC, SMS-Link nutzt ihn |
| Time-Jump-Overlays kurz + dezent | Nicht storystörend. Max 1.5s. | Remotion-Component oder einfaches FFmpeg Fade |
| 5-Sterne-Animation sequential | Stern für Stern mit 80ms Delay + Scale-Pop | Remotion `<StarFill>` oder CSS-keyframes |
| FAKE-ENDSCREEN dauert 3s | Nicht zu lang, nicht zu kurz | Konstant |
| Tenant-Brand-Color durchzieht | FAKE-ENDSCREEN, Review-Surface | `tenant_config.tenant.brand_color` |
| Firmenname überall korrekt | FAKE-ENDSCREEN "Dörfler AG", Review-Seite Header, SMS-Sender | Aus `tenant.name` + `sms_sender_name` |

### 18.6 Quality-Check-Framework (12 Punkte)

| # | Qualitätspunkt | Pass-Kriterium |
|---|----------------|----------------|
| Q1 | **High-End persönlich** | Brand-Color zieht durch (Leitsystem, SMS-Bubbles-Akzent, Review-Seite, FAKE-ENDSCREEN). Firmenname in FAKE-ENDSCREEN. |
| Q2 | **Skalierbar (Pipeline-tauglich)** | `deriveAppointmentDate()` läuft für alle Kalender-Situationen. Keine Hardcoded-Dates. One-Command für alle 4 Betriebe. |
| Q3 | **Authentisch** | Dropdown-Clicks, Termin-Scroll, Sterne-Klicks — alles mit realistischen Mouse-Moves + Mikro-Pausen (200-500ms). |
| Q4 | **Storyline-Kontinuität Take 2+3** | DA-0050 aus Take 3 wird weitergeführt. Case-Verlauf wächst sichtbar (Einträge mit Zeitstempeln). |
| Q5 | **Zeit-Sync / Chronologie** | Akt 1 = Tag 0 14:24. Time-Jump 1 = Tag +1 09:00. Time-Jump 2 = Tag +2 10:30. Alle case_events + SMS-Timestamps konsistent. |
| Q6 | **Termin-Regel korrekt** | Termin liegt auf Werktag 09:00-11:00. Wochenende/Feiertag geskippt. Alle 4 Betriebe laufen durch. |
| Q7 | **SMS-Verlauf chronologisch korrekt** | Reihenfolge: Bestätigung → 24h-Reminder → Bewertungsanfrage. Datum/Uhrzeit-Labels im SMS-Screen korrekt. |
| Q8 | **Review-Link funktioniert** | D17-Bug gefixt. Link öffnet Review-Seite, nicht "Link ungültig". HMAC-Token valide. |
| Q9 | **5-Sterne-Animation smooth** | Sequential fill mit Scale-Pop. Nicht alle auf einmal, nicht zu langsam. ~400ms total. |
| Q10 | **Time-Jump-Overlays unauffällig-elegant** | Max 1.5s, dezentes Datum-Overlay, keine störenden Flashes. Wirkt wie TV-Szenenwechsel, nicht wie Glitch. |
| Q11 | **FAKE-ENDSCREEN passt** | 3s, Brand-Color, Firmenname, kein Flash. Kreis-Animation läuft durch. |
| Q12 | **Keine Artefakte** | Keine dev-badges, keine white flashes, keine Console-Errors, saubere Splices zwischen allen 7 Teilen. |

### 18.7 Scripts die neu gebaut werden

| Script | Status | Analog zu / neu |
|--------|--------|-----------------|
| `deriveAppointmentDate()` in derive_config.mjs | Neu | Werktags+Feiertag-Logik |
| `seed_screenflow_from_config.mjs` erweitern | Anpassen | Neue case_events für Take 4 lifecycle, 3 SMS-Einträge |
| `take4_sms.html` | Neu | Samsung Messaging-App Look (analog take2_samsung.html aber Messaging-UI) |
| `take4_review.html` | Existiert (aus Day 20) | Anpassen auf neue Quality-Anforderungen |
| `take4_endscreen.html` oder Remotion-Component | Neu | Brand-Color Fullscreen + Kreis-Animation + Firmenname |
| `record_leitsystem_take4_akt1.mjs` | Neu | Playwright: Bearbeiten → In Arbeit → Termin setzen → Speichern |
| `record_leitsystem_take4_akt2.mjs` | Neu | Playwright: Bearbeiten → Erledigt → Bewertung anfragen |
| `record_sms_take4.mjs` | Neu | Playwright rendert take4_sms.html + Click auf Link |
| `record_review_take4.mjs` | Anpassen | 5-Sterne-Click + Chip-Click + Submit |
| `produceTake4Combined()` in produce_screenflow.mjs | Neu | Orchestriert alle 7 Teile + Time-Jumps |
| `render_time_jump.mjs` | Neu | FFmpeg oder Remotion: Fade + Datum-Overlay (wiederverwendbar) |
| `pipeline_screenflow.mjs` erweitern | Anpassen | `--take 4` (und `--take all` für Take 2+3+4) |

### 18.8 Gemeinsamer Pipeline-Run (Take 2+3+4)

```bash
APP_URL=http://localhost:3000 node --env-file=src/web/.env.local \
  scripts/_ops/pipeline_screenflow.mjs --slug <slug> --take all
```

**Interner Ablauf:**
1. Einmal Seed komplett mit allen Zeitstempeln (`_seed_time`, `_wizard_time`, `_appointment`, `_completion`, `_review_sent`)
2. Einmal Status-Bar PNG rendern (für Take 2 + Take 4 Mobile-Teile)
3. Produce Take 2 → `take2_complete.mp4`
4. Produce Take 3 → `take3_complete.mp4`
5. Produce Take 4 → `take4_complete.mp4`
6. Alle 3 Videos haben durchgehende Chronologie + Konsistenz

**Geschätzte Pipeline-Dauer pro Betrieb:** Take 2 ~90s + Take 3 ~90s + Take 4 ~120s = **~5 Minuten pro Tenant** für die kompletten 3 Screenflow-Videos.

### 18.9 Die kritische D17-Bug-Klärung (Review-Link)

**Problem:** Bild D17 zeigt "Link ungültig — Dieser Bewertungslink ist nicht mehr gültig." — aber der Link soll die Review-Seite öffnen. Root-Cause wahrscheinlich:
- Entweder HMAC-Token abgelaufen/falsch signiert
- Oder Case-ID-Format falsch (`DA-77` statt `DA-0050`)
- Oder Route erwartet anderes Token-Format

**Fix-Plan:** Bei Implementation → (1) Route-Handler `/v/[id]` oder `/r/[id]` prüfen, welches der richtige ist. (2) HMAC-Secret aus .env korrekt nutzen. (3) Seed generiert Token mit `generateReviewToken(caseId, secret)` utility. (4) SMS-Link wird aus Seed-Token aufgebaut, nicht random.

**Test:** In Take 4 Recording → Click Link in SMS → Review-Seite muss laden, KEINE "Link ungültig"-Fehler.

### 18.10 Founder-Entscheidungen (Final 21.04.2026)

Alle Detail-Entscheidungen bestätigt:

| # | Entscheidung | Final |
|---|--------------|-------|
| E1 | Time-Jump-Stil | **Fullscreen Datum-Overlay 1.5s** — wirkt wie TV-Szenenwechsel, klar abgegrenzt |
| E2 | Sterne-Animation | **CSS-keyframes** in `take4_review.html` — konsistent mit HTML-Pipeline |
| E3 | **FAKE-ENDSCREEN — PREMIUM (krönender Abschluss)** | **Nicht minimal!** High-End Animation mit mehreren Layern: (1) Radiales Gradient-Hintergrund Brand-Color → Brand-Color-Dark. (2) Kreis-Schliess-Animation (SVG stroke-dashoffset von 0 → voller Kreis, 1.2s ease-out) — visualisiert "schliesst sich der Kreis". (3) Firmenname groß eingefadet (letter-spacing animation). (4) Tagline "Ihr betriebseigenes Leitsystem" dezent drunter. (5) Dörfler-Logo centered oben (falls vorhanden in tenant_config). (6) Subtiles particles/sparkle-Overlay (optional, wenn Zeit). (7) **Dauer: 5-6s** (nicht 3s, für Wirkung). (8) Keine CTA — bleibt kulturell Schweizer, aber visuell stark. |
| E4 | Termin-Regel | **+48h nächster Werktag 09:00-11:00** (Dilemma: 24h-Reminder braucht Platz zwischen Fall und Termin) |
| E5 | SMS-Text 24h-Reminder | *"{{firma}}: Erinnerung — Ihr Termin ist morgen, 09:00 Uhr, Bahnhofstrasse 15. Bei Fragen: {{display_phone}}"* |
| E6 | SMS-Text Bewertungsanfrage | Aus D16 übernehmen: *"{{firma}}: Vielen Dank für Ihr Vertrauen. Über eine kurze Bewertung freuen wir uns: https://flowsight.ch/r/{{case_id}}?t={{hmac_token}}"* |
| E7 | Review-Interaktion Sterne | **5 Sterne** — passt zum "Kreis schliesst sich" |
| E8 | Chip-Auswahl | **"Schnell & zuverlässig"** — generisch, passt jedem Handwerker |
| E9 | Textfeld Review | **Leer** — Sterne+Chip reichen, Video bleibt straff |
| E10 | Bewertung-Anfragen-Click | **Einfacher Click-through**, Button färbt sich grün |
| E11 | Kalender-Monatswechsel | **Ja sauber umsetzen** — wenn Kandidat-Termin im nächsten Monat, Nächster-Monat-Button visuell klicken |

**FAKE-ENDSCREEN Architektur — ÜBERHOLT (FB92):** Wird ersetzt durch Loom-PiP-Schlussbild (Founder-Face wird groß gemacht, Kein separater Endscreen mehr). Siehe §19.

**FAKE-ENDSCREEN Architektur (alter Plan, deaktiviert):**
- HTML-Template `take4_endscreen.html` mit:
  - `<svg>` Kreis-Ring, stroke-dasharray + dashoffset animated via CSS keyframes
  - Gradient background aus `var(--brand-color)` und darkened version (filter brightness(0.6))
  - Firmenname-fade-in mit letter-spacing transition (0 → normal, 0.8s delay nach Kreis-start)
  - Tagline-fade-in (1.2s delay)
  - Optional Logo oben centered
  - Particles via CSS keyframe-animated pseudo-elements (wenn Brand-Color es hergibt)
- Playwright rendert das HTML 6s lang → `take4_endscreen.webm`
- FFmpeg hängt es als finale Sequenz an `take4_complete.mp4` mit Crossfade (500ms) vom Review-Success-Screen

---

## 19. Take 4 v2 — FB76-FB93 Master-Plan (22.04.2026)

**Status:** PLAN. 18 Feedback-Punkte vom Founder-Review Take 4 v1 → Neuaufbau.

### 19.1 Kategorien

**Kategorie A — Pipeline-weit (trifft alle Takes):**
- **FB76:** Dev-Badge "2 Issues" im späten Take-2 (1:27-1:33). Existenter Badge-Kill reicht nicht. Sentry-Error-Toast-Layer hinzufügen.
- **FB77:** Notfall-Case Stammdaten fix: Name = "Claudia Brunner", Adresse = "Friesenstrasse 58". Ort dynamisch aus Betriebs-Adresse (Oberrieden für Dörfler, Adliswil für Stark etc.).

**Kategorie B — Take 4 Komplett-Neubau (FB78-92):**
- FB78: Start mit D1 (Fallliste), nicht D2 (Case-Detail).
- FB79: Status-Dropdown VISUELL öffnen + "In Arbeit" dynamisch klicken.
- FB80: Gelber Warning "Benachrichtigungen noch nicht versendet" per CSS wegblenden im Video.
- FB81: Betriebsspezifischer Cut (Brand-Color + Firmenname) bleibt als Design-Idee.
- FB82-85+FB90: Handy-Design IDENTISCH zu Take 2 — `take2_samsung.html` wiederverwenden mit neuen showSms* Funktionen.
- FB86: Cut bei 0:25 entfernen.
- FB87: Status-Dropdown erneut visuell öffnen für "Erledigt".
- FB88: D15 Success-State nach "Bewertung anfragen" zeigen.
- FB89: Split-Screen Layout — Handy als PiP-Overlay über Monitor (Monitor bleibt im Hintergrund sichtbar), gleiche Position rein/raus.
- FB91: 2 Chips ("Schnell & zuverlässig" + "Saubere Arbeit") auswählen.
- FB92: KEIN FAKE-ENDSCREEN — Closing ist Loom-Kreis-Grow.

**Kategorie C — Loom-PiP für alle Takes (FB93):**
- `Video_default.mp4` (80s, 1280×720) als PiP-Kreis oben rechts in allen Takes einbauen.
- Bei Take 2/3 bleibt der Kreis klein (180px). Bei Take 4 wächst er zum Vollbild am Ende.
- Loop wenn Take länger als 80s.

### 19.2 FB77 — Notfall-Case fixe Stammdaten

Änderung in `seed_screenflow_from_config.mjs`:

```js
reporter_name: "Claudia Brunner",      // fix pipeline-weit
street: "Friesenstrasse",              // fix
house_number: "58",                     // fix
city: ownLocation.city,                 // dynamisch (Oberrieden für Dörfler)
plz: ownLocation.plz,                   // dynamisch
```

### 19.3 FB76 — Dev-Badge nachhaltig killen

Erweiterung in `record_leitsystem_take2.mjs`:
- CSS-Targets zusätzlich: `button[data-sentry]`, `[data-error-toast]`, `.sentry-feedback`
- killBadges() nach jedem waitForTimeout > 5s erneut aufrufen
- Interval-Guard mit 100ms Rate

### 19.4 Take 4 v2 Struktur (9 Teile)

| # | Szene | Dauer | Viewport | Quelle |
|---|-------|-------|----------|--------|
| 1 | D1 Fall-Liste — kurze Intro | ~3s | 1440×900 | `/ops/cases` |
| 2 | Click DA-0050 → Case-Detail D2 | ~2s | 1440×900 | Row click |
| 3 | Bearbeiten + Status-Dropdown ÖFFNEN + "In Arbeit" + Termin +48h + Speichern (Warning hidden) | ~18s | 1440×900 | Playwright |
| 4 | Brand-Cut (Firmenname Fade) | 1.2s | 1440×900 | HTML template |
| 5 | Split-Screen: Monitor im BG + Handy-Overlay: Homescreen 08:59 → 09:00 → SMS-Reminder fliegt rein (genau wie Take 2) → SMS-Verlauf | ~8s | Composite | FFmpeg overlay |
| 6 | Monitor Fullscreen: Bearbeiten + Dropdown ÖFFNEN + "Erledigt" + Speichern + "Bewertung anfragen" + D15 Success | ~12s | 1440×900 | Playwright |
| 7 | Split-Screen: SMS-Bewertung ploppt rein → Click Link | ~4s | Composite | |
| 8 | Review-Seite: 5 Sterne + 2 Chips + Senden + Success | ~8s | Handy-Mockup oder Take2-Samsung | Playwright |
| 9 | Loom-Grow: Handy aus, Monitor aus, Loom wächst zu Vollbild | ~6s | Full Loom | Video composite |

### 19.5 FB89 — Split-Screen Architektur

Handy ist IMMER ein Picture-in-Picture Overlay auf dem Monitor-Stand. Never Cut zu Vollbild-Handy. Gleiche Position rein und raus (rechts oben).

**FFmpeg-Technik:**
```
[monitor][phone_circle] overlay=x=W-w-40:y=40:enable='between(t,start,end)'
```

Handy-Größe ~320×712 (70% Scale). Subtle Drop-Shadow.

### 19.6 FB90+FB82-85 — Handy-Design Vereinheitlichung

Take 4 nutzt **`take2_samsung.html`** (nicht take4_sms_frame mehr). Dieselbe Datei, erweitert um:
- `window.showSmsReminder()` — fügt Reminder-Bubble hinzu (Tag +1 Format, Samsung-Messaging-Style wie Take 2)
- `window.showSmsReview()` — fügt Review-SMS-Bubble hinzu
- Bestehender `window.showSmsNotification()` + SMS-Screen bleibt unverändert

So sind Take 2 und Take 4 visuell IDENTISCH beim Handy.

### 19.7 FB93 — Loom-PiP Infrastruktur

**Setup:**
- Video_default.mp4 → preprocessed als `video_default_circle.mp4` (runde Maske via FFmpeg alpha, 180×180, transparenter Hintergrund)
- Alternativ: CSS mask via Playwright rendering des Videos in einem runden Container

**Einbau:**
- Take 2/3/4: Final FFmpeg Overlay-Step hängt den Loom-Kreis auf den Video-Output
- Take 4 speziell: Der Kreis ist im Schluss-Segment animiert — grow von 180px oben rechts auf 800×800 centered, Monitor+Phone gleichzeitig fading out (opacity 1 → 0 über 1s).

### 19.8 Neue Scripts + Templates

| Datei | Status | Zweck |
|-------|--------|-------|
| `screen_templates/sequences/take4_brand_cut.html` | NEU | Brand-Color + Firmenname 1.2s Overlay |
| `screen_templates/sequences/take2_samsung.html` | ERWEITERN | + showSmsReminder + showSmsReview |
| `_lib/renderLoomCircle.mjs` | NEU | Video_default → circle-masked clip |
| `record_take4.mjs` | UMBAU | Neuer 9-Teil-Flow |
| `compose_take4_final.mjs` | NEU | Split-Screen + Loom-Grow orchestration |
| `pipeline_screenflow.mjs` | ANPASSEN | Loom-PiP final step for all takes |

### 19.9 Quality-Check v2 (20 Punkte)

Zusätzlich zu §18.6 Q1-Q12:

| # | Neu | Pass-Kriterium |
|---|-----|----------------|
| Q13 | D1 Fall-Liste Start | Video startet mit Fallübersicht, nicht Case-Detail |
| Q14 | Status-Dropdown visuell | Dropdown öffnet sichtbar mit allen Optionen |
| Q15 | Warning CSS-versteckt | Kein gelbes Banner "Benachrichtigungen" |
| Q16 | Handy-Design identisch zu Take 2 | Selbe Samsung-HTML, SMS-Bubbles, Homescreen-Flow |
| Q17 | Split-Screen Layout | Handy als PiP auf Monitor, Monitor bleibt sichtbar |
| Q18 | 2 Chips selected | Schnell & zuverlässig + Saubere Arbeit beide highlighted |
| Q19 | Kein FAKE-ENDSCREEN | Closing ist Loom-Kreis-Grow |
| Q20 | Loom-PiP in Take 2+3 | Video_default.mp4 als Kreis sichtbar |

### 19.10 Reihenfolge der Umsetzung

1. **Pipeline-weit (Kat A):** FB77 Notfall-Fix + FB76 Badge-Kill
2. **Take 2+3 Re-Render** mit Loom-PiP Platzhalter (FB93)
3. **Take 4 v2 Kern (Kat B):** Alle 14 FB-Punkte in neuem record_take4.mjs
4. **Final-Compose:** Split-screen + Loom-Grow
5. **Verify:** Alle 20 QC-Points grün

---

## 20. EOD-Stand 22.04.2026 — FB76-FB101 alle umgesetzt

**Status:** Dörfler AG — Take 2/3/4 produziert mit Loom-Circle-PiP, alle 26 FB-Punkte addressiert. Morgen: Audio-Merge + Loom-Austausch gegen echte Founder-Aufnahmen + Stress-Test Leins/Wälti/Stark.

### 20.1 Feedback-Matrix (FB76-FB101)

| FB | Thema | Umsetzung | Status |
|----|-------|-----------|--------|
| FB76 | Dev-Badge Take 2 (1:27-1:33) | `drawbox` cover y=808 h=70 auf lscaled layer; JS MutationObserver Kill | ✅ |
| FB77 | Notfall-Stammdaten | Claudia Brunner + Friesenstrasse 58 pipeline-weit (seed_screenflow_from_config.mjs), Ort dynamisch aus voice_agent.address | ✅ |
| FB78 | Take 4 Start mit D1 | record_take4.mjs → `/ops/cases` zuerst, dann click DA-0050 Row | ✅ |
| FB79/87 | Status-Dropdown visuell | Synthetic `<div id="fb96-dropdown">` Overlay mit Optionen + highlight, 1.5s hold, dann selectOption | ⚠️ teilweise |
| FB80/97 | Warning "Benachrichtigungen noch nicht versendet" | Multi-CSS (`bg-yellow*`, `bg-amber*`) + Text-based JS killer | ✅ |
| FB81/100 | Brand-Cut entfernen | Aus compose_take4_final.mjs Parts-Array entfernt; Handy-Slide-In übernimmt Übergang | ✅ |
| FB82-85/FB90 | Handy-Design identisch zu Take 2 | Take 4 nutzt `take2_samsung.html` via URL-Params + `window.__t4PhoneMode=true` Flag skippt Auto-Call-Sequence | ✅ |
| FB86 | Cut bei 0:25 entfernen | Neuer 5-Teil-Flow ohne separate Time-Jumps | ✅ |
| FB88 | D15 Success-State nach "Bewertung anfragen" | waitForTimeout 4.5s nach Click; Fehler-Toasts CSS/JS hidden | ✅ |
| FB89 | Split-Screen Layout | buildCompositeWithPhone: bg=last-frame-akt2-loop + phone overlay rechts | ✅ |
| FB91 | 2 Chips selected | "Schnell & zuverlässig" + "Saubere Arbeit" via eval → beide `selected` class | ✅ |
| FB92 | Kein FAKE-ENDSCREEN | Ende ist Review-Success + Loom-Ende (Grow-Animation für später markiert) | ✅ |
| FB93 | Loom-PiP als Platzhalter | `Video_default.mp4` als Circle 200px Masked überall | ✅ |
| FB95 | Dev-Badge Balken Take 4 | drawbox auf alle Leitsystem-Parts in compose_take4_final.mjs | ✅ |
| FB98 | Take 2 Loom Position | Kreis rechts oben auf Handyscreen (overlap Status-Bar/SMS-Header) | ✅ |
| FB99 | Take 3 Loom Animation | smoothstep x+y expression: t=37→38.5s, (W-w-24,24) → (40,350) | ✅ |
| FB101 | Handy Slide-In | FFmpeg overlay x: smoothstep 1s von off-screen right (1440) zu target (1080) | ✅ |

### 20.2 Aktuelle Pipeline-Architektur

**One-Command pro Take + alle gemeinsam:**
```bash
APP_URL=http://localhost:3000 node --env-file=src/web/.env.local \
  scripts/_ops/pipeline_screenflow.mjs --slug <slug> --take 2|3|4|all
```

**Ablauf pro Take:**

| Take | Schritte |
|------|----------|
| **Take 2** | seed → render_status_bar → produce_screenflow (Samsung + Leitsystem webm) → FFmpeg Splice (Mobile 412×914 + Status-Bar vstack + drawbox FB76) → Loom-PiP overlay |
| **Take 3** | insert_take3_wizard_case → record_wizard_take3 (Desktop 1440×900 + FB67 Phone-Patch) → record_leitsystem_take3 (1440×900 + FB62/72/75) → FFmpeg Splice (drawbox + concat) → Loom-PiP animated overlay (FB99) |
| **Take 4** | insert_take4_lifecycle (reset case, HMAC token, +48h Termin) → record_take4.mjs (6 Parts: Akt1, Phone-Day1, Akt2, Phone-Day2, Review, Brand-Cut disabled) → compose_take4_final.mjs (extract last-frame bg + phone overlay with slide-in FFmpeg expr + drawbox FB95) → Loom-PiP static mitte links |

**Zwischen-Artefakte pro Betrieb in `docs/gtm/pipeline/06_video_production/screenflows/<slug>/`:**
- `take2_samsung.webm`, `take2_leitsystem.webm`, `take2_complete.mp4`, `take2_with_loom.mp4`
- `take3_wizard.webm`, `take3_leitsystem.webm`, `take3_complete.mp4`, `take3_with_loom.mp4`
- `take4_01_akt1.webm`, `take4_03_phone_day1.webm`, `take4_04_akt2.webm`, `take4_05_phone_day2.webm`, `take4_06_review.webm`, `_scene_phone1.mp4`, `_scene_phone2.mp4`, `_scene_review.mp4`, `take4_complete.mp4`, `take4_with_loom.mp4`
- `status_bar.png`, `_app_open_clip.mp4`, `_mask_circle_200.png`
- `tenant_config.json` enthält: `_seed_time`, `_wizard_time`, `_wizard_case_id`, `_wizard_case_label`, `_appointment_start/end`, `_reminder_time`, `_completion_time`, `_review_sent_time`, `_review_token`

### 20.3 Scripts Map (Stand 22.04.)

| Datei | Rolle |
|-------|-------|
| `scripts/_ops/pipeline_screenflow.mjs` | Orchestrator (Take 2/3/4/all + Loom-PiP final step) |
| `scripts/_ops/seed_screenflow_from_config.mjs` | DB-Seed mit FB77 Notfall-Daten Claudia Brunner |
| `scripts/_ops/render_status_bar.mjs` | Samsung Status-Bar PNG render |
| `scripts/_ops/produce_screenflow.mjs` | Take 2 Samsung HTML + Leitsystem Playwright |
| `scripts/_ops/record_leitsystem_take2.mjs` | Take 2 Leitsystem-Aufnahme (FB62/75/76) |
| `scripts/_ops/record_leitsystem_take3.mjs` | Take 3 Leitsystem Desktop-Aufnahme |
| `scripts/_ops/record_wizard_take3.mjs` | Take 3 Wizard-Aufnahme (FB67 Phone-Patch) |
| `scripts/_ops/insert_take3_wizard_case.mjs` | Wizard-Case DA-0050 in DB (+30min) |
| `scripts/_ops/insert_take4_lifecycle.mjs` | Take 4 Lifecycle-Prep (case reset, HMAC, timings) |
| `scripts/_ops/record_take4.mjs` | Take 4 6-Teil-Aufnahme (FB78-91) |
| `scripts/_ops/compose_take4_final.mjs` | Take 4 FFmpeg Split-Screen + Concat (FB89/95/101) |
| `scripts/_ops/_lib/deriveAppointmentDate.mjs` | +48h Werktag-Logik CH-Feiertage |
| `scripts/_ops/_lib/renderLoomCircle.mjs` | Circle-Mask-PNG (grayscale) + Loom-Filter-Builder |
| `scripts/_ops/screen_templates/sequences/take2_samsung.html` | Take 2 Samsung-Flow + showSmsReminder/Review (shared für Take 4) |
| `scripts/_ops/screen_templates/sequences/take4_brand_cut.html` | Brand-Cut 1.4s (ungenutzt, FB100) |
| `scripts/_ops/screen_templates/sequences/take4_review.html` | Review-Surface Standalone (5 Sterne + Chips) |
| `scripts/_ops/screen_templates/sequences/take4_sms_frame.html` | (ungenutzt jetzt — take2_samsung übernimmt) |
| `scripts/_ops/screen_templates/sequences/take4_endscreen.html` | Premium FAKE-ENDSCREEN (ungenutzt seit FB92) |

### 20.4 Loom-PiP Spezifikation

**Durchmesser:** 200px (ca. halbe Samsung-Handyscreen-Breite 412)
**Maske:** `_mask_circle_200.png` grayscale, white inside circle (radius 197), black outside
**FFmpeg-Chain:** `[loom]scale=200:200,crop[loomsq];[loomsq][mask]alphamerge[loomcirc];[bg][loomcirc]overlay=x:y`
**Border/Shadow:** Aktuell kein expliziter Border (ring). Kann via zusätzlichen drawbox-ring-Filter ergänzt werden.
**Source:** `docs/gtm/pipeline/06_video_production/video_example/Video_default.mp4` (80s Founder-Face-Recording, 1280×720)

**Per-Take Position:**
| Take | Position-Spec |
|------|---------------|
| Take 2 | `{static: {x: "W-w-10", y: 36}}` — rechts oben bündig, overlap auf Status-Bar |
| Take 3 | `animated` expressions, bis t=37 rechts oben (W-w-24, 24), dann 1.5s Slide zu (40, 350) |
| Take 4 | `{static: {x: 40, y: 350}}` — mitte links, Fortsetzung Take-3-End |

### 20.5 Offene Polish-Punkte für morgen

1. **FB96 Dropdown-Overlay reliability** — Synthetic overlay greift nicht zu 100%. Stable-fix: waitForSelector + getBoundingClientRect nach render.
2. **Drawbox-Navy-Balken** unten links bei Take 2 ist cover aber sichtbar als dunkler Block. Option A: exakt-matching BG (not always navy), Option B: exakt Badge-Bereich kleiner dimensionieren.
3. **FB92 Loom-Grow** am Take-4-Ende: Der Founder-Kreis soll Final-Segment (letzte 6s) zu Vollbild wachsen während Monitor+Phone fading. Noch nicht implementiert. FFmpeg-Expression mit `scale=` + opacity-animation.
4. **Take 4 Slide-Out** (FB101 Fortsetzung): Handy soll nach Phone-Day1 "aus dem Monitor gezogen" aussehen. Aktuell: Cut zu Akt2 (kein Slide-Out). FFmpeg overlay x-expression für Rückwärts-Animation.
5. **Loom-Circle Ring** — aktuell nur Kreis ohne sichtbaren Rand. FB-Bilder zeigen subtilen weißen Ring + Drop-Shadow. Kann via doppel-layer (shadow + circle) ergänzt werden.
6. **Loom-Animation Timing Take 3** — hardcoded bei t=37. Falls Take-3-Dauer variiert (anderer Betrieb, unterschiedliche Wizard-Clicks), könnte Mismatch auftreten. Dynamisch aus Scene-Markers ableiten.

### 20.6 Morgen (23.04.2026) — Plan

**Priorität:**
1. **Loom-Austausch:** Founder nimmt pro Take ein eigenes Loom-Video auf (60-90s). Pipeline liest `video_example/take{2,3,4}_loom.mp4` statt Video_default.mp4.
2. **Audio-Einbau:** Master-Audio Take 2/3/4 mit Screenflows syncen via FFmpeg audio-merge.
3. **Stress-Test Leins/Wälti/Stark:** Pipeline ein-Kommando-weise durch.
4. **Polish-Punkte** aus §20.5 iterieren.

**Endziel 23.04:** 3 Takes × 4 Betriebe = 12 finalisierte Videos mit Audio + Loom-PiP. Bereit für E-Mail-Outreach-Versand am Do/Fr.

### 20.7 Wiedereinstieg für morgige Session

**ZUERST LESEN:** `docs/gtm/pipeline/PIPELINE_BIBLE.md` §20 (dieses Kapitel) + `memory/MEMORY.md`.

**Dann:** `git status` + `ls docs/gtm/pipeline/06_video_production/screenflows/doerfler-ag/*_with_loom.mp4` zum Stand-Check.

**Start-Kommando:** Was der Founder als erstes will — vermutlich einer von:
- "Zeig mir Take 2/3/4" → File-Links aus §20.2
- "Loom-Aufnahme ist da" → Audio+Loom-Merge-Script bauen
- "Leins/Wälti/Stark durchjagen" → Pipeline-Loop
- Neue Feedback-Punkte → in §21 festhalten

---

## 21. Take 4 v3 — FB102-109 Master-Plan (Founder-Review 22.04. EOD)

**Status:** PLAN. 8 neue Feedback-Punkte von Founder nach Loom-Circle-Runde. Punkte berühren grundlegende Flow-Logik (kein Cosmetic-Fix). Take 4 muss ERNEUT umgebaut werden.

### 21.1 Feedback-Matrix FB102-109

| FB | Thema | Root-Cause |
|----|-------|-----------|
| FB102 | Drawbox-Balken unten links noch sichtbar | Take 4 cover matched Sidebar, aber Farbe ist nicht exakt gleich → sichtbar als Block |
| FB103 | Dropdown highlight falsch ("Geplant" statt "In Arbeit") | `index === 1` im synthetic overlay, aber "In Arbeit" = Index 2 (options: Neu, Geplant, **In Arbeit**, Warten, Erledigt) |
| FB104 | Warning noch sichtbar (3. Wiederholung) | CSS+JS-kill greift nicht vollständig. React rendert Warning via bg-amber-Klasse die mglw. als Inline-Style statt Classname kommt |
| FB105 | Phone Slide-In künstlich-linear | Aktuelle smoothstep x-only Animation. User will: Bogen + Jitter wie Maus-Ziehen, Endplatzierung weiter drin im Monitor |
| FB106 | D15 Screen nach "Bewertung anfragen" fehlt | waitForTimeout greift, aber Success-State wird nicht klar für 2-3s gezeigt |
| FB107 | Letztes Phone-Rein: Reminder flattert rein statt schon drin zu sein | `window.showSmsReminder()` wird erst bei Phone-Day2 aufgerufen → User sieht Animation obwohl SMS bereits Tage vorher angekommen wäre |
| FB108 | Review-Flow künstlich, Phone nicht permanent | Separate scene_review erzeugt Cut zwischen SMS und Review-Surface; Review-HTML hat kein Samsung-Browser-Chrome |
| FB109 | Review-Link ungültig — Seed generiert Demo-Token, aber Route-Validation failed lokal | User will echten Samsung-Browser-Look (URL-Bar, Tab-Icon, Back-Button) |
| FB108-Part2 | Closing-Flow fehlt: Bewertung im Dashboard sichtbar? | Aktueller Flow endet mit Phone-Success. User will: Handy raus → Monitor zeigt Bewertung reingekommen → Fallübersicht → Loom groß |

### 21.2 Take 4 v3 Neu-Struktur (7 Teile, Closing-Flow NEU)

Der Founder will einen **Closing-Loop** der den "Kreis schließt": Review kommt nicht nur auf Handy an, sondern ist dann auch im Dashboard sichtbar.

| # | Szene | Dauer | Details |
|---|-------|-------|---------|
| **1** | **Monitor: D1 Fall-Liste** | ~3s | Start, Click DA-0050 |
| **2** | **Monitor: D2 Case-Detail + Bearbeiten + Status-Dropdown OFFEN (In Arbeit highlighted, FB103 INDEX=2!) + In Arbeit + Termin +48h + Speichern** | ~18s | Warning FB104 aggressiv entfernen |
| **3** | **Handy REIN (Bogen-Animation FB105) + Homescreen 08:59→09:00 + SMS-Reminder Notification** | ~5s | Phone kommt in Bogen von Ecke rechts oben |
| **4** | **Handy bleibt: SMS-Thread mit 2 SMS (Bestätigung + Reminder)** | ~4s | Founder spricht |
| **5** | **Handy RAUS (Bogen zur Ecke unten rechts, FB105)** | ~1s | |
| **6** | **Monitor allein: Bearbeiten + Status-Dropdown OFFEN (Erledigt highlighted) + Erledigt + Speichern + Bewertung anfragen** | ~12s | |
| **7** | **D15 HOLD**: "Bewertung angefragt / Gesendet" sichtbar ~3s (FB106) | ~3s | "Nicht anfragen" Button weg, "Gesendet" grün-Badge |
| **8** | **Handy REIN (Bogen) — ALLE 3 SMS BEREITS DRIN (FB107)** | ~4s | Kein flatter-Animation |
| **9** | **Click Bewertungslink (realistic finger-click animation) → Samsung-Browser öffnet (URL-Bar, Tab-Icon, FB109-inspired)** | ~3s | Review-Seite in Samsung-Browser-Frame |
| **10** | **Review: 5 Sterne + 2 Chips + Senden → Success ("Vielen Dank")** | ~8s | Handy bleibt sichtbar während Review |
| **11** | **Handy RAUS (Bogen unten rechts)** | ~1s | |
| **12** | **Monitor: Dashboard mit Bewertung sichtbar — Fall als "Gold" in Liste, Sterne-KPI aktualisiert (FB108 Closing)** | ~4s | Seed setzt review_received_at + review_rating=5 |
| **13** | **Fallübersicht (final state)** | ~2s | Kreis schließt sich |
| **14** | **Loom-Grow zum Vollbild** | ~4s | Founder übernimmt Gesamt-Bild für Closing-Worte |

**Total:** ~72s — entspricht User-Script-Länge.

### 21.3 FB102 — Cover-Fix kontextabhängig

Aktuell: `drawbox=color=#1e2433` (navy) für Take 4 = matched Leitsystem-Sidebar.
Für Take 2 (Mobile ohne Sidebar): `#1e2433` ist sichtbar als dunkler Block auf weißem BG.

**Fix:** Per-Take Cover-Farbe:
- Take 2 Mobile: `color=white` (matched Case-Liste-BG)
- Take 3/4 Desktop (Leitsystem sichtbar): Echte Sidebar-Farbe aus OpsShell.tsx inspect. Aktuell Sidebar-BG = `bg-[#1e2433]` + ggf. overlay. Exakter hex match.

Noch besser: **Badge-Source direkt killen statt abdecken.** Research: Next.js 16 dev-indicator ist in Shadow DOM. Access via:
```js
document.querySelector("nextjs-portal")?.shadowRoot?.querySelector(".root")?.remove();
```

### 21.4 FB103 — Dropdown-Overlay Index Fix

```js
// Aktuell:
overlay.innerHTML = options.map((o, i) =>
  `...${i === 1 ? 'background:#eff6ff;' : ''}`);  // highlights "Geplant"

// Fix:
const targetIdx = options.findIndex(o => o.label === "In Arbeit"); // = 2
overlay.innerHTML = options.map((o, i) =>
  `...${i === targetIdx ? 'background:#eff6ff;' : ''}`);
```

Entsprechend für Akt2: `findIndex(o => o.label === "Erledigt")` = 4.

### 21.5 FB104 — Warning nachhaltig killen

Aktuelle Strategien greifen teilweise. Root-Cause: Warning wird von React via bg-amber-50 Klasse ODER als Inline-Style gerendert. Der amber-50 hex ist `#fef3c7` — sehr spezifisch.

**Aggressiver Fix:** MutationObserver + Text-Pattern-Match + remove ENTIRE parent section:
```js
const warningText = /Benachrichtigungen noch nicht versendet|wurden geändert/i;
new MutationObserver(() => {
  document.querySelectorAll("div, section, aside").forEach((el) => {
    if (warningText.test(el.textContent || "") && el.textContent.length < 500) {
      el.remove();  // remove entire warning container
    }
  });
}).observe(document.body, { childList: true, subtree: true });
```

Plus CSS: `div[style*="rgb(254"],div[style*="#fef"]{display:none !important}` (amber-50 inline-style hex).

### 21.6 FB105 — Bogen-Animation + Jitter

**Quadratische Bezier-Kurve für x,y-Animation:**

Rein-Bewegung (Ecke oben rechts → Zielort):
- P0 = (1440, 0)
- P1 = (1440, Y_target)  — Control-Point rechts auf Zielhöhe (erzeugt "Rechts-Bogen")
- P2 = (X_target, Y_target)
- Zeit-Parameter u ∈ [0, 1] über 1s
- x(u) = (1-u)² * 1440 + 2*(1-u)*u * 1440 + u² * X_target
     = 1440 - u² * (1440 - X_target)
- y(u) = u * (2 - u) * Y_target  = 2u*Y_target - u²*Y_target

Raus-Bewegung (Zielort → Ecke unten rechts):
- P0 = (X_target, Y_target)
- P1 = (1440, Y_target)
- P2 = (1440, 900) — Ecke unten rechts
- x(u) = X_target + u² * (1440 - X_target)  // inverse
- y(u) = Y_target + u² * (900 - Y_target)

**Jitter**: Add `+ sin(t * 8) * 4` zu x und `+ cos(t * 10) * 3` zu y → ruckeln wie Maus.

**Endplatzierung** (FB105 "weiter rein"): Aktuell X_target=1080. User will weiter drin — X_target=800 (mitte-rechts). Y_target=120 (leicht unten von oben).

### 21.7 FB106 — D15 Hold

Nach "Bewertung anfragen" Click: **3 Sekunden HOLD** auf Case-Detail mit:
- "Bewertung angefragt" Button grün
- "Gesendet" Badge
- Sterne-Zeile
- Verlauf "Bewertungsanfrage gesendet"

Kein frühes Handy-Rein-Schwenk.

### 21.8 FB107 — SMS All-Preloaded bei letztem Phone-Rein

Phone-Day2 (Scene 8) Render-Logik:
- Direkt `showScreen("sms-screen")` OHNE sequential showReminder/showReview
- Alle 3 SMS-Bubbles bereits im DOM sichtbar (statisch)
- Kein fly-in Animation

Take 4 Phone-Day2 HTML-Template: Add `?preloaded=1` Query-Param → Take2-Samsung-HTML rendert alle Reminder+Review statisch.

### 21.9 FB108+FB109 — Samsung-Browser + Review + Closing

**Samsung-Browser-Frame HTML:** Neue `take4_samsung_browser.html`:
- Samsung-Device-Mockup-Frame (412×915)
- Top: URL-Bar mit "flowsight.ch" + lock-icon
- Tab-Indicator "2" im Header
- Bottom: Browser-Navigation (back, forward, +, tabs, menu)
- Content-Area: Iframe/Div rendering Review-Surface
- Animierter Click-Ripple beim Link-Click

**Review-Token:** User muss SMS_HMAC_SECRET in .env setzen für echten Token. Fallback: In HMAC-bypass-Mode Route `/review/[caseId]?bypass=dev` nur in dev-mode aktivieren.

**Closing-Flow (Scene 12):**
1. Nach Review-Submit → Seed-Script setzt `cases.review_received_at` + `cases.review_rating=5` + `cases.review_text="Schnell & zuverlässig, Saubere Arbeit"`
2. Leitsystem neu öffnen → Dashboard zeigt:
   - Fall als GOLD-Badge (Bewertet, 5★)
   - KPI "Bewertung" mit höherer Count
3. Fallübersicht kurz zeigen (2s)
4. Loom-Grow auf Vollbild (4s)

### 21.10 Neue Scripts

| Datei | Status |
|-------|--------|
| `screen_templates/sequences/take4_samsung_browser.html` | NEU — Samsung-Browser-Frame mit URL-Bar |
| `screen_templates/sequences/take4_closing_dashboard.mjs` | NEU — Dashboard nach Review, Fall als Gold |
| `record_take4.mjs` | UMBAU — 7 neue Scenes (1-14), D15 Hold, Preloaded SMS |
| `compose_take4_final.mjs` | UMBAU — Bezier-Bogen Animation, Phone permanent bei Scenes 8-10 |
| `_lib/bezierOverlay.mjs` | NEU — FFmpeg Bezier-Expression-Builder |

### 21.11 Quality-Check v3 (28 Punkte)

Zusätzlich zu §18.6 + §19.9:

| # | Pass-Kriterium |
|---|----------------|
| Q21 | FB102 Kein Cover-Block sichtbar (Navy matched oder Badge wirklich entfernt) |
| Q22 | FB103 Dropdown highlight "In Arbeit" (nicht "Geplant") |
| Q23 | FB104 Kein gelbes Warning sichtbar IRGENDWO im Video |
| Q24 | FB105 Phone bewegt sich in Bogen (nicht linear), mit Jitter |
| Q25 | FB105 Endplatzierung weiter drin (X ≈ 800 nicht 1080) |
| Q26 | FB106 D15 "Gesendet"-State 2-3s klar sichtbar |
| Q27 | FB107 SMS-Reminder bereits drin beim letzten Phone-Rein (kein fly-in) |
| Q28 | FB108 Samsung-Browser-Frame für Review-Seite (URL-Bar, Tabs, Nav) |
| Q29 | FB108 Handy permanent sichtbar während Review-Interaction |
| Q30 | Closing-Flow: Fall als Gold im Dashboard, dann Fallübersicht, dann Loom-Grow |

### 21.12 Reihenfolge der Umsetzung

1. **Quick wins** (geringes Risiko, hohe Sichtbarkeit):
   - FB103 Dropdown-Index Fix (5 min)
   - FB102 Cover-Farbe kontextabhängig (10 min)
   - FB104 Warning MutationObserver + amber-hex CSS (15 min)
2. **Mittlere Änderungen:**
   - FB106 D15 Hold (10 min)
   - FB107 SMS preloaded (20 min — take2_samsung.html Erweiterung)
3. **Große Änderungen:**
   - FB105 Bezier-Bogen-Animation (30 min — FFmpeg expression tuning)
   - FB108 Samsung-Browser-Frame HTML (45 min — neue Vorlage)
4. **Architektur-Erweiterung:**
   - Closing-Flow mit Dashboard-Update (60 min — Seed-Script + neue Leitsystem-Recording-Stage + Splice-Update)

**Geschätzte Gesamt-Dauer:** ~3h für v3-Komplett-Build + 1h Iteration/Testing.

---

## 22. Take 2/3/4 v4 — FB110-119 Final-Build Plan (23.04.2026)

**Status:** Founder hat 10+ Punkte als "nicht gelöst" gemeldet. Kein weiteres Feedback-Loop — alles selbst durchprüfen vor Delivery.

### 22.1 Feedback-Matrix FB110-119

| FB | Thema | Root-Cause | Action |
|----|-------|------------|--------|
| FB102/110/112/114 | Drawbox-Balken überall sichtbar | Dev-Server erzeugt Badge — drawbox versteckt nur teilweise, Issues selbst sind nicht behoben | **Prod-Build** statt Dev-Server → keine Badges. Issues als separater Task. |
| FB111 | Take 3 Loom-Bewegung linear, zu glatt | Aktuelle smoothstep x+y Animation einfach | Cubic Bezier mit 6 Control-Punkten + stückweise Geschwindigkeit (slow/fast/slow/jitter) |
| FB98 wieder | Take 2 Face Design | Face ist aktuell klein oben rechts aber überlappt Samsung-Content zu viel | Durchmesser = halbe Handyscreen-Breite, oben bündig, minimaler Puffer links zum Screen, schwarzer BG |
| FB113 | Wizard Step 3 unten abgeschnitten | Footer sticky + max-height collapse | Viewport höher auf 1080 NUR für Wizard, ODER Content top-aligned |
| FB115 | Warning Banner noch immer da | JS-Kill greift nicht 100%, CSS opacity collapse nicht genug | **URL-Param `?hide-banner=1`** in CaseDetailForm.tsx → Rendert Banner nicht aus in dieser Mode. Hardcoded fix. |
| FB116 | Handy an Zielstelle ruckelt + 2. Phone-Rein von unten rechts | Jitter läuft auch während Hold + 2. Move von rechts oben statt unten rechts | Jitter nur während Move (t<animLen), danach absolut statisch. 2. Move Start-Pos (1440, 900) Ecke unten rechts. |
| FB117 | Kein Phone-Device-Rahmen | Samsung-HTML hat keinen sichtbaren Rahmen → überall schwebt der Content | Samsung-Device-Frame PNG (rounded bezel + shadow) als FFmpeg-Overlay auf alle Phone-Teile in Take 2/3/4 |
| FB118 | D5/D15 fehlt in Gold | D15 wird kurz gezeigt aber ohne Gold-Review-Angefragt-State | Seed updated `review_sent_at=NOW()` nach Bewertung-anfragen-Click → Leitsystem re-open zeigt Gold-Badge |
| FB119 | Review-Seite flieg rein klein oben links + Link Link kaputt | Separate scene_review Cut + take4_review.html standalone statt in Samsung-Browser + HMAC kaputt | 1 einziger Phone-Clip: SMS → Click Link → Samsung-Browser-HTML mit Review drin → Senden → Success. Review full-size im Samsung-Browser. HMAC via env oder Review-Route `?preview=1` bypass mode. |
| FB-General 24h | Konsistenz 48h-Termin vs 24h-Reminder | Zuschauer: "Termin übermorgen aber Reminder heute?" | **Dezenter Tag-Indicator oben rechts** (z.B. "Mi 22.04 14:20" → "Do 23.04 09:00" → "Fr 24.04 10:30") — visuelle Time-Marker ohne Script-Change |
| Closing-Flow | Bewertung im Dashboard sichtbar | Fehlt komplett | NACH Review-Submit: Handy raus (Bogen unten rechts), Leitsystem re-open zeigt Fall in Gold (rating=5 seed-updated), Fallübersicht 2s, Loom-Grow auf Vollbild |

### 22.2 Prod-Build vs Dev-Server (Core Fix für Drawbox-Issue)

**Entscheidung:** Alle Recordings laufen gegen Prod-Build (`npm run build && npm start`), nicht `npm run dev`.

- Prod hat KEINEN Dev-Indicator
- Keine HMR-Overlays
- Keine React devtools-toasts
- Mehr stable Rendering

**Konsequenz:** Code-Änderungen brauchen Rebuild. Script-Aufwand:
```bash
cd src/web && npm run build && npm start > /tmp/nextprod.log &
# warten bis UP (~60-120s je nach bundle-size)
until curl -sf -o /dev/null http://localhost:3000/; do sleep 5; done
# dann recordings
```

Drawbox in compose_take4_final.mjs + pipeline_screenflow.mjs Take-2-Splice wird ENTFERNT.

### 22.3 Warning-Banner via URL-Param (FB115)

**Fix in CaseDetailForm.tsx:**

```tsx
// Read URL param in client-side hook
const [searchParams] = useSearchParams() ?? new URLSearchParams(location.search);
const hideBanner = searchParams.get("_hb") === "1";

// In render:
{!hideBanner && notificationWarning && (
  <div className="bg-amber-50 ...">Benachrichtigungen noch nicht versendet</div>
)}
```

**Playwright öffnet:** `/ops/cases/${caseUuid}?_hb=1` → Banner niemals gerendert.

Der `Trotzdem speichern` Button bleibt erhalten weil er ein separater Button ist (nicht Teil vom Banner). Save-Flow funktioniert.

### 22.4 Samsung-Phone-Frame (FB117)

**HTML Template `phone_device_frame.html`** (oder direkt Samsung-Bezel-PNG als Overlay):

Simpler: Samsung Galaxy S25-ähnlicher Device-Frame als PNG-Overlay mit alpha:
- Outer bezel: 15px schwarz
- Rounded corners: 45px
- Drop-shadow unten: `0 20px 40px rgba(0,0,0,0.5)`
- Notch oben (klein, oval): "punch hole" look

FFmpeg: Phone-Content (WebM) wird scaled auf inner-bezel-size (290×645 inner + 15px margins = 320×675). Dann Frame-PNG overlay drüber.

### 22.5 Phone-Hold ohne Jitter + 2. Move (FB116)

**Expression Überarbeitung:**

Move 1 (rein von oben rechts):
- u = min(t/1.0, 1)
- Während u<1: Bezier x/y + Jitter sin/cos
- Wenn u==1 (Hold): statisch X_target, Y_target — **kein Jitter**

Move 2 (rein von unten rechts für Review):
- Start = (1440, 900) — Ecke unten rechts
- Control = (1440, Y_target)
- End = (X_target, Y_target)
- x(u) = 1440 - u²·(1440-X_target)
- y(u) = 900 - u·(2-u)·(900-Y_target)  — Bezier ease-out

Move raus (Bogen zu unten rechts):
- Start = (X_target, Y_target)
- Control = (1440, Y_target)
- End = (1440, 900)
- x(u) = X_target + u²·(1440-X_target)
- y(u) = Y_target + u²·(900-Y_target)

### 22.6 Take 3 Loom cubic Bezier (FB111)

Cubic Bezier mit 4 Control-Punkten für mehr Wendungen:

- P0 = (W-w-24, 24) oben rechts
- P1 = (W-w-200, 300) links-unten davon (Wendung 1)
- P2 = (250, 150) weiter links aber höher (Wendung 2)
- P3 = (40, 350) Endpunkt

Cubic Bezier Formel:
- x(u) = (1-u)³·P0 + 3(1-u)²·u·P1 + 3(1-u)·u²·P2 + u³·P3

Plus Jitter: `+sin(t*5)*6 +cos(t*7)*4`

Dauer: 2.5s (statt 1.5s) → langsamer zu Beginn, schnell in Mitte, langsam am Ende (via easing cubic).

### 22.7 Wizard Step 3 fit (FB113)

**Fix in take3_wizard.html oder im record_wizard_take3.mjs:**

Option A: Viewport 1440×1080 nur für Wizard (Leitsystem bleibt 900).
Option B: CSS `html,body { height: auto }` + Content top-aligned statt center + kleinere font-sizes für Step 3.

Ich nehme Option A: Viewport auf 1080 → Step 3 passt, Final-Splice downscaled mit pad auf 1440×900.

### 22.8 D15 Gold-State (FB118)

**Nach "Bewertung anfragen" click:**
- Sicherstellen dass review_sent_at in DB gesetzt wird (via echten API-call oder seed-update)
- Leitsystem lazy-refresh: `router.refresh()` oder goto-refresh
- Case-Detail zeigt dann "Bewertung angefragt" in Gold-Farbe (laut existing Gold-Ring-Logic)

Alternative: Nach click → wait 3s → page.reload() → hold 3s auf reloaded state → dann Phone rein.

### 22.9 Review-Flow auf Handy (FB119)

**Re-Architektur:** Phone Day2 WebM enthält alles:

1. `take2_samsung.html` im sms-screen mit alle 3 SMS (schon drin) — 3s
2. Click auf Review-Link → direkt Navigation im SAMSUNG zu `/review/...?_bypass=1`
3. **Review-Seite im echten Browser-Chrome** (Samsung-Browser HTML wrapper)
4. 5 Sterne + 2 Chips + Senden
5. "Vielen Dank" Success

**Samsung-Browser-Wrapper HTML `take4_browser_frame.html`:**

```html
<div class="samsung-phone-frame">
  <div class="status-bar">[clock][icons]</div>
  <div class="browser-chrome">
    <div class="url-bar">🔒 flowsight.ch/r/DA-0050</div>
    <div class="tabs">[tab 2]</div>
  </div>
  <iframe class="content" src="review-inner.html"></iframe>
  <div class="browser-nav">[back][forward][+][tabs][menu]</div>
</div>
```

Review-Inner rendert Review-HTML (take4_review.html) in voller Breite.

**Review-Link fix:**
In `/review/[caseId]` Route einen Dev-Mode-Bypass einbauen:
```ts
const bypass = searchParams.get("_bypass") === "dev";
if (bypass && process.env.NODE_ENV !== "production") {
  // Skip token check
}
```

Oder: Eine separate `/review/[caseId]/preview` Route die kein Token braucht (dev-only).

### 22.10 Closing-Flow (FB119-Schluss)

**Nach Review submit:**

1. Playwright `recordReview` letztes Action: submit → success 2s.
2. Handy raus (1s Bogen zu unten rechts) — im Splice-Composite
3. **NEUE Scene 11:** Leitsystem Closing
   - Seed hat `review_sent_at` + `review_rating=5` + `review_text="Schnell & zuverlässig, Saubere Arbeit"` + `review_received_at=NOW()`
   - Playwright öffnet `/ops/cases/${caseUuid}` → Case-Detail zeigt Gold-State (5 Sterne gefüllt, Review-Text)
   - Hold 3s
4. **Scene 12:** Zurück zur Fallübersicht `/ops/cases` — zeigt DA-0050 als GOLD in Liste
   - Hold 2s
5. **Scene 13:** Loom-Grow zum Vollbild (4s)
   - FFmpeg scale-animation: Loom wächst von 200px mitte-links zu 800px centered, Opacity 1.0
   - Monitor-Content faded aus (opacity 1 → 0)

### 22.11 Tag-Indicator (FB-General 24h)

**Dezente Bar rechts oben im Monitor-Bereich:**
- Scene Akt 1: "Mittwoch 22.04. 14:20"
- Scene Phone-Tag+1: "Donnerstag 23.04. 09:00"
- Scene Akt 2: "Freitag 24.04. 10:30"
- Scene Review: "Freitag 24.04. 10:31"

Tag-Indicator als Text-Overlay via FFmpeg `drawtext`:
```
drawtext=text='Do 23.04. 09:00':x=W-tw-80:y=40:fontsize=18:fontcolor=white@0.7:box=1:boxcolor=black@0.5:boxborderw=8
```

Applied per-scene mit enable='between(t, start, end)'.

### 22.12 Reihenfolge (priorisiert)

**ROUND 1 — Infrastructure (30 min):**
- A1: Prod-Build setup
- A2: CaseDetailForm `?_hb=1` URL param
- A3: Review-Route `?_bypass=dev` fallback

**ROUND 2 — Visuals (60 min):**
- B1: Samsung-Phone-Frame PNG erstellen (via HTML→PNG)
- B2: FFmpeg overlay phone frame für Take 2/3/4
- B3: Wizard Step 3 viewport fix

**ROUND 3 — Animations (60 min):**
- C1: Phone Hold ohne Jitter
- C2: 2. Move von unten rechts
- C3: Cubic Bezier Take 3 Loom
- C4: Tag-Indicator drawtext per-scene

**ROUND 4 — Flow-Restructure (90 min):**
- D1: Phone Day2 = SMS + Click + Browser + Review + Success in einem Clip
- D2: Closing-Flow Leitsystem Case-Detail + Fallübersicht
- D3: Loom-Grow zum Vollbild

**ROUND 5 — Verify (30 min):**
- E1: Take 2 frame-by-frame check
- E2: Take 3 frame-by-frame check
- E3: Take 4 frame-by-frame check
- E4: Alle 24 QC-Points prüfen

**Total: ~4.5h**

### 22.13 Quality-Checks (alle 30 Punkte)

Muss ALLE grün sein vor Delivery:

| QC | Frage |
|----|-------|
| 1 | Prod-Build läuft, keine Dev-Badges irgendwo |
| 2 | Kein drawbox-Navy-Block sichtbar |
| 3 | Kein gelbes Warning-Banner irgendwo |
| 4 | Take 2 Face: oben rechts Kreis, halbe Handy-Breite, bündig |
| 5 | Take 3 Wizard Step 3 voll sichtbar unten |
| 6 | Take 3 Face Animation cubic Bezier mit 3+ Richtungswechseln |
| 7 | Take 4 Handy hold ohne Jitter an Zielstelle 6s |
| 8 | Take 4 2. Move von unten rechts (nicht oben rechts) |
| 9 | Phone-Device-Frame sichtbar in Take 2/3/4 konsistent |
| 10 | D15 Gold-State: Sterne + "Bewertung angefragt" grün/gold |
| 11 | Review bleibt auf Handy-Screen (kein Cut) |
| 12 | Review-Seite groß und im Samsung-Browser-Frame |
| 13 | Review-Link funktioniert (kein "Link ungültig") |
| 14 | Closing: Bewertung auf Dashboard sichtbar, Fall als Gold |
| 15 | Fallübersicht am Ende |
| 16 | Loom-Grow zum Vollbild |
| 17 | Tag-Indicator zeigt Datum je Scene |
| 18-30 | bisherige QC aus §18/§19/§21 |

---

## §23 Day 23 EOD — Take 2/3/4 Delivery (2026-04-22)

### Status nach FB110-119 Runde

| # | FB-Punkt | Status | Evidence |
|---|----------|--------|----------|
| QC1 | Prod-Build, keine Dev-Badges | ✅ | `npm run build && npm start` läuft, Badges weg |
| QC2 | Kein drawbox Navy-Block | ✅ | `compose_take4_final.mjs` drawbox entfernt |
| QC3 | Kein Warning-Banner | ✅ | `CaseDetailForm.tsx` `?_hb=1` URL-param |
| QC4 | Take 2 Face: oben rechts, halbe Handy-Breite | ✅ | 200px Kreis auf 412px Screen, pos (W-w-10, 36) |
| QC5 | Wizard Step 3 voll sichtbar (Meldung absenden + Footer) | ✅ | `record_wizard_take3.mjs` scroll 400px vor Submit |
| QC6 | Take 3 Loom 3+ Richtungswechsel, variable Speed | ✅ | 6-Segment-Animation TR→BR→BL→ML mit 0.7s/1.0s/1.5s easing |
| QC7 | Take 4 Phone Hold ohne Jitter | ✅ | Bezier-Animation endet statisch an Target |
| QC8 | Take 4 2. Move von UNTEN rechts | ✅ | `from: "bottomright"` Bezier |
| QC9 | Phone-Device-Frame Take 2/3/4 konsistent | ✅ | `renderPhoneBezel` PNG overlay in allen Composites |
| QC10 | D15 Gold-State (Sterne + "Bewertung angefragt") | ✅ | Closing Case-Detail zeigt Gold-Sterne im Verlauf |
| QC11 | Review bleibt auf Handy-Screen | ✅ | Review als Phone-PiP in Take 4 |
| QC12 | Review im Samsung-Browser-Frame | ✅ | `take4_review.html` hat Tab-Strip + URL-Bar + Bottom-Toolbar + Nav-Pill |
| QC13 | Review-Link funktioniert | ✅ | URL-Bar zeigt `flowsight.ch/r/bewertung` (statisches HTML, kein 404) |
| QC14 | Closing: Fall als Gold auf Dashboard | ✅ | Case-Detail Closing-Scene mit `review_received_at` + `review_rating=5` |
| QC15 | Fallübersicht am Ende | ✅ | Closing Part 8 navigiert zu `/ops/cases` |
| QC16 | Loom-Grow zum Vollbild | ⚠️ DEFERRED | Polish-Item, Take 4 endet statisch mit 200px Loom an (40, 350) |
| QC17 | Tag-Indicator je Scene | ⚠️ DEFERRED | Polish-Item via FFmpeg drawtext |

### Deliverables (Day 23 EOD)

- `docs/gtm/pipeline/06_video_production/screenflows/doerfler-ag/take2_with_loom.mp4` (2.5 MB, 93.5s)
- `docs/gtm/pipeline/06_video_production/screenflows/doerfler-ag/take3_with_loom.mp4` (1.8 MB, 61.2s)
- `docs/gtm/pipeline/06_video_production/screenflows/doerfler-ag/take4_with_loom.mp4` (2.2 MB, 71.9s)

### Noch offen (Polish, separate Session)

1. **Loom-Grow Take 4 Ende:** Letzte 3s Loom-Kreis wächst von 200px zu ~600px centered (benötigt dynamic-mask filter oder concat mit pre-rendered zoom-clip)
2. **Tag-Indicator:** drawtext per Scene (Mi 22.04., Do 23.04., Fr 24.04.) — geometrischer Zeitanker
3. **24h/48h Reminder-Konsistenz:** Visueller Zeit-Tag an allen SMS zeigt Differenz explizit

---

## §24 Demo-Time-Architektur (Day 23)

### Zweck

Pipeline-Screens müssen eine konsistente, realistische Zeit-Erzählung haben — über alle Takes hinweg. Der Zuschauer soll das Gefühl haben: "Das passiert JETZT, am aktuellen Werktag, mit einem Termin für MORGEN". Lösung: zentrale Zeit-Quelle + Werktag-Gate + compressed Timeline.

### Script: `scripts/_ops/pipeline/demo_time.mjs`

Einzige Wahrheitsquelle für alle Pipeline-Zeiten. Liefert:

- **`getNow()`** — heute 08:04 Uhr (Case-Erstellungs-Moment). Fest auf 08:04 kompressiert, damit Lisa-Anruf + Case-Erstellung zur Büro-Öffnungszeit passt.
- **`getTerminSlot()`** — morgen 08:00-10:00 (erster Werktag-Slot nach heute).
- **`getReminderTime()`** — 24h vor Termin (heute 08:00, passend zur Case-Erstellungs-Geschichte).
- **`getReviewTime()`** — morgen 10:30 (30 Min nach Termin-Ende).

### Werktag-Gate (CH-Feiertage)

`demo_time.mjs` enthält Schweizer Feiertags-Kalender (Zürich-inklusiv: Neujahr, Berchtoldstag, Karfreitag, Ostermontag, Tag der Arbeit, Auffahrt, Pfingstmontag, Nationalfeiertag, Weihnachten, Stephanstag). 

Logik:
- Fällt `today` auf Sa/So/Feiertag → rollt auf nächsten Werktag.
- Fällt `terminTag` (= morgen) auf Sa/So/Feiertag → rollt weiter.
- Pipeline zeigt NIEMALS einen Wochenend-/Feiertag-Fall.

### Compressed Timeline

```
heute 08:04    → Case erstellt (Lisa-Anruf / Wizard)
heute 08:04    → Case-Detail in Leitsystem
heute 08:05    → Termin zuweisen (Akt1 Take 4)
morgen 08:00   → Reminder-SMS (Phone1 Take 4)
morgen 08:00   → Termin-Start
morgen 10:00   → Termin-Ende
morgen 10:02   → Case auf Erledigt (Akt2 D15 Take 4)
morgen 10:05   → Review-SMS (Phone2 Take 4)
morgen 10:30   → Review abgegeben (Closing Gold)
```

### Verlauf-Events DB-Patching

Nach Seed: Pipeline patcht `case_events` auf demo_time-Achse, damit Timeline-Anzeige im Leitsystem (Falldetail-Verlauf) zur gerenderten Szene passt. Ohne Patch würden Events zur Wall-Clock-Zeit des Seed-Runs stehen — das würde im Video auffallen.

---

## §25 DEMO_NO_DISPATCH env-Flag (Day 23)

### Zweck

Pipeline-Runs dürfen NIEMALS echte SMS (eCall) oder Mails (Resend) versenden. Kunden-Geld + Provider-Rate-Limits + Compliance.

### Mechanik

Env-Variable `DEMO_NO_DISPATCH=1` wird von Pipeline-Entry-Scripts gesetzt. Betroffene Endpoints:

| Endpoint | Verhalten bei DEMO_NO_DISPATCH=1 |
|----------|-----------------------------------|
| `POST /api/cases` (Wizard/Voice) | Skip Resend Ops-Notification + Melder-Bestätigung. DB-Case wird angelegt, case_events "email_sent" mit `dispatched=false`. |
| `POST /api/review-requests` | Skip eCall SMS + Resend Mail. DB-Eintrag review_requests mit `dispatched=false`. |
| `POST /api/cases/[id]/sms-reminder` | Skip eCall SMS. DB-Event "sms_sent" markiert. |
| `POST /api/cases/[id]/review/send` | Skip eCall SMS. DB-Event markiert. |

### Was trotzdem passiert

- **UI-Toasts werden gerendert** (Windows-Toast Navy+Gold) — für Screen-Aufnahme essenziell.
- **DB-Events werden geschrieben** — für Timeline-Anzeige + Gold-Status im Leitsystem.
- **Case-Status-Übergänge laufen** (new → scheduled → in_progress → done → review).

### Guard-Pattern im Code

```js
const noDispatch = process.env.DEMO_NO_DISPATCH === "1";
if (!noDispatch) {
  await sendSMS(...);
  await sendEmail(...);
}
// DB-Events + UI-State immer
```

---

## §26 Take 4 Feature-Set (Final, Day 23)

Take 4 ist der längste + komplexeste Take — er zeigt den gesamten Fall-Lifecycle von Termin-Versand bis Google-Bewertung. Gebaut als 7-teiliger Composite.

### Szenen-Flow

| # | Scene | Ort | Was passiert |
|---|-------|-----|--------------|
| 1 | Akt1 Termin versenden | Leitsystem Case-Detail (Desktop) | Admin klickt "Termin versenden", Toast confirmed "SMS an Kunde verschickt" (DEMO_NO_DISPATCH: kein echtes eCall) |
| 2 | Phone1 Reminder | Samsung Lock-Screen + Notification | 24h vor Termin: Reminder-SMS "Morgen 08:00 kommt Dörfler AG" tenant-branded |
| 3 | Akt2 D15 | Leitsystem Case-Detail (Desktop) | Termin erledigt, Status → done, "Bewertung anfragen" Button klickt. Toast: "Bewertungsanfrage verschickt" |
| 4 | Phone2 SMS | Samsung Lock-Screen + Notification | Review-SMS "Wie war unser Service? [Bewertungs-Link]" |
| 5 | Review Mobile Redesigned | Samsung-Browser-Frame mit Tab-Strip + URL-Bar (`flowsight.ch/r/bewertung`) | High-end Review-Surface: 4 Chips + Freitextfeld, 5-Sterne-Animation |
| 6 | Closing Gold | Leitsystem Case-Detail (Desktop) | Case jetzt mit Gold-Sternen + `review_received_at` + Rating=5. Verlauf zeigt alle Events chronologisch |
| 7 | Windows-Toast | Desktop-Bottomright | Tenant-branded Toast (Navy+Gold): "Neue Bewertung: ⭐⭐⭐⭐⭐ Dörfler AG" |

### Scripts

- **`scripts/_ops/pipeline/record_take4.mjs`** — Einzel-Scene-Renderer.
- **`scripts/_ops/pipeline/compose_take4_final.mjs`** — Composite der 7 Szenen + FFmpeg-Concat + Loom-PiP-Overlay.
- **`scripts/_ops/pipeline/insert_take4_lifecycle.mjs`** — Patcht DB-State vor jeder Szene (Case-Status, Events, Review-Record).

---

## §27 Sidebar-Profile-Overlay + Phone-Platter-Backstop + Content-Mask-Fixes (Day 23)

### Sidebar-Profile-Overlay (`renderSidebarProfile.mjs`)

- Im Leitsystem (Desktop): Sidebar-Unterkante zeigt Avatar + Name + Rolle (Admin-Mitarbeiter der Pipeline-Config).
- Overlay wird als PNG pro Tenant gerendert (Brand-Color, Gold-Ring um Avatar).
- Verhindert dass generisches "Admin" oder fremde User-Daten auf dem Screen stehen.

### Phone-Platter-Backstop (`renderPhoneBezel.mjs` → `ensurePhonePlatter`)

- Problem: Samsung-Bezel hat runde Corner-Radii. Beim Compositing zeigt sich an Corners manchmal weisser Bleed/Flash vom Browser-Background.
- Lösung: `ensurePhonePlatter` rendert einen Navy-Platter (full-bleed Rechteck in Brand-Dark) UNTER den Bezel. Corner-Radii cutten sauber gegen den dunklen Platter, nicht gegen Browser-Weiss.
- Resultat: Saubere Bezel-Ecken in allen Takes.

### Content-Mask-Fixes (`ensureContentMask`)

- Phone-Screen-Content muss exakt innerhalb der Bezel-Innenkante sitzen (kein Pixel-Bleed über Bezel-Rahmen).
- `ensureContentMask` rendert ein Alpha-Mask-Overlay (rounded-corner Clip-Path) über den HTML-Content BEVOR der Bezel drüberkommt.
- Robust gegen Viewport-Drift (412×915 Android-Standard).

---

## §28 Quality-Gates-Framework (Day 23)

Vor jedem Take-Run müssen folgende Gates grün sein. Geplantes Automations-Script: `scripts/_ops/pipeline/dry_run_qg.mjs` (Bau: 24.04.).

### Pre-Flight (vor jedem Take)

1. `tenant_config.json` valide + alle Pflichtfelder
2. Supabase Tenant existiert + Brand-Color gesetzt
3. Admin-User `app_metadata.role=admin` + `tenant_id` gesetzt
4. Seed-Cases existieren + `_seed_time` stimmt mit demo_time überein
5. `DEMO_NO_DISPATCH=1` gesetzt
6. CH-Feiertag-Check: heute + morgen sind Werktage

### Take 2 Quality-Gates (Voice Call)

1. Samsung-HTML rendert Tenant-Name korrekt (Word-Wrap bei langen Namen)
2. Status-Bar PNG-Overlay vorhanden
3. `display_phone` = `+41 44 505 74 21` überall
4. Notfall-Case Branchen-Map korrekt (Sanitär → Boiler/Rohrbruch)
5. Reveal-Overlay Brand-Color
6. Leitsystem-Aufnahme zeigt Case-Detail korrekt verlinkt
7. FFmpeg vstack + concat lief ohne Fehler

### Take 3 Quality-Gates (Wizard)

1. Wizard Step 1-3 alle renderbar
2. Step 3 scrollt vor Submit (Button + Footer sichtbar)
3. Tenant-Brand-Color auf allen Buttons
4. Kategorien matchen tenant_config.json
5. Success-Screen + Photo-Upload-Area
6. Leitsystem zeigt neuen Case innerhalb 5s (Auto-Refresh)

### Take 4 Quality-Gates (Lifecycle)

1. Alle 7 Szenen renderbar (§26)
2. Termin-Slot = nächster Werktag 08:00-10:00
3. Reminder-SMS-Notification shows tenant name + Zeit
4. Review-URL in Browser-Frame = `flowsight.ch/r/bewertung` (kein 404)
5. Closing Case zeigt Gold-Sterne + Rating=5
6. Windows-Toast Navy+Gold tenant-branded
7. Verlauf-Events chronologisch korrekt (demo_time-gepatcht)

### Composite Quality-Gates (nach FFmpeg)

1. Output-MP4 vorhanden in `screenflows/<slug>/takeN_with_loom.mp4`
2. Dauer ≥ Soll-Länge (Take 2 ≥90s, Take 3 ≥60s, Take 4 ≥70s)
3. Audio-Track vorhanden + -14 LUFS
4. Loom-PiP visible in erwarteter Position
5. Keine schwarzen Frames (Reveal-Overlay zwischen Splices)

### Cross-Tenant Quality-Gates (nach Dry-Run)

1. Alle Betriebe nutzen SELBEN Pipeline-Code (keine tenant-spezifischen Hacks)
2. tenant_config.json ist EINZIGE Quelle für Personalisierung
3. Audio-Mastering-Parameter identisch (dynaudnorm + loudnorm)
4. Video-Auflösungen identisch (1280×1920 Output)
5. Brand-Colors korrekt pro Betrieb (visueller Diff)
6. Keine Datenlecks (Betrieb A sieht nicht Daten von Betrieb B)

---

## §29 3-Betrieb-Dry-Run Plan (24.04.2026)

### Zweck

Beweisen dass Pipeline reproducibly über mehrere Betriebe funktioniert. Nach Dörfler AG (Master) nun Lens AG + Wälti + Stark durch komplette Pipeline.

### Reihenfolge

```
PHASE A: Take 2 × 3 Betriebe SEQUENTIAL
├── Lens AG      → Take 2 produce + QG
├── Wälti & Sohn → Take 2 produce + QG
└── Stark HT     → Take 2 produce + QG

PHASE B: Take 3+4 Lens AG SOLO (Masterprobe)
├── Lens AG Take 3 + QG
└── Lens AG Take 4 + QG
  → Wenn alle Gates grün: Phase C

PHASE C: Take 3+4 Dörfler + Wälti + Stark PARALLEL
├── Dörfler AG Take 3+4 (Regression)
├── Wälti       Take 3+4
└── Stark       Take 3+4
```

### Warum diese Reihenfolge

- **Take 2 sequential:** Screen-Recording mit Playwright kann nicht parallel auf demselben Host laufen (Viewport-Konflikt). Deshalb 3×seriell.
- **Lens AG solo Take 3+4:** Erster zweiter Betrieb durch die neuen Takes. Wenn hier Bugs → einmal fixen, dann parallel.
- **Dörfler Regression:** Prüft dass Dörfler AG nach Dry-Run noch identische Outputs liefert (keine Regressionen durch Bugfixes).
- **Wälti + Stark parallel:** Nach Lens AG Beweis dass Pipeline stabil ist, können parallel laufen.

### Quality-Check-Automation

`scripts/_ops/pipeline/dry_run_qg.mjs` wird parallel zu Phase A gebaut. Ablauf:

```
dry_run_qg.mjs --slug <slug> --take <2|3|4>
→ Pre-Flight Gates
→ Post-Run Gates (Take-spezifisch)
→ Composite Gates
→ Exit 0 / Exit 1
```

Alle 3 Betriebe × 3 Takes = 9 QG-Runs. Bei Exit 1 wird Pipeline-Run abgebrochen und Finding dokumentiert.

### Erwartete Outputs (24.04. EOD)

```
docs/gtm/pipeline/06_video_production/screenflows/
├── doerfler-ag/   take2/3/4_with_loom.mp4  (Regression)
├── lens-ag/       take2/3/4_with_loom.mp4  (NEU)
├── waelti-sohn/   take2/3/4_with_loom.mp4  (NEU)
└── stark-ht/      take2/3/4_with_loom.mp4  (NEU)
```

Zusätzlich: QG-Report pro Betrieb (JSON mit Pass/Fail je Gate).

### Erfolgskriterium

Alle 4 Betriebe × 3 Takes = 12 Videos mit allen Quality-Gates grün. Pipeline ist dann reproducibly + skalierbar + bereit für Phase 3 (Outreach).

---

## §30 Pipeline-Skalierung für 10/Tag (23.04.2026, Day 23 EOD)

### Zweck

Nach Dörfler AG Master-Fertigstellung und 3-Betrieb-Dry-Run (§29) heben vier Refactor-Bausteine (S1–S4) die Pipeline von Einzel-Tenant-Betrieb auf 10 Tenants/Tag. Kern-Prinzipien: (a) kein Rebuild pro Tenant, (b) kein redundantes Asset-Rendering, (c) batch-parallele Takes, (d) regelbarer Dev-Speedup.

### S1 — Customer-Registry-Fallback

**Problem:** Jeder neue Tenant brauchte bisher eine explizite TS-Datei unter `src/web/src/lib/customers/<slug>.ts`, sonst fehlte er in `generateStaticParams()` → Next.js Rebuild nötig.

**Lösung:** `src/web/src/lib/customers/fallback.ts` + Update an `registry.ts`. Tenants ohne explizite TS-Datei werden automatisch aus `docs/customers/<slug>/tenant_config.json` als minimale `CustomerSite` geladen. `generateStaticParams()` liest nun union aus explizitem Registry + allen tenant_configs → jeder neue Tenant ist sofort verfügbar ohne Rebuild.

**Neue Funktionen:**
- `buildCustomerFromConfig(slug)` — liest tenant_config.json, mappt auf `CustomerSite`-Shape mit Defaults
- `listConfigSlugs()` — listet alle Slugs aus `docs/customers/*/tenant_config.json`

**Nutzung:** transparent — kein API-Aufruf nötig, greift automatisch wenn Slug in explizitem Registry fehlt.

### S2 — Asset-Cache global shared

**Problem:** Pro Tenant wurden bisher ~8 Standard-Assets (bezel, circle-masks, content-mask, samsung-nav, sidebar-profile, status-bar-review) neu gerendert. ~5-10s Overhead pro Tenant.

**Lösung:** `scripts/_ops/_lib/shared_assets.mjs`. Alle tenant-unabhängigen Assets werden EINMAL in `docs/gtm/pipeline/06_video_production/screenflows/_shared/` generiert und von allen Recordings referenziert.

**Geteilte Assets:**
- bezel.png
- circle-mask-{170,200,260,300}.png
- content-mask-r46.png
- samsung-nav.png
- sidebar-profile.png
- status-bar-review.png

**Tenant-spezifisch bleiben:** `windows_toast_<slug>.png` (Tenant-Name im Toast), alle Recording-Outputs (`take<N>_*.mp4`).

**API:** `ensureAllSharedAssets()` — idempotent, prüft Existenz, rendert nur fehlende. Einsparung ~5-10s pro Tenant.

### S3 — Multi-Tenant Pipeline Runner

**Problem:** Bisher musste pro Tenant `pipeline_screenflow.mjs` + `record_take4.mjs` + QG einzeln gestartet werden. Keine Parallelität, keine Summary.

**Lösung:** `scripts/_ops/run_pipeline_multi.mjs` — Orchestrator für Multi-Tenant-Runs.

**CLI:**
```
node scripts/_ops/run_pipeline_multi.mjs \
  --slugs=leins-ag,waelti-sohn-ag,stark-haustechnik \
  --takes=all \
  --parallel=2 \
  --speed=normal \
  --qg=true
```

**Flags:**
- `--slugs=a,b,c` — Kommagetrennte Slug-Liste
- `--takes=2,3,4` oder `--takes=all` — welche Takes gefahren werden
- `--parallel=N` — wie viele Tenants pro Take gleichzeitig (Default: 2)
- `--speed=fast|normal|demo` — durchgereicht an record_take4.mjs (§S4)
- `--qg=true|false` — Auto-Quality-Gate nach jedem Take (Default: true)

**Ablauf:**
1. Shared-Assets einmal upfront generiert (`ensureAllSharedAssets()`)
2. Pro Take: Batch-Parallel Tenants (Take 2 seriell empfohlen wegen Viewport-Konflikt, Take 3+4 parallel)
3. Nach jedem Take: QG läuft automatisch, Fail → Abbruch für Tenant
4. Summary-Report am Ende: PASS/FAIL je Tenant + Take, inkl. Zeitangaben

**Skalierung:** Mit `parallel=2` schaffen wir 10 Tenants in ~15-20 Min (bei Take-Zeiten Take 2 ~60s, Take 3 ~90s, Take 4 ~150s, total ~5min/Tenant).

### S4 — Speed-Flag in record_take4.mjs

**Problem:** `record_take4.mjs` hatte hardcoded `page.waitForTimeout()` calls (für UI-Beats, Toast-Display, Animation-Settle). Dev-Iteration langsam, Demo-Runs zu schnell.

**Lösung:** Neue CLI-Flag `--speed=fast|normal|demo` (Default: `normal`) + `w(ms)`-Helper, der den SPEED-Multiplikator auf alle Wait-Calls anwendet.

**Multiplikator-Tabelle:**
```
fast   → 0.5x  (Dev-Runs, ~30s schneller)
normal → 1.0x  (Prod-Runs, unverändert)
demo   → 1.3x  (langsamer für Live-Demos)
```

**Implementation:**
```js
const SPEED = { fast: 0.5, normal: 1.0, demo: 1.3 }[argv.speed || 'normal'];
const w = (ms) => page.waitForTimeout(ms * SPEED);
// Aufrufe: await w(800) statt await page.waitForTimeout(800)
```

**Wichtig:** Prod-Runs laufen mit `--speed=normal` weiter exakt wie vorher. Nur Dev-Iterationen und Demo-Präsentationen profitieren.

### Nutzungsbeispiele

**Einzel-Tenant-Dev-Run (schnell, ohne QG):**
```
node scripts/_ops/run_pipeline_multi.mjs \
  --slugs=leins-ag --takes=4 --speed=fast --qg=false
```

**Voller Dry-Run 3 Betriebe:**
```
node scripts/_ops/run_pipeline_multi.mjs \
  --slugs=leins-ag,waelti-sohn-ag,stark-haustechnik \
  --takes=all --parallel=2 --qg=true
```

**10-Tenant-Skalierung (Produktion):**
```
node scripts/_ops/run_pipeline_multi.mjs \
  --slugs=t1,t2,t3,t4,t5,t6,t7,t8,t9,t10 \
  --takes=all --parallel=2 --speed=normal --qg=true
```

### Dry-Run-Proof (Day 23 EOD)

- **Betriebe:** Leins AG, Wälti & Sohn AG, Stark Haustechnik — alle durch Take 2+3+4
- **Quality-Gates:** 35/35 PASS pro Tenant
- **Dörfler AG (Master):** alle Takes final (Regression OK)
- **Pipeline-Zeiten:** Take 2 ~60s, Take 3 ~90s, Take 4 ~150s, total ~5min pro Tenant
- **Hochrechnung:** 10 Tenants mit `parallel=2` in ~15-20 Minuten

### Founder-Review-Vermerk

**WICHTIG:** Nächster Schritt ist Founder-Review. Founder schaut Take 1-4 für ALLE 4 Betriebe (Dörfler + Leins + Wälti + Stark) komplett durch und gibt finalen Feedback-Loop. Parallel dazu ist Audio+Voice-Layer eine Founder-Aufgabe (Lisa-TTS, Master-Audio-Segmente, STS-Swap). Erst nach grünem Founder-Go geht die Pipeline in die 10/Tag-Skalierung.

### Referenzen

- `src/web/src/lib/customers/fallback.ts` — S1 Fallback-Loader
- `src/web/src/lib/customers/registry.ts` — S1 generateStaticParams Union
- `scripts/_ops/_lib/shared_assets.mjs` — S2 Shared-Asset-Cache
- `scripts/_ops/run_pipeline_multi.mjs` — S3 Multi-Tenant Runner
- `scripts/_ops/pipeline/record_take4.mjs` — S4 Speed-Flag
- Zielarchitektur D95 — Pipeline-Skalierungs-Architektur (Entscheidungs-Eintrag)

---

## §31 Take 4 Review Round-3 Learnings — FB32/FB34/FB37 (23.04.2026 EOD)

**Kontext:** Leins AG Review-Round-3. Drei kritische Fixes im Take-4-Review-Flow,
die sich pipeline-weit replizieren müssen.

### FB32 — Samsung-Style Pop-from-Link Animation (Take 4 Phone2 → Review-Splice)

**Problem:** Link-Click im SMS-Verlauf eröffnete Review mit radialer Brand-Farb-
Expansion (blaue Welle füllt Screen). Wirkte nicht wie App-Opening, fühlte sich
"plumpe" an. User-Referenz (FB33): Samsung One UI App-Open — App-Content ploppt
zentralisiert von klein auf groß.

**Lösung — `window.openReviewLink()` in `take2_samsung.html`:**
- Mini-Review-Preview-DIV mit exaktem Review-Page-Layout (grau BG + 4px Brand-Bar
  + white Card + "Leins AG" + Info + 5 Sterne placeholder)
- Element ist fullscreen positioniert (412×(915-36)=879px), start transform
  `translate(startX-W/2, startY-(36+PH/2)) scale(0.12)` → ploppt bei Link-Position klein
- Target-Transform: `translate(0,0) scale(1)` mit Samsung One UI Easing
  `cubic-bezier(0.2, 0.9, 0.1, 1)` über 560ms → wächst zentral auf fullscreen
- Status-Bar (obere 36px) bleibt FREI (preview sitzt bei top:36px) damit Phone2-
  Ende und Review-Start beide Samsung-Statusbar zeigen
- Tap-Ring-Pulse 240ms auf Link-Position vor Pop startet

**Skalierung:** Animation ist generisch über `CONFIG.firma` + `--brand-color` CSS-Var.
Funktioniert automatisch für jeden Tenant.

### FB34 — Review-Layout matcht FB35-Referenz

**Problem:** Review-Page zu tight gegen Status-Bar. User wollte mehr grauen
Abstand oben, subtile Brand-Linie, mehr Whitespace vor "Leins AG".

**Lösung — `record_take4.mjs` CSS-Injection in recordReview:**
```css
html, body {
  padding: 0 !important;
  margin: 0 !important;
  background: #f3f4f6 !important;  /* matcht bg-gray-100 → uniform Grey unter Statusbar */
}
.min-h-dvh.bg-gray-100 { padding-top: 140px !important; box-sizing: border-box !important; }
.h-1\.5 { height: 4px !important; }      /* Brand-Bar subtil (FB35) */
.pt-6 { padding-top: 60px !important; }   /* Whitespace vor Leins AG */
```

**Timing-Pattern für React-Hydration:**
- `addInitScript` + `setInterval(inject, 30)` — greift bei React-Hydration zu spät,
  erste ~2s Webm zeigen un-padded State
- Fix: `await page.waitForSelector(".min-h-dvh.bg-gray-100")` + sofort `page.evaluate()`
  mit inline-style `setProperty("padding-top", "140px", "important")` + `setInterval(apply, 40)`
- Grey-Overlay `#f3f4f6` z=99999 opacity=1, fadet nach 1800ms hold → 500ms fade-out.
  Überdeckt Hydration-Flash ohne Color-Shift (matches bg-gray-100)

### FB37 — KRITISCH: Dual-.min-h-dvh-Selector-Falle

**Problem:** `ReviewSurfaceClient.tsx` hat ZWEI Elemente mit class `min-h-dvh`:
- Outer: `<div className="min-h-dvh bg-gray-100">` (grey container)
- Inner: `<div className="mx-auto flex min-h-dvh ... bg-white">` (white card)

CSS-Selector `.min-h-dvh { padding-top: 140px }` matcht BEIDE → Padding wird verdoppelt
(140 outer + 140 inner + 4 brand-bar + 60 pt-6 = **344px** vor "Leins AG").

**Lösung — IMMER class-combo-Selector für outer-only targeting:**
```js
document.querySelectorAll(".min-h-dvh.bg-gray-100")  // outer only
// NICHT: document.querySelectorAll(".min-h-dvh")
```

Zusätzlich: Inner-Element explizit auf `padding-top: 0` reset zur Sicherheit:
```js
document.querySelectorAll(".min-h-dvh.bg-white").forEach((inner) => {
  inner.style.setProperty("padding-top", "0", "important");
});
```

**Regel für Pipeline:** Bei jedem Tailwind-Selector-Hack in CSS-Injection →
PRÜFEN ob Klasse mehrfach im DOM vorkommt. Wenn ja, via zweite Klasse
disambiguieren (hier: bg-gray-100 vs bg-white).

### FB36/FB37 — Phone-Screens absolut identisch alignen (Pop-Ende + Review-Start)

**Problem:** Preview-Pop endet mit Leins-AG-Layout; Review startet mit Leins-AG-Layout.
Beide müssen VERTIKAL identisch sein — sonst "springt" beim Video-Cut das Heading.

**Lösung — Cross-Layout-Invariante:**

| Layer            | Preview (Phone2 Ende)              | Review (Review-Start)              |
|------------------|------------------------------------|------------------------------------|
| Status-Bar       | Samsung sms-screen (take2.html)    | ffmpeg-overlay via overlayPhoneChrome |
| Grau-Padding     | Preview inner `padding-top: 104px` | `.min-h-dvh.bg-gray-100 padding-top: 140px` |
| Brand-Bar        | 4px @ y=140 (36 + 104)             | 4px @ y=140 (.h-1\.5)              |
| pt-6             | 60px                                | 60px                                |
| Leins AG         | y=204                               | y=204                               |

Die 36px-Asymmetrie zwischen Preview (inner 104px) und Review (inner 140px, ohne
html-Padding) kompensiert exakt den oberen Status-Bar-Bereich, den Preview FREI lässt.

### FB29 — Grey-Overlay Masking für Hydration

Ersetzt Brand-Color-Overlay durch `#f3f4f6` (matches bg-gray-100). Review-Video
startet mit opak-grauem Overlay, fadet nach 1800ms hold + 500ms → nahtloser
Splice ohne Color-Shift zum Preview-Ende.

### FB38a — Next.js 16 Dev-Badge-Kill (customElements.define Intercept)

**Problem:** `nextjs-portal` Custom Element rendert den "1 Issue" Dev-Overlay-
Badge bei manchen Tenants (Hydration-Warnings). Reines `element.remove()`
oder CSS `display: none` reicht NICHT — React/Next.js re-hydriert den Portal
schneller als das Interval firen kann. Badge taucht wieder auf.

**Lösung (definitive):** Custom-Element-Registration unterbinden BEVOR der
Portal sich registriert. `addInitScript` läuft vor jedem Page-Script:

```js
// Intercept customElements.define für ALLE nextjs-* Tags
const origDefine = customElements.define.bind(customElements);
customElements.define = function (name, ctor, options) {
  if (typeof name === "string" && name.toLowerCase().startsWith("nextjs-")) {
    return; // swallow registration → element wird nie aktiv
  }
  return origDefine(name, ctor, options);
};

// Defense-in-depth: attachShadow no-op für durchgeschlüpfte nextjs-* Elemente
const origAttach = Element.prototype.attachShadow;
Element.prototype.attachShadow = function (opts) {
  if (this.tagName && this.tagName.toLowerCase().startsWith("nextjs-")) {
    return document.createDocumentFragment(); // fake shadow root
  }
  return origAttach.call(this, opts);
};
```

Plus erweiterter Remove-Killer mit setInterval 20ms + MutationObserver:
```js
const killBadges = () => {
  document.querySelectorAll(
    'nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button], ' +
    '[data-nextjs-dialog-overlay], [data-issue-index], ' +
    'button[aria-label*="issue" i], [aria-label*="Dev Tools" i], ' +
    '[id^="nextjs-"]'
  ).forEach(el => el.remove());
};
setInterval(killBadges, 20);
new MutationObserver(killBadges).observe(document.documentElement, { childList: true, subtree: true });
```

**Warum verhält sich ein Tenant anders?** Dev-Overlay erscheint bei React-
Hydration-Mismatches. Unterschiedliche Tenant-Daten (z.B. fehlende optional-
Felder, andere Case-Count) können Hydration-Warnings triggern → Badge.
Der customElements-Intercept ist tenant-agnostisch und killt die Badge-
Infrastruktur komplett → nichts kann mehr angezeigt werden.

**Verifiziert:** Leins (kein Badge ursprünglich), Stark + Wälti (hatten
Badge) → nach FB38a alle clean.

### FB38b — Leitsystem App-Open Reveal-Overlay Smart-Gate

**Problem:** Beim App-Open-Transition (Samsung→Leitsystem) zeigt die Leitzentrale
kurz einen un-gerenderten State: leere NEU-Card, falsches Jahr (z.B. "2028" statt
"2026"). React-Hydration dauert länger als das feste 2200ms-Timeout des Reveal-
Overlays. Bei Tenants mit 49+ Cases manifest sichtbar.

**Lösung — record_leitsystem_take2.mjs `addInitScript`:**
```js
const MIN_HOLD_MS = 3500;
const MAX_HOLD_MS = 6000;
const startedAt = Date.now();
const checkReady = () => {
  const elapsed = Date.now() - startedAt;
  const systemCardExists = !!document.querySelector('svg circle[stroke-dasharray]')
    || !!document.querySelector('[class*="ring"]');
  const kpiFilled = Array.from(document.querySelectorAll('[class*="kpi"]')).some(
    el => /\d/.test(el.textContent || '')
  );
  const ready = (systemCardExists || kpiFilled) && elapsed >= MIN_HOLD_MS;
  if (ready || elapsed >= MAX_HOLD_MS) fadeOut();
  else setTimeout(checkReady, 100);
};
setTimeout(checkReady, MIN_HOLD_MS);
```

Überlay hält mindestens 3500ms, maximal 6000ms. Prüft parallel ob SystemCard-Ring
oder KPI-Zahlen gerendert sind. Fade-out wenn beide Bedingungen erfüllt.

### FB39 — Deterministische Seed-Zeiten aus demoTime

**Problem:** `hoursAgo(N)` in seed_screenflow_from_config.mjs nutzt `Date.now()`
→ recording-zeit-abhängig. Andreas Gerber "Abflussverstopfung" Case mit
`hoursAgo(7)` landet je nach Tageszeit vor oder hinter dem Wizard-Case (Heute
08:56). User erwartet stabile Sortierung: Gunnar Wende Leck auf Position 4,
Andreas Gerber darunter.

**Lösung — Seed deterministisch aus demoTime.today:**
```js
created_at: (() => {
  const d = new Date(demoTime.today.y, demoTime.today.m - 1, demoTime.today.d);
  d.setHours(7, 12, 0, 0);
  return d.toISOString();
})(),
```

Andreas jetzt IMMER "Heute 07:12" → vor Gunnar's 08:56 → sortiert darunter.
Skaliert über alle Tenants weil demoTime.today ist Pipeline-Konstante.

### FB40 — Homescreen-Wallpaper extends-to-bottom

**Problem:** `homescreen_real.jpg` enthält eingebranntes weisses Samsung-Nav-
Strip am Boden (bottom ~45px). Im Video wirkt der weisse Strip unter der
dunklen Sunset-Wallpaper künstlich — kein echtes Samsung One UI Verhalten auf
Homescreen.

**Lösung — CSS Overflow-Crop:**
```css
#homescreen .home-bg {
  height: 100%;  /* Revert zu 100%, damit baked-in Nav sichtbar */
  width: 100%;
  object-fit: cover;
}
```

Plus: Compose-Overlay für Phone1/Phone2 ENTFERNT (keine zusätzliche weisse
Nav darüber gelegt). Homescreen nutzt baked-in Samsung-Nav aus JPG (dunkler
BG + weisse Icons, natürlich integriert in Wallpaper).

### FB41 — Samsung One UI 6 authentische Nav-Icons

**Problem:** Generische gerenderte Nav-Icons (rounded-square Recent + circle
Home + chevron Back) wirken "dev-style". Real Samsung One UI 6 nutzt:
- Recent: 3 vertikale Striche (|||)
- Home: rounded-square outline (NICHT circle!)
- Back: chevron (‹)

**Lösung — SVG-Update in take2_samsung.html UND renderSamsungNav.mjs:**
```html
<!-- Recent: 3 vertical lines -->
<svg stroke-width="1.6" stroke-linecap="round">
  <line x1="7" y1="6" x2="7" y2="18"/>
  <line x1="12" y1="6" x2="12" y2="18"/>
  <line x1="17" y1="6" x2="17" y2="18"/>
</svg>

<!-- Home: rounded square rx=3.5 -->
<svg stroke-width="1.6">
  <rect x="4.5" y="4.5" width="15" height="15" rx="3.5"/>
</svg>

<!-- Back: chevron -->
<svg stroke-width="1.9" stroke-linecap="round">
  <polyline points="15 6 9 12 15 18"/>
</svg>
```

Light-Mode: `#2a2a2a` Icons auf `#fff` bg (SMS + Review). Dark-Mode für
Homescreen nicht benötigt (baked-in aus JPG).

**Cross-Screen Konsistenz:** homescreen_real.jpg baked-in Nav matcht CSS-
gerenderte Nav in sms-screen. Beim Transition homescreen→sms springt die Nav
optisch nicht mehr.

### Scaling-Impact

Alle 4 Learnings sind:
1. **Tenant-agnostisch** (nutzen nur `--brand-color` CSS-Var + `CONFIG.firma`)
2. **Idempotent** (wiederholte Anwendung = gleiches Ergebnis)
3. **Zero-Overhead** (kein Extra-Asset pro Tenant)

→ **Keine Pipeline-Code-Änderung pro Betrieb nötig** — Wälti + Stark erben Leins-
Fix automatisch, gleiche Qualität ohne Iteration.

### Verifikations-Checkliste (pro Tenant)

- [ ] Phone2 webm mid-pop (t=~4.7-5.0s) zeigt Mini-Review zentral wachsend
- [ ] Phone2 webm end (t=~6.1-6.4s) zeigt Firma-Preview mit Status-Bar oben
- [ ] Review webm @ t=0.8s schon 140px grau + thin Brand-Bar (Padding greift sofort)
- [ ] Scene-Composite: Phone2-Ende + Review-Start Firma-Heading auf identischer Y-Position
- [ ] Phone2 Homescreen (t=0.1s): Wallpaper durchgängig bis unten, baked-in dark Nav-Strip
- [ ] Phone2 SMS (t=2s): weisse Nav-Bar unten mit authentischen Samsung-One-UI-6-Icons (||| □ ‹)
- [ ] Leitsystem App-Open (Take 2, t=~35-38s): keine falsche Jahr-Dropdown, NEU-Card gefüllt
- [ ] Case-Liste Order (Take 4): Gunnar Wende Leck auf Position 4, Andreas Gerber Abflussverstopfung darunter (Heute 07:12)

---

## §32 Take 2+4 Review Round-4 Learnings — FB42/FB43/FB44/FB45 (24.04.2026)

**Kontext:** Stark-Haustechnik Round-4. Vier Polish-Probleme die sichtbar auf
allen Betrieben greifen und die "High-End"-Wahrnehmung in den ersten Sekunden
nach App-Open zerstören würden. Alle Fixes pipeline-only, kein App-Patch.

### FB42 — KPI-Layout-Shift nach App-Open (Leitsystem)

**Problem:** Nach App-Open-Animation (Samsung→Leitsystem) fadet das
Reveal-Overlay. Für ~0.5s shiften KPI-Cards (Google-Count, Gold-Sterne,
Source-Breakdown-Icons, Year-Dropdown-Width) bevor Layout stabil ist.
Der WOW-Moment der Pop-Animation verpufft durch diese Reibung.

**Root Cause:** FB38 Smart-Gate fadete sobald EINE KPI eine Ziffer enthielt.
Weitere Daten (Google-Rating aus `modules`, Quellen-Breakdown-Counts,
Period-Label "2026") wurden aber erst nach zusätzlichem Client-Fetch
geladen → Grid reflow'te.

**Lösung — Layout-Stability-Gate in `record_leitsystem_take2.mjs`:**
```js
const MIN_HOLD_MS = 4500;
const MAX_HOLD_MS = 8000;
const STABLE_FRAMES_NEEDED = 5;        // 5 × 100ms = 500ms layout-stable

const hashLayout = () => {
  const nodes = document.querySelectorAll(
    '.grid > *, [class*="flow"] button, [class*="flow"] span, ' +
    '[class*="ring"], svg circle[stroke-dasharray], h1, select'
  );
  let h = '';
  nodes.forEach((n) => {
    const r = n.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    h += Math.round(r.top) + 'x' + Math.round(r.left) + 'x' +
         Math.round(r.width) + 'x' + Math.round(r.height) + '|' +
         (n.textContent || '').slice(0, 40) + '||';
  });
  return h;
};

const checkReady = () => {
  const elapsed = performance.now() - startedAtPerf;
  const currentHash = hashLayout();
  if (currentHash === lastHash) stableFrames++;
  else { stableFrames = 0; lastHash = currentHash; }
  const layoutStable = stableFrames >= STABLE_FRAMES_NEEDED;
  const ready = systemCardExists && layoutStable && fontsReady && elapsed >= MIN_HOLD_MS;
  if (ready || elapsed >= MAX_HOLD_MS) fadeOut();
  else setTimeout(checkReady, 100);
};
```

**Warum `performance.now()` statt `Date.now()`:** FB43 pinnt `Date.now()` auf
demo-Zeit (konstanter Wert), daher wäre Elapsed-Berechnung kaputt.
`performance.now()` ist wallclock-unabhängig und stabil.

**Warum `document.fonts.ready`:** Proportionale Ziffern-Fonts shiften bei
Font-Swap. Gate wartet bis Fonts geladen sind.

**Skalierung:** Greift für JEDEN Tenant + JEDEN App-Open (Take 2+3+4
Leitsystem). Keine pro-Betrieb-Tuning nötig.

### FB43 — Greeting muss demoTime-aware sein

**Problem:** `getGreeting()` in `src/web/src/lib/ui/getGreeting.ts` nutzt
`new Date().getHours()` → Wallclock. Recording um 20:30 Abend → Greeting
"Guten Abend, Stark" — aber alle Screenflow-Szenen spielen um 08:08
(morgens). Greeting MUSS "Guten Morgen" zeigen.

**Anti-Option (verworfen):** App-Code patchen. Würde auch Live-System
betreffen, Greeting im echten Leitstand würde sich nach Demo-Zeit richten.

**Lösung — Date monkey-patch via `addInitScript` vor Page-Load:**
```js
await context.addInitScript((demoIsoArg) => {
  const FAKE_NOW = new Date(demoIsoArg).getTime();
  const OrigDate = Date;
  function FakeDate(...args) {
    if (!(this instanceof FakeDate)) return new OrigDate(FAKE_NOW).toString();
    if (args.length === 0) return Reflect.construct(OrigDate, [FAKE_NOW], FakeDate);
    return Reflect.construct(OrigDate, args, FakeDate);
  }
  FakeDate.prototype = OrigDate.prototype;
  FakeDate.now = () => FAKE_NOW;
  FakeDate.parse = OrigDate.parse;
  FakeDate.UTC = OrigDate.UTC;
  Object.setPrototypeOf(FakeDate, OrigDate);
  globalThis.Date = FakeDate;
}, demoNowIso);
```

Gepinnt wird:
- Take 2: `demoTimes.phoneLeitsystemNav` (08:08)
- Take 4: `demoTimes.terminSaveTime` (08:58) — deckt Akt1 + Akt2 ab

**Kritischer Detail:** Nur `new Date()` mit 0 args + `Date.now()` werden
gepinnt. `new Date(ISO-String)`, `new Date(ms)`, `Date.parse()`, `Date.UTC()`
bleiben unverändert. Das schützt gegen Broken-Features wie Timeline-
Rendering oder Case-Timestamps.

**Side-Effect:** Alle anderen "Jetzt"-Anzeigen (z.B. "Heute 08:12" in
Timeline) werden ebenfalls demo-aware — ist erwünscht, Demo wirkt kohärent.

### FB44 — CEO Tenant-Switcher-Dropdown in Take 4 sichtbar

**Problem:** In Take 4 Akt1/Akt2 (Sidebar-Profile-Overlay-Szene) wird der
Tenant-Switcher-Dropdown "Stark Haustechnik GmbH ▼" unter dem Sidebar-Header
sichtbar. FB62 CSS-Rule `[data-owner-only="tenant-switcher"] { display: none }`
allein greift nicht zuverlässig — React hydratet den Node trotz CSS-Regel
sichtbar in manchen Szenen (vermutlich Race zwischen CSS-Injection und
Client-Hydration beim Sidebar-Render).

**Lösung — Defense-in-Depth:**
```css
/* Verstärktes CSS in buildContext addInitScript */
[data-owner-only="tenant-switcher"],
[data-owner-only="tenant-switcher"] * {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  height: 0 !important;
  max-height: 0 !important;
  overflow: hidden !important;
  pointer-events: none !important;
  position: absolute !important;
  left: -99999px !important;
}
```

Plus aktive DOM-Removal in `aggressiveKill` Interval (80ms):
```js
document.querySelectorAll('[data-owner-only="tenant-switcher"]')
  .forEach((el) => { try { el.remove(); } catch {} });
```

Doppelschutz: CSS blendet aus bevor JS removt. JS removt für Szenen in denen
CSS (aus welchem Grund auch immer) noch nicht greift.

**App-Seite unchanged:** `TenantSwitcher.tsx` bleibt mit
`data-owner-only="tenant-switcher"` Attribut — unser einziger Marker.

### FB45/FB47 — Review-Page Initial-Render ≠ Final-Render

**Problem:** Nach Samsung-Pop-from-Link (FB32, die schön animierte Mini-
Preview) startet die Live `/review/[id]` Seite mit einem ~1-2s "Aufbau-
State" (FB45: Brand-Bar fehlt, Sterne blass, Heading-Position leicht off),
bis der Final-State (FB47: saturierte Brand-Bar oben, warm-goldene Sterne,
korrekter Whitespace) steht. Das wirkt künstlich — die Pop-Animation baut
Vertrauen auf ("High-End"), dann bricht es kurz.

**Root Cause:** `ReviewSurfaceClient.tsx` ist `"use client"`. Tailwind-
Klassen `.h-1\.5`, `.pt-6`, `.min-h-dvh.bg-gray-100` werden zwar CSS-
inject'd, aber das `setInterval(inject, 30)` plus `MutationObserver` greifen
erst nach React-Hydration. Für ~500-1800ms sieht man den Pre-Style-State.

**Lösung — Smart-Gate auf Layout-Ready statt festem Timeout:**

Grey-Overlay (`#f3f4f6` matcht `bg-gray-100`, nahtlos zum Phone2-Preview-
Ende) hält aktiv bis:

1. OUTER `.min-h-dvh.bg-gray-100` existiert MIT `padding-top >= 100px` computed
2. Brand-Bar `.h-1\.5` existiert mit `height >= 3px` bounding-rect
3. Firmen-Heading (`h1`/`h2`/`.text-xl`/`.font-bold`) hat Text-Content >= 3 Zeichen
4. MIN_HOLD 2000ms erreicht

Erst dann fadet das Overlay über 500ms aus. MAX_HOLD 5000ms als Safety-Net.

```js
const isLayoutReady = () => {
  const outer = document.querySelector('.min-h-dvh.bg-gray-100');
  if (!outer) return false;
  const pt = parseInt(getComputedStyle(outer).paddingTop, 10) || 0;
  if (pt < 100) return false;
  const brandBar = document.querySelector('.h-1\\.5');
  if (!brandBar) return false;
  if (brandBar.getBoundingClientRect().height < 3) return false;
  const heading = document.querySelector('h1, h2, .text-xl, .font-bold');
  if (!heading || (heading.textContent || '').trim().length < 3) return false;
  return true;
};
```

**Effekt:** Im Video sieht der Zuschauer nur den Final-State FB47 — der
Aufbau-State FB45 ist komplett vom Grey-Overlay maskiert. Der Übergang vom
Phone2-Preview (grau+Brand-Bar+Heading) zur Live-Seite ist visuell unsichtbar
(gleiche Farben, gleiche Brand-Bar, gleiche Heading-Y-Position).

**Skalierung:** Greift für JEDEN Tenant. Smart-Gate prüft Computed-Styles,
nicht Literal-Pixel-Werte — jeder Brand-Color + jeder Heading-Text wird
korrekt erkannt.

### Regel für alle künftigen Fixes (Pipeline-Discipline)

Wenn ein Feedback auf EINEM Betrieb auftritt, IMMER prüfen:

1. **Betroffene Betriebe:** Gilt der Fix auch für die anderen 3? (Dörfler,
   Leins, Stark, Wälti) — meist ja, dann Pipeline-Change nicht Tenant-Change.
2. **Betroffene Takes:** Gilt der Fix auch in Take 1/2/3? — meist ja.
3. **Re-Run-Radius:** Welche Tenants müssen neu gerendert werden?
4. **Bible-Update:** Neuer §-Block ODER Ergänzung in bestehendem §.
5. **Anti-Drift:** Keine hardcodierten Tenant-Namen im Fix — Selectors und
   Smart-Gates arbeiten immer Brand-/Content-agnostisch.

### Verifikations-Checkliste (Round-4, pro Tenant)

- [ ] App-Open Leitsystem (t=~0-500ms): KPI-Grid steht stabil, keine Shifts der Source-Breakdown-Icons oder Year-Dropdown-Width während Overlay fadet
- [ ] Greeting nach App-Open: "Guten Morgen, {ShortName}" (nicht "Abend" oder "Tag")
- [ ] Take 4 Akt1 + Akt2 Sidebar: KEIN Tenant-Dropdown unter Sidebar-Header sichtbar
- [ ] Review-Video @ t=0-2.5s: reiner Grau-Screen (Overlay), dann Fade zum Final-State (kein Flash des Aufbau-States mit blassen Sternen)
- [ ] Review @ t=2.5s: Brand-Bar (4px) + Firma-Heading + 5 Sterne sichtbar in finaler Farbe/Position

---

## §33 Universal Hydration Barrier — Architektur-Regel (24.04.2026)

**Kontext:** Die Pipeline rendert ein **deterministisches** Video aus einer
**non-deterministischen** React-Client-App. FB29, FB32, FB38, FB42, FB45 sind
alle Varianten desselben strukturellen Problems: React hydriert
asynchron, aber die Kamera läuft deterministisch — Mismatch = Flash/Shift
im Video. Ad-hoc-Patches pro Szene sind Band-Aids; die strukturelle Lösung
ist eine einheitliche **Hydration-Barrier-Regel**.

### Die Regel

> **Kein Frame wird im Video sichtbar, bevor die Szene visuell final ist.**

Das bedeutet: Zwischen `page.goto(appUrl)` und dem ersten sichtbaren App-Frame
sitzt IMMER eine Barrier (Full-Screen-Overlay), die aktiv prüft ob das Layout
stabil ist. Erst dann fadet die Barrier aus. Die Barrier-Farbe matcht die
vorherige Szene → nahtloser Splice ohne Color-Shift.

### Drei Barrier-Typen

| Typ | Hintergrund | Wann |
|-----|-------------|------|
| **BrandBarrier** | `brandColor` (Navy etc.) | Samsung→Leitsystem App-Open (FB32 Pop-Animation) |
| **GreyBarrier** | `#f3f4f6` (bg-gray-100) | Phone2→Review-Page Splice (matcht Pop-Ende) |
| **WhiteBarrier** | `#ffffff` | Case-Detail-Open, Einstellungen, Support |

Jede Szene entscheidet ihre Barrier-Farbe basierend auf dem visuellen
Ende der vorherigen Szene → null Flash, null Color-Shift.

### Barrier-Ready-Kriterien (konfigurierbar pro Szene)

Eine Barrier fadet aus, sobald ALLE Kriterien erfüllt sind:

1. **MIN_HOLD erreicht** — Minimum-Dauer (z.B. 2000-4500ms je Szene)
2. **Required Selectors existieren** — Szene-spezifische DOM-Elemente gerendert
3. **Layout-Hash stabil** — 5 Frames (500ms) in Folge kein BoundingRect-Diff
4. **Computed-Styles erfüllen Schwellen** — z.B. `padding-top >= 100px` auf `.bg-gray-100`
5. **`document.fonts.ready`** — Font-Swap abgeschlossen
6. **MAX_HOLD Safety-Net** — hart fadet nach max. (z.B. 8000ms)

### Zusätzliche Universal-Kontext-Patches

Jede Recording-Page bekommt VOR `page.goto()` identische Patches:

| Patch | Zweck |
|-------|-------|
| **Date-pinning** (FB43) | `Date.now()` + `new Date()` auf demo-Zeit pinnen |
| **Dev-Badge-Kill** (FB38a) | `customElements.define` + `attachShadow` intercept für `nextjs-*` Tags + aggressiver DOM-Remove |
| **Tenant-Switcher-Kill** (FB44) | CSS + DOM-Remove für `[data-owner-only="tenant-switcher"]` |
| **Push-Onboarding-Dismiss** | localStorage `ops-push-onboarding-dismissed = now` |
| **Warning-Banner-Collapse** (FB104) | "Benachrichtigungen noch nicht versendet" visuell auf 0px kollabieren |

### Geplante Library-Struktur (Folge-Refactor)

```
scripts/_ops/_lib/pipelineHydration.mjs
  exports:
    installDeterministicContext(context, {demoIso})
      — Date-pin + Dev-Kill + TenantSwitcher-Kill + Push-Dismiss
      — einzige Aufruf-Stelle am Anfang jeder Recording-Szene
    createHydrationBarrier({bg, minHold, maxHold, requiredSelectors, requiredStyles, fadeMs})
      — gibt addInitScript-String zurück
      — wird via page.addInitScript(barrier) aktiviert
```

**Nach Refactor:** `record_leitsystem_take2.mjs`, `record_take4.mjs` und
alle künftigen Recording-Scripts importieren die Lib. Pro-Szene werden nur
die spezifischen Ready-Kriterien übergeben — keine duplizierten
Overlay-Implementierungen mehr.

### Regel für jede künftige Recording-Szene

**Bevor neuer Recording-Code gemerged wird, MUSS der Author beantworten:**

1. Welche Barrier-Farbe matcht den vorherigen Frame?
2. Was sind die szene-spezifischen Ready-Kriterien (Selectors + Styles)?
3. MIN_HOLD und MAX_HOLD je nach Komplexität (leitsystem: 4500/8000, review: 2000/5000)
4. Welche Universal-Patches brauche ich (meist: alle 5 aus der Tabelle oben)?
5. **Liegt MAX_HOLD unterhalb aller nachfolgenden Playwright-Timeouts für User-Aktionen (waitForSelector / click)?** → Falls nein: Timeouts anheben ODER `force: true` auf Clicks setzen.

**Wenn diese 5 Fragen nicht beantwortet sind → kein Merge.**

### Barrier-Timeout-Regel (Round-4-Regression, 24.04.)

**Problem:** FB45 Grey-Overlay hält bis 5000ms (MAX_HOLD) + 500ms Fade. Review-
Page Star/Chip/Submit-Clicks hatten Default-Timeouts 2000-3000ms. Folge:
Clicks timeouten BEVOR Overlay fadet → Playwright-Visibility-Check schlägt
fehl → Video zeigt un-bewertete Review-Page → Take 4 unbrauchbar.

**Regel:**
> **Barrier MAX_HOLD + Fade-Dauer MUSS IMMER < Timeout aller Playwright-User-Actions auf derselben Page sein.**

**Konkrete Implementation:**
```js
// Barrier: MIN_HOLD 2000, MAX_HOLD 5000, Fade 500  → worst-case-hold 5500ms
// Alle Playwright-Actions auf dieser Page:
await page.waitForSelector(sel, { timeout: 10000 }); // > 5500
await page.locator(sel).click({ timeout: 8000, force: true }); // > 5500 + force
```

**Warum `force: true`:** Playwright's Default-Click prüft ob Element
visible + hit-testable ist. Overlay mit `opacity:1 + pointer-events:none`
ist formal durchklickbar, aber manche Playwright-Versionen schlagen
trotzdem auf Visibility-Checks Alarm. `force: true` überspringt die Checks
und verlässt sich darauf, dass die Barrier-Logik `pointer-events:none` setzt.

**Für Dispatched-Events (keine echten Playwright-Clicks):**
```js
// page.evaluate → direkter DOM-Event-Dispatch. Overlay ist irrelevant,
// JS triggert die Handler direkt. Gut für Hover-States, animation-triggers.
await page.evaluate((idx) => {
  document.querySelectorAll('...')[idx].dispatchEvent(new MouseEvent('mouseenter'));
}, i);
```

### Dritte Regel — Tenant-Specific Style-Forcing für Pre-Hydration

**Problem (Round-5 FB45):** Inline-Styles wie `style={{ backgroundColor: brandColor }}`
aus React-Props werden erst bei Client-Hydration angewendet (~1s Latenz).
Dazwischen: Element hat zwar height via CSS-Injection, aber Farbe fehlt →
visuell nicht final.

**Regel:** Wenn ein Element einen **Brand-spezifischen CSS-Value** über React-
Prop erhält (backgroundColor, color, border-color mit brand-color), dann
MUSS der Pipeline-Script diesen Value zusätzlich via `addInitScript` als
`!important` CSS injizieren — **bevor** die Page hydratet.

```js
// Brand-Color vor Hydration forcieren:
await context.addInitScript((brandColorArg) => {
  const css = document.createElement("style");
  css.id = "fs-brand-bar-forced";
  css.textContent = `.h-1\\.5 { background-color: ${brandColorArg} !important; }`;
  document.documentElement.appendChild(css);
}, brandColor);
```

**Konsequenz im Smart-Gate:** Zusätzlich zur `height >= 3px`-Prüfung nun auch
**`backgroundColor` gegen `rgba(0,0,0,0)` / `transparent` / Alpha<0.5`** prüfen:

```js
const isTransparent = (color) => {
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return true;
  const m = color.match(/^rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)$/);
  return (m && m[4] !== undefined && parseFloat(m[4]) < 0.5);
};
const brandBar = document.querySelector('.h-1\\.5');
if (isTransparent(getComputedStyle(brandBar).backgroundColor)) return false;
```

### Vierte Regel — DB-Reset als Safety-Net im Recording-Script

**Problem:** Mehrfach-Re-Runs von record_take4 ohne insert_take4_lifecycle
dazwischen → rating=5 bleibt in DB → Review-Page "Link ungültig" /
validateVerifyToken prüft rating status.

**Regel:** Jedes Recording-Script das DB-Zustand modifiziert, MUSS am Start
einen idempotenten Safety-Reset machen — unabhängig davon ob die Pipeline
es "sauber" aufruft:

```js
if (caseUuid) {
  await sb.from("cases").update({
    review_sent_at: null, review_rating: null,
    review_received_at: null, review_text: null,
    status: "neu",
  }).eq("id", caseUuid);
}
```

### Achte Regel — Direkte Page-Pop-Animation statt Replica-Overlay

**Problem (Round-15 FB60):** Replica-Overlay führt ZWANGSLÄUFIG zu einem
"zweiten Bild"-Effekt: Replica pop'nt → Replica fadet out → Real-Page wird
sichtbar → User sieht ZWEI Layouts nacheinander, auch bei perfekter Pixel-
Identität (Timing-Mismatch + Statusbar-Unterschied + Font-Hydration).

**Regel:** Bei Cross-Scene-Transitions **animiere die Real-Page selbst**.
Kein Replica-Overlay. Ein Screen, ein Pop, dann Interaktion.

**Pattern:**
```js
await context.addInitScript((popArg) => {
  // Wait for page root, then apply pop animation IN-PLACE
  const applyPop = () => {
    const root = document.querySelector(ROOT_SELECTOR);
    if (!root) return false;
    root.style.setProperty("transform-origin", "0 0", "important");
    root.style.setProperty(
      "transform",
      `translate(${centerX}px, ${centerY}px) scale(0.12)`,
      "important"
    );
    root.style.setProperty("transition", "transform 560ms cubic-bezier(0.2,0.9,0.1,1)", "important");
    requestAnimationFrame(() => {
      setTimeout(() => {
        root.style.setProperty("transform", "translate(0,0) scale(1)", "important");
        // Nach Animation: Transform entfernen für native interaction
        setTimeout(() => root.style.setProperty("transform", "none", "important"), 620);
      }, 40);
    });
    return true;
  };
  const poll = () => { if (!applyPop()) setTimeout(poll, 20); };
  poll();
  new MutationObserver(() => { if (applyPop()) this.disconnect(); })
    .observe(document.documentElement, { childList: true, subtree: true });
}, popArgs);
```

**Zusatz-Patches:** Viewport-Meta injizieren (für 1:1 Layout-Rendering) +
Grey-BG auf <html> früh setzen (kein White-Flash vor Hydration).

**Pixel-Verifikation:** Nach Pop (t≈0.6s) Card-Center soll ≈ Viewport-Center
sein. Tool: Python PIL bounding-box von White-Pixeln.

### Siebte Regel — Replica-Overlay für Cross-Scene-Transitions

**Problem (Round-7 FB48-FB54):** Bei Übergang Phone2-Pop → Review-Video
entstand ein dreifacher visueller Sprung:
1. Phone2-Ende: Mini-Review-Preview (gerendert aus take2_samsung.html)
2. Review-Video-Start: **WEISSE FLÄCHE** (Grey-Overlay ≠ Pop-Layout)
3. Review-Final: Content "rutscht von oben rein"

Root Cause: Grey-Overlay war nur eine **Farbfläche** (#f3f4f6). Das Pop-Ende
zeigte aber ein strukturiertes Layout (Brand-Bar + Heading + Info-Card +
Sterne). User merkt deutlich den Wechsel.

**Regel:** Wenn zwei Video-Szenen gespliced werden und die erste Szene
**endet mit einem strukturierten Layout** (nicht nur Farbfläche), MUSS der
Startscreen der zweiten Szene einen **Replica-Overlay** haben, der dieses
Layout 1:1 nachbaut. Während Hydration sieht der Zuschauer pixel-identisches
Layout. Erst wenn Real-Page hydriert ist, fadet der Replica-Overlay in
200ms aus → Cross-Fade ist visuell unsichtbar weil Replica ≈ Real.

**Pattern:**
```js
const replicaHtml = `<!-- Exakt dieselbe Struktur wie Szene-1-Ende -->`;

await context.addInitScript((html) => {
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;z-index:99999;" +
    "transition:opacity 200ms ease-out;pointer-events:none;";
  overlay.innerHTML = html;
  document.documentElement.appendChild(overlay);
  // Smart-Gate: fadet aus wenn Real-Layout ready
}, replicaHtml);
```

**Datum-Synchronisation:** Replica UND Szene-1-Ende UND Real-Page müssen
DENSELBEN Textinhalt zeigen. Alle drei Quellen müssen aus **gemeinsamer
Data-Source** (demoTime / tenant_config) kommen — keine hardcodierten
Werte!

**Anti-Pattern:** Grey-Overlay (nur Farbe) + "hoffen dass Hydration
schnell genug ist" = sichtbarer Flash zwischen Farbe und Final-Layout.

### Sechste Regel — API-Response-Interception statt DOM-Kampf gegen React

**Problem (Round-6 FB44):** CSS `display:none` + aggressiveKill 80ms +
MutationObserver reichten NICHT um TenantSwitcher zuverlässig zu unterdrücken.
Bei Dörfler (Admin hat Zugang zu 8 Tenants, `tenants.length >= 2`) rendert
React den Switcher schneller als unser Interval ihn removet. Folge: Dropdown
"Dörfler AG ▼" sichtbar in Sidebar-Szenen.

**Warum DOM-Kampf verliert:** React mounted den Switcher bei jeder relevanten
Re-Render-Iteration neu. Unser 80ms-aggressiveKill hat einen 80ms-Window
dazwischen wo der Switcher sichtbar bleibt. In diesem Window nimmt
Playwright Frames auf → Bug im Video.

**Sauberer Fix: Route-Interception an der Daten-Quelle.**
`TenantSwitcher.tsx` hat die Regel `if (tenants.length < 2) return null;`.
Wir beschneiden die Daten-Quelle so dass der Switcher selbst entscheidet
NICHT zu rendern:

```js
await context.route("**/api/ops/tenants", async (route) => {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify([{
      id: tenant.id, name: t.name, slug,
      color: t.brand_color, trial_status: null, is_demo: false,
    }]),
  });
});
```

**Regel:** Wenn App-Logic auf API-Response basiert, ist Route-Interception
der ELEGANTERE Fix als DOM-Manipulation. Vorteile:
- Keine Race-Condition mit React-Re-Renders
- Deterministisches Verhalten
- Kein Kampf gegen Framework-Lifecycle
- Einfach zu testen

**Gilt für alle Recording-Contexts die Admin-Auth mit Zugriff auf mehrere
Tenants nutzen** — muss in `setupLeitsystemContext()` (record_take4) +
`setupMobileContext()` (record_leitsystem_take2) eingebaut werden.

### Fünfte Regel — SMS_HMAC_SECRET als Infrastruktur-Requirement

**Problem:** `.env.local` ohne `SMS_HMAC_SECRET` → Server-Side
`validateVerifyToken` throws → Review-Page "Link ungültig" / alle
HMAC-validated URLs brechen.

**Regel:** Dev-Server-Start-Docs müssen `SMS_HMAC_SECRET` als
env-Prefix erzwingen, falls `.env.local` ihn nicht enthält:

```bash
cd src/web && DEMO_NO_DISPATCH=1 SMS_HMAC_SECRET=demo-take4-secret npm run dev
```

Permanente Lösung: Founder muss `SMS_HMAC_SECRET` dauerhaft in
`src/web/.env.local` setzen (für den Dev-Server). Production hat den Secret
via Vercel Env.

### Warum nicht App-seitig lösen?

**Frage:** Könnte man nicht `ReviewSurfaceClient.tsx` in eine Server-Component
umbauen, damit keine Hydration-Shifts mehr auftreten?

**Antwort:** Ja, teilweise. Aber:
- Live-App-Code wäre um Demo-Zwecke beeinträchtigt (Brand-Bar-Pre-Hydration
  im Live-Review ist unnötig)
- KPI-Grid (FlowBar) MUSS interaktiv sein (Period-Toggle, Dropdown) →
  Client-Component unvermeidlich
- Data-Fetches (Google-Rating, Review-Count) sind teils per Client-Fetch
  implementiert → Server-Component würde Performance drücken

**Konsequenz:** App-Code bleibt wie er ist. Die Pipeline respektiert die
App-Realität und baut die Barrier drum herum. Das ist **die saubere
Trennung** zwischen Produktentscheidungen und Video-Produktions-Pragmatik.

---

## §34 Production-Baseline Lock — 24.04.2026 🔒

**Status:** Ab 24.04.2026 ist die Pipeline für Take 2+3+4 Screenflow
**10/10 production-ready** und dient als **DAUERHAFTE Baseline** für alle
zukünftigen Betriebe (Nr. 5 bis 100+). Dieser Paragraph ist **verbindlich**
— keine Abweichung, kein Rollback, keine Regression.

### Verifikation der Baseline

Alle 4 Referenz-Betriebe haben Round-15 verifikation bestanden:
- **Dörfler AG** — Take 2+3+4 ✓ 10/10
- **Leins AG** — Take 2+3+4 ✓ 10/10
- **Stark Haustechnik GmbH** — Take 2+3+4 ✓ 10/10
- **Wälti & Sohn AG** — Take 2+3+4 ✓ 10/10 (Referenz-Betrieb Round-9 bis Round-15)

### Round-Learnings, die nicht regressieren dürfen

**Alle Round 1-15 Fixes MÜSSEN im Code verbleiben.** Jede Pipeline-Änderung
muss diese Regeln einhalten. Neue FB-Runden ergänzen, aber ersetzen nicht.

| Round | FBs | Was ist "frozen" |
|-------|-----|------------------|
| 1-6 | A1-A19, B1-B8, C1-C29, FB1-FB30 | Take 2+3+4 Feature-Set, Demo-Time, DEMO_NO_DISPATCH, Phone-Platter, Sidebar-Profile, Samsung-Chrome |
| 3 | FB32/34/37/38a/38b/39/40/41 | Samsung-Pop-Animation, Review-Layout-Konstanten, Dual-min-h-dvh-Selector-Falle, Reveal-Overlay Smart-Gate, Samsung One UI 6 Nav-Icons |
| 4 | FB42/43/44/45/47 | KPI-Layout-Stability, Date-Patch (Greeting), Tenant-Dropdown-Kill, Review-Layout Initial=Final |
| 5 | FB45/47 10/10 | Brand-Color via CSS !important, Multi-Factor-Ready-Gate, Barrier-Timeout-Regel |
| 6 | FB44 Round-6 | /api/ops/tenants Route-Interception statt DOM-Kampf |
| 7-9 | FB48-57 | Replica-Datum aus demoTime, Pop-Animation von Phone2 nach Review-Video, Tap-Ring-Entfernung |
| 10-12 | FB58 | Content-Visual-Center-Positioning (verworfen in Round-15) |
| 14 | ROOT-CAUSE | **Viewport-Meta injizieren** (page rendert 1:1, keine 41%-Scaling-Falle) |
| **15** | **FB60 FINAL** | **Direkte Real-Page-Pop-Animation** (kein Replica, ein Screen, ein Pop) |

### Pipeline-Komponenten als Source of Truth

**Änderungen an diesen Dateien wirken auf ALLE Betriebe. Testen mit Wälti vor Merge:**

- `scripts/_ops/record_take4.mjs` — Take 4 Recording (7 Parts inkl. Review-Pop)
- `scripts/_ops/record_leitsystem_take2.mjs` — Take 2 Leitsystem (FB42+FB43 Gate)
- `scripts/_ops/pipeline_screenflow.mjs` — Orchestrator Take 2+3+4
- `scripts/_ops/compose_take4_final.mjs` — Final-Compose Phone-Bezel-Assembly
- `scripts/_ops/insert_take4_lifecycle.mjs` — DB-Setup vor Take 4
- `scripts/_ops/seed_screenflow_from_config.mjs` — Seed pro Betrieb
- `scripts/_ops/_lib/demo_time.mjs` — SSoT für alle Demo-Zeiten
- `scripts/_ops/_lib/pipelineHydration.mjs` — Universal Hydration Barrier (Round-10+)
- `scripts/_ops/_lib/renderPhoneBezel.mjs` / `renderSamsungNav.mjs` / `renderWindowsToast.mjs` / `renderSidebarProfile.mjs`
- `scripts/_ops/screen_templates/sequences/take2_samsung.html` — Samsung-Phone-Sequenz
- `docs/customers/<slug>/tenant_config.json` — SSoT pro Betrieb (keine CLI-Args!)

### Regeln für jeden neuen Betrieb (Nr. 5 bis 100+)

**So läuft ein NEUER Betrieb durch die Pipeline:**

1. **Phase 1** (Extract+Decide) — `pipeline_run.mjs --url <website>` erzeugt `tenant_config.json`
2. **Founder-Review** — `founder_review.md` prüfen, bei Bedarf `regenerate_review.mjs`
3. **Provision** — `pipeline_run.mjs --from config` legt Tenant + Voice + Seed an
4. **Phase 2** (Video-Screenflow) — `run_pipeline_multi.mjs --slugs=<slug> --takes=all --parallel=1`
5. **Quality-Gates** laufen automatisch (Post-Take-QG). Alle `[QG]` Checks müssen PASSED sein.
6. **Founder-Review** der 3 Output-Files `take2_complete.mp4`, `take3_with_loom.mp4`, `take4_with_loom.mp4`
7. **Falls OK → Outreach-Phase**. Falls neue FBs → Pipeline-Bible §34 ergänzen, Fix rollout für ALLE Betriebe.

### Anti-Drift-Commitment

Wenn ein neuer FB auftritt:
1. **Erst bei 1 Test-Betrieb fixen** (bevorzugt Wälti) bis es passt
2. **Bible-Update** in dem entsprechenden §
3. **Re-Run für die anderen 3 Referenz-Betriebe** zur Verifikation
4. **Erst dann Outreach-Pipeline** (echte Betriebe)

**Niemals:** Direkt in Outreach-Run einen Fix versuchen. Niemals: Bible-
Update überspringen. Niemals: Einem Betrieb etwas geben, das die anderen 3
nicht auch haben.

### Skalierungs-Kapazität

Mit Round-15-Baseline + `run_pipeline_multi.mjs --parallel=1`:
- **~5 Min pro Betrieb** (alle 3 Takes, inkl. QG)
- **10 Betriebe/Tag** bei seriell + manuellem Review
- **20-30 Betriebe/Tag** bei semi-automatisiert (Founder approved per Telegram)
- **100 Betriebe/Woche** erreichbar bei disziplinierter Anti-Drift

### Letzte verbindliche Regel

> Wenn ein FB auf einem Betrieb auftritt, betrifft er IMMER alle Betriebe.
> Wenn ein Fix für einen Betrieb gut ist, muss er für alle gut sein.
> Die Bible ist die EINZIGE Source of Truth für "was ist aktuell richtig".

---

## §35 Audio-Pipeline Baseline (Phase A — 2026-04-24/25 Autonomous Build)

**Status:** 🟢 Phase A komplett (Audio-Assembly 10/10). Phase B pending (Screenflow-Retiming).

### Was Phase A produziert

Für jeden Betrieb (4 Referenz-Betriebe: Dörfler, Leins, Stark, Wälti):
- Take 1 Audio: ~62s (Master.wav normalisiert)
- Take 2 Notruf Audio: ~339s (Wrap-A + Call-Notruf + C + D + E + F)
- Take 2 Preis Audio: ~335s (Wrap-A + Call-Preis + C + D + E + F)
- Take 3 Audio: ~170s (A+B+C+D+E)
- Take 4 Audio: ~152s (A+B+C+D+E)

### Architektur (von innen nach außen)

1. **Ebene Raw** — Founder-Audios liegen in `docs/gtm/pipeline/06_video_production/mini_takes/` und `master_takes/` (read-only, nie mutieren).
2. **Ebene Clean** — `scripts/_ops/audio/clean_founder_audio.mjs` → `_clean/` Mirror-Tree. Entfernt Maus-Klick (tail-trim 280ms + fade-out 60ms + silence-remove -42dB), normalisiert auf -14 LUFS two-pass.
3. **Ebene TTS** — `scripts/_ops/audio/generate_lisa_tts.mjs` → `_generated/lisa_tts/`. 9 generic Ela-Zeilen + 2 Varianten (#9 Notruf/Preis) + 1 Juniper-Zeile (Englisch) + per-Tenant Greeting. Content-addressed Cache (SHA-1 über Text) damit verschiedene Firmennamen nicht kollidieren.
4. **Ebene Call-Assembly** — `scripts/_ops/audio/assemble_call.mjs` → `_generated/calls/<tenant>/call_<variant>.wav`. 21 Turns abwechselnd Agent/User, 150ms Gap zwischen Turns, Final-Two-Pass-Loudnorm.
5. **Ebene Take-Assembly** — `scripts/_ops/audio/assemble_take2.mjs` + `assemble_take_simple.mjs` → `_generated/takes/<tenant>/take{N}.wav`. 250ms Gap zwischen Segmenten.
6. **Ebene Preview** — `scripts/_ops/audio/build_preview_video.mjs` → `_generated/previews/<tenant>/take{N}_preview.mp4` + `_generated/audio_mp3/<tenant>/take{N}.mp3`.
7. **Ebene Report** — `scripts/_ops/audio/quality_gate_report.mjs` → `_generated/QUALITY_GATE_REPORT.html` (single-file HTML mit embedded waveforms + MP3-Player + Video-Player).

### Quality Gates (pro Ebene)

**Per cleaned Founder segment:**
- Loudness I = -14 LUFS ±1.5 (tolerant für kurze Clips, two-pass loudnorm applied)
- True Peak ≤ -1.0 dBFS
- Fallback: volumedetect mean_volume wenn ebur128 wegen Clip-Länge < 3s keine Integrated-Reading liefert

**Per Lisa-TTS file:**
- Gleiche Loudness-Gates
- Zusätzlich: two-pass loudnorm nach initial mp3→wav-single-pass → Final ±1.0 LUFS

**Per Call-Assembly:**
- Duration = Summe aller Turns + 150ms × 20 Gaps ±1.5s Toleranz
- Loudness ±1.0 LUFS (strict, weil final artifact)
- Keine Clippings

**Per Take-Assembly:**
- Duration ±2s Toleranz
- Keine internen Silences ≥1.8s ("natural pause threshold")
- Loudness strict

**Gesamt:** 80/80 Gates PASS bei Baseline-Run 2026-04-25.

### Cross-Tenant-Shared vs Per-Tenant

**Shared (1× gebaut, ∞× wiederverwendet):**
- 36 cleaned Founder-Audios (5 Take-2-Wraps + 20 User-Turns + 5 Take-3-Wraps + 5 Take-4-Wraps + 1 Take-1-Master)
- 9 generic Lisa-Zeilen (Agent #2-#8, #10, #11)
- 2 variant Lisa-Zeilen (Agent #9 Notruf + #9 Preis)

**Per-Tenant (1× pro Betrieb):**
- Lisa-Greeting (Agent #1 mit `{{tenant_display_name}}`-Swap) — generiert via ElevenLabs mit Ela-Voice
- Take-Assembly (Call benutzt tenant-specific Greeting, Rest ist shared)

**Kosten-Profil pro neuem Tenant:**
- 1 ElevenLabs-TTS-Call (~6s Audio)
- 7 FFmpeg-Operations (TTS mp3→wav, 2 calls, 5 takes)
- ~30 Sekunden Laufzeit pro Tenant nach Phase-A-Baseline

### Multi-Branchen-Ready

Ordner-Struktur unterstützt `industry`-Dimension:
```
_clean/mini_takes/Take2/_tenants/<slug>/<LETTER>.wav   # optional tenant override
_clean/mini_takes/Take2/A.wav                           # generic fallback
```
Für neue Branche: neue Call-Scripts (`<branche>_notruf.txt` etc.), neue generic Lisa-Zeilen, neue Wrap-Audios. Pipeline-Scripts brauchen keine Änderung — sie lesen `tenant_config.json` für `industry`-Tag und wählen entsprechende Pfade.

### Bermuda-Dreieck (Lip-Sync-Risiko)

Lisa-Greeting-Dauer variiert pro Tenant (5.76s Leins → 6.59s Wälti, +14%). Im Face-PiP ist Lip-Sync nicht detailliert sichtbar (kleine Kachel). Entscheidung: Face-PiP visuell neutral halten (Option B3), Founder-Loom wird 1× pro Variante aufgenommen, nicht pro Tenant.

### Anti-Drift-Commitment (Audio)

Wie bei Screenflow (§34):
1. Audio-FB bei Betrieb X → erst beim Test-Betrieb (Wälti) fixen
2. Bible-§ aktualisieren
3. Re-Assembly aller 4 Referenz-Betriebe
4. Erst dann Outreach

### Bekannte Offene Punkte (Phase B)

1. **Screenflow-Retiming:** Take 2 93s → 340s, Take 3 61s → 170s, Take 4 106s → 152s. Playwright-Scripts brauchen Audio-Anchor-Config pro Satz.
2. **Take 1 Screenflow fehlt** für Leins/Stark/Wälti (nur Dörfler hat take1_complete.mp4).
3. **Founder-Review der Audio-Previews** (QG-Report.html) vor Phase-B-Start — falls Lisa-Zeilen klanglich nicht passen, nur die betreffende Zeile re-generieren (Cache-Key-Invalidierung durch Text-Edit).

---
