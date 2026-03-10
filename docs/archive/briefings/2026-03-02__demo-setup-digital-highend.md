# Briefing: High-End Digital Demo Setup

> **Datum:** 2026-03-02 (aktualisiert 2026-03-03)
> **Von:** Claude Code (Head Ops)
> **An:** ChatGPT (CTO) + Founder
> **Anlass:** Erste Demo mit Peter (Brunner HT Rolle) — Voice-Audio-Problem bei Remote-Demo
> **Ziel:** Reproduzierbares, professionelles Remote-Demo-Setup mit Wow-Effekt
>
> **Update 2026-03-03:** Dashboard-Section aktualisiert (KPI Click-to-Filter, Case Detail UX v2, Foto-Anhänge), SMS-Demo mit Short-Link, Preise korrigiert (99/249/349), Pocket Reference synchronisiert mit `demo_script.md`.

---

## 1. Was passiert ist (Lessons Learned)

### Was funktioniert hat
- Website-Präsentation via Screen-Share (Teams) — top
- Wizard live ausfüllen → E-Mail kam sofort an — Wow-Effekt
- Dashboard: Fall öffnen, bearbeiten, Termin senden — flüssig
- Dashboard: KPI-Kacheln mit Click-to-Filter (seit N28) — Wow-Effekt
- Dashboard: Case Detail UX v2 mit Foto-Anhängen, ICS-Terminversand (seit N27) — flüssig
- Google Review-Anfrage — funktioniert
- MS Bookings Anbindung (Prospect bucht Demo-Termin) — funktioniert
- SMS-Nachverfolgung mit HMAC-gesichertem Short-Link (seit N30) — funktioniert

### Was NICHT funktioniert hat
- **Voice Agent Demo über Teams:** Founder musste Lisa (044 505 48 18) über Handy anrufen und das Handy an den Laptop-Lautsprecher halten. Prospect (Peter) hat akustisch nichts verstanden.
- **Root Cause:** Telefon-Audio lässt sich nicht nativ in einen Teams-Call routen. Handy-Lautsprecher → Laptop-Mikro = miserabel (Echo, Rauschen, Lautstärke).

### Was teilweise funktioniert
- **USB-Debug-Modus (Handy → Laptop):** Founder kann Handy-Screen am Laptop spiegeln (gut für SMS-Demo, Dashboard-Mobile-View). Aber **Audio wird NICHT über USB geroutet** — nur Bild.

---

## 2. Das Problem präzise

```
DEMO-FLOW HEUTE:

  Founder (Laptop)                    Prospect (Remote)
  ┌──────────────┐                    ┌──────────────┐
  │ Teams Call    │◄──── Video/Audio──►│ Teams Call    │
  │ Screen-Share  │                    │ Sieht Screen  │
  └──────┬───────┘                    └──────────────┘
         │
         │  (gleichzeitig)
         │
  ┌──────▼───────┐
  │ Handy-Anruf  │──── Telefon ────► Lisa (Retell/Twilio)
  │ Lautsprecher │
  └──────────────┘
         │
         ✖ Audio geht NICHT in Teams rein
         ✖ Prospect hört nichts / nur Rauschen
```

**Ziel-Zustand:**

```
  Founder (Laptop)                    Prospect (Remote)
  ┌──────────────┐                    ┌──────────────┐
  │ Teams Call    │◄──── Video/Audio──►│ Teams Call    │
  │ Screen-Share  │                    │ Sieht Screen  │
  │              │                    │ HÖRT Lisa ✅  │
  │ Lisa-Audio   │                    │               │
  │ (eingemischt)│                    └──────────────┘
  └──────────────┘
```

---

## 3. Lösungsansätze (für GPT: bitte bewerten + besten Weg empfehlen)

### Option A: Virtual Audio Cable (Software-Mixer)

**Prinzip:** Software-Tool erstellt ein virtuelles Audiogerät. Telefon-Audio (über App oder Softphone) wird in den gleichen Audio-Stream gemischt, den Teams als Mikrofon-Input nutzt.

