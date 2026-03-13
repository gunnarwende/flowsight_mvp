# Machine Manifest — Gold-Contact Proof-Capture-Maschine

**Erstellt:** 2026-03-13 | **Owner:** CC + Founder
**Version:** 1.0 — End-to-End Pipeline
**Referenz:** `docs/redesign/plan.md` (S5), `docs/architecture/contracts/prospect_manifest.md`

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
**Input:** prospect_card.json + Modul-Entscheid
**Output:** Provisioning-Block im Prospect Manifest
**Dauer:** ~15 Min pro Prospect (Modus 2), ~30 Min (Modus 1)

### Provisioning-Matrix

| Komponente | Modus 1 | Modus 2 | Tool |
|------------|---------|---------|------|
| Supabase Tenant | ✅ | ✅ | onboard_tenant.mjs |
| Twilio-Nummer | ✅ | ✅ | Manuell oder API |
| Voice Agent (DE + INTL) | ✅ | ✅ | retell_sync.mjs |
| Demo-Daten (15 Cases) | ✅ | ✅ | seed_demo_data.mjs |
| Magic-Link | ✅ | ✅ | create_prospect_access.mjs |
| CustomerSite (/kunden/{slug}) | ✅ | — | CustomerSite Generator (TODO: S5.9) |
| /start-Seite | — | ✅ | Existiert (SSG Template) |
| SMS-Config | ✅ | ✅ | Manuell (alphanumeric Sender) |

### Parallelisierung

```
                              ┌→ Tenant + Seed + Magic-Link (CC)
prospect_card.json + Entscheid┤
                              ├→ Voice Agent (retell_sync.mjs, CC)
                              ├→ Twilio-Nummer (CC)
                              └→ CustomerSite (nur Modus 1, CC)
```

Alle 4 Pfade koennen parallel laufen. Engpass: Voice Agent (~8 Min).

---

## Schritt 5: Produzieren (nur Modus 1)

**Owner:** CC
**Tool:** CustomerSite Generator (TODO: S5.9)
**Input:** prospect_card.json + gecrawlte Bilder
**Output:** `/kunden/{slug}` — deploybare Website
**Dauer:** ~15 Min (Ziel: 80% auto-generiert)

### Was der Generator macht

1. Template mit prospect_card-Daten befuellen (Name, Services, Team, Kontakt)
2. Brand Color aus prospect_card uebernehmen
3. Gecrawlte Bilder zuordnen (Service-Mapping)
4. Wizard-Kategorien aus prospect_card.services ableiten
5. Emergency-Banner wenn emergency.enabled === true
6. Build + Deploy-Vorschau

### Was manuell bleibt (~20%)

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

## Schritt 7: Narration (Founder-Batch)

**Owner:** Founder
**Input:** Video-Script (aus video_manifest.md) + Teleprompter-Text
**Output:** Founder-Narrations-Segmente (Audio/Video)
**Dauer:** ~20s Narration pro Prospect, 10 Prospects in ~20 Min

### Batch-Setup

1. Founder sitzt vor Kamera + Mikrofon (identisches Setup wie Video-Produktion)
2. Teleprompter zeigt pro Prospect: Hook + CTA
3. Pro Prospect: ~20s Narration aufnehmen
4. Kein Schnitt zwischen Prospects noetig (wird in Assembly getrennt)

### Was der Founder spricht

| Segment | Modus 1 | Modus 2 |
|---------|---------|---------|
| Hook (Szene 1) | "Ich habe fuer {legal_name} eine Website gebaut" | "{video_hook}" |
| Ueberleitung | "Und eine persoenliche Lisa — schauen Sie mal" | Identisch |
| CTA (Ende) | "Ihre Nummer: {test_phone}" | Identisch |

### Teleprompter-Format

```
--- WEINBERGER AG ---
"Haustechnik seit 1912 in Thalwil. Ich habe für die Weinberger AG
etwas ausprobiert — schauen Sie sich das an."
[PAUSE 2s]
"Testen Sie Ihre Lisa: 043 505 11 01."
--- NÄCHSTER ---
```

---

## Schritt 8: Assembly

