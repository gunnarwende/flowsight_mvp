# Gold Contact — Das kanonische Zielerlebnis

**Erstellt:** 2026-03-11 | **Owner:** Founder + CC
**Leitfrage:** Was muss passieren, damit ein Sanitär-/Heizungs-/Spenglerbetrieb nach dem ersten Kontakt mit FlowSight sagt: *"So etwas hat noch nie jemand für uns gemacht."*?

---

## Die Einsicht, die alles verändert

Handwerksbetriebe werden täglich kontaktiert — von Software-Verkäufern, Versicherungen, Lieferanten. Sie haben eine dicke Haut entwickelt. Jeder verspricht "Digitalisierung". Niemand versteht ihren Alltag.

**Unser unfairer Vorteil:** Wir zeigen nicht, was wir können. Wir zeigen dem Betrieb *sich selbst* — in einer Qualität, die er nicht erwartet hat. Jeder Berührungspunkt sagt: "Jemand hat sich wirklich hingesetzt und sich mit meinem Betrieb beschäftigt."

Das ist der Kern von High-Touch, High-Tech: **Die Technik ist unsichtbar. Das Persönliche ist spürbar.**

---

## Wer ist die Hauptperson?

### Der 2-5 Mann Betrieb (Dörfler, Weinberger, Orlandini)

**Hauptperson: Der Inhaber selbst.** Er ist Geschäftsführer, Monteur, Kundenbetreuer, Buchhalter in einer Person. Er nimmt Anrufe auf der Baustelle entgegen, zwischen zwei Rohrstücken. Seine Frau oder eine Teilzeit-Bürokraft hilft mit der Planung. Abends um 21 Uhr beantwortet er noch Mails.

**Sein grösstes Problem:** Er verpasst Anrufe. Nicht weil es ihm egal ist — weil er gerade unter einem Waschbecken liegt. Und er weiss es. Er denkt jeden Abend: "Wie viele haben heute angerufen und dann jemand anderen genommen?"

**Seine Angst:** Technologie, die er nicht versteht. Ein Dashboard, das er nie öffnet. Ein Vertrag, der ihn bindet.

**Sein Traum:** Morgens aufstehen und wissen: Kein Anruf ging verloren. Alles ist aufgeschrieben. Er muss nur noch entscheiden, was zuerst.

### Der 10-30 Mann Betrieb

**Hauptperson: Der Inhaber oder Betriebsleiter.** Er hat eine Disponentin oder Bürokraft. Die nimmt Anrufe an — wenn sie nicht gerade in der Pause ist, am anderen Telefon, krank, oder im Urlaub. Der Chef bekommt Anrufe weitergeleitet, die er nicht will. Die Disponentin schreibt auf Zettel oder in Excel.

**Sein Problem ist anders:** Nicht verpasste Anrufe — sondern **verlorene Information**. Der Zettel verschwindet. Die SMS wird übersehen. Der Monteur fährt zum falschen Ort. Der Kunde ruft wütend nochmal an.

**Sein Traum:** Ein System, das seine Disponentin entlastet — ohne sie zu ersetzen. Das den Abend-/Wochenend-Anruf auffängt, den niemand nehmen will.

---

## Das kanonische Zielerlebnis — Drei Module

### Modul 1: "Da hat sich jemand hingesetzt" (Erster Kontakt)

Der Betrieb öffnet eine E-Mail. Drin steht kein generisches "Sehr geehrte Damen und Herren". Drin steht:

> *"Ich habe für die Jul. Weinberger AG eine eigene Seite gebaut — mit Ihren echten Services, Ihren Google-Bewertungen, Ihrem 24h-Notdienst. Und eine eigene Assistentin: Lisa. Sie nimmt ab, wenn Sie nicht können."*

Er klickt auf den Link. Er sieht **seine Firma**. Seine Farben. Seine Dienstleistungen. Seine Bewertungen. Nicht ein Template — sein Betrieb, wie er ihn gerne präsentieren würde, aber nie die Zeit hatte.

**Dann sieht er die Nummer.** "Ihre persönliche Testnummer."

