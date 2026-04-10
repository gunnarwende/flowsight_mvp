# Machine Manifest — Gold-Contact Proof-Capture-Maschine

**Erstellt:** 2026-03-13 | **Owner:** CC + Founder
**Version:** 2.0 — Gold-Standard Pipeline (Updated 10.04.: Voice Agent Schablone, Leitsystem Schablone, Demo-Audio-Pipeline, Seed v2, Video Self-Hosted)
**Referenz:** `docs/redesign/plan.md` (S5), `docs/architecture/contracts/prospect_manifest.md`, `docs/redesign/scaling_access.md` (Thema A)

---

## Zweck

Dieses Dokument beschreibt die **komplette Pipeline** von der Prospect-Identifikation bis zum Versand.
Es ist das Betriebshandbuch der Gold-Contact-Maschine — wer macht was, wann, mit welchem Tool, und was ist das Ergebnis.

### Was dieses Dokument ist

- End-to-End Pipeline-Definition (12 Schritte)
- Rollen-Zuordnung (CC vs. Founder vs. Automation)
- Modus-1/Modus-2-Routing pro Schritt
- Kapazitaetsmodell und regionale Staffelung

### Was dieses Dokument NICHT ist

- Keine Psychologie (-> gold_contact.md / schatztruhe_final.md)
- Kein Schema (-> prospect_manifest.md)
- Keine Szenen-Spezifikation (-> video_manifest.md)
- Keine QA-Details (-> qa_gate.md)

---

## Pipeline-Uebersicht

```
Scout → Analyse → Modul-Entscheid → Provisionieren → Produzieren →
Proof-Capture → Narration (Founder Batch) → Assembly → QA → Versand →
Follow-up → Learning Loop
```

### Modus-Routing

| Schritt | Modus 1 (Full) | Modus 2 (Extend) |
|---------|---------------|------------------|
| Scout | Identisch | Identisch |
| Analyse | Identisch | Identisch |
| Modul-Entscheid | → Website + Voice + Full Provisioning | → /start + Voice + Light Provisioning |
| Provisionieren | Tenant + Voice + Twilio + Website + Seed | Tenant + Voice + Twilio + /start + Seed |
| Produzieren | CustomerSite bauen (~15 Min) | Kein Website-Bau |
| Proof-Capture | /kunden/{slug} Screenshot | {website_url} Screenshot (seine echte) |
| Narration | "Ich habe fuer {legal_name} eine Website gebaut" | "{video_hook}" (aus Prospect-Daten) |
| Assembly | 150-160s (11 Szenen) | 130-140s (11 Szenen, kuerzere Intro) |
| Versand | E-Mail Link 3 = {kunden_url} | E-Mail Link 3 = {start_url} |

---

## Schritt 1: Scout

**Owner:** CC (automatisiert)
**Tool:** `scripts/_ops/scout.mjs` → `pipeline.csv`
**Input:** Region + Gewerk + Mindest-ICP
**Output:** `docs/customers/<slug>/prospect_card.json`
**Dauer:** ~30 Min fuer 20 Prospects (Batch)

### Regeln

- Nur ICP >= 7 weiter zu Analyse. ICP 6 = parked. ICP < 6 = skip.
- Goldene Regel #1: Keine erfundenen Fakten. Jede Zahl aus verifizierter Quelle.
- Mindestens 3 Datenquellen pro Prospect (Website, Verzeichnis, Review-Plattform).
- prospect_card.json muss Gate 1 bestehen (siehe prospect_manifest.md).

### Artefakte

```
docs/customers/<slug>/
  prospect_card.json     ← Scout-Output (v1.0 Felder)
  status.md              ← Angelegt mit Grunddaten
  links.md               ← Angelegt mit Website-URL
```

---

## Schritt 2: Analyse

**Owner:** CC (manuell)
**Input:** prospect_card.json + Website-Crawl
**Output:** Outreach-Block im Prospect Manifest (v2.0)
**Dauer:** ~10 Min pro Prospect

### Was wird analysiert

