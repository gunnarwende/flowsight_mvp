# Demo-Video-Script: Dörfler AG

**Version:** 4.0 | **Datum:** 2026-04-07
**Zweck:** 4 kurze Video-Module + persönliche Vorstellungsseite. Kein langes Einzelvideo.
**Ziel-Dauer:** 4 × 1–2 Minuten (Total ~5–7 Minuten)
**Ton:** Persönlich, respektvoll, nicht verkaufen. Feedback anfragen.
**Versand:** 2-Mail-Strategie. Mail 1 = Link zur Vorstellungsseite. Mail 2 = Zugänge (erst nach Go).
**Vorstellungsseite:** flowsight.ch/kunden/doerfler-ag/vorstellung
**Config:** `src/web/src/lib/customers/vorstellung.ts` (Loom-URLs hier eintragen)

---

## Architektur (v4.0)

```
Mail 1 (schlank, persönlich)
  → 1 Link → flowsight.ch/kunden/doerfler-ag/vorstellung
    → Gunnar-Foto + persönlicher Intro
    → Modul 1: Ihr Alltag — und eine Frage
    → Modul 2: Wenn Sie gerade nicht rangehen können
    → Modul 3: Wenn ein Kunde lieber online meldet
    → Modul 4: Vom erledigten Fall zur Bewertung
    → Persönlicher Abschlusstext (kein Video — Text auf der Seite)
    → Kontaktdaten
```

**Warum 4 Module statt 1 langes Video:**
- Dörfler kann einzelne Teile anschauen, pausieren, wiederkommen
- Jedes Modul hat einen klaren Fokus und ein klares Versprechen
- Intern weiterleitbar (Ramon zeigt Luzian: "Schau dir mal Teil 2 an")
- Weniger Aufnahme-Druck (jeder Take kann einzeln neu aufgenommen werden)

**Warum Abschluss als Text statt Video:**
- Die 4 Module ZEIGEN etwas Konkretes. Der Abschluss REDET nur.
- Text fühlt sich persönlicher an als ein 30-Sekunden-Clip
- Weniger Modul-Inflation (4 starke Teile > 5 mit einem schwachen)

---

## 2-Mail-Strategie

### Mail 1 — Erstkontakt (Vorstellung + Feedback-Bitte)

**Betreff:**
Etwas Persönliches für die Dörfler AG

**Body:**
```
Guten Tag Herr Dörfler

Ich hoffe, Ihnen geht es gut und Sie konnten die sonnigen Ostertage geniessen.

Mein Name ist Gunnar Wende, ich wohne in Oberrieden.

Vor ein paar Monaten war einer von Ihnen beiden bei uns in der Wohnung,
weil eine Dichtung bei einem Wasserhahnanschluss ersetzt werden musste.
Wir waren mit der Ausführung sehr zufrieden.

Das ist mir in Erinnerung geblieben.
Ich habe mir danach ein paar Gedanken gemacht
und für die Dörfler AG etwas Konkretes vorbereitet.

Hier können Sie es sich in Ruhe anschauen — dauert etwa fünf Minuten:

[Hier Gunnar-Foto OHNE Play-Button, verlinkt auf die Vorstellungsseite]
flowsight.ch/kunden/doerfler-ag/vorstellung

Ich möchte Ihnen damit nichts verkaufen.
Mich würde einfach ehrlich interessieren, wie das auf Sie wirkt.

Gerne komme ich auch kurz persönlich vorbei —
wir sind ja nur ein paar Strassen voneinander entfernt.

Freundliche Grüsse
Gunnar Wende
Oberrieden

+41 44 552 09 19
gunnar@flowsight.ch
```

**Mail-Design-Regeln:**
- Kein HTML-Template, kein Newsletter-Look → Plain-Text-Optik (evtl. mit Gunnar-Foto als einziges Bild)
- Gunnar-Foto OHNE Play-Button (Startbild.png) → Vertrauensanker, nicht Video-Teaser
- Foto verlinkt auf die Vorstellungsseite
- Direkter URL-Link als Fallback unter dem Foto
- Kein "Jetzt ansehen" Button → Stattdessen sachlich: "Hier können Sie es sich anschauen"
- Kein Tracking-Pixel, kein Funnel-Gefühl

