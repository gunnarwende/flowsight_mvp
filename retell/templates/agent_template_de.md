# Voice Agent Template (DE) — Schablone

**Version:** 1.0 | **Datum:** 2026-04-10
**Zweck:** Goldstandard-Vorlage für jeden neuen Betrieb. Platzhalter mit `{{...}}` werden pro Betrieb ersetzt.
**Basis:** Brunner Haustechnik AG (Gold) + alle Learnings aus Dörfler/Weinberger/Leuthold.
**Referenz:** `docs/gtm/machine_manifest.md` (Schritt 4: Provisionieren → Voice Agent konfigurieren)

---

## Pflicht-Daten pro Betrieb (müssen VOR Agent-Erstellung vorliegen)

| # | Feld | Platzhalter | Quelle | Pflicht? |
|---|------|-------------|--------|----------|
| 1 | Firmenname | `{{company_name}}` | Scout/Website | JA |
| 2 | Adresse | `{{address}}` | Scout/Website | JA |
| 3 | Telefon | `{{phone}}` | Scout/Website | JA |
| 4 | E-Mail | `{{email}}` | Scout/Website | JA |
| 5 | Website | `{{website}}` | Scout | JA |
| 6 | Gegründet | `{{founded}}` | Scout/Website | NEIN (nice to have) |
| 7 | Geschäftsleitung | `{{owner_names}}` | Scout/Website | JA |
| 8 | Team | `{{team_description}}` | Scout/Website | NEIN (nur wenn verifiziert) |
| 9 | Öffnungszeiten | `{{opening_hours}}` | **Founder bestätigt** | JA |
| 10 | Notdienst-Policy | `{{emergency_policy}}` | **Founder bestätigt** | JA |
| 11 | Leistungen | `{{services_list}}` | Scout/Website | JA |
| 12 | Einzugsgebiet | `{{service_area}}` | Scout/Website | JA |
| 13 | Google-Bewertungen | `{{google_rating}}` | Scout/Google | NEIN (nice to have) |
| 14 | Mitgliedschaften | `{{memberships}}` | Scout/Website | NEIN |
| 15 | Preis-Policy | `{{price_policy}}` | **Founder entscheidet** | JA (deflect oder Richtwerte) |
| 16 | Kategorien (Voice) | `{{categories}}` | Aus Services abgeleitet | JA |
| 17 | INTL Agent ID | `{{intl_agent_id}}` | retell_sync.mjs | JA (automatisch) |
| 18 | DE Agent ID | `{{de_agent_id}}` | retell_sync.mjs | JA (automatisch) |

---

## Checkliste vor Agent-Erstellung

- [ ] Alle Pflicht-Daten vorhanden (1-12, 15-16)
- [ ] Öffnungszeiten vom Founder bestätigt
- [ ] Notdienst-Policy geklärt (24/7 oder eingeschränkt)
- [ ] Preis-Policy entschieden (deflect vs. Richtwerte)
- [ ] prospect_card.json vollständig
- [ ] Website gecrawlt, Fakten verifiziert

---

## Erstellungs-Workflow

```
1. Template kopieren → retell/exports/{prefix}_agent.json
2. Platzhalter ersetzen (Firmen-Wissen)
3. Kategorien anpassen (aus Website-Services)
4. Delta-Themen prüfen (Preise? Team-Grösse? Spezial-Services?)
5. retell_sync.mjs --prefix {prefix} → published
6. Smoke-Test: 1x Intake-Anruf + 1x Info-Anruf
7. Ergebnis in status.md dokumentieren
```

**Zeitaufwand:** ~20 Minuten pro Betrieb (nach erstem Durchlauf)
