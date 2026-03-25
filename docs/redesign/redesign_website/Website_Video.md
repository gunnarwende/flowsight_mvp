# Website_Video — Produktion der zwei FlowSight-Website-Videos

**Version:** 4.0 | **Datum:** 2026-03-25 | **Status:** Ferrari-Prototyp KOMPLETT (10 Screens). Video-Assembly als nächstes.

## Aktueller Produktionsstand (25.03. EOD)

### Ferrari-Prototyp — 10 Screens KOMPLETT ✅
Hero v4 wurde am 25.03. abgelehnt (3 Testpersonen = fragende Blicke, Prototyp-Screens waren unterirdisch). Daraufhin: kompletter Neuansatz als "Ferrari-Prototyp" — 10 pixel-perfekte High-End-Screens, iterativ mit Founder entwickelt.

**Firma im Prototyp:** Gebäudetechnik GmbH (generisch, branchenübergreifend)
**Story:** Thomas Bühler Rohrbruch durchgezogen (P1→P5→P6→P7)
**Design:** Inter Font, #111827 Background, professionell (Schweizer Präzision, nicht Gaming-App)
**Farbsystem:** Blau = offen/aktiv, Grün = erledigt, Gold = NUR Sterne/Belohnung
**Screens:** `production/prototype_screens/p1-p10*.html`
**Renders:** `production/renders/p1-p10*.png` (Playwright, 3× Portrait / 2× Landscape)

| # | Screen | Format | Voiceover-Moment | Status |
|---|--------|--------|-----------------|--------|
| P1 | Push-Notification (Lockscreen) | Portrait | "Ihr Kunde ruft an" | ✅ Approved |
| P2 | Wizard-Formular (Kunden-Website) | Portrait | "Er meldet sich über Ihre Website" | ✅ Approved |
| P3 | Manueller Eintrag (Bottom-Sheet) | Portrait | "Ihr Team nimmt eine Anfrage auf" | ✅ Approved |
| P4 | SMS-Bestätigung (iOS Messages) | Portrait | "Bestätigung per SMS" | ✅ Approved |
| P5 | Leitzentrale Übersicht | Portrait | "Jeden Fall auf einen Blick" | ✅ Approved |
| P6 | Fall-Detail + Fotos + Einsatz | Portrait | "Termin setzen, Techniker zuweisen" | ✅ Approved |
| P7 | Fall Erledigt + Timeline + Review-CTA | Portrait | "Sauber dokumentiert" | ✅ Approved |
| P8 | Review-Surface (Kunden-Seite) | Portrait | "Gute Arbeit verdient Sterne" | ✅ Approved |
| P9 | System-Totale (4 Stationen + KPIs) | Portrait | "Ein System" | ✅ Approved |
| P10 | Laptop-Ansicht (Desktop Leitzentrale) | Landscape | Hero-Video Context | ✅ Approved |

**Voiceover-Sync:** Jeder Satz im Voiceover v4.1 hat einen korrespondierenden Screen. 0 Lücken.

**Design-Entscheidungen (Founder-approved, 25.03.):**
| Entscheidung | Begründung |
|-------------|------------|
| Inter statt Geist | Professioneller, technischer, weniger "App-ig" |
| Solider Hintergrund #111827 statt Gradient | Sauber, nicht verspielt |
| Kein Glasmorphism, kein Glow | Schweizer Präzision, nicht Gaming |
| Gold NUR bei Sternen + Erledigt★ + Firmenname | Fokus-Disziplin: Gold = Belohnung |
| Cards mit dezenter Farbmarkierung links | Links = Status rechts (Blau/Gold) |
| P4/P8 = helles Theme | Kundenperspektive, bewusster Kontrast |
| Fotos vom Melder in P6 | Techniker sieht Schaden VOR Anfahrt |
| KPI-Zahlen in P9-Kreisen | Verbindet System-Totale mit Leitzentrale-Daten |
| Rohrbruch-Story durchgezogen | P1→P5→P6→P7 = ein Fall, eine Geschichte |
| Branchenbreite (Sanitär+Heizung+Elektro+Lüftung) | Jeder Handwerker erkennt sich |

### Hero-Video — NEU ZU BAUEN
- **v1-v4:** Alle verworfen. v4 abgelehnt am 25.03.
- **Nächster Schritt:** Hero v5 mit Ferrari-Prototyp-Screens assemblieren
- **Voiceover Hero:** hero_vo_a.mp3 (Daniel, Variante A) — bleibt

### Live-erleben-Video — NEU ZU BAUEN
- **Voiceover v4.1 (final):** Steht. Daniel-Stimme, ~2:10 Min, 8 Szenen + Closer-Platzhalter.
- **Nächster Schritt:** Assembly mit Ferrari-Prototyp-Screens + AI-Szenen + Voiceover

### Assets (25.03.)
| Asset | Dateien | Status |
|-------|---------|--------|
| **Ferrari-Prototyp-Screens** | P1-P10 HTML + PNG (10 Screens) | ✅ KOMPLETT |
| AI-Szenen (Runway Gen4.5) | R1-R6, H1v2-H4v2 | 10 Clips (aus v4, ggf. neu generieren) |
| Voiceover Hero | hero_vo_a.mp3 (Daniel) | Final |
| Voiceover Live-erleben | final_voiceover_v4.1.mp3 (Daniel) | Final |
| Render-Script | render_screens.mjs (Playwright) | ✅ Funktional |
| Keine Text-Overlays im Hero | Bewegung erzählt allein, Website-Headline liefert Kontext |
| 24fps statt 30fps | Kino-Standard, Film-Look |

---

# 1. Zweck

Dieses Dokument ist die operative Grundlage für die Produktion von zwei FlowSight-Website-Videos:

1. **Hero-Video** (12–15s Loop) auf der Homepage
2. **`/live-erleben`-Video** (~2 Min) als vertiefter Beweisfilm

Es definiert Ziel, Bildlogik, No-Gos, Tool-Stack, Rollen und den 10-Tage-Produktionsplan so konkret, dass wir ohne weitere Strategierunden in die Umsetzung gehen können.

**Bildkonzept (entschieden):**
- Echte UI-Captures für Substanz (Leitstand, SMS, Wizard, Review)
- AI-generierte Betriebsmomente für Atmosphäre (Runway)
- Reduzierte typografische Overlays für Orientierung
- **Kein Stock-Footage** — wirkt generisch, tötet die Marke

---

# 2. Drei Kernerkenntnisse