**Und er ruft an.** Nicht weil er muss — weil er neugierig ist. Was passiert?

Lisa nimmt ab. Sie sagt seinen Firmennamen. Sie fragt nach der PLZ, erkennt den Ort. Sie ist höflich, schnell, professionell. Sie sagt: "Sie erhalten gleich eine SMS."

**Und 10 Sekunden später vibriert sein Handy.** Eine SMS. Von "Weinberger". Mit einer Zusammenfassung. Einem Link, um Fotos hochzuladen.

**Das ist der WOW-Moment.** Nicht die Technik. Die Erkenntnis: *"Das hat gerade für meinen Betrieb funktioniert. Mit meinem Namen. In 30 Sekunden."*

### Modul 2: "So sieht mein Tag morgen aus" (Dashboard-Moment)

Er klickt auf den Magic Link in seiner Welcome-Mail. Das Dashboard öffnet sich.

Da steht sein Testfall. Kategorie, Dringlichkeit, PLZ, Beschreibung — alles, was Lisa aufgenommen hat. Dazu: Zeitstempel, Status, SMS-Bestätigung.

**Für den 2-Mann-Betrieb:** Das ist das Erste Mal, dass er seine "Fälle" auf einen Bildschirm sieht. Er hat das bisher im Kopf, auf Zetteln, in WhatsApp-Chats mit seiner Frau.

**Für den 10-30-Mann-Betrieb:** Er sieht sofort: "Das könnte unsere Excel-Liste ersetzen. Die Disponentin hätte morgens eine saubere Übersicht."

Er scrollt. Er sieht: Suche, Filter, Export. Er denkt: "Wenn das mit echten Fällen so aussieht..."

### Modul 3: "Mein Kunde hat eine Bewertung geschrieben" (Review-Moment)

Zwei Tage später. Der Betrieb hat ein paar Testanrufe gemacht. Lisa funktioniert. Die SMS kommen. Das Dashboard füllt sich.

Dann schickt er (oder wir simulieren es im Demo) eine Review-Anfrage. Der "Kunde" bekommt eine hübsche Seite, Google-Review-Style. Klickt auf "Bewerten". Schreibt einen Stern-Review.

**Das ist der Langzeit-WOW:** "FlowSight bringt mir nicht nur Ordnung, sondern auch Bewertungen. Die Google-Sterne, die ich seit Jahren will, aber nie aktiv anfrage."

---

## Die Journey im Detail

### Phase 0: Vorbereitung (CC, ~45 Min, Betrieb merkt nichts)

| Schritt | Was passiert | Ergebnis |
|---------|-------------|----------|
| Crawl | Website + Verzeichnisse + Google Maps | Rohdaten: Services, Team, Bewertungen, Fotos, Öffnungszeiten |
| Prospect Card | Strukturierte Analyse: ICP Score, Gewerke, Notdienst, Region | `prospect_card.json` |
| Website | `/kunden/{slug}` — echte Daten, echte Fotos, echte Bewertungen | Live-URL |
| Voice Agent | Lisa DE + INTL — Firmenname, Services, Region, Preise, Team | Published auf Retell |
| Telefonnummer | Twilio-Nummer → Retell → Webhook | Eigene Testnummer |
| Tenant | Supabase: Modules, SMS Config, Review URL | E2E-fähig |
| E2E-Test intern | CC ruft an, prüft SMS, Dashboard, Review Surface | Qualitätssicherung bevor Betrieb es sieht |

**Goldene Regel:** Der Betrieb sieht erst etwas, wenn alles fehlerfrei funktioniert. Kein "Beta-Gefühl". Kein "Noch nicht ganz fertig". Vom ersten Pixel an: fertig.

### Phase 1: Erstkontakt (Founder, persönlich)

**Der Einstieg, der aus den Socken haut:**

Nicht: "Hallo, ich verkaufe Software."
Nicht: "Wollen Sie mehr Google-Bewertungen?"
Nicht: "Buchen Sie eine Demo."

Sondern:

> *"Guten Tag Herr Weinberger, ich bin Gunnar Wende. Ich habe für Ihren Betrieb etwas gebaut — darf ich Ihnen das kurz zeigen? Dauert 30 Sekunden: Rufen Sie diese Nummer an."*

**Die Kraft liegt darin, dass es schon existiert.** Kein Pitch. Kein Versprechen. Ein Anruf. Das war's.

**Kanäle für den Erstkontakt (nach Modus):**

| Modus | Einstieg | Warum |
|-------|---------|-------|
| **Modus 1** (Dörfler = kein Web) | Persönlich / Vor-Ort / Anruf + E-Mail | "Ich wohne um die Ecke. Ich habe Ihnen eine Website gebaut." |
| **Modus 2** (Weinberger = Web ok) | E-Mail + Video + Testnummer | "Ich habe Lisa gebaut. Sie nimmt ab, wenn Sie nicht können." |

### Phase 2: Der Test (14 Tage)

**Was der Betrieb bekommt:**

| Element | Beschreibung | Format |
|---------|-------------|--------|
| **Persönliche Testnummer** | Eigene Nummer, eigener Agent, eigener Firmenname | Tel: +41 43 XXX XX XX |
| **Personalisierte Website** | `/kunden/{slug}` — seine Firma, seine Farben, sein Wizard | URL |
| **Magic Link** | Einmal klicken → Dashboard. Kein Passwort, kein Login-Stress. | E-Mail |
| **Welcome-Seite** | `/ops/welcome` — "Willkommen. So starten Sie: Rufen Sie an." | Dashboard-Startseite |
| **Kurze Anleitung** | 3 Schritte: Anrufen → SMS prüfen → Dashboard öffnen | In Welcome-Mail |
| **Persönliches Video** (HOT) | 45-60s Founder-Video: "Das habe ich für Sie gebaut. So funktioniert es." | Loom/YouTube |
| **Begleittext** | Persönliche E-Mail, kein Template-Gefühl | Founder-Mail |

**Was der Betrieb NICHT bekommt:**
- Keinen Vertrag
- Keine Preisliste (erst nach Day 10)
- Kein "Testzeitraum läuft ab"-Druck
- Keine Aufforderung, etwas zu konfigurieren
- Kein technisches Setup — alles ist schon da

### Phase 3: Der Flow (während des Tests)

**Auslöser:** Jeder echte oder simulierte Anruf/Wizard-Eintrag.

```
Anruf auf Testnummer
  → Lisa nimmt ab (Firmenname, PLZ-Erkennung, Empathie)
  → SMS an Anrufer (10 Sek): Zusammenfassung + Korrekturlink + Foto-Upload
  → Fall im Dashboard (sofort): Kategorie, Dringlichkeit, Adresse, Beschreibung
  → E-Mail an Betrieb: "Neue Meldung eingegangen"

Wizard-Meldung auf Website
  → Fall im Dashboard (sofort)
  → SMS an Melder (wenn Handynummer angegeben)
  → E-Mail an Betrieb: "Neue Meldung eingegangen"
```

**Was aufs Handy kommt — und für wen:**

| Empfänger | Was | Wann | Kanal |
|-----------|-----|------|-------|
| **Anrufer** (Kunde des Kunden) | Bestätigung + Korrekturlink + Foto-Upload | 10 Sek nach Anruf | SMS |
| **Betrieb** (unser Kunde) | "Neue Meldung: {Kategorie} in {Ort}" | Sofort | E-Mail |
| **Melder** (Wizard) | Bestätigung + Korrekturlink | Nach Absenden | SMS (wenn Nummer) |

**Der "Kunde des Kunden" in der Story:**
Das ist der Hauseigentümer, der Mieter, die Verwaltung — die Person, die anruft weil das Rohr leckt. Sie ist die **Hauptperson in Modul 1**. Wenn diese Person sagt "Wow, das ging schnell" — dann hat der Betrieb verstanden, was FlowSight wert ist.

### Phase 4: Der Follow-up (Day 7-10)

**Day 7:** System prüft automatisch (Lifecycle Tick).
**Day 10:** Founder ruft an. Nicht um zu verkaufen — um zu fragen:

> *"Wie war's? Hat Lisa funktioniert? Was hat Ihre Bürokraft / Frau / Ihr Partner dazu gesagt?"*

Das ist **High-Touch**. Der Founder ruft persönlich an. Fragt nach dem Erlebnis. Hört zu.

**Erst jetzt:** Preise. Starter 199 / Alltag 299 / Wachstum 399. Aber nur wenn gefragt wird oder der Moment stimmt.

### Phase 5: Der Review-Moment (nach Conversion)

Der Betrieb hat unterschrieben. Jetzt kommt der Langzeit-WOW:

Erster echter Kundenkontakt → Fall gelöst → Review-Anfrage an den Kunden → Google-Bewertung kommt rein.

**Der Betrieb sieht:** "FlowSight hat mir nicht nur Ordnung gebracht — sondern auch eine 5-Sterne-Bewertung."

---

## WOW-Momente (chronologisch)

| # | Moment | Was passiert | Emotion |
|---|--------|-------------|---------|
| 1 | **"Meine Firma"** | Betrieb sieht seine personalisierte Website zum ersten Mal | Überraschung, Wertschätzung |
| 2 | **"Lisa kennt mich"** | Erster Testanruf — Agent sagt Firmennamen, erkennt PLZ, ist höflich | Verblüffung |
| 3 | **"Mein Handy vibriert"** | SMS kommt 10 Sek nach Anruf — mit Zusammenfassung und Korrekturlink | "Das geht so schnell?!" |
| 4 | **"So sieht ein Fall aus"** | Dashboard zeigt strukturiert, was Lisa aufgenommen hat | Klarheit, Erleichterung |
| 5 | **"Das funktioniert auch nachts"** | Betrieb testet abends/am Wochenende — Lisa nimmt ab, 24/7 | Sicherheit |
| 6 | **"Mein Kunde ist begeistert"** | Anrufer-SMS kommt an — der Endkunde ist positiv überrascht | Stolz |
| 7 | **"Eine Google-Bewertung!"** | Review-Engine schickt Anfrage → Endkunde bewertet → 5 Sterne | Langzeit-Bindung |

---

## Was im Dashboard sichtbar sein muss

Wenn der Betrieb das Dashboard öffnet, muss er in **5 Sekunden** verstehen:

1. **Wie viele neue Fälle** seit letztem Login
2. **Was ist dringend** (Notfälle oben, rot markiert)
3. **Wer hat angerufen** (Kategorie, Ort, Zeitstempel — keine PII-Namen im MVP)
4. **Was wurde gesagt** (Beschreibung von Lisa)
5. **Was muss ich tun** (Status: neu → in Bearbeitung → erledigt)

**Für den 2-Mann-Betrieb:** Das Dashboard ist sein "Morgen-Briefing". Kaffee, Dashboard, los.
**Für den 30-Mann-Betrieb:** Die Disponentin exportiert CSV in ihre Planung.

---

## Was variiert je Modus

| Element | Modus 1 (Full) | Modus 2 (Extend) |
|---------|----------------|-------------------|
| Website | FlowSight baut komplette Seite | FlowSight baut Wizard-Landing + CTA-Vorschlag für bestehende Seite |
| Einstieg | "Ich habe Ihnen eine Website + Lisa gebaut" | "Ich habe Lisa für Sie gebaut" |
| Video-Fokus | Website + Lisa + SMS | Lisa + SMS + Dashboard |
| Wizard-Integration | Auf FlowSight-Seite (`/kunden/{slug}/meldung`) | Auf FlowSight-Seite + Empfehlung für CTA auf eigener Website |
| Outreach-Botschaft | "Wir digitalisieren Ihren Betrieb" | "Wir erweitern Ihr System" |
| Persönlichkeits-Faktor | MAXIMAL — der Betrieb hatte nichts, wir geben ihm alles | HOCH — der Betrieb sieht, dass wir seine bestehende Arbeit respektieren |

---

## Pflichtbestandteile jeder Gold-Contact Journey

Egal ob Modus 1 oder 2, egal ob 2-Mann oder 30-Mann:

### Vor dem Kontakt (CC-Arbeit)
- [ ] Prospect Card erstellt (echte Daten, keine Erfindung)
- [ ] Website live + getestet (Mobile + Desktop)
- [ ] Voice Agent live + getestet (Anruf → SMS → Dashboard)
- [ ] Persönliche Testnummer zugewiesen
- [ ] Interner E2E-Test bestanden (CC ruft an, prüft alles)
- [ ] Demo-Fälle geseedet (Dashboard sieht nicht leer aus)

### Beim Kontakt (Founder-Arbeit)
- [ ] Persönlicher Zugang: Magic Link + Welcome-Seite
- [ ] Klare Welcome-Nachricht: "So starten Sie: Rufen Sie Ihre Nummer an."
- [ ] Persönliches Video (HOT) oder Begleittext (WARM)
- [ ] Testnummer prominent kommuniziert
- [ ] Kein Vertrag, kein Druck, kein "Zeitraum läuft ab"

### Während des Tests (automatisch)
- [ ] Jeder Anruf → SMS an Anrufer (10 Sek)
- [ ] Jeder Fall → E-Mail an Betrieb
- [ ] Dashboard immer aktuell
- [ ] 24/7 Verfügbarkeit (Lisa schläft nicht)

### Follow-up (Founder)
- [ ] Day 10: Persönlicher Anruf ("Wie war's?")
- [ ] Day 13: Erinnerung (automatisch, aber warm formuliert)
- [ ] Preise nur auf Nachfrage oder bei klarem Interesse

### Danach (Conversion oder Pause)
- [ ] Review-Engine aktiviert bei Conversion
- [ ] Kein harter Abbruch bei Nicht-Conversion ("Die Nummer funktioniert weiterhin")

---

## Was darf nie passieren

| # | Situation | Warum tödlich |
|---|-----------|---------------|
| 1 | **Lisa sagt den falschen Firmennamen** | Sofort Vertrauensverlust — "Die kennen mich gar nicht" |
| 2 | **SMS kommt nicht** | Der WOW-Moment stirbt. Der Betrieb denkt: "Funktioniert nicht" |
| 3 | **Dashboard ist leer** | Keine Orientierung, kein Verständnis was das System tut |
| 4 | **Wizard zeigt 404 oder fremde Firma** | Unprofessionalität — sofortiger Abbruch |
| 5 | **E-Mail sieht nach Template aus** | "Ah, wieder so ein Tool-Verkäufer" — in den Papierkorb |
| 6 | **Technisches Setup nötig** | "Ich bin Sanitär, nicht IT" — Überforderung, Widerstand |
| 7 | **Vertrag/Preis im Erstkontakt** | Sofortige Abwehrhaltung — "Wie viel kostet das?" statt "Wie cool ist das?" |
| 8 | **Founder meldet sich nicht** | High-Touch ohne Touch = Marketing-Automation. Das Gegenteil von uns. |
| 9 | **System fällt aus während Test** | Einzige Chance verbrannt. Der Betrieb testet nicht zweimal. |
| 10 | **Lisa gibt falsche Infos** (Preise, Öffnungszeiten, Team) | "Die erzählt Quatsch über meine Firma" — Vertrauen zerstört |
| 11 | **SMS an falsche Nummer** | Datenschutz-Katastrophe, sofortiger Vertrauensverlust |
| 12 | **Review-Anfrage an unzufriedenen Kunden** | Negativbewertung statt Positivbewertung — Schaden statt Nutzen |

---

## Die emotionale Reise des Betriebs

