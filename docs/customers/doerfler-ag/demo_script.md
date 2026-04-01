# Demo-Video-Script: Dörfler AG

**Version:** 3.0 | **Datum:** 2026-04-01
**Zweck:** Founder nimmt sich per Video auf, stellt das Leitsystem vor, bittet um Feedback.
**Ziel-Dauer:** 3-5 Minuten
**Ton:** Persönlich, respektvoll, nicht verkaufen. Feedback anfragen.
**Versand:** 2-Mail-Strategie. Mail 1 = nur Video. Mail 2 = Zugänge (erst nach seinem Go).
**Kontext:** Herr Dörfler hat Mail 1 gelesen. Er weiss: jemand aus Oberrieden hat etwas vorbereitet.

---

## 2-Mail-Strategie

### Mail 1 — Erstkontakt (Video + Feedback-Bitte)

```
Guten Tag Herr Dörfler

Mein Name ist Gunnar Wende, ich wohne in Oberrieden.

Vor ein paar Monaten war jemand von Ihnen bei uns in der Wohnung, weil eine Dichtung bei einem Wasserhahnanschluss ersetzt werden musste. Wir waren mit der Ausführung sehr zufrieden.

Das ist mir in Erinnerung geblieben. Ich habe mir danach ein paar Gedanken gemacht und dazu ein kurzes Video für Sie aufgenommen.

Darin zeige ich Ihnen kurz, was daraus entstanden ist.

Hier ist der Link:
[Loom-Video-Link]

Ich möchte Ihnen damit nichts verkaufen. Ich würde mich einfach freuen, wenn Sie mir ein ehrliches Feedback geben, wie das auf Sie wirkt.

Falls Sie möchten, richte ich Ihnen das danach gern so ein, dass Sie es selbst einmal mit typischen Situationen durchspielen können — ganz unkompliziert und ohne jede Verpflichtung.

Für ein kurzes Gespräch komme ich auch gern persönlich vorbei — wir sind ja nur ein paar Strassenschilder voneinander entfernt.

Freundliche Grüsse
Gunnar Wende
044 552 09 19



### Mail 2 — Zugänge (erst nach seinem Go, automatisch via activate_prospect.mjs)

Wird automatisch verschickt wenn Founder ausführt:
```
node --env-file=src/web/.env.local scripts/_ops/activate_prospect.mjs \
  --slug=doerfler-ag --email=<seine-email>
