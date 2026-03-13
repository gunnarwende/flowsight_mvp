# Schatztruhe — Der rote Faden

> Dieses Dokument ist die EINZIGE Quelle für die End-to-End-Erfahrung des Prospects.
> Es beantwortet: Was erlebt er? Auf welchem Gerät? In welchem Format? Und warum macht er weiter?
> Mechanik × Psychologie × Proof = Conversion.

**Status:** FINAL — alle Entscheide gefallen. Produktionsbereit.
**Letzte Änderung:** 2026-03-13
**Vorgänger:** schatztruhe.md + schatztruhe2.md — abgelöst durch dieses Dokument
**Abhängigkeiten:** gold_contact.md (Nordstern), quality_gates.md (QA), videos/[slug]/production_brief.md (Drehbuch)

---

## 1. Der Prospect als Mensch

Christian Weinberger ist nicht "Meister-Profil ≤8 MA, ICP 90+". Er ist:

- **Inhaber in dritter Generation.** 1912. Grossvater hat das aufgebaut. Jeder verpasste Anruf ist eine Schande gegenüber der Familiengeschichte.
- **Mann am Zürichsee.** Thalwil, 8800. Er kennt jeden Sanitär-Kollegen im Umkreis. Was ein Nachbar-Betrieb hat, interessiert ihn — nicht aus Neid, sondern weil er der Beste sein will.
- **Handwerker, kein Techniker.** Er versteht Technik, baut sie aber nicht. Wenn etwas nicht in 30 Sekunden funktioniert: "Das ist nichts für mich."
- **Handy = Lebensnerv.** SMS = Wahrheit. Anruf = Realität. E-Mail-App = erster Check abends auf dem Sofa.
- **Skeptiker aus Erfahrung.** CRM, Buchungssysteme, Webagenturen — alle wollten etwas von ihm. Keiner hat ihm etwas gegeben, bevor er zahlte.

**Er kauft keine Software. Er kauft: Beweis. Nähe. Vertrauen. Und einen Grund, nicht Nein zu sagen.**

---

## 2. Die sechs Psychologie-Hebel

| # | Hebel | Prinzip | Wo wir ihn einsetzen |
|---|-------|---------|---------------------|
| 1 | **Vorleistung** (Reciprocity) | Menschen fühlen sich verpflichtet zurückzugeben, wenn jemand zuerst investiert hat | E-Mail: "Ich habe für Jul. Weinberger AG etwas ausprobiert." Website, Lisa, Nummer — alles existiert schon |
| 2 | **Lokale Nähe** | Vertrauen ist proportional zur wahrgenommenen Nähe. "Einer von uns" schlägt "bester Anbieter" | E-Mail + Video: "aus Oberrieden." PLZ 8800 in Lisas Antwort. Thalwil im Fallbeispiel |
| 3 | **Proof-Staffelung** | Ein Beweis ist Zufall. Drei sind System. Fünf sind Überzeugung | Visuell (Video) → Auditiv (Lisa) → Physisch (SMS) → Strukturell (Leitstand) → Temporal (14 Tage) |
| 4 | **Curiosity Gap** | Das Gehirn kann offene Schleifen nicht ignorieren | E-Mail öffnet die Schleife ("ausprobiert — Ihre Meinung?"). Video schliesst sie. E-Mail erklärt NICHT was Lisa tut. |
| 5 | **Loss Aversion** | Drohender Verlust > möglicher Gewinn | "Die Nummer ist für Weinberger AG reserviert. Ein Betrieb, eine Region." |
| 6 | **Cognitive Ease** | Je einfacher, desto vertrauenswürdiger | "Kein Login. Keine Verpflichtung. Kein Vertrag. Einfach anrufen." |

**Zusatz-Hebel: Defensives Verkaufen (Schweizer Marktpsychologie)**
Niemals Druck. Niedrige Erwartung rein → Video übertrifft sie um Längen → Kinnlade fällt runter.
"Feedback gesucht" disarmt jeden Skeptiker bevor er überhaupt das Video anschaut.

---

## 3. Der Prospect: Gerät, Kontext, Aufmerksamkeit

