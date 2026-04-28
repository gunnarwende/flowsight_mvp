# Verbesserungsvorschläge — Video-Pipeline & Script

**Datum:** 2026-04-19
**Zweck:** Finaler Feedback-Loop. Founder gibt zu jedem Punkt Rückmeldung: ✅ Einbau / ❌ Kein Einbau / 🔄 Anpassung
**Ziel:** Maximale Conversion-Quote bei 10 Betrieben/Tag. Alle Betriebsgrössen ansprechen (Solo, Klein, Mittel, Gross).

---

## Bereits bestätigte Vorschläge (#1-#5)

### #1 — Take 1: Pain-Broadening (halber Satz)
**Stelle:** Take 1, nach "eine neue Meldung wird nicht sauber aufgenommen"
**Ergänzung:** "...oder sie wird zwar angenommen, aber geht danach im Alltag unter."
**Wirkung:** +Klein/Mittel — fängt Betriebe MIT Büro ab, nicht nur Solo
**Founder-Status:** ✅ Ist umgesetztund in Take 1 eingebaut.

### #2 — Take 2, Screen 18: Staff-Dropdown sichtbar
**Was:** Im Falldetail den Zuweisungs-Dropdown mit 3-4 Techniker-Namen zeigen
**Wirkung:** Betrieb sieht: "Ich kann Fälle verteilen" → Team-fähig
**Founder-Status:** 🔄 Diskussionsbedarf: Der Dropdown impliziert Team-Nutzung. Wir müssen mit CC klären, wie Mitarbeiter-Zugriff und Nutzung im Video sauber und verständlich dargestellt werden. Stichwort was sich der videoanschauer denken könnte: wo soll er es denn sehen, ist die App denn auch downloadbar für meine Mitarbeiter, sodass sie auf der Baustelle immer den Stand zur Hand haben? Kann eine Win Situation werden vor allem für Betriebe > 5Mitarbeiter. Wir müssen aber sehr clever vorgehen

### #3 — Dynamische Fallzahlen + realistische Falltypen
**Was:** Seed-Daten spiegeln realen Alltag wider:
- 1× Notfall (in_arbeit)
- 1× Dringend
- 1× Grossprojekt (Komplettsanierung, Heizungsersatz — hier fliesst das Geld)
- 1× Anfrage/Offerte
- Der Telefon-Fall (kommt NEU rein in Take 2)
- Der Wizard-Fall (kommt NEU rein in Take 3)
- Rest: normaler Alltag (geplant, erledigt, diverse Kategorien)
**Mobil:** 8 Fälle sichtbar. **Desktop:** 15 Fälle sichtbar. Beides muss realistisch sein.
**Founder-Status:** ✅ Sehr wichtig, dachte war schon implementiert. Hier wirklich mindestens 40-50 Fälle einbauen - Fookus auf Seite 1 (handy (8 Stück) und von Laptop (15 Stück) sowie einige Daten für das Jahr 2025)

### #4 — Take 4: Echtes Google-Rating
**Was:** FlowBar zeigt EXAKTES Rating + Anzahl aus Google Places (z.B. "4.8★ bei 18 Bewertungen")
**KRITISCH:** Jede Abweichung = Vertrauensverlust. Muss zu 100% stimmen.
**Founder-Status:** ✅ Pflicht, dachte war schon implementiert

### #5 — Take 3: Betriebsspezifischer Wizard
**Was:** Wizard mit IHREN Kategorien, IHRER Brand-Color, echtem Tippen simuliert
**WICHTIG:** Founder sagt NICHTS Betriebsspezifisches — nur "hier gebe ich X ein"
**Der Wizard-Fall ist "normal einzuplanen" (kein Notfall)
**Founder-Status:** ✅ Maximal high-end persönlich

---

## Neue Vorschläge — Founder-Rückmeldung ausstehend

### #6 — Take 2: SMS pixelgenau betriebsspezifisch
**Stelle:** Take 2, Samsung SMS-Screen (S05)
**Was:** Die SMS zeigt:
- Sender = Firmenname des Betriebs (z.B. "StarkHauste", max 11 Zeichen)
- Case-Ref = Betrieb-Prefix (z.B. "ST-0088" statt generisch)
- Link = flowsight.ch/v/ST0088...
**Warum:** Das ist der greifbarste Moment. Der Betrieb sieht SEINEN Namen als SMS-Absender. Wenn da ein generischer Name steht, ist der Proof kaputt.
**Aufwand:** Klein — Daten in tenant_config (sms_sender_name, case_id_prefix), Samsung-Templates existieren.
**Founder:** ✅ Pflicht, dachte war schon implementiert. High end persönlich und reales aussehen Pflicht. 