1. **FlowSight ist ein Leitsystem, kein Tool.** Die Videos zeigen nicht “was das Produkt kann”, sondern wie der Betrieb mit FlowSight aussieht und wirkt.
2. **Die zwei Videos haben zwei verschiedene Jobs.** Hero = verdichten (ein Blick, ein System). Live-erleben = vertiefen (Betriebsfluss erlebbar machen, Vertrauen aufbauen). Wenn beide zu ähnlich werden, wird das Hero zu schwer und das Live-erleben redundant.
3. **CC-first-Produktion.** CC steuert die gesamte Pipeline autonom — FFmpeg (Assembly/Export), Playwright (UI-Captures), ElevenLabs API (Voice), Runway API (AI-Szenen). Founder entscheidet und reviewt, bedient keine GUI-Tools. Premiere ist nur Fallback-Finishing, nicht Produktionskern.

---

# 3. Nordstern

> **Gesamt:** FlowSight wirkt als ruhiges, geschlossenes Leitsystem für den Betrieb.

> **Hero:** In einem Blick verstehen: Alles hängt zusammen.

> **Live-erleben:** In zwei Minuten fühlen: So läuft ein besser geführter Betrieb.

**Qualitätsregel:** Qualität vor Skalierung. Lieber diese zwei Videos perfekt als fünf mittelmässige. Das Flaggschiff setzt den Standard für alles, was danach kommt.

**Produktionsregel:** CC baut, Founder entscheidet. Kein manuelles Schneiden, kein GUI-Browsing, kein Operator-Aufwand. Die Pipeline ist API-/CLI-gesteuert. Premiere darf nur eingesetzt werden, wenn FFmpeg-Output nach Founder-Review nicht reicht — und auch dann nur für gezieltes Finishing, nicht als Hauptwerkzeug.

---

# 4. Fünf Produktionsregeln

1. **Betriebsfluss, nicht Features.** Immer die Kette zeigen: Eingang → Rückmeldung → Fallführung → Abschluss → Bewertung. Nie Module einzeln.
2. **Kausalität, nicht Produkt-Tourismus.** Jede Szene beantwortet: “Was passiert als Nächstes im Betrieb?” Sobald es nach “wir zeigen jetzt die Software” aussieht, verliert der Clip.
3. **Ruhe, nicht Marketing-Lautstärke.** Nicht marktschreierisch, nicht startupig, nicht hektisch. High-End entsteht durch Auswahl und Weglassen.
4. **Substanz durch echte UI und echte Betriebsmomente.** UI-Captures zeigen das reale System. AI-Szenen zeigen den realen Alltag. Kein Demo-Theater, kein Stock-Footage.
5. **Alles raus, was SaaS-/Demo-Geruch erzeugt.** Keine Cursor-Touren, keine KPI-Showcases, keine Avatar-Persona, keine Feature-Aufzählung, keine UI-Wände. Wenn man fragt “Welches Feature ist das?” statt “So läuft das im Betrieb” — raus.

---

# 5. Die zwei Videos — Ziel, Rolle, Wirkung, Fehlerbild

## 5.1 Video 1 — Hero-Video / Motion-Loop

## Ziel
In 12–15 Sekunden visuell beweisen:

> FlowSight verbindet Kontakt, Rückmeldung, Fall und Abschluss zu einem geschlossenen System.

## Rolle
- Sofortiger visueller Proof
- Hero-Verstärkung
- Qualitätsanker der Marke
- Einstieg in die Gesamtlogik

## Was das Video leisten muss
- in einem Blick verständlich sein
- loopbar sein
- ohne Ton funktionieren
- hochwertig und ruhig wirken
- sofort zeigen, dass alles zusammenhängt

## Was das Video nicht leisten soll
- keine Detailerklärung
- kein Storytelling mit vielen Zwischenschritten
- kein UI-Tutorial
- kein Produkt-Rundgang
- kein „schau mal, was alles drin ist“

## Zielwirkung
Nach 3 Sekunden:
- relevant
- hochwertig
- ruhig
- für echte Betriebe gebaut

Nach 15 Sekunden:
- in sich schlüssig
- klar
- kein Einzelfeature
- ein System

## Muss sichtbar werden (Hero)
- Ein Eingang / Kontaktmoment
- Eine spürbare Rückmeldung
- Ein geordneter Fall
- Ein ruhiger Abschlusszustand

Wenn eines dieser vier fehlt, ist das Video unvollständig. Wenn mehr als vier Elemente drin sind, ist es überladen.

## Fehlerbild, wenn es misslingt
- zu hektisch
- zu technisch
- zu erklärend
- zu feature-lastig
- zu abstrakt ohne Lesbarkeit
- zu konkrete Demo mit UI-Geruch

---

## 5.2 Video 2 — `/live-erleben`-Video

## Ziel
In ca. 2 Minuten FlowSight als echten Betriebsfluss erlebbar machen und Vertrauen aufbauen.

## Rolle
- vertiefter Beweis
- Vertrauensaufbau
- Projektion in den eigenen Betrieb
- klare Verständnisbrücke zwischen Website-Versprechen und gelebtem Ablauf

## Was das Video leisten muss
- den Ablauf verständlich machen
- glaubwürdig wirken
- professionell, ruhig und hochwertig sein
- den Wunsch auslösen: „Das möchte ich für meinen Betrieb erleben.“

## Was das Video nicht leisten soll
- kein klassischer SaaS-Erklärfilm
- kein Avatar-/Presenter-Video
- kein Modulshowcase
- kein Sales-Overkill
- kein generischer Markenfilm ohne Substanz

## Zielwirkung
Nach den ersten Sekunden:
- das wirkt echt
- das betrifft meinen Alltag

Nach ~60 Sekunden:
- ich verstehe, wie das zusammenläuft
- das ist durchdacht

Nach ~2 Minuten:
- ich sehe den Nutzen im Betrieb
- das wirkt vertrauenswürdig
- ich möchte es erleben, nicht nur darüber lesen

## Muss sichtbar werden (Live-erleben)
- Realer Eingang (Telefon klingelt, niemand da)
- Schnelle Kundenrückmeldung (SMS, Bestätigung)
- Fall wird geführt (Leitstand, Kategorie, Dringlichkeit)
- Betrieb gewinnt Ordnung (Termin, Zuweisung, Überblick)
- Sauberer Abschluss mit Bewertungslogik (Review-Anfrage, Gold-Status)
- Persönlicher Vertrauensanker (Founder-Closer)