### Primär: Handy (Meister-Profil ≤8 MA)
- **Wann:** Abends 18:30–21:00, Mittagspause 12:00–13:00
- **Wo:** Sofa, Baustelle (Pause), Auto (stehend)
- **Aufmerksamkeit:** 8 Sekunden für die Entscheidung: Öffnen oder Löschen
- **E-Mail-App:** GMail oder Apple Mail (kein Outlook bei Meister)
- **Bildschirm:** 375–428 px breit

### Sekundär: Laptop/Desktop (Betrieb-Profil >8 MA)
- **Wann:** Morgens 07:00–09:00 (Bürokraft)
- **E-Mail-App:** Outlook Desktop oder Webmail
- **Bildschirm:** 1280–1920 px

### Konsequenz
Alles muss mobile-first funktionieren. Ein Tap = eine Aktion. Grosse Touch-Targets.

---

## 4. Die Formate — Was benutzen wir und wofür?

### E-Mail (Trägermedium)
**Rolle:** Deckel der Schatztruhe. Transportiert Links. Weckt Neugier. Baut Vertrauen durch Bescheidenheit.
**Nicht die Rolle:** Überzeugen, erklären, verkaufen.

- Max 400 Zeichen Body (scanbar in 5 Sekunden)
- Genau 3 Links (nicht mehr — Entscheidungsparalyse)
- <30 KB HTML, kein Attachment
- Thumbnail als extern gehostetes Bild (Loom CDN) — nie eingebettet

### Video (Rohschnitt 130–140s)
**Rolle:** Emotionaler Beweis. "Ich habe das FÜR DICH gebaut, und es funktioniert JETZT."
**Philosophie:** Rohschnitt enthält ALLE Must-Haves. Analyse-Session danach entscheidet was rausfällt — Weniger kann mehr WOW erzeugen. Kein Versand vor Analyse.

| Parameter | Wert |
|-----------|------|
| Dauer Rohschnitt | 130–140s (alle Must-Haves drin) |
| Dauer Final | TBD nach Analyse-Session |
| Auflösung | 1080p / 30fps |
| Delivery | HTTPS Stream via Loom-Link |
| In der E-Mail | Animierter GIF-Preview (Loom CDN) + Link |
| Audio | Externes USB-Mikro Pflicht (kein Laptop-Mic) |
| Tracking | Loom Analytics (Founder sieht: geöffnet, wie lange, Replays) |
| Loom Plan | Starter ($15/mo) — kein Branding, kein Zeitlimit, Analytics |

### Persönlicher Einstieg (/start/[slug])
**Rolle:** Persönlicher Spiegel + Sammelstelle für alle Aktionen.

- Prospect sieht SEINE Firma: Name, Tagline, Sterne, Services, Adresse
- Alle CTAs: Anrufen / Anliegen melden / Leitstand öffnen
- Kein Login, kein Erklärtext, pure Wiedererkennung
- **Zweiter oder dritter Klick** — nicht der erste. Sie spiegelt, beweist nichts.

### Testnummer (Voice)
**Rolle:** DER Beweis-Moment. Prospect hört Lisa mit seinem Firmennamen.
**Delivery:** E-Mail (als tel:-Link), Video (eingeblendet), Persönlicher Einstieg (CTA-Button).

---

## 5. Die drei Links in der E-Mail

**Genau 3 Links. Reihenfolge ist Absicht.**

### Link 1: Thumbnail → Video (visuell dominant, oben)
**Format:** Animierter Loom-GIF-Preview (extern gehostet, nie inline), klickbar → Loom-URL
```html
<a href="[LOOM_VIDEO_URL]">
  <img src="[LOOM_THUMBNAIL_CDN]"
       alt="Was ich für Jul. Weinberger AG gebaut habe" />
</a>
▶ Video ansehen (2 Minuten)
```
**Fallback:** Wenn Bilder blockiert → Text-Link bleibt sichtbar.
**Psycho-Rolle:** Spiegel-Effekt startet im Posteingang — er sieht seinen Betrieb im Thumbnail bevor er klickt. Animierter Loop = Bewegung = Aufmerksamkeit.

