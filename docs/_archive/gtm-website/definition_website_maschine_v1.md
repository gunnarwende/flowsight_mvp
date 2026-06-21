# Definition: Die echte FlowSight Modul-1-Website-Maschine

**Datum:** 2026-04-14
**Owner:** Founder + CC
**Status:** Grunddefinition. Kein Patch, sondern Neudefinition des Zielsystems.
**Kontext:** Die bisherigen Proofs (Hero-Bilder, Fonts, Farbmodi, Section-Reihenfolge) reichen nicht aus. Das Ergebnis wirkt wie "verbessertes Template", nicht wie eine neue Klasse von Website. Wir brauchen die Definition der echten Maschine.

---

## 1. Warum die bisherigen Website-Proofs nicht ausreichen

### Was wir gemacht haben
- Hero-Bilder via Banana generiert (3 verschiedene Bildwelten)
- 3 Hero-Varianten (Classic/Split/Center)
- 3 Farbmodi (warm/cool/neutral)
- 4 Font-Familien
- Datengesteuerte Section-Reihenfolge

### Warum das nicht reicht

**Es ist immer noch dasselbe Template.** Wir haben die Oberflaeche variiert, aber nicht die Substanz. Ein Besucher, der 3 Sekunden scrollt, erkennt sofort:
- Gleiche Card-Struktur bei Services
- Gleiche Grid-Logik ueberall
- Gleicher Scrollrhythmus (Section, Gap, Section, Gap)
- Gleiche Interaktionsmuster (Card → Overlay)
- Gleicher "Atem" der Seite — statisch, gleichfoermig, vorhersehbar

**Das Problem ist architektonisch, nicht kosmetisch.** CSS-Variablen und Font-Swaps aendern die Wahrnehmung nicht fundamental. Was sich fundamental aendern muss, ist die ART wie die Website sich anfuehlt — die Dramaturgie, die Bewegung, die Bildsprache, die Ueberraschungsmomente.

**2026/2028-like bedeutet:**
- Cinematische Heros mit subtiler Bewegung (nicht statisches JPEG)
- Bildsprache, die nicht nach Stock oder AI aussieht, sondern nach professionellem Fotograf
- Dynamische Elemente, die auf Scroll reagieren
- Eine Dramaturgie, die den Besucher FUEHRT statt ihm alles gleichzeitig zeigt
- Lokale Identitaet, die sich nicht auf einen Ortnamen im Text beschraenkt

---

## 2. Definition der echten Modul-1-Website-Maschine

### Die 7 Ebenen einer 2028-faehigen Website

**Ebene 1: DRAMATURGIE (Storytelling-Architektur)**

Nicht "Section nach Section", sondern eine gefuehrte Reise:

```
Akt 1 — IMPACT (0-3 Sek):    Wer ist das? Was fuehle ich?
Akt 2 — BEWEIS (3-15 Sek):    Was koennen die? Warum sollte ich bleiben?
Akt 3 — VERTRAUEN (15-30 Sek): Wer steht dahinter? Was sagen andere?
Akt 4 — HANDLUNG (30+ Sek):    Was ist mein naechster Schritt?
```

Jeder Akt hat andere visuelle Mittel. Akt 1 ist cinematisch (Hero mit Motion). Akt 2 ist informativ (Services, klar strukturiert). Akt 3 ist emotional (Bewertungen, Team, Geschichte). Akt 4 ist direkt (CTA, Kontakt, Wizard).

Die Section-Reihenfolge IST die Dramaturgie — und sie muss pro Profil ANDERS erzaehlen.

**Ebene 2: BILDWELT (Visuelle Identitaet)**

Nicht 1 Hero-Bild + gecrawlte Service-Fotos, sondern ein KOMPLETTES visuelles System pro Betrieb:

| Element | Quelle | Aufwand |
|---------|--------|---------|
| Hero-Keyframe | Banana (5 Kandidaten, Founder waehlt) | 10 Min CC |
| Hero-Loop (5s) | Kling 3.0 Image-to-Video (3 Kandidaten aus Keyframe) | 5 Min CC, CHF 0.42-0.84 |
| Atmosphaeren-Bild (ServiceArea) | Banana (lokales Szenario) | 5 Min CC |
| Service-Keyvisuals | Banana pro Spezialisierung (optional, nur wenn gecrawlte Bilder schwach) | 15 Min CC |