| Feld | Quelle | Methode |
|------|--------|---------|
| `anrede` | Team-Daten, Impressum, LinkedIn | Manuell verifiziert |
| `prospect_email` | Website, Handelsregister, LinkedIn | Manuell (nie info@) |
| `region_reference` | PLZ + Geografie | "am Zuerichsee", "im Zuercher Oberland" |
| `video_hook` | Firmengeschichte, USP | "Haustechnik seit 1912 in Thalwil" |
| `gewerke_text` | Services aus prospect_card | "Sanitaer- und Heizungsbetriebe" |
| `demo_scenario` | Gewerk + Region | Realistischer Notfall-/Service-Fall |

### Modus-Entscheid

| Kriterium | Modus 1 (Full) | Modus 2 (Extend) |
|-----------|---------------|------------------|
| Website | Keine oder schlecht | Gut, professionell |
| Beispiel | Doerfler AG (keine eigene) | Weinberger AG (julweinberger.ch) |
| Konsequenz | FlowSight baut Website | FlowSight baut /start-Seite |

---

## Schritt 3: Modul-Entscheid

**Owner:** CC + Founder (Freigabe)
**Input:** Analyse-Ergebnis + ICP-Score
**Output:** Leckerli-Paket + Tier-Zuordnung

### Leckerli-Matrix

| ICP | Tier | Paket | Bedeutung |
|-----|------|-------|-----------|
| >= 8 | HOT | A+B-Full+C+D | Video + Voice + Proof + Website/Start |
| 7 | WARM+ | B-Full+C+D | Voice + Proof + Website/Start (kein Video) |
| 6 | WARM | B-Full+D | Voice + Website/Start (kein Proof-Capture) |
| < 6 | COLD | — | Skip |

### Entscheidungsregel

```
WENN ICP >= 8 UND Modus == 1 → Full Package (Video zeigt neue Website)
WENN ICP >= 8 UND Modus == 2 → Extend Package (Video zeigt seine Website)
WENN ICP == 7 → Kein Video, Rest identisch
WENN ICP == 6 → Parked, nur wenn Founder explizit promoted
```

---

## Schritt 4: Provisionieren

**Owner:** CC (automatisiert)
**Tool:** `scripts/_ops/provision_trial.mjs`
**Schablonen:** `docs/gtm/leitsystem_schablone.md` (Tenant-Config) + `retell/templates/agent_template_de.md` (Voice Agent)
**Input:** prospect_card.json + Modul-Entscheid
**Output:** Provisioning-Block im Prospect Manifest
**Dauer:** ~15 Min pro Prospect (Modus 2), ~30 Min (Modus 1)

### Provisioning-Matrix

| Komponente | Modus 1 | Modus 2 | Tool |
|------------|---------|---------|------|
| Supabase Tenant | ✅ | ✅ | onboard_tenant.mjs |
| Twilio-Nummer | ✅ | ✅ | Manuell oder API |
| Voice Agent (DE + INTL) | ✅ | ✅ | retell_sync.mjs (Schablone) |
| Staff-Eintraege | ✅ | ✅ | DB-Insert (mind. 1 = Inhaber) |
| Google Review Crawl | ✅ | ✅ | crawl_google_reviews.mjs (1x manuell VOR Seed) |
| Demo-Daten (70 Cases) | ✅ | ✅ | seed_demo_data_v2.mjs --slug={slug} --count=70 |
| Magic-Link | ✅ | ✅ | create_prospect_access.mjs |
| CustomerSite (/kunden/{slug}) | ✅ | — | CustomerSite Config (manuell, ~15 Min) |
| /start-Seite | — | ✅ | Existiert (SSG Template) |
| SMS-Config | ✅ | ✅ | Manuell (alphanumeric Sender) |

### Voice Agent Konfiguration (Detail)

**Schablone:** `retell/templates/global_prompt_de.txt` (Gold-Standard-Prompt, 23 Platzhalter)
**Templates:** `retell/templates/agent_template_de.json` + `agent_template_intl.json`
**Dokumentation:** `retell/templates/agent_template_de.md` (Checkliste + Workflow)