### #7 — Take 2: Live-Moment — Fall erscheint in Echtzeit im Leitsystem
**Stelle:** Take 2, nach SMS → Übergang zum Leitsystem (Screen 8)
**Was:** Die Leitsystem-Übersicht zeigt den neuen Fall OBEN als "Neu | Dringend | Rohrbruch" — er war vorher NICHT in der Liste. Der Betrieb sieht: Anruf → SMS → Fall ist DA.
**Warum:** DER emotionale Höhepunkt von Take 2. Beweist dass das System in Echtzeit funktioniert.
**Umsetzung:** Zwei Leitsystem-Screenshots (vorher ohne, nachher mit neuem Fall), Animation simuliert das Erscheinen.
**Aufwand:** Mittel
**Founder:** ✅ Einbau, aber mit Beachtung bestehender Sortierlogik: Der neue Telefon-Fall (der "Dringend" ist) soll nach dem Anruf klar neu in der Leitzentrale erscheinen. Wir haben vorher definiert, wir müssen pro Betrieb immer einen Notfall drin haben, also ist dieser Anruf dann an 2. Position gelistet. 

### #8 — Take 3: Wizard-Fall erscheint auch im Leitsystem
**Stelle:** Take 3, nach Wizard-Ausfüllen → Leitsystem zeigt jetzt ZWEI neue Fälle
**Was:** Nach dem Online-Formular erscheint auch dieser Fall in der Übersicht. Jetzt stehen: bestehender Alltag + Telefon-Fall (Take 2) + Wizard-Fall (Take 3) = 3 Kanäle, 1 Übersicht.
**Text existiert schon:** "Sie sehen den neuen Eintrag direkt in Ihrer Übersicht" (Zeile 305-306)
**Warum:** Beweist Kanal-Konvergenz. Besonders stark für Mittel/Gross.
**Aufwand:** Klein
**Founder:** ✅ Pflicht, dachte war schon implementiert. High end persönlich und reales aussehen Pflicht. 

### #9 — Take 4: 24h SMS-Erinnerung zeigen
**Stelle:** Take 4, nach "terminieren den Einsatz" (Zeile 349)
**Was:** Kurzer 3-Sekunden-Einschub: Samsung-Screen zeigt SMS "Erinnerung: Morgen 14:00 kommt [Firma]. Bei Änderungen: [Link]"
**Text existiert schon:** "Dadurch wird der Kunde 24 Stunden vorher automatisch erinnert" (Zeile 351-352) — aber es wird nur GESAGT, nicht GEZEIGT.
**Warum:** Zeigen > Sagen. Der Betrieb sieht den Beweis, nicht nur die Behauptung. Weniger No-Shows = direkter Nutzen.
**System existiert:** 24h SMS Reminder ist bei BigBen Pub bereits live.
**Aufwand:** Klein
**Founder:** ✅ Einbau. Wichtig: Paul Big Ben Pub haben wir reserviert, und die Reservierungs wurde bestätigt. Leider kam kein Reminder SMS 24h vorher obwohl Reservierungsanfrage und bestätigung 28h vor eigentlichen Reservierung stattgefunden hat. Das muss dann natürlich sitzen. Mindestens genau so wichtig: das muss auch sitzen für die ganzen Sanitär Heizungs betriebe. 

### #10 — Take 4: Emotionaler Closer
**Stelle:** Take 4, Ende (nach Zeile 430, vor "Wenn Sie sich dabei...")
**Vorschlag:** "Und ich weiss, dass bei einem Betrieb wie Ihrem, mit dem Qualitätsanspruch den Sie haben, genau solche Dinge eigentlich schon längst hätten laufen sollen."
**Warum:** Validiert den Betrieb emotional. Jeder Handwerker hat einen Qualitätsanspruch. Generisch aufgenommen (kein Firmenname), aber fühlt sich persönlich an.
**Aufwand:** 0 — ein Satz
**Founder:**  ❌ nicht einbauen. Absatz wurde leicht verschärft mit "Wenn Sie beim Zuschauen an ein, zwei Stellen gedacht haben: ja, genau so etwas würde uns helfen —" aber in der schweiz fahren wir den eher passiven zielstrebigen nicht salesigen wirkenden Ansatz

---

## NEUE Vorschläge (Finaler Loop)