```

Enthält: Leitzentrale-Link + OTP-Anleitung + Testnummer + PWA-Hinweis + Trial-Zeitraum.

---

## Vorbereitung (vor Aufnahme)

- [ ] Leitzentrale offen im Browser (als Admin, Dörfler-Tenant ausgewählt)
- [ ] Website flowsight.ch/kunden/doerfler-ag in zweitem Tab
- [ ] Meldungsformular flowsight.ch/kunden/doerfler-ag/meldung in drittem Tab
- [ ] Handy bereit (Anruf + SMS-Empfang)
- [ ] Loom/Screen-Recording aktiv (ganzer Bildschirm)
- [ ] Kamera an (Bild-in-Bild oder Intro/Outro)

---

## Script

### 1. Intro — Kurz, Mail aufgreifen (15-20s)

Grüezi Herr Dörfler

Mein Name ist Gunnar Wende. Ich wohne nur ein paar Strassen weiter, hier in Oberrieden.

Nach Ihrem Einsatz bei uns habe ich mir ein paar Gedanken gemacht und möchte Ihnen mal kurz, was daraus entstanden ist.


---

### 2. Pain ansprechen — NICHT Features (30-40s)

> "Was ich bei vielen Betrieben in der Region sehe: Der Inhaber ist auf der Baustelle, das Telefon klingelt, und man kommt einfach nicht ran. Oder ein Kunde hat am Samstag ein Leck — und es gibt kein System, das den Fall strukturiert aufnimmt.
>
> Und dann: Bewertungen. Die Arbeit ist gut, die Kunden sind zufrieden — aber es kommt nie eine Google-Bewertung zustande."

**Warum so:** Drei pain_types (erreichbarkeit, notfall, bewertung) — ohne den Betrieb direkt zu kritisieren.

---

### 3. Website zeigen (30-40s)

> [Website-Tab zeigen]
>
> "Ich habe mir erlaubt, eine moderne Website für die Dörfler AG aufzusetzen — als Beispiel, wie das aussehen könnte. Ihre sechs Leistungsbereiche sind drin, von Sanitär über Heizung bis Spenglerei. Die Bilder stammen von Ihrer bestehenden Seite.
>
> Hier gibt es auch ein Meldungsformular — darüber können Ihre Kunden direkt eine Anfrage stellen, ohne anrufen zu müssen."
>
> [Kurz Meldungsformular zeigen]

**Warum so:** Zeigt Arbeit, nicht Verkauf. Meldungsformular kurz zeigen.

---

### 4. Live-Anruf — Das Herzstück (60-90s)

> "Jetzt das Herzstück. Auf dieser Website gibt es eine Telefonnummer mit einer persönlichen Telefonassistentin. Die nimmt Anrufe an, 24 Stunden, 7 Tage die Woche. Ich rufe jetzt mal an."
>
> [Handy nehmen, Nummer anrufen, auf Lautsprecher]
>
> [Fall schildern: "Guten Tag, ich habe ein Leck unter dem Spülbecken in der Küche, es tropft. Mein Name ist Müller, Bahnhofstrasse 12, 8942 Oberrieden."]
>
> [Anruf beenden]
>
> "Und jetzt schauen Sie mal — ich bekomme gleich eine SMS."
>
> [SMS zeigen auf dem Handy]
>
> "Da steht der Korrekturlink. Falls ich mich bei der Adresse vertan habe, kann ich das hier direkt anpassen. Und ein Foto hochladen."

**Warum so:** Live-Demo, kein Fake. SMS = Beweis.

---

### 5. Leitzentrale zeigen (40-50s)

> [Leitzentrale-Tab zeigen]
>
> "Und hier sehen Sie, wo der Fall landet — in Ihrer Leitzentrale. Der Fall von eben ist schon da. Status 'Neu', Kategorie 'Leck', Priorität 'Dringend'.
>
> Sie können den Fall einem Mitarbeiter zuweisen, einen Termin setzen, den Status ändern. Und wenn der Job erledigt ist —"
>
> [Fall auf "Erledigt" setzen]
>
> "— dann können Sie mit einem Klick eine Bewertungsanfrage an den Kunden schicken. Der bekommt eine E-Mail und kann direkt eine Google-Bewertung hinterlassen."

**Warum so:** Zeigt den Kreislauf: Anruf → Fall → Erledigt → Bewertung.

---

### 6. App + Mobilität erwähnen (10-15s)

> "Das Ganze funktioniert auch als App auf dem Handy — Sie haben Ihre Leitzentrale immer dabei, egal ob auf der Baustelle oder unterwegs."

**Warum so:** Kurz, nicht technisch. Kein "PWA installieren". Nur der Nutzen. Details kommen in Mail 2.

---

### 7. Abschluss — Feedback + Rückmeldung (20-30s)

> "Das ist das Leitsystem im Überblick. Mich interessiert wirklich: Macht das für einen Betrieb wie Ihren Sinn? Was würden Sie anders machen?
>
> Wenn Sie sagen, das ist spannend — melden Sie sich kurz bei mir, am besten mit der E-Mail-Adresse, die Sie dafür verwenden möchten. Dann richte ich Ihnen das so ein, dass Sie es selbst ausprobieren können. Mit Ihrer eigenen Nummer, Ihrer eigenen Leitzentrale.
>
> Ich freue mich auf Ihre Rückmeldung."

**Warum so:**
- Endet mit Frage → Betriebsinhaber als Experte
- "melden Sie sich mit der E-Mail-Adresse" → gibt uns den Input für activate_prospect.mjs
- Kein Zeitdruck, kein "14 Tage", kein Preis
- Er entscheidet ob und wann

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

## Pain-Type-Zuordnung im Script

| pain_type | Wo im Script | Wie angesprochen |
|-----------|-------------|------------------|
| erreichbarkeit | Abschnitt 2 + 4 | "Man kommt nicht ran" → Telefonassistentin 24/7 |
| notfall | Abschnitt 2 + 4 | "Samstag ein Leck" → Live-Anruf-Demo |
| bewertung | Abschnitt 2 + 5 | "Kommt nie eine Google-Bewertung" → Review-Anfrage |
| aussenwirkung | Abschnitt 3 | Neue Website gezeigt (subtil, ohne alte zu kritisieren) |
| buerochaos | Abschnitt 5 | Leitzentrale mit Status, Zuweisung, Termine |

---

## Prozess-Ablauf (E2E)

```
1. Founder nimmt Video auf (dieses Script)
2. Founder schickt Mail 1 (nur Video + Feedback-Bitte)
3. Prospect schaut Video
4. Prospect meldet sich: "Spannend, meine Email ist ramon@doerfler.ch"
5. Founder: activate_prospect.mjs --slug=doerfler-ag --email=ramon@doerfler.ch
6. Mail 2 wird automatisch verschickt (Leitzentrale + Testnummer + PWA + Trial)
7. Prospect testet selbst (14 Tage)
8. Follow-up Tag 10, Decision Tag 14
```

---

## Technische Checkliste (vor Aufnahme verifizieren)

- [x] Voice Agent antwortet auf Deutsch (Laura-Stimme) ✅
- [x] SMS kommt an Founder-Handy (kein Spam) ✅
- [x] Ops-Email kommt an Founder (MAIL_REPLY_TO) ✅
- [x] Dörfler AG bekommt NICHTS ✅
- [ ] Fall erscheint in der Leitzentrale innerhalb 30s
- [ ] Leitzentrale zeigt Dörfler-Branding (Farbe #2b6cb0)
- [ ] Tenant-Switcher zeigt "Dörfler AG"
- [ ] Demo-Cases sind sichtbar (15 Fälle)
- [ ] Meldungsformular funktioniert E2E (Submit → Fall in Leitzentrale)
- [ ] Review-Email kommt an (nach "Erledigt" + Review-Button)
- [ ] Loom-Recording funktioniert (Test-Aufnahme)