**Pflicht-Daten (muessen VOR Agent-Erstellung vorliegen):**

| # | Feld | Quelle | Pflicht? |
|---|------|--------|----------|
| 1 | Firmenname, Adresse, Telefon, E-Mail, Website | Scout/Website | JA |
| 2 | Geschaeftsleitung (Namen) | Scout/Website | JA |
| 3 | Oeffnungszeiten | **Founder bestaetigt** | JA |
| 4 | Notdienst-Policy (24/7 oder eingeschraenkt) | **Founder bestaetigt** | JA |
| 5 | Leistungen (komplett) | Scout/Website | JA |
| 6 | Einzugsgebiet (Gemeinden) | Scout/Website | JA |
| 7 | Preis-Policy (Deflect oder Richtwerte) | **Founder entscheidet** | JA |
| 8 | Kategorien (fuer Voice Intake) | Aus Leistungen abgeleitet | JA |

**Delta-Themen (betriebsspezifisch, nicht bei jedem):**
- Preisindikationen (nur wenn offiziell auf Website)
- Erweitertes Team (nur wenn verifiziert)
- Partnerfirmen/Marken
- Lehrstellen/Bewerbungen
- Firmengeschichte (Jubilaeum, Tradition)
- Spezialleistungen (Blitzschutz, Solar, etc.)

**Agent-Faehigkeiten (Gold-Standard, ab 10.04.2026):**
- Intake-Modus: Schadensmeldung aufnehmen (7 Pflichtfelder)
- Info-Modus: Oeffnungszeiten, Einzugsgebiet, Chef sprechen, Adresse, Bewerbung, Beratung
- Preis-Deflekt: Charmante Weiterleitung an Vor-Ort-Besichtigung
- Rueckruf-Wunsch: Fall anlegen mit Kontaktdaten
- Reklamation: Empathisch aufnehmen, Dringlichkeit hochstufen
- Angebotsanfrage: Besichtigungstermin vorschlagen, Fall anlegen
- Sicherheits-Eskalation: Feuerwehr 118, Haupthahn zudrehen
- Erste-Hilfe-Tipps: Haupthahn, Tuecher, Strom aus
- Sprachwechsel: DE→INTL Transfer (EN/FR/IT) und zurueck
- Themenfremde Fragen: Deflekt + weiter mit Intake
- 14 No-Go's (Preise erfinden, Garantie, Diagnose, Termine zusagen, etc.)

**Erstellungs-Workflow:**
1. `retell/templates/global_prompt_de.txt` kopieren
2. 23 Platzhalter mit Betriebsdaten ersetzen
3. In `retell/exports/{prefix}_agent.json` + `_intl.json` Prompt einsetzen
4. KRITISCH: `is_transfer_cf: true` auf BEIDEN Flows (DE + INTL). Ohne das scheitert jeder Sprachwechsel-Rueckswitch. Siehe `docs/runbooks/voice_agent_lessons_learned.md` R1.
5. `retell_sync.mjs --prefix {prefix}` → published
6. Telefonnummer zuordnen: `inbound_agent_id` (NICHT `agent_id`!). Danach ALLE Nummern pruefen.
7. Smoke-Test: 1x Intake + 1x Info + 1x Sprachwechsel DE→EN→DE
8. Ergebnis in `docs/customers/{slug}/status.md` dokumentieren

**Zeitaufwand:** ~20 Min pro Betrieb (nach Doerfler als erstem Durchlauf)
**Referenz:** `docs/runbooks/voice_agent_lessons_learned.md` — PFLICHTLEKTUERE vor jeder Agent-Erstellung

### Parallelisierung

```
                              ┌→ Tenant + Staff + Magic-Link (CC)
prospect_card.json + Entscheid┤
                              ├→ Voice Agent (Schablone + retell_sync.mjs, CC)
                              ├→ Twilio-Nummer (CC)
                              ├→ Google Review Crawl (CC, 1x manuell)
                              ├→ CustomerSite Config (nur Modus 1, CC)
                              └→ Seed Demo-Daten (seed_demo_data_v2.mjs, CC)
```

