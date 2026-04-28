# Stresstest Ergebnis: Leitsystem (OPS Dashboard / Leitzentrale) — 12 ICP-Betriebe

> **Datum:** 2026-04-15
> **Methode:** Systematische Code-Analyse der gesamten Leitsystem-Oberflaeche gegen 12 reale ICP-Betriebe und deren taegliche Nutzungsrealitaet. Click-Count pro Workflow, Persona-Durchspielung (Chef, Buero, Techniker, Prospect), Skalierungsgrenzen.
> **Quellen:** `stresstest_icp_profile.md`, `LeitzentraleView.tsx`, `CaseDetailForm.tsx`, `CreateCaseModal.tsx`, `TechnikerView.tsx`, `FlowBar.tsx`, `SystemCard.tsx`, `CaseListClient.tsx`, `AppointmentPicker.tsx`, `settings/page.tsx`, `kommunikationsmatrix_v2.md`, `sw.js`, `OfflinePage.tsx`
> **Scope:** Nur Analyse + Findings. Kein Code geaendert.
> **Cross-Reference:** `stresstest_ergebnis_voice.md` (Voice Agent Findings F-01 bis F-25)

---

## Zusammenfassung

| Severity | Anzahl | Highlights |
|----------|--------|------------|
| **CRITICAL** | 3 | 200-Case-Limit killt Grosse Betriebe, Techniker-Filter bricht bei Mehrfachzuweisung, Kein Bulk-Assignment |
| **HIGH** | 9 | Auto-Refresh Datenverlust-Risiko, kein "Neue Faelle seit letztem Check", kein Print/Tagesplan, Morning Triage 7+ Klicks/Fall, keine Filterkombination in URL, keine Review-Filterung, Phantom-Faelle (Voice F-01) verschaerft im Leitsystem, Prospect Empty State schwach, Techniker kann nicht "Done" markieren mit 1 Klick |
| **MEDIUM** | 10 | Kein Kalender-Ueberblick (6 Techniker / 15 Jobs), keine Offline-Daten fuer Techniker, Suchfeld kein Auto-Submit, Mobile Pagination zu klein (8 Cases), kein Multi-User-Schutz bei gleichzeitiger Bearbeitung, AppointmentPicker hat keinen Team-Kalender, keine Sortierung nach Termin, kein Quick-Status-Toggle in Tabelle, keine Techniker-Notizen am Handy, kein "Zuletzt bearbeitet"-Indikator |
| **LOW** | 5 | CSV-Export nur Desktop, kein Dark Mode, SystemCard (Ring) wird durch FlowBar ersetzt und noch geladen, keine Keyboard-Shortcuts, keine Case-Prioritaets-Farbe in Mobile-Liste |

**Gesamturteil:** Das Leitsystem ist ueberraschend vollstaendig fuer ein MVP. Einzelne Persona-Workflows (Chef auf Handy, Techniker im Feld) funktionieren gut. Die kritischen Findings betreffen Skalierung (200-Case-Limit), den taeglichen Buero-Workflow (Bulk-Assignment fehlt, Morning-Triage zu viele Klicks) und einen echten Bug (Techniker-Filter bei Mehrfachzuweisung). Bei Solo-Betrieben und Klein-Betrieben (<5 MA) ist das System bereits produktiv einsetzbar. Ab Mittel-Betrieben (>6 MA) werden die HIGH-Findings zu taeglichem Frust.

---

## Persona-Analyse: Wer nutzt was, wie?

### Persona 1: Chef/Inhaber (Beat Meier, Walter Leuthold, Ramon Doerfler)

**Geraet:** Handy (iPhone/Android), zwischen Baustellen
**Nutzungsfrequenz:** 2-5x taeglich, je 1-3 Minuten
**Primaerer Bedarf:** "Was ist passiert seit ich zuletzt geschaut habe?"

**Was funktioniert:**
- FlowBar zeigt sofort die 3 KPIs: Neu / Bei uns / Erledigt — mit Quelle-Breakdown (Tel, Web, Stift)
- Notfall-Badge auf "Bei uns" Node = sofort sichtbar
- Mobile Liste zeigt Kategorie + Kunde + Ort + Status in kompakter Darstellung
- Smart Sort: Notfall > Dringend > Normal > Erledigt — Wichtigstes oben
- App Badge auf Homescreen zeigt Anzahl neuer Faelle seit letztem Oeffnen

**Was fehlt (Persona-spezifisch):**
- Kein "Seit deinem letzten Besuch: X neue Faelle" — der Chef sieht Zahlen, weiss aber nicht ob die 8 in "Neu" seit heute Morgen oder seit 3 Tagen dort sind
- Kein Push bei "dringend" (nur bei "notfall") — Walter verpasst dringende Faelle bis 18:00 (identisch mit Voice-Finding F-07)
- Kein Quick-Triage: Chef kann nicht aus der Liste heraus schnell Status aendern oder zuweisen — muss jeden Fall einzeln oeffnen

---

### Persona 2: Buero-Mitarbeiterin (Sandra bei Weinberger, Anastasia bei Orlandini)

**Geraet:** Desktop (Windows/Mac), geöffnet den ganzen Tag
**Nutzungsfrequenz:** Permanent, 07:30-17:00
**Primaerer Bedarf:** Faelle zuweisen, Termine planen, Kunden benachrichtigen

**Was funktioniert:**
- Desktop-Tabelle mit 7 Spalten: Nr, Kunde, Kategorie, Adresse, Prioritaet, Status, Datum
- Spaltenfilter-Dropdowns (Status, Prioritaet, Kategorie) funktionieren
- Suchfeld durchsucht Name, Ort, PLZ, Strasse, Kategorie, Beschreibung, Status
- Case-Detail hat editierbare Sektionen: Uebersicht, Beschreibung, Kontakt, Notizen
- Staff-Dropdown zeigt alle Mitarbeiter mit Rollen (Admin/Techniker)
- Assignee-Benachrichtigung mit 1 Klick
- Termin-Picker mit Mini-Kalender + Zeitslot-Auswahl + Outlook-Integration
- Kollisions-Warnung bei Doppelbuchung (intern + Outlook)
- Termin versenden an Mitarbeiter (ICS) + Kunde (Email/SMS)
- Review-Anfrage mit Stammkunden-Schutz und Cooldown

**Was fehlt (Persona-spezifisch):**
- **KEIN Bulk-Assignment** — Sandra muss bei 8 neuen Faellen JEDEN einzeln oeffnen, Techniker zuweisen, speichern. Das sind 8 x (Klick auf Fall + Warten auf Laden + Klick "Bearbeiten" + Techniker waehlen + "Benachrichtigen" klicken + Warten + Zurueck) = mindestens 8 x 7 Klicks = 56 Klicks fuer die Morgen-Triage
- **Kein Kalender-Ueberblick** — Sandra sieht Termine nur pro Fall. Wenn sie 15 Jobs auf 6 Techniker verteilen will, muss sie sich jeden Techniker einzeln merken. Kein Gantt-Chart, kein Tagesplan
- **Kein Tagesplan-Druck** — Techniker, die ihren Plan auf Papier wollen (und das sind viele Handwerker), haben keine Print-Ansicht der Tagestermine
- **Kein Quick-Status-Toggle** — Sandra kann den Status nicht direkt in der Tabelle aendern, muss immer den Fall oeffnen

---

### Persona 3: Techniker (Feldarbeiter mit Handy)