### #11 — Take 2: Während des Anrufs — Kontrast zeigen
**Stelle:** Take 2, vor dem Anruf (zwischen Zeile 83 "Ich rufe einmal kurz an" und dem tatsächlichen Anruf)
**Was:** Bevor Lisa rangeht, kurz (2 Sekunden) den Samsung-Screen zeigen mit einem VERPASSTEN ANRUF oder einem Anrufbeantworter-Symbol. Dann erst klingelt es und Lisa nimmt ab.
**Warum:** Der Kontrast macht den Wert sichtbar. "SO sieht es HEUTE aus" (verpasst) → "SO sieht es MIT dem Leitsystem aus" (Lisa nimmt ab). Ohne Kontrast fehlt der emotionale Hebel.
**Aufwand:** Klein — ein zusätzlicher Samsung-Screen "Verpasster Anruf"
**Founder:** ❌ Nicht einbauen

### #12 — Take 2: Lisa nennt den Firmennamen im Greeting — DER Gänsehaut-Moment
**Stelle:** Take 2, Anfang des Anrufs
**Was:** Lisa sagt: "Hallo, hier ist Lisa — die digitale Assistentin der [FIRMENNAME]. Wie kann ich Ihnen helfen?"
**Warum:** DER Moment wo der Betrieb zum ersten Mal hört dass SEINE Assistentin SEINEN Firmennamen sagt. Das ist Gänsehaut. Wenn das fehlt, fehlt der persönlichste Moment des ganzen Videos.
**Umsetzung:** TTS mit Ela-Stimme, Firmenname dynamisch pro Betrieb. Exakt fixe Länge (Greeting-Dauer normiert auf z.B. 4.5 Sekunden, egal wie lang der Firmenname).
**Aufwand:** Klein — ElevenLabs TTS, ein Satz
**Founder:** ✅ Pflicht. Der Moment, in dem Lisa den Firmennamen nennt, ist der stärkste persönliche Proof im gesamten Video. Muss sauber, natürlich und konsistent umgesetzt werden. Du bekommst von mir noch die Call ID und baust aus dem Transkript und 11labs und den anderen Tools deinen Master. 

### #13 — Take 2: Lisa beantwortet die betriebsspezifische Frage — DER Proof-Moment
**Stelle:** Take 2, im Anruf (Mini-Take-Pool)
**Was:** Der Founder stellt eine generische Frage ("Wie lange gibt es den Betrieb eigentlich schon?") und Lisa antwortet mit ECHTEN betriebsspezifischen Daten ("Der Betrieb wurde 1952 gegründet, also seit über 70 Jahren").
**Warum:** Der Betrieb realisiert: "Die weiss Dinge über uns, die nur ein Mensch wissen könnte." Das ist der höchste Proof-Moment im gesamten Video.
**Pool:** 10 Fragen zu verschiedenen Themen (Gründung, Leistungsbreite, Google-Rating, Einzugsgebiet, Team, Stellenangebote, Mitgliedschaften, Spezialisierung, Notdienst, Öffnungszeiten). Pro Betrieb wird die passendste gewählt.
**KRITISCH:** Frage und Antwort müssen EXAKT fixe Länge haben (Silbenzahl/Sekunden) wegen PiP-Synchronisation.
**Aufwand:** Mittel — Mini-Take-Pool + TTS-Generation + Timing-Normierung
**Founder:** ✅ Pflicht. Hier haben wir eine super analyse gemacht von über 100 Betrieben: darauf können/sollten wir aufsetzen und unsere top 10 Fragepool rausarbeiten, die wir dann pro Betrieb individuell hig end persönlich aufnehmen müssen. 

### #14 — Take 3: Der Online-Fall wird ANDERS als der Telefon-Fall
**Stelle:** Take 3, Wizard-Ausfüllen
**Was:** Der Fall der über den Wizard reinkommt, sollte eine ANDERE Kategorie und Dringlichkeit haben als der Telefon-Fall. z.B. Telefon = "Rohrbruch, Dringend", Wizard = "Badsanierung, Normal einzuplanen". 
**Warum:** Zeigt die BREITE des Systems. Nicht nur Notfälle, sondern auch geplante Projekte (wo das Geld liegt!). Der Betrieb sieht: "Das fängt nicht nur Notfälle auf, sondern auch meine Anfragen und Projekte."
**Pipeline:** derive_config erzeugt einen `wizard_demo_case` der zur zweithäufigsten Kategorie des Betriebs passt.
**Aufwand:** Klein — bereits in #3 angesprochen, hier die konkrete Spezifikation
**Founder:** ✅ Einbau, schon vorher genau angesprochen (Prio: Normal)

