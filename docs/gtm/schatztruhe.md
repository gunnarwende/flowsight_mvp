# Schatztruhe — Berührungspunkt-Architektur

> Was erlebt der Prospect, Sekunde für Sekunde, auf welchem Gerät, in welchem Format?
> Dieses Dokument ist die EINZIGE Quelle für die End-to-End-Übergabe zwischen allen Bausteinen.

**Status:** ENTWURF — Founder-Review offen
**Letzte Änderung:** 2026-03-12
**Abhängigkeiten:** gold_contact.md (Philosophie), prospect_journey.md (Lifecycle), operating_model.md (Maschine)

---

## 0. Die offene Frage

Wir haben gebaut: Lisa, Leitstand, Wizard, Website, Review, Trial-Lifecycle, E-Mail-Templates, Video-Template, Outreach-Templates.

Was fehlt: **Das Öl zwischen den Zahnrädern.** Konkret:

| Frage | Status |
|-------|--------|
| Was genau sieht der Prospect in der E-Mail? | ❌ Nicht definiert |
| Welchen Link klickt er zuerst? | ❌ Nicht definiert |
| Auf welchem Gerät öffnet er die E-Mail? | ❌ Angenommen, nicht validiert |
| Kommt ein 25 MB Loom-Video per E-Mail an? | ❌ Nicht geprüft |
| Brauchen wir die Startseite (/start/[slug])? | ❌ Funktion unklar |
| Was zeigen wir im Video, was NICHT in der E-Mail? | ❌ Keine Abgrenzung |
| Was passiert zwischen E-Mail-Öffnung und erstem Anruf? | ❌ Lücke |

---

## 1. Der Prospect: Gerät, Kontext, Aufmerksamkeit

### Primär-Gerät: Handy (iPhone/Android)
- **Wann:** Abends (18:00–21:00) oder Mittagspause (12:00–13:00)
- **Wo:** Sofa, Baustelle (Pause), Auto (stehend)
- **Aufmerksamkeit:** 8–15 Sekunden für erste Entscheidung: Öffnen oder Löschen
- **E-Mail-App:** GMail App oder Apple Mail (kein Outlook bei Meister-Profil ≤8 MA)
- **Bildschirmbreite:** 375–428 px (iPhone SE bis iPhone Pro Max)
- **Mobile Daten:** 4G/5G, ~10–50 Mbit/s Download
- **WLAN:** Abends zu Hause, tagsüber oft nur Mobilfunk

### Sekundär-Gerät: Laptop/Desktop (Betrieb-Profil >8 MA)
- **Wann:** Morgens 07:00–09:00 (Bürokraft öffnet E-Mail)
- **Wo:** Büro
- **E-Mail-App:** Outlook Desktop oder Webmail
- **Bildschirmbreite:** 1280–1920 px

### Konsequenz für Formate
| Format | Handy-tauglich? | Anmerkung |
|--------|----------------|-----------|
| E-Mail (HTML) | ✅ Ja | Max 600px Breite, grosse Schrift, ein CTA |
| Loom-Link | ✅ Ja | Öffnet im Browser, streamt (kein Download nötig) |
| Video als Attachment | ❌ Nein | 25 MB Attachment wird von GMail blockiert (>25 MB Limit), Mobilfunk-Frustration |
| PDF | ⚠️ Bedingt | Öffnet sich, aber kein Interaktion, kein CTA-Klick |
| Startseite (Web) | ✅ Ja | Mobile-first gebaut, kein Login nötig |
| Voice (Anruf) | ✅ Ja | Primär-Aktion, direkt vom Handy |

---

## 2. Die Formate — Was benutzen wir und wofür?

### Format 1: E-Mail (Trägermedium)
**Rolle:** Transport-Container. Bringt alle anderen Formate zum Prospect.
**Nicht die Rolle:** Überzeugen, erklären, verkaufen. Das tun die verlinkten Inhalte.

**Was rein MUSS:**
- Persönliche Anrede (Herr Weinberger / Christian)
- EIN Satz Kontext: "Ich habe für Ihren Betrieb etwas vorbereitet."
- Max 3 Links (nicht mehr — Entscheidungsparalyse)
- Grösse: <50 KB HTML (kein Inline-Bild, keine Attachment)

