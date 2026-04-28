# Speakflow Template — Generische Vorstellung (Take 1-4 + E-Mails)

**Version:** 1.0 | **Datum:** 2026-04-13
**Zweck:** Generisches Speakflow-Template fuer alle Betriebe ab Betrieb 2 (nach Doerfler AG).
**Gold-Standard:** Doerfler AG Take 2 = 1:1 Vorlage (nicht mehr). Takes 1/3/4 abgeleitet aus Doerfler-Script - update seit 17.04. - neues script für maschine_manifest pipeline für maximale persönliche und skalierende Pipeline
**Regel:** Platzhalter `{{...}}` werden pro Betrieb ersetzt. Alles andere ist identisch.
**Referenz:** `docs/gtm/vorstellung.md` (Skalierungsstrategie), `docs/gtm/machine_manifest.md` (Pipeline)

---

## Platzhalter-Uebersicht

| Platzhalter | Beispiel Doerfler | Beispiel Leuthold | Quelle |
|-------------|-------------------|-------------------|--------|
| `{{anrede}}` | Herr Doerfler | Herr Leuthold | prospect_card.json |
| `{{firma}}` | Doerfler AG | Walter Leuthold | prospect_card.json |
| `{{firma_kurz}}` | Doerfler | Leuthold | prospect_card.json |
| `{{slug}}` | doerfler-ag | walter-leuthold | Tenant |
| `{{lokalbezug}}` | hier in Oberrieden | hier in Oberrieden | prospect_card → region |
| `{{kontext_satz}}` | Nach Ihrem Einsatz bei uns habe ich mir ein paar Gedanken gemacht | Ich habe mir Gedanken zu Ihrem Betrieb gemacht | Variante A oder B |
| `{{kontext_mail}}` | Vor ein paar Monaten war einer von Ihnen beiden bei uns... | Ich bin auf Ihren Betrieb aufmerksam geworden... | Variante A oder B |
| `{{jubilaeum_satz}}` | gerade in diesem Jubilaeumsjahr einen sichtbaren Platz | einen sichtbaren Platz | Nur wenn >50 Jahre |
| `{{einsatz_bezug}}` | Sie waren bei uns ja wegen der Dichtung am Wasserhahnanschluss | Ein typischer Fall waere zum Beispiel eine verstopfte Leitung | Variante A oder B |

### Varianten-System (2 Master-Versionen)

| Variante | Wann | Kontext |
|----------|------|---------|
| **A: "Einsatz bei mir"** | Founder war Kunde beim Betrieb | Persoenliche Geschichte, konkreter Bezug |
| **B: "Kenne aus der Region"** | Kein persoenlicher Bezug | Betrieb ist in der Region bekannt, professioneller Auftritt |

---

## E-Mail 1 — Erstkontakt (Video + Feedback-Bitte)

**Betreff:** `Etwas Persoenliches fuer die {{firma}}`
**Sender:** Gunnar Wende via noreply@send.flowsight.ch
**Reply-To:** gunnar.wende@flowsight.ch
**Tool:** `scripts/_ops/send_outreach_mail.mjs {{slug}} <email>`

### Plain-Text

```
Guten Tag {{anrede}}

Mein Name ist Gunnar Wende, ich wohne in Oberrieden.

{{kontext_mail}}

Das ist mir in Erinnerung geblieben.
Ich habe mir danach ein paar Gedanken gemacht
und fuer die {{firma}} etwas Konkretes vorbereitet.

Hier koennen Sie es sich in Ruhe anschauen — dauert etwa fuenf Minuten:
https://flowsight.ch/kunden/{{slug}}/vorstellung

Ich moechte Ihnen damit nichts verkaufen.
Mich wuerde einfach ehrlich interessieren, wie das auf Sie wirkt.

Gerne komme ich auch kurz persoenlich vorbei —
wir sind ja nur ein paar Strassen voneinander entfernt.

Freundliche Gruesse
Gunnar Wende
Oberrieden

+41 44 552 09 19
gunnar.wende@flowsight.ch
```

