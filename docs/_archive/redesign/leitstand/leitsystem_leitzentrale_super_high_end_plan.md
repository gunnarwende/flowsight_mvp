# FlowSight Leitsystem / Leitzentrale — Super High-End Umsetzungsplan für Claude Code

## 0. Arbeitsmodus / Auftrag an Claude Code

Bevor du irgendetwas umsetzt:

1. **Challenge diesen Plan aktiv.**  
   Wenn du irgendwo einen besseren Schnitt siehst, einen Widerspruch erkennst oder eine gefährliche Verkürzung bemerkst, sag das klar.
2. **Denke nicht in einzelnen Screens, sondern im Leitsystem.**  
   Website / Wizard / Voice / manueller Fall → Leitzentrale → Fall → Abschluss → Review.
3. **Denke nicht kosmetisch, sondern strukturell.**  
   Nicht „wie können wir bestehende Screens hübscher machen?“, sondern „wie muss das Produkt geschnitten sein, damit es betriebsreal, hochwertig und skalierbar ist?“
4. **Denke sofort dynamisch und skalierbar.**  
   Weinberger ist Referenzfall für Modul 2, aber alles so bauen, dass es als globaler Standard für künftige Modul-2-Betriebe funktioniert.
5. **Keine Halb-Lösung, kein Refactoring um des Refactorings willen.**  
   Ziel ist ein erkennbar neues, überzeugendes Zielbild.

---

## 1. Zielbild in einem Satz

Wir bauen **kein Dashboard** und **keine Fallliste mit neuer Navigation**, sondern die **Leitzentrale** innerhalb des **Leitsystems**: einen hochwertigen, ruhigen, betriebsnahen Führungsraum, der neue Eingänge, operative Verantwortung, Abschlussqualität und Systemwirkung klar priorisiert und dabei für jeden Modul-2-Betrieb dynamisch gebrandet und skalierbar bleibt.

---

## 2. Produktdefinitionen — verpflichtend

### 2.1 Leitsystem
Das **Leitsystem** ist das geschlossene End-to-End-System von:
- Input über Website / Wizard
- Input über Voice Agent
- manuell neuer Fall
- operative Bearbeitung / Führung / Nachhalten
- Abschluss
- Review-Nachlauf / messbare Wirkung

### 2.2 Leitzentrale
Die **Leitzentrale** ist der operative Führungsraum innerhalb des Leitsystems.

Sie ist **nicht**:
- Dashboard
- KPI-Wand
- Falltabelle
- App-Menü
- Seitenfriedhof

Sie ist:
- Morgenblick
- Prioritätsraum
- Führungsfläche
- täglicher Arbeitsanker
- hochwertiges Betriebswerkzeug

### 2.3 Modul-2-Logik
Weinberger ist **Modul 2**. Daraus folgt als globaler Standard für alle Modul-2-Betriebe:
- bestehende Website / bestehende Markenwelt ist Referenz
- keine Modul-1-Logik hineinziehen
- keine neue Website als Kernantwort
- die Leitzentrale muss sich visuell an die bestehende Betriebsmarke anschließen
- Tenant-Branding muss **dynamisch** funktionieren, nicht per Default-Farbe

---

## 3. Was falsch war und nicht wieder passieren darf

### 3.1 Nicht wieder bauen
- keine lange Fallliste als Daily Driver
- keine KPI-Karten-Wand als Startfläche
- keine gleich lauten 5–8 Kacheln ohne Hierarchie
- keine leeren Räume wie Einsatzplan/Überblick/Team prominent sichtbar lassen
- keine falschen Tenant-/Brand-Wahrheiten
- keine Refactoring-Arbeit, die kein neues Produktbild erzeugt

### 3.2 Harte Negativkriterien
Wenn das Ergebnis nach einem dieser Muster aussieht, ist es falsch:
- generisches SaaS-Dashboard
- CRM-/ERP-Backoffice
- Tabellen-First-Produkt
- Software-Menü mit hübscherer Sidebar
- Demo mit leeren Flächen
- Tenant-falsches Branding

