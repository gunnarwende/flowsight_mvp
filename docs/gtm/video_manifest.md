# Video Manifest — Szenen, Variablen, Capture-Methoden

**Erstellt:** 2026-03-13 | **Owner:** CC + Founder
**Version:** 1.0
**Referenz:** `schatztruhe_final.md` (Psychologie), `machine_manifest.md` (Pipeline), `prospect_manifest.md` (Daten)

---

## Zweck

Dieses Dokument definiert die **technische Video-Spezifikation** pro Prospect-Video:
Welche Szenen, in welcher Reihenfolge, mit welchen Assets, welchen Variablen, und welcher Capture-Methode.

### Was dieses Dokument ist

- Szenen-Typ-Katalog mit Variablen
- Capture-Methoden pro Asset
- Modus-1/Modus-2-Unterschiede pro Szene
- Template fuer Assembly-Script

### Was dieses Dokument NICHT ist

- Keine Psychologie (-> schatztruhe_final.md)
- Keine Pipeline-Beschreibung (-> machine_manifest.md)
- Keine QA-Details (-> qa_gate.md)
- Kein konkretes Skript fuer einen Prospect (-> videos/{slug}/skript.md)

---

## Video-Parameter

| Parameter | Modus 1 (Full) | Modus 2 (Extend) |
|-----------|---------------|------------------|
| Gesamtlaenge | 150-160s | 130-140s |
| Szenen | 11 | 11 (kuerzere Intro) |
| Format | 1080p, 30fps, MP4 | Identisch |
| Aspect Ratio | 16:9 | Identisch |
| Audio | Founder-Narration + Lisa-Audio + Ambient | Identisch |
| Thumbnail | Szene 1 Frame (Website/Spiegel) | Identisch |

---

## Szenen-Katalog

### Szene 1: Spiegel (Persoenlicher Einstieg)

| Aspekt | Detail |
|--------|--------|
| **Zweck** | Prospect sieht SEINEN Betrieb → Spiegel-Effekt → "Das bin JA ICH" |
| **Dauer** | 10-15s |
| **Visual (M1)** | Screenshot von /kunden/{slug} (neue FlowSight-Website) |
| **Visual (M2)** | Screenshot von {website_url} (seine echte Website) |
| **Audio** | Founder-Narration: Hook |
| **Narration (M1)** | "Ich habe fuer {legal_name} eine Website gebaut — schauen Sie mal." |
| **Narration (M2)** | "{video_hook}" (z.B. "Haustechnik seit 1912 in Thalwil") |
| **Capture** | Playwright: Screenshot der URL im Desktop-Viewport |
| **Ken-Burns** | Leichter Zoom-in (1.0 → 1.05, 10s) |

**Variablen:**
- `{legal_name}` → prospect_manifest.company.legal_name
- `{video_hook}` → prospect_manifest.outreach.video_hook
- `{website_url}` → prospect_manifest.contact.website (M2)
- `{kunden_url}` → prospect_manifest.provisioning.kunden_url (M1)

---

### Szene 2: Problem-Setup

| Aspekt | Detail |
|--------|--------|
| **Zweck** | Emotionaler Trigger: "Wer nimmt den Anruf an?" |
| **Dauer** | 8-10s |
| **Visual** | Generisches Asset: Handy klingelt, verpasster Anruf (wiederverwendbar) |
| **Audio** | Founder-Narration: Problem-Szenario |
| **Narration** | "Samstagabend. {demo_scenario.description}. Wer nimmt den Anruf an?" |
| **Capture** | Kein Capture noetig — generisches Asset aus Asset-Library |

**Variablen:**
- `{demo_scenario.description}` → prospect_manifest.outreach.demo_scenario.description
- `{demo_scenario.city}` → prospect_manifest.outreach.demo_scenario.city (fuer Kontext)

---

### Szene 3: Ueberleitung zu Lisa

| Aspekt | Detail |
|--------|--------|
| **Zweck** | Brücke: Problem → Loesung |
| **Dauer** | 3-5s |
| **Visual** | Uebergangs-Animation oder kurzer Founder-Clip |
| **Audio** | Founder-Narration |
| **Narration** | "Mit FlowSight nimmt Ihre persoenliche Lisa den Anruf an." |
| **Capture** | Kein Capture noetig |

---

### Szene 4: Lisa-Greeting

| Aspekt | Detail |
|--------|--------|
| **Zweck** | Prospect hoert Lisa SEINEN Firmennamen sagen |
| **Dauer** | 8-12s |
| **Visual** | Handy-Mockup mit eingehendem Anruf + Testnummer |
| **Audio** | Echtes Lisa-Greeting aus Founder-Anruf (Audio-Recording) |
| **Capture** | Founder-Anruf auf Testnummer → Audio-Recording der ersten 10s |

**Kill-Kriterium:** Lisa MUSS den korrekten Firmennamen sagen. Falsch = sofortiger Retake.