Jede Szene, die keins dieser Elemente zeigt, hat keine Berechtigung im Video.

## Fehlerbild, wenn es misslingt
- zu werblich
- zu feature-lastig
- zu technisch
- zu voice-/dashboard-zentriert
- zu weit weg vom Betriebsalltag
- zu langatmig ohne Spannungsbogen

---

# 6. No-Gos (konsolidiert)

**Was in keinem der beiden Videos vorkommen darf:**

- Startup-SaaS-Ästhetik, generische App-Werbung
- Cursor-Touren, Klick-Tutorials, UI-Wände
- KPI-Showcases ohne dramaturgischen Zweck
- “Unsere KI kann...”-Framing, Tech-/AI-Fetisch
- Avatar-Persona als Hauptträger des Vertrauens
- Stock-Footage (generisch, tötet die Marke)
- Peinliche Demo-Daten / Demo-Betriebe
- Zu viel Text im Bild, zu viele gleichrangige Infos
- SHK-only Framing nach aussen
- Trial-/Billo-SaaS-Sprache

**Demo-Geruch-Prüfung für jede Szene:**
Wenn die erste Reaktion “Welches Feature ist das?” ist statt “So läuft das im Betrieb” → Szene streichen oder umbauen.

**Änderung gegenüber Teil I:** Der Founder-Closer (8-10s, Ende Live-erleben) ist bestätigt. §7.2 “kein Gründer vor der Kamera” ist damit aufgehoben — der Closer ist ein persönlicher Vertrauensanker, kein Presenter-Video.

---

# 7. Audiovisuelle Sprache

## 8.1 Stil
- hochwertig
- ruhig
- präzise
- souverän
- modern, aber nicht futuristisch
- reduziert, aber nicht leer

## 8.2 Tempo
### Hero
- fliessend
- sofort lesbar
- keine Hektik
- 3–4 klare Bewegungen / Zustandswechsel

### `/live-erleben`
- kontrolliert
- bewusst
- eher ruhig als schnell
- einzelne Momente dürfen atmen

## 8.3 Schnitte
- funktional
- unsichtbar
- weich oder sehr sauber hart
- keine künstlichen Effektsprünge
- keine Show-off-Transitions

## 8.4 UI-Anteil
### Hero
- reduziert
- eher symbolisch / kuratiert
- nur so viel wie nötig, nie Produkt-Tour

### `/live-erleben`
- substanziell, aber kuratiert
- echte Betriebslogik vor Bedienlogik
- Buttons und Menüs nicht zelebrieren

## 8.5 Text-Overlays
Nur minimal und nur zur Verstärkung der Lesbarkeit.
Beispielkategorien:
- Kontakt
- Rückmeldung
- Fall
- Abschluss
- Bewertung

Keine langen Sätze.
Keine Marketingclaims als Hauptträger.

## 8.6 Sound
### Hero
- muss ohne Sound funktionieren
- mit Sound nur subtiler Mehrwert
- keine epische Werbung

### `/live-erleben`
- ruhige hochwertige Musikfläche
- gezielte leichte SFX
- Stimme ruhig, souverän, nicht radiomässig
- Sound trägt Würde, nicht Aufmerksamkeit

## 8.7 Bildlogik
Alles folgt einer Richtung:

> Eingang → Rückmeldung → Ordnung → Abschluss

Nicht wild springen.
Nicht modulhaft springen.
Nicht wie 5 einzelne Produkte aneinanderschneiden.

## 8.8 Was „high-end“ konkret heisst
- disziplinierte Auswahl
- gute Typografie
- sauberes Timing
- hochwertige Stimme
- keine billigen Templates
- keine unnötige Bewegung
- klare Bildhierarchie
- echte Ruhe

---

# 8. Tool-Stack (CC-first, entschieden 24.03.)

**Korrektur:** Der ursprüngliche Stack (Premiere + Runway-GUI + Epidemic) war founder-operated — ~12h versteckte GUI-Arbeit. Das widerspricht der Founder-Rolle (entscheiden + reviewen, nicht editieren). Seit 24.03. gilt: **CC-first. Alles, was API/CLI-steuerbar ist, steuert CC.**

### A. Kernstack (CC steuert autonom)

| Tool | Rolle | CC-Steuerung | Founder-Rolle |
|------|-------|-------------|---------------|
| **FFmpeg** | Video-Assembly, Schnitt, Overlays, Ken-Burns, Audio-Mix, Export | CLI-Scripts, CC schreibt komplette Pipeline | Reviewt Output |
| **ElevenLabs** | Voiceover TTS (DE) | API, CC rendert komplett | Wählt Stimme (10 Min) |
| **Playwright** | Automatisierte UI-Screenshots (Leitstand, Wizard, Review, SMS) | Headless Browser, CC steuert komplett | Nichts |
| **ChatGPT** | Dramaturgie, Voiceover-Text, Review-Kritik | — | Strategie-Partner |
| **Claude Code** | Skripte, Storyboards, TTS, Prompts, Captures, Assembly, Website-Einbau | Alles | Operative Produktion |

### B. Ausnahme-/Fallback-Tools

| Tool | Wann | Founder-Aufwand |
|------|------|-----------------|
| **Runway API** | AI-Szenen (Werkstatt, Telefon, Handwerker). CC steuert via API. | Founder reviewed Ergebnisse (~15 Min) |
| **Premiere Pro** | NUR wenn FFmpeg-Output Feinschliff braucht. Nicht Hauptproduktion. | Max 1-2h. Nicht 10h. |

### C. Rausgeflogen

| Tool | Grund |
|------|-------|
| ~~Epidemic Sound / Artlist~~ | Kein Abo nötig. CC empfiehlt 2-3 lizenzfreie Tracks. Founder wählt einen (5 Min). |
| ~~Premiere als Haupt-Editor~~ | Ersetzt durch FFmpeg. Premiere nur Notfall-Finishing. |
| ~~Runway als GUI-Tool~~ | Ersetzt durch Runway API. CC steuert. |

---

# 9. Rollenverteilung

→ **Detailliert in Teil II, §16.**

- **CC:** Skripte, Storyboards, TTS-Rendering (ElevenLabs API), UI-Captures (Playwright), AI-Szenen (Runway API), Video-Assembly (FFmpeg), Website-Einbau
- **ChatGPT:** Dramaturgie, Voiceover-Verfeinerung, Review-Kritik
- **Founder:** Stimme wählen (10 Min), AI-Szenen reviewen (15 Min), Videos reviewen + Kill-Liste (1.5h), Closer drehen (30 Min), Final-Freigabe (15 Min)
- **Total Founder-Zeit: ~3h über 10 Tage**

