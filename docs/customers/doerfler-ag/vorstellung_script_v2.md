# Vorstellung Dörfler AG — Script v2

**Version:** 2.1 | **Datum:** 2026-04-07

---

## E-Mail an Dörfler AG

**An:** info@doerflerag.ch
**Betreff:** Etwas Persönliches für die Dörfler AG
**Sender:** Gunnar Wende via noreply@send.flowsight.ch (Resend)

### Variante A: HTML-Mail mit Foto (empfohlen)

**Preview:** Öffne `docs/customers/doerfler-ag/mail1_preview.html` im Browser.
**Senden:**
```bash
node --env-file=src/web/.env.local scripts/_ops/send_outreach_mail.mjs doerfler-ag info@doerflerag.ch
```

Aufbau:
1. Persönlicher Text (Kontext, Einsatz bei uns)
2. **Gunnar-Foto** (120px, rund, klickbar → Vorstellungsseite)
3. Link zur Vorstellungsseite als Text-Fallback
4. Warmer Abschluss + Signatur

Das Foto sitzt bewusst ZWISCHEN Kontext und Link:
- Text baut auf: "Wer schreibt mir?"
- Foto schafft Vertrauen: "Ein echter Mensch"
- Link lädt ein: "Was hat er vorbereitet?"

### Variante B: Plain-Text (Fallback / Outlook manuell)

```
Guten Tag Herr Dörfler

Ich hoffe, Ihnen geht es gut und Sie konnten die sonnigen Ostertage geniessen.

Mein Name ist Gunnar Wende, ich wohne in Oberrieden.

Vor ein paar Monaten war einer von Ihnen beiden bei uns in der Wohnung, weil eine Dichtung bei einem Wasserhahnanschluss ersetzt werden musste. Wir waren mit der Ausführung sehr zufrieden.

Das ist mir in Erinnerung geblieben. Ich habe mir danach ein paar Gedanken gemacht und für die Dörfler AG etwas Konkretes vorbereitet.

Hier können Sie es sich in Ruhe anschauen — dauert etwa fünf Minuten:
https://flowsight.ch/kunden/doerfler-ag/vorstellung

Ich möchte Ihnen damit nichts verkaufen. Mich würde einfach ehrlich interessieren, wie das auf Sie wirkt.

Gerne komme ich auch kurz persönlich vorbei — wir sind ja nur ein paar Strassen voneinander entfernt.

Freundliche Grüsse
Gunnar Wende
Oberrieden

+41 44 552 09 19
gunnarwende@flowsight.ch
```

---

**Version:** 2.1 | **Datum:** 2026-04-07
**Zweck:** 4 kurze Video-Module + persönliche Vorstellungsseite. Kein langes Einzelvideo.
**Ziel-Dauer:** 4 × 1–2 Minuten (Total ~5–7 Minuten)
**Ton:** Persönlich, respektvoll, nicht verkaufen. Feedback anfragen.
**Versand:** 2-Mail-Strategie. Mail 1 = Link zur Vorstellungsseite. Mail 2 = Zugänge (erst nach Go).
**Vorstellungsseite:** flowsight.ch/kunden/doerfler-ag/vorstellung
**Config:** `src/web/src/lib/customers/vorstellung.ts` (Loom-URLs hier eintragen)
**Beziehung zu demo_script.md:** Dieses Dokument ersetzt NICHT demo_script.md. demo_script.md bleibt das operative Script (inkl. Speakflow). Dieses Dokument beschreibt die Verpackung + Versandlogik.

---

## Architektur

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

## Die 4 Module (Vorstellungsseite)

| # | Titel | Untertitel | Mapping zu demo_script.md |
|---|-------|-----------|---------------------------|
| 1 | Ihr Alltag — und eine Frage | Was passiert, wenn Baustelle, Kundengespräch und neue Anfragen gleichzeitig kommen | TAKE 1 |
| 2 | Wenn Sie gerade nicht rangehen können | Eine Assistentin übernimmt — mit dem Namen der Dörfler AG | TAKE 2 |
| 3 | Wenn ein Kunde lieber online meldet | Ein sauberer Weg über Ihre Website — direkt in dieselbe Übersicht | TAKE 3 (erster Teil) |
| 4 | Vom erledigten Fall zur Bewertung | Gute Arbeit gezielt sichtbar machen — unkompliziert, mit einem Klick | TAKE 3 (zweiter Teil) + TAKE 4 |

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
gunnarwende@flowsight.ch
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

## Pain-Type-Zuordnung pro Modul

| pain_type | Modul | Wie angesprochen |
|-----------|-------|------------------|
| erreichbarkeit | 1 + 2 | "Man kommt nicht ran" → Assistentin übernimmt |
| notfall | 2 | Live-Anruf, SMS, sofort im System |
| aussenwirkung | 3 | Website gezeigt (subtil, "auch aussehen könnte") |
| buerochaos | 2 + 3 | Leitzentrale mit Status, alles an einem Ort |
| bewertung | 4 | Review-Anfrage, Aussenwirkung, konkretes Beispiel |

---

## Technische Checkliste (vor Aufnahme)

- [ ] Vorstellungsseite läuft: flowsight.ch/kunden/doerfler-ag/vorstellung
- [ ] Leitzentrale offen (Dörfler-Tenant)
- [ ] Website flowsight.ch/kunden/doerfler-ag
- [ ] Meldungsformular flowsight.ch/kunden/doerfler-ag/meldung
- [ ] Handy bereit (Anruf auf 044 505 74 20 + SMS-Empfang)
- [ ] Loom aktiv
- [ ] Demo-Cases sichtbar (15 Fälle)

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

---

## Prozess-Ablauf (E2E)

```
1. Founder nimmt 4 Videos auf (Loom, je 1–2 Min, Script aus demo_script.md)
2. Loom-URLs in vorstellung.ts eintragen
3. Push → Vercel Deploy
4. Vorstellungsseite prüfen: flowsight.ch/kunden/doerfler-ag/vorstellung
5. Mail 1 senden (persönlich, 1 Link zur Vorstellungsseite)
6. Prospect schaut Videos auf der Vorstellungsseite
7. Prospect meldet sich → activate_prospect.mjs → Mail 2
8. Trial 14 Tage → Follow-up Tag 10 → Decision Tag 14
```
