# Speakflow Template — Generische Vorstellung (Take 1-4 + E-Mails)

**Version:** 1.0 | **Datum:** 2026-04-13
**Zweck:** Generisches Speakflow-Template fuer alle Betriebe ab Betrieb 2 (nach Doerfler AG).
**Gold-Standard:** Doerfler AG Take 2 = 1:1 Vorlage. Takes 1/3/4 abgeleitet aus Doerfler-Script.
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
**Dauer:** ~80 Sekunden
**Automatisierung:** 60% generisch. Firmenname per STS-Swap (1 Wort).
**2 Master-Versionen:** A (Einsatz) + B (Region). Pro Betrieb: STS tauscht `{{firma}}`.

### Speakflow — Variante A (Einsatz bei mir)

```
Guten Tag {{anrede}}.

Mein Name ist Gunnar Wende.
Ich wohne nur ein paar Strassen weiter,
{{lokalbezug}}.

Nach Ihrem Einsatz bei uns
habe ich mir ein paar Gedanken gemacht
und dazu dieses kurze Video
fuer Sie aufgenommen.

Ich moechte Ihnen kurz zeigen,
was daraus entstanden ist.

Dabei ist mir eine Frage
durch den Kopf gegangen:

Wie sorgen wir bei der {{firma}} dafuer,
dass im Alltag nichts verloren geht
und man trotzdem direkt sauber
weiterarbeiten kann?

Sie sind auf der Baustelle,
haben Kundengespraeche,
und gleichzeitig kommen neue Anliegen rein —
per Telefon,
per E-Mail
oder direkt im Gespraech.

Und genau dort wird es entscheidend:
Man ist nicht immer direkt erreichbar,
hat nicht immer sofort
den ganzen Stand zur Hand,
und trotzdem muss von Anfang an klar sein,
worum es geht
und was als Naechstes zu tun ist.

Genau dafuer
habe ich mir fuer die {{firma}}
etwas Konkretes ueberlegt.

Ich zeige Ihnen das kurz
an einem typischen Fall.
```

### Speakflow — Variante B (Kenne aus der Region)

```
Guten Tag {{anrede}}.

Mein Name ist Gunnar Wende.
Ich wohne nur ein paar Strassen weiter,
{{lokalbezug}}.

Ich habe mir Gedanken
zu Ihrem Betrieb gemacht
und dazu dieses kurze Video
fuer Sie aufgenommen.

Ich moechte Ihnen kurz zeigen,
was daraus entstanden ist.

Dabei ist mir eine Frage
durch den Kopf gegangen:

Wie sorgen wir bei der {{firma}} dafuer,
dass im Alltag nichts verloren geht
und man trotzdem direkt sauber
weiterarbeiten kann?

Sie sind auf der Baustelle,
haben Kundengespraeche,
und gleichzeitig kommen neue Anliegen rein —
per Telefon,
per E-Mail
oder direkt im Gespraech.

Und genau dort wird es entscheidend:
Man ist nicht immer direkt erreichbar,
hat nicht immer sofort
den ganzen Stand zur Hand,
und trotzdem muss von Anfang an klar sein,
worum es geht
und was als Naechstes zu tun ist.

Genau dafuer
habe ich mir fuer die {{firma}}
etwas Konkretes ueberlegt.

Ich zeige Ihnen das kurz
an einem typischen Fall.
```

---

## Take 2 — Wenn Sie gerade nicht rangehen koennen

**Modus:** Kamera klein (PiP), Handy-Screen / Leitsystem zeigen
**Dauer:** ~5:38 (338s)
**Automatisierung:** 90% generisch. Agent-Greeting per TTS, Firmenname per STS.
**Gold-Standard:** 1:1 aus Doerfler AG Take 2 (speakflow_final.txt, 12.04.2026)
**Assembly:** `scripts/_ops/assemble_take2_video.mjs` + `build_take2_screens.mjs`

### Speakflow (Gold-Standard — copy-paste aus Doerfler)

