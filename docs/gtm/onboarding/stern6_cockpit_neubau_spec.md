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
6. **Lisa-Wording durchgehend:** freundlich, höflich, **direkt und ehrlich** — Lisas Stimme zieht sich durch die ganze Hilfe/Copy.

## Struktur / Kanal-Modell (GELOCKT 2026-06-29) — Inhalts-Audit gegen die neue Welt
> Das alte 3-Strang-Modell (Vor Ort · Lisa · Website) ist Altlast aus der 13-Min-Video-Ära. Gegen die neue Welt geprüft (Code + Hero + Stern 5):

**Kanal-Modell (revidiert, Sanitär-geerdet):**
> **📞 Telefon (Lisa) · 💬 Online-Anfragen (Website-Formular) → ◆ ein Leitsystem** — **zwei** Stränge.

- **E-Mail ist KEIN eigener Strang.** Code-Realität: Fall-Quellen = `wizard · voice · manual`; **kein Inbound-E-Mail** (E-Mail nur ausgehend). Sanitär-Realität: E-Mail = **Offerte-Thread (hin/her), kein Intake-Event** → Auto-Fall-pro-Mail = Chaos. **Das Website-Formular IST die ehrliche Antwort auf E-Mail-Pingpong** (statt Formular→Mail→Chaos → Formular→sauberer Fall). → Website + „E-Mail" = **ein Paket** („Online-Anfragen").
- **„Vor Ort/manuell" = Leitsystem-Feature, kein Eingangs-Strang** (war leer/Ballast).
- **„Ihr Betrieb, Ihre Regeln"** (Knoten ③) = roter Faden der Copy (Eigentum).
- **Team-skaliert-sich-WOW:** „kommen zwei Anrufe gleichzeitig, ist nie besetzt — eine zweite Lisa übernimmt." Als *eine ruhige Zeile* / Audio-Lisa-Satz unter „So reagiert Lisa" — **kein Config-Feld** (automatisch), tasteful, nicht überladen.

**⚠️ Hero-Konsistenz-Korrektur (Folge):** Hero-Schluss verspricht „per E-Mail reinkommt" — **nicht gebaut + Sanitär-unsauber.** → Hero reframen: Formular als *Lösung* fürs E-Mail-Pingpong („statt Mail-hin-und-her — eine saubere Anfrage, alles am selben Ort"). *(HERO_DEMO_SPEC anpassen, wenn Cockpit steht.)*

## Tiering = Default-first macht aus „cut/keep" ein „aufgeklappt/eingeklappt"
**Nichts wird geschnitten — alles kriegt einen Default.** Die Aufmerksamkeit skaliert aufs Essentielle:
- **🟢 Essential (aufgeklappt, aktiv gefragt):** Lisa **Begrüssung · Wissen · Verhalten/Reaktion · Notfall** · **Telefonie** (Weiterleitung) · **Benachrichtigung wohin** (er muss die Fälle sehen) · **Online-Anfragen** (Website-Formular: wo/wie eingebunden) · Login + AVV.
- **⚪ Vorab-gesetzt (eingeklappt, „passt so? ✓"):** **Kalender** (Default: abfangen, 1 Klick → Termine setzen) · **Team** (Default: nur er) · **Bewertungen** (Default: aus — Stern-5-Trumpf für später) · **Marke** (Default: aus Website gezogen). Da, vorausgefüllt, null Aufwand.

## Hilfe-Modell — Medium nach Frage
- **„Kleine Lisa" (Audio ~20 s) PRO ABSCHNITT** (nicht pro Zeile — Audio kann man nicht überfliegen, würde den schnellen Klicker bremsen): erklärt *„was wollen wir hier von Ihnen + warum"*.
- **Audio = opt-in Genuss-Schicht, NICHT der Hauptweg.** Default ist die *visuell* sofort klare Zeile; wer hängt/lieber hört, drückt Play.
- **Foto-/Screenshot-Anleitung für externe „wo ist der Knopf"-Schritte** (Outlook/Google-Kalender): „wo klicken" *zeigt* man — Audio kann nicht auf einen Button deuten. Für den 50-jährigen Inhaber.
- **Alles inline + kontextuell**, antizipiert die echte Frage (Kalender: „wo finde ich die Einstellung, was braucht Lisa von mir").

## Ist-Cockpit = Ersatzteillager (Gold behalten)
80/20-Framing · **progressiver Lisa-Avatar** (Konstellation) · „nichts live bis Freigabe"-Vertrauen · „geht direkt an Gunnar"-Notizen · **Lisa-Grenzen-Beruhigung** (nie Preise/Diagnose/Termin/Garantie) · `PainHint` „Kennen Sie das?" · Autosave · **Freigabe → Founder-Review → gemeinsam live** (Stern-6-Realität). **Raus/neu:** Über-Dichte, „Freischalten"-Post-Kauf-Framing → Gratis-Test-Reframe, leerer „Vor Ort"-Strang, Technik-Kram ohne Default+Bild-Hilfe.

## Offen / nächste Schritte
1. **Lisa-Strang wortgenau** nach der Schablone (WOW-Träger) — Bauplan-Karte (Status-Badge · 1 Warum-Zeile · ▶ Lisa-Audio · Default-Felder · „Passt so ✓"); Avatar bleibt, aber **vertikale Karten-Liste statt radialer Konstellation** (eine Metapher).
2. Muster über **Online-Anfragen · Leitsystem · Freigabe** rollen.
3. **Gratis-Test-Reframe** der Copy (statt „Freischalten" → „Ihren Test aufsetzen / gemeinsam live"); **„Vor Ort"-Strang raus**.
4. **Hero-Konsistenz:** E-Mail-Versprechen reframen (s. Struktur-Abschnitt).
5. „Kleine-Lisa"-Audio + Foto-Guides produzieren (separater Bau).
6. Code-Redesign = separater Schritt (Founder-Hoheit).
7. *(Backlog)* echtes Inbound-E-Mail via dedizierte Anfrage-Adresse → Fall (umgeht Thread-Chaos).
