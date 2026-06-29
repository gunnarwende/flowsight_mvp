# Stern 6 — Geführter Aufbau (Cockpit) · Neubau-Spec

> **STATUS: FUNDAMENT GELOCKT (2026-06-29).** Übergabe-Zustand + die EINE Aufgabe + Design-Prinzipien
> + Tiering + Hilfe-Modell fest. **Als Nächstes:** EINEN Strang (Lisa) als Schablone bauen, dann über
> alle Stränge rollen. Ist-Cockpit (`src/web/app/aufbau/[token]/CockpitApp.tsx`, „Redesign v2") =
> **Ersatzteillager, nicht Bauplan.** Schwester-Specs: alte `phase2_cockpit_redesign.md`.

## Zweck — die EINE Aufgabe
> *Den Inhaber mit **minimalem Aufwand** zu einem **Live-Test bringen, der ihn WOWt** — Lisa gut genug,
> dass sein echter verpasster Anruf sauber und beeindruckend gefangen wird, und er es sieht.*

**Nicht** „alles konfigurieren". **Nicht** „leere Hülle". Sondern **das WOW-Essenzielle, schnell.**
Stern 6 ist erfolgreich, **wenn der Test wowt → Conversion** (Zahlung kommt erst danach).

## Übergabe-Zustand (aus Stern 5 — wo wir herkommen)
- Er hat **Ja zum Gratis-Test** gesagt (kein Kauf). Wenig Commitment, neugierig-skeptisch, zeitknapp, nicht-technisch, oft auf dem Bau.
- **Stern-5-Versprechen (wörtlich einzulösen):** geführter Aufbau · ein Link · Schritt für Schritt · *das Meiste ist vorbereitet, Sie ergänzen nur was nur Sie wissen* · **keine Stunde, kein Technik-Kram** · ich schau am Ende drüber · **gemeinsam live.**
- Lisa läuft im Test als **Sicherheitsnetz** (fängt nur Verpasstes; er hebt normal weiter ab).
- Der Hero zeigte **eine** Sache: ein verlorener Anruf, sauber gefangen → **der Test muss genau diesen WOW mit seinen echten Kunden reproduzieren.**

## Design-Prinzipien (gelockt)
1. **Default-first:** Jedes Feld ist **vorausgefüllt** mit unserem besten Wert. Der Inhaber *prüft + justiert*, tippt nie von null. **Klarer visueller Status: „✓ vorbereitet" (kann so bleiben) vs „○ braucht Sie" (nur er weiß es).** → macht „80% ist vorbereitet" *auf dem Bildschirm sichtbar wahr*.
2. **Auswahl statt Tippen:** Entscheidungen = 1 Klick (Radio/Toggle). Freitext nur wo unvermeidbar — dort mit Default + Platzhalter.
3. **Ein Bauplan pro Strang:** identisches Layout-Muster überall → einmal gelernt, dann fliegt er durch.
4. **Sehen = verstehen:** Textdichte radikal runter, kein Kleingedrucktes im Fließtext. **Wenn er *nachdenken* muss, ist das Design gescheitert.**
5. **Hilfe, die *sitzt* — kontextuell, inline, nie eine separate „Hilfe"-Seite** (Klick auf Hilfe → mehr Fragen = der Tod).

## Tiering = Default-first macht aus „cut/keep" ein „aufgeklappt/eingeklappt"
**Nichts wird geschnitten — alles kriegt einen Default.** Die Aufmerksamkeit skaliert aufs Essentielle:
- **🟢 Essential (aufgeklappt, aktiv gefragt):** Lisa **Begrüssung · Wissen · Verhalten/Reaktion · Notfall** · **Telefonie** (Weiterleitung) · **Benachrichtigung wohin** (er muss die Fälle sehen) · **Website/E-Mail-Intake** (repräsentiert das Live-System — Founder-Entscheid: drin) · Login + AVV.
- **⚪ Vorab-gesetzt (eingeklappt, „passt so? ✓"):** **Kalender** (Default: abfangen, 1 Klick → Termine setzen) · **Team** (Default: nur er) · **Bewertungen** (Default: aus — Stern-5-Trumpf für später) · **Marke** (Default: aus Website gezogen). Da, vorausgefüllt, null Aufwand.

## Hilfe-Modell — Medium nach Frage
- **„Kleine Lisa" (Audio ~20 s) PRO ABSCHNITT** (nicht pro Zeile — Audio kann man nicht überfliegen, würde den schnellen Klicker bremsen): erklärt *„was wollen wir hier von Ihnen + warum"*.
- **Audio = opt-in Genuss-Schicht, NICHT der Hauptweg.** Default ist die *visuell* sofort klare Zeile; wer hängt/lieber hört, drückt Play.
- **Foto-/Screenshot-Anleitung für externe „wo ist der Knopf"-Schritte** (Outlook/Google-Kalender): „wo klicken" *zeigt* man — Audio kann nicht auf einen Button deuten. Für den 50-jährigen Inhaber.
- **Alles inline + kontextuell**, antizipiert die echte Frage (Kalender: „wo finde ich die Einstellung, was braucht Lisa von mir").

## Ist-Cockpit = Ersatzteillager (Gold behalten)
80/20-Framing · **progressiver Lisa-Avatar** (Konstellation) · „nichts live bis Freigabe"-Vertrauen · „geht direkt an Gunnar"-Notizen · **Lisa-Grenzen-Beruhigung** (nie Preise/Diagnose/Termin/Garantie) · `PainHint` „Kennen Sie das?" · Autosave · **Freigabe → Founder-Review → gemeinsam live** (Stern-6-Realität). **Raus/neu:** Über-Dichte, „Freischalten"-Post-Kauf-Framing → Gratis-Test-Reframe, leerer „Vor Ort"-Strang, Technik-Kram ohne Default+Bild-Hilfe.

## Offen / nächste Schritte
1. **Lisa-Strang als Schablone** bauen (WOW-Träger) — nach diesen Prinzipien, beispielhaft, Founder-Review.
2. Muster über alle Stränge rollen (Website/Intake · Leitsystem · Freigabe).
3. Gratis-Test-Reframe der Copy (statt „Freischalten" → „Ihren Test aufsetzen / gemeinsam live").
4. „Kleine-Lisa"-Audio + Foto-Guides produzieren (separater Bau).
5. Code-Redesign = separater Schritt (Founder-Hoheit).
