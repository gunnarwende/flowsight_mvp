# Prospect Manifest Contract (SSOT)

**Erstellt:** 2026-03-13 | **Owner:** CC
**Erweitert:** prospect_card.md (v1.0 Scout-Output)
**Version:** 2.0 — Gold-Contact Proof-Capture-Maschine
**Referenz:** `docs/gtm/machine_manifest.md`, `docs/gtm/video_manifest.md`

---

## Zweck

Das Prospect Manifest ist die **vollstaendige Datenstruktur pro Prospect** — von Scout bis Versand. Es erweitert die bestehende Prospect Card (v1.0) um Outreach-, Provisioning-, Asset- und QA-Felder.

**Erzeuger:** Scout (v1 Felder) + CC/Maschine (v2 Felder)
**Konsumenten:** Provisioning, CustomerSite Generator, Video-Pipeline, E-Mail-Versand, QA-Gate

### Was dieses Dokument ist

- JSON-Schema-Definition fuer alle maschinenlesbaren Prospect-Daten
- Variablen-Referenz (welches Feld wohin fliesst)
- Validierungsregeln

### Was dieses Dokument NICHT ist

- Keine Psychologie (-> gold_contact.md / schatztruhe_final.md)
- Keine Pipeline-Beschreibung (-> machine_manifest.md)
- Keine Szenen-Spezifikation (-> video_manifest.md)

---

## Schema v2.0

### Block 1: Scout-Output (aus v1.0 — unveraendert)

```json
{
  "version": "2.0",
  "slug": "weinberger-ag",
  "name": "Jul. Weinberger AG",
  "generated_at": "2026-03-09T14:00:00Z",

  "scoring": {
    "icp_score": 9,
    "tier": "HOT",
    "trust": 5,
    "gap": 2,
    "reasons": ["Trust 5: 4.4★ x 20 Reviews", "Gap 2: Website veraltet"]
  },

  "leckerli": {
    "recommendation": "A+B-Full+C+D",
    "best_demo_case": "Samstag-Nacht-Notfall: Rohrbruch -> Lisa -> SMS -> Ops-Fall in 3 Min",
    "modus": 2
  },

  "company": {
    "legal_name": "Jul. Weinberger AG",
    "short_name": "Weinberger",
    "founding_year": 1912,
    "gewerke": ["Sanitaer", "Heizung", "Lueftung", "Badsanierung"],
    "employees_estimate": null,
    "brand_color": "#004994"
  },

  "contact": {
    "phone": "044 721 22 23",
    "phone_e164": "+41447212223",
    "email": "info@julweinberger.ch",
    "website": "https://www.julweinberger.ch",
    "address": {
      "street": "Zuercherstrasse 73",
      "zip": "8800",
      "city": "Thalwil",
      "canton": "ZH"
    }
  },

  "services": [
    { "name": "Sanitaer", "slug": "sanitaer", "icon": "bath", "verified": true }
  ],

  "emergency": {
    "enabled": true,
    "phone_e164": "+41447212223",
    "label": "24h Notdienst",
    "keywords_detected": ["Pikett", "24h", "Notdienst"]
  },

  "reviews": {
    "google_rating": 4.4,
    "google_reviews": 20,
    "google_url": "https://www.google.com/maps/place/Jul.+Weinberger+AG",
    "source": "handwerker.ch"
  },

  "team": [
    { "name": "Christian Weinberger", "role": "Geschaeftsleitung", "source": "sanitaervergleich.ch" }
  ],

  "data_sources": [
    "julweinberger.ch",
    "handwerker.ch",
    "sanitaervergleich.ch"
  ],

  "crawl_metadata": {
    "pages_visited": 8,
    "images_found": 164,
    "images_selected": 17,
    "crawled_at": "2026-03-09T10:00:00Z",
    "crawler": "crawl-website.mjs"
  }
}
```

### Block 2: Outreach-Felder (NEU in v2.0)

```json
{
  "outreach": {
    "anrede": "Herr Weinberger",
    "prospect_email": "c.weinberger@julweinberger.ch",
    "region_reference": "am Zuerichsee",
    "video_hook": "Haustechnik seit 1912 in Thalwil",
    "gewerke_text": "Sanitaer- und Heizungsbetriebe",
    "demo_scenario": {
      "category": "Heizung",
      "description": "Heizung komplett ausgefallen",
      "zip": "8800",
      "city": "Thalwil",
      "urgency": "hoch",
      "address": "Seestrasse 15",
      "reporter_name": "Mueller"
    }
  }
}
```