Reihenfolge beachten: Google Crawl VOR Seed (Bewertungs-KPI muss stimmen).
Staff-Eintraege VOR Seed (Fallzuweisung braucht Staff-Namen).
Alle Pfade koennen parallel laufen. Engpass: Voice Agent (~20 Min inkl. Smoke-Test).

---

## Schritt 5: Produzieren (nur Modus 1)

**Owner:** CC
**Tool:** CustomerSite Config (TypeScript) + Bild-Crawl
**Input:** prospect_card.json + gecrawlte Bilder
**Output:** `/kunden/{slug}` — deploybare Website
**Dauer:** ~15-20 Min

### Was CC macht

1. `src/web/src/lib/customers/{slug}.ts` erstellen (Kopie von Template, Platzhalter ersetzen)
2. In `registry.ts` registrieren
3. Brand Color aus prospect_card → CustomerSite Config + `sync_brand_colors.mjs` → DB
4. Gecrawlte Bilder zuordnen (Service-Mapping)
5. Wizard-Kategorien aus Services ableiten (**MUSS mit Voice Agent uebereinstimmen!**)
6. Emergency-Banner wenn Notdienst angeboten
7. Build + Deploy-Vorschau

### Kritische Uebereinstimmungen

- `categories[]` in CustomerSite = Voice Agent `post_call_analysis_data.category`
- `contact.openingHours` = Voice Agent Oeffnungszeiten
- `emergency.enabled` = Voice Agent Notdienst-Policy
- `serviceArea.gemeinden` = Voice Agent Einzugsgebiet + Seed-Daten Adressen

### Was manuell bleibt

- Bild-Auswahl (CC waehlt aus gecrawlten Bildern)
- Text-Feinschliff (Service-Beschreibungen, Tagline)
- Mobile QA (Founder prueft auf iPhone)

**Modus 2: Kein Website-Bau.** /start/{slug} wird automatisch aus Tenant-Daten generiert.

---

## Schritt 6: Proof-Capture

**Owner:** CC (automatisiert) + Founder (Referenz-Call)
**Input:** Provisioniertes System (Voice + SMS + Dashboard funktioniert)
**Output:** Asset-Block im Prospect Manifest
**Dauer:** ~10 Min pro Prospect (automatisiert), ~2 Min Founder-Call

### Hybrid-Modell

| Capture | Methode | Zweck |
|---------|---------|-------|
| Website-Screenshot | Playwright (headless) | Szene 1 im Video |
| Lisa-Anruf (Audio) | Founder: Echten Anruf, Aufnahme | Gold-Referenz fuer Video |
| Lisa-Anruf (Validation) | Retell API (parallel) | Automatische QA |
| SMS-Proof | Twilio API (Screenshot nach Anruf) | Szene im Video |
| Leitstand-Capture | Playwright (nach Case-Erstellung) | Szene im Video |
| Wizard-Capture | Playwright (ausgefuelltes Formular) | Szene im Video |
| /start-Capture | Playwright | Szene im Video |

### Founder-Rolle im Proof-Capture

**Batch-Anruf:** Founder ruft 10 Nummern in 20 Min an (gleicher Testfall pro Prospect).
- ~1 Min Anruf + ~1 Min Wechsel = 2 Min/Prospect
- Audio wird aufgezeichnet (Founder-Handy + Recording App, NICHT Retell Recording)
- Dieser Anruf ist gleichzeitig der QA-Smoke-Test

**Warum Founder und nicht Retell API?**
- Echte Stimme = Gold-Qualitaet (Schweizerdeutsch/Hochdeutsch Mix)
- Gleichzeitig QA: Founder hoert sofort ob Lisa korrekt reagiert
- Retell API laeuft parallel als automatische Validierung

### Capture-Reihenfolge (pro Prospect)

