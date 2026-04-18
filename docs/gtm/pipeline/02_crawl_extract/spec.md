# Schritt 2: Crawl + Extract

> **Tool:** `scripts/_ops/crawl_extract.mjs`
> **Input:** Website URL
> **Output:** `docs/customers/{slug}/crawl_extract.json`
> **Dauer:** ~2 Min pro Betrieb (automatisch)

## Methode

Playwright rendert jede Seite (inkl. Wix/JS-only Sites), extrahiert `document.body.innerText`.

## Seiten die gecrawlt werden

| Seite | URL-Muster | Was extrahiert wird |
|-------|-----------|-------------------|
| Home | `/` | Firmenname, Slogan, Werte, Ueberblick |
| Team / Ueber uns | `/team`, `/ueber-uns`, `/about` | Inhaber-Name, Gruendungsjahr, Geschichte, Team-Info |
| Dienstleistungen | `/dienstleistungen`, `/services`, `/leistungen` | KOMPLETTE Leistungsliste mit Unterpunkten |
| Kontakt | `/kontakt`, `/contact` | Adresse, Telefon, E-Mail, Oeffnungszeiten |
| Karriere / Jobs | `/karriere`, `/jobs`, `/stellen` | Offene Stellen, Lehrstellen |
| Impressum | `/impressum` | Rechtsform, Handelsregister |

Falls Seite 404 → ueberspringen, `"source": "not_found"`.

## Extraktionsfelder

| # | Feld | Typ | Quelle | Regel |
|---|------|-----|--------|-------|
| 1 | `firma` | string | Header/Impressum | Exakt wie auf Website geschrieben |
| 2 | `inhaber` | string/null | Team/Ueber-uns | NUR wenn Name explizit als GF/Inhaber genannt |
| 3 | `adresse` | string | Kontakt | Vollstaendige Adresse inkl. PLZ + Ort |
| 4 | `telefon` | string | Kontakt | Alle Nummern, Hauptnummer zuerst |
| 5 | `email` | string | Kontakt | Alle E-Mails (info@, service@, etc.) |
| 6 | `oeffnungszeiten` | object/null | Kontakt/Footer | Exakt wie geschrieben. null wenn nicht gefunden |
| 7 | `notdienst` | string/null | Kontakt/Home | NUR wenn explizit auf Website steht. Default: null |
| 8 | `google_rating` | number | Google Places API | Rating (z.B. 4.7) |
| 9 | `google_review_count` | number | Google Places API | Anzahl Reviews (z.B. 237) |
| 10 | `gruendung` | string/null | Ueber-uns | Jahr + Geschichte wenn vorhanden |
| 11 | `team_groesse` | number/null | NUR wenn Zahl auf Website | **NIEMALS aus Fotos herleiten** |
| 12 | `leistungen` | object | Dienstleistungen | Kategorien + Unterpunkte, komplett |
| 13 | `einzugsgebiet` | string/null | Home/Kontakt | NUR wenn explizit genannt |
| 14 | `mitgliedschaften` | string[]/null | Footer/Ueber-uns | suissetec, VSSH, etc. |
| 15 | `stellenangebote` | string/null | Karriere/Team | Offene Stellen wenn vorhanden |
| 16 | `markenpartner` | string[]/null | Home/Services | Nur verifizierbare Logos/Namen |
| 17 | `werte` | string/null | Home/Ueber-uns | Slogan/Leitbild wenn vorhanden |
| 18 | `brand_color` | string | Header/Logo | Hex-Farbe, automatisch extrahiert |
| 19 | `website_url` | string | Input | Die gecrawlte URL |
| 20 | `besonderheiten` | string/null | Beliebig | Showroom, Laden, Ausstellung, etc. |

## Quellen-Tags

Jedes Feld hat ein `"source"` Tag:

| Tag | Bedeutung |
|-----|-----------|
| `website_home` | Von der Startseite |
| `website_kontakt` | Von der Kontaktseite |
| `website_team` | Von Team/Ueber-uns |
| `website_services` | Von Dienstleistungen |
| `website_impressum` | Vom Impressum |
| `website_jobs` | Von Karriere-Seite |
| `google_api` | Von Google Places API |
| `not_found` | Nicht auf Website gefunden |

## Validierungsregeln

1. `verified: true` → Steht wortwörtlich auf der Website
2. `verified: false` + `action: "founder_confirm"` → Muss Founder bestaetigen
3. `verified: false` + `action: "skip"` → Wird weggelassen (kein Notdienst = kein Notdienst)
4. **VERBOTEN:** `verified: true` auf etwas das hergeleitet wurde
5. **VERBOTEN:** Team-Groesse aus Foto-Anzahl ableiten
6. **VERBOTEN:** E-Mail-Adressen konstruieren (z.B. info@ raten)

## Doerfler-Beispiel

```json
{
  "firma": { "value": "Doerfler AG", "source": "website_home", "verified": true },
  "inhaber": { "value": "Ramon Doerfler, Luzian Doerfler", "source": "website_team", "verified": true },
  "google_rating": { "value": 4.7, "source": "google_api", "verified": true },
  "google_review_count": { "value": 3, "source": "google_api", "verified": true },
  "team_groesse": { "value": null, "source": "not_found", "verified": false, "note": "Nicht auf Website angegeben" },
  "notdienst": { "value": null, "source": "not_found", "verified": false, "action": "skip" }
}
```
