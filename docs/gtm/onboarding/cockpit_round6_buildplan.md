# Cockpit — Runde-6-Build-Plan (Founder „Feedback Layer Eingang", 08.06.)

> Kompressionssicher. Quelle: `Feedback Layer Eingang.txt` (Founder, ~3h Sprachnachricht) + CC-IST-Analyse
> + Founder-Freigaben in diesem Chat. **Reihenfolge: Backend → Name → UI Strang-für-Strang → Website.**
> Founder-Freigaben: **1 ja · 2 ja · 3 ja · Headline #1.**

## 🤖 AUTONOMIE-VERTRAG (08.06., Founder-Freigabe „arbeite selbstständig ab")
> CC arbeitet die R7-Queue eigenständig top-down ab. Garantie gegen Wissensverlust = dieser Plan als externes Gehirn.
1. **Geordnete Queue + Abnahme-Kriterium pro Punkt** (unten). Top-down. Selbst-Check: tsc grün · Build grün · Sichtprüfung prod nach Deploy.
2. **Entscheidungs-Grenze** (`feedback_founder_findings`): SYSTEM/POLISH → autonom bauen. Echte Produkt-Gabelung → Finding+Optionen+Empfehlung vorlegen, währenddessen am nächsten Punkt weiter (nicht blockieren).
3. **Deploy + Doc-Sync pro Batch**, dann nächster Punkt — ohne Zwischenfrage. Nach jedem Punkt Protokoll-Zeile unten.
4. **Frischer Branch pro Runde** off aktuellem `main` (kein Recommit auf gemergten Branch → kein Squash-Konflikt). R7-Branch: `feat/cockpit-r7-feedbackbox`.