### Variante A — Kontext (Einsatz bei mir)

```
{{kontext_mail}} =
Vor ein paar Monaten war einer von Ihnen bei uns in der Wohnung,
weil [konkreter Anlass]. Wir waren mit der Ausfuehrung sehr zufrieden.
```

### Variante B — Kontext (Kenne aus der Region)

```
{{kontext_mail}} =
Ich bin auf die {{firma}} aufmerksam geworden
und habe mir fuer Ihren Betrieb etwas vorbereitet.
```

### HTML-Mail

Aufbau (identisch fuer alle Betriebe):
1. Persoenlicher Text (Kontext)
2. **Gunnar-Foto** (120px, rund, klickbar → Vorstellungsseite)
3. Link zur Vorstellungsseite als Text-Fallback
4. Warmer Abschluss + Signatur

Design-Regeln:
- Plain-Text-Optik, kein Newsletter-Look
- Gunnar-Foto OHNE Play-Button → Vertrauensanker
- Kein "Jetzt ansehen" Button → sachlich: "Hier koennen Sie es sich anschauen"
- Kein Tracking-Pixel

---

## E-Mail 2 — Zugaenge (automatisch via activate_prospect.mjs)

**Trigger:** `node --env-file=src/web/.env.local scripts/_ops/activate_prospect.mjs --slug={{slug}} --email=<prospect-email>`
**Inhalt:** Leitzentrale-Link + OTP-Anleitung + Testnummer + PWA-Hinweis + Trial-Zeitraum
**Versand:** Automatisch, kein manuelles Script noetig.

---
## Take 1 — Ihr Alltag und die eigentliche Frage

**Modus:** Kamera gross, kein Screen-Share

### Speakflow

```
Hallo, einen wunderschönen guten Tag.

Mein Name ist Gunnar Wende.

Ich habe für Ihren Betrieb
etwas Persönliches vorbereitet
und möchte Ihnen das ganz kurz zeigen.

Sie kennen die Situation:

Sie sind auf der Baustelle,
sind im Kundengespräch
oder unterwegs —

und währenddessen 
kommt schon das Nächste rein.
Per Telefon,
per E-Mail
oder aus einem Gespräch vor Ort.

Und natürlich kann man
nicht immer direkt erreichbar sein
und hat bei allem 
nicht sofort den ganzen Überblick.

Und genau dort
wird es im Alltag kritisch.

Ein Anruf bleibt offen,
eine neue Meldung wird nicht sauber aufgenommen,
und ehe Sie reagieren können,
ist der Kunde genervt 
oder sogar schon beim Nächsten.

Genau dafür
habe ich für Ihren Betrieb
etwas sehr Konkretes vorbereitet.

Ich zeige Ihnen das kurz
an einem typischen Fall.

---

## Take 2 — Wenn Sie gerade nicht rangehen können

**Modus:** Kamera klein (PiP), Handy-Screen / Leitsystem zeigen
**Dauer:** zeigt sich noch 
**Automatisierung:** 90% generisch. Agent-Greeting per TTS, Firmenname per STS.
**Gold-Standard:** 1:1 aus Doerfler AG Take 2 (speakflow_final.txt, 12.04.2026 - hier gibts aber seit 17.04. update im scripts, daher neu und Dörfler unabhängig)
**Assembly:** `scripts/_ops/assemble_take2_video.mjs` + `build_take2_screens.mjs`

### Speakflow (Gold-Standard — copy-paste aus Doerfler)

```
Nehmen wir an,
ein Kunde braucht Sie gerade,
erreicht Sie aber nicht direkt,
weil Sie auf der Baustelle sind
in einem Kundengespräch
oder der Kunde ruft ausserhalb
der Öffnungszeiten an.

Dann sollte dieser Anruf
nicht einfach ins Leere laufen,
sondern der Kunde
zunächst sauber aufgefangen werden.