---

# 10. Produktionsplan

→ **Der vollständige 10-Tage-Plan steht in Teil II (§15-§21).**

| Tag | Was | Owner |
|-----|-----|-------|
| 1 | Skripte + Storyboards + Assembly-Specs | CC + ChatGPT |
| 2 | Voice-Casting (3 Samples) + Founder-Wahl | CC + Founder (10 Min) |
| 3 | UI-Captures automatisiert (Playwright) | CC |
| 4 | AI-Szenen generieren (Runway API) + Founder-Review | CC + Founder (15 Min) |
| 5 | Hero v1 assemblieren (FFmpeg) | CC |
| 6 | Live-erleben v1 assemblieren (FFmpeg) | CC |
| 7 | Review + Kill-Runde | Founder (1.5h) + CC + ChatGPT |
| 8 | Veredelung (FFmpeg-Iteration nach Kill-Liste) | CC |
| 9 | Founder-Closer drehen | Founder (30 Min) |
| 10 | Closer einbauen + Final Export + Website-Einbau | CC + Founder (15 Min Freigabe) |

---

# 11. Szenenstruktur (Kurzfassung)

→ **Detaillierte Storyboards werden in Tag 1 erstellt (Teil II, §19).**

### Hero (12–15s, 4 Szenen, visuelle Gleichung)
1. Kontakt geht ein
2. Rückmeldung an den Kunden
3. Fall erscheint geordnet
4. Ruhiger Abschlusszustand

### Live-erleben (~2 Min, 8 Szenen + Closer)
1. Reale Ausgangslage (Telefon klingelt, niemand da)
2. Lisa nimmt an
3. SMS-Bestätigung
4. Fall entsteht im Leitstand
5. Betrieb übernimmt (Termin, Zuweisung)
6. Auftrag erledigt
7. Bewertung ausgelöst
8. System schliesst sich
9. **Founder-Closer** (8-10s)

Dramaturgische Logik: Unsicherheit → Führung → Vertrauen → Abschluss

---

# 12. FFmpeg Assembly-Spec (verpflichtendes Deliverable)

Für beide Videos erstellt CC vor der Assembly eine exakte Spezifikation, die direkt in FFmpeg-Befehle übersetzt wird:

```
SZENE [Nr] — [Name]
════════════════════
Zeitfenster:     0:00–0:03
Input-Datei:     captures/leitstand_admin.png | ai_scenes/scene_werkstatt.mp4 | closer/founder.mp4
Effekt:          Ken-Burns (zoom 105%→100%, 3s) | Static | Fade-in 0.5s
Overlay-Text:    “[Text]” | Position: bottom-left | Font: Inter 48px | Farbe: #ffffff | Fade: 0.3s
Voiceover:       voice/final_voiceover.mp3 ab [Zeitstempel] (nur Live-erleben)
Transition OUT:  cross-dissolve 0.5s | cut | fade-to-black 0.3s
Audio-Layer:     music/track.mp3 bei -18dB | SFX: phone_ring.mp3 bei -6dB
```

CC übersetzt diese Spec 1:1 in FFmpeg-Filtergraphen. Kein manueller Schnitt nötig. Iteration = Spec anpassen → FFmpeg neu rendern → Founder reviewt Output.

---

# 13. Zusammenfassung Teil I

> **Exzellenz entsteht im Weglassen.** Das Hero muss ikonischer bleiben als jeder erste Instinkt es möchte. Das Live-erleben muss mehr Betriebsfluss als Produkt zeigen. Die stärkste Stimme ist die ruhigste glaubwürdige. Sobald etwas nach SaaS oder Demo riecht — konsequent verwerfen.

---
---

# TEIL II: 10-TAGE-PRODUKTIONSPLAN (CC-first, ab 24.03.2026)

**Status:** AKTIV — Tag 1 startet nach Founder-Freigabe der Voraussetzungen
**Korrektur 24.03.:** Kompletter Umbau von founder-operated (Premiere/Runway-GUI, ~15h Founder) auf CC-first (FFmpeg/Playwright/API, ~3h Founder).

---

## 15. Bestätigte Kernentscheidungen

### Stack + Rollen
| Punkt | Entscheidung | Begründung |
|-------|-------------|------------|
| **CC-first** | CC baut und steuert die gesamte Produktionspipeline. Founder entscheidet, reviewt, gibt frei. | Founder = Qualitätsführung, nicht Operator. |
| **FFmpeg** | Kern-Assembly (CLI, CC-steuerbar). Premiere nur Fallback-Finishing. | CC kann FFmpeg steuern. CC kann Premiere nicht steuern. |
| **Playwright** | Automatisierte UI-Screenshots + Prototyp-Screen-Rendering. | Exakte Viewports, reproduzierbar, kein Founder-Aufwand. |
| **Runway Gen4.5 API** | AI-Szenen für Atmosphäre. CC steuert. | Höchste Qualität. Founder reviewed nur Ergebnisse. |
| **ElevenLabs** | Voiceover. Daniel (Multilingual v2). | Stimme gewählt (Variante A). |

### Hero-Video Architektur (gelernt am 24.03.)
| Punkt | Entscheidung | Begründung |
|-------|-------------|------------|
| **Kein echtes Kundenunternehmen** | Kein Weinberger, kein Prospect, keine echte Kunden-UI im Hero. | Prospects auf der Homepage = Go-to-Market-Fehler. |
| **Prototyp-Screens** | Eigens gebaute FlowSight-Screens (HTML/CSS, Navy+Gold, fiktive Daten) als System-Beweis. | Volle Design-Kontrolle, keine Prospect-Daten, Premium-Look. |
| **Intercut AI + Mockup** | AI-Clips (Runway) für Handwerks-Atmosphäre, Phone-Mockup-Shots für System-Sichtbarkeit. Abwechselnd geschnitten. | AI allein zeigt kein System. Mockups allein haben keine Emotion. Beides zusammen = Leitsystem im Handwerkskontext. |
| **Kein Screen Replacement** | Keine Overlay-Komposition auf bewegte AI-Phone-Screens. Stattdessen dedizierte Mockup-Shots. | FFmpeg hat kein Motion Tracking. Screen Replacement auf AI-Video sieht amateurhaft aus. |
| **Keine Text-Overlays** | Keine Wort-Einblendungen im Hero. Voiceover + Bewegung erzählen. | Website-Headline liefert Kontext. Video liefert Gefühl. |
| **Voiceover** | “Jede Anfrage wird aufgefangen. Jeder Fall wird geführt. Vom ersten Kontakt bis zum Abschluss. FlowSight — das Leitsystem für Ihren Betrieb.” | Einordnend, nicht erklärend. Benennt das System, ohne Features zu listen. |
| **24fps** | Kino-Standard statt 30fps Web-Standard. | Film-Look > Corporate-Look. |
| **Hollywood-Anspruch** | Color Grading, Film Grain, Vignette, Letterbox, Sound Design, Kontinuität. Jeder Frame Premium. | “Das muss wirken wie ein Prototyp, wie wir unsere Produktion in 2 Jahren sehen würden.” |

