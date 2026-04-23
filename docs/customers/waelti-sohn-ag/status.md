# Waelti & Sohn AG -- Status

**Slug:** waelti-sohn-ag
**Modus:** 2 (hat eigene Website: waeltisohn.ch, Wix)
**ICP:** 8 (HOT)
**Paket:** A+B-Full+C+D
**Stand:** 2026-04-15
**Tenant-ID:** (noch nicht provisioniert)
**Twilio-Nr:** (noch nicht zugewiesen)

## Eckdaten
- Firma: Waelti & Sohn AG
- Standort: Gartenweg 2, 8135 Langnau am Albis
- Gewerke: Sanitaer, Heizung
- Gruendung: 1983 (3 Generationen)
- Google: 4.6 / 237 Bewertungen (regionale Dominanz)
- Geschaeftsfuehrung: UNBEKANNT (Founder muss klaeren)
- Brand Color: UNBEKANNT (Wix nicht crawlbar)
- Oeffnungszeiten: UNBEKANNT (Founder muss beschaffen)

## Leckerli-Status

| Leckerli | Was | Status |
|----------|-----|--------|
| **D** | /start-Seite (Modus 2) | OFFEN |
| **B-Full** | Voice Agent (Lisa DE + INTL) | BLOCKED (Oeffnungszeiten, GL-Name, Notdienst fehlen) |
| **C** | E2E Proof (Tenant, SMS, Ops-Fall) | OFFEN |
| **A** | Video | OFFEN |

## Provisioning-Status
- [ ] BLOCKER: Oeffnungszeiten beschaffen (Founder)
- [ ] BLOCKER: Ansprechpartner identifizieren (Founder)
- [ ] BLOCKER: E-Mail beschaffen (Founder)
- [ ] BLOCKER: Notdienst-Policy klaeren (Founder)
- [ ] Supabase Tenant erstellen
- [ ] Twilio-Nummer zuweisen
- [ ] Voice Agent (DE + INTL) konfigurieren + publishen
- [ ] Demo-Daten seeden (70 Cases)
- [ ] Prospect Access (Magic Link)
- [ ] /start-Seite verifizieren
- [ ] Smoke-Test (1x Intake + 1x Info + 1x Sprachwechsel)

## Founder-Aktionen (KRITISCH — 4 Blocker)
- [ ] **Oeffnungszeiten** beschaffen (Mo-Fr? Samstag? Mittagspause?)
- [ ] **Ansprechpartner** identifizieren (Name des GL / Inhabers — vermutlich Herr Waelti)
- [ ] **E-Mail** beschaffen (weder auf Website noch in Verzeichnissen)
- [ ] **Notdienst-Policy** klaeren (24/7? Eingeschraenkt? Nicht vorhanden?)
- [ ] Preis-Policy entscheiden (deflect oder Richtwerte)
- [ ] Prospect-E-Mail fuer Magic Link
- [ ] Twilio-Nummer kaufen und SIP Trunk konfigurieren
- [ ] Brand Color entscheiden (oder CC crawlt mit Puppeteer)

## Provisioning-Kommandos (Reihenfolge beachten)

### Voraussetzung: Founder-Aktionen erledigt (4 BLOCKER)
Bevor CC provisionieren kann, muss der Founder folgendes liefern:
1. **BLOCKER** Oeffnungszeiten (Mo-Fr? Samstag? Mittagspause?)
2. **BLOCKER** Ansprechpartner-Name (GL / Inhaber — vermutlich Herr Waelti)
3. **BLOCKER** E-Mail-Adresse (keine auf Website/Verzeichnissen gefunden)
4. **BLOCKER** Notdienst-Policy (vorhanden? 24/7? Eingeschraenkt?)
5. Preis-Policy entscheiden (deflect oder Richtwerte)
6. Brand Color (Wix nicht crawlbar — Founder Screenshot oder CC Puppeteer)
7. Prospect-E-Mail (persoenliche Adresse des Entscheidungstraegers)
8. Twilio-Nummer kaufen + SIP Trunk → Retell konfigurieren