**Was NICHT rein darf:**
- Attachment (Video, PDF, Bild)
- Mehr als 3 CTAs
- Technische Erklärungen ("KI-basiert", "Retell-powered")
- Preis

### Format 2: Video (Loom, 45–60s)
**Rolle:** Emotionaler Beweis. "Ich habe das FÜR DICH gebaut, und es funktioniert JETZT."
**Delivery:** Loom-Link in E-Mail → Öffnet im Browser → Streamt (kein Download)

**Technische Grenzen:**
| Parameter | Wert | Quelle |
|-----------|------|--------|
| Dauer | 45–60s (max 70s) | Gold Contact §Video |
| Auflösung | 1080p / 30fps | Loom Standard |
| Dateigrösse | ~20–30 MB | Loom komprimiert automatisch |
| Delivery | HTTPS Stream | Kein Download nötig |
| Bandbreite | >3 Mbit/s für flüssig | 4G reicht |
| Player | Browser-nativ (HTML5) | Kein Plugin, kein App |
| Tracking | Loom Analytics | Founder sieht: geöffnet, wie lange geschaut |
| Loom Free Tier | 25 Videos | Danach: YouTube Unlisted oder Loom Pro |

**Ankommt das Video?** ✅ Ja — es ist ein LINK, kein Attachment.
Der Prospect klickt den Link, Loom streamt das Video im Browser.
Auch auf 4G flüssig (Loom adaptiert Bitrate automatisch).

### Format 3: Visitenkarte / Startseite (/start/[slug])
**Rolle:** Persönlicher Spiegel + Sammelseite für alle Aktionen.
**Nicht die Rolle:** Erklären, überzeugen, verkaufen (das tun E-Mail + Video).

**Funktion:**
1. **Wiedererkennung:** Prospect sieht SEINE Firma — Name, Tagline, Sterne, Services, Adresse
2. **Sammelstelle:** Alle Aktionen an einem Ort (Anrufen, Melden, Leitstand)
3. **Rückkehr-Punkt:** Prospect speichert den Link oder findet ihn in der E-Mail wieder
4. **Vertrauenssignal:** "Die haben sich mit meinem Betrieb beschäftigt"

**Brauchen wir sie?** ✅ Ja — aber sie ist NICHT der erste Klick.
Der erste Klick ist das Video (emotional) oder die Testnummer (Aktion).
Die Startseite ist der **zweite oder dritte Berührungspunkt** — der Orientierungspunkt.

### Format 4: Testnummer (Voice)
**Rolle:** DER Beweis-Moment. Prospect hört Lisa mit seinem Firmennamen.
**Delivery:** Telefonnummer in E-Mail + Video + Startseite (überall sichtbar)

---

## 3. Die Kette — Berührungspunkt für Berührungspunkt

### Szenario: Meister-Profil (≤8 MA), HOT (ICP ≥8), Leckerli A+B+C+D