### Mail 2 — Zugänge (erst nach seinem Go, automatisch via activate_prospect.mjs)

Wird automatisch verschickt wenn Founder ausführt:
```
node --env-file=src/web/.env.local scripts/_ops/activate_prospect.mjs \
  --slug=doerfler-ag --email=<seine-email>
```

Enthält: Leitzentrale-Link + OTP-Anleitung + Testnummer + PWA-Hinweis + Trial-Zeitraum.

---

## Die 4 Module (Video-Aufnahme-Script)

### Vorbereitung (vor Aufnahme)

- [ ] Leitzentrale offen im Browser (als Admin, Dörfler-Tenant ausgewählt)
- [ ] Website flowsight.ch/kunden/doerfler-ag in zweitem Tab
- [ ] Meldungsformular flowsight.ch/kunden/doerfler-ag/meldung in drittem Tab
- [ ] Handy bereit (Anruf auf 044 505 74 20 + SMS-Empfang)
- [ ] Loom/Screen-Recording aktiv
- [ ] Kamera an (Bild-in-Bild oder Intro/Outro)
- [ ] Vorstellungsseite prüfen: flowsight.ch/kunden/doerfler-ag/vorstellung

### Technische Checkliste (vor Aufnahme verifizieren)

- [x] Voice Agent antwortet auf Deutsch (Ela-Stimme)
- [x] SMS kommt an Founder-Handy (kein Spam)
- [x] Ops-Email kommt an Founder (MAIL_REPLY_TO)
- [x] Dörfler AG bekommt NICHTS
- [ ] Fall erscheint in der Leitzentrale innerhalb 30s
- [ ] Leitzentrale zeigt Dörfler-Branding (Farbe #2b6cb0)
- [ ] Tenant-Switcher zeigt "Dörfler AG"
- [ ] Demo-Cases sind sichtbar (15 Fälle)
- [ ] Meldungsformular funktioniert E2E (Submit → Fall in Leitzentrale)
- [ ] Review-Email kommt an (nach "Erledigt" + Review-Button)
- [ ] Loom-Recording funktioniert (Test-Aufnahme)
- [ ] Vorstellungsseite läuft korrekt (Mobile + Desktop)

---

### MODUL 1 — Ihr Alltag — und eine Frage
**Kamera:** Gross (kein Screen-Share). Persönlich, direkt.
**Dauer:** ~60–90 Sekunden
**Loom-Titel:** Dörfler AG — Ihr Alltag

Guten Tag Herr Dörfler.

Mein Name ist Gunnar Wende.
Ich wohne nur ein paar Strassen weiter,
hier in Oberrieden.

Nach Ihrem Einsatz bei uns
habe ich mir ein paar Gedanken gemacht
und dazu dieses kurze Video
für Sie aufgenommen.

Dabei ist mir eine Frage durch den Kopf gegangen:

Wie kommt bei einem Betrieb wie Ihrem
im Alltag alles so an, dass man
direkt sinnvoll damit weiterarbeiten kann?

Sie sind auf der Baustelle,
haben Kundengespräche,
und gleichzeitig kommen neue Anliegen rein —
per Telefon,
per E-Mail
oder direkt im Gespräch.

Und genau dort wird es entscheidend:
Man ist nicht immer direkt erreichbar,
hat nicht immer sofort
den ganzen Stand zur Hand,
und trotzdem muss von Anfang an klar sein,
worum es geht
und was als Nächstes zu tun ist.

Ich habe mir deshalb erlaubt,
für die Dörfler AG
etwas Konkretes vorzubereiten.

---

### MODUL 2 — Wenn Sie gerade nicht rangehen können
**Kamera:** Klein (Bild-in-Bild). Handy-Screen / Leitstand zeigen.
**Dauer:** ~90–120 Sekunden
**Loom-Titel:** Dörfler AG — Telefonische Anfragen

Nehmen wir an,
ein Kunde braucht Sie gerade
und erreicht Sie nicht direkt,
weil Sie auf der Baustelle sind
oder in einem Kundengespräch.

Dann sollte dieser Anruf
nicht einfach ins Leere laufen,
sondern der Kunde
zunächst sauber aufgefangen werden.

Genau dafür habe ich für Sie
eine digitale Assistentin vorbereitet,
die übernimmt,
wenn Sie gerade nicht direkt rangehen können.

Ich rufe einmal kurz an.

>>> JETZT ANRUFEN — PAUSE <<<

Direkt nach dem Anruf
erhält der Kunde eine SMS.

So merkt der Kunde sofort:
Sein Anliegen ist angekommen,
und er kann bei Bedarf
direkt noch ein Foto vom Schaden nachreichen.

Für Sie heisst das zunächst einmal:
Sie können Ihr Kundengespräch
oder Ihren Einsatz in Ruhe zu Ende führen,
ohne dass das Anliegen verloren geht.

Genau dafür habe ich Ihnen
Ihre eigene Dörfler-App vorbereitet.

Hier sehen Sie als Erstes,
was neu ist,
was bereits läuft,
was erledigt ist
und wie es bei den Bewertungen aussieht.

Und wenn ich den Fall öffne,
sehen Sie direkt,
worum es geht,
wie dringend es ist
und was bereits erfasst wurde.

So haben Sie den aktuellen Stand
nicht irgendwo im Kopf
oder verteilt in einzelnen Nachrichten,
sondern direkt im Fall —
auch unterwegs auf der Baustelle.

---

### MODUL 3 — Wenn ein Kunde lieber online meldet
**Kamera:** Klein (Bild-in-Bild). Desktop-Screen zeigen.
**Dauer:** ~60–90 Sekunden
**Loom-Titel:** Dörfler AG — Online-Anfragen

Dasselbe funktioniert
übrigens auch schriftlich.

Ich habe mir für die Dörfler AG
auch erlaubt, eine Website vorzubereiten —
nicht als Ersatz
für Ihren bisherigen Auftritt,
sondern um auch diesen schriftlichen Weg
einmal konkret sichtbar zu machen.

Nur ganz kurz,
wie so ein Auftritt
für die Dörfler AG
auch aussehen könnte:

ein sauberer Aufbau,
klare Leistungsbereiche,
Ihr Einzugsgebiet,
Ihre Bewertungen,
Ihr Team
und auch Ihre Geschichte —
die verdient aus meiner Sicht
gerade in diesem Jubiläumsjahr
einen sichtbaren Platz.

Und über genau diesen Weg
kann ein Kunde sein Anliegen
dann auch direkt online melden.

Sie waren bei uns ja
wegen der Dichtung
am Wasserhahnanschluss.
Ich gehe unseren Fall hier
kurz einmal online durch.

>>> JETZT WIZARD ZEIGEN — PAUSE <<<

Und auch das läuft danach
wieder genau in denselben Ablauf hinein.

Hier sehe ich den Fall
direkt wieder in der Übersicht
und kann ihn genauso öffnen
und weiterführen.

>>> JETZT FALL IN ÜBERSICHT ÖFFNEN — PAUSE <<<

Damit ist der schriftliche Weg
genauso sauber abgedeckt
wie der telefonische.

---

### MODUL 4 — Vom erledigten Fall zur Bewertung
**Kamera:** Klein (Bild-in-Bild). Desktop-Screen zeigen.
**Dauer:** ~90–120 Sekunden
**Loom-Titel:** Dörfler AG — Bewertungen

Und wenn etwas direkt bei Ihnen
im Betrieb oder nach einem Gespräch entsteht,
kann es genauso manuell aufgenommen werden
und läuft wieder
in dieselbe Übersicht hinein.

Und jetzt komme ich noch
auf den Punkt mit den Bewertungen zurück.

Gerade Letzteres ist bei vielen Betrieben
ein Punkt,
der im Alltag schnell untergeht.
Dafür habe ich aber auch noch
einen ziemlich coolen Weg gefunden.

Natürlich nicht blind bei jedem Fall,
sondern genau dort,
wo Sie sagen:
Das war sauber,
da passt es jetzt.

Denn wenn ein Fall
wirklich sauber erledigt ist,
kann mit einem Klick
direkt und gezielt
eine Bewertung angefragt werden.

>>> JETZT FALL AUF ERLEDIGT SETZEN / BUTTON ZEIGEN — PAUSE <<<

Das finde ich gerade
bei einem Betrieb wie Ihrem wichtig.

Gute Arbeit wird tagtäglich geleistet.
Umso wichtiger ist es,
dass daraus im richtigen Moment
auch etwas für Image
und Vertrauen entsteht.

Gerade in unserem Fall:
Wir hätten für Ihren Einsatz
sehr gerne eine 5-Sterne-Bewertung dagelassen —
wenn man den Kunden
in so einem Moment
direkt und unkompliziert abholt,
passiert das deutlich eher.

So bleibt ein gut gelöster Einsatz
nicht nur intern abgeschlossen,
sondern kann direkt
auf die Aussenwirkung
der Dörfler AG einzahlen.

---

## Dont's (Was du NICHT sagen sollst)

- ~~"Das kostet nur 299 Franken"~~ → Kein Preis. Nur wenn gefragt.
- ~~"Unsere KI-Technologie"~~ → "Telefonassistentin", nicht "KI"
- ~~"Dashboard" / "Wizard" / "Onboarding" / "Leitstand"~~ → "Leitzentrale", "Meldungsformular", "Einrichtung"
- ~~"Ich biete Ihnen an" / "Unser Angebot"~~ → "Ich habe etwas vorbereitet" / "Ihre Meinung"
- ~~"Das kann auch X und Y und Z"~~ → Nur zeigen was im Flow vorkommt
- ~~Features auflisten~~ → Pain zeigen, Lösung demonstrieren
- ~~Dörfler AG als "Kunde" bezeichnen~~ → Er ist (noch) kein Kunde
- ~~"Lisa"~~ → "Ihre Assistentin" oder "die Telefonassistentin"
- ~~"14 Tage Trial"~~ → Nicht in Mail 1 / Video. Erst in Mail 2.
- ~~"PWA installieren"~~ → "Funktioniert auch als App auf dem Handy"

## Pain-Type-Zuordnung pro Modul

| pain_type | Modul | Wie angesprochen |
|-----------|-------|------------------|
| erreichbarkeit | 1 + 2 | "Man kommt nicht ran" → Assistentin übernimmt |
| notfall | 2 | Live-Anruf, SMS, sofort im System |
| aussenwirkung | 3 | Website gezeigt (subtil, "auch aussehen könnte") |
| buerochaos | 2 + 3 | Leitzentrale mit Status, alles an einem Ort |
| bewertung | 4 | Review-Anfrage, Aussenwirkung, konkretes Beispiel |

---

## Prozess-Ablauf (E2E)

```
1. Founder nimmt 4 Videos auf (Loom, je 1–2 Min)
2. Loom-URLs in vorstellung.ts eintragen (src/web/src/lib/customers/vorstellung.ts)
3. Deploy (Vercel auto-deploy bei Push)
4. Vorstellungsseite prüfen: flowsight.ch/kunden/doerfler-ag/vorstellung
5. Mail 1 senden (persönlich, 1 Link zur Vorstellungsseite)
6. Prospect schaut Videos auf der Vorstellungsseite
7. Prospect meldet sich: "Spannend, meine Email ist ramon@doerfler.ch"
8. Founder: activate_prospect.mjs --slug=doerfler-ag --email=ramon@doerfler.ch
9. Mail 2 wird automatisch verschickt (Leitzentrale + Testnummer + PWA + Trial)
10. Prospect testet selbst (14 Tage)
11. Follow-up Tag 10, Decision Tag 14
```

---

## Nach Aufnahme: Loom-URLs eintragen

Datei: `src/web/src/lib/customers/vorstellung.ts`

```typescript
modules: [
  {
    title: "Ihr Alltag — und eine Frage",
    subtitle: "...",
    videoUrl: "https://www.loom.com/share/XXXXXXXXX",  // ← hier
    duration: "1:30",
  },
  // ... analog für Module 2–4
],
```

Nach Push: Seite wird automatisch mit eingebetteten Videos neu gebaut.