### Block 3: Provisioning-Output (NEU in v2.0)

```json
{
  "provisioning": {
    "tenant_id": null,
    "twilio_number": null,
    "twilio_number_display": null,
    "sms_sender_name": null,
    "voice_agent_id_de": null,
    "voice_agent_id_intl": null,
    "start_url": null,
    "kunden_url": null,
    "ops_url": null,
    "magic_link": null,
    "provisioned_at": null
  }
}
```

### Block 4: Asset-Status (NEU in v2.0)

```json
{
  "assets": {
    "website_capture": null,
    "lisa_call_audio": null,
    "sms_proof": null,
    "leitstand_capture": null,
    "wizard_capture": null,
    "start_page_capture": null,
    "founder_narration": null,
    "video_raw": null,
    "video_final": null,
    "loom_url": null,
    "loom_thumbnail": null
  }
}
```

### Block 5: QA-Status (NEU in v2.0)

```json
{
  "qa": {
    "smoke_test": null,
    "auto_checks_passed": 0,
    "auto_checks_total": 9,
    "manual_checks_passed": 0,
    "manual_checks_total": 3,
    "ready_to_send": false,
    "qa_completed_at": null,
    "notes": null
  }
}
```

---

## Feld-Definitionen (v2.0 Erweiterungen)

### outreach (Required vor Versand)

| Feld | Typ | Beschreibung | Beispiel |
|------|-----|-------------|----------|
| `anrede` | string | Formelle Anrede | "Herr Weinberger" |
| `prospect_email` | string | Entscheider-E-Mail (nicht info@) | "c.weinberger@julweinberger.ch" |
| `region_reference` | string | Regionale Verortung fuer E-Mail + Video | "am Zuerichsee" |
| `video_hook` | string | Erster Satz im Video (Spiegel) | "Haustechnik seit 1912 in Thalwil" |
| `gewerke_text` | string | Gewerke als lesbarer Text | "Sanitaer- und Heizungsbetriebe" |
| `demo_scenario` | object | Seed-Case-Szenario fuer Proof-Capture | Siehe Schema oben |

### provisioning (Automatisch befuellt nach Provisioning)

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `tenant_id` | UUID | Supabase tenant ID |
| `twilio_number` | string (E.164) | Zugewiesene Testnummer |
| `twilio_number_display` | string | Lesbare Form: "043 505 11 01" |
| `sms_sender_name` | string (max 11 Chars) | Alphanumerischer SMS-Absender |
| `voice_agent_id_de` | string | Retell Agent ID (DE) |
| `voice_agent_id_intl` | string | Retell Agent ID (INTL) |
| `start_url` | URL | /start/[slug] |
| `kunden_url` | URL | /kunden/[slug] (Modus 1) oder null (Modus 2) |
| `ops_url` | URL | /ops |
| `magic_link` | URL | Prospect-Login-Link |
| `provisioned_at` | ISO 8601 | Zeitpunkt |

### assets (Befuellt durch Proof-Capture-Pipeline)

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `website_capture` | path | Prospect-Website Screenshot/Recording |
| `lisa_call_audio` | path | Audio vom Testanruf |
| `sms_proof` | path | SMS-Beweis (Screenshot oder Rendering) |
| `leitstand_capture` | path | Leitstand mit seeded Cases |
| `wizard_capture` | path | Wizard-Formular ausgefuellt |
| `start_page_capture` | path | /start/[slug] |
| `founder_narration` | path | Founder-Narrations-Segmente |
| `video_raw` | path | Zusammengesetztes Roh-Video |
| `video_final` | path | QA-bestandenes Final-Video |
| `loom_url` | URL | Loom-Link nach Upload |
| `loom_thumbnail` | URL | Loom-Thumbnail CDN URL |

### qa (Befuellt durch QA-Pipeline)

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `smoke_test` | "PASS" / "FAIL" | E2E Smoke: Voice + SMS + Dashboard |
| `auto_checks_passed` | integer | Bestandene automatische Checks (von 9) |
| `manual_checks_passed` | integer | Bestandene manuelle Checks (von 3) |
| `ready_to_send` | boolean | true wenn alle Checks PASS |
| `qa_completed_at` | ISO 8601 | Zeitpunkt des letzten QA-Durchlaufs |

---