```
FOUNDER-SEITE (unsichtbar)                    PROSPECT-SEITE (sichtbar)
─────────────────────────                     ────────────────────────

Phase 0: Vorbereitung (~45 min)
┌─────────────────────────┐
│ Crawl → Prospect Card   │
│ Website → /kunden/slug  │
│ Lisa DE + INTL          │
│ Twilio-Nummer           │
│ Supabase Tenant         │
│ Demo Cases (0–2)        │
│ E2E-Test (Quality Gate) │
│ Video aufnehmen (Loom)  │
│ Startseite prüfen       │
└─────────────────────────┘
          │
          ▼
Phase 1: Erster Kontakt
┌─────────────────────────┐                   ┌──────────────────────────────┐
│ E-Mail versenden        │──── E-Mail ──────▶│ 19:47 — Handy vibriert       │
│ (Resend, manuell)       │                   │ Subject: "Jul. Weinberger AG │
└─────────────────────────┘                   │  — ich habe etwas für Sie    │
                                              │  gebaut"                      │
                                              │                              │
                                              │ Prospect öffnet E-Mail.      │
                                              │ 8 Sekunden Aufmerksamkeit.   │
                                              │                              │
                                              │ Sieht:                       │
                                              │  "Guten Abend Herr           │
                                              │   Weinberger, ich habe für   │
                                              │   die Jul. Weinberger AG     │
                                              │   eine persönliche Telefon-  │
                                              │   assistentin eingerichtet." │
                                              │                              │
                                              │ 3 Links:                     │
                                              │  ① ▶ Video (60s)            │
                                              │  ② ☎ Testnummer             │
                                              │  ③ 🔗 Ihre Visitenkarte     │
                                              └──────────────────────────────┘
                                                        │
                                    ┌───────────────────┼───────────────────┐
                                    ▼                   ▼                   ▼
                              Klick ① Video      Klick ② Nummer      Klick ③ Karte
                                    │                   │                   │
                                    ▼                   ▼                   ▼
                           ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
                           │ Loom öffnet    │  │ Handy wählt    │  │ /start/slug    │
                           │ im Browser     │  │ 043 505 11 01  │  │ öffnet im      │
                           │                │  │                │  │ Browser         │
                           │ 60s: Founder   │  │ Lisa:          │  │                │
                           │ zeigt SEIN     │  │ "Grüezi, hier  │  │ Sieht: Seine   │
                           │ System live.   │  │  ist Lisa von  │  │ Firma, Sterne, │
                           │                │  │  der Weinberger│  │ Services,      │
                           │ SMS-Moment     │  │  AG..."        │  │ Adresse.       │
                           │ im Video =     │  │                │  │                │
                           │ Appetizer.     │  │ → SMS kommt    │  │ CTAs:          │
                           │                │  │   10s später   │  │ Lisa anrufen   │
                           │ CTA im Video:  │  │                │  │ Meldung        │
                           │ "Rufen Sie     │  │ → Fall im      │  │ Leitstand      │
                           │  jetzt an:     │  │   Leitstand    │  │                │
                           │  043 505 11 01"│  │                │  │ (Modus 1:      │
                           └────────────────┘  └────────────────┘  │  + Website)    │
                                    │                   │           └────────────────┘
                                    │                   │
                                    ▼                   ▼
                           Prospect ruft an      SMS kommt an
                           (falls noch nicht)     ┌────────────────┐
                                                  │ Absender:      │
                                                  │ "Weinberger"   │
                                                  │                │
                                                  │ "Neue Anfrage: │
                                                  │  Rohrbruch,    │
                                                  │  Thalwil..."   │
                                                  │                │
                                                  │ → Link zum     │
                                                  │   Leitstand    │
                                                  └────────────────┘
                                                         │
                                                         ▼
                                                  Prospect öffnet
                                                  Leitstand (Magic Link)
                                                  ┌────────────────┐
                                                  │ Sieht: Seinen  │
                                                  │ Testfall mit   │
                                                  │ Kategorie,     │
                                                  │ Adresse,       │
                                                  │ Dringlichkeit  │
                                                  │                │
                                                  │ "Da steht      │
                                                  │  ALLES."       │
                                                  └────────────────┘
```

---

## 4. Die drei Links in der E-Mail — Reihenfolge und Funktion

Die E-Mail enthält **genau 3 Links**. Nicht mehr. Jeder hat eine klare Rolle:

### Link 1: ▶ Video (Loom)
- **Position:** Oben, visuell dominant (Thumbnail oder Play-Button)
- **Rolle:** Emotionaler Einstieg. Prospect sieht in 60s den kompletten Beweis.
- **Was er danach tut:** Will selbst anrufen → braucht Testnummer (steht im Video UND in der E-Mail)
- **Format:** Loom Shareable Link (https://loom.com/share/xyz)
- **Nur bei:** Leckerli A (HOT, ICP ≥8). WARM-Prospects bekommen kein Video.

### Link 2: ☎ Testnummer
- **Position:** Mitte, als tel:-Link (ein Tap = Anruf startet)
- **Rolle:** Direkte Aktion. Kein Umweg. Ein Tap, Lisa nimmt ab.
- **Was er danach erlebt:** Lisa → SMS → Leitstand (die komplette WOW-Kette)
- **Format:** `tel:+41435051101` + lesbare Nummer: 043 505 11 01
- **Immer dabei:** Bei JEDEM Leckerli-Paket. Die Nummer ist das Produkt.

### Link 3: 🔗 Visitenkarte
- **Position:** Unten, dezent (nicht dominant)
- **Rolle:** Orientierung + Wiedererkennung. "Schau, das bin ja ich."
- **Was er dort sieht:** Seine Firma im Spiegel — Name, Tagline, Sterne, Services, Adresse + alle CTAs
- **Format:** `https://flowsight.ch/start/{slug}`
- **Warum nicht oben?** Weil sie kein Beweis ist. Sie ist schön, aber sie BEWEIST nichts. Das Video beweist. Der Anruf beweist. Die Karte bestätigt.

### Entscheidungsbaum: Was klickt der Prospect zuerst?

```
Prospect öffnet E-Mail
    │
    ├── Neugierig, hat Zeit (60%) ──→ Klickt Video ──→ Beeindruckt ──→ Ruft an
    │
    ├── Wenig Zeit, Action-Typ (25%) ──→ Klickt Nummer ──→ Hört Lisa ──→ WOW
    │
    └── Skeptisch, will prüfen (15%) ──→ Klickt Karte ──→ Sieht sich selbst ──→ Vertrauen ──→ Ruft an
```

---

## 5. Was zeigt das Video, was die E-Mail NICHT zeigt?

| Element | E-Mail | Video | Startseite |
|---------|--------|-------|------------|
| Firmennamen | ✅ Subject + Body | ✅ Titel + Lisa-Greeting | ✅ Firmenkarte |
| Testnummer | ✅ tel:-Link | ✅ Gesprochen + eingeblendet | ✅ CTA-Button |
| Lisa live hören | ❌ | ✅ **Kern-Moment** | ❌ |
| SMS-Beweis sehen | ❌ | ✅ **Stärkstes Bild** | ❌ |
| Leitstand-Beweis | ❌ | ✅ Kurz (5s) | ❌ |
| Google-Sterne | ❌ | ❌ | ✅ |
| Services als Liste | ❌ | ❌ | ✅ |
| Adresse + Region | ❌ | ❌ | ✅ |
| Persönliche Nachricht | ✅ Kurz | ✅ Founder spricht | ❌ |
| Founder-Gesicht | ❌ | ✅ Kamera-Bubble | ❌ |

**Kernregel:**
- E-Mail = "Ich habe etwas gebaut" (Neugier wecken)
- Video = "Schau, es funktioniert" (Beweis liefern)
- Startseite = "Das ist dein Betrieb" (Wiedererkennung + Rückkehr)

---

## 6. Die E-Mail — Exaktes Layout (Meister-Profil, HOT)

```
┌──────────────────────────────────────────┐
│ Von: Gunnar Wende <gunnar@flowsight.ch>  │
│ An: c.weinberger@julweinberger.ch        │
│ Betreff: Jul. Weinberger AG — ich habe   │
│          etwas für Sie gebaut             │
└──────────────────────────────────────────┘

Guten Abend Herr Weinberger,

ich bin Gunnar Wende. Ich habe für die
Jul. Weinberger AG eine persönliche
Telefonassistentin eingerichtet — Lisa.

Sie nimmt ab mit «Weinberger AG», erkennt
Notfälle, und schickt Ihnen innert Sekunden
eine SMS-Zusammenfassung aufs Handy.

▶  Kurzvideo ansehen (60 Sekunden)
   [Loom-Link — Thumbnail mit Play-Button]

☎  Jetzt selbst testen: 043 505 11 01
   [tel:+41435051101]

🔗  Ihre persönliche Visitenkarte
   [flowsight.ch/start/weinberger-ag]

Kein Login. Keine Installation. Einfach anrufen.

Herzliche Grüsse,
Gunnar Wende
044 552 09 19
```

**Zeichen:** ~600 Zeichen Body = scanbar in 8 Sekunden.
**HTML-Grösse:** <30 KB (kein Inline-Bild, Loom-Thumbnail als verlinktes Bild).
**Mobile-Rendering:** Ein-Spalten-Layout, grosse Touch-Targets für Links.

---

## 7. Formatgrenzen — Was kommt an, was nicht?

### E-Mail-Grössen
| E-Mail-Provider | Max Attachment | Max Inline-Bild | Max HTML Body |
|----------------|---------------|-----------------|---------------|
| GMail | 25 MB | 25 MB (gesamt) | Kein hartes Limit, aber >100 KB wird geclippt |
| Apple Mail | 20 MB | 20 MB | Kein Limit |
| Outlook.com | 20 MB | 20 MB | Kein Limit |
| Bluewin (CH) | 20 MB | 20 MB | Kein Limit |

**Konsequenz:** Wir senden KEINE Attachments. Alles ist verlinkt.
- Video = Loom-Link (streamt, 0 Bytes in E-Mail)
- Startseite = HTTPS-Link
- Nummer = tel:-Link

### Video-Streaming (Loom)
| Netzwerk | Bandbreite | Erlebnis |
|----------|-----------|---------|
| WLAN (abends, Sofa) | 50+ Mbit/s | Flüssig, sofort |
| 5G (Baustelle, Pause) | 50–300 Mbit/s | Flüssig, sofort |
| 4G (unterwegs) | 10–50 Mbit/s | Flüssig nach 1–2s Buffering |
| 3G (Keller, schlecht) | 1–5 Mbit/s | Möglich, aber ruckelig → Loom adaptiert auf 480p |

**Fazit:** ✅ Video kommt an. Loom adaptiert automatisch. Kein Download nötig.

### Sprachnachricht (Alternative/Ergänzung?)
| Parameter | Wert |
|-----------|------|
| WhatsApp Voice | Max 2 min, ~100 KB/min |
| iPhone Voice Memo | M4A, ~500 KB/min |
| Als Attachment? | ❌ Nicht nötig — Loom reicht |

**Entscheidung:** Kein separates Audio-Format nötig. Video + Anruf decken alles ab.

---

## 8. Offene Entscheidungen (Founder-Input nötig)

### E1: Video-Thumbnail in E-Mail
**Optionen:**
- A) Statisches Bild (Screenshot aus Video) mit Play-Button-Overlay → Klick öffnet Loom
- B) Nur Text-Link "▶ Kurzvideo ansehen (60s)"
- C) Loom-Embed (nicht alle E-Mail-Clients rendern das)