```
1. Playwright: Website Screenshot                     (automatisch)
2. Playwright: /start/{slug} Screenshot               (automatisch)
3. Founder: Anruf auf Testnummer → Audio-Recording    (Founder)
4. Playwright: Leitstand → neuer Case sichtbar        (automatisch, nach Anruf)
5. Playwright: Wizard ausgefuellt                      (automatisch)
6. Twilio: SMS-Proof nach Anruf                        (automatisch)
```

Schritte 1-2 laufen VOR dem Founder-Anruf. Schritte 4-6 laufen NACH dem Anruf.

---

## Schritt 7: Narration (Segment-Recording + Audio-Pipeline)

**Owner:** Founder (Recording) + CC (Post-Production)
**Input:** Video-Script (pro Betrieb) + Rode USB Mikro
**Output:** Founder-Narrations-Segmente (Audio) + Screen-Recordings (Video)
**Dauer:** ~15-20 Min Recording pro Betrieb

### Methode (ab 10.04.2026)

**NICHT mehr:** Teleprompter-Batch mit einem Take pro Betrieb (scheiterte: 8h fuer 80s).
**STATTDESSEN:** Segment-Recording + Post-Production.

### Workflow pro Take

1. **Founder:** Liest Script-Segmente einzeln vor (Rode USB, OBS/Audacity)
   - Pro Segment 2-3 Versuche, bestes wird genommen
   - Verhaspler → Satz nochmal, Aufnahme laeuft weiter
   - Kamera klein (PiP) oder aus — kein Sprechdruck

2. **Founder:** Nimmt Screen-Aktionen separat auf (Loom, stumm oder mit Rough-Guide)
   - Handy-Screen (Anruf, SMS, Leitsystem)
   - Desktop-Screen (Website, Wizard)

3. **CC:** Post-Production
   - Beste Segmente auswaehlen + stitchen
   - Audio normalisieren (-16 LUFS)
   - Bei Voice Agent Call: Retell Multi-Channel Audio extrahieren (`extract_call_audio.mjs`)
   - Agent-Audio ersetzen mit Clean-TTS (`mix_demo_audio.mjs`)
   - Video + Audio zusammenfuegen → finale MP4

### Audio-Pipeline Tools

| Tool | Zweck |
|------|-------|
| `extract_call_audio.mjs <call_id>` | Retell Multi-Channel → Agent Clean WAV |
| `mix_demo_audio.mjs <video> <call_id> <offset>` | Loom Video + Clean Agent Audio → Final MP4 |
| `--agent-gain`, `--ambient` | Feintuning Lautstaerke-Balance |

### Video-Hosting

**Self-hosted auf Vercel** (NICHT Loom). Videos als MP4 in Vorstellungsseite eingebettet.
- Kein fremdes Branding, kein Cookie-Banner, kein Tab-Wechsel
- Vercel Pro: 1 TB Bandbreite (4 Videos a 50 MB = irrelevant)
- Config: `src/web/src/lib/customers/vorstellung.ts`

---

## Schritt 8: Assembly

**Owner:** CC
**Tool:** `extract_call_audio.mjs` + `mix_demo_audio.mjs` + FFmpeg
**Input:** Founder Segment-Recordings + Screen-Recordings + Retell Call Audio
**Output:** 4 finale MP4s pro Betrieb (Take 1-4)
**Dauer:** ~15 Min pro Betrieb (Post-Production)

### Take-Struktur pro Betrieb

| Take | Inhalt | Kamera | Audio-Quelle |
|------|--------|--------|-------------|
| 1 | Vorstellung + Kernfrage | Gross (Face) | Founder Rode (Segment-Recording) |
| 2 | Voice Agent + SMS + Leitsystem | Klein (PiP) | Founder Rode + Retell Clean TTS |
| 3 | Website + Online-Meldung | Klein (PiP) | Founder Rode |
| 4 | Bewertungs-Engine + Abschluss | Klein→Gross | Founder Rode |

### Assembly-Pipeline pro Take