**Geraet:** Handy, zwischen Jobs
**Nutzungsfrequenz:** 2-3x taeglich, 30-60 Sekunden
**Primaerer Bedarf:** "Was ist mein naechster Job? Wo? Was ist das Problem?"

**Was funktioniert:**
- TechnikerView mit eigener FlowBar: Bei mir / Heute / Erledigt
- "Naechster Einsatz" mit Uhrzeit + Adresse + Google-Maps-Navigation-Button ("Nav")
- Klickbare Telefonnummer im Case-Detail (tel: Link)
- Google-Maps-Link fuer Adresse im Case-Detail
- Faelle sind nach Prioritaet sortiert (Notfall oben)
- Smart filter: "Bei mir" zeigt nur offene, "Heute" zeigt nur terminierte

**Was fehlt (Persona-spezifisch):**
- **Techniker kann Case-Status nicht mit 1 Klick aendern** — muss Fall oeffnen → Bearbeiten klicken → Status-Dropdown → "Erledigt" → Speichern. 5 Klicks statt 1 Swipe.
- **Keine Notizen vom Handy schnell hinzufuegen** — "Arbeit erledigt, Ventil getauscht" muss ueber Bearbeiten → Notizen-Sektion gehen. Keine Quick-Note-Funktion.
- **Kein Foto-Upload aus der Falluebersicht** — Techniker muss Fall oeffnen → Anhang-Sektion finden → Hochladen. 4+ Klicks.
- **Keine Offline-Daten** — Service Worker liefert nur Offline-Fallback-Seite "Keine Verbindung". Techniker im Keller ohne Signal sieht nichts. Kein Cache der zugewiesenen Faelle.

---

### Persona 4: Prospect (Trial, Tag 1-14)

**Geraet:** Handy oder Desktop
**Nutzungsfrequenz:** Tag 1: neugierig, Tag 5: schon weniger, Tag 10: vergessen
**Primaerer Bedarf:** "Was kann dieses System?"

**Was funktioniert:**
- FlowBar zeigt KPIs (0/0/0 am Tag 1 — korrekt)
- "Neuer Fall" Button ist prominent
- Push-Onboarding-Banner wird angezeigt
- Prospect-View hat vereinfachte Case-Detail-Ansicht (nur Status aendern)

**Was fehlt (Persona-spezifisch):**
- **Empty State ist zu duerftig** — Bei 0 Faellen steht nur "Keine Faelle gefunden." Das ist eine verpasste Chance. Es fehlt: "Rufen Sie Ihre Testnummer an, um den ersten Fall zu erzeugen" oder ein Demo-Walkthrough.
- **KPIs bei 3 Test-Cases sinnlos** — FlowBar zeigt "3 Neu | 0 Bei uns | 0 Erledigt" — die Ring-Visualisierung oder der Flow macht bei 3 Faellen keinen Sinn. Es fehlt ein "Starter Mode" der erklaert was die Zahlen bedeuten werden.
- **Prospect kann keine Review-Anfrage senden** — korrektes Verhalten (Fall muss erledigt sein), aber der Prospect will das Feature testen und sieht keinen Weg.

---

## CRITICAL Findings

### L-01: 200-Case-Limit killt Grosse Betriebe nach 2-4 Wochen

**Problem:** `cases/page.tsx` Zeile 51: `.limit(200)` — Das Leitsystem laedt maximal 200 Faelle aus Supabase. Die Filterung (Periode, Status, Node-Klick) passiert komplett client-seitig auf diesen 200 Faellen.

**Rechnung:**
- Weinberger AG: 25-30 Kontakte/Tag → 8-10 Cases/Tag (Voice) + 2-3 Manuell = ~12 Cases/Tag
- Bei 20 Arbeitstagen/Monat: 240 Cases/Monat
- **Nach 16 Arbeitstagen sind 200 Cases erreicht.** Ab dann fehlen die aeltesten Faelle.
- Waelti & Sohn: 20+ Einsaetze/Tag → noch schneller am Limit

**Konkretes Szenario:** Sandra bei Weinberger oeffnet am 17. Arbeitstag den Leitstand und wechselt auf "30 Tage". Sie sieht nur 200 Faelle, die aeltesten 40+ fehlen. Schlimmer: FlowBar-Zahlen (Eingang, Erledigt) basieren auf den geladenen 200 Cases und sind FALSCH — sie zeigen weniger als real vorhanden.

**Warum CRITICAL:** Die KPIs, auf denen der Chef seine Entscheidungen basiert ("Wie viele Faelle haben wir diese Woche erledigt?"), sind ab 200 Cases nachweislich falsch. Das System luegt, ohne es zu zeigen.

**Betroffene Betriebe:**
- Weinberger AG: Limit nach ~16 Arbeitstagen
- Waelti & Sohn: Limit nach ~10-14 Arbeitstagen
- Geiger AG: Limit nach ~15 Arbeitstagen
- Orlandini: Limit nach ~20 Arbeitstagen (grenzwertig)
- Solo/Klein-Betriebe (Leuthold, Doerfler): KEIN Problem (5-10 Cases/Tag bei max 4-5 neuen)

**Severity:** CRITICAL

**Fix:** Server-seitige Aggregation fuer KPIs (SQL COUNT queries, bereits teilweise vorhanden: `statsNeueQuery`, `statsErledigtQuery` etc.). Fuer die Falltabelle: Server-seitige Pagination mit Filtern als Query-Parameter. Die KPI-Queries in `page.tsx` sind bereits korrekt server-seitig — aber FlowBar rechnet nochmal client-seitig auf den 200 Cases.

**CC kann autonom fixen:** Teilweise — KPI-Korrektur (Server-Aggregation nutzen statt Client-Rechnung) ist machbar. Volle Server-seitige Pagination ist ein groesserer Umbau.

---

### L-02: Techniker-Filter bricht bei Mehrfach-Zuweisung

**Problem:** `cases/page.tsx` Zeile 62: `casesQuery.eq("assignee_text", ctx.displayName)` — Der Techniker-Filter nutzt exaktes String-Matching auf `assignee_text`. Aber das Assignee-Feld erlaubt Multi-Select (mehrere Techniker pro Fall, komma-separiert: "Ramon D., Luzian D.").

**Konkretes Szenario:** Bei Doerfler AG wird ein Spenglerei-Fall an "Luzian D., Ramon D." zugewiesen (beide benoetigt). Luzian loggt sich als Techniker ein. Der Filter sucht `assignee_text = "Luzian D."`, findet aber `"Luzian D., Ramon D."` — **der Fall wird NICHT angezeigt.**

**Impact:** Der Techniker sieht seine zugewiesenen Faelle NICHT, wenn er zusammen mit einem anderen Techniker zugewiesen ist. Bei einem 15-MA-Betrieb (Weinberger, Waelti) wo Teams zusammenarbeiten, ist das ein regelmaeiger Fall.

**Betroffene Betriebe:**
- Alle Betriebe ab 3+ Techniker (Doerfler, Orlandini, Schaub, Leins, Stark, Weinberger, Waelti, Geiger)
- Solo-Betriebe: Nicht betroffen (nur 1 Person)

**Severity:** CRITICAL (Techniker verpasst zugewiesene Arbeit)

**Fix:** `eq` durch `ilike` oder `cs` (contains) ersetzen: `.ilike("assignee_text", `%${ctx.displayName}%`)` oder besser: Assignee in eigene Junction-Table auslagern (langfristig).