---

## 4. Die Leitzentrale — finale Architektur

Die Leitzentrale darf **nicht** als lose Sammlung von Karten oder Listen verstanden werden.  
Sie braucht eine klare Führungsarchitektur.

### 4.1 Oberstes Prinzip
Die Leitzentrale beantwortet morgens in 10 Sekunden:
1. Was ist neu reingekommen?
2. Wo liegt der Ball bei uns?
3. Was muss sauber abgeschlossen werden?
4. Gibt es eine kritische Lage?
5. Was ist die Wirkung / was läuft im Betrieb?

### 4.2 Finale Leitzentralen-Struktur

#### Ebene A — Prioritäts-/Lageebene
1. **Notfall-/Kritisch-Banner** (nur wenn aktiv)
2. **Lagezeile** (immer sichtbar)

#### Ebene B — Hauptarbeitsfläche
3. **Neu eingegangen**
4. **Bei uns**
5. **Wartet auf uns** (als verschärfte Unterzone oder eng verknüpfter Bereich)

#### Ebene C — Schluss-/Wirkungsebene
6. **Abschluss**
7. **Betriebs-/Wirkungsleiste**

#### Ebene D — Tiefenräume
8. **Fälle**
9. **Fall-Detail**
10. **Betrieb** (Überblick / Einstellungen / ggf. Einsatzplan / Team nur wenn substanziell)

---

## 5. Leitzentrale — Modul für Modul

### 5.1 Notfall-/Kritisch-Banner

#### Zweck
Kritische Ereignisse dürfen nicht in Statistik oder stiller Card untergehen. Sie müssen als Event-Lage sichtbar werden.

#### Produktlogik
Notfall ist **keine eigene Standard-Card**.  
Notfall ist ein **prioritätsüberlagerndes Event-Signal**, das alle relevanten Oberflächen beeinflusst.

#### Regeln
Banner erscheint, wenn mindestens ein aktiver kritischer Fall existiert.

##### Aktive kritische Fälle
- `urgency = notfall` und `status NOT IN (done, archived)`
- optional zweite Stufe: `urgency = dringend` kann als softer Marker innerhalb anderer Module erscheinen, aber kein Banner triggern, falls ihr `notfall` und `dringend` sauber trennen wollt

#### Darstellung
- volle Breite, oberhalb der Leitzentrale
- klarer roter Akzent, aber hochwertig, nicht alarmistisch billig
- kurze klare Sprache
- direkt klickbar in die betroffenen Fälle
- max. 3 Einträge sichtbar, dann „+ X weitere“

#### Wichtig
- **Banner zusätzlich zur Lagezeile**
- Notfall **nicht nur** als Banner und **nicht nur** in der Lage
- Notfall auch im betroffenen Modul und im Fall-Detail hervorheben

### 5.2 Lagezeile

#### Zweck
Kompakte Systemwahrheit in 2 Sekunden.

#### Nicht sein
- KPI-Karten
- Chart-Zeile
- Dashboard-Header

#### Sein
- ruhige, präzise Instrumentenzeile
- Zustand des Betriebs, nicht Analysezentrum

#### Inhalt
Finale Empfehlung:
- **kritisch** (Anzahl aktiver kritischer Fälle)
- **offen/aktiv** (aktive Fälle)
- **bei uns** (Ball liegt bei uns)
- **Abschluss offen**
- optional: **heute** als kleines Signal, nicht dominant

#### Regeln
- `kritisch`: count aktive notfälle
- `aktiv`: count status not in done/archived
- `bei uns`: count Fälle im Modul „Bei uns“
- `Abschluss offen`: count Fälle im Modul „Abschluss“
- optional `heute`: count heute relevante Fälle / Termine

#### Darstellung
- schmale horizontale Leiste
- keine Blöcke, keine separaten Cards
- rechts: `+ Neuer Fall`
- kein Datenmüll, keine Trendgraphen

