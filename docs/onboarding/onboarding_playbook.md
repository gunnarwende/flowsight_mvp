# FlowSight — Onboarding-Playbook (Live-Schaltung Kunde)

**Zweck:** Generischer Leitfaden für die Live-Schaltung eines neuen FlowSight-Kunden. Schritt-für-Schritt, was Founder vom Kunden braucht, was der Kunde vom Founder bekommt. Erprobt mit Erstkunde Big Ben Pub (Paul, Oberrieden).

**Branchen:** Funktioniert für Sanitär (Standard) und Pub/Gastro (BigBen-Modul). Branchen-spezifische Schritte sind markiert.

---

## TL;DR — In 5 Schritten Live

1. **Kunden-Inputs sammeln** (vor dem Termin) — Logo, Fotos, Telefon, Email, Google Business, Provider-Login
2. **Tenant einrichten** (Founder, ~30 Min) — DB-Tenant, Voice-Agent, Website, App-Zugang
3. **Vor-Ort-Termin** (~60 Min mit Kunden) — Live-Schaltung, App auf Handy, E2E-Test
4. **Übergabe-Materialien** an Kunden (PWA-Anleitung, Erste-Hilfe-Guide)
5. **Post-Live-Validierung** (24-48h) — erste echte Anrufe/Reservierungen monitoren

---

## Phase 1 — Vor dem Termin: Kunden-Inputs sammeln

### Was du vom Kunden brauchst (vorab via Email/WhatsApp)

| # | Was | Format | Pflicht | Branchen-Note |
|---|-----|--------|---------|---------------|
| 1 | **Telefon-Provider-Zugang** (für Rufweiterleitung) | Login zum Selfcare-Portal (Swisscom/Sunrise/Salt) | ✅ | Live-Blocker |
| 2 | **Pub/Firmen-Telefonnummer** (echt, die weitergeleitet wird) | +41 ... | ✅ | |
| 3 | **Kunden-Email** (für OTP-Login zur App) | persönlich oder business | ✅ | |
| 4 | **Logo** | SVG/PNG transparent | ❌ Nice-to-have | Kunde hat oft nur als Bilddatei |
| 5 | **15-20 Fotos** (Lokal/Werkstatt, Team, Produkt/Service) | JPG/PNG min. 1200px | ✅ Sanitär+Gastro | Galerie blockiert ohne |
| 6 | **Speise-/Preiskarte** (falls relevant) | Foto/PDF/Text | Pub: ✅ | Gastro-only |
| 7 | **Öffnungszeiten** (final, je Wochentag) | Text | ✅ | |
| 8 | **Google Business Profile** | URL bestätigt | ✅ | Reviews + Maps |
| 9 | **Notdienst-Policy** (Sanitär) | Text | Sanitär: ✅ | "24h Notdienst" oder leer = Preis-Variante |
| 10 | **Events-Liste** (Pub) | Text/Liste | Pub: ✅ | Wochenrhythmus (Karaoke Mi/Quiz Fr/etc.) |

**Versendet als:** ein einziges Email mit Liste + Antwort-by-Reply. Vorlage:

> "Hi {Name}, damit wir am {Datum} um {Uhrzeit} live gehen können, brauche ich vorab folgende Punkte. Wenn etwas fehlt, sagt es mir — wir finden eine Lösung:
>   1. Login zu deinem Telefon-Provider-Selfcare (Swisscom/...)
>   2. Deine Telefonnummer die weitergeleitet werden soll
>   3. Die Email die du für deine FlowSight-App nutzen willst
>   4. 15-20 Fotos vom Lokal/Team/Service
>   5. Speise-/Preiskarte (falls Gastro)
>   6. Öffnungszeiten je Wochentag
>   7. Google Business Profile-URL
>
> Antwortet einfach hier oder per WhatsApp. Bis bald, {Founder}"

### Was du vorab selber recherchierst

- **Crawl der bestehenden Website:** `node scripts/_tools/crawl-website.mjs --url <kunden-url>` — extrahiert Adresse, Telefon, Services, Brand-Color, Reviews
- **Zefix-Verifikation:** Handelsregister-Eintrag (UID, offizieller Name, Sitz)
- **Google Places API:** Rating + Review-Anzahl + letzte 5 Reviews
- **ICP-Score** (Sanitär): Erreichbarkeit, Reviews-Anzahl, Website-Stand → Ranking
- **Brand-Color** aus Website extrahiert (Hero/Header)

---

## Phase 2 — Vor dem Termin: Tenant einrichten (Founder, ~30 Min)

### Sanitär-Pipeline (Standard)

```bash
# 1. Auto-Provisioning aus Crawl
node scripts/_ops/pipeline_run.mjs --url <kunden-url> --slug <slug>
# → erzeugt: docs/customers/<slug>/tenant_config.json (SSOT für alles)
#           docs/customers/<slug>/founder_review.md (zur Sicht-Kontrolle)
#           docs/customers/<slug>/links.md

# 2. Founder-Review prüfen → ggf. Korrekturen eintragen
# Inhalt: Was Lisa am Telefon sagt, Wizard-Kategorien, Voice-Agent-Konfig

# 3. Provisioning ausführen
node scripts/_ops/pipeline_run.mjs --slug <slug> --from provision
# → erstellt: Supabase Tenant, Voice Agents (DE+INTL), Demo-Cases (50-70),
#            /kunden/<slug>/, /start/<slug>/, /ops/welcome
```