**CC kann autonom fixen:** Ja — 1-Zeilen-Fix im Query.

---

### L-03: Kein Bulk-Assignment — Buero-Workflow bricht bei >5 neuen Faellen

**Problem:** Es gibt keinen Mechanismus, um mehrere Faelle gleichzeitig einem Techniker zuzuweisen. Jeder Fall muss einzeln geoeffnet, bearbeitet und gespeichert werden.

**Click-Count fuer Sandra bei Weinberger, Montag-Morgen, 8 neue Faelle:**

| Schritt | Aktion | Klicks |
|---------|--------|--------|
| 1 | Klick auf Fall in Tabelle | 1 |
| 2 | Warten auf Seitenladung | — |
| 3 | Klick "Bearbeiten" (Stift-Icon bei Uebersicht) | 1 |
| 4 | Klick auf Staff-Dropdown | 1 |
| 5 | Techniker auswaehlen | 1 |
| 6 | "Benachrichtigen" klicken | 1 |
| 7 | Warten auf Benachrichtigung | — |
| 8 | "Speichern" klicken | 1 |
| 9 | Zurueck-Button oder Breadcrumb | 1 |
| **Pro Fall:** | | **7 Klicks** |
| **8 Faelle:** | | **56 Klicks + 8 Seitenladungen** |

**Zeitaufwand:** ~15-20 Sekunden pro Fall (inkl. Laden + Denken) = 2-3 Minuten fuer 8 Faelle. Bei Weinberger mit 12 neuen Faellen: 3-4 Minuten reine Klick-Arbeit.

**Vergleich mit Konkurrenz/Excel:** Sandra in einem Betrieb OHNE System: Papier-Liste, Stift, 8 Namen hinschreiben = 30 Sekunden. FlowSight ist hier LANGSAMER als Papier.

**Betroffene Betriebe:**
- Mittel: Orlandini (6-8 Faelle/Morgen), Schaub (8-10), Leins (6-8), Stark (5-8)
- Gross: Weinberger (8-12/Morgen), Waelti (10-15), Geiger (8-12)
- Solo/Klein: Weniger betroffen (1-3 Faelle/Morgen)

**Severity:** CRITICAL (taeglicher Frust fuer Buero-Persona, Kern-Workflow)

**Fix:** Checkboxen in der Falltabelle + "Zuweisen an..." Dropdown oben. Minimale Version: Multi-Select + Batch-Status/Batch-Assignee-Update per API. Dazu gehoert ein neuer API-Endpoint `PATCH /api/ops/cases/batch`.

**CC kann autonom fixen:** Ja, aber groesserer Umbau (UI + API).

---

## HIGH Findings

### L-04: Auto-Refresh (30s) kann Datenverlust verursachen waehrend Bearbeitung

**Problem:** `LeitzentraleView.tsx` Zeile 268-271: `setInterval(() => router.refresh(), 30_000)` — Alle 30 Sekunden wird `router.refresh()` aufgerufen. Dies re-rendert Server Components mit frischen DB-Daten. React Client State (Filter, Suchfeld, Scroll-Position) bleibt laut Next.js erhalten.

ABER: `CaseDetailForm.tsx` hat einen `beforeunload`-Handler (Zeile 299-305) der warnt wenn ungespeicherte Aenderungen vorhanden sind. Der Auto-Refresh in der LeitzentraleView betrifft die Case-Detail-Seite NICHT direkt (separate Route). Allerdings: Wenn Sandra im Case-Detail arbeitet und zeitgleich Thomas im Leitstand den gleichen Fall oeffnet und speichert, sieht Sandra das NICHT — es gibt kein Echtzeit-Locking oder Collision-Detection auf Case-Ebene.

**Konkretes Szenario:** Sandra aendert Status auf "Geplant" + weist Ramon zu. Thomas oeffnet denselben Fall 5 Sekunden spaeter und setzt Status auf "In Arbeit". Sandra speichert → ueberschreibt Thomas' Aenderung. Thomas speichert → ueberschreibt Sandras Zuweisung. Letzter gewinnt.

**Betroffene Betriebe:**
- Weinberger (Sandra + Christian + Teamleiter = 3 simultane User)
- Waelti & Sohn (Buero + 2 Teamleiter)
- Alle Betriebe ab 2 gleichzeitigen Admin-Nutzern

**Severity:** HIGH

**Fix:** Optimistic Locking: `updated_at` als ETag mitsenden, bei PATCH pruefen ob der Case seit dem Laden veraendert wurde. Bei Conflict: Fehlermeldung "Dieser Fall wurde zwischenzeitlich von X bearbeitet. Bitte neu laden."

**CC kann autonom fixen:** Ja — API-Erweiterung + Client-Check.

---

### L-05: Kein "Neue Faelle seit letztem Check" — Chef verliert Ueberblick

**Problem:** Der Chef (Beat, Thomas, Walter) oeffnet den Leitstand auf dem Handy. Er sieht FlowBar: "5 Neu | 3 Bei uns | 12 Erledigt (30 Tage)". Waren die 5 neuen schon heute morgen da, oder sind 3 davon in der letzten Stunde reingekommen?

Das App-Badge (Zeile 276-295) zaehlt "neue Cases seit letztem Oeffnen" und zeigt es auf dem Homescreen-Icon. Aber INNERHALB des Leitsystems gibt es keinen Indikator "3 neue Faelle seit Ihrem letzten Besuch".

**Konkretes Szenario:** Walter (Solo) schaut um 12:30 rein: 3 Faelle. Schaut um 17:00 nochmal: immer noch 3 Faelle sichtbar (die alten sind "Bei uns", 1 neuer kam + 1 wurde erledigt). Er weiss nicht, dass um 14:00 ein neuer Fall kam. Kein visueller Hinweis.

**Betroffene Betriebe:** ALLE, besonders Solo/Klein die nur sporadisch reinschauen

**Severity:** HIGH

**Fix:** Highlight neue Faelle seit letztem Oeffnen (z.B. blauer Punkt neben dem Fall, verschwindet nach 5 Min). Oder: Banner "2 neue Faelle seit 12:30".

**CC kann autonom fixen:** Ja — localStorage Timestamp + CSS-Highlight.

---

### L-06: Kein Print-Tagesplan fuer Techniker

**Problem:** Das `print:` CSS-Prefix wird nur in `CaseDetailForm.tsx` verwendet (einzelner Fall drucken). Es gibt KEINE Funktion, um einen Tagesplan fuer einen Techniker zu drucken: "Techniker X hat heute 5 Termine" mit Adressen, Uhrzeiten, Kundennamen.

**Konkretes Szenario:** Bei Schaub Haustechnik (8-12 MA): Der Teamleiter plant morgens die Einsaetze. 3 Techniker wollen ihren Tagesplan auf Papier (im Bus, im Auto, im Keller ohne Signal). Aktuell muessen sie sich alles merken oder Screenshots machen.

**Betroffene Betriebe:**
- Mittel/Gross: Orlandini, Schaub, Leins, Stark, Weinberger, Waelti, Geiger
- Solo/Klein: Weniger relevant (Chef kennt seine Termine im Kopf)

**Severity:** HIGH

**Fix:** Print-Button in TechnikerView: filtert "Heute" Cases, formatiert als druckbare Liste mit: Uhrzeit, Adresse, Kunde, Kategorie, Maps-QR-Code.

**CC kann autonom fixen:** Ja.