```
Nehmen wir an,
ein Kunde braucht Sie gerade,
erreicht Sie aber nicht direkt,
weil Sie auf der Baustelle sind
in einem Kundengespraech
oder der Kunde ruft ausserhalb
der Oeffnungszeiten an.

Dann sollte dieser Anruf
nicht einfach ins Leere laufen,
sondern der Kunde
zunaechst sauber aufgefangen werden.

Und genau dafuer habe ich fuer Sie
eine Assistentin vorbereitet,
die dann uebernimmt,
wenn Sie gerade nicht direkt rangehen koennen.

Ich rufe einmal kurz an.

>>> ANRUF (Agent-Audio: Greeting + Intake + Sprachwechsel + Kompetenzgrenzen + Farewell) <<<

Okay perfekt.

Und direkt nach dem Anruf
erhaelt der Kunde eine SMS.

So merkt der Kunde sofort:
Sein Anliegen ist angekommen,
und er kann bei Bedarf
direkt noch ein Foto vom Schaden nachreichen.

Fuer Sie heisst das:
Sie koennen Ihr Kundengespraech
oder Ihren Einsatz in Ruhe zu Ende fuehren,
ohne unterbrochen zu werden
und ohne dass das Anliegen verloren geht.

Und danach ist es nicht einfach irgendwo erfasst,
sondern direkt so da,
dass Sie damit weiterarbeiten koennen.

Genau dafuer fuer Ihren Betrieb
Ihr eigenes Leitsystem vorbereitet.

Und egal ob ein Kunde anruft,
online etwas meldet
oder Sie selbst etwas aufnehmen —
alles laeuft hier zusammen.

Sie sehen hier auf einen Blick,
was neu ist,
was bereits laeuft,
was erledigt ist
und wie es bei den Bewertungen aussieht.

Und gerade beim Thema Bewertungen
kennen Sie das sicherlich auch
aus eigener Erfahrung:

Sehr gute Arbeit wird tagtaeglich geleistet,
fuehrt im Alltag aber nicht automatisch dazu,
dass daraus auch eine positive Bewertung entsteht.

Und gleichzeitig moechte man
nach sauber geleisteter Arbeit
nicht jedes Mal noch aktiv
um eine Bewertung bitten.

Dafuer habe ich aber auch noch
einen ziemlich coolen Weg gefunden —
zeige ich Ihnen gleich.

Und wenn ich den Fall oeffne,
sehen Sie nicht einfach nur,
dass etwas eingegangen ist.

Sie sehen direkt,
worum es geht,
wie dringend es ist
uuund was bereits erfasst wurde.

Von hier aus
geht es dann direkt weiter.

Sie koennen den Fall einordnen,
einem Mitarbeiter zuweisen
und einen Einsatztermin festlegen.

So wird aus einem eingegangenen Anliegen
ein sauberer Arbeitsfall,
mit dem Sie direkt weiterarbeiten koennen.

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
Dasselbe funktioniert
uebrigens auch schriftlich.

Ich habe fuer die {{firma}}
auch eine Website vorbereitet —
nicht als Ersatz
fuer Ihren bisherigen Auftritt,
sondern um auch diesen schriftlichen Weg
einmal konkret sichtbar zu machen.

Nur ganz kurz,
wie so ein Auftritt
fuer die {{firma}}
auch aussehen koennte:

ein sauberer Aufbau,
klare Leistungsbereiche,
Ihre Bewertungen,
Ihr Team,
Ihre Geschichte
und auch Ihr Einzugsgebiet —
{{jubilaeum_satz}}.

Und ueber genau diesen Weg
kann ein Kunde sein Anliegen
dann auch direkt online melden.

{{einsatz_bezug}}.
Ich gehe den Fall hier
kurz einmal online durch.

>>> WIZARD ZEIGEN <<<

Und auch das landet danach
wieder genau im selben Ablauf.

Hier sehe ich den Fall
direkt wieder in der Uebersicht
und kann ihn genauso oeffnen
und weiterfuehren.

Und wenn etwas direkt bei Ihnen
im Betrieb, auf der Baustelle
oder in einem Gespraech entsteht,
kann es genauso manuell aufgenommen werden
und laeuft ebenfalls
in dieselbe Leitzentrale hinein.

Damit laufen bei Ihnen telefonische,
schriftliche und manuelle Anliegen
nicht nebeneinander,
sondern sauber an einer Stelle zusammen.
```

### Variante A — Einsatz-Bezug

```
{{einsatz_bezug}} =
Sie waren bei uns ja
wegen der Dichtung am Wasserhahnanschluss.
Ich gehe unseren Fall hier
kurz einmal online durch.
```

### Variante B — Generisch

```
{{einsatz_bezug}} =
Ein typischer Fall waere zum Beispiel
eine verstopfte Leitung im Badezimmer.
Ich gehe den Fall hier
kurz einmal online durch.
```

---

## Take 4 — Wie gute Arbeit sichtbar wird + Abschluss

**Modus:** Kamera klein → Kamera gross am Ende
**Dauer:** ~90-100 Sekunden
**Automatisierung:** 85% generisch. Firmenname per STS.

### Speakflow

```
Und auf den Punkt mit den Bewertungen
komme ich jetzt bewusst
noch einmal zurueck.

Dafuer habe ich auch noch
einen ziemlich coolen Weg gefunden.

Aber zuerst:
Damit der Einsatz
auch wirklich stattfindet,
bekommt der Kunde 24 Stunden vorher
automatisch eine Erinnerung.
So vermeiden Sie Leerfahrten.

Und wenn der Einsatz dann
sauber erledigt ist,
kann mit einem Klick
direkt und gezielt
eine Bewertung angefragt werden.

>>> FALL AUF ERLEDIGT SETZEN / BEWERTUNGS-BUTTON ZEIGEN <<<

Gerade bei der {{firma}}
ist das aus meiner Sicht
ein wichtiger Punkt.

Gute Arbeit wird tagtaeglich geleistet.
Umso wichtiger ist es,
dass daraus im richtigen Moment
auch etwas fuer Image
und Vertrauen entsteht.

Gerade in unserem Fall:
Wir haetten fuer Ihren Einsatz
sehr gerne eine 5-Sterne-Bewertung dagelassen —
wenn man den Kunden
in so einem Moment
direkt und unkompliziert abholt,
passiert das deutlich eher.

So bleibt ein gut geloester Einsatz
nicht nur intern abgeschlossen,
sondern kann direkt
auf die Aussenwirkung
der {{firma}} einzahlen.

Und dahinter steht fuer mich im Kern
etwas sehr Einfaches:
dass bei Ihnen im Alltag
alles so ankommt,
dass man direkt sinnvoll
damit weiterarbeiten kann.

Das spart Zeit und Nerven,
sorgt schneller fuer Ueberblick,
macht die Vorbereitung einfacher
und sorgt gleichzeitig dafuer,
dass weniger verloren geht
und gute Arbeit am Ende
auch auf Vertrauen und die Aussenwirkung
der {{firma}} einzahlt.

Wie schon in der Mail geschrieben:
Ich moechte Ihnen damit nichts verkaufen.
Mich wuerde einfach ehrlich interessieren,
wie das auf Sie wirkt.

Sie koennen mich jederzeit anrufen
oder mir kurz schreiben.
Ich freue mich, von Ihnen zu hoeren.

Vielen Dank fuer Ihre Zeit,
{{anrede}}.
```

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
