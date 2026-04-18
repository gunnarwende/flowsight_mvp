# Schritt 3: Derive Config — Entscheidungsmatrix

> **Tool:** `scripts/_ops/derive_config.mjs`
> **Input:** `crawl_extract.json` + `prospect_card.json`
> **Output:** `docs/customers/{slug}/tenant_config.json`
> **Dauer:** ~10 Sekunden (automatisch) + 3-5 Founder-Entscheidungen

## Prinzip

Aus verifizierten Crawl-Daten werden AUTOMATISCH alle System-Konfigurationen abgeleitet.
Nur was NICHT ableitbar ist, geht an den Founder.

## Voice Agent — 23 Platzhalter

| # | Placeholder | Quelle | Ableitung | AUTO/FOUNDER |
|---|-------------|--------|-----------|--------------|
| 1 | `company_name` | crawl.firma | Direkt | AUTO |
| 2 | `domain` | crawl.leistungen (Keys) | "Sanitaer und Heizung" o.ae. | AUTO |
| 3 | `owner_names` | crawl.inhaber | Direkt | AUTO (null wenn nicht gefunden) |
| 4 | `address` | crawl.adresse | Direkt | AUTO |
| 5 | `phone` | crawl.telefon | Hauptnummer | AUTO |
| 6 | `email` | crawl.email | info@ bevorzugt | AUTO |
| 7 | `website` | crawl.website_url | Direkt | AUTO |
| 8 | `founded` | crawl.gruendung | Direkt oder leer | AUTO |
| 9 | `team_section` | crawl.team_groesse + crawl.inhaber | Text generieren | AUTO |
| 10 | `memberships` | crawl.mitgliedschaften | Komma-separiert | AUTO |
| 11 | `google_rating` | crawl.google | "4.7 Sterne bei 237 Bewertungen" | AUTO |
| 12 | `opening_hours` | crawl.oeffnungszeiten | Formatiert | AUTO |
| 13 | `emergency_policy` | crawl.notdienst | Default: leer (kein Notdienst) | AUTO (skip) |
| 14 | `services_list` | crawl.leistungen | Aufzaehlung | AUTO |
| 15 | `service_area` | crawl.einzugsgebiet ODER PLZ-Radius | Auto-Derive wenn nicht gefunden | AUTO |
| 16 | `price_section` | — | Default: leer | AUTO |
| 17 | `jobs_section` | crawl.stellenangebote | Text oder leer | AUTO |
| 18 | `opening_hours_spoken` | crawl.oeffnungszeiten | Natuerliche Sprache generieren | AUTO |
| 19 | `service_area_spoken` | wie 15 | Natuerliche Sprache | AUTO |
| 20 | `price_deflect` | — | Default: "Vor Ort anschauen" | AUTO |
| 21 | `jobs_spoken` | crawl.stellenangebote | Text oder "Aktuell keine offenen Stellen" | AUTO |
| 22 | `address_spoken` | crawl.adresse | Natuerliche Sprache | AUTO |
| 23 | `categories` | crawl.leistungen → Wizard-Kategorien | Pipe-separiert | AUTO |

**Ergebnis: 0 Founder-Entscheidungen fuer Voice Agent** (bei Default-Policy).

## Wizard-Kategorien

**Regel:** Max 5 Custom-Kategorien + 3 Fixed (Allgemein, Angebot, Kontakt) = max 8 total.

**Ableitung aus crawl.leistungen:**

| Leistung auf Website | → Wizard-Kategorie | iconKey |
|---------------------|-------------------|---------|
| Verstopfung, Abfluss, WC | Verstopfung | drain |
| Leck, tropft, undicht, Wasserschaden | Leck | drop |
| Heizung, Heizkoerper, Waermepumpe | Heizung | flame |
| Boiler, Warmwasser, Entkalkung | Boiler | thermometer |
| Rohrbruch, Wasserrohr | Rohrbruch | pipe |
| Lueftung, Klimaanlage | Lueftung | wind |
| Umbau, Sanierung, Bad | Umbau/Sanierung | wrench |

**Doerfler-Beispiel:** Leistungen = Sanitaer → Verstopfung, Leck, Heizung (3 Custom + 3 Fixed = 6)

**Voice-Agent-Kategorien = Wizard-Kategorien + spezifischere Unterkategorien.**
Voice erkennt "Boiler" und "Rohrbruch" als eigene Kategorien, Wizard fasst sie unter "Allgemein".

## Seed-Konfiguration

| Feld | Ableitung | AUTO/FOUNDER |
|------|-----------|--------------|
| `case_count` | team_groesse → Solo:15, Klein:30, Mittel:50, Gross:80 | AUTO |
| `google_rating` | crawl.google.rating | AUTO |
| `google_review_count` | crawl.google.review_count | AUTO |
| `categories` | Wizard-Kategorien (gewichtet nach Leistungsschwerpunkt) | AUTO |
| `team_names` | crawl.inhaber (wenn vorhanden) | AUTO |
| `service_area_plz` | PLZ aus Adresse + 15km Radius (PLZ_CITY_MAP) | AUTO |
| `featured_case` | Realistischer Notfall aus Hauptkategorie + Adresse aus Einzugsgebiet | AUTO |

## Video-Konfiguration

| Feld | Ableitung | AUTO/FOUNDER |
|------|-----------|--------------|
| `firma_display` | crawl.firma | AUTO |
| `firma_silben` | Silbenzaehlung (automatisch) | AUTO |
| `telefon_display` | crawl.telefon (formatiert) | AUTO |
| `prefix` | Erste 2 Buchstaben des Firmennamens, uppercase | AUTO |
| `modus` | Immer 2 (kein Website-Bau) | AUTO |
| `google_stars` | crawl.google.rating | AUTO |
| `video_hook` | crawl.gruendung ODER crawl.werte ODER crawl.google | AUTO |
| `betriebsspezifische_frage` | Aus crawl.leistungen oder crawl.gruendung ableiten | AUTO |

## Tenant-Konfiguration

| Feld | Ableitung | AUTO/FOUNDER |
|------|-----------|--------------|
| `slug` | Firmenname → kebab-case | AUTO |
| `name` | crawl.firma | AUTO |
| `case_id_prefix` | Erste 2 Buchstaben, unique check | AUTO |
| `brand_color` | crawl.brand_color (auto-extrahiert) | AUTO |
| `sms_sender_name` | Firmenname max 11 Zeichen, keine Sonderzeichen | AUTO |

## Founder-Entscheidungen (nur diese 3-5)

| # | Entscheidung | Wann | Default wenn nicht beantwortet |
|---|-------------|------|-------------------------------|
| 1 | `prospect_email` | Immer | Kein Default — MUSS beantwortet werden |
| 2 | `brand_color` | Nur wenn Auto-Extraktion fehlschlaegt | Neutral slate (#64748b) |
| 3 | `oeffnungszeiten` | Nur wenn nicht auf Website | "Bitte kontaktieren Sie uns telefonisch" |
| 4 | `video_hook_bestaetigung` | Optional | Auto-generierter Hook wird verwendet |
| 5 | `betriebsspezifische_frage_bestaetigung` | Optional | Auto-generierte Frage wird verwendet |
