# Stern 6 — Geführter Aufbau (Cockpit) · Neubau-Spec

> **STATUS: DESIGN-TEIL KOMPLETT (2026-06-29).** Fundament + Struktur (2-Strang-Kanal-Modell) +
> beide Stränge (Lisa · Online-Anfragen) + Leitsystem-Hub + Freigabe — alle nach Schablone, default-first,
> Gratis-Test-gerahmt, inhaltlich vollständig (pingpong-fest: Kunden-Nachrichten-Karte + Go-live-Prüfung
> angeglichen). **Offen = nur noch Bau** (Code-Redesign · Audio/Foto-Guides · Hero-Konsistenz). Ist-Cockpit
> (`src/web/app/aufbau/[token]/CockpitApp.tsx`, „Redesign v2") = **Ersatzteillager, nicht Bauplan.**

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

## Strang 1 — Lisa (Schablone GELOCKT 2026-06-29) — der WOW-Träger
> Emotionaler Kern: **kein Formular, sondern „Bauen wir Ihre Lisa" — er lernt seine neue Mitarbeiterin an.** Progressiver Avatar (erwacht Zug um Zug) + **vertikale Karten-Liste** (eine Metapher, keine radiale Konstellation). 3× `✓ steht` (bestätigen) + 2× `○ braucht Sie`.

**⚠️ TTS-Sicherheit (hart):** Lisa = deutsche Engine → **kein „Grüezi"/Mundart** (verhunzt CH-Wörter). Begrüssung-Default = **„Guten Tag"** (`getGreeting.ts`, = Hero). **Hochdeutsch-Schutz an JEDEM Lisa-spricht-Feld** (Begrüssung, Wissen, Preis-Antwort, Ferien-Hinweis): *„Was Sie hier schreiben, sagt Lisa wortwörtlich — bitte Hochdeutsch. ‚Guten Tag' statt ‚Grüezi'."*
**Name:** `assistantName || "Lisa"` ist im ganzen Cockpit + Agenten verknüpft (umbenennen → überall mit). Bereits live.

| # | Karte | Status | Default / Inhalt | ▶ Lisa-Audio (Gist, Hochdeutsch) |
|---|---|---|---|---|
| 1 | 🗣 **So meldet sich Lisa** | ✓ steht | „**Guten Tag**, hier ist Lisa, die digitale Assistentin von [Betrieb] — was kann ich für Sie tun?" + Name | „So melde ich mich; in CH Pflicht: ich sage offen, dass ich digital bin. Sonst bestätigen." |
| 2 | 📚 **Das weiss Lisa über Sie** *(WOW-Kern)* | ✓ aus Website | Öffnungszeiten · Einzugsgebiet (nur Info, kein Filter) · Leistungen · Notfall-Regel — vorbefüllt, korrigieren | „Aus Ihrer Website vorbereitet — korrigieren Sie, was nicht stimmt. Je besser ich Sie kenne, desto echter klinge ich." |
| 3 | 🎧 **So reagiert Lisa** | ✓ steht | **🛡 Grenzen:** nie Preise/Termin/Diagnose/Garantie · **💪 nie besetzt** (2. Lisa übernimmt) · Dispositionen vorbelegt (Auftrag→Fall · Info→Antwort · Chef→Nachricht · Reklamation→Prio · Werbung→tschüss) | „Ich behandle jeden Anruf passend, bei Notfall Alarm sofort. Vorbelegt — reinschauen nur, wenn Sie was anders wollen." |
| 4 | 🚨 **Wann Lisa erreichbar ist** | ○ braucht Sie | Notdienst Ja/Nein → bei Ja: Name+Nummer; bei Nein: „melden uns am nächsten Werktag" | „Sagen Sie, ob Sie Notdienst anbieten — dann alarmiere ich die richtige Person. Sonst nehm ich den Fall trotzdem auf." |
| 5 | ☎️ **So kommt der Anruf zu Lisa** *(die eine Aktion)* | ○ braucht Sie | **Sicherheitsnetz-Reframe:** „fängt nur, was Sie verpassen" · Anbieter (Radio) · „übernimmt nach 5× klingeln" (Default) · **📷 Weiterleitung-Foto-Guide** (anbieter-spez.) | „Ihre Nummer bleibt — wir leiten nur um, was Sie nicht abnehmen. Anbieter wählen, dann zeig ich die Tastenkombi mit Bild." |

## Strang 2 — Online-Anfragen (Website-Formular) (GELOCKT 2026-06-29)
> Rahmen: **„Statt E-Mail-Pingpong — eine saubere Anfrage."** **Friction-Killer:** das Formular ist **sofort als Link nutzbar** (✓ steht); die Website-Integration (Agentur-Reibung) ist **optional, blockt den Test-Start NICHT.**

| # | Karte | Status | Inhalt |
|---|---|---|---|
| 1 | 💬 **Ihr Anfrage-Formular** | ✓ steht | Startklar in Ihrem Look · `🔗 Link sofort nutzbar` (Google/Visitenkarte/WhatsApp) · 📷 Foto vom Schaden automatisch. Audio: „ersetzt das Mail-Hin-und-Her → sauberer Fall." |
| 2 | 🧩 **Womit Kunden starten** | ✓ vorbereitet | 3 eigene (aus Gewerk) + 3 Standard, tippen zum Ändern |
| 3 | 🌐 **Aufs Ihre Website bringen** | ⚪ optional | Default eingeklappt („nicht nötig zum Starten") → selbst (Schnipsel + 📷 Anleitung) / Agentur (Name+Mail → wir schicken Anleitung) |

## Strang-Hub + Freigabe (GELOCKT 2026-06-29)
**◆ Leitsystem (der Hub — Knoten ②):** 2 zu prüfen + 4 vorab-gesetzt.
| # | Karte | Status | Inhalt |
|---|---|---|---|
| 1 | 📨 **Wohin Ihre Fälle gemeldet werden** | ○ braucht Sie | Geschäfts-E-Mail (= die Fälle sehen, der Beweis) + Push-Toggle |
| 2 | 💬 **Nachrichten an Ihre Kunden** *(feuern im Test!)* | ✓ steht | Die 3 Texte, alle vorbefüllt + sein **SMS-Absender (≤11 Z.)**: **Empfangsbestätigung (SMS nach jedem Fall)** · Termin-Erinnerung · Bewertungsanfrage. **„Sie sehen + verantworten, was an Ihre Kunden geht."** 1× bestätigen. *(Loch-Fix: gehen in seinem Namen raus — nie still defaulten.)* |
| 3 | 🎨 **Ihre Marke** | ✓ aus Website | Farbe + Fall-Kürzel, vorbefüllt |
| 4 | 👥 **Ihr Team** | ⚪ nur Sie | Default: nur er (Leitung); später erweitern |
| 5 | 📅 **Kalender** | ⚪ später | Default: abfangen; aufklappen → Outlook/Google + 📷 Anleitung |
| 6 | ⭐ **Bewertungen** | ⚪ aus | Default aus (Stern-5-Trumpf für später); aufklappen → Google-Link + Schwelle |

**🚀 Freigabe — auf Gratis-Test umgerahmt (kein „Freischalten"-Post-Kauf):**
- Login-E-Mail · **AVV** (revDSG · **Falldaten in Frankfurt** · keine Gesprächsaufnahmen — §7.9-geschärft).
- „Was passiert, wenn wir starten": Demo-Fälle weg → erster echter Anruf = erster Fall · App aufs Handy · **„Ich schaue drüber, dann gehen wir gemeinsam live."** *(Wochen-Rapport-Zeile = später/Conversion, nicht im Test.)*
- Button: **„An Gunnar — wir gehen gemeinsam live"** (statt „zum Freischalten senden").
- **⚠️ Go-live-Prüfung an die Tier angleichen (Inkonsistenz-Fix):** Pflicht **nur** was der Test braucht — Begrüssung · Telefonanbieter · Notfall-Kontakt (wenn Notdienst=Ja) · Geschäfts-E-Mail · Login-E-Mail · AVV. **NICHT blockierend:** `google_review_url`, Team-Mehrpersonen, Kalender, Website-Integration (heutige `MISSING_LABEL`-Liste verlangt review-url + staff-admin → entschärfen, sonst steckt der Inhaber fest = Pingpong).

## Ist-Cockpit = Ersatzteillager (Gold behalten)
80/20-Framing · **progressiver Lisa-Avatar** (Konstellation) · „nichts live bis Freigabe"-Vertrauen · „geht direkt an Gunnar"-Notizen · **Lisa-Grenzen-Beruhigung** (nie Preise/Diagnose/Termin/Garantie) · `PainHint` „Kennen Sie das?" · Autosave · **Freigabe → Founder-Review → gemeinsam live** (Stern-6-Realität). **Raus/neu:** Über-Dichte, „Freischalten"-Post-Kauf-Framing → Gratis-Test-Reframe, leerer „Vor Ort"-Strang, Technik-Kram ohne Default+Bild-Hilfe.

## Bau-Fortschritt
- **2026-06-30 — Strang 1 (Lisa) gebaut** (`CockpitApp.tsx`): radiale Konstellation → **vertikale Karten-Liste** (Schablone), default-first-Plaketten **„✓ steht"/„✓ aus Website"/„○ braucht Sie"/„✓ bestätigt"**, **Hochdeutsch-Schutz** an jedem Lisa-spricht-Feld (Begrüssung · Wissen · Preis-Antwort · Ferien), **„kleine Lisa"-Audio-Platzhalter** pro Karte (Gist lesbar bis Audio produziert), **Sicherheitsnetz-Reframe** + **Foto-Guide-Platzhalter** im Telefonie-Schritt, **„nie besetzt — 2. Lisa"**-Zeile. Avatar erwacht Karte um Karte. Datenvertrag (draft/autosave/submit) unverändert.
- **2026-06-30 — Mobile-Vorschau** `/aufbau/vorschau` (Demo „Muster Sanitär AG", kein DB-Eintrag, `preview`-Flag schaltet jedes Speichern/Senden ab) → Founder-Review am Handy + Verkaufs-Demo.
- **Offen am Bau:** Strang 2 (Online-Anfragen) + Leitsystem-Hub + Freigabe nach Schablone angleichen · **Go-live-Prüfung entschärfen** (`submit/route.ts`: `google_review_url` + `staff_admin` aus Pflicht) · echte Audio-/Foto-Guides produzieren.

## Offen / nächste Schritte — ✅ Design komplett, Bau läuft
1. **Code-Redesign** des Cockpits nach diesem Spec (separater Schritt, Founder-Hoheit). Inkl. **Go-live-Prüfung entschärfen** (Tier) + **leeren „Vor Ort"-Strang raus** + **Gratis-Test-Reframe der Copy**.
2. **„Kleine-Lisa"-Audio-Clips (pro Abschnitt, Hochdeutsch) + Foto-/Screenshot-Guides** produzieren (Weiterleitung pro Anbieter · Kalender Outlook/Google).
3. **Hero-Konsistenz:** E-Mail-Versprechen reframen (Formular als Antwort auf Mail-Pingpong) — `HERO_DEMO_SPEC`.
4. *(Backlog)* echtes Inbound-E-Mail via dedizierte Anfrage-Adresse → Fall (umgeht Thread-Chaos).