### 5.3 Neu eingegangen

#### Zweck
Alle neuen Eingänge in einer sauberen, priorisierten Sicht.

#### Geschäftlicher Sinn
Das ist der Beginn des Leitsystems:
- Voice
- Website / Wizard
- manuell angelegt

#### Regel
- `status = new`

#### Sortierung
1. Notfall
2. Dringend
3. Rest nach `created_at DESC`

#### Unterlogik
Innerhalb dieses Moduls müssen kritische neue Eingänge sichtbar hervorstechen.

#### Darstellung
- maximal 3–5 sichtbare Einträge in der Leitzentrale
- keine lange Scroll-Liste
- kurze präzise Cards oder Reihen mit:
  - Kategorie
  - Kurzbeschreibung
  - Ort
  - Melder
  - Fall-ID
  - Dringlichkeitssignal

#### Klickziel
- in `Fälle`, vorgefiltert auf `status = new`
- oder direkt in den Fall

#### Nicht tun
- nicht 30 neue Fälle in der Zentrale auskippen
- nicht als lange Listenwand bauen

### 5.4 Bei uns

#### Zweck
Das ist das Herzstück der operativen Verantwortung.

#### Leitfrage
**Wo liegt der Ball bei uns?**

#### Produktlogik
`Bei uns` ist stärker als `Heute`.  
Es ist der eigentliche Arbeitsraum für alles, was intern bearbeitet, geklärt, bestätigt, terminiert oder weitergeführt werden muss.

#### Regeln
Grundsätzlich gehören hier Fälle hinein, die aktiv sind und bei euch in Bearbeitung liegen.

Empfohlene Phase-1-Regeln:
- `status = contacted`
- oder `status = scheduled`
- oder allgemein: aktive Fälle mit internem nächsten Schritt

#### Unterteilung innerhalb von „Bei uns“
Nicht als eigene Hauptcards, sondern intern priorisiert:
1. **heute relevant**
2. **in Bearbeitung**
3. **Termin steht / Bestätigung offen**

#### Darstellung
- dichte, hochwertige Liste / Reihen
- keine unnötigen großen Cards
- Fokus auf:
  - wer / was
  - nächster Schritt
  - Zeitbezug, wenn vorhanden

#### Heute-Logik
`Heute` soll **nicht** als leere eigene Hauptspalte auftreten.  
`Heute` wird als **integrierte Teilmenge** von `Bei uns` geführt.

Beispiele:
- heutige Termine
- heute fällige Rückrufe
- heute relevante Bestätigungen

#### Klickziel
- in `Fälle`, gefiltert auf `bei uns`
- oder direkt in den Fall

### 5.5 Wartet auf uns

#### Zweck
Der Betrieb braucht eine verschärfte Sicht auf alles, was intern hängt.

#### Warum nicht einfach in „Bei uns“ verstecken?
Weil es psychologisch und operativ wichtig ist, zu sehen:
**wo wir etwas zugesagt haben oder wo etwas bei uns liegen geblieben ist.**

#### Regel
Phase-1 pragmatisch:
- `status = contacted AND scheduled_at IS NULL`
- plus `assignee IS NULL` oder äquivalent unzugewiesen

Später ausbaubar zu:
- Rückruf offen
- Termin offen
- Zuweisung offen
- intern zugesagt, aber noch nicht erledigt

#### Darstellung
- kleiner, amber markierter Bereich
- entweder unter `Neu eingegangen` oder als klar abgesetzte Sub-Zone
- kompakte Einzeiler, nicht dominante Cards

#### Klickziel
- in `Fälle`, gefiltert auf „Wartet auf uns“

### 5.6 Abschluss

#### Zweck
Das Leitsystem endet nicht bei `done`.  
Abschluss ist die Schluss-Schleife.

#### Geschäftlicher Sinn
Hier entsteht Qualität und Wertschöpfung:
- sauber schließen
- Nachfassen
- Review anfragen
- Wirkung erzeugen