```
Tag 0:  "Wer ist das? Was will der?"
        → E-Mail öffnen. "Hm, der hat sich meine Firma angeschaut."
        → Link klicken. "Moment... das ist ja meine Firma. Mit meinen Bewertungen!"
        → Nummer sehen. "OK, ich ruf mal kurz an. Mal schauen."

Tag 0:  "Hallo, Jul. Weinberger AG, mein Name ist Lisa..."
        → "Die sagt meinen Firmennamen! Und sie fragt nach der Postleitzahl?"
        → "Thalwil, richtig!" — "Ja!"
        → *bzzzz* SMS auf dem Handy
        → "Das... das ist ja alles aufgeschrieben. In 30 Sekunden."

Tag 1:  Magic Link geklickt. Dashboard geöffnet.
        → "Da ist mein Testanruf von gestern. Alles drin."
        → "Wenn das mit echten Kunden so aussieht..."

Tag 3:  Zweiter Anruf. Diesmal abends, 20:30.
        → Lisa nimmt ab. SMS kommt. Fall im Dashboard.
        → "Das funktioniert auch nachts."
        → *erzählt seiner Frau/Partner davon*

Tag 7:  Hat 5 Testanrufe gemacht. Zeigt Dashboard dem Lehrling.
        → "Schau mal, so könnte unsere Auftragsannahme aussehen."

Tag 10: Founder ruft an. "Wie war's?"
        → "Ehrlich? Das ist das Erste, was funktioniert hat."
        → "Was kostet das?"
        → "199 im Monat. Starter-Paket."
        → "Machen wir."

Tag 14: Erster echter Kundenkontakt. Lisa nimmt einen echten Notfall auf.
        → SMS an den Kunden. Betrieb ruft zurück. Problem gelöst.
        → Review-Anfrage. 5 Sterne.
        → Betrieb: "Warum habe ich das nicht schon vor 5 Jahren gehabt?"
```

---

## Konkret: Was wir in 3 Wochen bauen / verfeinern

### Woche 1: Goldstandard-Journey festzurren (diese Woche)
- [ ] Gold Contact Dokument reviewen + verfeinern (dieses Dokument)
- [ ] Weinberger E2E-Test durchführen (Founder)
- [ ] Welcome-Seite verfeinern (CTAs, Anleitung, Emotion)
- [ ] Demo-Dataset säen (Weinberger: 5 realistische Fälle)
- [ ] Welcome-Mail Text verfeinern (persönlich, nicht technisch)

### Woche 2: Skalierbare Werkzeuge
- [ ] Provisioning-Pipeline verfeinern: Prospect Card → alles automatisch in <25 Min
- [ ] Video-Template aufnehmen (Weinberger als erster)
- [ ] Outreach-Flow testen: E-Mail → Anruf → Test → Follow-up
- [ ] Dörfler AG als erster Trial-Kunde: Persönlicher Start (Modus 1, vor Ort)

### Woche 3: Polieren + Go-Live-Readiness
- [ ] 2-3 weitere Prospects provisionieren (aus Scout Pipeline)
- [ ] Mobile QA: Betrieb-Erlebnis auf dem Handy testen (SMS, Dashboard, Review)
- [ ] Edge Cases härten: Was wenn Lisa nicht versteht? Was wenn SMS nicht ankommt?
- [ ] Reise-Readiness: Alles läuft ohne Founder (siehe `reise_checklist.md`)

---

## Metriken: Wann ist Gold Contact erfolgreich?

| Metrik | Ziel | Messung |
|--------|------|---------|
| **First Call Rate** | >80% der kontaktierten Betriebe rufen die Testnummer an | Pipeline Tracker |
| **WOW-Moment erreicht** | Betrieb sagt unprompted "Cool" / "Krass" / "Das funktioniert?" | Founder-Notiz nach Day 10 Call |
| **Dashboard-Login** | >60% loggen sich mindestens 2x ein während Trial | Supabase Auth Logs |
| **Conversion** | >30% starten nach Trial | Pipeline Status |
| **Time-to-Value** | <60 Sekunden vom Anruf bis SMS auf dem Handy | Technisch gegeben |
| **Net Promoter** | Betrieb erzählt anderen davon | Follow-up Frage: "Kennen Sie jemanden?" |

---

## Der eine Satz, der alles zusammenfasst

**"Wir haben Lisa für Sie gebaut. Rufen Sie an."**

Kein Feature-Listing. Kein Dashboard-Screenshot. Kein Preis.
Neun Worte. Eine Nummer. Ein Anruf.
Und danach weiss der Betrieb: Das will ich haben.