### Link 2: Testnummer (tel:-Link, Mitte)
**Format:** `<a href="tel:+41435051101">043 505 11 01</a>`
**Ton:** Optional ("Falls es Sie interessiert") — kein Druck.
**Psycho-Rolle:** Ein Tap, Lisa nimmt ab. Direkt, ohne Umweg.

### Link 3: Persönlicher Einstieg (dezent, unten)
**Format:** Text-Link → `/start/weinberger-ag`
**Psycho-Rolle:** Orientierung + Spiegel. "Schau, das bin ja ich."

### Was klickt er zuerst?
```
Prospect öffnet E-Mail
    │
    ├── Neugierig, hat Zeit (60%) ──→ Thumbnail/Video ──→ Beeindruckt ──→ Ruft an
    │
    ├── Wenig Zeit, Action-Typ (25%) ──→ Nummer ──→ Hört Lisa ──→ WOW
    │
    └── Skeptisch, will prüfen (15%) ──→ Pers. Einstieg ──→ Sieht sich selbst ──→ Vertrauen ──→ Ruft an
```
Alle drei Wege führen zum selben Ergebnis: **Er ruft an.**

---

## 6. Die Kette — Schritt für Schritt mit Psychologie

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCHRITT 0: POSTEINGANG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Handy vibriert. 19:47 Uhr, Dienstagabend.
Subject: "Ich habe etwas ausprobiert — Ihre Meinung, Herr Weinberger?"

Psychologie: EGO-TRIGGER. Sein Name persönlich angesprochen.
             NEUGIER. "Was hat er ausprobiert?"
             KEIN DRUCK. "Ihre Meinung" = kein Verkaufsversprechen.
Zug →        "Was ist das?" → ÖFFNET

────────────────────────────────────────────────────────────────────
SCHRITT 1: E-MAIL LESEN (8 Sekunden)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sieht: Animierter Thumbnail (sein Betrieb?). "Oberrieden."
       "etwas ausprobiert." "ehrliches Feedback." Nummer. 3 Links.

Psychologie: LOKALE NÄHE — "aus Oberrieden, nicht weit von Thalwil."
             RECIPROCITY — "Er hat schon etwas gebaut, ohne dass ich Ja sagte."
             CURIOSITY GAP — "Was hat er ausprobiert?"
             DEFENSIVES KAUFEN — "Er will Feedback, nicht mein Geld."
             NIEDRIGE ERWARTUNG — "schauen wir mal kurz..."
Zug →        Thumbnail bewegt sich. → KLICKT VIDEO

────────────────────────────────────────────────────────────────────
SCHRITT 2: VIDEO SCHAUEN (Rohschnitt 130–140s)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

00:00–00:05 | SPIEGEL
  Screen: julweinberger.ch (SEINE echte Website — Modus 2)
  Founder: "Jul. Weinberger AG. Haustechnik seit 1912. Thalwil."
  → Er sieht sich selbst. Respekt für seine Marke. Vorleistung bestätigt.
  → "Der hat meine Website angeschaut. Der kennt uns."

00:05–00:12 | KONTEXT
  Founder: "Dienstagabend, 19 Uhr. Heizung ausgefallen. Ihr Handy klingelt.
            Sie sind noch auf der Baustelle."
  → Er KENNT diesen Moment. Das ist sein Alltag.
  → "Der versteht mein Geschäft."

00:12–00:35 | BEWEIS 1 — AUDITIV (Lisa-Anruf live)
  Screen: Handy-Bildschirm, Anruf läuft.
  Audio: Lisa: "Grüezi, hier ist Lisa von der Weinberger AG —
                schön, dass Sie anrufen. Wie kann ich Ihnen helfen?"
  Lisa führt Intake: Kategorie? Adresse? PLZ 8800 → "Thalwil, korrekt?"
  ★ Kill-Kriterium: Lisa MUSS "Weinberger AG" klar sagen. Kein Versand bis sitzt.

00:35–00:42 | STEUERERKLÄRUNG — BEWEIS DER SPEZIALISIERUNG
  Caller: "Könnten Sie mir auch bei der Steuererklärung helfen?"
  Lisa: "Das liegt ausserhalb meines Bereichs — ich bin spezialisiert
         auf Sanitär- und Heizungsanliegen der Jul. Weinberger AG."
  → Lisa sagt NEIN. Kein Generic-Bot sagt nein. Sie tut es.
  → Spezialisierung bewiesen. Vertrauen durch Grenze.