### Live-erleben-Video
| Punkt | Entscheidung | Begründung |
|-------|-------------|------------|
| **Voiceover v4.1** | Alle 3 Kanäle, Pain-Points, gezieltes Review, persönliche Einrichtung, App-Vorteil. “Leitzentrale” statt “Leitstand”. | Founder-Feedback eingearbeitet. |
| **Founder-Closer** | 8-10s am Ende. “Ich bin Gunnar Wende. Ich richte Ihr Leitsystem persönlich ein.” | Gesetzt. |
| **Kein Weinberger** | Anonymisierte/fiktive UI oder Prototyp-Screens. | Gleiche Regel wie Hero. |

---

## 16. Rollenverteilung (CC-first)

### 16.1 CC (Claude Code) — Operative Produktion
- Voiceover-Skripte schreiben + challengen
- **ElevenLabs TTS via API** rendern (3 Stimm-Varianten → finale Version)
- Storyboards + Assembly-Specs als strukturierte Dokumente
- **Playwright-Scripts** für automatisierte UI-Captures (Leitstand, Wizard, Review, SMS)
- **Runway API** für AI-Szenen (Prompts senden, Clips empfangen, beste auswählen)
- **FFmpeg Assembly-Pipeline** bauen + ausführen (Schnitt, Overlays, Ken-Burns, Audio-Mix, Export)
- Musik-Empfehlung (2-3 lizenzfreie Tracks)
- Iteration nach Founder-Feedback (Spec anpassen → FFmpeg neu rendern)
- Website-Einbau (Player, Lazy-Loading, Poster-Frame, responsive)
- Closer-Integration (Founder-Video + FFmpeg-Einbau)

### 16.2 ChatGPT — Strategische Schärfung
- Wirklogik + Dramaturgie challengen
- Voiceover-Texte verfeinern + kürzen
- High-End-Kritik in Review-Runden

### 16.3 Founder — Entscheidung + Review + Closer

| Tag | Aufgabe | Dauer |
|-----|---------|-------|
| **Vor Tag 1** | API Keys bereitstellen (ElevenLabs + Runway) | 15 Min |
| **Tag 2** | 3 Stimm-Samples anhören, eine wählen | 10 Min |
| **Tag 4** | AI-Szenen reviewen (CC hat sie generiert) | 15 Min |
| **Tag 7** | Beide Videos anschauen, Kill-Liste schreiben | 1.5h |
| **Tag 9** | Closer drehen (Smartphone, 1 Take, 30 Min) | 30 Min |
| **Tag 10** | Final anschauen, Ja/Nein-Freigabe | 15 Min |
| **TOTAL** | | **~3h über 10 Tage** |

### 16.4 Founder macht NICHT:
- Kein Schneiden in Premiere oder anderen GUI-Tools
- Kein manuelles Runway-Prompting in der Web-GUI
- Kein Musik-Browsing in Abo-Plattformen
- Kein Asset-Management oder Datei-Organisation
- Kein Voice-Rendering
- Keine technische Pipeline-Arbeit

---

## 17. Technische Voraussetzungen (VOR Tag 1)

### 17.1 Was der Founder bereitstellen muss

| # | Was | Wie | Dauer |
|---|-----|-----|-------|
| T1 | **ElevenLabs API Key** | elevenlabs.io → Settings → API Keys → Key per Session teilen (**NICHT committen**) | 2 Min |
| T2 | **Runway API Key** | runwayml.com → Settings → API Keys → Key per Session teilen (**NICHT committen**) | 2 Min |
| T3 | **FFmpeg auf Windows installieren** | `winget install ffmpeg` in PowerShell. Oder: ffmpeg.org/download.html → Windows Build → PATH setzen. | 5 Min |

**Das ist alles.** 3 Schritte, ~10 Min. Kein Premiere-Setup, kein Musik-Abo, kein Runway-GUI-Onboarding.

### 17.2 Was CC bereits hat / nutzt:
- Supabase-Zugang (für Playwright-Captures mit echten Weinberger-Daten)
- Vercel Preview (für Website-Screenshots)
- Repo-Zugriff (für FFmpeg-Scripts, Website-Einbau)
- Node.js (für Playwright, API-Calls)
- FFmpeg (nach T3 auf Founder-Rechner verfügbar, CC steuert via Bash)

### 17.3 Kosten (CC-first Stack)

| Tool | Plan | Kosten/Mo | Status |
|------|------|-----------|--------|
| ElevenLabs | Pro | ~$22 | AKTIV (bereits vorhanden) |
| Runway | Pro | $35 | AKTIV (bereits eingerichtet) |
| FFmpeg | Open Source | $0 | Zu installieren (T3) |
| Playwright | Open Source | $0 | CC installiert bei Bedarf |
| Premiere Pro | Monats-Abo | CHF 38.90 | **NUR FALLBACK.** Kündigen wenn FFmpeg reicht. |
| ~~Epidemic/Artlist~~ | — | — | Nicht abschliessen. Freie Tracks reichen. |

**Monatliche Kosten Kernstack:** ~$57/Mo (ElevenLabs + Runway). Premiere optional +CHF 38.90.

---

## 18. Ordnerstruktur

### Zwei-Tier-Struktur

Grosse Binärdateien (.mp4, .mp3, .webm, .prproj) gehören **nicht ins Git-Repo**. Sie sind in `.gitignore` ausgeschlossen.

**Tier 1: Im Repo (Text-Dokumente, commitbar):**