Und genau dafür habe ich für Sie
eine Assistentin vorbereitet,
die dann übernimmt,
wenn Sie gerade nicht direkt rangehen können.

Ich rufe einmal kurz an.

>>> ANRUF (Agent-Audio: Greeting + Intake + Sprachwechsel + Öffnungszeiten +  Kompetenzgrenzen + Farewell) <<<

Okay perfekt.

Und direkt nach dem Anruf
erhält der Kunde eine SMS.

So weiss der Kunde sofort:
Sein Anliegen ist angekommen,
und er kann bei Bedarf
direkt noch ein Foto vom Schaden nachreichen.

Und Für Sie heisst das:
Sie können Ihr Kundengespräch
oder Ihren Einsatz in Ruhe zu Ende führen,
ohne unterbrochen zu werden
und ohne dass das Anliegen verloren geht.

Und danach ist es nicht 
einfach irgendwo erfasst,
sondern direkt so da,
dass Sie damit weiterarbeiten können.

Genau dafür hab ich für Ihren Betrieb
eine eigene Leitzentrale vorbereitet -
Ihre eigene App.

Egal ob ein Kunde anruft,
online etwas meldet
oder Sie selbst etwas aufnehmen —
alles läuft hier zusammen.

Sie sehen hier auf einen Blick,
was neu ist,
was bereits läuft,
was erledigt ist
und wie es bei den Bewertungen aussieht.

Und gerade beim Thema Bewertungen
kennen Sie das sicherlich auch
aus eigener Erfahrung:

Sehr gute Arbeit wird tagtäglich geleistet,
führt im Alltag aber nicht automatisch dazu,
dass daraus auch wirklich 
eine positive Rückmeldung entsteht.

Und gleichzeitig möchte man
nach sauber geleisteter Arbeit
nicht jedes Mal noch aktiv
um eine Bewertung bitten —

vor allem nicht so,
dass es für den Kunden lästig wird.

Dafür habe ich aber auch noch
einen ziemlich coolen Weg gefunden —
zeige ich Ihnen gleich.

Und wenn ich den Fall öffne,
sehen Sie nicht einfach nur,
dass etwas eingegangen ist.

Sie sehen hier direkt,
worum es geht,
wie dringend es ist
uuund was bereits erfasst wurde.

Von hier aus
geht es dann direkt weiter.

Sie können den Fall einordnen,
einem Mitarbeiter zuweisen
und einen Einsatztermin festlegen.

So wird aus einem eingegangenen Anliegen
ein sauberer Arbeitsfall,
mit dem Sie direkt weiterarbeiten können.

Und genau so haben Sie den aktuellen Stand
nicht irgendwo im Kopf
oder verteilt in einzelnen Nachrichten,

sondern zentral an einem Ort —
sauber eingeordnet,
nachvollziehbar
und direkt einsatzbereit.
```

### Was sich pro Betrieb aendert (nur im Audio)

| Element | Wie | Aufwand |
|---------|-----|---------|
| Agent-Greeting ("Hier ist Lisa von {{firma}}") | TTS Ela-Stimme, 1 Satz | CHF 0.01 |
| "{{firma}}-App" in Seg4 | STS Firmenname-Swap | Automatisch |
| Oeffnungszeiten-Antwort im Call | TTS Ela, dynamisch aus prospect_card | CHF 0.01 |

---

## Take 3 — Wenn ein Kunde lieber online meldet

**Modus:** Kamera klein, Desktop-Screen (Website + Wizard)
**Dauer:** ~90 Sekunden
**Automatisierung:** 80% generisch. Website-Screenshots pro Betrieb. Firmenname per STS.

### Speakflow

```
Und der zweite Weg,
der im Alltag genauso wichtig ist:

Nicht jeder Kunde ruft an.

Viele schauen kurz online,
landen auf Ihrer Website
und wollen ihr Anliegen
einfach schnell
und ohne Umwege durchgeben.

