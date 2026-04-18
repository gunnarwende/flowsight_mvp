# Pipeline V2 — Gold-Contact-Maschine

> **Ziel:** 10 Betriebe / Tag, maximal persoenlich, high-end, skalierbar.
> **Strang:** Einer. Kein Website-Bau (Modul 1 eliminiert).
> **Referenz:** Doerfler AG = Gold-Standard (vollstaendig provisioniert).

## 3 Goldene Regeln

1. **Niemals herleiten.** Nur verwenden was schwarz auf weiss auf der Website steht.
2. **Ein JSON pro Betrieb = Single Source of Truth.** `tenant_config.json` steuert alles.
3. **Max 3-5 Founder-Entscheidungen pro Betrieb.** Rest laeuft autonom.

## Pipeline-Flow

```
Scout → Crawl+Extract → Derive Config → Provision → Video Production → Outreach
  |         |                |               |              |              |
  v         v                v               v              v              v
ICP>=7   crawl_extract    tenant_config    Voice Agent    4 Takes        E-Mail
         .json            .json            Wizard         MP4s           +Video
                                           Seed                         +Follow-up
                                           Leitsystem
```

## 6 Schritte

| # | Schritt | Owner | Input | Output | Spec |
|---|---------|-------|-------|--------|------|
| 1 | **Scout** | CC auto | Region + Gewerk | prospect_card.json, ICP Score | [01_scout/](01_scout/) |
| 2 | **Crawl + Extract** | CC auto | Website URL | crawl_extract.json (verifiziert) | [02_crawl_extract/](02_crawl_extract/) |
| 3 | **Derive Config** | CC auto + Founder (3-5 Items) | crawl_extract + prospect_card | tenant_config.json | [03_derive_config/](03_derive_config/) |
| 4 | **Provision** | CC auto | tenant_config.json | Voice Agent, Wizard, Seed, Leitsystem | [04_provision/](04_provision/) |
| 5 | **Video Production** | CC + Founder (Audio+Kamera) | tenant_config + Audio | 4 MP4s (Take 1-4) | [05_video_production/](05_video_production/) |
| 6 | **Outreach** | CC auto + Founder (Freigabe) | Videos + E-Mail-Template | Versand + Follow-up | [06_outreach/](06_outreach/) |

## Ordnerstruktur pro Betrieb

```
docs/customers/{slug}/
  prospect_card.json      ← Scout
  crawl_extract.json      ← Crawl+Extract
  tenant_config.json      ← Derive Config (SSOT)
  status.md               ← Manueller Tracker
  links.md                ← URLs
  crawl/                  ← Bilder + Rohdaten
```

## Templates

- [crawl_extract_template.json](_templates/crawl_extract_template.json)
- [tenant_config_template.json](_templates/tenant_config_template.json)