---

### L-07: Morning-Triage Workflow hat zu viele Klicks (Sandra)

**Problem:** Sandras Morgen-Workflow (07:30, 8 neue Faelle verarbeiten) erfordert fuer jeden Fall mindestens 7 Klicks (siehe L-03). Aber selbst das LESEN der Faelle ist ineffizient:

**Schritt-fuer-Schritt fuer Sandra:**
1. Oeffnet Leitsystem → sieht FlowBar "8 Neu" → klickt auf "Neu" ✓ (1 Klick)
2. Tabelle filtert auf neue Faelle ✓ — ABER: Beschreibung ist NICHT in der Tabelle sichtbar
3. Sandra sieht: "Verstopfung | Mueller | Thalwil | Normal | Neu" — reicht das?
4. Um die Beschreibung zu lesen ("WC im 2. OG verstopft, Wasser laeuft ueber"), muss sie den Fall oeffnen (1 Klick + Seitenladen)
5. Jetzt kann sie entscheiden: Dringend? Welcher Techniker?
6. Zurueck → naechster Fall → oeffnen → lesen → entscheiden → zurueck...

**Total fuer 8 Faelle (nur Lesen + Entscheiden, ohne Zuweisen):**
- 8 x (Klick + Laden + Lesen + Zurueck) = 8 x 4 Aktionen = 32 Aktionen
- Zeitaufwand: ~5 Minuten nur zum Sichten

**Vergleich E-Mail-Inbox:** Sandra bekommt 8 Ops-Notification-Emails (E1 aus Kommunikationsmatrix). Jede Email enthaelt Kategorie + Beschreibung + Adresse + Telefon. Sandra kann in der Inbox scrollen und in 60 Sekunden ALLE 8 Faelle sichten, ohne einen einzigen zu oeffnen.

**Das Leitsystem ist hier LANGSAMER als die Benachrichtigungs-Email.**

**Severity:** HIGH

**Fix:** Beschreibung als Hover-Tooltip oder expandierbare Zeile in der Desktop-Tabelle. Oder: Klappbare Preview-Zeile unter jedem Listeneintrag.

**CC kann autonom fixen:** Ja.

---

### L-08: Filtereinstellungen gehen bei Navigation verloren

**Problem:** Filter (Status, Prioritaet, Kategorie, Suchtext, aktiver Node) sind rein als React-State gespeichert. Wenn Sandra einen Fall oeffnet (router.push `/ops/cases/{id}`) und zurueck navigiert, sind alle Filter zurueckgesetzt.

**Konkretes Szenario:** Sandra filtert auf "Neu" + "Notfall" (2 Klicks). Sieht 2 Notfaelle. Oeffnet den ersten, weist zu, geht zurueck. Filter ist weg. Sie muss "Neu" + "Notfall" nochmal setzen um den zweiten zu finden.

**Betroffene Betriebe:** Alle Buero-Nutzer, besonders bei >10 Faellen

**Severity:** HIGH

**Fix:** Filter als URL-Query-Parameter speichern: `?status=new&urgency=notfall&node=eingang`. `CaseListClient.tsx` macht das bereits fuer Suche und Pagination (`useSearchParams`), aber `LeitzentraleView.tsx` nicht.

**CC kann autonom fixen:** Ja.

---

### L-09: Keine dedizierte Review-Filterung — "Welche Faelle brauchen Review-Anfrage?"

**Problem:** Sandra will woechentlich Reviews anfordern. Sie braucht: "Alle erledigten Faelle der letzten 7 Tage, bei denen KEINE Review-Anfrage gesendet wurde." Dieser Filter existiert NICHT.

**Aktueller Workaround:**
1. Klick auf "Erledigt" Node in FlowBar → filtert auf status=done ✓
2. Dann: Jeden Fall einzeln oeffnen und schauen ob Review-Button aktiv ist
3. Es gibt keinen Filter "done + review_sent_at IS NULL"

**Die FlowBar hat zwar "Bewertung" als klickbare Sub-Links** (`bewertung_erhalten`, `bewertung_angefragt`) — aber keinen "bewertung_offen" Node der die Faelle OHNE Review zeigt.

**Konkretes Szenario:** Sandra bei Weinberger will woechentlich 10-15 Reviews anfordern. Sie muss alle erledigten Faelle durchklicken um die ohne Review zu finden. Bei 30+ erledigten Faellen/Monat: 30 Klicks + Lesen + Zurueck.

**Betroffene Betriebe:**
- Waelti & Sohn (237 Reviews — braucht Review-Maschine)
- Weinberger (20 Reviews, will mehr)
- Geiger (40 Reviews)
- Leins (9 Reviews, will wachsen)

**Severity:** HIGH

**Fix:** Neuer Node/Filter: "Review offen" = status=done + review_sent_at IS NULL + hat Kontaktinfo. Zeigt genau die Faelle, die eine Review-Anfrage brauchen.

**CC kann autonom fixen:** Ja.

---

### L-10: Phantom-Faelle aus Voice (F-01) verschaerfen Leitsystem-Noise

**Problem:** Voice-Finding F-01 (Info-Calls erzeugen Phantom-Faelle) hat direkte Auswirkung auf das Leitsystem. Die Phantom-Faelle erscheinen in der Falltabelle und in den KPIs.

**Konkretes Szenario Weinberger, Montagmorgen:**
- 12 Faelle in der Liste
- 4 davon sind Phantom-Faelle (Info-Calls: Oeffnungszeiten, Liefergebiet etc.)
- FlowBar zeigt "12 Neu" — real sind es 8
- Sandra oeffnet jeden, findet 4 mit `category: "Allgemein"`, leere Adresse, sinnlose Beschreibung
- Sie muss 4 Faelle manuell als "Erledigt" markieren oder loeschen
- **Triage-Zeit: 15-20 Minuten statt 5 Minuten** (identisch mit Voice-Ergebnis)

**Zusaetzliches Problem im Leitsystem:** Die Phantom-Faelle sind nicht als solche erkennbar. Es gibt keinen visuellen Unterschied zwischen einem echten Fall und einem Info-Call-Phantom.

**Severity:** HIGH (Verschaerfung von Voice F-01 durch Leitsystem-Kontext)

**Fix:** Primaefix = Voice F-01 (call_type Gate). Leitsystem-seitig: Source-Indikator in der Tabelle (Voice-Symbol, Web-Symbol, Manuell-Symbol) hilft beim Erkennen, ist aber bereits implementiert als Source-Breakdown in FlowBar. In der Tabelle selbst fehlt der Source-Indikator.

**CC kann autonom fixen:** Ja (Voice F-01 ist der Primaerfix).

---

### L-11: Prospect Empty State gibt keine Orientierung

**Problem:** Ein Prospect (Tag 1, 0 Faelle) oeffnet den Leitstand. Er sieht:
- FlowBar: 0 | 0 | 0 mit Sterne "Noch keine"
- Tabelle: "Keine Faelle gefunden."
- "Neuer Fall" Button (prominent, gut)
- Push-Onboarding-Banner

Es fehlt: "Rufen Sie Ihre Testnummer an: 044 XXX XX XX" oder "So funktioniert es: 1. Kunde ruft an → 2. Lisa nimmt auf → 3. Fall erscheint hier"

**Konkretes Szenario:** Prospect bei Stark Haustechnik, Tag 1, hat gerade die Welcome-Email gelesen. Oeffnet den Leitstand. Sieht: nichts. Weiss nicht, was er tun soll. Schliesst den Tab. Kommt am Tag 5 zurueck (wenn ueberhaupt).