Genau dort entsteht oft das nächste Problem:

Die Anfrage kommt zwar rein,
aber unvollständig,
unklar
oder ohne die Informationen,
die Sie für den nächsten Schritt 
eigentlich brauchen.

Und gleichzeitig will auch der Kunde
nicht lange suchen
oder erst überlegen müssen,
was er jetzt alles angeben soll.

Genau dafür
habe ich diesen Weg vorbereitet.

Nicht einfach als weiteres Formular,
sondern so,
dass der Kunde Schritt für Schritt
sauber durchgeführt wird
und Sie am Ende
direkt mit einer vollständigen Meldung
weiterarbeiten können.

Ich zeige Ihnen das kurz.

>>> WIZARD ZEIGEN <<<
Der Kunde klickt hier zuerst an,
worum es geht
und wie dringend das Ganze ist.

So ist das Anliegen
von Anfang an sauber eingeordnet.

Danach kommt direkt der Einsatzort dazu.

Also einfach Strasse,
Hausnummer,
Postleitzahl
und Ort.

Damit ist sofort klar,
wo es hingeht.

Und im letzten Schritt
werden die Kontaktdaten ergänzt,
das Anliegen kurz beschrieben
und mit einem Klick
auch direkt ein Foto mitgeschickt.

Denn Sie wissen ja selbst:
Ein Foto sagt oft mehr
als viele Worte.
>>> WIZARD ZEIGEN <<<


Und auch das läuft danach
wieder genau in denselben Ablauf hinein.

Sie sehen den neuen Eintrag
direkt in Ihrer Übersicht
und können ihn von dort aus
ganz normal weiterführen.

Und wenn etwas direkt bei Ihnen
im Betrieb,
auf der Baustelle
oder in einem Gespräch entsteht,
kann es genauso direkt erfasst werden
und läuft ebenfalls
in dieselbe Leitzentrale hinein.

Damit laufen bei Ihnen
telefonische,
schriftliche
und direkt aufgenommene Anliegen
nicht nebeneinander,

sondern sauber
an einer Stelle zusammen.

----

## Take 4 — Wie gute Arbeit sichtbar wird + Abschluss

**Modus:** Kamera klein → Kamera gross am Ende
**Dauer:** ~90-100 Sekunden
**Automatisierung:** 95% generisch. Firmenname per STS.

### Speakflow


Zum Schluss
möchte ich Ihnen noch
einen Punkt zeigen,
der für Ihren Alltag
richtig wertvoll ist.

>> ÜBERSICHT ZEIGEN / FALL ÖFFNEN <<<

Dafür gehen wir jetzt
in den eben erstellten Fall hinein,
setzen ihn auf „in Arbeit“
und terminieren den Einsatz.

Dadurch wird der Kunde
24 Stunden vorher
automatisch erinnert.

So sinkt das Risiko,
dass ein Termin
versehentlich untergeht.

>>> TERMINIEREN <<<

Wenn der Auftrag dann
sauber erledigt ist,
wird der Status hier
auf Erledigt gesetzt
und kurz gespeichert.

Und genau hier
kann die Bewertung
im richtigen Moment
direkt angestossen werden.

Der entscheidende Unterschied:

Sie fragen nicht irgendwann
zwischen Tür und Angel nach,

sondern genau dann,
wenn der Auftrag sauber erledigt ist
und Sie das Gefühl haben:
Jetzt passt es.

>>> STATUS AUF ERLEDIGT / SPEICHERN / BEWERTUNG ANFRAGEN <<<

Und der Kunde bekommt das Ganze
direkt aufs Handy.

>>> SMS ZEIGEN / LINK ÖFFNEN <<<

Und auch hier
wird er nicht einfach
irgendwohin geschickt,

sondern ruhig
und verständlich durchgeführt.

>>> REVIEW-SEITE / 5 STERNE <<<

Ohne Druck,
ohne unnötige Reibung
und einfach in einem Moment,
in dem es für ihn gerade passt.