**Owner:** CC (automatisiert)
**Tool:** FFmpeg + Assembly-Script (TODO: S5.8)
**Input:** Proof-Capture Assets + Founder-Narration
**Output:** `assets.video_raw` (Roh-Video)
**Dauer:** ~5 Min pro Video (automatisiert)

### Szenen-Reihenfolge

Siehe `docs/gtm/video_manifest.md` fuer die vollstaendige Szenen-Spezifikation.

Zusammenfassung:
```
Szene 1: Website/Spiegel (Founder-Narration + Screenshot)     ~10-15s
Szene 2: Problem-Setup (generisches Asset)                     ~8-10s
Szene 3: Lisa-Moment (Founder-Anruf-Audio + Leitstand-Capture) ~25-30s
Szene 4: SMS-Proof (SMS-Screenshot + Handy-Mockup)             ~8-10s
Szene 5: Leitstand-Proof (Dashboard-Capture)                   ~10-15s
Szene 6: Wizard/Formular (optional, nur Modus 1)               ~5-8s
Szene 7: CTA (Founder-Narration + Testnummer)                  ~10-15s
```

### Assembly-Pipeline

```
1. Founder-Narration zerschneiden (Hook, Ueberleitung, CTA)
2. Screenshots zu Video-Clips (Ken-Burns-Effekt, 2s pro Bild)
3. Lisa-Audio + Leitstand-Capture synchronisieren
4. SMS-Proof einblenden
5. CTA-Slide mit Testnummer + URL
6. Gesamtlänge prüfen (Modus 1: 150-160s, Modus 2: 130-140s)
7. Export als MP4 (1080p, 30fps)
```

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
**Tool:** E-Mail (Resend, persoenlich formuliert)
**Input:** Fertiges Video (Loom-URL) + Prospect Manifest (Outreach-Felder)
**Output:** E-Mail gesendet, Status → `contacted`
**Dauer:** ~5 Min pro Prospect (personalisieren + senden)

### E-Mail-Inhalte

| Element | Quelle im Manifest |
|---------|-------------------|
| Empfaenger | outreach.prospect_email |
| Betreff | "{legal_name} — ich habe etwas fuer Sie ausprobiert" |
| Video-Link | assets.loom_url |
| Video-Thumbnail | assets.loom_thumbnail |
| Testnummer | provisioning.twilio_number_display |
| Website/Start-Link | provisioning.kunden_url (M1) oder provisioning.start_url (M2) |

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

| Aufgabe | Wann | Dauer (10 Prospects) |
|---------|------|---------------------|
| Batch-Anrufe (Proof-Capture) | 1x taeglich | 20 Min |
| Batch-Narration (Teleprompter) | 1x taeglich | 20 Min |
| Manual QA (Wuerde-Test) | Nach Assembly | 30 Min |
| Versand (persoenliche E-Mails) | Nach QA | 50 Min |
| **Total** | | **~2h/Tag** |

### Was der Founder NICHT tut

- Kein Provisioning (CC)
- Kein Proof-Capture (automatisiert, ausser Batch-Anruf)
- Kein Assembly (automatisiert)
- Kein Scout (CC)
- Kein Website-Bau (CC/Generator)

---

## Status der Pipeline-Komponenten

| Schritt | Tool | Status |
|---------|------|--------|
| Scout | scout.mjs | DONE |
| Analyse | Manuell | DONE (Methode klar) |
| Modul-Entscheid | Manuell | DONE (Matrix klar) |
| Provisionieren | provision_trial.mjs | DONE |
| Produzieren (M1) | CustomerSite Generator | **TODO** (S5.9) |
| Proof-Capture | Playwright + Retell API | **TODO** (S5.7) |
| Narration | Founder + Teleprompter | DONE (Methode klar) |
| Assembly | FFmpeg + Script | **TODO** (S5.8) |
| QA (Auto) | QA-Pipeline | **TODO** (S5.6) |
| QA (Manual) | Founder Checkliste | DONE (qa_gate.md) |
| Versand | Resend + Founder | DONE |
| Follow-up | Morning Report + Founder | DONE |
| Learning Loop | Analytics | **TODO** (nach Maschinenstart) |

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