```
docs/redesign/redesign_website/
├── Website_Video.md                 ← DIESES DOKUMENT (Strategie + Plan)
├── Redesign Website.md              ← Website-Analyse (bestehend)
├── feedback/                        ← Screenshots aktuelle Website (bestehend)
├── scripts/
│   ├── hero_storyboard.md           ← Tag 1: 4 Szenen, Sekunde-für-Sekunde
│   ├── live_erleben_storyboard.md   ← Tag 1: 8 Szenen + Closer
│   ├── voiceover_live_erleben.md    ← Tag 1: ~300 Wörter Voiceover-Skript
│   └── overlay_texts.md             ← Tag 1: Alle Text-Overlays beider Videos
├── prompts/
│   └── runway_prompts.md            ← Tag 4: Exakte Prompt-Library
└── review/
    ├── review_1_kill_list.md         ← Tag 7: Founder-Feedback
    └── review_2_final.md             ← Tag 10: Final-Freigabe
```

**Tier 2: Lokal (CC-generiert, NICHT im Repo, .gitignore'd):**

```
docs/redesign/redesign_website/production/   ← .gitignore'd
├── voice/
│   ├── sample_1.mp3, sample_2.mp3, sample_3.mp3
│   └── final_voiceover.mp3
├── captures/                                ← Playwright-Output
│   └── leitstand_admin.png, sms_mockup.png, wizard_*.png, review_surface.png
├── ai_scenes/                               ← Runway API-Output
│   └── scene_werkstatt.mp4, scene_telefon.mp4, scene_handwerker.mp4
├── music/
│   └── background_track.mp3
├── closer/
│   └── founder_closer_raw.mp4
├── assembly/                                ← FFmpeg-Scripts + Zwischenergebnisse
│   ├── hero_assembly.sh
│   ├── live_erleben_assembly.sh
│   └── *.mp4 (Zwischenexporte)
└── exports/
    └── hero_v1.mp4, live_erleben_v1.mp4, hero_final.mp4, ...
```

**Tier 3: Deployed (Production-Assets im Web):**

```
src/web/public/videos/               ← Tag 10: Final-Exporte für Website
├── hero-loop.webm
├── hero-loop.mp4
├── hero-poster.jpg
├── live-erleben.mp4
├── live-erleben-poster.jpg
└── live-erleben.vtt
```

**Regel:** Nur die finalen, web-optimierten Videos landen in `src/web/public/videos/`. Alles andere bleibt lokal.

---

## 19. Der 10-Tage-Plan (CC-first)

---

### TAG 1 — Skripte + Storyboards + Assembly-Specs

**Owner:** CC + ChatGPT | **Founder:** Nichts

#### CC-Deliverables:

**A) Hero-Video Storyboard + Assembly-Spec** → `scripts/hero_storyboard.md`

| Szene | Was man sieht | Overlay | Dauer | Quelle | CC-Tool |
|-------|---------------|---------|-------|--------|---------|
| 1 | Telefon klingelt, Handwerker-Handy | **Kontakt** | 3s | AI-Szene | Runway API |
| 2 | SMS-Bestätigung mit Firmenname | **Rückmeldung** | 3s | UI-Capture | Playwright |
| 3 | Fall im Leitstand, sauber geordnet | **Fall** | 4s | UI-Capture | Playwright |
| 4 | Ruhiger Abschlusszustand, Gold-Status | **Abschluss** | 4s | UI-Capture | Playwright |
| → | Soft-Fade zurück zu Szene 1 | — | 1s | Übergang | FFmpeg cross-dissolve |

**B) Live-erleben Storyboard + Assembly-Spec** → `scripts/live_erleben_storyboard.md`

| Szene | Zeit | Was man sieht | Voiceover | Overlay | CC-Tool |
|-------|------|---------------|-----------|---------|---------|
| 1 | 0:00–0:15 | Werkstatt, Telefon klingelt | "In den meisten Betrieben klingelt das Telefon — und niemand geht ran." | — | Runway API |
| 2 | 0:15–0:30 | Anruf wird aufgefangen, Firmenname | "FlowSight nimmt jeden Anruf an. Mit dem Namen Ihres Betriebs." | **Anruf** | Runway API |
| 3 | 0:30–0:45 | Handwerker schaut auf Handy, SMS | "Ihr Kunde bekommt sofort eine Bestätigung per SMS." | **Bestätigung** | Playwright + Runway API |
| 4 | 0:45–1:00 | Leitstand: neuer Fall | "Jede Anfrage wird zum Fall. Strukturiert, mit allen Details." | **Fall** | Playwright |
| 5 | 1:00–1:15 | Terminpicker, Techniker-Zuweisung | "Ihr Team sieht, was ansteht. Termin setzen, Techniker zuweisen." | **Planung** | Playwright |
| 6 | 1:15–1:30 | Status "Erledigt", Timeline | "Wenn der Auftrag erledigt ist, sieht das jeder." | **Erledigt** | Playwright |
| 7 | 1:30–1:45 | Review → Google-Sterne → Gold | "Und Ihre zufriedenen Kunden? Die werden automatisch um eine Bewertung gebeten." | **Bewertung** | Playwright |
| 8 | 1:45–1:55 | Ruhiges Schlussbild | "Vom ersten Kontakt bis zur Bewertung. Ein System." | — | FFmpeg (Compositing) |
| C | 1:55–2:05 | **Founder, direkt in Kamera** | (Founder spricht selbst) | Gunnar Wende · Gründer | FFmpeg (Concat) |

**C) Voiceover-Skript** → `scripts/voiceover_live_erleben.md`
- ~300 Wörter, Hochdeutsch mit Schweizer Einschlag
- Ton: ruhig, souverän, nicht werblich
- Pro Szene 1-2 Sätze, nie mehr

**D) Overlay-Texte** → `scripts/overlay_texts.md`
- Hero: 4 Wörter (Kontakt → Rückmeldung → Fall → Abschluss)
- Live-erleben: 6-8 kurze Einblendungen (max 5 Wörter)

**E) Playwright Capture-Spec** → `scripts/capture_spec.md`
- Exakte URLs, Viewports, Login-State, erwartete Daten pro Screenshot

**F) FFmpeg Assembly-Spec** → gemäss §12 Template

---

### TAG 2 — Voice-Casting + Founder-Wahl

**Owner:** CC (autonom) + Founder (10 Min)
**Voraussetzung:** T1 erledigt (ElevenLabs API Key)

#### CC (autonom):
1. 3 ElevenLabs-Stimmen via API auswählen + rendern
2. Ersten Absatz des Voiceover-Skripts mit allen 3 rendern → `production/voice/sample_*.mp3`
3. Founder informieren: "3 Samples liegen bereit."