**Variablen:**
- `{test_phone}` → prospect_manifest.provisioning.twilio_number_display
- `{short_name}` → prospect_manifest.company.short_name

---

### Szene 5: Lisa-Gespraech (Datenaufnahme)

| Aspekt | Detail |
|--------|--------|
| **Zweck** | Lisa sammelt Daten — professionell, empathisch |
| **Dauer** | 15-20s |
| **Visual** | Leitstand-Capture: Echtzeit-Ansicht wie Case entsteht |
| **Audio** | Founder-Anruf-Audio (Mitte des Gespraechs) |
| **Capture** | Playwright: Leitstand waehrend/nach Anruf (Case erscheint) |

---

### Szene 6: SMS-Moment

| Aspekt | Detail |
|--------|--------|
| **Zweck** | Physischer Beweis: SMS auf dem Handy des Anrufers |
| **Dauer** | 5-8s |
| **Visual** | Handy-Screenshot mit SMS von "{sms_sender}" |
| **Audio** | SMS-Sound + kurze Founder-Narration |
| **Narration** | "Der Kunde bekommt sofort eine SMS-Bestaetigung." |
| **Capture** | Twilio: SMS nach Anruf → Handy-Screenshot oder Rendering |

**Variablen:**
- `{sms_sender}` → prospect_manifest.provisioning.sms_sender_name

---

### Szene 7: Leitstand-Beweis

| Aspekt | Detail |
|--------|--------|
| **Zweck** | Struktureller Beweis: Fall ist im System, alle Daten da |
| **Dauer** | 8-12s |
| **Visual** | Leitstand-Detail-Ansicht: Kategorie, Dringlichkeit, Adresse, PLZ |
| **Audio** | Founder-Narration |
| **Narration** | "Und der Fall landet sofort in Ihrem Leitstand — mit allen Details." |
| **Capture** | Playwright: /ops → Fall-Detail-Ansicht nach Testanruf |

---

### Szene 8: Wizard/Formular (optional, nur bei Modus 1 + 2)

| Aspekt | Detail |
|--------|--------|
| **Zweck** | Zweiter Kanal: Online-Meldung neben Telefon |
| **Dauer** | 5-8s |
| **Visual** | Wizard-Formular ausgefuellt mit Testdaten |
| **Audio** | Founder-Narration |
| **Narration** | "Kunden koennen auch online melden — das Formular auf Ihrer Website." |
| **Capture** | Playwright: /start/{slug}/meldung oder /kunden/{slug}/meldung |

**Variablen:**
- Wizard-URL abhaengig von Modus (M1: /kunden, M2: /start)

---

### Szene 9: Review-Anfrage (optional)

| Aspekt | Detail |
|--------|--------|
| **Zweck** | Bonus-Feature: Automatische Bewertungs-Anfrage nach Fall |
| **Dauer** | 5-8s |
| **Visual** | Review-Surface (/review/{caseId}) auf Handy |
| **Audio** | Founder-Narration |
| **Narration** | "Nach dem Einsatz bekommt der Kunde automatisch eine Bewertungsanfrage." |
| **Capture** | Playwright: /review/{caseId} (mit Testfall-ID) |

---

### Szene 10: Founder-CTA

| Aspekt | Detail |
|--------|--------|
| **Zweck** | Klarer Call-to-Action mit Testnummer |
| **Dauer** | 8-12s |
| **Visual** | /start/{slug} oder /kunden/{slug} mit Testnummer prominent |
| **Audio** | Founder-Narration |
| **Narration** | "Testen Sie Ihre Lisa: {test_phone}. Kostenlos, ohne Verpflichtung." |
| **Capture** | Playwright: /start/{slug} mit CTA-Bereich sichtbar |

**Variablen:**
- `{test_phone}` → prospect_manifest.provisioning.twilio_number_display
- `{start_url}` → prospect_manifest.provisioning.start_url

---

### Szene 11: Ausklang

| Aspekt | Detail |
|--------|--------|
| **Zweck** | Sauberer Abschluss, kein abruptes Ende |
| **Dauer** | 3-5s |
| **Visual** | FlowSight Logo oder Website-Spiegel (letzte Einstellung) |
| **Audio** | Ambient fade-out |
| **Capture** | Kein Capture noetig — statisches Asset |

---

## Capture-Methoden (Zusammenfassung)

| Methode | Tool | Assets | Automatisierbar |
|---------|------|--------|----------------|
| **Playwright Screenshot** | Playwright (headless Chrome) | Website, /start, Leitstand, Wizard, Review | Ja (S5.7) |
| **Founder-Anruf** | Handy + Recording App | Lisa-Audio (Greeting + Gespraech) | Nein (Founder-Stimme) |
| **Retell API** | Retell REST API | Validation-Anruf (QA, nicht fuer Video) | Ja (S5.7) |
| **Twilio API** | Twilio REST API | SMS-Proof (nach Anruf) | Ja (S5.7) |
| **Handy-Screenshot** | Manuell (Founder) | SMS auf echtem Handy | Nein (Fallback) |
| **Generische Assets** | Asset-Library | Handy-Klingeln, Uebergaenge, Logo | Vorbereitet |