### #15 — Take 4: Review-Seite im Betrieb-Look
**Stelle:** Take 4, Review-Surface (nach "REVIEW-SEITE / 5 STERNE")
**Was:** Die Bewertungsseite die der Kunde sieht, zeigt die Brand-Color des Betriebs + den Firmennamen + die Auftragsreferenz (z.B. "Rohrbruch in Adliswil").
**Warum:** Auch die LETZTE Seite im Video ist personalisiert. Der Kreis schliesst sich: Von Lisa mit Firmennamen → SMS mit Firmennamen → Leitsystem in Brand-Color → Review-Seite in Brand-Color. Konsistenz über alle Touchpoints = maximale Glaubwürdigkeit.
**System existiert:** ReviewSurfaceClient.tsx rendert bereits tenant-branded.
**Aufwand:** Klein — Playwright-Screenshot der Review-Seite mit Betrieb-Daten
**Founder:**✅ Pflicht. Absoluter Proof moment! und bisher noch nicht wirklich angegangen. Das muss der krönende Abschluss ein und ist hoch sensibel und wichtig. Hier an der Stelle einzubauen ">>> REVIEW-SEITE / 5 STERNE <<<

Ohne Druck,
ohne unnötige Reibung
und einfach in einem Moment,
in dem es für ihn gerade passt.

>>> FAKE-ENDSCREEN <<<
" -> es geht um den Flow um den FakeScreen! diesen Müssen wir super High end bauen. Stimmt dieser nicht, ist der Kreis gebrochen , ist das Vertrauen gebrochen. 

### #16 — E-Mail: Betreffzeile die ÖFFNUNG erzwingt
**Stelle:** Outreach E-Mail (Phase 3 der Pipeline)
**Was:** Die Betreffzeile enthält den FIRMENNAMEN und einen konkreten Bezug:
"[Firmenname] — etwas Persönliches für Ihren Betrieb"
NICHT: "Digitale Assistentin für Handwerksbetriebe" (= Spam)
NICHT: "FlowSight — Ihr neues System" (= Werbung)
**Warum:** Die Öffnungsrate der E-Mail ist der ERSTE Filter. Wenn die E-Mail nicht geöffnet wird, ist alles andere umsonst. Der Firmenname in der Betreffzeile erzwingt die Aufmerksamkeit: "Wer schreibt mir etwas Persönliches?"
**Aufwand:** 0 — Template-Variable
**Founder:** ✅ Pflicht. Betreffzeile mit Firmenname und persönlichem Bezug. Kein Marketing-Sprech — Ziel ist maximale Öffnungsrate durch klare, persönliche Ansprache.

### #17 — E-Mail: Thumbnail mit IHREM Leitsystem
**Stelle:** Outreach E-Mail, Body
**Was:** Die E-Mail enthält ein Vorschaubild (Thumbnail) das einen Screenshot IHRES Leitsystems zeigt — mit ihrem Firmennamen, ihrer Brand-Color, ihren Fällen. Darunter: Play-Button → Link zum Video.
**Warum:** Noch bevor der Betrieb das Video anklickt, sieht er SEIN System. Das triggert Neugier: "Warte mal, das ist ja MEIN Betrieb?" → Klick.
**Umsetzung:** Leitsystem-Screenshot aus Take 2 (Screen 8) als E-Mail-Thumbnail. Automatisch generiert pro Betrieb.
**Aufwand:** Klein — Screenshot existiert aus Video-Pipeline
**Founder:** _✅ Pflicht. Thumbnail zeigt das Leitsystem des Betriebs (Firmenname, Brand, echte Fälle). Ziel: sofortige Wiedererkennung und maximale Klickrate.

### #18 — Gesamtes Video: Datum und Uhrzeit AKTUELL
**Stelle:** Alle Samsung-Screens + Leitsystem
**Was:** Das Datum auf allen Screens muss das AKTUELLE Datum sein (oder max 1-2 Tage alt). Nicht "17. April" wenn der Betrieb das Video am 25. April schaut.
**Warum:** Wenn das Datum alt ist, wirkt es wie eine Massenproduktion die schon seit Wochen rumliegt. Wenn das Datum von HEUTE ist: "Das wurde GERADE für mich gemacht." Maximale Frische.
**Umsetzung:** Pipeline generiert Videos mit dem Versand-Datum. Screens werden am Versandtag gerendert (oder 1 Tag vorher in Batch).
**KONSEQUENZ:** Videos können NICHT auf Vorrat produziert werden. Pro Tag: morgens 10 Videos rendern → nachmittags versenden.
**Aufwand:** Mittel — Pipeline muss tagesfrisch rendern
**Founder:** ✅ Pflicht. Datum und Uhrzeit müssen tagesfrisch und über alle Screens exakt konsistent sein. Anrufdauer, Handy-Screen, SMS-Zeitpunkt und Fall-Erstellung müssen zeitlich sauber aufeinander abgestimmt sein, damit der Ablauf wie ein echter Live-Moment wirkt.

