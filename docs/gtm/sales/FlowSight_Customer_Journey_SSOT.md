# FlowSight Customer Journey — SSOT

**Status:** Kanonische Version. **Ersetzt** `FlowSight_Customer_Journey_Long.md` + `_Short.md` (ChatGPT-Entwürfe) und integriert die Challenge aus `FlowSight_Customer_Journey_Review_CC.md`.
**Stand:** 2026-06-09 · **Owner:** Founder + CC
**Geltungsbereich:** vom ersten Outreach bis 30 Tage nach Go-Live — vollständig auf die *gebaute* FlowSight-Realität abgestimmt (Beweis-Seite `/p/[token]`, First-View-Alert, Sales-Lisa, Cockpit `/aufbau/[token]`, Founder-Review, Premium-Pivot, 2-stufiges Go-Live).

> **Grundgesetz:** Realität schlägt Dokument. Stark genug zum Testen, nicht endgültig zum Dogmatisieren. Offene Hypothesen → §16.

---

## §1 North Star & Leitidee

> **FlowSight hilft inhabergeführten Handwerksbetrieben, vom Reagieren zum Steuern zu kommen.**

Wir verkaufen **kein** KI / keine Telefonassistentin / keine App / kein SMS-Tool.
Wir verkaufen ein **Leitsystem**: Sichtbarkeit, Kontrolle, Steuerbarkeit — *keine Anfrage verschwindet mehr unsichtbar*.

Voice (Lisa), Leitzentrale, Wizard, SMS, Reviews sind **Mechanismen**, nicht die Story. Der Kunde kauft die **Gewissheit**, dass wichtige Anfragen nicht im Tagesgeschäft verschwinden — und dass sein Betrieb steuerbarer wird.

„Keine Anfrage geht verloren" = der stärkste *Beweis*. „Vom Reagieren zum Steuern" = die *Transformation*.

---

## §2 ICP (wer zuerst)