**Banana-Qualitaet ist bereits bewiesen.** Die 3 Hero-Bilder von heute (Doerfler Werkstatt, Leuthold Dorf, Orlandini Praezision) sind genuinely verschieden und hochwertig. Das Problem ist nicht die Bildqualitaet, sondern dass die Bilder in ein statisches JPEG-Template eingebettet sind.

**Ebene 3: MOTION (Lebendigkeit)**

Der groesste Hebel fuer "2028-like". Eine Website mit Bewegung fuehlt sich fundamental anders an als eine statische.

| Element | Tool | Wann einsetzen | Kosten |
|---------|------|---------------|--------|
| **Hero-Loop** (5s, autoplay, muted, geloopt) | Kling 3.0 Image-to-Video | IMMER bei Modul 1 | CHF 0.28-0.56/Betrieb |
| **Scroll-Animationen** (Sections fade/slide in) | framer-motion (bereits installiert) | IMMER | CHF 0 |
| **Parallax** (Hero-Bild bewegt sich beim Scroll) | CSS transform + Intersection Observer | IMMER | CHF 0 |
| **Service-Clips** (3-5s Loops pro Service) | Kling 3.0 | NUR Premium (ICP 8+) | CHF 1.40-2.80/Betrieb |

**Kling 3.0 Kernfakten:**
- Image-to-Video: Startbild → 5s Video, CHF 0.14 (Standard) bis 0.28 (Pro) pro Clip
- Latenz: 45-90 Sek pro Clip
- Qualitaet: Production-ready fuer Web. Natuerliche Bewegung (Stoff, Licht, Werkzeug)
- API: REST + async polling. Ueber fal.ai oder direkt.
- Seamless Loop: Kein nativer Loop-Modus. Loesung: Crossfade am Schnittpunkt oder Start+End-Frame identisch

**Ebene 4: TRUST-INSZENIERUNG**

Nicht "Bewertungen als Grid", sondern GEFUEHRTE Vertrauensbildung:

| Profil | Trust-Fuehrung | Visuelles Mittel |
|--------|---------------|-----------------|
| TRADITION | Geschichte → Team → Bewertungen | Timeline mit Motion, Familienfotos gross |
| NAEHE | Bewertungen → Lokalbezug → Notdienst | Bewertungszahl als Hero-Element, Karte prominent |
| KOMPETENZ | Services → Partner-Logos → Karriere | Service-Grid mit Clips, Partner-Leiste animiert |

**Ebene 5: WIZARD-INTEGRATION**

Der Wizard ist der Conversion-Endpunkt. Er muss nicht nur "da sein", sondern dramaturgisch VORBEREITET werden:

- Oben im Hero: "Anliegen melden" Button (sichtbar, aber nicht dominant)
- Im Akt 2 (Beweis): "Direkt online melden" als natuerlicher naechster Schritt
- Im Akt 4 (Handlung): Wizard-Einstieg als dedizierte Section (nicht nur ein Button)
- Auf Mobile: Sticky Footer-Bar mit "Anrufen" + "Online melden"

**Ebene 6: LOKALE IDENTITAET**

Nicht "Seit 1926 in Oberrieden" als Text, sondern visuelle Verankerung:

| Element | Umsetzung |
|---------|-----------|
| Banana-Atmosphaere | Lokales Szenario (Dorfstrasse, See, Berge) als Section-Hintergrund |
| Gemeinde-Karte | Interaktive Karte mit markiertem Einzugsgebiet (nicht nur Text-Liste) |
| Lokale Referenzen | Ortnamen in Bewertungen hervorheben |
| Service-Area als visuelles Element | Nicht als letzte Section, sondern als frueher Vertrauensanker |

**Ebene 7: CONVERSION-ARCHITEKTUR**

Jede Modul-1-Website hat genau 3 Conversion-Pfade:

```
Pfad 1: TELEFON   → Voice Agent (sofort erreichbar, 24/7)
Pfad 2: ONLINE    → Wizard (Meldungsformular, jederzeit)
Pfad 3: KONTAKT   → Direkt (Telefon, E-Mail, Adresse)
```

