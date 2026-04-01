# Demo-Video-Script: Walter Leuthold

**Version:** 1.0 | **Datum:** 2026-04-01
**Zweck:** Founder nimmt sich per Video auf, stellt das Leitsystem vor, bittet um Feedback.
**Ziel-Dauer:** 3-5 Minuten
**Ton:** Persönlich, respektvoll, nicht verkaufen. Feedback anfragen.
**Versand:** 2-Mail-Strategie. Mail 1 = nur Video. Mail 2 = Zugänge (erst nach seinem Go).
**Kontext:** Herr Leuthold hat Mail 1 gelesen. Lokalbezug: Beide in Oberrieden, 8942.

---

## Betrieb-Profil (verifiziert)

- **Name:** Walter Leuthold, Sanitäre Anlagen
- **Inhaber:** Walter Leuthold (Ein-Mann-Betrieb)
- **Standort:** Seestrasse 98a, 8942 Oberrieden
- **Seit:** 2001 (~25 Jahre)
- **Leistungen:** Sanitär, Reparaturen, Wasserenthärtung, Spenglerei Dach + Haus
- **Google:** 4.9 Sterne, 44 Bewertungen — herausragend
- **Notdienst:** 24h, 079 417 74 41
- **Pain Types:** erreichbarkeit (Ein-Mann-Betrieb!), buerochaos, bewertung
- **Besonderheit:** Ein-Mann-Betrieb = erreichbarkeit ist DER Schmerzpunkt

## 2-Mail-Strategie

### Mail 1 — Erstkontakt

```
Betreff: Kurze Idee für Ihren Betrieb, Herr Leuthold

Guten Tag Herr Leuthold

Mein Name ist Gunnar Wende, ich wohne ebenfalls in Oberrieden.

Ich kenne Ihren Betrieb — Sie haben eine starke Reputation hier in der Region
und Ihre Google-Bewertungen sprechen für sich.

Ich habe mir ein paar Gedanken gemacht und ein kurzes Video für Sie aufgenommen.
Darin zeige ich Ihnen, was ich mir für Ihren Betrieb konkret überlegt habe.

Hier ist der Link:
[Loom-Video-Link]

Ich möchte Ihnen damit nichts verkaufen. Mich interessiert einfach,
wie das auf Sie als erfahrenen Handwerker wirkt.

Falls es Sie anspricht, richte ich Ihnen das gern so ein, dass Sie es selbst
einmal durchspielen können — ganz unkompliziert und ohne Verpflichtung.

Freundliche Grüsse
Gunnar Wende
044 552 09 19
```

**Personalisierung:**
- "ebenfalls in Oberrieden" — gleicher Ort, Nachbar
- "starke Reputation" + "Google-Bewertungen" — echtes Kompliment, verifiziert (4.9/44)
- Kein Verweis auf konkreten Einsatz (kein persönlicher Kontakt wie bei Dörfler)

### Mail 2 — Zugänge (erst nach Go)

```
node --env-file=src/web/.env.local scripts/_ops/activate_prospect.mjs \
  --slug=walter-leuthold --email=<seine-email>
```

---

## Vorbereitung (vor Aufnahme)

- [ ] Leitzentrale offen im Browser (Admin, Leuthold-Tenant)
- [ ] Website flowsight.ch/kunden/walter-leuthold in zweitem Tab
- [ ] Meldungsformular flowsight.ch/kunden/walter-leuthold/meldung in drittem Tab
- [ ] Handy bereit (Anruf + SMS-Empfang)
- [ ] Loom/Screen-Recording aktiv
- [ ] Kamera an

---

## Script

### 1. Intro — Nachbar, Respekt (~15s)

> "Grüezi Herr Leuthold. Mein Name ist Gunnar Wende, ich wohne ebenfalls hier in Oberrieden. Ich habe mir ein paar Gedanken gemacht und möchte Ihnen kurz zeigen, was daraus entstanden ist."

---

### 2. Alltag eines Ein-Mann-Betriebs (~25s)

> "Als Ein-Mann-Betrieb kennen Sie das wahrscheinlich gut: Sie sind beim Kunden, die Hände sind voll — und genau dann klingelt das Telefon. Ein anderer Kunde braucht etwas Dringendes. Und wenn Sie nicht rangehen, ist der Moment vorbei.
>
> Ich habe mich gefragt, wie man das so auffangen kann, dass nichts verloren geht — ohne dass Sie dafür jemanden einstellen müssen."

**Warum so:** Ein-Mann-Betrieb = erreichbarkeit ist existenziell. Nicht "Sie haben ein Problem", sondern "Sie kennen das".

---