#### Semantik
`Abschluss` ist **fachlich breiter** als nur „Review offen“.

#### Phase-1 technische Regel
- `status = done AND review_sent_at IS NULL`

#### Semantische Zieldefinition (verpflichtend im Produktdenken)
Abschluss umfasst perspektivisch:
- Review offen
- Nachfassen offen
- Abschluss noch nicht vollständig bestätigt

#### Darstellung
- kompakte, volle Breite oder ruhige horizontale Zeile
- nicht zu dominant, aber sichtbar genug
- collapse, wenn leer

#### Klickziel
- in `Fälle`, gefiltert auf Abschluss offen

### 5.7 Betriebs-/Wirkungsleiste

#### Zweck
Der Betrieb soll nicht nur Probleme sehen, sondern Wirkung.

#### Aber
Das darf die Leitzentrale nicht in ein Dashboard verwandeln.

#### Darum
- keine große KPI-Sektion
- keine Charts als Primärsignal
- keine lauten Metrikkarten

#### Inhalt
Phase-1 minimal und sinnvoll:
- neue Fälle letzte 7 Tage
- erledigte Fälle letzte 7 Tage
- offene Review-Anfragen
- optional Durchschnittsbewertung / neue Bewertungen, **nur wenn verlässlich vorhanden**

#### Darstellung
- sehr ruhig
- eher Footer-/Leiste als Hauptmodul

#### Klickziel
- in `Betrieb > Überblick`

---

## 6. Fall-Detail — Zielbild

Der Fall ist die **operative Akte**.

### Der Fall muss in 5 Sekunden beantworten:
1. Was ist das?
2. Wo ist das?
3. Wie dringend ist das?
4. Wer ist dran?
5. Was ist der nächste Schritt?

### 6.1 Oberkopf / Lagekarte
Verpflichtend sichtbar:
- Kategorie / Falltitel
- klare Kurzlage
- Adresse / Ort
- Dringlichkeit
- Zuständigkeit
- Termin, falls vorhanden
- Quelle (`Anruf`, `Website`, `manuell` etc.)
- **Nächster Schritt** prominent und sauber formuliert

### 6.2 Nächster Schritt
Keine Spielerei, sondern hart regelbasiert.

Beispiele:
- new → „Sichten und einordnen“
- contacted ohne Termin → „Termin vereinbaren“
- scheduled → „Termin bestätigen“ oder „Einsatz läuft“
- done ohne Review → „Review anfragen“

### 6.3 Darunter
- Kontakt
- Beschreibung
- Verlauf
- Anhänge
- interne Notizen
- Termin / Zuweisung
- Abschlussaktion

### 6.4 Nicht sein
- Formular-Adminseite
- Seitenlayout ohne klare Priorität
- technische Datensammlung

---

## 7. Fälle — Zielbild

`Fälle` ist der Tiefenraum.  
Er ist **nicht** die Leitzentrale.

### 7.1 Job des Raums
- suchen
- filtern
- sortieren
- in Breite arbeiten
- exportieren
- Alt-/Breitenarbeit

### 7.2 Darum raus
- keine KPI-Karten oben
- keine semantisch falschen Balken
- keine zweite Leitzentrale

### 7.3 Erlaubt / sinnvoll
- Suche
- Filter
- Statusfilter
- Quellenfilter
- Dringlichkeitsfilter
- Zeitfilter, wenn sauber gekennzeichnet
- Tabelle / Listenansicht
- Pagination / Export

### 7.4 Wichtig
Label und Klicklogik müssen identisch sein.

Beispiel:
- Wenn dort `Neu heute` steht, muss Klick exakt `status = new AND created_at today` filtern.
- Wenn Klick nur `status = new` filtert, dann Label `Neu`.

### 7.5 Name
`Fälle` ist aktuell gut genug und wahrscheinlich richtig.

---