#### Founder (10 Min):
- 3 Samples anhören, eine wählen. Fertig.

#### CC danach (autonom):
- Komplettes Voiceover rendern → `production/voice/final_voiceover.mp3`
- Timing-Markers pro Szene erstellen

---

### TAG 3 — UI-Captures (Playwright, automatisiert)

**Owner:** CC | **Founder:** Nichts

CC erstellt und führt Playwright-Scripts aus:

| Capture | URL / State | Viewport |
|---------|------------|----------|
| Leitstand Admin | `/ops/cases` (Weinberger-Tenant, OTP-Login) | 1920x1080 |
| Leitstand Mobile | `/ops/cases` | 390x844 |
| Fall-Detail | `/ops/cases/[id]` (Demo-Case, Termin gesetzt) | 1920x1080 |
| SMS-Verify | `/v/[id]?t=[token]` | 390x844 |
| Wizard Step 1 | `/kunden/weinberger-ag/meldung` | 1920x1080 |
| Wizard Step 3 | `/kunden/weinberger-ag/meldung` (Step 3 State) | 1920x1080 |
| Review-Surface | `/review/[id]` (5 Sterne gewählt, Gold) | 1920x1080 |

**Technisch:**
- Playwright Headless Chromium, `deviceScaleFactor: 2` (Retina)
- Echte Weinberger Demo-Cases (PII-frei, `is_demo=true`)
- Output: `production/captures/*.png`

**Vorbereitung (CC, vor Captures):**
- Demo-Case durch Lifecycle führen (Neu → Erledigt → Review Gold)
- Sicherstellen, dass FlowBar KPIs gut aussehen

---

### TAG 4 — AI-Szenen (Runway API)

**Owner:** CC (API) + Founder (15 Min Review)
**Voraussetzung:** T2 erledigt (Runway API Key)

#### CC (autonom):
1. 6 Prompts an Runway Gen-3 Alpha Turbo API senden
2. Pro Prompt 2-3 Varianten generieren
3. Clips herunterladen → `production/ai_scenes/`
4. Beste Variante pro Szene vorauswählen

| # | Szene | Prompt (EN) |
|---|-------|-------------|
| 1 | Werkstatt morgens | Swiss plumbing workshop exterior, morning golden light, white delivery van, professional, cinematic |
| 2 | Telefon klingelt | Office desk in workshop, landline phone ringing, no one there, warm ambient light, 5 seconds |
| 3 | Handwerker schaut aufs Handy | Craftsman in blue work clothes looking at smartphone, satisfied expression, workshop background |
| 4 | Techniker bei der Arbeit | Professional plumber working on pipes, clean Swiss bathroom, natural light |
| 5 | Zufriedener Kunde | Customer opening front door smiling, tradesman in background, Swiss residential setting |
| 6 | Telefon Close-up (Hero) | Extreme close-up smartphone screen, incoming call notification, warm bokeh background, cinematic |

#### Founder (15 Min):
- CC zeigt die besten Varianten
- Founder sagt Ja/Nein pro Szene
- Bei Nein: CC generiert mit angepasstem Prompt neu

**Kosten-Hinweis (Arbeitsannahme):** Runway API berechnet pro Sekunde generiertes Video. Operative Schätzung: 6 Szenen × 5s × 3 Varianten liegt im Bereich des Pro-Budgets. Exakte Kosten variieren je nach Modell und Auflösung.

---

### TAG 5 — Hero v1 assemblieren (FFmpeg)

**Owner:** CC | **Founder:** Nichts

CC schreibt und führt FFmpeg Assembly-Script aus:

```bash
# Vereinfachtes Beispiel — CC baut das echte Script
ffmpeg \
  -i ai_scenes/scene_telefon.mp4 \           # Szene 1
  -i captures/sms_mockup.png \               # Szene 2 (Ken-Burns)
  -i captures/leitstand_admin.png \           # Szene 3 (Ken-Burns)
  -i captures/review_gold.png \              # Szene 4 (Ken-Burns)
  -filter_complex "[...Ken-Burns, Overlays, Cross-dissolves, Loop...]" \
  -t 15 exports/hero_v1.mp4
```

**Was FFmpeg hier macht:**
- Still-Images zu Video (Ken-Burns: langsamer Zoom 105%→100%)
- Text-Overlays (Inter Font, weiss, gold für "Abschluss", fade-in/out)
- Cross-dissolve Transitions zwischen Szenen
- Loop-Übergang (Szene 4 → Szene 1, sanfter Fade)
- Optional: Hintergrundmusik bei -18dB

**Output:** `production/exports/hero_v1.mp4`

---

### TAG 6 — Live-erleben v1 assemblieren (FFmpeg)

**Owner:** CC | **Founder:** Nichts

CC assembliert das 2-Minuten-Video:
- Voiceover als Master-Audio-Spur (timing-bestimmend)
- AI-Szenen für Atmosphäre-Momente (Szenen 1-3, 5)
- UI-Captures mit Ken-Burns für System-Momente (Szenen 4-8)
- Text-Overlays pro Szene
- Hintergrundmusik bei -18dB
- 10s Schwarz am Ende (Closer-Platzhalter)

**Output:** `production/exports/live_erleben_v1.mp4`

**Musik:** CC empfiehlt 2-3 lizenzfreie Tracks (Pixabay Music, CC0). Links an Founder. Founder hört 30s, wählt einen. CC baut ein.

---

### TAG 7 — Review + Kill-Runde

**Owner:** Founder (1.5h) + CC + ChatGPT

#### Founder:
1. Hero v1 anschauen — 5× hintereinander, mit und ohne Sound
2. Live-erleben v1 anschauen — 2×, einmal am Handy
3. Kill-Liste diktieren oder schreiben → `review/review_1_kill_list.md`

#### Prüf-Fragen:

**Hero:**
- [ ] In 3 Sekunden klar, dass es ein System ist?
- [ ] Loop fühlt sich natürlich an?
- [ ] Kein SaaS-/Demo-Geruch?

**Live-erleben:**
- [ ] Betriebsfluss nachvollziehbar?
- [ ] Stimme passt?
- [ ] Tempo stimmt?
- [ ] Am Ende: "Das möchte ich für meinen Betrieb"?

#### CC + ChatGPT challengen parallel:
- Dramaturgische Schwächen, Timing, Overlay-Balance, Sound