---

## Variablen-Referenz (Video-spezifisch)

| Variable | Szene(n) | Quelle im Manifest |
|----------|---------|-------------------|
| `{legal_name}` | 1 | company.legal_name |
| `{short_name}` | 4 | company.short_name |
| `{video_hook}` | 1 (M2) | outreach.video_hook |
| `{website_url}` | 1 (M2) | contact.website |
| `{kunden_url}` | 1 (M1) | provisioning.kunden_url |
| `{test_phone}` | 4, 10 | provisioning.twilio_number_display |
| `{sms_sender}` | 6 | provisioning.sms_sender_name |
| `{start_url}` | 10 | provisioning.start_url |
| `{demo_scenario}` | 2 | outreach.demo_scenario |
| `{brand_color}` | Alle UI-Captures | company.brand_color |

---

## Timing-Budget

### Modus 2 (130-140s)

| Szene | Min | Max | Typ |
|-------|-----|-----|-----|
| 1. Spiegel | 10s | 15s | Narration + Screenshot |
| 2. Problem | 8s | 10s | Narration + Generic |
| 3. Ueberleitung | 3s | 5s | Narration |
| 4. Lisa-Greeting | 8s | 12s | Audio + Mockup |
| 5. Lisa-Gespraech | 15s | 20s | Audio + Capture |
| 6. SMS | 5s | 8s | Sound + Screenshot |
| 7. Leitstand | 8s | 12s | Narration + Capture |
| 8. Wizard | 5s | 8s | Narration + Capture |
| 9. Review | 5s | 8s | Narration + Capture |
| 10. CTA | 8s | 12s | Narration + Capture |
| 11. Ausklang | 3s | 5s | Ambient |
| **Total** | **78s** | **115s** | Ziel: 130-140s mit Pausen |

Differenz (15-62s) = natuerliche Pausen, Uebergaenge, Breathing Room.

### Modus 1 (150-160s)

Identisch, aber Szene 1 laenger (Website-Tour: 15-20s statt 10-15s) und Szene 8 laenger (eigener Wizard: 8-10s).

---

## Assembly-Template (fuer FFmpeg-Script)

```
# Pseudo-Code fuer Assembly-Script (TODO: S5.8)

INPUT:
  narration_hook.mp4      # Founder: Hook (Szene 1)
  narration_bridge.mp4    # Founder: Ueberleitung (Szene 3)
  narration_cta.mp4       # Founder: CTA (Szene 10)
  capture_website.png     # Playwright: Website (Szene 1)
  capture_leitstand.png   # Playwright: Leitstand (Szene 5, 7)
  capture_wizard.png      # Playwright: Wizard (Szene 8)
  capture_review.png      # Playwright: Review (Szene 9)
  capture_start.png       # Playwright: /start (Szene 10)
  lisa_audio.mp3          # Founder-Anruf: Lisa-Gespraech (Szene 4, 5)
  sms_proof.png           # Twilio: SMS Screenshot (Szene 6)
  generic_phone.mp4       # Asset-Library: Handy klingelt (Szene 2)
  logo_outro.png          # Asset-Library: Logo (Szene 11)

OUTPUT:
  video_raw.mp4           # 130-160s, 1080p, 30fps

PROCESS:
  1. Ken-Burns(capture_website, 10-15s) + narration_hook → Szene 1
  2. generic_phone (8-10s) + narration_problem → Szene 2
  3. narration_bridge (3-5s) → Szene 3
  4. phone_mockup + lisa_audio[0:12] → Szene 4
  5. capture_leitstand_anim + lisa_audio[12:32] → Szene 5
  6. sms_mockup(sms_proof) + sms_sound → Szene 6
  7. capture_leitstand_detail + narration_dashboard → Szene 7
  8. capture_wizard + narration_wizard → Szene 8
  9. capture_review + narration_review → Szene 9
  10. capture_start + narration_cta → Szene 10
  11. logo_outro + fade_out → Szene 11
  12. Concatenate → Export MP4
```

---

## Referenzen

- **Schatztruhe Final:** `docs/gtm/schatztruhe_final.md` (Psychologie, WOW-Kette)
- **Production Brief:** `docs/gtm/videos/{slug}/production_brief.md` (Prospect-spezifisch)
- **Machine Manifest:** `docs/gtm/machine_manifest.md` (Pipeline-Kontext)
- **Prospect Manifest:** `docs/architecture/contracts/prospect_manifest.md` (Daten-Schema)
- **Video Template:** `docs/gtm/video_template.md` (aeltere 5-Szenen-Version, abgeloest)
- **Plan S5:** `docs/redesign/plan.md` (§ S5.7, S5.8)