```
1. Founder-Segmente: Beste Version pro Segment waehlen
2. Audio normalisieren (-16 LUFS, konsistent ueber alle Takes)
3. Take 2 speziell: Retell Multi-Channel → Agent Clean WAV
   → mix_demo_audio.mjs: Founder Rode + Clean Agent Audio
   → --agent-gain und --ambient fuer Balance
4. Video + Audio zusammenfuegen (FFmpeg, -c:v copy -c:a aac)
5. MP4 ablegen in docs/customers/{slug}/takes/
6. Auf Vorstellungsseite verlinken (vorstellung.ts)
```

### Video-Hosting

Self-hosted auf Vercel als MP4. NICHT Loom.
- Vorstellungsseite: `/kunden/{slug}/vorstellung`
- Config: `src/web/src/lib/customers/vorstellung.ts`
- Kein fremdes Branding, kein Cookie-Banner, ein geschlossenes Erlebnis

---

## Schritt 9: QA

**Owner:** CC (Auto-Checks) + Founder (Manual-Checks)
**Tool:** QA-Pipeline (TODO: S5.6)
**Input:** video_raw + alle Assets + Prospect Manifest
**Output:** QA-Block im Prospect Manifest
**Dauer:** ~5 Min Auto + ~3 Min Manual pro Prospect

Vollstaendige QA-Spezifikation: `docs/gtm/qa_gate.md`

### Kurzfassung

| Typ | Checks | Kill-Kriterium |
|-----|--------|---------------|
| Auto (9) | Firmenname, Laenge, Assets vorhanden, Links funktionieren, etc. | Jeder FAIL = STOP |
| Manual (3) | Founder-Wuerde-Test, Audio-Qualitaet, Spiegel-Effekt | Jeder FAIL = STOP |

**ready_to_send = true** nur wenn ALLE 12 Checks PASS.

---

## Schritt 10: Versand

**Owner:** Founder (sendet persoenlich)
**Tool:** `send_outreach_mail.mjs` (Resend HTML-Mail mit Foto)
**Input:** Vorstellungsseite live + Prospect Manifest (Outreach-Felder)
**Output:** E-Mail gesendet, Status → `contacted`
**Dauer:** ~2 Min pro Prospect (1 Kommando)

### E-Mail-Inhalte

| Element | Quelle |
|---------|--------|
| Empfaenger | prospect_email (aus prospect_card.json) |
| Betreff | "Etwas Persoenliches fuer {legal_name}" |
| Foto | Gunnar-Foto mit Play-Button (klickbar → Vorstellungsseite) |
| Link | flowsight.ch/kunden/{slug}/vorstellung |
| Reply-To | gunnar.wende@flowsight.ch |

### Versand-Kommando

```
node --env-file=.env.local scripts/_ops/send_outreach_mail.mjs {slug} {email}
```

### Versand-Regeln

- **Nie automatisch.** Founder drueckt Senden.
- **Nie ohne QA.** qa.ready_to_send muss true sein.
- **Nie ohne Founder-Wuerde-Test.** "Wuerde ich das mit gutem Gewissen schicken?"
- **Regionale Staffelung:** Max 2 Betriebe pro PLZ-Cluster pro Woche.

---

## Schritt 11: Follow-up

**Owner:** Founder (persoenlich)
**Trigger:** Signal oder Zeitablauf
**Referenz:** `docs/gtm/operating_model.md` (Phase 3: Trial)

### Follow-up Timeline

| Tag | Aktion | Owner |
|-----|--------|-------|
| 0 | E-Mail mit Video gesendet | Founder |
| 2-3 | Kein Signal → kurzes Follow-up ("Haben Sie das Video gesehen?") | Founder |
| Signal | Interesse → Trial provisionieren (wenn noch nicht geschehen) | CC |
| 7 | Zwischencheck: Aktivitaet? | CC (Morning Report) |
| 10 | Persoenlicher Follow-up-Anruf | Founder |
| 13 | Erinnerung: "Ihr Test laeuft morgen ab" | Auto (E-Mail) |
| 14 | Decision Day: Convert / Live-Dock / Offboard | Founder |

---

## Schritt 12: Learning Loop