## 8. Betrieb — Zielbild

`Betrieb` ist sekundär.  
Es darf nicht die Leitzentrale verwässern.

### 8.1 Enthalten
- Überblick
- Einstellungen
- Einsatzplan (nur wenn substanziell)
- Team (nur wenn substanziell)

### 8.2 Überblick
- ruhige Betriebs-/Wirkungsansicht
- keine laute KPI-Wand
- besser wenige hochwertige Signale als viele Metric-Cards

### 8.3 Einsatzplan
- nur sichtbar, wenn real genutzt / mit Inhalt gefüllt
- nicht als leerer, peinlicher Raum
- sekundär, nicht Daily Driver

### 8.4 Team
- ebenfalls nur, wenn substanziell
- nicht leer oder künstlich aufziehen

---

## 9. Tenant-/Branding-/Modul-2-Logik — globaler Standard

Das muss jetzt global sauber entschieden und implementiert werden.

### 9.1 Verbindliche Wahrheit
Ein Modul-2-Betrieb bekommt seine Leitzentrale aus:
- bestehender Betriebsmarke
- bestehender Website-Farbwelt
- bestehender Grundtonalität

Nicht aus:
- FlowSight-Default-Gold
- Zufalls-/Fallbackfarbe
- willkürlicher Migration

### 9.2 Dynamische Variablen pro Tenant
Verpflichtend dynamisch:
- Betriebsname
- Initialen
- Primärfarbe
- Fallpräfix
- sichtbare Farbakzente
- Login-/Mail-Tonalität, wo sinnvoll

### 9.3 Keine Brüche mehr
Nicht akzeptabel:
- JW in der Sidebar
- WB in Fallnummern
- DA im Präfix

Es braucht **eine sichtbare Tenant-Wahrheit**.

### 9.4 Modul-2-Referenzwelt pro Betrieb festhalten
Für Weinberger und künftig jeden Modul-2-Betrieb zuerst sauber definieren:
1. Primärfarbe
2. Materialität / Markencharakter
3. gewünschte Übersetzung in die Leitzentrale
4. was bewusst NICHT übernommen wird

---

## 10. Login / OTP — finaler Qualitätsstandard

OTP bleibt Primärlogin. Das ist richtig.

### 10.1 Ziel
- ruhig
- sicher
- verständlich
- kein Browserwechsel
- kein Supabase-Gefühl
- hochwertige Vertrauenswirkung

### 10.2 Login-Screen
- Zugang zum Leitstand / zur Leitzentrale
- keine technische Auth-Anmutung
- klare deutsche Sprache
- gute Fehlerzustände

### 10.3 OTP-Mail
Verpflichtend prüfen und ggf. final schärfen:
- Absenderwirkung
- Betreff
- sichtbarer 6-stelliger Code
- kein unnötiger technischer Footer
- kein Rest-Supabase-Eindruck
- kurze, ruhige, hochwertige Sprache

### 10.4 Fehlerzustände
- unbekannte E-Mail
- falscher Code
- abgelaufener Code
- erneuter Versand
- bereits eingeloggt

Alles ruhig, klar, nicht technisch.

### 10.5 Wichtig
Auth jetzt nur noch final polieren, nicht wieder in großen Strang ziehen.

---

## 11. Visuelle Zielrichtung — verpflichtend

### 11.1 Nicht sein
- dashboardig
- verspielt
- bunt
- generische B2B-SaaS-App
- CRM-/ERP-Backoffice

### 11.2 Sein
- ruhig
- hochwertig
- modern
- präzise
- betriebsnah
- würdig
- mit echter Lust zur Nutzung

### 11.3 Gestaltungsprinzipien
- weniger gleich starke Cards
- klare visuelle Hierarchie
- Weißraum statt Dichte
- Typografie vor Farbe
- Farbe als Signal, nicht als Dekoration
- neutraler Grundraum + wenige starke Signalfarben