---

### TAG 8 — Veredelung (FFmpeg-Iteration)

**Owner:** CC | **Founder:** Nichts

CC arbeitet Kill-Liste ab — alles via FFmpeg-Script-Anpassung:
1. Timing ändern (Szenen kürzen/verlängern)
2. Overlays anpassen (Position, Grösse, Dauer)
3. Transitions verfeinern (Fade-Dauer, Cross-dissolve-Länge)
4. Sound-Balance (Voiceover-Lautstärke vs. Musik)
5. Hero Loop-Übergang perfektionieren
6. Neu rendern → `production/exports/hero_v2.mp4`, `live_erleben_v2.mp4`

**Iteration:** Spec anpassen → FFmpeg rendern → Output prüfen → wiederholen. Kein GUI nötig.

---

### TAG 9 — Founder-Closer drehen

**Owner:** Founder | **Dauer:** ~30 Min

#### Setup:
- **Ort:** Ruhiger Raum, natürliches Licht (Fenster seitlich/frontal)
- **Kamera:** Smartphone, Querformat, 1080p oder 4K
- **Stativ:** Beliebig (Bücherstapel reicht)
- **Hintergrund:** Neutral, aufgeräumt, etwas Tiefe

#### Der Satz:
> **"Ich bin Gunnar Wende. Ich richte Ihr Leitsystem persönlich ein."**

#### Regeln:
- Direkt in die Kamera, ruhig sprechen, authentisch > perfekt
- 3-5 Takes, besten wählen
- Datei → `production/closer/founder_closer_raw.mp4`

#### Einbau (CC, nicht Founder):
- CC schneidet Closer via FFmpeg ans Ende des Live-erleben-Videos
- Soft-Fade von Szene 8, Untertitel "Gunnar Wende · Gründer, FlowSight"

---

### TAG 10 — Final Export + Website-Einbau

**Owner:** CC + Founder (15 Min Freigabe)

#### CC (autonom):
1. Closer einbauen → `production/exports/live_erleben_final.mp4`
2. Hero finalisieren → `production/exports/hero_final.mp4`

#### Founder (15 Min):
- Beide Finals anschauen. **Ja oder Nein.**
- Bei Nein: Max 3 konkrete Punkte. CC iteriert, Founder gibt erneut frei.

#### CC nach Freigabe:

**Web-Export (FFmpeg):**
- Hero: WebM (VP9, ~2MB) + MP4 Fallback + Poster-Frame → `src/web/public/videos/`
- Live-erleben: MP4 (H.264, ~15-20MB) + Poster-Frame + WebVTT Untertitel

**Website-Einbau (Branch → PR → CI → Merge → Deploy):**

```tsx
// Hero auf Homepage (ersetzt statisches HeroVisual)
<video autoPlay loop muted playsInline poster="/videos/hero-poster.jpg">
  <source src="/videos/hero-loop.webm" type="video/webm" />
  <source src="/videos/hero-loop.mp4" type="video/mp4" />
</video>

// Live-erleben auf /live-erleben
<video controls playsInline poster="/videos/live-erleben-poster.jpg">
  <source src="/videos/live-erleben.mp4" type="video/mp4" />
  <track src="/videos/live-erleben.vtt" kind="subtitles" srclang="de" label="Deutsch" />
</video>
```

---

## 20. Qualitäts-Leitplanken

### Jede Szene muss 5 Tests bestehen:

1. **Leitsystem-Test:** Zeigt es das System als Ganzes, nicht ein Modul?
2. **Betriebsfluss-Test:** Versteht man "Was passiert als Nächstes?"
3. **Demo-Geruch-Test:** Wirkt es wie Software-Demo? → Raus.
4. **Ruhe-Test:** Hektisch? → Verlangsamen oder streichen.
5. **Küchentisch-Test:** Würde der Inhaber das seiner Frau zeigen?

### Hard No-Gos (ergänzend zu §7):
- Kein Stock-Footage (NIEMALS)
- Keine Avatar-Persona
- Keine Cursor-Touren
- Keine KPI-Showcases ohne dramaturgischen Zweck
- Keine Demo-Betriebsnamen (Weinberger nur in echten Captures, nicht als Fake)

---

## 21. CC-Deliverables (Zusammenfassung)

| Deliverable | Tag | Tool | Format |
|-------------|-----|------|--------|
| Storyboards + Assembly-Specs | 1 | — | Markdown |
| Voiceover-Skript | 1 | — | Markdown |
| Voice-Samples (3 Varianten) | 2 | ElevenLabs API | MP3 |
| Finales Voiceover | 2 | ElevenLabs API | MP3 |
| UI-Screenshots (7-10 Captures) | 3 | Playwright | PNG (2x Retina) |
| AI-Szenen (6 Clips) | 4 | Runway API | MP4 |
| Hero v1 | 5 | FFmpeg | MP4 |
| Live-erleben v1 | 6 | FFmpeg | MP4 |
| Hero v2 (nach Kill-Liste) | 8 | FFmpeg | MP4 |
| Live-erleben v2 (nach Kill-Liste) | 8 | FFmpeg | MP4 |
| Closer-Integration | 10 | FFmpeg | MP4 |
| Web-Exporte (WebM + MP4 + Poster + VTT) | 10 | FFmpeg | WebM/MP4/JPEG/VTT |
| Website-Einbau | 10 | Code | Branch → PR → Deploy |

---

## 22. Nach den 10 Tagen

### Was als System bleibt:
- **FFmpeg Assembly-Pipeline** (wiederverwendbar für Prospect-Videos, Social Clips)
- **Playwright Capture-Scripts** (wiederverwendbar bei jedem UI-Update)
- ElevenLabs-Stimme (wiederverwendbar)
- Runway-Prompt-Library (wiederverwendbar)
- Ordnerstruktur + Naming
- Quality-Checkliste

### Was sofort danach passiert:
- Videos live auf flowsight.ch
- Nav "Video sehen" verlinkt auf echtes Video
- Hero-Loop ersetzt statisches HeroVisual
- Prospect-Outreach kann Video-Link enthalten

### Tool-Abos prüfen:
- **Runway Pro ($35/Mo):** Kündigen wenn keine weiteren AI-Szenen geplant
- **Premiere Pro (CHF 38.90/Mo):** Kündigen wenn FFmpeg-Pipeline ausreicht
- **ElevenLabs Pro (~$22/Mo):** Behalten wenn regelmässig Prospect-Videos