### Pub/Gastro-Pipeline (BigBen-Modul)

```bash
# Für Pub-Tenants: separates Modul (events, reservations statt cases)
# Manuell via Supabase + scripts (siehe docs/customers/bigben-pub/onboarding_plan.md)
```

### Voice-Agent (beide Branchen)

```bash
# Schablone-Generator
node scripts/_ops/audio/generate_voice_agent.mjs --slug <slug>
# → erstellt: retell/exports/<slug>_agent.json (DE) + _intl.json (INTL)

# Sync zu Retell + Publish
node scripts/_ops/retell_sync.mjs --slug <slug>
# → API-Call zu Retell, Agent live published
```

### Twilio-Nummer

- **Erst nach positiver Rückmeldung kaufen** (Kostenoptimierung)
- Twilio-Console: Schweizer Nummer (Festnetz, fra1-Region)
- Voice-URL auf Retell-Webhook setzen
- Tenant-Config aktualisieren mit `voice_agent_phone`

---

## Phase 3 — Vor-Ort-Termin: Live-Schaltung (~60 Min mit Kunden)

### Ablauf

**00:00 — Begrüssung & kurzer Recap (5 Min)**
- "Heute schalten wir alles scharf — von jetzt an läuft FlowSight für dich."
- Was passiert heute: Rufweiterleitung einrichten, App installieren, Test-Anruf, Bestätigung.

**00:05 — Rufweiterleitung beim Telefon-Provider (15 Min) ⚡ Live-Blocker**

Für Swisscom (häufigster Fall):
1. Login auf swisscom.ch/login mit Kunden-Credentials
2. Gehe zu **Festnetz → Rufweiterleitung**
3. **Nummer eintragen:** Voice-Agent-Nummer (z.B. +41 44 505 48 18)
4. **Weiterleitung-Typ:** "Sofort weiterleiten" oder "Wenn besetzt + nicht beantwortet" (je nach Kundenwunsch)
5. **Speichern** → Bestätigungs-SMS / Email kommt
6. **Test-Anruf direkt:** Mit Founder-Handy auf Kunden-Pub-Nummer anrufen → muss bei Lisa landen

> Falls Kunde keinen Selfcare-Login hat: Provider-Hotline anrufen mit Kunden + Stellvertretung-Vollmacht.

**00:20 — App-Install auf Kunden-Handy (10 Min)**

iPhone (Safari):
1. URL eintippen: `flowsight.ch/ops/app/<slug>`
2. Teilen-Symbol unten → "Zum Home-Bildschirm hinzufügen"
3. Name bestätigen ("Big Ben Pub" / "Müller Sanitär")
4. App-Icon erscheint auf Home-Screen → öffnen
5. OTP-Login: Email eintippen → 6-stelliger Code aus Email → fertig

Android (Chrome):
1. URL eintippen
2. Drei-Punkte-Menü → "App installieren" oder "Zum Startbildschirm hinzufügen"
3. Rest wie iPhone

> **Wichtig:** OTP-Login funktioniert nur, wenn die Kunden-Email vorher in der Tenant-Config als `notification_email` eingetragen ist.

**00:30 — App-Walkthrough mit Kunden (15 Min)**

Sanitär: Cases (Neu/In Arbeit/Erledigt), Termin-Picker, Bewertungs-Anfrage, Push-Settings.
Pub: 6 Cards (Reservations, Guest Watch, Events, Sports, Website, Bookings). Walk-in Quick-Add zeigen. SMS-Bestätigung erklären.

**00:45 — Test-Anruf E2E (10 Min)**

1. Founder ruft Kunden-Nummer an → landet bei Voice-Agent (Lisa)
2. Reservierung/Fall durchspielen (Name, Telefon, Anliegen, Datum, Uhrzeit)
3. **In der App prüfen:** Reservierung/Fall erscheint? (Sanitär: ~30s Polling, Pub: ~1 Min)
4. **SMS prüfen:** Bestätigungs-SMS an Test-Nummer angekommen?
5. Kunden-Confirm-Aktion (Pub) oder Termin-Vergabe (Sanitär) durchspielen
6. **Reminder-SMS:** 24h-Vorher-SMS-Job triggert automatisch (cron `lifecycle-tick`)

**00:55 — Übergabe & Q&A (5 Min)**
- Handout-PDF: 1-Pager "Was tun wenn..." (siehe Phase 4)
- Founder-Telefon für Notfälle 24/7 (für die ersten 2 Wochen)
- Nächster Touchpoint: Tag 7 Check-in-Anruf

---

## Phase 4 — Übergabe-Materialien an Kunden