### #19 — Take 1: Der Einstieg muss SOFORT fesseln
**Stelle:** Take 1, erste 5 Sekunden
**Was:** Die ersten 5 Sekunden entscheiden ob der Betrieb weiterschaut oder wegklickt. Aktuell: "Hallo, einen wunderschönen guten Tag. Mein Name ist Gunnar Wende." — Das ist freundlich, aber generisch.
**Alternative Idee:** Direkt mit einem Bild oder Statement einsteigen das Neugier weckt. Z.B. direkt mit dem Firmennamen starten (STS): "Hallo, ich habe für [Firma] etwas vorbereitet." → Sofort klar: Das ist PERSÖNLICH.
**ACHTUNG:** Script ist FROZEN. Das ist nur ein Denkanstoß, keine Aufforderung zum Ändern. Wenn die aktuelle Version funktioniert, funktioniert sie.
**Founder:** ❌ Kein Einbau

### #20 — Meta: Versand-Timing — Wann die E-Mail den Betrieb erreicht
**Stelle:** Pipeline Phase 3 (Outreach)
**Was:** Die E-Mail sollte den Betrieb zu einem Zeitpunkt erreichen, wo er sie ÖFFNET und das Video ANSCHAUT. Nicht Montagmorgen 8:00 (hektisch), nicht Freitagnachmittag (Feierabend).
**Optimaler Zeitpunkt:** Dienstag-Donnerstag, 11:00-12:00 oder 16:00-17:00. Der Betrieb hat die Morgen-Hektik hinter sich, hat einen Moment Ruhe, öffnet E-Mails.
**Warum:** Die beste E-Mail bringt nichts wenn sie im falschen Moment kommt. B2B-Handwerk hat andere Rhythmen als Büro-Arbeit.
**Aufwand:** 0 — Timing-Regel für den Versand
**Founder:** ✅ Pflicht. Unbedingt beachten. Hier sogar eine extra analyse fahren, wann wirklich die beste Zeit ist solche Mails zu versenden. Mein Business kann noch so gut sein, wenn die Mail nicht gelesen wird.

---

## Zusammenfassung

| # | Take | Was | Typ | Aufwand |
|---|------|-----|-----|---------|
| 1 | T1 | Pain-Broadening Nebensatz | Script | 0 |
| 2 | T2 | Staff-Dropdown sichtbar | Screen | Klein |
| 3 | T2 | Dynamische Fallzahlen + Falltypen | Seed/Screen | Klein |
| 4 | T4 | Echtes Google-Rating | Daten | Klein |
| 5 | T3 | Betriebsspezifischer Wizard | Screen/Automation | Mittel |
| 6 | T2 | SMS pixelgenau betriebsspezifisch | Screen | Klein |
| 7 | T2 | Live-Moment: Fall erscheint | Screen-Animation | Mittel |
| 8 | T3 | Wizard-Fall erscheint auch | Screen | Klein |
| 9 | T4 | 24h SMS-Erinnerung zeigen | Screen | Klein |
| 10 | T4 | Emotionaler Closer-Satz | Script | 0 |
| 11 | T2 | Verpasster-Anruf-Kontrast | Screen | Klein |
| 12 | T2 | Lisa nennt Firmennamen (Greeting) | TTS | Klein |
| 13 | T2 | Betriebsspezifische Frage + Antwort | Mini-Take-Pool | Mittel |
| 14 | T3 | Wizard-Fall ≠ Telefon-Fall (andere Kategorie) | Seed | Klein |
| 15 | T4 | Review-Seite in Brand-Color | Screen | Klein |
| 16 | E-Mail | Betreffzeile mit Firmennamen | Template | 0 |
| 17 | E-Mail | Thumbnail mit IHREM Leitsystem | Screenshot | Klein |
| 18 | Alle | Datum/Uhrzeit AKTUELL (tagesfrisch) | Pipeline | Mittel |
| 19 | T1 | Einstieg sofort fesseln (Denkanstoß) | Script | 0 |
| 20 | Meta | Versand-Timing (Di-Do, 11-12 oder 16-17 Uhr) | Prozess | 0 |

---

**Bitte pro Punkt antworten:**
- ✅ Einbau (ggf. mit Anpassung — bitte beschreiben)
- ❌ Kein Einbau (kurz warum, damit ich lerne)
- 🔄 Später / Parkplatz