**Tools (Windows):**
- **VoiceMeeter Banana** (gratis) — virtueller Audio-Mixer, mehrere Inputs → 1 Output
- **VB-Audio Virtual Cable** (gratis) — virtuelles Audiogerät
- **Loopback** (macOS-Äquivalent, nicht relevant hier)

**Flow:**
```
Founder Mikrofon ─────►┐
                        ├── VoiceMeeter ──► Teams (als Mikrofon-Input)
Softphone/Handy-Audio ─►┘
```

**Vorteile:** Kein extra Hardware, kostenlos, Founder hört alles + Prospect hört alles.
**Nachteile:** Setup-Komplexität (Audio-Routing muss korrekt konfiguriert sein), kann bei Windows-Updates brechen.

### Option B: Softphone auf dem Laptop (kein Handy nötig)

**Prinzip:** Statt vom Handy anzurufen, ruft der Founder Lisa direkt vom Laptop an. Audio läuft dann nativ über das Laptop-Audio-System und kann per "Stereo Mix" oder Virtual Cable in Teams geteilt werden.

**Tools:**
- **Twilio Client / WebRTC Browser-Dialer** — Telefonanruf direkt aus dem Browser
- **MicroSIP** (gratis, Open Source) — SIP-Softphone für Windows
- **Zoiper** (Freemium) — SIP-Softphone
- Oder: **Einfach eine Web-App bauen** die via Twilio Client SDK einen Browser-Call zu Lisas Nummer startet

**Flow:**
```
Founder klickt "Lisa anrufen" im Browser
  → Twilio Client SDK → SIP → Retell → Lisa antwortet
  → Audio kommt aus Laptop-Speakers / in Virtual Cable
  → Teams "Share System Audio" oder VoiceMeeter mischt es rein
```

**Vorteile:** Kein Handy nötig, Audio bleibt im Laptop-Ökosystem, sauberste Lösung.
**Nachteile:** Braucht Twilio Client SDK Setup oder Softphone-Config (SIP-Credentials).

### Option C: Teams "Include System Audio" bei Screen-Share

**Prinzip:** Microsoft Teams hat eine Option beim Screen-Sharing: **"Include computer sound"** (Computersound einschließen). Wenn Lisa-Audio über den Laptop läuft (Softphone/Browser), wird es automatisch mit geteilt.

**Flow:**
```
1. Founder startet Screen-Share in Teams
2. Checkbox: "Include computer sound" ✅
3. Founder ruft Lisa an (Softphone oder Browser-Dialer auf dem Laptop)
4. Lisa-Audio geht über Laptop-Speakers UND in den Teams-Stream
5. Prospect hört Lisa + sieht Screen
```

**Vorteile:** Kein VoiceMeeter nötig, native Teams-Funktion.
**Nachteile:** Braucht Softphone/Browser-Call (kein Handy), Audio-Qualität abhängig von Teams-Compression.

### Option D: Handy-Audio per "Phone Link" / Bluetooth in den Laptop

**Prinzip:** Windows "Phone Link" (ehemals "Your Phone") oder Bluetooth-Tethering. Handy-Audio wird auf dem Laptop abgespielt.

**Vorteile:** Nutzt vorhandene Infrastruktur.
**Nachteile:** Audio-Qualität unzuverlässig, Latenz, und Teams "Include computer sound" muss trotzdem aktiv sein. Nicht empfohlen für professionelle Demo.

### CC-Empfehlung

**Option B + C kombiniert = beste Lösung.**

1. Einen einfachen **Browser-Dialer bauen** (Twilio Client SDK, 1 HTML-Seite mit "Anrufen"-Button)
2. Oder: **MicroSIP/Zoiper** als Softphone installieren (schneller, kein Code)
3. In Teams: **Screen-Share mit "Include computer sound"** aktivieren
4. Lisa-Audio läuft über den Laptop → Teams teilt es automatisch → Prospect hört mit

**Fallback:** Option A (VoiceMeeter) falls "Include computer sound" nicht ausreicht.

---

## 4. Empfohlenes Demo-Setup (Ziel-Zustand)

