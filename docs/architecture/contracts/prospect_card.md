# Prospect Card Contract (SSOT)

**Erstellt:** 2026-03-11 | **Owner:** CC
**Referenz:** `docs/gtm/gtm_pipeline_plan_v2.md` (Abschnitt 5 — G1)
**Regel:** Jeder Prospect bekommt eine `prospect_card.json` in `docs/customers/<slug>/`.

---

## Zweck

Die Prospect Card ist das strukturierte Bindeglied zwischen **Scout** (Entdeckung) und **Provisioning** (Assets bauen). Sie enthält alle verifizierten Fakten über einen Prospect und die daraus abgeleitete Leckerli-Empfehlung.

**Erzeuger:** `prospect_pipeline.mjs --url` oder manuell
**Konsumenten:** Provisioning Runbook, Einsatzlogik-Engine, Quality Gates, Pipeline Tracker

---

## JSON Schema

```json
{
  "version": "1.0",
  "slug": "weinberger-ag",
  "name": "Jul. Weinberger AG",
  "generated_at": "2026-03-09T14:00:00Z",

  "scoring": {
    "icp_score": 9,
    "tier": "HOT",
    "trust": 5,
    "gap": 2,
    "reasons": [
      "Trust 5: 4.4★ × 20 Reviews",
      "Gap 2: hat Website (Elementor, veraltet)"
    ]
  },

  "leckerli": {
    "recommendation": "A+B-Full+C+D",
    "best_demo_case": "Samstag-Nacht-Notfall: Rohrbruch → Lisa → SMS → Ops-Fall in 3 Min",
    "modus": 2
  },

  "company": {
    "legal_name": "Jul. Weinberger AG",
    "short_name": "Weinberger",
    "founding_year": 1912,
    "gewerke": ["Sanitär", "Heizung", "Lüftung", "Badsanierung"],
    "employees_estimate": null,
    "brand_color": "#004994"
  },

  "contact": {
    "phone": "044 721 22 23",
    "phone_e164": "+41447212223",
    "email": "info@julweinberger.ch",
    "website": "https://www.julweinberger.ch",
    "address": {
      "street": "Zürcherstrasse 73",
      "zip": "8800",
      "city": "Thalwil",
      "canton": "ZH"
    }
  },

  "services": [
    { "name": "Sanitär", "slug": "sanitaer", "icon": "bath", "verified": true },
    { "name": "Heizung", "slug": "heizung", "icon": "flame", "verified": true },
    { "name": "Lüftung", "slug": "lueftung", "icon": "snowflake", "verified": true },
    { "name": "Badsanierung", "slug": "badsanierung", "icon": "water", "verified": true },
    { "name": "Kundendienst", "slug": "kundendienst", "icon": "wrench", "verified": true }
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
    "source": "handwerker.ch (aggregiert Google)"
  },

  "team": [
    { "name": "Christian Weinberger", "role": "Geschäftsleitung", "source": "sanitaervergleich.ch" },
    { "name": "Michael Fleischlin", "role": "Projektleiter Sanitär", "source": "LinkedIn" }
  ],

  "data_sources": [
    "julweinberger.ch (Sitemap, Impressum, Kontakt)",
    "local.ch / search.ch (Adresse, Telefon, Kategorien)",
    "handwerker.ch (Google Rating 4.4/20, Zertifizierungen)",
    "daibau.ch (Detaillierte Services, Kontaktperson: Herr Gür)",
    "sanitaervergleich.ch (Kontaktperson: Christian Weinberger)",
    "LinkedIn (Michael Fleischlin — Projektleiter Sanitär)"
  ],

  "crawl_metadata": {
    "pages_visited": 8,
    "images_found": 164,
    "images_selected": 17,
    "crawled_at": "2026-03-09T10:00:00Z",
    "crawler": "crawl-website.mjs (Puppeteer)"
  }
}
```

---

## Feld-Definitionen