### Handout — Erste-Hilfe-Guide (1-Pager, gedruckt + WhatsApp-Link)

**Was du jetzt hast:**
- Eine FlowSight-App auf deinem Home-Screen
- Lisa als 24/7 Telefonassistentin
- Alle Anrufe/Reservierungen kommen automatisch in deine App + per SMS

**Was du tun musst:**
- App **mindestens 1× pro Tag** öffnen (Reservierungen bestätigen, Fälle pflegen)
- Push-Benachrichtigungen einschalten (App fragt beim ersten Öffnen)

**Was du NICHT mehr machen musst:**
- Kein Telefon mehr abnehmen, wenn du nicht willst — Lisa antwortet
- Keine Reservierungen handschriftlich notieren
- Keine SMS einzeln tippen — kommt automatisch

**Was tun wenn...?**
- ...ein Anruf nicht bei Lisa landet → Provider-Rufweiterleitung prüfen (Selfcare-Portal)
- ...eine Reservierung nicht in der App ankommt → Founder anrufen, max. 1h Reaktion
- ...die App nicht öffnet → Browser-Cache leeren, neu installieren via Link
- ...Lisa was Falsches sagt → Founder anrufen, Voice-Agent updaten (Same-Day-Fix)

### Welcome-Email (24h vorher automatisch)

`/ops/welcome` sendet eine Email mit:
- Bestätigung dass die Live-Schaltung kommt
- App-Install-Link
- Telefon-Forwarding-Anleitung (Schritt-für-Schritt)
- Founder-Telefonnummer für Notfälle

---

## Phase 5 — Post-Live-Validierung (24-48h)

### Checkliste 24h nach Live

- [ ] Erste echten Anrufe gelandet bei Lisa? (Retell-Dashboard prüfen)
- [ ] Mindestens 1 Reservierung/Fall in der DB?
- [ ] Kunden-App-Login mindestens 1× passiert?
- [ ] Kunde hat bestätigt dass alles funktioniert?
- [ ] Morning-Report (07:30 UTC) zeigt RED/YELLOW? → Founder reagiert sofort.

### Tag-7 Check-in (Telefon mit Kunden)

- "Wie läuft's? Was funktioniert gut?"
- "Gibt's was, was wir besser machen können?"
- "Ist die App ein Mehrwert oder nervt sie?"
- → Lessons-Learned-Log: `docs/customers/<slug>/lessons-learned.md`

### Tag-14 Decision-Day (Trial-Kunden)

Sanitär-Trials: Tag 14 ist End-of-Trial. Founder entscheidet:
- **Convert** (Standard CHF 299/Mo) → Vertrag, Bezahlung läuft
- **Live-Dock** (3 Wochen Verlängerung) → wenn Kunde noch unentschieden
- **Offboard** (`offboard_tenant.mjs`) → Tenant löschen, Welcome-Email "Schade"

---

## Anhang A — Live-Blocker-Bug-Liste (vor jedem Termin prüfen)

Vor jedem Live-Termin:
1. ✅ Voice-Agent published (Retell Dashboard: `is_published: true`)
2. ✅ Tenant-Config-Datum aktuell (fragments wie "heute" werden korrekt aufgelöst)
3. ✅ `notification_email` gesetzt
4. ✅ Voice→DB Pipeline läuft (Test-Anruf prüft)
5. ✅ App-PWA installierbar (manifest.json, service-worker)
6. ✅ SMS-Provider funktioniert (eCall.ch / Twilio Account-Stand)

---

## Anhang B — Pro Branche spezifische Erweiterungen

### Sanitär
- Wizard-Einstieg (`/start/<slug>` oder `/kunden/<slug>/meldung`)
- Notdienst-Variante via `emergency_policy`
- 24h Reminder-Email an Endkunden
- Bewertungs-Engine (Pre-Filter ≥4★ → Google, ≤3★ → intern)

### Pub/Gastro
- Walk-in Quick-Add
- Yellow/Red Card No-Show-System
- Events/Sports tabs (Wochenrhythmus)
- 24h SMS Reminder an Gäste
- Voice-Events statisch im Prompt — manuell vor Founder-Reise updaten

---

## Anhang C — Häufige Probleme & Fixes

| Problem | Ursache | Fix |
|---------|---------|-----|
| Anruf landet nicht bei Lisa | Rufweiterleitung nicht aktiv | Provider-Selfcare prüfen |
| App-Login schlägt fehl | OTP-Email nicht angekommen | notification_email prüfen, Spam-Ordner |
| Reservierung kommt nicht in App | Polling-Cron stale | Manueller Trigger via API + Polling-Status prüfen |
| Voice nennt falsches Datum | Statisches Datum im Prompt | Voice-Agent-JSON updaten + retell_sync |
| SMS kommt nicht an | Nummer nicht E.164 | Format prüfen: +41... |
| Push kommt nicht an | Push-Subscription nicht gespeichert | Browser-Permissions prüfen, App neu öffnen |

---

**Update-History:**
- 2026-04-28 | CC | Initial-Version aus BigBen Pub Live-Setup-Erfahrung
