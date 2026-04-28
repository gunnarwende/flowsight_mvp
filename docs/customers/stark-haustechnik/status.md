# Stark Haustechnik GmbH -- Status

**Slug:** stark-haustechnik
**Modus:** 2 (hat eigene Website: stark-haustechnik.ch)
**ICP:** 8 (HOT)
**Paket:** A+B-Full+C+D
**Stand:** 2026-04-15
**Tenant-ID:** (noch nicht provisioniert)
**Twilio-Nr:** (noch nicht zugewiesen)

## Eckdaten
- Firma: Stark Haustechnik GmbH
- Standort: Zuerichstrasse 103, 8134 Adliswil (+ Ackerstrasse 8, 8135 Langnau a.A.)
- Gewerke: Sanitaer, Heizung, Lueftung, Energieberatung, Umbau
- 24/7 Pikettdienst
- Google: 4.8 / 18 Bewertungen
- Geschaeftsfuehrung: Shkelzen Malici (GF), Jetmir Aliu (Partner)
- Brand Color: #003478
- Oeffnungszeiten: Mo-Fr 08:00-17:00 (Website, Founder-Bestaetigung OFFEN)

## Leckerli-Status

| Leckerli | Was | Status |
|----------|-----|--------|
| **D** | /start-Seite (Modus 2) | OFFEN |
| **B-Full** | Voice Agent (Lisa DE + INTL) | OFFEN |
| **C** | E2E Proof (Tenant, SMS, Ops-Fall) | OFFEN |
| **A** | Video | OFFEN |

## Provisioning-Status
- [ ] Supabase Tenant erstellen
- [ ] Twilio-Nummer zuweisen
- [ ] Voice Agent (DE + INTL) konfigurieren + publishen
- [ ] Demo-Daten seeden (70 Cases)
- [ ] Prospect Access (Magic Link)
- [ ] /start-Seite verifizieren
- [ ] Smoke-Test (1x Intake + 1x Info + 1x Sprachwechsel)

## Founder-Aktionen (OFFEN)
- [ ] Oeffnungszeiten bestaetigen
- [ ] Notdienst-Policy klaeren
- [ ] Preis-Policy entscheiden
- [ ] Prospect-E-Mail beschaffen (persoenlich, nicht info@)
- [ ] Twilio-Nummer kaufen und SIP Trunk konfigurieren

## Provisioning-Kommandos (Reihenfolge beachten)

### Voraussetzung: Founder-Aktionen erledigt
Bevor CC provisionieren kann, muss der Founder folgendes liefern:
1. Oeffnungszeiten bestaetigen (Mo-Fr 08:00-17:00 korrekt? Mittagspause?)
2. Notdienst-Policy klaeren (24/7 ueber welche Nummer?)
3. Preis-Policy entscheiden (deflect oder Richtwerte)
4. Prospect-E-Mail (persoenliche Adresse von Shkelzen Malici)
5. Twilio-Nummer kaufen + SIP Trunk → Retell konfigurieren

### Phase 1: Voice Agent vorbereiten (CC, ~20 Min)
```bash
# 1a. Agent-JSONs aus Template erstellen
#     Kopiere retell/templates/agent_template_de.json → retell/exports/stark-haustechnik_agent.json
#     Kopiere retell/templates/agent_template_intl.json → retell/exports/stark-haustechnik_agent_intl.json
#     Ersetze alle Platzhalter ({{company_name}}, {{address}}, etc.)
#     Kategorien: Sanitaer, Heizung, Lueftung, Verstopfung, Leck, Boiler, Rohrbruch
#     KRITISCH: is_transfer_cf: true auf BEIDEN Flows

# 1b. Global Prompt erstellen
#     Kopiere retell/templates/global_prompt_de.txt
#     Ersetze 23 Platzhalter mit Stark-Daten aus prospect_card.json

# 1c. Sync + Publish
node --env-file=src/web/.env.local scripts/_ops/retell_sync.mjs --prefix stark-haustechnik
```

### Phase 2: Tenant provisionieren (CC, ~5 Min)
```bash
# 2a. Option A: provision_trial.mjs (Full Pipeline — empfohlen)
node --env-file=src/web/.env.local scripts/_ops/provision_trial.mjs \
  --slug=stark-haustechnik \
  --name="Stark Haustechnik GmbH" \
  --phone="+41XXXXXXXXXX" \
  --prospect-email=PROSPECT_EMAIL_HERE \
  --modules=voice,website_wizard,ops,reviews,sms \
  --gewerk=sanitaer \
  --seed-count=70 \
  --no-welcome-mail

# 2b. Option B: Schrittweise (falls provision_trial nicht passt)
# Schritt 1: Tenant + Nummer
node --env-file=src/web/.env.local scripts/_ops/onboard_tenant.mjs \
  --name "Stark Haustechnik GmbH" \
  --slug stark-haustechnik \
  --phone "+41XXXXXXXXXX" \
  --modules voice,website_wizard,ops,reviews \
  --color "#003478"

# Schritt 2: Demo-Daten (nach Tenant-ID bekannt)
node --env-file=src/web/.env.local scripts/_ops/seed_demo_data_v2.mjs \
  --slug=stark-haustechnik --count=70 --clean

# Schritt 3: Prospect Access
node --env-file=src/web/.env.local scripts/_ops/create_prospect_access.mjs \
  --slug=stark-haustechnik --email=PROSPECT_EMAIL_HERE
```

### Phase 3: Google Reviews crawlen (CC, ~2 Min)
```bash
node --env-file=src/web/.env.local scripts/_ops/crawl_google_reviews.mjs \
  --slug=stark-haustechnik
```

### Phase 4: Brand Color sync (CC, ~1 Min)
```bash
node --env-file=src/web/.env.local scripts/_ops/sync_brand_colors.mjs
```

### Phase 5: Verifizierung (CC + Founder)
```
1. /start/stark-haustechnik aufrufen — Daten korrekt?
2. Wizard testen: /start/stark-haustechnik/meldung → Fall anlegen
3. Leitstand pruefen: /ops → 70 Demo-Cases + neuer Wizard-Fall sichtbar?
4. Voice Smoke-Test (Founder):
   a. Intake-Anruf: "Rohrbruch im Keller, dringend"
   b. Info-Anruf: "Was sind Ihre Oeffnungszeiten?"
   c. Sprachwechsel: Auf Englisch sprechen → INTL-Agent
5. SMS pruefen: Nach Intake-Anruf SMS erhalten?
6. Ergebnis in status.md dokumentieren
```

## Datenquellen
- stark-haustechnik.ch (Homepage, Kontakt)
- search.ch / local.ch
- Google Maps (4.8/18)
- ICP Stresstest-Profil (Profil 9)