Alle 3 muessen above the fold SICHTBAR sein (nicht erst nach Scroll). Auf Mobile: Sticky-Bar mit 2 Icons (Telefon + Formular).

---

## 3. Rollen von CC / Banana / Kling 3.0

### CC (Claude Code) = Orchestrator + Code + Qualitaet

| CC macht | CC macht NICHT |
|----------|---------------|
| CustomerSite Config schreiben (Theme, Sections, Texte) | Design-Entscheidungen treffen (Founder entscheidet) |
| Banana/Kling API aufrufen, Kandidaten generieren | Bilder manuell bearbeiten |
| framer-motion Animationen implementieren | Custom CSS pro Betrieb schreiben |
| Section-Reihenfolge + Profil zuweisen | Endlose Feedback-Runden fuehren |
| Build + Deploy + QA (Lighthouse, Mobile-Check) | |
| Pipeline-Orchestrierung (alles in 1 Kommando) | |

### Banana (Nano Banana Pro) = Statische Bildidentitaet

| Banana macht | Banana macht NICHT |
|-------------|-------------------|
| Hero-Keyframes (5 Kandidaten, photorealistisch, 16:9) | Video/Motion (dafuer Kling) |
| Atmosphaeren-Bilder (Lokales Szenario) | Teamfotos (wirken unecht bei AI) |
| Service-Keyvisuals (wenn gecrawlte Bilder schwach) | Text generieren |
| Section-Hintergruende (subtile Texturen) | Logos oder Icons |

**Kosten:** CHF 0.03 pro Bild. 10 Bilder pro Betrieb = CHF 0.30.
**Qualitaet:** Bewiesen. Die heutigen 15 Hero-Kandidaten sind genuinely hochwertig.

### Kling 3.0 = Selektive Motion + Cinematische Differenzierung

| Kling macht | Kling macht NICHT |
|------------|-------------------|
| Hero-Loop (5s, aus Banana-Keyframe → Video) | Alle Service-Bilder animieren (Overkill) |
| Subtile Kamerabewegung, Lichtverschiebung | Komplexe Szenen mit Menschen |
| Werkzeug-Bewegung, Wasser-Fluss, Licht-Spiel | Teamfotos animieren |
| 1-3 Clips pro Betrieb (Hero + optional 1-2 Services) | Volle Videoproduktion |

**Kosten:** CHF 0.14-0.28 pro 5s Clip. 3 Clips pro Betrieb = CHF 0.42-0.84.
**Qualitaet:** Production-ready laut Reviews. Natuerliche Bewegung bei Stoffen, Licht, Werkzeugen.
**Integration:** REST API (fal.ai), async polling, ~60-90 Sek Latenz pro Clip.

### Was bewusst NICHT AI-generiert werden soll

| Element | Warum nicht AI |
|---------|---------------|
| **Texte** | FlowSight-Texte sind handgeschrieben, branchenspezifisch, Schweizer Tonalitaet. AI-Copy verliert Seele. |
| **Team-Fotos** | AI-generierte Personen wirken sofort unecht. Besser: echte Fotos oder gar kein Team-Bild. |
| **Logos** | Betrieb hat eigenes Logo oder braucht keines (Firmenname reicht). |
| **Layouts** | 3-4 feste Master-Directions > unendliche AI-Permutationen. Getestete Layouts > generierte. |

---

## 4. Fixe vs. variable Systembestandteile

### FIX (Systemkern, identisch fuer alle)

| Element | Warum fix |
|---------|-----------|
| Responsive Grid-System | Getestete Breakpoints > experimentelle |
| Nav-Komponente | Brand-Bar + Logo + Links + CTAs — bewährt |
| Footer | Impressum/Datenschutz/FlowSight-Credit — rechtlich noetig |
| Wizard-Integration | Wizard-Route bleibt identisch |
| Contact-Section Struktur | Adresse + Telefon + E-Mail + Karte |
| Performance-Budget | Lighthouse >= 85, Core Web Vitals |
| Accessibility-Basics | Kontrast, Alt-Texte, Tap-Targets |

### VARIABEL (profilbasiert)