## Variablen-Referenz (welches Feld wohin fliesst)

| Variable | Quelle im Manifest | Konsument |
|----------|-------------------|-----------|
| `{legal_name}` | company.legal_name | E-Mail, Video-Script, Voice Agent, /start |
| `{short_name}` | company.short_name | SMS-Sender, Leitstand-Header, Tab-Titel |
| `{anrede}` | outreach.anrede | E-Mail Subject + Body |
| `{ansprechpartner}` | team[0].name | E-Mail, Follow-up-Call |
| `{city}` | contact.address.city | E-Mail, Video, Lisa PLZ |
| `{zip}` | contact.address.zip | Lisa-Anruf, SMS, Seed-Case |
| `{region_ref}` | outreach.region_reference | E-Mail Body, Video-Script |
| `{founder_ort}` | Statisch: "Oberrieden" | E-Mail Body |
| `{gewerke_text}` | outreach.gewerke_text | E-Mail Body |
| `{founding_year}` | company.founding_year | Video Hook |
| `{google_stars}` | reviews.google_rating | /start Seite |
| `{google_count}` | reviews.google_reviews | /start Seite |
| `{website_url}` | contact.website | Video Szene 1 (Modus 2) |
| `{test_phone}` | provisioning.twilio_number_display | E-Mail, Video CTA, /start |
| `{test_phone_e164}` | provisioning.twilio_number | tel:-Links |
| `{start_url}` | provisioning.start_url | E-Mail Link 3 (Modus 2) |
| `{kunden_url}` | provisioning.kunden_url | E-Mail Link 3 (Modus 1) |
| `{modus}` | leckerli.modus | Video-Template-Routing, E-Mail-Template-Routing |
| `{brand_color}` | company.brand_color | /start, /kunden |
| `{sms_sender}` | provisioning.sms_sender_name | SMS + Video-Beweis |
| `{loom_url}` | assets.loom_url | E-Mail Link 1 |
| `{loom_thumbnail}` | assets.loom_thumbnail | E-Mail Thumbnail |
| `{video_hook}` | outreach.video_hook | Video Szene 1, Teleprompter |
| `{demo_scenario}` | outreach.demo_scenario | Seed-Data, Video-Script |
| `{prospect_email}` | outreach.prospect_email | E-Mail Empfaenger |

---

## Modus-Routing

| Feld | Modus 1 (Full) | Modus 2 (Extend) |
|------|---------------|-----------------|
| `leckerli.modus` | 1 | 2 |
| Video Szene 1 | /kunden/{slug} (neue Website) | {website_url} (seine echte) |
| E-Mail Link 3 | {kunden_url} | {start_url} |
| Video-Hook | "Ich habe fuer {legal_name} eine Website gebaut" | "{video_hook}" (aus Prospect-Daten) |
| Video-Dauer | 150-160s | 130-140s |
| Provisioning | FULL (CustomerSite + Deploy + Voice + Seed) | LIGHT (/start + Voice + Seed) |

---

## Validierung (v2.0)

### Gate 1: Scout-Output (vor Provisioning)
```
v1.0 Validierung (unveraendert):
  slug vorhanden und kebab-case
  icp_score >= 6
  mindestens 1 phone_e164
  mindestens 1 Service
  mindestens 1 Gewerk
  leckerli.recommendation gesetzt
  data_sources nicht leer
```

### Gate 2: Outreach-Ready (vor Versand)
```
v2.0 Validierung (NEU):
  outreach.anrede gesetzt
  outreach.prospect_email gesetzt und nicht info@
  outreach.region_reference gesetzt
  outreach.video_hook gesetzt
  outreach.demo_scenario komplett
  provisioning.tenant_id gesetzt
  provisioning.twilio_number gesetzt
  provisioning.sms_sender_name gesetzt und <= 11 Chars
  assets.loom_url gesetzt
  qa.ready_to_send === true
```

---

## Migration von v1.0

Bestehende `prospect_card.json` Dateien (Weinberger, Leuthold) behalten alle v1.0 Felder. Neue v2.0 Bloecke (`outreach`, `provisioning`, `assets`, `qa`) werden ergaenzt. `version` Feld wird auf "2.0" aktualisiert.

**Goldene Regel #1 gilt weiterhin:** Keine erfundenen Fakten. Outreach-Felder (`anrede`, `region_reference`, `video_hook`) muessen aus verifizierten Quellen abgeleitet sein.