### Phase 1: Voice Agent vorbereiten (CC, ~20 Min) — NACH Blocker-Aufloesung
```bash
# 1a. Agent-JSONs aus Template erstellen
#     Kopiere retell/templates/agent_template_de.json → retell/exports/waelti-sohn-ag_agent.json
#     Kopiere retell/templates/agent_template_intl.json → retell/exports/waelti-sohn-ag_agent_intl.json
#     Ersetze alle Platzhalter ({{company_name}}, {{address}}, etc.)
#     Kategorien: Sanitaer, Heizung, Verstopfung, Leck, Boiler, Rohrbruch
#     KRITISCH: is_transfer_cf: true auf BEIDEN Flows

# 1b. Global Prompt erstellen
#     Kopiere retell/templates/global_prompt_de.txt
#     Ersetze 23 Platzhalter mit Waelti-Daten aus prospect_card.json
#     ACHTUNG: opening_hours, emergency_policy, owner_names muessen erst vom Founder kommen!

# 1c. Sync + Publish
node --env-file=src/web/.env.local scripts/_ops/retell_sync.mjs --prefix waelti-sohn-ag
```

### Phase 2: Tenant provisionieren (CC, ~5 Min)
```bash
# 2a. Option A: provision_trial.mjs (Full Pipeline — empfohlen)
node --env-file=src/web/.env.local scripts/_ops/provision_trial.mjs \
  --slug=waelti-sohn-ag \
  --name="Waelti & Sohn AG" \
  --phone="+41XXXXXXXXXX" \
  --prospect-email=PROSPECT_EMAIL_HERE \
  --modules=voice,website_wizard,ops,reviews,sms \
  --gewerk=sanitaer \
  --seed-count=70 \
  --no-welcome-mail

# 2b. Option B: Schrittweise (falls provision_trial nicht passt)
# Schritt 1: Tenant + Nummer
node --env-file=src/web/.env.local scripts/_ops/onboard_tenant.mjs \
  --name "Waelti & Sohn AG" \
  --slug waelti-sohn-ag \
  --phone "+41XXXXXXXXXX" \
  --modules voice,website_wizard,ops,reviews \
  --color "BRAND_COLOR_HERE"

# Schritt 2: Demo-Daten (nach Tenant-ID bekannt)
node --env-file=src/web/.env.local scripts/_ops/seed_demo_data_v2.mjs \
  --slug=waelti-sohn-ag --count=70 --clean

# Schritt 3: Prospect Access
node --env-file=src/web/.env.local scripts/_ops/create_prospect_access.mjs \
  --slug=waelti-sohn-ag --email=PROSPECT_EMAIL_HERE
```

### Phase 3: Google Reviews crawlen (CC, ~2 Min)
```bash
node --env-file=src/web/.env.local scripts/_ops/crawl_google_reviews.mjs \
  --slug=waelti-sohn-ag
```

### Phase 4: Brand Color sync (CC, ~1 Min)
```bash
# Erst nach Brand Color Entscheid
node --env-file=src/web/.env.local scripts/_ops/sync_brand_colors.mjs
```

### Phase 5: Verifizierung (CC + Founder)
```
1. /start/waelti-sohn-ag aufrufen — Daten korrekt?
2. Wizard testen: /start/waelti-sohn-ag/meldung → Fall anlegen
3. Leitstand pruefen: /ops → 70 Demo-Cases + neuer Wizard-Fall sichtbar?
4. Voice Smoke-Test (Founder):
   a. Intake-Anruf: "Rohrbruch im Keller, dringend"
   b. Info-Anruf: "Was sind Ihre Oeffnungszeiten?"
   c. Sprachwechsel: Auf Englisch sprechen → INTL-Agent
5. SMS pruefen: Nach Intake-Anruf SMS erhalten?
6. Ergebnis in status.md dokumentieren
```

## Datenquellen
- waeltisohn.ch (Wix, client-rendered — limitierte Daten)
- search.ch (Adresse, Telefon, Services, 1983, 3 Generationen)
- local.ch (Adresse — 'Wuenscht keine Werbung')
- Google Maps (4.6/237)
- ICP Stresstest-Profil (Profil 11)

## Besonderheit
237 Google-Bewertungen = mit Abstand die meisten in der Region. Dieser Betrieb hat
offenbar ein funktionierendes Bewertungs-System (aktiv oder passiv). Das ist ein starkes
Signal fuer Qualitaet und Volumen — aber auch ein Hinweis, dass Review-Management
(Leckerli im Produkt) hier weniger Pain-Point ist als Fallverwaltung bei Volumen.