**Severity:** HIGH (Trial Conversion Impact)

**Fix:** Empty-State-Component: Wenn `cases.length === 0` und staffRole !== "techniker", zeige: Testnummer-CTA, Wizard-Link, kurze Erklaerung "So fliesst ein Fall durch Ihr System".

**CC kann autonom fixen:** Ja.

---

### L-12: Techniker kann Status nicht mit 1 Klick aendern

**Problem:** TechnikerView zeigt die Fallliste. Um einen Fall als "Erledigt" zu markieren, muss der Techniker:
1. Fall antippen (1 Klick)
2. Warten auf Laden
3. "Bearbeiten" (Stift) antippen (1 Klick)
4. Status-Dropdown auf "Erledigt" (2 Klicks: Dropdown oeffnen + "Erledigt")
5. "Speichern" (1 Klick)
= **5 Klicks + 1 Seitenladen**

**Konkretes Szenario:** Techniker bei Weinberger, auf dem Rueckweg vom Einsatz. Steht an der Ampel. Will schnell "Erledigt" markieren. 5 Klicks sind zu viel — er vergisst es oder macht es spaeter (und vergisst es ganz).

**Betroffene Betriebe:** Alle mit Techniker-Rolle

**Severity:** HIGH

**Fix:** Swipe-to-Done auf Mobile oder Quick-Action-Button (Haekchen-Icon) direkt in der Fallliste.

**CC kann autonom fixen:** Ja.

---

## MEDIUM Findings

### L-13: Kein Team-Kalender fuer Tagesplanung

**Problem:** Die Terminplanung (AppointmentPicker) funktioniert pro Fall: Datum + Uhrzeit + optionale Outlook-Integration. Aber es gibt keinen Ueberblick "Wer hat heute wann was?"

Sandra bei Weinberger plant 15 Jobs auf 6 Techniker. Sie muss sich merken oder auf Papier notieren:
- Ramon: 08:00 Thalwil, 10:00 Horgen, 14:00 Oberrieden
- Michael: 09:00 Adliswil, 11:00 Thalwil
- ...

Die Kollisions-Warnung funktioniert NUR wenn Outlook verbunden ist (Code: `check-collision` API-Endpoint). Ohne Outlook: kein Schutz.

**Severity:** MEDIUM

**Fix:** Team-Kalender-View: Horizontale Zeitleiste pro Techniker, Faelle als Bloecke. Aendert sich mittelfristig, da Outlook-Integration bereits da ist.

**CC kann autonom fixen:** Teilweise (grundlegende Kalender-Ansicht ja, Outlook-Integration ist schon da).

---

### L-14: Keine Offline-Daten fuer Techniker

**Problem:** Service Worker (`sw.js`) cached nur statische Assets und die Offline-Fallback-Seite. Wenn ein Techniker im Keller ohne Signal ist, sieht er nur "Keine Verbindung. Bitte WLAN pruefen."

Er kann NICHT: seine heutigen Faelle sehen, die Adresse nachschauen, den Kundennamen lesen.

**Betroffene Betriebe:** Alle mit Technikern im Feld (= alle ausser reine Buero-Nutzung)

**Severity:** MEDIUM

**Fix:** Cache-first fuer `/ops/cases` und zugewiesene Faelle. IndexedDB oder Cache API mit letztem Fetch-Ergebnis. Komplexer Umbau.

**CC kann autonom fixen:** Nein — architekturelle Entscheidung.

---

### L-15: Mobile Pagination zeigt nur 8 Cases pro Seite

**Problem:** `PAGE_SIZE_MOBILE = 8` (LeitzentraleView.tsx Zeile 68). Bei 15 offenen Faellen braucht Sandra 2 Seiten. Navigieren zwischen Seiten = 1 Klick + Scroll zum Pagination-Control.

**Konkretes Szenario:** Anastasia bei Orlandini auf dem Handy: 12 neue Faelle. Seite 1 zeigt 8, sie muss scrollen und blaettern um die restlichen 4 zu sehen.

**Severity:** MEDIUM

**Fix:** Virtual Scrolling oder "Mehr laden" Button statt harter Pagination. Alternativ: `PAGE_SIZE_MOBILE = 12`.

**CC kann autonom fixen:** Ja (Einfachste: Page Size erhoehen).

---

### L-16: Suchfeld kein Auto-Submit (Leitzentrale)

**Problem:** Das Suchfeld in der LeitzentraleView (`searchQuery` State) filtert SOFORT bei Eingabe (onChange → filter). Gut. ABER: `CaseListClient.tsx` (alternative Fallliste) nutzt ein Formular mit Submit-Button — dort muss man Enter druecken oder "Suchen" klicken.

Inkonsistentes Verhalten zwischen den zwei Ansichten.

**Severity:** MEDIUM

**Fix:** Vereinheitlichen: Beide sollten Live-Filter nutzen (oder beide Submit).

**CC kann autonom fixen:** Ja.

---

### L-17: Kein Multi-User-Conflict-Detection auf Case-Ebene

**Problem:** (Detail zu L-04) Wenn zwei Nutzer denselben Fall gleichzeitig oeffnen und bearbeiten, gibt es KEINEN Hinweis. Der `PATCH /api/ops/cases/{id}` Endpoint macht ein blindes UPDATE.

Das `beforeunload`-Event schuetzt nur vor versehentlichem Tab-Schliessen, nicht vor Server-seitigem Ueberschreiben.

**Severity:** MEDIUM (wird HIGH bei >2 gleichzeitigen Buero-Nutzern)

**Fix:** Optimistic Locking mit `updated_at` Vergleich.

**CC kann autonom fixen:** Ja.

---

### L-18: Keine Sortierung nach Termin in der Falltabelle

**Problem:** Die Tabelle sortiert nach Smart Sort: Notfall > Dringend > Normal > Erledigt, innerhalb gleicher Prioritaet nach Erstelldatum (neueste zuerst). Es gibt KEINE Sortierung nach Termin.

Sandra will sehen: "Welche Faelle haben heute einen Termin?" Sie kann nach Status "Geplant" filtern, sieht aber die Faelle nicht chronologisch nach Terminzeit.

**Severity:** MEDIUM

**Fix:** Sortier-Option "Nach Termin" oder Filter "Heutige Termine".

**CC kann autonom fixen:** Ja.

---

### L-19: Kein Quick-Status-Toggle in der Tabelle

**Problem:** Status aendern erfordert immer: Fall oeffnen → Bearbeiten → Dropdown → Speichern. In der Tabellenansicht gibt es keinen Inline-Toggle.

**Severity:** MEDIUM

**Fix:** Klickbares Status-Badge in der Tabelle oder Context-Menu bei Rechtsklick.

**CC kann autonom fixen:** Ja.

---

### L-20: Techniker kann Notizen nicht schnell hinzufuegen

**Problem:** Vom TechnikerView aus: Fall oeffnen → Scrollen zu Notizen-Sektion → "Bearbeiten" → Text eingeben → Speichern. 5+ Aktionen.

Der Techniker will nach dem Einsatz schnell notieren: "Ventil getauscht, Kunde zufrieden" oder "Brauche Ersatzteil, Rueckruf noetig".

**Severity:** MEDIUM