| Element | Variation | Gesteuert durch |
|---------|-----------|----------------|
| **Hero** (Bild, Video, Layout, Text-Position) | 3-4 Varianten | theme.heroStyle + Banana + Kling |
| **Section-Reihenfolge** | Pro Profil verschieden | theme.sectionOrder |
| **Farbtemperatur** | warm / cool / neutral | theme.colorMode |
| **Font** | 4 Familien | theme.fontFamily |
| **Animations-Familie** | fade / slide / scale / none | theme.animation (NEU) |
| **Trust-Fuehrung** | Geschichte / Bewertungen / Partner / Notdienst | Abhaengig vom Profil |
| **Bildwelt** | AI-generiert, unique pro Betrieb | Banana + Kling |
| **Copy-Tonalitaet** | warm / sachlich / direkt | Manuell in Config |
| **Service-Praesentation** | Grid / Liste / Masonry / Scroll | theme.serviceLayout (NEU) |

### AI-GENERIERT (unique pro Betrieb)

| Element | Tool | Default vs. Premium |
|---------|------|-------------------|
| Hero-Keyframe | Banana | DEFAULT (immer) |
| Hero-Loop (5s Video) | Kling 3.0 | DEFAULT (immer bei Modul 1) |
| Atmosphaeren-Bild | Banana | DEFAULT |
| Service-Keyvisuals | Banana | PREMIUM (nur wenn gecrawlte Bilder schwach) |
| Service-Clips | Kling 3.0 | PREMIUM (nur ICP 8+) |

---

## 5. Master-Directions

### Direction A: TRADITION

**Wer:** Generationenbetriebe, >50 Jahre, Familientradition, Handwerks-Stolz
**Beispiel:** Doerfler AG (1926, 3. Generation)

| Ebene | Auspraegung |
|-------|-------------|
| Hero | **Split-Layout.** Links: warmer solider Hintergrund + Text + Stats. Rechts: Banana-Werkstatt + Kling Hero-Loop (subtile Lichtbewegung, Staub im Lichtstrahl). |
| Farbe | WARM. Cremig, goldene Akzente, warme Graus. |
| Font | Source Serif Pro (Headings) — Substanz, Würde, Tradition. |
| Dramaturgie | Akt 1: Hero (Werkstatt). Akt 2: GESCHICHTE (prominent, Timeline mit Scroll-Animation). Akt 3: Services. Akt 4: Bewertungen + Team + Kontakt. |
| Animation | Fade-in mit leichter Aufwaertsbewegung. Langsam, ruhig, wie ein Album durchblaettern. |
| Trust | Gruendungsjahr-Badge GROSS. Timeline als visuelles Hauptelement. Team-Fotos warm und menschlich. |
| Motion | Hero-Loop: Licht wandert langsam ueber Werkbank. Werkzeuge liegen still, nur das Licht lebt. |

### Direction B: NAEHE

**Wer:** Kleine Betriebe (1-5 MA), lokal verankert, persoenlicher Bezug, starke Bewertungen
**Beispiel:** Walter Leuthold (Solo, 4.9 Sterne, 44 Reviews)

| Ebene | Auspraegung |
|-------|-------------|
| Hero | **Center-Layout.** Vollbild Banana-Dorfszene + Kling Hero-Loop (Blaetter bewegen sich im Wind, See glitzert). Zentrierter grosser Text. Bewertungs-Badge prominent. |
| Farbe | WARM. Erdig, natuerlich, wie ein Spaziergang am See. |
| Font | DM Sans — freundlich, rund, zugaenglich. |
| Dramaturgie | Akt 1: Hero (Dorf + See). Akt 2: BEWERTUNGEN (gross, emotional, 4.9 Sterne als Hero-Element). Akt 3: Einzugsgebiet (Karte prominent). Akt 4: Services + Kontakt. |
| Animation | Slide-in von den Seiten. Leicht, natuerlich, wie eine Tuer die sich oeffnet. |
| Trust | Bewertungszahl als Hero-Stat. Ortsname ueberall prominent. "Ihr [Beruf] aus [Ort]" als Leitmotiv. |
| Motion | Hero-Loop: Blaetter bewegen sich, See glitzert im Abendlicht, leichte Kamerabewegung nach vorn. |