## 📋 R7-QUEUE (selbstständig, in dieser Reihenfolge)
- [ ] **A — Website-Umbau** (grösster Brocken): Q2 „Haben Sie Website?" RAUS · neuer harter Punkt 1 „Spielt Online-Meldeformular eine Rolle? Ja/Nein" (Nein→bestätigen→Strang fertig) · Integrations-Karte (intern/Agentur + welche · ersetzen/ergänzen · wer kümmert sich) · 1-2-3-Ordnung. *Fertig wenn: tsc+build grün, alle Felder im draft.wizard, promote schreibt sie, prod-Sicht.*
- [ ] **B — Badge-Fix:** SW echte Zahl (offene Fälle + pending Nachrichten) · stiller Push f. Nachrichten · `setAppBadge` mit Server-`badgeCount` · beim Öffnen echte Zahl · In-App Nav-Zähler (Leitzentrale·Nachrichten) + „neu"-Marker. *Fertig wenn: Push trägt badgeCount, Handy zeigt Zahl.*
- [ ] **C — Detail-Politur:** Vor-Ort-Icon Haustür (Emoji-vs-SVG-Konsistenz alle 3 Strang-Icons) · per-Stern strang-spezifische Beispiel-Placeholder (2 Sani je Strang; Ausnahme „So meldet sich" minimal) · 1-2-3-Ordnung übrige Stränge · Reagieren-Symbol 🎧. *Fertig wenn: prod-Sicht je Strang.*
- Voice VA1-3 separat (Pre-Go-live, ticketlist) — NICHT in R7.

## 📝 R7-PROTOKOLL
- 08.06. | R6 LIVE (#590, main@167790a). Auflege-Button ENTSCHIEDEN: bleibt gebündelt mit Test-Call-Comeback nach VA1-3 (kein Standalone, da keine Anruf-Oberfläche existiert). Branch `feat/cockpit-r7-feedbackbox` off main. Start: A Website.

## ✅ ERLEDIGT (Stand 08.06.)
- **Nachrichten-Nav-Fix** (war nicht verlinkt) — LIVE (#588).
- **Batch 1 (UI):** Headline #1 · Test-Call entfernt · Telefonanbieter „Anderer" separat + Pflicht-Name, „/ nicht dabei" raus · Feiertags-Erwartung gestrichen — LIVE (#589).
- **Backend #1 (Korb-Wiring)** + **#2 (Nachrichten-E-Mail)** — gebaut + committet (Branch, dormant bis call_type live, gebündelt).
- **#3 Name-Personalisierung** (Cockpit komplett durchpropagiert via `lisaName` + Agent: Prompt `{{assistant_name}}` + generate + promote) + **Kennen-Sie-das-#2-Fix** (Werbung≠Lieferant, + Lieferant/Rückfrage-Karte) — gebaut + committet (Branch).
- **Init-Persistenz-Fix** (alle Draft-Felder überleben Reload).
- **„So soll Lisa reagieren" aufgeräumt** (7-Fragen-Text raus, Karten nummeriert 1–6, Kanal-Folge pro Karte „→ Fall+E-Mail+Push / Nachricht+E-Mail / kein Eintrag", „nie SMS"-Hinweis) + **Preisfragen → reagieren verschoben** + **Übersichts-Subline 1 Zeile** (Datenschutz/Aufnahmen raus).

## ⏭ OFFEN (Reihenfolge: Name → Badge → restliche UI → Website)
- ✅ Einzugsgebiet entschärft (kein Filter) + Notiz-Labels Komma (Lisa + Leitsystem).
- **OFFEN (grosse Brocken, frische Runde):** **Website-Umbau** (Q2 raus, neue Ja/Nein-1, Integrations-Karte) · **Badge-Fix** (SW + Push + Zählquelle, Handy-Test).
- **OFFEN (Design/Detail, frische Runde):** per-Stern strang-spezifische Beispiel-Placeholder + „So meldet sich"-Notiz minimal · 1-2-3-Ordnung in den übrigen Strängen · Reagieren-Symbol 🎧 · Vor-Ort-Icon (Haustür — braucht Emoji-vs-SVG-Konsistenzentscheid für alle 3 Strang-Icons). Voice VA1-3 separat (Pre-Go-live).

## IST-Wahrheit (am Code verifiziert — Basis für alles)
- **3-Korb-Logik:** Lisa klassifiziert jeden Anruf → **Fall** (Auftrag/Reklamation) · **Nachricht** (Rückruf/Lieferant/Nachfrage/„Chef") · **Nichts** (Info/Spam).
- **Fall** → Eintrag „Fälle" + **E-Mail** an `notification_email` (immer) + Push (Notfall/Reklamation). `sendCaseNotification`.
- **Nachricht** → `tenant_callbacks` → Liste `/ops/nachrichten` (Status pending/resolved/dismissed). Heute **KEINE E-Mail**, nur Liste + optional Push (Default aus).
- **Nichts** (Spam/Werbung) → freundlich beendet, keine Spur. → „wir wimmeln Werbung ab" stimmt; Lieferant ≠ Werbung!
- **Kanäle an den Betrieb:** **NIE SMS.** Nur **E-Mail** (Fälle) + **Push** (sofort). SMS nur an Kunden (Empfangsbestätigung).
- **Korb-Routing ist Lisas Klassifikation** — der Webhook liest die Cockpit-Korb-Regler AKTUELL NICHT (nur `reklamationPush`/`callbackPush`). → #1 verdrahtet das.
- **Einzugsgebiet:** Lisa lehnt ausserhalb NICHT ab (nimmt auf), Gebiet ist nur Info. → entschärfen.
- **Wissensstand:** Snapshot vom Onboarding-Crawl, KEINE Auto-Auffrischung (Stellen veralten) → P5 (Welle 2).

## BACKEND (zuerst)
- **[#1] Korb-Regler live verdrahten.** Webhook liest per-Anruf-Art-Korb aus `modules.voice_dispositions` (Fall/Nachricht/nichts) + überschreibt das Routing; `promote` schreibt die volle Config; Datenmodell `DispositionsConfig` (korb+notify) end-to-end. So ist „So soll Lisa reagieren" echtes Training.
- **[#2] Nachrichten-E-Mail.** Bei Korb „Nachricht" zusätzlich kurze Zusammenfassungs-Mail an `notification_email` („Lieferant XY, Nr., Anliegen …, bittet um Rückruf"). Neues Resend-Template. Owner-Schalter „auch per E-Mail" (Default an).
- **[#BADGE] App-Icon-Badge = offene To-Dos.** SSOT-Zahl = offene Fälle + pending Nachrichten. Bei jedem Ereignis echte Zahl an `setAppBadge` (Server gibt `badgeCount` mit; **stiller Push** für Nachrichten = Badge ohne Banner). Beim Öffnen Badge = echte Zahl (nicht nur clear). In-App: Zähler-Badges am Nav (Leitzentrale · Nachrichten) + „neu"-Marker je Eintrag. (Heute: zählt „neu seit letztem Öffnen", ignoriert Nachrichten, schickt echte Zahl nicht mit → kaputt.)

## NAME-PERSONALISIERUNG [#3]
- Bei „So meldet sich Lisa": Feld **„Wie soll Ihre rechte Hand am Telefon heissen?"** (Default „Lisa").
- Name **propagiert durch das ganze Cockpit** (überall wo „Lisa" steht → gewählter Name) + in den Agenten (Greeting/Persona). Hinweis: Live-Wirkung erst mit Agent-Regenerierung beim Go-live. Datenmodell: `draft.voice.assistantName`.

## UI / INHALT — Strang für Strang

### Übersicht (FB1)
- Headline → **„Bauen wir gemeinsam Ihre rechte Hand am Telefon."** (Favorit #1).
- Subline „80% vorbereitet…" bleibt; **Reassurance-Zeile auf 1 Zeile**; „keine Aufnahmen" + „Schweizer Datenschutz" raus.
- **Vor-Ort-Icon** neu: Haustür mit Türknopf (aktuell „Ziegelblock").

### Querschnitt (ALLE Stränge, Lisa + Leitsystem)
- **Nummerierte 1-2-3-Ordnung** der Karten überall, so tief wie möglich (wie Website es schon hat).
- **„Noch etwas?"-Feld pro Stern:** Label kürzer, **Komma statt Bindestrich** („Was läuft bei Ihnen noch, das Lisa unbedingt wissen sollte,"). Kleiner Hinweis-Text bleibt. **Beispiel-Placeholder STRANG-SPEZIFISCH** (2 knackige, klare Sani-Fälle je Strang — keine vagen wie „zuerst nach Eigentümer fragen"). Ausnahme **„So meldet sich Lisa"**: minimal = nur „Hinweis (optional)" + leeres Feld, kein langer Hinweis/Beispiel.

### Lisa › Kennen Sie das?
- Punkt #2 neu: **Werbung abwimmeln ≠ Lieferant durchlassen** (Lieferant „Bauteil X verspätet" ist wichtig → Nachricht). Ggf. eigene Alltags-Karte „Rückrufe/Rückfragen".

### Lisa › Das soll Lisa wissen
- **„Antwort auf Preisfragen" raus → nach „So soll Lisa reagieren"** (ist Reaktion/Grenze, nicht Wissen).
- **Einzugsgebiet entschärfen** (kein Filter; Lisa nimmt ausserhalb trotzdem auf) — oder als optionalen Info-Punkt.
- Leistungen-Feld schon höher (✓). Prüfen, ob weitere Website-Felder für Dörfler relevant.
- „Noch etwas?"-Label → „Das sollte Lisa unbedingt ebenfalls wissen,".

### Lisa › So soll Lisa reagieren (FB2/FB3)
- Symbol vor „Lisa" klären (unklar).
- **„Höchstens 7 Fragen, keine Gesprächsaufnahme"-Text raus** (Reibung vermeiden).
- Pro Anruf-Art **glasklar: was Lisa tut + Kanal**. Korb-Optionen (nach #1 echt): **Fall+E-Mail / nur Fall / nur Nachricht / nichts** (prüfen welche live sinnvoll). „Mich sofort benachrichtigen" = **Push** (klar benennen, nicht SMS). Bei Nachricht: „→ E-Mail an Sie" (nach #2).
- **Aufgeräumtere, nummerierte Optik** (FB3: zu viele/enge Karten, unklar wo SMS/E-Mail).
- „Noch etwas?"-Label → „Was läuft bei Ihnen noch, das Lisa unbedingt wissen sollte," + bessere strang-spezifische Beispiele.

### Lisa › Wann Lisa erreichbar ist
- „Notdienst anbieten?" bleibt (lieber doppelt fragen).
- **Zwei Karten → eine:** in die „Feiertage/geschlossen"-Karte den Satz „Auch dann nimmt Lisa jeden Fall trotzdem auf, nichts geht verloren." reinziehen. **„Erwartung: Rückmeldung am nächsten Werktag" STREICHEN** (Erwartung setzen ist riskant).
- „Noch etwas?"-Label strang-spezifisch (Erreichbarkeit) — Formulierung CC.

### Lisa › So kommt der Anruf zu Lisa
- **„Anderer Anbieter" als EIGENER Punkt ganz unten** → bei Klick Pflicht-Feld „Wie heisst Ihr Anbieter?" (nicht optional). „Yallo/Wingo" raus aus dem Sammel-Punkt.
- **„/ nicht dabei" streichen.**
- Weiterleitungs-Disclosure + Animation = Founder-Lob, **so lassen**.

### Lisa › Hören Sie Ihre Lisa (Test-Call)
- **KOMPLETT ENTFERNEN** (zu hohe Erwartung; Web holprig, Auflegen fehlt, Sprachwechsel tot, Name propagiert nicht). Voice-Themen separat = VA1-VA3 (ticketlist, Pre-Go-live). **ERLEDIGT (Batch 1).**
- **Founder-Anforderung 08.06. (festgehalten):** Falls der Test-Call später zurückkommt (nach VA1-3-Fix), MUSS er einen **sichtbaren Auflegen-Button** haben (Web-SDK `stopCall()`) — der Anwender muss jederzeit auflegen können.

### Website (→ „Ihr Online-Meldeformular")
- **Numbered 1-2-3 überall** (Vorbild).
- **NEU Punkt 1 (hart):** „Spielt das Online-Meldeformular für Ihr Leitsystem überhaupt eine Rolle?" Ja/Nein (Default Ja). Nein → bestätigen → Strang fertig (nur Voice + Leitsystem gewollt).
- **Punkt 2:** Anliegen-Kategorien (wie bisher).
- **Punkt 3:** Fotos vom Schaden (wie bisher).
- **Punkt 4 (wichtigster, Integration):** Website intern verankert oder bei **Agentur** (Sani-Sprache, nicht „gehostet") + **welche Agentur**? · bestehendes Formular **ersetzen oder ergänzen**? · wer kümmert sich (wir / Betrieb / Agentur)? · Button (FB4). Ziel: alle Infos, um das Formular zu integrieren — kurz, prägnant, userfreundlich.
- **Alte Frage „Haben Sie eine eigene Website? ja/nein veraltet" KOMPLETT RAUS** (Eigentor — wir kontaktieren nie ohne Website).

## Voice-Agent (separat, Pre-Go-live — in ticketlist VA1-VA3)
- VA1 Lisa legt nicht auf · VA2 Sprachwechsel feuert nicht · VA3 Web-Audio holprig.

## Cleanup
- Demo-Eintrag in Dörfler `tenant_callbacks` (`call_id=demo-sample-lieferant-1`) löschen, sobald Founder ihn gesehen hat.
