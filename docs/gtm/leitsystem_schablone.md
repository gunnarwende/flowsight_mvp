# Leitsystem-Schablone — Tenant-Konfiguration pro Betrieb

**Version:** 1.0 | **Datum:** 2026-04-10
**Zweck:** Definitive Vorlage für die Einrichtung des Leitsystems pro neuem Betrieb.
**Referenz:** `docs/gtm/machine_manifest.md` (Schritt 4: Provisionieren)

---

## Übersicht: Was definiert einen Betrieb im Leitsystem?

```
Betrieb (Tenant)
├── 1. Identität         → Name, Slug, Prefix, Farbe
├── 2. Module            → Voice, Wizard, OPS, Reviews, SMS
├── 3. Telefon-Routing   → Nummer → Tenant-Zuordnung
├── 4. Team              → Mitarbeiter für Fallzuweisung
├── 5. Website-Config    → CustomerSite TypeScript (Branding, Services, Kategorien)
├── 6. Voice Agent       → DE + INTL (siehe voice_agent_schablone)
└── 7. Demo-Daten        → 15 Seed-Cases für Trial
```

---

## 1. Identität (tenants-Tabelle)

| Feld | Platzhalter | Beispiel Dörfler | Quelle | Pflicht? |
|------|-------------|-----------------|--------|----------|
| `slug` | `{{slug}}` | doerfler-ag | Aus Firmennamen abgeleitet (lowercase, kebab-case) | JA |
| `name` | `{{legal_name}}` | Dörfler AG | Scout/Website (Handelsregister-Name) | JA |
| `case_id_prefix` | `{{prefix}}` | DOE | 2-3 Buchstaben, eindeutig, aus Firmennamen | JA |
| `modules.primary_color` | `{{brand_color}}` | #2b6cb0 | Aus Website extrahiert (dominante Farbe) | JA |
| `modules.leitsystem_name` | `{{short_name}}` | Dörfler | Kurzname für Tab-Titel / PWA | NEIN (auto-abgeleitet) |

**Ableitung `case_id_prefix`:** Erste 2-3 Buchstaben des Firmennamens, Grossbuchstaben. Muss eindeutig sein.
- Dörfler AG → DOE
- Walter Leuthold → WL
- Weinberger AG → WB
- Brunner Haustechnik → BH

**Ableitung `brand_color`:** Aus alter Website oder Logo extrahieren. NIEMALS FlowSight-Farben verwenden. Der Betrieb muss SEINE Farbe im Leitsystem sehen.

---

## 2. Module (tenants.modules JSONB)

| Modul | Standard | Was es aktiviert | Bedingung |
|-------|----------|-----------------|-----------|
| `voice` | `true` | Retell Voice Agent, Webhook, SMS nach Anruf | Twilio-Nummer zugewiesen |
| `website_wizard` | `true` | Meldungsformular auf Website | CustomerSite-Config vorhanden |
| `ops` | `true` | Leitsystem-Zugang (/ops) | Immer (Kern-Feature) |
| `reviews` | `true` | Bewertungsanfragen, Google-Sync | Google Business Profile URL gesetzt |
| `sms` | `true` | Post-Call SMS mit Korrekturlink | eCall-Sender verifiziert |

**SMS-Sender:** `modules.sms_sender_name` = max 11 alphanumerische Zeichen, KEIN Leerzeichen.
- Dörfler AG → `DoerflerAG`
- Walter Leuthold → `WLeuthold`
- Weinberger AG → `Weinberger`

---

## 3. Telefon-Routing (tenant_numbers-Tabelle)

| Feld | Wert | Beschreibung |
|------|------|-------------|
| `phone_number` | `+41445057420` | Twilio-Nummer im E.164 Format |
| `tenant_id` | (UUID) | Zuordnung zum Tenant |
| `active` | `true` | Routing aktiv |

**Workflow:** `provision_trial.mjs` oder `seed_tenant_number.mjs` erstellt den Eintrag automatisch.

**Kosten:** CHF ~3/Monat pro Twilio-Nummer (Schweizer Festnetz). Bei Skalierung: prüfen ob geteilte Nummern möglich (SIP-Routing).

---

## 4. Team (staff-Tabelle)

Pro Mitarbeiter eine Zeile:

| Feld | Pflicht? | Beispiel |
|------|----------|---------|
| `display_name` | JA | Ramon Dörfler |
| `role` | NEIN | Geschäftsleitung |
| `email` | NEIN | ramon@doerflerag.ch |
| `phone` | NEIN | +41794567890 |
| `is_active` | JA | true |

**Minimum:** Mindestens 1 Mitarbeiter (der Inhaber). Ohne Staff-Einträge funktioniert die Fallzuweisung nicht.

**Quelle:** Scout/Website (Team-Seite), prospect_card.json, oder Founder-Bestätigung.

---

## 5. Website-Config (CustomerSite TypeScript)

**Datei:** `src/web/src/lib/customers/{{slug}}.ts`
**Registrierung:** `src/web/src/lib/customers/registry.ts`

### Pflichtfelder

| Feld | Platzhalter | Beschreibung |
|------|-------------|-------------|
| `slug` | `{{slug}}` | Muss mit tenants.slug übereinstimmen |
| `companyName` | `{{legal_name}}` | Vollständiger Firmenname |
| `tagline` | `{{tagline}}` | Hero-Zeile (z.B. "Ihr Sanitärspezialist seit 1926") |
| `brandColor` | `{{brand_color}}` | Hex-Farbe (wird via sync_brand_colors.mjs in DB synchronisiert) |
| `contact.address` | `{{address}}` | Vollständige Adresse |
| `contact.phone` | `{{phone}}` | Telefonnummer (formatiert) |
| `contact.email` | `{{email}}` | Firmen-E-Mail |
| `services[]` | — | Array mit allen Leistungen (Name, Icon, Beschreibung) |
| `serviceArea` | — | Region + Gemeinden |
| `categories[]` | — | Wizard-Kategorien (**MUSS mit Voice Agent übereinstimmen!**) |