### Direction C: KOMPETENZ

**Wer:** Groessere Betriebe (5+ MA), breites Leistungsspektrum, professionelle Partner, technische Exzellenz
**Beispiel:** Orlandini (17 Markenpartner, 5 Fachbereiche)

| Ebene | Auspraegung |
|-------|-------------|
| Hero | **Classic-Layout.** Vollbild Banana-Praezisionswerkstatt + Kling Hero-Loop (Werkzeug bewegt sich subtil, LED flackert leicht). Linksbuendiger Text. Stats: "5 Fachbereiche · 17 Partner · Seit 1972". |
| Farbe | COOL. Reines Weiss, kuehle Akzente, Edelstahl-Gefuehl. |
| Font | Inter — modern, breit, professionell. |
| Dramaturgie | Akt 1: Hero (Werkstatt). Akt 2: SERVICES (Grid mit optionalen Mini-Clips). Akt 3: Partner-Logos + Karriere. Akt 4: Bewertungen + Kontakt. |
| Animation | Scale-in (Cards wachsen leicht rein). Praezise, technisch, kontrolliert. |
| Trust | Partner-Logos als visuelles Hauptelement. Karriere-Section zeigt "wir wachsen". Zertifikate prominent. |
| Motion | Hero-Loop: Metallisch, praezise. Werkzeug dreht sich leicht, Reflektion wandert ueber Edelstahl. |

### Direction D: HANDWERK (Reserve fuer kuenftige Branchen)

**Wer:** Elektriker, Maler, Schreiner — nicht Sanitaer/Heizung
**Wird definiert wenn der erste Nicht-Sanitaer-Betrieb kommt.**

---

## 6. Produktionslogik fuer 3 Websites pro Tag

### Pipeline-Ablauf (1 Betrieb, Ziel: 90 Min CC + 5 Min Founder)

```
PHASE 1: VORBEREITUNG (20 Min CC)
  1. prospect_card.json → Profil zuweisen (Regel-basiert)
  2. CustomerSite Config schreiben (Theme + Content + Sections)
  3. Website des Betriebs crawlen fuer Service-Bilder (wenn vorhanden)

PHASE 2: AI-GENERATION (15 Min CC, parallel)
  4. Banana: 5 Hero-Keyframe-Kandidaten generieren
  5. Banana: 1 Atmosphaeren-Bild (ServiceArea)
  6. Banana: 3 Service-Keyvisuals (wenn gecrawlte Bilder schwach)

PHASE 3: FOUNDER-REVIEW (5 Min Founder)
  7. Founder waehlt Hero-Keyframe (1 aus 5)
  8. Founder gibt "Go" fuer Atmosphaere + Service-Bilder

PHASE 4: MOTION-GENERATION (10 Min CC, parallel)
  9. Kling 3.0: Hero-Loop aus gewahltem Keyframe (3 Kandidaten, CHF 0.42-0.84)
  10. CC waehlt besten Loop (keine Artefakte, fluessige Bewegung)

PHASE 5: ASSEMBLY + DEPLOY (15 Min CC)
  11. Hero-Loop als WebM/MP4 einbinden (<video autoplay muted loop>)
  12. Alle Bilder platzieren
  13. Build + Deploy
  14. Lighthouse-Check (>= 85)

PHASE 6: QA (10 Min CC)
  15. Mobile-First Visual Check (Above the fold)
  16. Wizard funktioniert (E2E)
  17. Alle Links korrekt
  18. Keine AI-Artefakte sichtbar

TOTAL: ~90 Min CC + 5 Min Founder + CHF 0.72-1.14 API
```

### Bei 3 Websites pro Tag

```
09:00-10:30  Betrieb 1 (Phase 1-6)
10:30-11:00  Founder-Review Betrieb 1 + 2 + 3 (alle 3 parallel generiert in Phase 2+4)
11:00-12:30  Betrieb 2 (Phase 1-6)
13:30-15:00  Betrieb 3 (Phase 1-6)
15:00-16:00  QA + Deploy alle 3
```

**Optimierung:** Phase 2 + 4 (AI-Generation) laufen parallel waehrend CC an Phase 1 des naechsten Betriebs arbeitet. Reale CC-Arbeitszeit pro Betrieb: ~60 Min (Rest ist Warte-/Generierungszeit).