00:42–00:52 | LISA CLOSING
  Lisa: "Ich habe alles notiert. Ein Techniker der Jul. Weinberger AG
         wird sich bei Ihnen melden. Auf Wiederhören."
  → Professioneller Abschluss. Nichts verloren.

00:52–01:02 | BEWEIS 2 — PHYSISCH (SMS)
  Screen: Handy. Notification. Absender: "Weinberger".
  Founder (leise): "10 Sekunden nach dem Anruf."
  → Das Handy lügt nicht. Sein Firmenname als SMS-Absender. In seiner Hand.
  ★ Kill-Kriterium: Absender "Weinberger" lesbar. Keine Unschärfe.

01:02–01:12 | BEWEIS 3 — STRUKTURELL (Leitstand)
  Screen: Leitstand. Fall: Heizung, Thalwil, Dringlichkeit hoch.
  Founder: "Da steht alles. Kategorie, Adresse, Dringlichkeit. Kein Anruf verloren."
  → KONTROLLBEDÜRFNIS befriedigt. Nichts fällt durch den Rost.

01:12–01:24 | DIREKTMELDUNG ("Anliegen melden" — nie "Wizard" nach aussen)
  Founder: "Oder Ihre Kunden melden sich schriftlich — direkt hier."
  Screen: /start/weinberger-ag → CTA "Anliegen melden" → Formular öffnet
  Screen: Formular ausgefüllt → Submit → Leitstand zeigt zweiten Fall
  Founder: "Landet sofort im selben Leitstand."
  → Zweiter Kanal bewiesen. Kein verlorener Fall egal wie der Kunde kommt.

01:24–01:30 | PERSÖNLICHER EINSTIEG
  Screen: /start/weinberger-ag — Name, Sterne, 3 CTAs
  Founder: "Das ist Ihr persönlicher Einstieg — Nummer, Meldung, Leitstand."
  → 5 Sekunden. Erklärt Link 3 in der E-Mail. Kein Rätsel.

01:30–01:38 | CTA
  Screen: Nummer gross: 043 505 11 01
  Founder: "Das ist Ihre Nummer. Rufen Sie an — Lisa nimmt ab."
  → Direktheit = Respekt. Kein "Falls Sie Interesse haben..."

[FlowSight-Logo klein in Kamera-Ecke sichtbar während gesamtem Video]

Gesamtlänge Rohschnitt: ~130–140s
Analyse-Session danach: Was kann raus? Wo ist Weniger = Mehr WOW?
Kein Versand vor Analyse.

Psychologie Gesamt: PROOF × 6. Kinnlade fällt runter weil
                    Erwartung (Feedback-Ansatz) tief war.
Zug →               "Ich will das selbst erleben." → RUFT AN

────────────────────────────────────────────────────────────────────
SCHRITT 3: ER RUFT AN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lisa: "Grüezi, hier ist Lisa von der Weinberger AG..."
Er schildert Fall. Lisa führt Intake. Professionell, lokal, fokussiert.

Psychologie: AUDITIVER BEWEIS live — hört seinen Namen. Unmöglich zu ignorieren.
             COGNITIVE EASE — Lisa führt. Er antwortet nur.
Zug →        System handelt. → SMS KOMMT

────────────────────────────────────────────────────────────────────
SCHRITT 4: SMS (10 Sekunden nach Anruf)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Vibration. Absender: "Weinberger". Fallzusammenfassung. Korrektur-Link.

Psychologie: PHYSISCHER BEWEIS — das Handy lügt nicht.
             ÜBERRASCHUNG — SO schnell. SO persönlich.
Zug →        Öffnet Leitstand oder klickt weiter.

────────────────────────────────────────────────────────────────────
SCHRITT 5: LEITSTAND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fall: Kategorie, Adresse, Dringlichkeit. Vollständig. Strukturiert.

Psychologie: COMPLETENESS. CONTROL.
Zug →        "Das funktioniert. Für MICH."