**Empfehlung:** A) — visuell stärker, aber: braucht gehostetes Bild (<50 KB).
**Fallback:** B) — funktioniert überall, kein Bild nötig.

### E2: Startseite — Name
Aktuell: "Ihr Leitsystem" (Header-Subtext).
Alternativen: "Ihre Visitenkarte", "Ihr Betrieb bei FlowSight", kein Subtext.
**Empfehlung:** "Ihre Visitenkarte" — der Prospect versteht sofort die Rolle.

### E3: Startseite — Position der persönlichen Nachricht
Aktuell: Eigener Block zwischen Firmenkarte und CTAs.
Alternative: In die Firmenkarte integriert (kompakter).
**Empfehlung:** Eigener Block — gibt der Botschaft Gewicht.

### E4: E-Mail-Absender
Aktuell (Outreach): `gunnar@flowsight.ch` (Founder persönlich)
Alternative: `Gunnar Wende <gunnar@flowsight.ch>` (mit Display-Name)
**Empfehlung:** Display-Name setzen — persönlicher im Posteingang.

### E5: Reihenfolge der 3 Links
Aktuell vorgeschlagen: Video → Nummer → Karte.
Alternative: Nummer → Video → Karte (Action-first).
**Frage an Founder:** Was ist der gewünschte erste Klick?

### E6: Visitenkarte-Name in der URL
Aktuell: `/start/weinberger-ag`
Alternative: `/v/weinberger-ag` (kürzer, cleaner in E-Mail)
**Empfehlung:** `/start/` beibehalten — Clarity > Brevity.

---

## 9. Checkliste: Vor dem ersten Versand