**Fix:** Quick-Note Input direkt in der Fallliste (z.B. beim Swipe) oder in der Fall-Detail-Ansicht ohne Edit-Mode.

**CC kann autonom fixen:** Ja.

---

### L-21: Kein "Zuletzt bearbeitet" Indikator in der Tabelle

**Problem:** Die Tabelle zeigt das Erstelldatum, nicht das letzte Update-Datum. Sandra kann nicht sehen, welche Faelle kuerzlich bearbeitet wurden.

**Severity:** MEDIUM

**Fix:** "Aktualisiert" Spalte oder visueller Indikator (z.B. gruener Punkt fuer "heute bearbeitet").

**CC kann autonom fixen:** Ja.

---

### L-22: AppointmentPicker braucht Default-Dauer aus Settings

**Problem:** Die Standard-Termindauer (`default_appointment_duration_min`) ist in den Settings konfigurierbar (default: 60 Min). Aber der AppointmentPicker scheint eine fixe Berechnung zu nutzen (`bumpTime` mit hartkodiertem Wert). Die Settings-Dauer muss als Prop durchgereicht werden.

**Severity:** MEDIUM

**Fix:** Settings-Wert in Case-Detail-Page laden und als Prop an AppointmentPicker weiterreichen.

**CC kann autonom fixen:** Ja.

---

## LOW Findings

### L-23: CSV-Export nur auf Desktop

**Problem:** `CaseListClient.tsx` Zeile 219: `className="... hidden sm:block"` — Der Export-Button ist auf Mobile versteckt. Sandra auf dem Handy kann keine Fallliste exportieren.

**Severity:** LOW

**Fix:** Button auch auf Mobile zeigen.

**CC kann autonom fixen:** Ja.

---

### L-24: SystemCard (Ring) wird noch geladen aber durch FlowBar ersetzt

**Problem:** `SystemCard.tsx` existiert noch als eigenstaendige Komponente (Ring-Visualisierung mit 4 klickbaren Nodes). Die aktive Leitsystem-Ansicht nutzt aber `FlowBar.tsx` (horizontaler Flow). SystemCard wird nicht mehr in LeitzentraleView importiert.

**Impact:** Kein funktionaler Impact, aber der Code ist Dead Weight.

**Severity:** LOW

**Fix:** SystemCard.tsx archivieren oder entfernen wenn sicher nicht mehr benoetigt.

**CC kann autonom fixen:** Ja.

---

### L-25: Keine Keyboard-Shortcuts fuer Power-User

**Problem:** Sandra am Desktop tippt den ganzen Tag. Keine Shortcuts fuer:
- `N` = Neuer Fall
- `S` = Suche fokussieren
- Arrow Keys = durch Faelle navigieren
- `Enter` = Fall oeffnen
- `Esc` = Zurueck

**Severity:** LOW

**Fix:** Event-Listener fuer Keyboard-Shortcuts in LeitzentraleView.

**CC kann autonom fixen:** Ja.

---

### L-26: Keine Case-Prioritaets-Farbe in Mobile-Liste

**Problem:** Die Mobile-Fallliste zeigt die Prioritaet nicht farblich an. Auf Desktop zeigt das URGENCY_DOT (roter/gelber/grauer Punkt) die Prioritaet. Auf Mobile fehlt dieser Indikator — nur der Status-Badge ist sichtbar.

Korrektur: Notfall-Faelle haben ein rotes Border-Left (`border-l-4 border-l-red-500 bg-red-50/30`) auf Mobile. Dringende Faelle haben aber KEINEN visuellen Unterschied zu normalen.

**Severity:** LOW

**Fix:** Urgency-Dot auch in Mobile-Liste zeigen.

**CC kann autonom fixen:** Ja.

---

### L-27: Kein Dark Mode

**Problem:** Techniker auf naechtlichem Pikett-Einsatz oeffnet den Leitstand: weisser Bildschirm blendet.

**Severity:** LOW

**Fix:** TailwindCSS Dark Mode. Aufwandig fuer alle Komponenten.

**CC kann autonom fixen:** Ja, aber hoher Aufwand.

---

## Szenario-Durchspielung: Stress-Montag pro Groessenklasse

### Solo-Betrieb: Walter Leuthold (1 MA)

**Montag 06:45 — Walter checkt Handy:**
Oeffnet Leitstand-PWA. Sieht FlowBar: 3 Neu | 0 Bei uns | 0 Erledigt.

- Fall 1: "Boilerentkalkung, Mueller, Oberrieden, Normal" — Walter denkt: "Mach ich Donnerstag"
  → Problem: Walter kann den Status NICHT auf "Geplant" setzen ohne den Fall zu oeffnen (L-12, L-19)
  → Walter oeffnet den Fall (1 Klick + Laden), tippt auf "Bearbeiten" (1 Klick), Status → "Geplant" (2 Klicks), Speichern (1 Klick) = 5 Klicks
- Fall 2: "Rohrbruch, Suter, Kilchberg, Notfall" — rote Markierung ✓, Walter sieht es sofort
  → Er tippt auf den Fall (1 Klick), sieht Telefonnummer, tippt drauf → Anruf ✓ (tel: Link funktioniert)
- Fall 3: Phantom-Fall (Oeffnungszeiten-Anfrage) — "Allgemein, —, —, Normal"
  → Walter oeffnet den Fall, liest "Sind Sie samstags erreichbar?" — das ist kein Fall!
  → Er muss manuell Status auf "Erledigt" setzen: 5 Klicks verschwendet

**Total Zeitaufwand: ~2 Minuten fuer 3 Faelle (davon 1 Phantom)**
**Urteil:** Funktioniert, aber Phantom-Faelle und fehlender Quick-Status-Toggle nerven.

---

### Klein-Betrieb: Doerfler AG (4-5 MA)

**Montag 12:30 — Ramon checkt auf Handy:**
FlowBar: 5 Neu | 2 Bei uns | 0 Erledigt.

- Problem 1: Ramon sieht "Sanitaer allgemein, Meier, Richterswil" — ist das Sanitaer oder Spenglerei? (Voice F-05: Kategorien zu schmal). Er muss den Fall oeffnen um die Beschreibung zu lesen: "Dachrinne undicht". Das ist Luzians Job!
- Problem 2: Ramon kann Luzian NICHT zuweisen ohne den Fall zu oeffnen (L-03)
- Problem 3: 1 Phantom-Fall (F-01) unter den 5

**Spezifisches Doerfler-Problem:** Ramon und Luzian teilen sich die Faelle (Sanitaer vs. Spenglerei). Es gibt KEINEN Filter fuer "Spenglerei-Faelle" weil die Kategorie fehlt. Luzian muesste als Techniker eingeloggt sein, sieht dann aber NUR seine zugewiesenen Faelle — die noch nicht zugewiesenen (neuen) sieht er NICHT.

**Duo-Geschaeftsfuehrung:** Beide brauchen Admin-Zugang um neue Faelle zu sichten. Funktioniert, aber kein Team-Filter.

**Total Zeitaufwand: ~3 Minuten fuer 5 Faelle**
**Urteil:** Brauchbar, aber Kategorien und fehlende Quick-Triage bremsen.

---

### Mittel-Betrieb: Orlandini (6-10 MA)

**Montag 07:30 — Anastasia oeffnet Desktop:**
FlowBar: 8 Neu | 5 Bei uns | 3 Erledigt (30 Tage).