────────────────────────────────────────────────────────────────────
SCHRITT 6: PERSÖNLICHER EINSTIEG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Jul. Weinberger AG. 4.4★. Sanitär, Heizung, Lüftung. Thalwil.
[Anrufen] [Anliegen melden] [Leitstand]

Psychologie: SPIEGEL. BESTÄTIGUNG. "Die haben sich mit mir beschäftigt."

────────────────────────────────────────────────────────────────────
SCHRITT 7: FOUNDER RUFT AN (48 Stunden nach Versand)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Einstieg via Loom Analytics:

| Signal                        | Anruf-Einstieg                                          |
|-------------------------------|--------------------------------------------------------|
| Video 100–140s geschaut        | "Wie war Ihr erster Eindruck von Lisa?"                |
| Video 50–80s geschaut          | "Haben Sie Lisa schon selbst angerufen?"               |
| Video <30s geschaut            | "Darf ich kurz zeigen was ich gebaut habe?"            |
| Nicht geschaut, aber angerufen | "Sie haben Lisa getestet — was hat sie richtig gemacht?"|
| Nichts                        | Sachlicher Einstieg. Kein Druck.                       |

Psychologie: PERSONALISIERUNG — er merkt: "Der weiss wo ich stehe."
             LOKALE NÄHE — "Ich bin im Zürichsee-Raum, wir könnten uns treffen."
```

---

## 7. Die E-Mail — exakter Wortlaut (FINAL)

```
┌──────────────────────────────────────────────────┐
│ Von: Gunnar Wende <gunnar@flowsight.ch>          │
│ An: c.weinberger@julweinberger.ch                │
│ Betreff: Ich habe etwas ausprobiert —            │
│          Ihre Meinung, Herr Weinberger?          │
└──────────────────────────────────────────────────┘

Guten Abend Herr Weinberger,

ich bin Gunnar Wende aus Oberrieden — direkt am
Zürichsee, nicht weit von Thalwil.

Ich entwickle gerade ein System für Sanitär- und
Heizungsbetriebe in der Region und habe für die
Jul. Weinberger AG etwas ausprobiert.

Ich würde mich sehr über Ihr ehrliches Feedback
freuen — auch wenn es kritisch ist. Das brauche
ich wirklich.

[THUMBNAIL — animierter Loom-Preview, klickbar]
▶ Video ansehen (2 Minuten)

Falls es Sie interessiert, können Sie auch direkt
testen: 043 505 11 01

🔗 Ihr persönlicher Einstieg
   flowsight.ch/start/weinberger-ag