---

## 7. Minimaler erster Bauzustand

### Was JETZT gebaut werden muss (v1.0 der Maschine)

| # | Element | Aufwand | Impact |
|---|---------|---------|--------|
| **1** | **Kling 3.0 Integration** — Script das Banana-Keyframe → 5s Hero-Loop generiert | 2h CC | HOCH — verwandelt statische Sites in cinematische |
| **2** | **Hero-Video-Komponente** — `<video autoplay muted loop playsInline>` im Hero statt `<img>` | 1h CC | HOCH — sofort sichtbar, fundamental anderes Gefuehl |
| **3** | **framer-motion Scroll-Animationen** — Sections faden/sliden beim Scrollen rein | 2h CC | MITTEL-HOCH — macht die Seite "lebendig" |
| **4** | **Service-Layout-Variante** — 2-Spalter mit grossem Bild statt 3-Spalter-Grid | 2h CC | MITTEL — bricht den staerksten Fingerabdruck nach dem Hero |
| **5** | **Sticky Mobile CTA** — "Anrufen" + "Online melden" als permanente Footer-Bar | 1h CC | MITTEL — Conversion-Hebel |
| **6** | **Parallax Hero** — Bild bewegt sich subtil beim Scroll | 30 Min CC | NIEDRIG-MITTEL — subtiler Qualitaetseindruck |

### Was SPAETER kommt (v2.0)

- Service-Clips via Kling (nur Premium)
- Interaktive Karte statt Text-Liste (ServiceArea)
- Review-Carousel statt Grid
- Team-Section mit Motion (wenn echte Fotos vorhanden)

### Was NIE kommt

- AI-generierte Texte
- AI-generierte Teamfotos
- Unbegrenzte Feedback-Loops
- Custom CSS pro Betrieb
- Mehr als 4 Master-Directions

---

## 8. Entscheidung: Was wir als Naechstes wirklich bauen

### Der eine Schritt der alles aendert

**Kling 3.0 Hero-Loops.**

Wenn die 3 Websites (Doerfler, Leuthold, Orlandini) statt statischer JPEG-Heros jeweils einen 5-Sekunden-Video-Loop haben — mit Lichtbewegung, Wind, subtiler Kamerabewegung — dann fuehlen sie sich fundamental anders an als jede andere Handwerker-Website in der Schweiz.

Das ist der Unterschied zwischen "nettes Template" und "wow, das ist eine andere Klasse."

### Konkrete naechste Schritte

| Tag | Was | Output |
|-----|-----|--------|
| **Heute** | Kling 3.0 API einrichten (fal.ai Account oder Direct API) | API-Zugang verifiziert |
| **Heute** | Script: `generate_hero_loop.mjs` (Banana-Keyframe → Kling → 5s WebM) | Pipeline-Script |
| **Heute** | 3 Hero-Loops generieren (Doerfler, Leuthold, Orlandini) | 3 Videos |
| **Morgen** | Hero-Komponente auf `<video>` umbauen (mit `<img>` Fallback) | Code-Aenderung |
| **Morgen** | framer-motion Scroll-Animationen (Sections) | Lebendigkeit |
| **Morgen** | Deploy + Founder-Review | **ECHTER PROOF** |

### Proof-Kriterium (verschaerft)

Der Proof ist BESTANDEN wenn:
1. Alle 3 Sites haben Video-Heros (keine statischen Bilder)
2. Jeder Hero hat eine andere Bewegungssprache (Licht vs. Wind vs. Metall)
3. Sections animieren beim Scrollen
4. Founder sagt: "Das ist eine andere Klasse als vorher" (nicht nur "sieht besser aus")
5. Ein externer Betrachter wuerde NICHT erkennen, dass alle 3 vom selben System kommen

### Was wir NICHT mehr tun

- Keine weiteren Font-Swaps, Farbmodi-Tweaks oder Section-Reihenfolge-Optimierungen
- Keine CSS-Kosmetik
- Kein "verbessertes Template"
- Stattdessen: **Cinematische Bildwelt + Motion + Dramaturgie = neue Klasse**