### Optionale Felder

| Feld | Wann setzen |
|------|-------------|
| `voicePhone` | Wenn Voice-Modul aktiv (Testnummer für Kunden) |
| `emergency` | Wenn Notdienst angeboten wird |
| `team[]` | Wenn Team-Sektion gewünscht |
| `reviews` | Wenn Google-Bewertungen vorhanden |
| `gallery[]` | Wenn Bilder vorhanden (gecrawlt oder geliefert) |
| `history[]` | Wenn Firmengeschichte relevant (Jubiläum etc.) |

---

## 6. Voice Agent (Querverweis)

Siehe: `retell/templates/agent_template_de.md`

**Kritische Übereinstimmungen:**
- `categories[]` in CustomerSite MUSS identisch sein mit Voice Agent `post_call_analysis_data.category`
- `services[]` in CustomerSite informiert das FIRMEN-WISSEN im Voice Agent Prompt
- `contact.openingHours` MUSS mit Voice Agent Öffnungszeiten übereinstimmen
- `emergency.enabled` MUSS mit Voice Agent Notdienst-Policy übereinstimmen

---

## 7. Demo-Daten (Seed)

**Tool:** `scripts/_ops/seed_demo_data.mjs --tenant-id <uuid> --count 15`

Erstellt realistische Testfälle:
- 15 Fälle (konfigurierbar)
- Verschiedene Status (neu, in_arbeit, warten, done)
- Verschiedene Quellen (voice, wizard, manual)
- Verschiedene Kategorien (aus Tenant-Services)
- Schweizer Adressen aus dem Einzugsgebiet
- `is_demo: true` (separater Tab im Leitsystem)

---

## Provisionierungs-Checkliste (pro Betrieb)

### Vor Start (Daten sammeln)

- [ ] prospect_card.json komplett (Scout-Output)
- [ ] Brand Color extrahiert (aus Website/Logo)
- [ ] Öffnungszeiten bestätigt (Founder)
- [ ] Notdienst-Policy geklärt (24/7 oder eingeschränkt)
- [ ] Team-Mitglieder bekannt (mindestens Inhaber)
- [ ] Kategorien definiert (aus Services abgeleitet)

### Provisionierung (CC, ~20 Min)

| # | Schritt | Tool | Dauer |
|---|---------|------|-------|
| 1 | Tenant anlegen | `provision_trial.mjs --slug {{slug}} --name "{{legal_name}}"` | 2 Min |
| 2 | Brand Color setzen | `sync_brand_colors.mjs` oder DB-Update | 1 Min |
| 3 | Staff anlegen | DB-Insert (staff-Tabelle) | 2 Min |
| 4 | CustomerSite Config | Kopiere Template, ersetze Platzhalter | 5 Min |
| 5 | Voice Agent | Kopiere Schablone, ersetze Platzhalter, `retell_sync.mjs` | 5 Min |
| 6 | Demo-Daten | `seed_demo_data.mjs` | 1 Min |
| 7 | Smoke-Test | 1x Anruf + 1x Wizard + 1x Leitsystem-Login | 4 Min |

### Smoke-Test Kriterien

- [ ] Leitsystem zeigt Betriebsname + Brand Color
- [ ] Tab-Titel = Kurzname (z.B. "Dörfler OPS")
- [ ] Fall-IDs haben korrekten Prefix (z.B. DOE-0001)
- [ ] Demo-Fälle sichtbar im Demo-Tab
- [ ] Voice Agent antwortet mit Firmennamen
- [ ] Wizard-Formular zeigt korrekte Kategorien
- [ ] SMS-Sender zeigt korrekten Absendernamen

---

## Abhängigkeiten zwischen Schablonen

```
prospect_card.json
    ↓
    ├── Voice Agent Schablone (retell/templates/)
    │     ├── 23 Platzhalter aus Firmendaten
    │     └── categories[] MUSS mit CustomerSite übereinstimmen
    │
    ├── Leitsystem Schablone (dieses Dokument)
    │     ├── tenants-Tabelle
    │     ├── staff-Tabelle
    │     ├── tenant_numbers
    │     └── modules (Entitlements + Config)
    │
    └── CustomerSite Config (src/web/src/lib/customers/)
          ├── Branding, Services, Team, Kategorien
          └── brandColor → sync_brand_colors.mjs → tenants.modules.primary_color
```

**Goldene Regel:** `prospect_card.json` ist die EINZIGE Eingangs-Quelle. Daraus werden ALLE drei Schablonen befüllt. Keine manuelle Dateneingabe an verschiedenen Stellen.

---

## Skalierungs-Vision

| Phase | Betriebe/Tag | Wie |
|-------|-------------|-----|
| Jetzt | 1 | Manuell, Schablone als Checkliste |
| Ab Betrieb 5 | 2-3 | Script `provision_full.mjs` automatisiert Schritte 1-6 |
| Ab Betrieb 20 | 5-10 | Vollautomatisch: prospect_card → alle Schablonen → deployed |

**Langfrist-Ziel:** `provision_full.mjs --prospect doerfler-ag` macht ALLES — Tenant, Staff, Voice Agent, Website, Demo-Daten, Smoke-Test. Input: nur prospect_card.json.