Herzliche Grüsse aus Oberrieden,
Gunnar Wende
flowsight.ch
```

### Psychologie-Markup

| Zeile | Hebel | Wirkung |
|-------|-------|---------|
| "aus Oberrieden" | Lokale Nähe | Nachbar, nicht Konzern. 4 Minuten von Thalwil. |
| "nicht weit von Thalwil" | Nähe verstärkt | Konkrete geografische Nähe. |
| "etwas ausprobiert" | Defensives Verkaufen | Kein Pitch. Experiment. Bescheiden. |
| "Ihr ehrliches Feedback" | Rollen-Umkehr | Er ist Experte, nicht Kaufkandidat. |
| "auch wenn es kritisch ist" | Radikale Ehrlichkeit | Disarmt. Vertrauen durch Verwundbarkeit. |
| "Das brauche ich wirklich." | Authentizität | Kein Verkäufer sagt das. |
| Thumbnail animiert | Spiegel | Sein Betrieb im Posteingang, bevor er klickt. |
| "Falls es Sie interessiert" | Kein Druck | Nummer ist Einladung, nicht Forderung. |
| "flowsight.ch" in Signatur | Beweis Subtil | Firma dahinter. Nicht Freelancer. Klein. |

### Was die E-Mail NICHT sagt (absichtlich)
- Was Lisa tut → das zeigt das Video
- Wie die SMS aussieht → das erlebt er beim Anruf
- Den Preis → erst nach Tag-10-Gespräch
- "KI", "Retell", "Agent", "Wizard", "Dashboard", "Pipeline", "Onboarding"

---

## 8. Die Beweis-Architektur

Jeder Beweis muss REAL sein. Kein Mockup. Keine Simulation.

| # | Beweis | Sinn | Moment | Kontrollierbar? |
|---|--------|------|--------|-----------------|
| 1 | **Visuell** | Sehen | Video — Founder zeigt Live-System | ✅ Aufgenommen, QA'd |
| 2 | **Auditiv** | Hören | Lisa sagt "Weinberger AG" beim Anruf | ✅ Lisa-Config |
| 3 | **Spezialisierung** | Verstehen | Lisa lehnt Steuerfrage ab | ✅ Lisa-Prompt |
| 4 | **Physisch** | Spüren | SMS, Absender "Weinberger", 10s nach Anruf | ✅ Twilio + Supabase |
| 5 | **Strukturell** | Lesen | Leitstand zeigt vollständigen Fall | ✅ Webhook |
| 6 | **Temporal** | Erleben | 14 Tage — funktioniert auch nachts | ✅ Autonomes System |

**Reihenfolge ist Absicht:** Sehen → Hören → Verstehen → Spüren → Lesen → Erleben.

---

## 9. Format-Abgrenzung — Was zeigt was?

| Element | E-Mail | Video | Pers. Einstieg | Anruf/SMS | Leitstand |
|---------|--------|-------|----------------|-----------|-----------|
| Firmenname | ✅ Subject + Body | ✅ Spiegel + Lisa | ✅ Firmenkarte | ✅ Lisa + SMS | ✅ Fall-Header |
| Testnummer | ✅ tel:-Link | ✅ Eingeblendet | ✅ CTA-Button | — | — |
| Lisa live | ❌ | ✅ Kern-Moment | ❌ | ✅ Selbst erleben | ❌ |
| SMS-Beweis | ❌ | ✅ Stärkstes Bild | ❌ | ✅ Selbst empfangen | ❌ |
| Steuerfrage | ❌ | ✅ Szene 00:35 | ❌ | Optional live | ❌ |
| Direktmeldung | ❌ | ✅ Szene 01:12 | ✅ CTA | ❌ | ✅ Fall sichtbar |
| Google-Sterne | ❌ | ❌ | ✅ | ❌ | ❌ |
| FlowSight-Logo | ❌ | ✅ Klein, Ecke | ❌ | ❌ | ❌ |
| flowsight.ch | ✅ Signatur | ❌ | ✅ Fusszeile dezent | ❌ | ❌ |
| Preis | ❌ | ❌ | ❌ | ❌ | ❌ |

**Kernregel:**
- **E-Mail** = "Ich habe etwas ausprobiert." (Deckel auf)
- **Video** = "Schau, es funktioniert." (Erster Blick, Kinnlade)
- **Anruf** = "Erleb es selbst." (Anfassen)
- **SMS** = "Das Handy lügt nicht." (Physisch)
- **Pers. Einstieg** = "Das ist dein Betrieb." (Spiegel)
- **Leitstand** = "Alles da." (Voller Inhalt)

---

## 10. Technische Grenzen — Was kommt an?

### E-Mail
- Body <30 KB HTML → kommt überall an ✅
- Kein Attachment → kein Spam-Risiko ✅
- Thumbnail via Loom CDN (extern) → E-Mail bleibt klein ✅
- Fallback auf Text-Link wenn Bilder blockiert ✅

### Video-Streaming (Loom)
| Netzwerk | Erlebnis |
|----------|---------|
| WLAN / 5G | Sofort flüssig |
| 4G | Flüssig nach 1–2s |
| 3G | Loom adaptiert auf 480p — geht |

### Formate die wir NICHT benutzen
| Format | Grund |
|--------|-------|
| Video als Attachment | >25 MB = Gmail blockiert |
| PDF | Kein Klick, kein Tracking, wirkt wie Offerte |
| WhatsApp an Prospect | Kein PII. Nur Founder-Ops intern. |
| Landing Page mit Login | Reibung vor erstem WOW = Tod |

---

## 11. Versandzeitpunkt

**Regel:** Dienstag bis Donnerstag, 18:30 Uhr. Keine Ausnahme.

| Tag | Uhrzeit | Eignung |
|-----|---------|---------|
| ✅ Dienstag | 18:30 | Feierabend. Noch wach. E-Mail-App offen. |
| ✅ Mittwoch | 18:30 | Wochenmitte. Keine Hektik. |
| ✅ Donnerstag | 18:30 | Morgen Freitag — Zeit zu reagieren. |
| ⚠️ Montag | — | E-Mail-Überflutung. |
| ⚠️ Freitag | — | Gedanken beim Wochenende. |
| ❌ Wochenende | — | Privat-Modus. |

**Follow-up-Anruf:** 48 Stunden nach Versand. Nicht 24h (gierig), nicht 72h (Momentum weg).

---

## 12. Social Confirmation — ehrlich gelöst

**Option A** (wenn Dörfler live):
> "Ich arbeite aktuell mit einem Sanitärbetrieb im Kanton Zürich zusammen —
> die Erfahrungen sind vielversprechend."

**Option B** (Exklusivität):
> "Ich vergebe das System selektiv — ein Betrieb pro Region.
> Für Thalwil und Umgebung ist Jul. Weinberger AG meine erste Wahl."

**Founder als primärer Social Proof:**
In früher Phase schlägt Gunnars Gesicht + Stimme + Regionszugehörigkeit jede Kundenliste.

---

## 13. Loom Analytics als Follow-up-Steuerung

| Signal | Anruf-Einstieg |
|--------|----------------|
| Video 100–140s geschaut | "Wie war Ihr erster Eindruck von Lisa?" |
| Video 50–80s geschaut | "Haben Sie Lisa schon selbst angerufen?" |
| Video <30s geschaut | "Darf ich kurz zeigen was ich gebaut habe?" |
| Nicht geschaut, aber angerufen | "Sie haben Lisa getestet — was hat sie richtig gemacht?" |
| Nichts | Sachlicher Einstieg. Kein Druck. |

---

## 14. Checkliste: Vor dem ersten Versand

### Technisch
- [ ] Loom Starter aktiv (kein Branding, kein Zeitlimit, Analytics)
- [ ] Externes USB-Mikro installiert + getestet
- [ ] Lichtplatz: kein Gegenlicht, keine harten Schatten
- [ ] Rohschnitt 130–140s aufgenommen + Analyse-Session abgeschlossen
- [ ] Loom-Thumbnail-CDN-URL notiert (für E-Mail-Einbindung)
- [ ] E2E verifiziert: Anruf → Lisa → SMS → Leitstand (alle PASS)
- [ ] /start/weinberger-ag live + mobil getestet (alle 3 CTAs klicken)
- [ ] E-Mail intern getestet: Founder → eigenes Handy → alle 3 Links

### Inhaltlich
- [ ] Lisa sagt "Weinberger AG" klar → Kill-Kriterium PASS
- [ ] SMS-Absender "Weinberger" lesbar → Kill-Kriterium PASS
- [ ] Steuererklärung-Moment drin + Lisa-Ablehnung professionell
- [ ] Direktmeldung-Szene drin + Fall landet im Leitstand sichtbar
- [ ] E-Mail: "aus Oberrieden" + Feedback-Ansatz + kein SaaS-Wording
- [ ] Kein Wort nach aussen: Wizard, Dashboard, Cockpit, Agent, Pipeline

### Ablauf
1. Founder → E-Mail an sich selbst → auf Handy öffnen → alle 3 Links prüfen
2. Founder → 043 505 11 01 anrufen → SMS prüfen → Leitstand prüfen
3. Versand: Di–Do, 18:30 Uhr
4. Tag +2: Follow-up-Anruf (Einstieg via Loom Analytics)

---

## 15. Modus-Varianten

### Modus 2 — Weinberger (Standard für dieses Dokument)
Prospect hat eigene, hochwertige Website. Wir ersetzen sie nicht.
- Video 00:00: **julweinberger.ch** — seine echte Website
- Founder: "Sie haben bereits eine starke Website. Was Ihnen fehlt..."
- Kein FlowSight-Website-Moment im Video
- Persönlicher Einstieg = `/start/weinberger-ag` als Trial-Portal
- Nach Conversion: Direktmeldung als Link/Widget auf seiner Website

### Modus 1 — z.B. Dörfler
Prospect hat keine oder veraltete Website. Wir bauen sie.
- Video 00:00–00:20: **Neu gebaute Website** zeigen (+15–20s)
- Founder: "Ich habe [Firma] eine neue Website gebaut — schauen Sie kurz."
- Danach: identischer Flow (Lisa, SMS, Leitstand)
- Gesamtlänge Rohschnitt Modus 1: ~150–160s

### Adaptierung Dörfler / Leuthold
Szenen §6 und E-Mail §7 mit jeweiligen Firmendaten anpassen.
Referenz: `docs/gtm/videos/[slug]/skript.md`

---

## 16. Entscheidungslog — alle aufgelöst

| # | Entscheid | Ergebnis |
|---|-----------|----------|
| E1 | Video-Thumbnail in E-Mail | ✅ JA — animierter Loom-GIF-Preview, Loom CDN, extern gehostet |
| E2 | Betreffzeile + E-Mail-Ansatz | ✅ Defensiver Feedback-Ansatz. "Ihre Meinung, Herr Weinberger?" |
| E3 | Du oder Sie | ✅ SIE — erster Kontakt, Inhaber-Respekt immer |
| E4 | Link-Text Visitenkarte | ✅ "Ihr persönlicher Einstieg" |
| E5 | Persönlicher Einstieg im Video | ✅ JA — 5s, Szene 01:24 |
| E6 | Videolänge | ✅ 130–140s Rohschnitt. Analyse vor Versand. Final TBD. |
| E7 | Steuererklärung-Moment | ✅ IN — Szene 00:35, Beweis der Spezialisierung |
| E8 | Direktmeldung im Video | ✅ IN — Szene 01:12. Extern: "Anliegen melden". Intern: wizard. |
| E9 | FlowSight-Sichtbarkeit | ✅ Kleines Logo Kamera-Ecke + flowsight.ch in E-Mail-Signatur |
| E10 | Modus-Varianten | ✅ Modus 2 = dieses Dok. Modus 1 = +15–20s Website-Szene |

---

## 17. Die vollständige Psychologie-Kette

```
POSTEINGANG — Sein Name. Kein Druck. "Feedback gesucht."
→ ÖFFNET.

