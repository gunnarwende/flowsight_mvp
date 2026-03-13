# Jul. Weinberger AG — Status

**Slug:** weinberger-ag
**Rolle:** GTM Goldstandard (ICP 90+, Leckerli A+B+C+D)
**Stand:** 2026-03-13
**Tenant-ID:** fc4ba994-c99c-4c17-9fa7-6c10bd0d6fa8
**Twilio-Nr:** +41 43 505 11 01

## Eckdaten
- Gründung: 1912
- Standort: Zürcherstrasse 73, 8800 Thalwil
- Gewerke: Sanitär, Heizung, Lüftung, Badsanierung
- 24h-Pikett-Service
- Google: 4.4★ / 20 Bewertungen
- Brand Color: #004994

## Leckerli-Status

| Leckerli | Was | Status |
|----------|-----|--------|
| **D** | Website (Services, Team, Notdienst, Wizard) | **DONE** ✅ (PR #116) |
| **B-Full** | Eigener Voice Agent (Lisa DE + INTL, Ela Voice) | **DONE** ✅ (PRs #118+#126+#127) — Quality Wave: Closing Fix, FAQ-safe, Grüezi, PLZ→City (24 Orte), Notfall-Empathie v2 |
| **C** | E2E Proof (Tenant, SMS, Ops-Fall) | **TESTBAR** ✅ — SMS + Review URL konfiguriert (PR #143), INTL Agent Fix |
| **A** | Video (11 Szenen, 130-140s Rohschnitt) | **PRODUCTION-READY** — schatztruhe_final.md + production_brief.md v2.0 fertig. Blocker: DEMO_SIP_CALLER_ID auf Vercel verifizieren |

## Infrastruktur (Leckerli C)

| Komponente | Status | Detail |
|------------|--------|--------|
| Supabase Tenant | ✅ | `fc4ba994-...`, Module: voice, wizard, ops, reviews, sms |
| Phone Routing | ✅ | +41435051101 → tenant_id via tenant_numbers |
| SMS Channel | ✅ | Sender: "Weinberger", alphanumeric |
| Webhook | ✅ | flowsight-mvp.vercel.app/api/retell/webhook |
| Voice Agents | ✅ | DE + INTL published (Ela Voice), Quality Wave v2: Closing Fix, FAQ-safe, Grüezi, PLZ Lookup |
| Review Surface | ✅ | /review/[caseId] — Google-style, HMAC-validated, tenant-dynamic |
| Wizard | ✅ | /kunden/weinberger-ag/meldung + /start/weinberger-ag/meldung |
| Persönlicher Einstieg | ✅ | /start/weinberger-ag (Spiegel-Effekt, Modus 2) |
| Ops Dashboard | ✅ | /ops → Fälle sichtbar |

### Testanruf-Anleitung (Founder)

1. **Anrufen:** +41 43 505 11 01 (von persönlichem Handy)
2. **Testfall durchspielen:** "Guten Tag, ich habe ein Wasserleck im Keller. Es ist dringend."
3. **Lisa antwortet → Daten angeben:**
   - PLZ: 8800, Ort: Thalwil
   - Adresse: Seestrasse 15
   - Name: Müller
   - Telefon: (deine Handynummer)
4. **Nach Anruf prüfen:**
   - [ ] SMS erhalten? Sender: "Weinberger"
   - [ ] SMS enthält Korrekturlink? (`/v/...`)
   - [ ] Ops Dashboard: /ops → Fall sichtbar?
   - [ ] Fall-Details: Kategorie, Dringlichkeit, PLZ korrekt?
5. **Ergebnis an CC melden** → CC dokumentiert Evidence + markiert C als DONE

## Datenquellen (Goldene Regel #1: keine erfundenen Fakten)
- julweinberger.ch (Sitemap, Impressum, Kontakt)
- local.ch / search.ch (Adresse, Telefon, Kategorien)
- handwerker.ch (Google Rating 4.4/20, Zertifizierungen)
- daibau.ch (Detaillierte Services, Kontaktperson: Herr Gür)
- sanitaervergleich.ch (Kontaktperson: Christian Weinberger)
- LinkedIn (Michael Fleischlin — Projektleiter Sanitär)