**Workflow:**
1. Klickt auf "Neu" → Tabelle filtert auf 8 neue Faelle ✓
2. Sieht Spalten: Nr | Kunde | Kategorie | Adresse | Prioritaet | Status | Datum
3. Problem: Kann nicht sehen ob "Heizung, Mueller, Horgen" eine Reparatur oder eine Beratung ist (L-07: keine Beschreibung in Tabelle)
4. Oeffnet Fall 1: Liest Beschreibung, weist Techniker Marco zu: 7 Klicks
5. Fall 2, 3, 4... jeweils 7 Klicks
6. Fall 5: Reklamation "Heizung funktioniert immer noch nicht" — sieht aus wie normaler Fall (Voice F-06)
   → Anastasia erkennt es NICHT als Reklamation, priorisiert normal, Kunde wartet bis nachmittag → negative Google Review bei 3.8★-Betrieb
7. Fall 6, 7: Phantom-Faelle (F-01) → je 5 Klicks zum Schliessen
8. Fall 8: Echter Fall, Zuweisung

**Total: 8 Faelle x ~7 Klicks = 56 Klicks + 2 Phantom x 5 Klicks = 66 Klicks**
**Zeitaufwand: 5-7 Minuten**

**Nachmittag 14:00 — Anastasia will Termine fuer morgen planen:**
- Oeffnet jeden Fall einzeln → AppointmentPicker → Datum/Zeit → Speichern → "Termin versenden" → Naechster Fall
- Bei 6 Terminen: 6 x (Fall oeffnen + Bearbeiten + Termin setzen + Senden + Zurueck) = 6 x 10+ Klicks = 60 Klicks
- Kein Ueberblick ob Marco und Paolo Ueberschneidungen haben (L-13)

**Urteil:** Funktional, aber Buero-Workflow ist zu klick-intensiv. Ab 10+ Faellen/Tag wird es zum taeglichen Aerger.

---

### Gross-Betrieb: Weinberger AG (15-25 MA)

**Montag 07:00 — Morgen-Briefing:**
Sandra oeffnet Desktop-Leitstand: FlowBar: 12 Neu | 8 Bei uns | 15 Erledigt (30 Tage).

**Problem 1: 200-Case-Limit (L-01)**
Es ist Woche 4. Weinberger hat ca. 190 Cases in Supabase. Noch knapp unter dem Limit. In 1 Woche wird es knapp. Sandra weiss davon nichts.