### 3. Telefonischer Weg — Live-Demo (~60s)

> "Ich zeige Ihnen den telefonischen Weg, weil man daran den Ablauf am schnellsten versteht."
>
> [Nummer anrufen: 044 505 30 19, Lautsprecher]
>
> [Fall schildern: "Guten Tag, bei mir tropft es unter der Spüle. Mein Name ist Meier, Dorfstrasse 5, 8942 Oberrieden."]
>
> [Anruf beenden, SMS zeigen]
>
> "Und schon kommt die SMS mit dem Korrekturlink — falls etwas falsch verstanden wurde, kann der Kunde es direkt anpassen."

---

### 4. Leitzentrale (~40s)

> [Leitzentrale zeigen]
>
> "Der Fall landet direkt in Ihrer Leitzentrale. Nichts geht verloren, nichts muss zusammengesucht werden.
>
> Sie sehen sofort: worum geht es, wie dringend, was wurde erfasst. Und das Ganze funktioniert auch als App auf dem Handy — Sie haben es immer dabei.
>
> Wenn der Job erledigt ist, können Sie mit einem Klick eine Bewertungsanfrage schicken."

**Warum so:** "Nichts geht verloren" = Kernversprechen für Ein-Mann-Betrieb. App = mobil auf der Baustelle.

---

### 5. Website + Meldungsformular (~30s)

> [Website zeigen]
>
> "Ich habe mir erlaubt, eine Website für Ihren Betrieb aufzusetzen. Ihre fünf Leistungsbereiche sind drin, Ihre Google-Bewertungen — die sich mit 4.9 Sternen wirklich sehen lassen können — und das Meldungsformular.
>
> So können Kunden auch schriftlich melden, wenn sie lieber nicht anrufen."

**Warum so:** Google-Bewertung hervorheben = echtes Kompliment. Nicht erfunden.

---

### 6. Bewertungen (~20s)

> "Ihre 44 Google-Bewertungen sind beeindruckend. Was dieses System macht: es hilft Ihnen, dass nach jedem sauber erledigten Auftrag auch wirklich eine Bewertung zustande kommt — nicht als Automatismus, sondern gezielt dort, wo es passt."

---

### 7. Abschluss (~20s)

> "Mehr wollte ich Ihnen gar nicht zeigen. Mich interessiert: Macht das für einen Betrieb wie Ihren Sinn? Was würden Sie anders machen?
>
> Wenn Sie sagen, das ist spannend — melden Sie sich kurz bei mir mit der E-Mail-Adresse, die Sie dafür nutzen möchten. Dann richte ich Ihnen das ein, damit Sie es selbst ausprobieren können."

---

## Dont's

- Kein Preis
- Kein "KI" / "Lisa" / "Dashboard" / "Wizard" / "Onboarding"
- Kein "14 Tage Trial" (erst Mail 2)
- Keine Features auflisten
- Nicht als "Kunde" bezeichnen

## Pain-Type-Zuordnung

| pain_type | Wo | Wie |
|-----------|-----|-----|
| erreichbarkeit | Abschnitt 2 + 3 | "Hände voll, Telefon klingelt" → Assistentin |
| buerochaos | Abschnitt 4 | "Nichts verloren, nichts zusammensuchen" → Leitzentrale |
| bewertung | Abschnitt 5 + 6 | "4.9 Sterne" + "gezielt wo es passt" |

---

## Technische Checkliste (vor Aufnahme)

- [ ] Voice Agent antwortet auf Deutsch (Ela-Stimme) auf 044 505 30 19
- [ ] SMS kommt an Founder-Handy (kein Spam)
- [ ] Ops-Email kommt an Founder (MAIL_REPLY_TO)
- [ ] Leuthold bekommt NICHTS
- [ ] Fall erscheint in Leitzentrale innerhalb 30s
- [ ] Leitzentrale zeigt Leuthold-Branding (Farbe #203784)
- [ ] Tenant-Switcher zeigt "Walter Leuthold"
- [ ] Demo-Cases sichtbar (15 Fälle)
- [ ] Meldungsformular E2E (Submit → Fall in Leitzentrale)
- [ ] Loom-Recording funktioniert

## Prozess-Ablauf (E2E)

```
1. Founder nimmt Video auf (dieses Script)
2. Founder schickt Mail 1 (nur Video + Feedback)
3. Prospect antwortet mit Email
4. Founder: activate_prospect.mjs --slug=walter-leuthold --email=<seine-email>
5. Mail 2 automatisch (Leitzentrale + Testnummer + PWA + Trial)
6. Trial 14 Tage → Follow-up Tag 10 → Decision Tag 14
```