### Hardware
```
- Laptop (Windows 11, Haupt-Gerät)
- Handy (USB-C verbunden, Screen-Mirroring aktiv) — NUR für SMS-Demo + Mobile-View
- Headset (USB oder Bluetooth) — für Teams-Call + Founder-Stimme
- Zweiter Monitor (optional, aber empfohlen) — Demo-Tabs auf Screen 1, Teams/Notizen auf Screen 2
```

### Software
```
MUSS:
- Microsoft Teams (Video-Call mit Prospect)
- Browser: 5 Demo-Tabs vorbereitet (siehe Abschnitt 5)
- Softphone ODER Browser-Dialer (für Lisa-Anruf vom Laptop)
- E-Mail-Client (Postfach offen für Live-Notification)
- Handy Screen-Mirror (z.B. Samsung DeX, scrcpy, Windows Phone Link)

OPTIONAL:
- VoiceMeeter Banana (falls Audio-Routing Probleme)
- OBS (falls Demo aufgezeichnet werden soll)
```

### Audio-Routing (kritisch!)
```
┌─────────────────────────────────────────────────────┐
│ AUDIO-SETUP                                         │
│                                                     │
│ Founder Headset-Mikro ──► Teams (Mikro-Input)       │
│                                                     │
│ Softphone (Lisa-Call) ──► Laptop System Audio        │
│                              │                      │
│                              ▼                      │
│                         Teams "Include              │
│                         computer sound" ────► Prospect│
│                                                     │
│ Founder hört: Teams + Softphone (via Headset)       │
│ Prospect hört: Founder-Stimme + Lisa-Audio          │
└─────────────────────────────────────────────────────┘
```

---

## 5. Demo-Ablauf (15 Min, digital-optimiert)

> **Vollständiges Skript:** `docs/runbooks/demo_script.md`
> Hier nur die digital-spezifischen Anpassungen.

### Vorbereitung (10 Min vorher)

```
BROWSER (Screen 1 — wird geteilt):
  Tab 1: flowsight.ch                                    (Marketing)
  Tab 2: flowsight.ch/brunner-haustechnik                (Kunden-Website)
  Tab 3: flowsight.ch/brunner-haustechnik/meldung        (Wizard)
  Tab 4: flowsight.ch/ops/cases?tenant=brunner-haustechnik (Dashboard, eingeloggt!)
  Tab 5: E-Mail-Postfach (Founder-Adresse)
  Tab 6: Softphone / Browser-Dialer (für Lisa-Anruf)     ← NEU

TEAMS (Screen 2 oder hinter den Tabs):
  - Video-Call mit Prospect gestartet
  - Screen-Share NOCH NICHT aktiv (erst bei Start)

HANDY (USB-C, Screen-Mirror aktiv):
  - Für SMS-Demo (Schritt 4)
  - Für Mobile-Dashboard-View (optional, Schritt 5)

AUDIO-CHECK (KRITISCH — vor jedem Demo!):
  □ Headset verbunden + in Teams als Mikro/Speaker gesetzt
  □ Softphone installiert + getestet (kurzer Testanruf an eigene Nummer)
  □ Teams: "Include computer sound" wissen wo es ist
  □ Prospect fragen: "Hören Sie mich gut?" bevor Demo startet
```

### Ablauf-Änderungen vs. aktuelles Skript

| Schritt | Aktuell (docs/runbooks/demo_script.md) | NEU (Digital-Optimiert) |
|---------|----------------------------------------|------------------------|
| Min 3-5: Voice Agent | Handy anrufen, an Lautsprecher halten | **Softphone auf Laptop, Teams "Include computer sound"** |
| Min 5-6: Info-Anruf | Nochmal Handy | **Softphone, gleicher Flow** |
| Nach Voice-Demo | — | **NEU: SMS-Demo zeigen (Handy Screen-Mirror)** |
| Min 6-8: Dashboard | Nur Desktop | **Optional: Auch Mobile-View zeigen via Screen-Mirror** |

### NEU: SMS-Demo-Einschub (nach Voice-Demo, ~1 Min)

> "Und jetzt passiert noch etwas: Der Anrufer bekommt automatisch eine SMS."