>>> FAKE-ENDSCREEN <<<

Und genau hier
schliesst sich der Kreis.

Aus dem,
was im Alltag sonst
nebeneinander herläuft,
wird Ihr betriebseigenes Leitsystem:

Dass von der ersten Anfrage
bis zum abgeschlossenen Auftrag
alles so ineinandergreift,

dass nichts verloren geht,
Sie den Überblick behalten,
direkt weiterarbeiten können

und gute Arbeit am Ende
auch auf das einzahlt,
was für Ihren Betrieb zählt:

auf Ihren guten Ruf
und auf neue Aufträge.

Und genau deshalb
wollte ich Ihnen das
einmal konkret zeigen.

Wenn Sie sich dabei
an ein, zwei Stellen
gedacht haben:
ja, das würde bei uns
wirklich helfen —

dann schreiben Sie mir
einfach kurz zurück.

Und wenn Sie sagen,
das ist nichts für uns,
ist das natürlich auch völlig okay.

Dann wäre ich Ihnen
für eine ehrliche Rückmeldung
genauso dankbar.

Vielen Dank,
dass Sie sich die Zeit
dafür genommen haben.

Ich würde mich wirklich freuen,
von Ihnen zu hören.

---

## Pipeline pro Betrieb (E2E)

```
PHASE A — Vorbereitung (kein Kontakt mit Prospect)
  1. Scout: prospect_card.json erstellen
  2. Provisionieren: provision_trial.mjs --no-welcome-mail
  3. Seed: seed_demo_data_v2.mjs --slug={{slug}} --count=70
  4. Voice Agent: retell_sync.mjs (aus Schablone)
  5. Website: CustomerSite Config (Modus 1) oder /start-Seite (Modus 2)
  6. Vorstellungsseite: /kunden/{{slug}}/vorstellung
  7. Video: Assembly-Pipeline (Take 1-4 aus Master + Platzhalter-Swap)
  8. QA: Smoke-Test (Voice + Wizard + Leitzentrale + SMS)

PHASE B — Outreach
  9. Mail 1: send_outreach_mail.mjs {{slug}} <email>
 10. Warten auf Reaktion
 11. Prospect meldet sich → activate_prospect.mjs → Mail 2 (automatisch)
 12. Trial 14 Tage → Follow-up Tag 10 → Decision Tag 14
```

### Zeitaufwand pro Betrieb (Ziel)

| Schritt | CC | Founder | Kosten |
|---------|-----|---------|--------|
| Provisionieren (1-5) | 25 Min | 0 Min | CHF 0 |
| Video-Assembly (6-7) | 15 Min | 0 Min | CHF 0.11 |
| QA (8) | 5 Min | 2 Min (Stichprobe) | CHF 0 |
| Outreach (9) | 1 Min | 0 Min | CHF 0 |
| **Total** | **~45 Min** | **~2 Min** | **CHF 0.11** |

---

## Dont's (identisch fuer alle Betriebe)

- ~~"Das kostet nur 299 Franken"~~ → Kein Preis. Nur wenn gefragt.
- ~~"Unsere KI-Technologie"~~ → "Assistentin", nicht "KI"
- ~~"Dashboard" / "Wizard" / "Onboarding"~~ → "Leitsystem", "Meldungsformular", "Einrichtung"
- ~~"Ich biete Ihnen an"~~ → "Ich habe etwas vorbereitet" / "Ihre Meinung"
- ~~Features auflisten~~ → Pain zeigen, Loesung demonstrieren
- ~~Prospect als "Kunde" bezeichnen~~ → Er ist (noch) kein Kunde
- ~~"Lisa"~~ → "Ihre Assistentin" oder "die Assistentin"
- ~~"14 Tage Trial"~~ → Nicht in Mail 1 / Video. Erst in Mail 2.
- ~~"PWA installieren"~~ → "Funktioniert auch als App auf dem Handy"