E-MAIL — "Oberrieden." "ausprobiert." "ehrlich." Thumbnail bewegt sich.
→ NIEDRIGE ERWARTUNG. NEUGIER. KLICKT VIDEO.

VIDEO — Seine echte Website. Lisa: "Weinberger AG."
        Steuerfrage: Lisa sagt Nein (Spezialisierung bewiesen).
        SMS. Leitstand. Direktmeldung. Persönlicher Einstieg.
→ PROOF × 6. KINNLADE FÄLLT RUNTER.
  (Kontrast zur niedrigen Erwartung macht WOW dreifach stärker.)

ANRUF — Lisa: "Grüezi, hier ist Lisa von der Weinberger AG..."
→ HÖRT SEINEN NAMEN. LIVE. UNMÖGLICH ZU IGNORIEREN.

SMS — Absender "Weinberger". 10 Sekunden.
→ DAS HANDY LÜGT NICHT.

LEITSTAND — Fall vollständig.
→ KONTROLLBEDÜRFNIS ERFÜLLT. "ALLES DA."

PERSÖNLICHER EINSTIEG — Sein Betrieb. Sterne. 3 CTAs.
→ SPIEGEL. BESTÄTIGUNG.

48 STUNDEN — Founder ruft an. Weiss was er geschaut hat.
→ PERSONALISIERUNG. LOKALE NÄHE. "Wir könnten uns treffen."

ER DENKT:
  "Das ist für MICH gemacht.
   Von jemandem aus Oberrieden — 4 Minuten von hier.
   Er hat investiert, bevor ich Ja gesagt habe.
   Ich habe Lisa selbst gehört. SMS in 10 Sekunden.
   Kein Vertrag. Kein Risiko.
   Er wollte nur mein Feedback."

→ ER SAGT JA.
```

---

*Mechanik × Psychologie × Proof = Die Schatztruhe ist offen.*
*Nächster Schritt: production_brief.md via CC updaten mit vollständigem 130–140s Drehbuch.*