**Zeigen:**
- Handy-Screen am Laptop (Screen-Mirror)
- SMS von "BrunnerHT" zeigen: Bestätigungs-SMS mit Korrektur-Link (HMAC-gesicherter Short-Link)
- Link antippen → Verify-Page zeigen → "Hier kann der Kunde seine Angaben prüfen, korrigieren und ein Foto hochladen — alles DSGVO-konform, mit Einmal-Link."

**Wow-Moment:** Automatisierte SMS-Nachverfolgung — der Kunde fühlt sich betreut, der Betrieb hat bessere Daten.

### Dashboard-Features hervorheben (Min 7-9)

Seit den Updates N27/N28 hat das Dashboard neue Wow-Momente:
- **KPI Click-to-Filter:** Klick auf "Heute neu" → Liste filtert sofort
- **Case Detail:** Kontaktdaten, Timeline, Foto-Anhänge auf einen Blick
- **ICS-Termin:** Datum + Uhrzeit wählen → Kunde bekommt Kalender-Einladung per E-Mail
- **Foto-Anhänge:** Vom SMS-Link hochgeladene Fotos direkt im Fall sichtbar

---

## 6. Checkliste: Einmal-Setup (was der Founder konfigurieren muss)

### Prio 1: Audio-Problem lösen

| # | Task | Aufwand | Details |
|---|------|---------|--------|
| 1 | Softphone installieren (MicroSIP oder Zoiper) | 15 Min | SIP-Credentials von Twilio holen, Softphone konfigurieren. Oder: Twilio-Browser-Dialer (1 HTML-Page, CC kann bauen). |
| 2 | Teams "Include computer sound" testen | 5 Min | Screen-Share starten → Checkbox unten links → Softphone-Anruf starten → prüfen ob Gegenüber Lisa hört. |
| 3 | Testanruf mit Kontrollperson | 10 Min | Jemanden in Teams anrufen, Demo durchspielen, Audio-Qualität validieren. |

### Prio 2: Screen-Mirror für SMS/Mobile