### 11.4 Hierarchieprinzip
Die Leitzentrale braucht nicht 6 gleich laute Kacheln, sondern:
- 1 Lage-/Prioritätsebene
- 2 starke Hauptarbeitsbereiche
- 1–2 kleinere Schluss-/Kontextbereiche

---

## 12. Was Claude Code jetzt konkret hätte umsetzen sollen

### 12.1 Zuerst — nicht wieder breit bauen
Fokus strikt auf:
1. Leitzentrale
2. Fall
3. Fälle
4. Tenant-Wahrheit
5. OTP-Finish

### 12.2 Leitzentrale neu materialisieren
Nicht nur bestehende Komponenten umstellen, sondern:
- echte neue Leitzentralen-Architektur
- Banner + Lage + Hauptmodule + Abschluss + Wirkung
- keine leeren Räume
- keine gleich starke `Heute`-Spalte
- `Bei uns` als starkes Arbeitsmodul
- `Wartet auf uns` sauber als verschärfte Unterlogik

### 12.3 Fall schärfen
- Lagekarte besser
- nächster Schritt prominent
- Dringlichkeit / Priorität klar
- operativer Fluss erkennbar

### 12.4 Fälle schärfen
- KPI raus
- semantische Filter klar
- Arbeitsraum statt Dashboard

### 12.5 Tenant-Branding reparieren
- Modul-2-Farbe aus echter Referenzwelt
- keine falsche Gold-Migration
- Sichtkonsistenz bei Präfix / Initialen / IDs

### 12.6 Leere Nebenräume entschärfen
- Einsatzplan / Team / Überblick nur sichtbar oder sinnvoll, wenn sie Substanz haben
- keine leeren Prestige-Seiten

### 12.7 OTP final prüfen
- Mailwirkung
- Microcopy
- Fehlerfälle

---

## 13. Umsetzungsreihenfolge — verpflichtend

### Phase 1 — Zielbild vor Code festnageln
Claude Code muss vor Umsetzung kurz schriftlich bestätigen:
- so sieht die Leitzentrale final aus
- so sieht der Fall aus
- so sieht Fälle aus
- so ist Weinberger als Modul-2-Referenz gedacht

### Phase 2 — Umsetzung in dieser Reihenfolge
1. Tenant-/Modul-2-Referenzwelt festhalten und Branding korrekt setzen
2. Leitzentrale bauen
3. Fall-Detail schärfen
4. Fälle-Raum schärfen
5. Betrieb / Nebenräume bereinigen
6. OTP final prüfen / polieren

### Phase 3 — Verifikation
- Weinberger wirkt sichtbar wie Weinberger
- Leitzentrale wirkt wie Führungsraum
- Fall wirkt wie operative Akte
- Fälle wirkt wie Tiefenraum
- keine leeren / peinlichen Räume
- keine Tenant-Brüche
- OTP wirkt hochwertig

---

## 14. Erfolgsdefinition

Das Ergebnis ist nur dann akzeptiert, wenn ein Founder beim Öffnen sagen kann:

- „Das ist mein Werkzeug.“
- „Ich sehe sofort, was wichtig ist.“
- „Das wirkt nicht wie Software, sondern wie Führung.“
- „Das ist hochwertig und ruhig.“
- „Das passt zu meinem Betrieb.“
- „Ich habe Lust, das zu nutzen.“

Wenn das nicht eintritt, ist es trotz funktionierenden Codes nicht fertig.

---

## 15. Schlussanweisung an Claude Code

Bitte diesen Plan **nicht** wie eine Checkliste abarbeiten, ohne ihn zu challengen.  
Du sollst:
- aktiv widersprechen, wenn ein Schnitt schwach ist
- Verbesserungsvorschläge machen
- den Kern priorisieren
- erst Zielbild, dann Umsetzung
- und alles so bauen, dass es als **global skalierbarer Modul-2-Standard** funktioniert

Nicht nur für Weinberger.  
Aber **mit Weinberger als sauberem Referenzfall**.