> **Kanonische ICP-Definition: [`SALES_BIBLE.md`](SALES_BIBLE.md) §3** (Leitsignal „Inhaber-am-Telefon"; Solo 1–3 / Premium 4–12). Hier die Journey-Perspektive.

Frühes Ziel ist **nicht** maximale Lead-Menge, sondern **die richtigen ersten 5–10 Kunden** (Lernwert > kurzfristige Marge).

| Tier | Profil | Dominanter Schmerz | Verkauf |
|---|---|---|---|
| **Gold** (Fokus) | 1–8 MA, Inhaber operativ, kein echtes Büro, Telefon klingelt auf der Baustelle, Zettel/WhatsApp/Kopf, guter Ruf/wenig Bewertungen | „Ich weiß nicht sauber, was reinkommt und was daraus wird." | Leitsystem für Übersicht, Erreichbarkeit, Kontrolle |
| **Silber** | 8–20 MA, Büro vorhanden, mehrere Techniker, Koordination wird Thema | „Mehr Übersicht, weniger Reibung in der Koordination." | Steuerungssystem (Eingang→Priorisierung→Zuweisung→Nachlauf) |
| **Bronze** (später) | 20+ MA, Disposition/CRM, Prozesse etabliert | Effizienz, Reporting, After-Hours, Reviews | Ergänzender Prozesslayer — erst mit Referenzen |

**Gold ist der Startpunkt:** Schmerz sofort verständlich, kaum Altsysteme zu verdrängen, höchster Aha durch Voice+Leitzentrale, founder-nahe Einführung möglich.

---

## §3 Die Journey im Überblick

**Operativ** (beginnt bei der Beweis-Seite — nicht erst beim Call):

```text
0. Outreach → Beweis-Seite → Signal (First-View-Alert) → Kontaktaufnahme
1. Discovery   (WARM, wenn Video gesehen · COLD, wenn nicht)
2. Discovery-Gate
3. Transition Discovery → Lösung
4. Cockpit-Link / Aufbau-Platz
5. Cockpit-Ausfüllung durch den Kunden
6. Founder-Review = Go-Live-Freigabe
7. Preis-Choreografie
8. Entscheidung
9. Go-Live (2-stufig)
10. Validierung (7 Tage + laufender Wochen-Rapport)
```

**Psychologisch** beantwortet jede Phase eine Kundenfrage:

```text
Versteht dieser Mensch meinen Betrieb? → Ist das seriös? → Wie viel Aufwand?
→ Habe ich Kontrolle? → Was kostet es? → Warum jetzt? → Kann ich freigeben?
```

Unbeantwortete Frage = Unsicherheit. Im Schweizer KMU-Markt führt Unsicherheit selten zum harten Nein — sondern zu „ich schaue es nochmals an" = **verlorenes Momentum**.

---

## §4 Phase 0 — Outreach → Beweis-Seite → Signal → Kontakt

*(Der Teil, der im ChatGPT-Entwurf fehlte — und der dein stärkster Asset ist.)*

### Der Ablauf
1. **Kalt-Mail** (aus „Gunnar Wende", Reply-To → Outlook, Foto inline) → **ein** privater Link auf die **Beweis-Seite `/p/[token]`** mit dem **personalisierten Beweis-Video** (T1–T4, für *seinen* Betrieb gemacht). Kadenz: **Tag 0 → Tag 3 (Nudge, nur falls kein View) → Tag 6–7 (Anruf)**, Video-Löschung nach 14 Tagen (`send_outreach.mjs`, Reminder-Cron).
2. **Der Aha passiert im Video, nicht im Call.** Der Kunde sieht seinen eigenen Betrieb im Leitsystem. Das ist stärker als jede verbale Outcome-Beschreibung später.
3. **First-View-Alert** (live, `sendProofViewAlert`): du bekommst sofort eine E-Mail, *wenn* er die Seite öffnet. **Das ist dein Warm-Call-Trigger.**

### Die drei realen Kontakt-Pfade (alle münden in Discovery)
- **A — Er ruft an** (CTA): landet auf **Sales-Lisa** (044 552 09 19). Lisa lässt ihn führen, beantwortet seine Frage ehrlich/knapp, **bahnt den Rückruf durch dich an** (Name + Betrieb + beste Zeit). → du rufst warm zurück = Discovery.
- **B — Er antwortet auf die Mail** (Reply landet in Outlook) → du rufst/antwortest = Discovery.
- **C — Er öffnet nur die Seite** (View-Alert, keine Reaktion) → **du rufst innerhalb 24h warm an** („Sie haben sich das Video angeschaut — was war Ihr erster Gedanke?").

### Sales-Disziplin (verbindlich)
- **View-Signal = innerhalb 24h handeln.** Ein warmer Lead kühlt schnell. Nicht auf den Kalender-Tag warten, wenn das Signal heute kommt.
- **Watch-Tiefe lesen** (`proof_watch_report.mjs`): hat er nur T1 oder bis T4 geschaut? → bestimmt die Wärme des Calls.

**Definition of Done Phase 0:** ein menschlicher Kontakt ist hergestellt (Pfad A/B/C) und ein Discovery-Gespräch terminiert oder direkt geführt.

---

## §5 Discovery — WARM vs COLD getrennt

Discovery erklärt **nicht** FlowSight. Sie prüft, ob ein **relevanter Schmerz** da ist. Der Founder *untersucht*, er verkauft nicht. Grundhaltung: *„Ich will verstehen, wie Ihr Betrieb heute funktioniert und ob FlowSight überhaupt sinnvoll ist."*

> **Mom-Test ist ein Werkzeug, kein Pflichtprogramm.** Nimm die 2–3 Fragen, die zünden — nicht alle. Schweizer Handwerker reagieren auf Ausfragen allergisch.

### 5a — WARM-Discovery (er hat das Video gesehen — der Normalfall)
Der Aha ist schon passiert. Nicht bei null ausgraben. **Ankern, bestätigen, vertiefen:**
1. **Anknüpfen:** „Schön, dass Sie sich das angeschaut haben. Was war Ihr erster Gedanke?" → *zuhören.*
2. **Spiegeln auf seinen Alltag:** „Im Video sehen Sie, wie jede Anfrage sichtbar wird, auch wenn keiner rangeht — passt dieses Bild zu Ihrem Alltag, oder läuft das bei Ihnen anders?"
3. **Eine Konsequenz-Frage** (genügt meist): „Woher wissen Sie heute eigentlich, dass nichts verloren geht?" → der Moment „eigentlich gar nicht" = offen.

→ Wenn Problem + Relevanz bestätigt: direkt zur **Transition (§6)**. Keine 6-Fragen-Liturgie.

### 5b — COLD-Discovery (kein Video gesehen / Direktkontakt)
Die volle 3-Ebenen-Struktur:

**Ebene 1 — Realität** (heutigen Ablauf verstehen, nicht bewerten)
- R1: „Wenn heute um 14 Uhr jemand anruft und niemand rangeht — was passiert dann normalerweise?"
- R2: „Woher wissen Sie eigentlich, dass keine Anfragen verloren gehen?" → verschiebt von *Erreichbarkeit* zu *Sichtbarkeit*. Bei „eigentlich gar nicht" → spiegeln, Pause.

**Ebene 2 — Konsequenz** (was die Realität kostet — nicht nur Geld: Rückrufaufwand, Abende, Frust, Kontrollverlust, weniger Bewertungen)
- K1: „Wenn jede Woche 1–2 Anfragen verloren gingen — würden Sie das überhaupt merken?" („wahrscheinlich nicht" ist *besser* als ja → Unsichtbarkeit verstanden.)
- K2: „Was ist ein durchschnittlicher Auftrag bei Ihnen ungefähr wert?" → er rechnet selbst. *Nicht* aggressiv ROI ausreizen: „Dann reden wir bei 1–2 verlorenen Anfragen/Monat schnell über eine relevante Größenordnung."

**Ebene 3 — Commitment** (will er Veränderung überhaupt?)
- C1: „Ist das etwas, das Sie gerne transparenter hätten — oder sagen Sie, solange der Betrieb läuft, ist das nicht so wichtig?" (Beide Antworten erlaubt, kein Gesichtsverlust.)
- C2: „Angenommen, wir sprechen in 3 Monaten nochmals — woran würden Sie erkennen, dass es sich gelohnt hat?" → seine **eigenen** Erfolgskriterien = spätere Closing-Anker.

### §5.5 Discovery-Gate
Cockpit-Link nur, wenn **mindestens 2 von 3** klar sind: (1) Problem existiert, (2) Problem kostet etwas, (3) er will mehr Transparenz/Kontrolle.
Sonst: *„Völlig in Ordnung — dann scheint das Thema aktuell nicht prioritär."* (= Qualifikation, kein Scheitern.) **„Klingt spannend" ist kein Commitment.** Kein-Fit → parken, Re-Outreach in ~3 Mt (via `proof_pages`/Reminder).

---

## §6 Transition Discovery → Lösung

Kritische Phase — hier verlieren Gründer das aufgebaute Vertrauen, wenn sie in die Feature-Liste springen. Reihenfolge: **Zusammenfassen → bestätigen lassen → Brücke → Outcome → Mechanismus (kurz!) → Reaktion holen.**

1. **Zusammenfassung** (Prüfpunkt, kein Monolog): „Wenn ich Sie richtig verstehe, Herr [Name], ist gar nicht das Problem, dass mal ein Anruf verpasst wird — sondern dass Sie heute nicht sicher sehen, *welche* Anfragen verloren gehen." → schweigen. (Korrektur durch den Kunden = bessere Discovery.)
2. **Brücke:** „Genau deshalb habe ich Ihnen geschrieben." → Pause.
3. **Outcome** (Ergebnis, nicht Technik): „Die Idee ist, dass Ihr Betrieb steuerbarer wird: Was reinkommt, bleibt sichtbar, priorisiert und nachvollziehbar — auch wenn gerade niemand ans Telefon kann."
4. **Mechanismus** (erst *jetzt*, kurz): „Dafür bauen wir gemeinsam Ihre Telefon-Assistentin und Ihre Leitzentrale auf." — **nie** die Tech-Kette (Retell/SMS/Supabase…) nennen, das zerstört den Frame.
5. **Reaktion holen:** „Wie klingt das für Sie?" → schweigen. Wer nach dem Mechanismus weiterredet, verliert die Gesprächskontrolle.

---

## §7 Cockpit (`/aufbau/[token]`)

**Strategische Funktion:** keine Software-Konfiguration, sondern eine **Vertrauensmaschine**. Sie beantwortet: *„Ist das eine seriöse, geführte Lösung — oder KI-Spielerei?"*

> **Leitidee: „Sie bauen Ihr System. Wir führen Sie."** FlowSight hat ~80 % aus der Pipeline vorbereitet (abgeleitet aus `tenant_config.json`); der Kunde ergänzt die 20 %, die nur er weiß. → **Eigentum** entsteht: nicht „ich habe ein Tool ausgefüllt", sondern *„das ist mein Leitsystem."*

Reduziert vier Ängste: „Ich verstehe das nicht" · „Das wird ein IT-Projekt" · „Das passt nicht zu meinem Betrieb" · „Ich verliere Kontrolle." Visuelle Struktur **Vor Ort · Lisa · Website → Leitzentrale → Freischaltung** erklärt FlowSight besser als jede Featureliste.

Der Kunde beschreibt (keine technischen Fragen): wie Lisa reagiert · was Fall/Nachricht/Notfall ist · wer benachrichtigt wird · was Lisa sicher sagen darf · welche Grenzen sie nie überschreitet · wie sein Betrieb strukturiert ist.

**Satz im Call:** „Sie bekommen einen Aufbau-Link, gehen Ihr Leitsystem in Ruhe Schritt für Schritt durch — und ich prüfe danach alles persönlich, bevor irgendetwas live geht." (= kein Druck · kein IT-Projekt · persönliche Kontrolle durch dich.)

**Compliance ist eingebaut:** Lisas Grenzen (nie Preise, nie verbindlicher Termin, keine Ferndiagnose, keine Garantie) sind **gesperrte Cockpit-Leitplanken** — der Kunde kann sich gar nicht in einen Verstoß konfigurieren. revDSG + AVV (§10/§12).

---

## §8 Founder-Review = Go-Live-Freigabe

**Frame:** kein Demo-Call, kein Sales-Call — die **Freigabe**. Ziel ist nicht „wollen Sie kaufen?", sondern *„Ist Ihr Leitsystem korrekt aufgebaut, und spricht noch etwas gegen die Freischaltung?"*

> *(Nach außen ggf. „gemeinsame Abnahme/Freigabe" nennen — „Review" klingt nach interner Prüfung.)*

**Ablauf:**
1. **Eröffnung:** „Ich habe mir Ihr Leitsystem angeschaut. Heute geht es nicht ums Verkaufen, sondern gemeinsam zu prüfen, ob wir Ihren Betrieb korrekt verstanden haben und ob etwas gegen die Freischaltung spricht." (nimmt Druck raus, setzt Qualitätsanspruch, positioniert dich als Gatekeeper, schützt Premium).
2. **Betrieb spiegeln:** „Notfälle sofort sichtbar, Reklamationen immer an Sie, reine Rückrufe nicht als Auftrag, Preise sagt Lisa nicht." → Pause. (Der Kunde merkt: verstanden.)
3. **Offene Punkte:** nicht „Haben Sie Fragen?" → **„Wo hätten Sie aktuell noch Bauchschmerzen?"** (lädt echte Risiken ein: Kundenakzeptanz, Notdienst, Mitarbeiter, falsche Versprechen, Datenschutz, Weiterleitung).
4. **Zielbild bestätigen** (Discovery-C2 wiederholen — jetzt kennt er das System): „Woran würden Sie in 3 Monaten erkennen, dass es funktioniert?"
5. **Go-Live erklären** (nicht technisch): „Ihr Betrieb läuft nicht anders — nur wird sichtbar, was heute unsichtbar bleibt."
6. **Freigabe-Frage:** „Gibt es aus Ihrer Sicht noch etwas, das gegen die Freischaltung spricht?" → bei Nein: „Perfekt, dann bereite ich Ihr Leitsystem für die Freischaltung vor."

**Done:** Setup bestätigt · keine offenen Bauchschmerzen · Go-Live verstanden · Preis-/Entscheidungsphase kann anschließen · Kunde **signalisiert Freigabe** (nicht nur Interesse).

---

## §9 Preis-Choreografie (Premium-Pivot)

> **Kanonische Preis-Zahlen: [`SALES_BIBLE.md`](SALES_BIBLE.md) §5** (Solo CHF 950 / Premium CHF 2'000). Hier die *Choreografie* (wie man den Preis im Gespräch setzt) — nicht die Zahlen-SSOT.

**Grundsatz:** Preis nie als Feature-Preis. Preis als **Go-Live-Preis für ein funktionierendes Leitsystem**, verankert gegen den geschaffenen Zustand (steuerbarer Betrieb / verpasste 15–30k-Aufträge), nicht gegen Funktionen.

**Stärkster Anker:** *„Sie kaufen keine Telefon-Assistentin. Die ist nur der Eingang. Wir bauen die digitale Leitzentrale Ihres Betriebs — und ersetzen das Chaos zwischen Anruf, Baustelle, Rückruf, Notfall, Mitarbeiter und Auftrag."*

**Modell (Premium-Pivot, Founder-bestätigt 06.06.):**
- **Einmalige Aktivierung** ~CHF 1'500–2'500 (deckt den persönlichen Aufbau + ist das Anti-Absprung-Commitment-Signal).
- **Premium-Monat** ~CHF 1'900–2'400, **monatlich kündbar**.
- **Kein Gratis-Trial.** Zahlend am Go-Live.
- **0 Kunden → Richtwerte; die ersten 3–5 sind Preis-Findung** (Landung am unteren Ende der Spanne ist Preis-Kalibrierung, **kein Rabatt**).

**Founder-Phase — wie framen (Bible: „nie rabattieren" + Scarcity):**
> NICHT „CHF 500" / „normalerweise teurer" / „wir schauen beim Preis". SONDERN: *„Für die ersten Betriebe arbeite ich bewusst sehr persönlich und eng. Sie bekommen meinen direkten Aufbau und einen festen Preis, der für Sie nicht steigt."* → Gründer-**Nähe + Preis-Lock**, nicht Rabatt. Der Premium-Anker bleibt; die Referenz, die der Kunde weitererzählt, ist die hohe Zahl.

**Wenn Preis zu früh kommt** („Was kostet das?"): *„Gerne. Bevor wir über den Preis reden, will ich kurz verstehen, wie Sie das heute lösen — sonst reden wir über Geld für etwas, das Sie gar nicht brauchen."* (führt zurück in Discovery, schützt den Anker).

**Wenn Preis nach Fit kommt:** ruhig, sachlich, wertorientiert, **keine Rechtfertigung, Preis stehen lassen.** „Der Betrieb liegt bei rund [X]/Monat plus einmaligem Aufbau — bewusst kein kleines Tool, sondern das Leitsystem für Ihren Betrieb."

> **🧪 HYPOTHESE (nicht fester Prozess — durch echte Gespräche validieren):** Ein **Soft-Price-Frame als Größenordnung VOR dem Cockpit** könnte den teuren Aufbau-Aufwand vor Preis-Misfits schützen („damit Sie wissen, worüber wir reden — passt die Größenordnung grundsätzlich?"). Spannung: Mom-Test sagt „Preis spät", Premium-Ökonomie sagt „nicht so spät, dass du gratis baust". **Vorerst offen lassen, in den ersten Gesprächen testen**, ob Cockpit-Aufwand ohne Preis-Signal zu Misfits führt. Erst dann als Prozess festschreiben.

---

## §10 Einwandbibliothek

Einwände werden **verstanden, nicht bekämpft** (wer argumentiert, erzeugt Widerstand).

- **„Wir haben das im Griff."** → „Das kann gut sein. Mich interessiert eher, wie Sie heute sicherstellen, dass nichts verloren geht."
- **„Meine Frau / das Büro macht das."** → „Dann ist das organisiert. Die Frage wäre eher, ob zusätzliche Transparenz überhaupt relevant wäre." (kein Angriff auf die Person.)
- **„Kunden wollen nicht mit KI sprechen."** → „Das war auch eine unserer ersten Fragen. Deshalb haben wir viel Wert darauf gelegt, dass es sich natürlich anfühlt und Lisa nichts verspricht, was sie nicht sicher weiß." (nicht technisch werden.)
- **„Wie viel Aufwand habe ich?"** → „Möglichst wenig. Genau dafür gibt's das Cockpit: Sie beschreiben Ihren Betrieb, ich prüfe alles persönlich vor der Freischaltung."
- **„Schauen wir später an."** → „Was glauben Sie, wird sich zwischen heute und dem Herbst an diesem Thema verändern?"
- **„Das ist zu teuer."** → „Verstehe. Dann ist die Frage, ob das Leitsystem mehr Wert schafft, als es kostet. Wäre es nur ein Telefon-Tool, wäre ich bei Ihnen — es geht darum, ob Ihr Betrieb steuerbarer wird."
- **„Was, wenn Lisa etwas falsch macht?"** → „Genau deshalb hat sie feste Grenzen: keine Preise, keine verbindlichen Termine, keine Diagnosen, keine Garantien. Was nicht sicher ist, nimmt sie auf und gibt es an Sie weiter."
- **🆕 „Und der Datenschutz / nimmt die das Gespräch auf?"** → „Schweizer Datenschutz nach revDSG, Server in Frankfurt (EU), **keine Gesprächsaufnahmen** — und ein Auftragsverarbeitungsvertrag (AVV) ist Teil des Onboardings." (Schweizer KMU fragen das bei „KI am Telefon" oft — Antwort parat haben.)

---

## §11 Why Now

Der Gegner ist nicht der Wettbewerb — der Gegner ist **„Später".** Im CH-KMU klingt Untätigkeit freundlich („spannend", „nach den Ferien") — gerade deshalb gefährlich.

**Kein künstlicher Druck** (kein „nur heute", keine aggressive Knappheit — Handwerker riechen das sofort). Stattdessen **sachliche Selbstkonfrontation:**
- „Was wird sich zwischen heute und dem Herbst an diesem Thema verändern?"
- „Wenn in den nächsten 3 Monaten wieder Anfragen unsichtbar verloren gehen — wäre das Teil des Tagesgeschäfts, oder etwas, das Sie eigentlich abstellen möchten?"

**Momentum-Satz:** *„Ich will Sie nicht drängen. Mir ist nur wichtig, dass wir unterscheiden: nicht relevant → lassen wir es. Relevant → dann sollten wir es nicht künstlich in die Zukunft schieben."*

---

## §12 Go-Live (2-stufig — business-echt)

**Frame:** Go-Live ist keine technische Aktivierung, sondern **Vertrauensbestätigung.** Nach dem Ja darf kein Vakuum entstehen.

**Go-Live-Voraussetzungen (Checkliste):** Voice sauber (inkl. sauberes Auflegen — *VA1 offen, vor erstem Go-Live zu fixen*) · Notfall-Empfänger gesetzt · revDSG/AVV akzeptiert · Cockpit founder-geprüft.

**2 Stufen (aus der Onboarding-Bible):**
- **Stufe A — sofort testbar:** auf einer von uns bereitgestellten Nummer. Erster Testanruf, Kunde hört „seine" Lisa.
- **Stufe B — echte Anrufe:** erst nach der **Telefonweiterleitung**. ⚠️ **Das ist die EINE Aktion, die nur der Kunde kann** (beim Telco einstellen, Swisscom/Sunrise/Salt) — FlowSight macht das *nicht*. Klar kommunizieren, sonst Erwartungs-Bruch.

**Ablauf:** Freigabe bestätigen → Live-Config vorbereiten → Stufe A Testanruf → Weiterleitung (Kunde) → erster echter Fall beobachten → **du meldest dich mit dem ersten Wertbeweis.**

---

## §13 Validierung & laufender Wert-Beweis

**Erste 7 Tage sind heilig** — hier entsteht Vertrauen oder Kündigungsrisiko. Du zeigst aktiv den Wert (aus den **echten** Leitsystem-Daten, nicht erfundene Zahlen): „In den ersten 7 Tagen wurden X Anfragen erfasst, davon Y Rückrufe und Z dringende." **Innerhalb 14 Tagen muss der Kunde denken: „Gut, dass wir das haben."** — Das ist FlowSights Aufgabe, nicht die des Kunden.

**Danach: der Wochen-Rapport = Churn-Versicherung.** Er beweist Monat für Monat den Wert (X Anrufe gefangen, Y Termine, Z Bewertungen). Das ist das stärkste Argument gegen die Kündigung bei einem monatlich kündbaren Premium-Abo — verbindlich einrichten, nicht optional.

---

## §14 KPI-Funnel

```text
Outreach gesendet → Beweis-Seite geöffnet (First-View-Alert) → Watch-Tiefe (T1..T4)
→ Antwort/Anruf (Lisa) → Discovery geführt → Discovery-Gate bestanden
→ Cockpit-Link → Cockpit abgeschlossen → Founder-Review → Go-Live freigegeben
→ Stufe B live → 30 Tage aktiv
```

Conversion pro Stufe (früh nicht überkomplex messen — aber jede verlorene Stufe *verstehen*). Datenquellen sind großteils schon da: `proof_pages` (View/Watch), Reminder-Cron (Kadenz), Leitsystem (aktiv).

---

## §15 Lessons-Loop

Nach **jedem Gespräch:** (1) welcher ICP? (2) welche Discovery-Frage zündete? (3) wo stockte es? (4) welcher Einwand? (5) nächster Schritt?
Nach **jedem Go-Live:** (1) was war schwerer als erwartet? (2) welche Cockpit-Frage unklar? (3) wo brauchte es dich? (4) erster echter Wertmoment? (5) was fließt in die Bible zurück?
→ Das Playbook wird durch echte Gespräche besser, nicht am Schreibtisch.

---

## §16 Failure Modes

1. **Zu viel Discovery** — Verständnis schaffen, nicht Vollständigkeit. Bei Warm-Leads erst recht kurz.
2. **Zu viel FlowSight** — ein Gespräch, ein Hauptproblem, ein Hauptnutzen.
3. **Falscher Kunde** — nicht jeder interessierte Betrieb ins Cockpit; komplexer Großbetrieb kann früh mehr schaden als helfen.
4. **Schweizer Höflichkeit falsch lesen** — „klingt spannend"/„schicken Sie mal"/„ich schau's an" ist **kein** Commitment. Commitment = konkrete nächste Handlung.
5. **Zu früh skalieren** — mit 2 lernen, mit 5 vergleichen, mit 10 standardisieren, mit 20 skalieren. (Diese Journey ist die *high-touch Gründungsphase*; ab ~Kunde 10 wird sie schrittweise self-service-fähiger — der Discovery-Call skaliert nicht auf 10/Tag.)
6. **Preis gegen Funktionen verteidigen** — nie „dafür bekommen Sie Lisa+SMS+App+Reviews"; immer „ob Ihr Betrieb steuerbarer wird".
7. **🆕 View-Signal verschlafen** — ein warmer Lead, auf den 3 Tage niemand reagiert, ist verschenkt. First-View-Alert = 24h-Handlungspflicht.
8. **🆕 Cockpit-Aufwand vor Preis-Realität** — (siehe §9-Hypothese) im Auge behalten, ob Kunden viel bauen und dann am Preis abspringen.

---

## §17 Offene Hypothesen (durch echte Gespräche validieren)

- **Soft-Price-Frame vor Cockpit** (§9) — Hypothese, kein Prozess. Erst testen, ob ungeschützter Cockpit-Aufwand zu Preis-Misfits führt.
- **Exakter Premium-Preis** (Aktivierung + Monat) — die ersten 3–5 Kunden finden ihn.
- **Founder-Phase-Framing** (Nähe + Preis-Lock vs. zeitlicher Bonus) — welche Variante am besten konvertiert ohne den Anker zu senken.
- **Founder-Review als tatsächlicher Closing-Moment** — hält der Frame, oder kommt der Preis-Einwand trotzdem?
- **Reaktion auf Cockpit-Link ohne Termin** — kommt er allein durch, oder braucht es einen begleiteten Call?
- **Warm- vs. Cold-Anteil** — wie oft ist die Discovery wirklich warm (Video gesehen)? Bestimmt, wie sehr §5a der Normalfall ist.
- **Beste Why-Now-Formulierung** + **beste ICP-Untergruppe** innerhalb Gold.

> **Bis zur Validierung gilt:** stark genug zum Testen, nicht endgültig genug zum Dogmatisieren.

---

## Schlussgedanke

FlowSight verkauft keine Technologie. Die beste Customer Journey führt den Kunden nicht durch ein Produkt, sondern durch eine **Erkenntnis** — die im **Beweis-Video beginnt** und sich durch jedes Gespräch verdichtet:

> *„So könnte mein Betrieb ruhiger, sichtbarer und kontrollierbarer laufen."*