| # | Task | Aufwand | Details |
|---|------|---------|--------|
| 4 | scrcpy installieren (Open Source) ODER Windows Phone Link nutzen | 15 Min | scrcpy: `scoop install scrcpy` oder GitHub Release. USB-Debug-Modus ist bereits aktiv (Founder hat's schon). |
| 5 | SMS-Demo testen | 5 Min | Lisa anrufen → SMS kommt → auf Handy-Mirror sichtbar? |

### Prio 3: Zweiter Monitor (optional)

| # | Task | Aufwand | Details |
|---|------|---------|--------|
| 6 | Layout definieren: Screen 1 = Demo (geteilt), Screen 2 = Teams + Notizen | 5 Min | Wenn kein zweiter Monitor: Alt-Tab Flow definieren. |

---

## 7. Entscheidung für GPT: Softphone vs. Browser-Dialer

### Option 1: Fertiges Softphone (MicroSIP/Zoiper)

```
Pro: Sofort einsatzbereit, kein eigener Code, SIP-Standard
Contra: Twilio SIP-Credentials nötig (Twilio SIP Domain + Auth), extra App offen
Setup: ~30 Min (Twilio SIP Domain erstellen + Softphone konfigurieren)
```

### Option 2: Eigener Browser-Dialer (Twilio Client SDK)

```
Pro: Kein extra App, läuft im Browser-Tab, kann in Demo-Seite integriert werden,
     sieht professioneller aus ("Klicken Sie hier um Ihren Assistenten zu hören")
Contra: Braucht Twilio Client SDK Setup (Token-Server = Vercel API Route),
        ~2-3h Entwicklung
Ergebnis: 1 Browser-Tab mit grossem "Lisa anrufen" Button
```

### Option 3: Web-Demo-Page mit eingebettetem Dialer

```
Pro: MAXIMALER Wow-Effekt — Prospect sieht eine Page die sagt
     "Testen Sie Ihren Telefonassistenten" mit Play-Button
Contra: Meister Aufwand (~4-6h), Twilio Client SDK + UI
Ergebnis: flowsight.ch/brunner-haustechnik/demo-call (oder ähnlich)
```

**CC-Empfehlung:** Option 2 für kurzfristig (Browser-Dialer, CC kann das bauen). Option 3 als Upgrade wenn der Demo-Flow validiert ist. Option 1 als Quick-Win falls es heute noch klappen soll.

---

## 8. Referenz-Dokumente (bereits vorhanden)

| Dokument | Pfad | Inhalt |
|----------|------|--------|
| Demo-Skript (15 Min) | `docs/runbooks/demo_script.md` | Vollständiger Ablauf, Fallbacks, Reset-SQL, Key Messages |
| Pitch Deck (7 Slides) | `docs/sales/pitch_deck.html` | Print-ready, Navy/Gold, Problem→Solution→Pricing→CTA |
| Sales Pipeline | `docs/sales/pipeline.md` | Prospect-Tracker, E-Mail-Vorlage, Anruf-Skript |
| Business Briefing | `docs/business_briefing.md` | Vollständiger Kontext (Produkt, Pricing, ICP, Technik) |
| Voice Agent Templates | `retell/templates/README.md` | Agent-Setup pro Kunde (~20 Min) |
| Brunner Voice Config | `retell/exports/brunner_agent.json` | DE Agent JSON (Intake + Info Dual-Mode) |
| Brunner Theme | `src/web/src/lib/demo_theme/brunner_haustechnik.ts` | Farben, Kontakt, Services, Trust Signals |
| Release Checklist | `docs/runbooks/release_checklist.md` | Pre/Post-Deploy Gates |
| Onboarding Runbook | `docs/runbooks/onboarding_customer_full.md` | Full Customer Onboarding Flow |

---

## 9. Demo-Flow Zusammenfassung (Pocket Reference)

```
VOR DER DEMO (10 Min):
  □ 6 Browser-Tabs offen (Marketing, Website, Wizard, Dashboard, E-Mail, Dialer)
  □ Teams-Call gestartet, Headset aktiv
  □ Handy per USB verbunden, Screen-Mirror aktiv
  □ Softphone/Dialer getestet (Testanruf)
  □ Dashboard zeigt Brunner-Cases
  □ Audio-Check mit Prospect: "Hören Sie mich gut?"

DEMO (15 Min):
  0-1  Min: Website zeigen (Scrolle durch /brunner-haustechnik)
  1-3  Min: Wizard live ausfüllen → E-Mail Wow-Moment
  3-5  Min: Lisa anrufen VOM LAPTOP (Softphone/Dialer) → Fall erscheint im Dashboard
  5-6  Min: Info-Anruf (Öffnungszeiten, Preise) → kein Ticket
  6-7  Min: SMS zeigen (Handy-Mirror) → Korrektur-Link + Foto-Upload
  7-9  Min: Dashboard Tour (KPIs click-to-filter, Fall öffnen, Fotos, Termin mit ICS)
  9-10 Min: Review-Anfrage (Button + E-Mail)
  10-12 Min: Fragen beantworten
  12-14 Min: Preise (99/249/349) + 30-Tage-Versprechen
  14-15 Min: Close → Onboarding-Termin vereinbaren

NACH DER DEMO:
  □ Follow-up E-Mail innert 1h
  □ Demo-Cases aufräumen (Reset-SQL in demo_script.md)
  □ Pipeline-Tracker updaten (docs/sales/pipeline.md)
```

---

## 10. Nächste Schritte (Founder-Entscheidung)

1. **SOFORT (heute):** Entscheide Softphone vs. Browser-Dialer (Option 1/2/3 oben)
2. **SOFORT:** Teams "Include computer sound" testen (5 Min, braucht nur einen Testanruf)
3. **Diese Woche:** Einmal-Setup durchführen (Checkliste Abschnitt 6)
4. **Diese Woche:** Zweite Demo mit Peter als Dry-Run (Audio validieren!)
5. **Optional:** CC baut Browser-Dialer (falls Option 2 gewählt, ~2-3h)

---

*Erstellt von Claude Code (Opus 4.6) | FlowSight Head Ops | 2026-03-02*