### Required Fields

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `version` | string | Schema-Version ("1.0") |
| `slug` | string | Kebab-case Identifier (`^[a-z0-9]+(-[a-z0-9]+)*$`) |
| `name` | string | Offizieller Firmenname |
| `generated_at` | ISO 8601 | Zeitpunkt der Card-Erstellung |
| `scoring.icp_score` | integer 0-10 | ICP Score aus Scout |
| `scoring.tier` | enum | "HOT" / "WARM" / "COLD" |
| `leckerli.recommendation` | string | Paket-Empfehlung (siehe Einsatzlogik) |
| `leckerli.modus` | integer 1-3 | Website-Modus: 1=Full, 2=Extend, 3=Pure System (siehe `einsatzlogik.md`) |
| `leckerli.best_demo_case` | string | Stärkster Demo-Fall für diesen Prospect |
| `company.gewerke` | string[] | Mindestens 1 Gewerk |
| `contact.phone_e164` | string | E.164 Format, mindestens 1 Nummer |
| `services` | object[] | Mindestens 1 Service mit name + slug |

### Optional Fields

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `company.founding_year` | integer | Gründungsjahr (wenn verifiziert) |
| `company.employees_estimate` | integer | Mitarbeiterzahl (wenn verifiziert) |
| `company.brand_color` | string | Hex Color (wenn aus Meta-Tag oder manuell) |
| `team` | object[] | Nur verifizierte Personen (Goldene Regel #1) |
| `emergency` | object | Nur wenn Notdienst nachweisbar |
| `reviews` | object | Nur wenn Google Rating verfügbar |
| `crawl_metadata` | object | Automatisch von prospect_pipeline.mjs |
| `data_sources` | string[] | Quellen-Nachweis (Goldene Regel #1) |

---

## Einsatzlogik (ICP Score → Leckerli-Paket)

| ICP Score | Tier | Leckerli-Paket | Setup-Zeit |
|-----------|------|---------------|------------|
| 90+ (≥9) | HOT | A+B-Full+C+D | ~45 Min |
| 75-89 (7-8) | HOT/WARM | A+B-Full+D | ~35 Min |
| 60-74 (6) | WARM | B-Full+D | ~30 Min |
| <60 (<6) | COLD | SKIP | — |

### Best Demo Case Heuristik

Der `best_demo_case` wird aus Gewerk + Emergency + Region abgeleitet:

| Gewerk | Emergency | Empfohlener Demo-Fall |
|--------|-----------|----------------------|
| Sanitär | 24h | "Samstag-Nacht-Notfall: Rohrbruch → Lisa → SMS → Ops" |
| Sanitär | nein | "Montag-Morgen Anfrage: Tropfender Wasserhahn → Termin" |
| Heizung | 24h | "Winter-Notfall: Heizung ausgefallen → Lisa → Sofort-Pikett" |
| Heizung | nein | "Herbst-Anfrage: Heizungswartung → Terminplanung" |
| Sanitär+Heizung | 24h | "Samstag-Nacht-Notfall: Rohrbruch → Lisa → SMS → Ops" |
| Spenglerei | * | "Sturmschaden: Dach undicht → Lisa → Notfall-Triage" |

---

## Integration

### prospect_pipeline.mjs (geplant)

```bash
# Erzeugt prospect_card.json als Teil des Crawl-Outputs
node scripts/_ops/prospect_pipeline.mjs --url https://julweinberger.ch --slug weinberger-ag

# Output: docs/customers/weinberger-ag/prospect_card.json
```

### scout.mjs → prospect_card.json

Scout liefert `scoring` (icp_score, tier, trust, gap, reasons). Die restlichen Felder werden durch den Crawl ergänzt.

### Quality Gate 1 Validierung

```
✅ slug vorhanden und kebab-case
✅ icp_score >= 6 (≥60 auf 100er-Skala)
✅ mindestens 1 phone_e164
✅ mindestens 1 Service
✅ mindestens 1 Gewerk
✅ website erreichbar (oder "keine Website" bewusst dokumentiert)
✅ leckerli.recommendation gesetzt
✅ data_sources nicht leer
```

---

## Goldene Regel #1

> Keine erfundenen Fakten. Jeder Eintrag in der Prospect Card muss aus einer verifizierten Quelle stammen. Das `data_sources` Array dokumentiert alle Quellen. Team-Einträge MÜSSEN eine `source` haben.