**Owner:** CC + Founder
**Trigger:** Nach jedem Batch (10 Prospects)
**Output:** Metriken + Anpassungen

### Was gemessen wird

| Metrik | Quelle | Ziel |
|--------|--------|------|
| E-Mail Open Rate | Resend Analytics | > 60% |
| Video View Rate | Loom Analytics | > 40% |
| Video Watch-Through | Loom Analytics | > 50% der Laenge |
| Signal Rate | Manuell | > 25% (Antwort/Klick/Rueckruf) |
| Trial Conversion | Supabase (trial_status) | > 25% |
| Provisioning-Dauer | Zeitmessung | < 15 Min (M2), < 30 Min (M1) |

### Anpassungsregeln

```
WENN Open Rate < 40% → Betreff-Varianten testen
WENN View Rate < 20% → Thumbnail/E-Mail-Kontext aendern
WENN Signal Rate < 15% → Gold Contact Standard pruefen (Spiegel-Effekt stark genug?)
WENN Conversion < 15% → Trial-Journey analysieren (prospect_journey.md)
```

---

## Regionale Staffelung

### Warum

Schweizer Handwerker reden miteinander. Wenn 5 Betriebe in Thalwil gleichzeitig kontaktiert werden, wirkt es wie Massen-Marketing — das Gegenteil von Gold Contact.

### Regel

- **Max 2 Betriebe pro PLZ-Cluster (3-stellig) pro Woche**
- PLZ-Cluster 880 = Thalwil, Horgen, Oberrieden → max 2/Woche
- PLZ-Cluster 804 = Zuerich Stadt → max 2/Woche (dichter, mehr Betriebe)
- Erst wenn Batch 1 durch Follow-up ist, naechster Batch im selben Cluster

### PLZ-Cluster-Logik

```
PLZ 8800 Thalwil    → Cluster 880
PLZ 8802 Kilchberg  → Cluster 880
PLZ 8942 Oberrieden → Cluster 894  (eigener Cluster, trotz Naehe)
PLZ 8001 Zuerich    → Cluster 800
PLZ 8952 Schlieren  → Cluster 895
```

Cluster-Zuordnung: Erste 3 Ziffern der PLZ. Einfach, deterministisch.

---

## Kapazitaetsmodell

### Ziel: 10 Betriebe/Tag (bei Volllast)

| Rolle | Aufwand/Prospect | 10 Prospects/Tag | Engpass |
|-------|-----------------|------------------|---------|
| CC: Scout | 3 Min | 30 Min | Kein |
| CC: Analyse | 10 Min | 100 Min | Kein |
| CC: Provisioning | 15-30 Min | 150-300 Min | **JA** (M1) |
| CC: Proof-Capture | 10 Min (auto) | 100 Min | Kein |
| CC: Assembly | 5 Min (auto) | 50 Min | Kein |
| CC: QA (auto) | 5 Min | 50 Min | Kein |
| Founder: Narration | 2 Min | 20 Min | Kein |
| Founder: QA (manual) | 3 Min | 30 Min | Kein |
| Founder: Versand | 5 Min | 50 Min | Kein |

### Realistischer Mix: 5x Modus 1 + 5x Modus 2

| Rolle | Tagesaufwand |
|-------|-------------|
| CC | ~6-7h (Engpass: Modus-1-Provisioning) |
| Founder | ~2h (Batch-Narration + QA + Versand) |

### Skalierungshebel

1. **CustomerSite Generator** (S5.9): Modus-1-Provisioning von 30 auf 15 Min
2. **Proof-Capture Automation** (S5.7): Captures von 10 auf 3 Min
3. **Assembly Automation** (S5.8): Video von 5 auf 2 Min
4. **Batch-Provisioning** (zukuenftig): 10 Tenants parallel

---

## Founder-Rolle (Zusammenfassung)

### Was der Founder tut