**Problem 2: Triage (L-03, L-07, L-10)**
- 12 neue Faelle, davon 4 Phantom (F-01) → Sandra muss alle 12 durchgehen
- 1 Offertanfrage Badsanierung (CHF 40'000) als "Sanitaer allgemein, normal" (Voice F-18) → Sandra priorisiert nicht
- 1 Reklamation als normaler Fall (Voice F-06) → wird nicht eskaliert
- 2 Duplikate (Voice F-11) → Sandra merkt es erst wenn sie beide oeffnet
- **Effektive Triage: 6 echte Faelle aus 12 Eintraegen herausfiltern**
- **Aufwand: 12 x 7 Klicks (Oeffnen + Lesen + Zuweisen) = 84 Klicks, ~10-15 Minuten**

**Problem 3: Team-Disposition (L-13)**
Sandra plant 18 Einsaetze auf 15 Techniker. Kein Kalender-Ueberblick. Sie nutzt parallel ein Excel-Sheet oder Whiteboard.

**Problem 4: Review-Management (L-09)**
Freitag nachmittag will Sandra die Wochen-Reviews anfordern. Sie muss durch alle erledigten Faelle klicken um die ohne Review zu finden. Kein Filter dafuer.

**Problem 5: Chef-Report (L-05)**
Christian (Chef) schaut um 17:00 rein. FlowBar: "12 Neu | 5 Bei uns | 18 Erledigt". Waren die 12 alle heute? Wie viele Faelle hat das Team diese Woche geschlossen? Er kann auf "30 Tage" umschalten, sieht aber keine Trennung nach Tagen.

**Urteil:** Funktional, aber fuer einen 15-25 MA-Betrieb fehlen Bulk-Operationen, Kalender-Ueberblick und Server-seitige KPIs. Sandra wuerde nach 2 Wochen fragen: "Kann ich das nicht einfacher machen?"

---

## Skalierungs-Stresstest

| Groessenklasse | Cases/Tag | Cases/Monat | 200-Limit | Buero-Klicks/Tag | Bottleneck |
|----------------|-----------|-------------|-----------|------------------|------------|
| **Solo** (1 MA) | 3-5 | 60-100 | Kein Problem | 15-25 | Keiner — System passt |
| **Klein** (2-5 MA) | 5-10 | 100-200 | Grenzwertig nach 4-8 Wochen | 35-70 | Kategorien, Quick-Status |
| **Mittel** (6-15 MA) | 12-20 | 240-400 | **BRICHT nach 2-4 Wochen** | 84-140 | Bulk-Assignment, Kalender |
| **Gross** (15-25 MA) | 20-35 | 400-700 | **BRICHT nach 1-2 Wochen** | 140-245 | ALLES: Limit, Bulk, Kalender, Reviews |

---

## Feature-Matrix: Was funktioniert, was fehlt?

| Feature | Solo | Klein | Mittel | Gross | Status |
|---------|------|-------|--------|-------|--------|
| FlowBar KPIs | ✓ | ✓ | ✓* | ✓* | *Ab 200 Cases falsch |
| Falliste + Suche | ✓ | ✓ | ✓ | ✓ | OK |
| Filter (Status/Prio/Kat) | ✓ | ✓ | ✓ | ✓ | OK |
| Case Detail + Edit | ✓ | ✓ | ✓ | ✓ | OK |
| Techniker-Zuweisung | ✓ | ✓ | ✓* | ✓* | *Multi-Assign Bug L-02 |
| Bulk-Assignment | — | — | FEHLT | FEHLT | L-03 CRITICAL |
| Termin-Picker | ✓ | ✓ | ✓ | ✓ | OK (Einzelfall) |
| Team-Kalender | — | — | FEHLT | FEHLT | L-13 MEDIUM |
| Outlook-Kollision | Opt | Opt | ✓ | ✓ | OK wenn verbunden |
| Termin versenden | ✓ | ✓ | ✓ | ✓ | OK (Email + SMS + ICS) |
| Review-Anfrage | ✓ | ✓ | ✓ | ✓ | OK |
| Review-Filter | — | — | FEHLT | FEHLT | L-09 HIGH |
| Push Notfall | ✓ | ✓ | ✓ | ✓ | OK |
| Push Dringend | FEHLT | FEHLT | FEHLT | FEHLT | Voice F-07 |
| Techniker-View | — | — | ✓* | ✓* | *Multi-Assign Bug L-02 |
| Print/Tagesplan | — | — | FEHLT | FEHLT | L-06 HIGH |
| Offline-Daten | FEHLT | FEHLT | FEHLT | FEHLT | L-14 MEDIUM |
| Empty State (Prospect) | SCHWACH | SCHWACH | — | — | L-11 HIGH |
| CSV-Export | ✓ (Desktop) | ✓ | ✓ | ✓ | OK |
| Manuel Case Create | ✓ | ✓ | ✓ | ✓ | OK (mit Foto) |
| Settings | ✓ | ✓ | ✓ | ✓ | OK |
| Staff Management | — | ✓ | ✓ | ✓ | OK |

---

## ICP-spezifische Risikomatrix

| Betrieb | Groesse | Top-Risiken im Leitsystem | Schlimmster Montag |
|---------|---------|--------------------------|-------------------|
| Walter Leuthold | Solo | L-05 (kein "neu seit"), L-12 (5 Klicks fuer Done) | Walter oeffnet 3 Faelle einzeln, 15 Klicks fuer 3 Faelle. 1 Phantom. |
| MPM Haustechnik | Micro | L-11 (Empty State), L-12 | Chef sieht leeren Leitstand, schliesst Tab, vergisst das System. |
| Doerfler AG | Klein | L-02 (Multi-Assign Bug!), L-07, Voice F-05 (Kategorien) | Luzian eingeloggt als Techniker — sieht KEINE Faelle weil alle an "Ramon D., Luzian D." zugewiesen. |
| Beeler | Klein | L-11 (Prospect Empty State), L-12 | Prospect Tag 1: leerer Leitstand, keine Erklaerung. |
| Benzenhofer | Klein | L-11, L-12, Voice F-05 | Alle Faelle "Heizung". Kein Unterschied Reparatur vs. Wartung. |
| Orlandini | Mittel | L-03 (Bulk fehlt), L-07 (Triage Klicks), Voice F-06 (Reklamation) | Anastasia braucht 7 Min fuer 8 Faelle. 1 uebersehene Reklamation bei 3.8-Stern-Betrieb. |
| Schaub | Mittel | L-03, L-06 (Print), L-13 (Kalender) | 8-12 Techniker planen ohne Ueberblick. Doppelbuchung wahrscheinlich. |
| Leins AG | Mittel | L-09 (Review-Filter), L-07 | Michael will Reviews steigern — kein Weg, offene Reviews schnell zu finden. |
| Stark | Mittel | L-05 (kein "neu seit"), L-12, Voice F-07 (Push) | Inhaber auf Baustelle, sieht dringende Faelle erst abends. |
| Weinberger AG | Gross | **L-01 (200-Limit)**, L-03 (Bulk), L-04 (Multi-User), L-09 (Reviews) | Sandra braucht 15 Min fuer Morgen-Triage. KPIs nach 3 Wochen falsch. Reklamation uebersehen. |
| Waelti & Sohn | Gross | **L-01 (200-Limit)**, L-03, L-09 (237 Reviews = braucht Review-Maschine) | 20+ Faelle/Tag, Limit in 10 Tagen erreicht. Review-Management ohne Filter unmoeglich. |
| Geiger AG | Gross | L-01, L-03, L-13 (Kalender) | 10-15 Techniker ohne Team-Kalender-Ueberblick. |

---

## Recommendations: Top 5 Fixes (Prioritaetsreihenfolge)

| # | Finding | Aufwand | Impact | Empfehlung |
|---|---------|---------|--------|------------|
| 1 | **L-02: Techniker-Filter Fix** (ilike statt eq) | 15 min | Behebt 100% Techniker-Sichtbarkeits-Bug bei Multi-Assign | CC autonom, SOFORT |
| 2 | **L-01: 200-Case-Limit** (Server-KPIs nutzen, Limit erhoehen) | 2-3h | Verhindert falsche KPIs bei Mittel/Gross-Betrieben | CC autonom, diese Woche |
| 3 | **L-03: Bulk-Assignment** (Checkboxen + Batch-API) | 4-6h | Halbiert Buero-Triage-Zeit | CC autonom, diese Woche |
| 4 | **L-07: Beschreibung in Tabelle** (Hover/Expand) | 1-2h | Eliminiert "oeffnen nur zum Lesen" Workflow | CC autonom, diese Woche |
| 5 | **L-11: Prospect Empty State** (CTA + Erklaerung) | 1h | Trial Conversion Impact | CC autonom, diese Woche |

### Weitere Fixes (Naechste Woche)

| # | Finding | Aufwand | Empfehlung |
|---|---------|---------|------------|
| 6 | L-05: "Neue Faelle seit letztem Check" | 1h | CC autonom |
| 7 | L-08: Filter in URL | 2h | CC autonom |
| 8 | L-09: Review-Filter | 1h | CC autonom |
| 9 | L-12: Quick-Done fuer Techniker | 2h | CC autonom |
| 10 | L-06: Print-Tagesplan | 2h | CC autonom |

---

## Cross-Reference: Voice Findings mit Leitsystem-Impact

| Voice Finding | Leitsystem-Auswirkung | Leitsystem-Fix noetig? |
|---------------|----------------------|----------------------|
| F-01: Phantom-Faelle | KPI-Noise, Triage-Aufwand +30% | Nein (Voice Fix reicht) |
| F-05: Kategorien zu schmal | Techniker sieht falsche Kategorie, Zuweisung verzögert | Nein (Template-Fix) |
| F-06: Reklamation nicht markiert | Uebersehene Reklamationen im Leitstand | Optional: Reklamations-Badge im Leitstand |
| F-07: Push nur bei Notfall | Solo/Klein-Betriebe verpassen dringende Faelle | Optional: Push-Settings erweiterbar machen |
| F-09: Defekte Faelle (Hangup) | Cases ohne Adresse in der Tabelle | Optional: "Unvollstaendig"-Indikator |
| F-11: Duplicate Cases | Sandra sieht Duplikate, weist beide zu | Optional: Duplicate-Warning im Leitstand |

---

## Was FUNKTIONIERT (Positiv-Befunde)

Diese Features sind gut implementiert und bestehen den Stresstest:

1. **Smart Sort** — Notfall oben, Erledigt unten. Chef sieht das Wichtigste zuerst.
2. **FlowBar** — Klickbare KPIs mit Source-Breakdown. Intuitiv, aesthetisch.
3. **Telefon-Link** — `tel:` im Case-Detail. Chef tippt einmal, Anruf laeuft. Kritisch fuer Handwerker.
4. **Google-Maps-Link** — Techniker klickt, Navigation startet. 1 Klick von Fall zu Route.
5. **Termin-Versand** — ICS + Email + SMS in einer Aktion. Endkunde UND Techniker informiert.
6. **Assignee-Benachrichtigung** — 1 Klick, Email + Push. Techniker weiss sofort Bescheid.
7. **Review-System** — Stammkunden-Schutz, Cooldown, Max 2x/Fall. Durchdacht.
8. **Collision-Detection** — Outlook-Integration warnt bei Doppelbuchung. Premium-Feature.
9. **PWA** — Installierbar, App-Badge auf Homescreen. Fuer Handwerker der richtige Ansatz.
10. **RBAC** — Admin sieht alles, Techniker nur seine Faelle (wenn Fix L-02 greift). Prospect: eingeschraenkt.
11. **Auto-Refresh** — 30s Polling haelt Daten frisch ohne manuelles Neuladen.
12. **Beforeunload-Warnung** — Schuetzt vor versehentlichem Datenverlust.
13. **Period Toggle** — 7d / 30d / Jahresansicht. Flexible Zeitraum-Auswahl.
14. **Category Filter** — Dropdown aus realen Daten. Keine leeren Optionen.
15. **Source Breakdown** — Tel/Web/Stift in FlowBar. Chef sieht woher die Faelle kommen.

---

*Erstellt: 2026-04-15 | Methode: Code-Analyse + Persona-Durchspielung (4 Personas x 12 ICP-Betriebe) + Click-Count | Naechster Schritt: Top 5 Fixes umsetzen, beginnend mit L-02 (15 Min Fix)*