### Technisch
- [ ] Loom-Account erstellt, externes Mikrofon getestet
- [ ] Loom-Link für Weinberger aufgenommen + QA (Kill-Kriterien aus quality_gates.md §4)
- [ ] E-Mail-Template als HTML gebaut (ein-Spalte, 600px, mobile-first)
- [ ] E-Mail-Template im GMail-Vorschau getestet (Desktop + Mobile)
- [ ] Testnummer verifiziert: Anruf → Lisa → SMS kommt → Fall im Leitstand
- [ ] Startseite /start/weinberger-ag live + mobile getestet
- [ ] Loom Analytics-Dashboard: Founder weiss wo er Öffnungsraten sieht

### Inhaltlich
- [ ] E-Mail-Text von Founder gegengelesen (Tonalität, Du/Sie)
- [ ] Video: Firmenname korrekt ausgesprochen, SMS sichtbar, keine PII-Leaks
- [ ] Startseite: Alle Daten korrekt (Sterne, Adresse, Services)
- [ ] Kein SaaS-Wording in E-Mail, Video, Startseite (kein "Wizard", "Dashboard", "Cockpit")

### Reihenfolge Versand
1. Intern: Founder schickt E-Mail an sich selbst → öffnet auf Handy → prüft alle 3 Links
2. Intern: Founder ruft Testnummer an → prüft SMS + Leitstand
3. Extern: E-Mail an Prospect versenden
4. Tag 2: Follow-up-Anruf (Script aus outreach_templates.md)

---

## 10. Zusammenfassung: Die Schatztruhe

```
Der Prospect öffnet die E-Mail.     ← Deckel geht auf

Er sieht seinen Firmennamen.        ← Erste Goldmünze (Wiedererkennung)

Er klickt das Video.                 ← Zweite Goldmünze (Beweis: Lisa funktioniert)

Er ruft die Nummer an.              ← Dritte Goldmünze (Selbst erleben)

Sein Handy vibriert: SMS.           ← Vierte Goldmünze (physischer Beweis)

Er öffnet die Visitenkarte.         ← Fünfte Goldmünze (sein Betrieb im Spiegel)

Er öffnet den Leitstand.            ← Sechste Goldmünze (alles da, strukturiert)

Er denkt: "Die haben sich mit       ← Schatztruhe ist offen.
meinem Betrieb beschäftigt.            Er sieht Goldmünzen,
Das funktioniert. Für MICH."           worin er sein Gesicht
                                       spiegeln kann.
```

Jede Goldmünze verweist auf die nächste. Kein Sprung ins Leere.
Kein "und jetzt?" Kein generischer Link. Kein SaaS-Wording.

**Die E-Mail ist der Deckel.**
**Das Video ist der erste Blick hinein.**
**Die Testnummer ist das Anfassen.**
**Die SMS ist der physische Beweis.**
**Die Visitenkarte ist der Spiegel.**
**Der Leitstand ist der volle Inhalt.**

---

## Anhang A: Format-Entscheidungsmatrix

| Berührungspunkt | Format | Gerät | Grösse | Ankommt? |
|----------------|--------|-------|--------|----------|
| Erster Kontakt | E-Mail (HTML) | Handy | <30 KB | ✅ |
| Beweis | Loom-Video (Link) | Handy/Browser | 0 KB in Mail, ~25 MB Stream | ✅ |
| Aktion | Telefon (tel:-Link) | Handy | 0 KB | ✅ |
| Bestätigung | SMS (Twilio) | Handy | <160 Zeichen | ✅ |
| Spiegel | Startseite (HTTPS) | Handy/Browser | ~50 KB Page | ✅ |
| Orientierung | Leitstand (Auth) | Handy/Laptop | ~100 KB Page | ✅ |

## Anhang B: Was wir NICHT benutzen

| Format | Grund |
|--------|-------|
| PDF-Attachment | Kein Klick möglich, kein Tracking, fühlt sich nach Offerte an |
| Video-Attachment | >25 MB = wird von GMail blockiert |
| WhatsApp (an Prospect) | Kein PII über WhatsApp, nur Founder-Ops-Alerts |
| Sprachnachricht | Video deckt das ab, separates Format = Verwirrung |
| Landing Page mit Login | Reibung. Kein Login vor dem ersten WOW. |
| Kalender-Einladung | Zu früh. Kommt erst bei Day-10-Gespräch. |