| Aufgabe | Wann | Dauer (pro Betrieb) |
|---------|------|---------------------|
| Segment-Recording (Narration) | Pro Betrieb | ~15-20 Min |
| Screen-Recording (Handy/Desktop) | Pro Betrieb | ~10-15 Min |
| Test-Anruf (Voice Agent QA) | Pro Betrieb | ~3 Min |
| Ergebnis pruefen (Video) | Nach Assembly | ~5 Min |
| Versand (1 Kommando + pruefen) | Nach QA | ~2 Min |
| **Total pro Betrieb** | | **~40 Min** |
| **Total 5 Betriebe/Tag** | | **~3.5h** |

### Was der Founder NICHT tut

- Kein Provisioning (CC)
- Kein Voice Agent Setup (CC, Schablone)
- Kein Assembly / Audio-Mix (CC)
- Kein Scout / Analyse (CC)
- Kein Website-Bau (CC)
- Kein Seed-Daten (CC)
- Kein Monitoring (automatisch, RED Alert bei Problemen)

---

## Status der Pipeline-Komponenten (Updated 10.04.2026)

| Schritt | Tool | Status |
|---------|------|--------|
| Scout | scout.mjs | DONE |
| Analyse | Manuell + Website-Crawl | DONE |
| Modul-Entscheid | Manuell (Matrix) | DONE |
| Provisionieren: Tenant | provision_trial.mjs | DONE |
| Provisionieren: Staff | DB-Insert | DONE (manuell) |
| Provisionieren: Voice Agent | Schablone + retell_sync.mjs | **DONE** (Gold-Standard, 23 Platzhalter) |
| Provisionieren: Google Crawl | crawl_google_reviews.mjs | DONE (1x manuell triggern) |
| Provisionieren: Seed-Daten | seed_demo_data_v2.mjs | **DONE** (70 Cases, dynamisch) |
| Produzieren (M1) | CustomerSite Config (manuell) | DONE (~15 Min) |
| Proof-Capture | Manuell (Screenshots + Anruf) | DONE (Playwright = spaeter) |
| Narration | Segment-Recording + Rode USB | **DONE** (neue Methode) |
| Assembly | extract_call_audio + mix_demo_audio | **DONE** (Audio-Pipeline live) |
| QA (Auto) | Smoke-Test Checkliste | DONE (8 Pruefpunkte) |
| QA (Manual) | Founder Checkliste | DONE (qa_gate.md) |
| Versand | send_outreach_mail.mjs | DONE |
| Follow-up | Morning Report + Lifecycle Tick | DONE |
| Monitoring | agent_hangup RED Alert | **DONE** (Webhook + Morning Report) |
| Learning Loop | Analytics | TODO (nach Maschinenstart) |

### Neue Referenzen (ab 10.04.2026)

| Dokument | Zweck |
|----------|-------|
| `retell/templates/global_prompt_de.txt` | Voice Agent Gold-Standard-Prompt (23 Platzhalter) |
| `retell/templates/agent_template_de.md` | Voice Agent Erstellungs-Checkliste |
| `docs/gtm/leitsystem_schablone.md` | Leitsystem Tenant-Config Schablone |
| `docs/runbooks/voice_agent_lessons_learned.md` | Retell Gotchas (PFLICHTLEKTUERE) |
| `scripts/_ops/extract_call_audio.mjs` | Retell Multi-Channel → Clean Agent WAV |
| `scripts/_ops/mix_demo_audio.mjs` | Loom Video + Clean Audio → Final MP4 |
| `scripts/_ops/seed_demo_data_v2.mjs` | 70+ dynamische Cases pro Betrieb |

---

## Referenzen

- **Prospect Manifest:** `docs/architecture/contracts/prospect_manifest.md`
- **Video Manifest:** `docs/gtm/video_manifest.md`
- **QA Gate:** `docs/gtm/qa_gate.md`
- **Gold Contact:** `docs/gtm/gold_contact.md`
- **Schatztruhe:** `docs/gtm/schatztruhe_final.md`
- **Operating Model:** `docs/gtm/operating_model.md`
- **Quality Gates:** `docs/gtm/quality_gates.md`
- **Plan S5:** `docs/redesign/plan.md` (§ S5)
