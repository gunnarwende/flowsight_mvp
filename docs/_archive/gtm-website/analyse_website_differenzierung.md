# Modul 1 Website-Differenzierung — Strategische Analyse + Entscheidungsvorlage

**Datum:** 2026-04-14
**Autor:** CC (Head Ops)
**Datengrundlagen:** 6 Live-CustomerSite-Configs, `page.tsx` (672 Zeilen), `types.ts` (238 Zeilen), 34 Scout-Datensaetze, Gemini/Banana/Veo API-Erfahrung, Pricing-Modell, Machine Manifest v3.1
**Zweck:** Belastbare Produkt-/Delivery-/GTM-Entscheidung fuer Modul 1

---

## 1. Executive Verdict

**Modul 1 lohnt sich — aber nur mit einer klaren Identitaets-Pipeline, nicht mit kosmetischer Template-Variation.**

Die mathematische Formel "4 Layouts x 4 Heros x 4 Farben x 4 Fonts = 256 Kombinationen" loest das Problem NICHT. Ein Handwerker erkennt nicht Grids und Fonts. Er erkennt **Stimmung, Bildsprache und den ersten Eindruck in 2 Sekunden.** Wenn zwei Websites aus derselben Stimmungswelt kommen — egal ob die eine 3-Spalter und die andere 2-Spalter hat — fallen sie als "gleich" auf.

Der echte Differenzierungshebel liegt daher NICHT in CSS-Varianten, sondern in:
1. **AI-generierten Hero-Bildwelten** (Nano Banana Pro) — pro Betrieb eine einzigartige visuelle Identitaet
2. **Dramaturgischer Section-Gewichtung** — welcher Betrieb fuehrt mit Tradition, welcher mit Bewertungen, welcher mit Notdienst
3. **Copy-Tonalitaet** — sachlich-professionell vs. warm-familiär vs. bodenstaendig-direkt

Banana/Veo ist dabei kein "huebscheres Beiwerk", sondern der einzige Hebel, der echte Wahrnehmungs-Identitaet erzeugt, ohne manuellen Design-Aufwand zu verursachen. Kein anderes Tool kann fuer CHF 0.15 pro Betrieb eine genuinely einzigartige Bildwelt erzeugen.

**Urteil: (a) Modul 1 gezielt weiterentwickeln — aber NUR auf der Wahrnehmungsachse (Bildwelt + Dramaturgie + Tonalitaet), NICHT auf der Technikachse (Grids, Fonts, Animationen).**

---

## 2. Wie die aktuelle Website-Pipeline heute funktioniert

### Datenmodell

Jeder Kunde ist ein statisches TypeScript-Objekt (`CustomerSite`-Interface, 238 Zeilen). Die Felder:

- **Identitaet:** slug, companyName, tagline, brandColor (1 Hex-Wert), metaDescription
- **Inhalt:** services[] (5-6 Stueck), gallery[] (Bilder pro Service), reviews, team[], history[], certifications[], brandPartners[], careers[]
- **Kontakt:** contact (Adresse, Telefon, E-Mail, Oeffnungszeiten), emergency, voicePhone
- **System:** categories[] (Wizard), modus (1 oder 2), serviceArea (Gemeinden)

**Was das Datenmodell NICHT hat:** Kein Feld fuer Layout, Theme, Font, Animation, Hero-Stil, Section-Reihenfolge, Farbmodus, Bildstimmung oder Copy-Tonalitaet.

### Rendering

Eine einzige Datei (`page.tsx`, 672 Zeilen) rendert alles. 11 Inline-Section-Components:

```
Nav → Hero → Services → Reviews → ServiceArea → Team → History → Trust → Careers → Contact → Footer
```

Diese Reihenfolge ist **hardcoded**. Keine Konfiguration, kein Override, keine Variation.

### Asset-Pipeline

Hero-Bilder: Manuell als JPEG in `public/kunden/[slug]/hero.jpg`. Service-Bilder: Manuell in Unterordner. Quelle: Puppeteer-Crawl der alten Website des Kunden. **Keine AI-Generierung, keine automatisierte Bildproduktion.**

### Die 6 Live-Sites im Vergleich

| Betrieb | Farbe | Sections | Hero-Bild | Stimmung |
|---------|-------|----------|-----------|----------|
| Doerfler AG | #2b6cb0 (Blau) | 10/10 | Gecrawlt | Professionell-blau |
| Walter Leuthold | #203784 (Dunkelblau) | 8/10 | Gecrawlt | Professionell-blau |
| Weinberger AG | #004994 (Navy) | 8/10 | Gecrawlt | Professionell-blau |
| Brunner | #0d7377 (Teal) | 10/10 | Gecrawlt | Etwas waermer |
| Orlandini | #1a5276 (Navy) | 7/10 | Gecrawlt | Professionell-blau |
| Widmer | #1a4b8c (Navy) | 6/10 | Gecrawlt | Professionell-blau |

**5 von 6 sind Blau-Varianten.** Der Stimmungsunterschied zwischen Doerfler (#2b6cb0) und Widmer (#1a4b8c) ist fuer das menschliche Auge marginal.

---

## 3. Wo genau das Template-Problem entsteht

### Die 5 Fingerabdruecke (nach visuellem Impact geordnet)

**Fingerabdruck 1: Die Hero-Zone (Above the fold)**
Jeder Hero folgt exakt demselben Schema: Vollbild-Hintergrund → dunkler Gradient (from-gray-900/90 via-gray-900/80 to-gray-900/55) → links ausgerichteter Textblock (Badge "Seit XXXX", H1, Tagline, 2 CTAs) → Stats-Leiste (Jahre, Sterne, Fachbereiche, Gemeinden). Das ist der ERSTE Eindruck. Wer eine FlowSight-Site gesehen hat, erkennt jede andere sofort.

**Fingerabdruck 2: Das Section-Muster**
Scroll-Rhythmus: Weiss → Grau → Weiss → Grau. Jede Section: zentrierter Titel (text-3xl font-bold), Untertitel (text-lg text-gray-600), dann Grid. Immer dieselbe Kadenz. Kein einziger Betrieb hat eine andere Dramaturgie.

**Fingerabdruck 3: Die Service-Cards**
Immer 3-Spalten-Grid. Immer Icon → Name → 2 Saetze → "Mehr" → Bildstreifen. Immer gleiche Card-Hoehe, gleicher Radius, gleicher Schatten. Das ist die groesste Section nach dem Hero.

**Fingerabdruck 4: Die Farbwelt**
Mono-Akzent: Ein Hex-Wert fuer alles (Buttons, Icons, Nav-Balken, Links). Rest: Grau/Weiss. Kein Betrieb hat warme Toene, dunkle Hintergruende, farbige Sections oder eine zweite Akzentfarbe.

**Fingerabdruck 5: Die Stille**
Null Animationen. Null Motion. Null visuelle Ueberraschung. Jede Section erscheint sofort, statisch, gleichfoermig. Trotz installiertem framer-motion (v12.38) wird es nirgends eingesetzt.

### Warum die Fingerabdruecke so stark wirken

Jeder einzelne waere tolerierbar. Zusammen erzeugen sie einen "Geruch", der unbewusst erkannt wird. Ein Handwerker, der 2 Sekunden auf eine FlowSight-Website schaut, weiss nicht WAS gleich ist — aber er FUEHLT dass es gleich ist. Das ist gegenüber einem Betriebs-Inhaber, der Stolz auf seine Firma hat, fatal.

---

## 4. Wie gross das Risiko regionaler Aehnlichkeit wirklich ist

### Geographische Ueberlappung

Alle 6 Live-Sites sitzen in einem 15km-Streifen am linken Zuerichseeufer:

| Gemeinde | Doerfler | Leuthold | Weinberger | Brunner | Orlandini | Widmer |
|----------|:--------:|:--------:|:----------:|:-------:|:---------:|:------:|
| Oberrieden | x | x | x | x | x | x |
| Thalwil | x | x | x | x | x | x |
| Horgen | x | x | x | x | x | x |
| Kilchberg | x | x | x | x | x | x |
| Adliswil | x | x | x | x | x | x |
| Waedenswil | x | x | x | x | x | x |

**Doerfler + Leuthold: beide Oberrieden.** Weinberger + Brunner: beide Thalwil. Orlandini + Widmer: beide Horgen. Drei Betriebspaare in derselben Gemeinde.

### Konkrete Entdeckungsszenarien

1. **Google-Suche "Sanitaer Thalwil"** → Weinberger + Brunner in den Ergebnissen, beide mit FlowSight-Website
2. **suissetec-Regionalversammlung** → Handwerker aus derselben Region kennen sich, zeigen sich Websites
3. **Immobilienverwaltung vergleicht Offerten** → oeffnet Doerfler + Leuthold Website nebeneinander
4. **Endkunde in Oberrieden** → braucht Sanitaer, klickt 3 lokale Ergebnisse durch

### Risikobewertung

**Aktuell (6 Sites, gleiche Region): HOCH.** Die Wahrscheinlichkeit, dass jemand 2+ FlowSight-Sites vergleicht, ist nicht theoretisch — sie ist strukturell gegeben durch die identischen Einzugsgebiete.

**Bei 10-15 Sites in der Region: SICHER.** Template-Erkennung wird unvermeidbar.

**Aber:** Modul 1 ist jetzt optional (15-25%). Wenn wir diszipliniert sind — keine zwei direkten Konkurrenten in derselben Gemeinde mit Modul 1 — und die Wahrnehmung genuegend differenzieren, ist das Risiko handhabbar.

---

## 5. Was mit 2026-Tools technisch moeglich ist

### 5.1 Nano Banana Pro (Gemini Flash Image) — DER Differenzierungshebel

**Was es kann:** Photorealistische Bilder aus Text-Prompts. Bereits bewiesen in der FlowSight-Pipeline (`generate_keyframe.mjs`, `generate_5_keyframes.mjs`). Qualitaet: gut genug fuer Hero-Bilder bei 1280px+ Aufloesung.

**Wo Banana echte Identitaet schafft:**

| Einsatz | Beispiel-Prompt | Aufwand | Kosten | Wirkung |
|---------|----------------|---------|--------|---------|
| **Hero-Bild** | "Professional Swiss plumbing workshop, warm afternoon light, copper pipes, modern tools, Lake Zurich visible through window" | CC generiert 5, Founder waehlt 1 | CHF 0.15 | **HOCH** — erster Eindruck, unique pro Betrieb |
| **Service-Keyvisuals** | "Close-up of bathroom renovation in Swiss apartment, half-tiled wall, professional tools, warm tones" | CC generiert 3 pro Service | CHF 0.09/Service | **MITTEL** — ersetzt gecrawlte Bilder, konsistentere Qualitaet |
| **Lokale Atmosphaere** | "Aerial view of Thalwil at Lake Zurich, Swiss village, morning light, residential area" | CC generiert 3 | CHF 0.09 | **MITTEL** — gibt der ServiceArea-Section Lokalkolorit |
| **Betriebsportraet** | "Swiss plumbing team of 5 in blue work clothes, standing in front of a traditional building, professional, friendly" | CC generiert 5 | CHF 0.15 | **NIEDRIG** — AI-Teamfotos wirken unecht, besser echte Fotos |

**Pipeline CC + Banana (ohne Agentur-Hoelle):**

```
1. CC liest prospect_card.json (Branche, Ort, Team-Groesse, Spezialisierung)
2. CC generiert 3 Prompts pro Bild-Typ (Hero, ServiceArea, ggf. Service-Keyvisuals)
3. CC ruft Banana API auf → 5 Kandidaten pro Prompt
4. CC legt Kandidaten in production/hero_candidates/{slug}/ ab
5. Founder waehlt 1 Hero + 1 Atmosphaere (30 Sekunden, 2 Klicks)
6. CC integriert in CustomerSite Config
```

**Gesamtaufwand pro Betrieb:** 10 Min CC, 30 Sek Founder, CHF 0.30-0.50.
**Gesamtwirkung:** Jeder Betrieb hat eine genuinely einzigartige Hero-Bildwelt. Nicht gecrawlt, nicht Stock, nicht das gleiche Bild in anderer Farbe.

### 5.2 Veo 3.1 (Image-to-Video) — Der Premium-Hebel

**Was es kann:** 5-8 Sekunden Video aus einem Startbild. Bereits bewiesen (`generate_hero_final.mjs`). Qualitaet: cinematisch, konsistent dank Keyframe-Methode.

**Wo Veo echte Identitaet schafft:**

| Einsatz | Beschreibung | Aufwand | Kosten | Wirkung |
|---------|-------------|---------|--------|---------|
| **Hero-Loop (5s)** | Banana-Keyframe → Veo animiert: Haende arbeiten, Licht aendert sich, leichte Kamerabewegung | CC generiert 3, Founder waehlt 1 | CHF 0.50-1.00 | **SEHR HOCH** — cinematischer Hero, hebt sich von JEDEM Mitbewerber ab |
| **Service-Clip** | Service-Keyvisual → Veo animiert: Tool-Bewegung, Wasser fliesst, Flamme brennt | CC generiert 1 pro Service | CHF 0.50/Service | **HOCH** — aber Overkill fuer MVP |

**Ehrliche Einschaetzung Veo fuer Modul 1:**
- Hero-Loop: **JA, lohnt sich.** Ein 5-Sekunden-Loop als Hero-Hintergrund hebt die Website auf ein Level, das kein Handwerker-Mitbewerber hat. Und kein zweiter FlowSight-Kunde hat denselben Loop.
- Service-Clips: **NEIN, Overkill.** 6 Services × 1 Clip = CHF 3.00 + 30 Min CC-Zeit + Ladezeit-Impact. Der ROI stimmt nicht.

**Pipeline CC + Veo fuer Hero-Loop:**

```
1. Banana generiert Hero-Keyframe (siehe 5.1)
2. CC schreibt Veo-Prompt: "Subtle motion: hands working on pipes, light shifts slowly, camera barely moves. 5 seconds."
3. CC ruft Veo Image-to-Video API auf → 3 Kandidaten
4. CC waehlt bestes Ergebnis (Qualitaetspruefung: keine Artefakte, fluessige Bewegung)
5. CC konvertiert zu WebM/MP4 (kurz, geloopt, ~2MB)
6. Integration als <video autoPlay muted loop> im Hero statt statischem Bild
```

**Gesamtaufwand pro Betrieb:** 15 Min CC, CHF 0.50-1.00.
**Lohnt sich wenn:** Betrieb ist Modul-1 UND High-ICP (8+) UND Generationenbetrieb oder Premium-Positionierung.

### 5.3 Framer Motion — Subtile Differenzierung (bereits installiert)

Animationen allein erzeugen keine Identitaet. Aber sie verstaerken den Gesamteindruck. Verschiedene Animations-Familien (fade-up vs. slide-in vs. scale) geben jeder Site eine eigene "Handschrift" in der Scroll-Erfahrung.

**Aufwand:** 2-3 Stunden einmalig (Section-Wrapper mit `whileInView`), dann 0 Minuten pro Betrieb (Animation-Familie wird in der Config gesetzt).

### 5.4 Was NICHT lohnt

- **AI-generierte Teamfotos:** Wirken unecht. Echte Fotos oder gar keine.
- **AI-generierte Texte:** FlowSight-Texte sind handgeschrieben und hochwertig. AI-Copy wuerde die Qualitaet senken.
- **Generative CSS/Layouts:** Over-engineered. 3-4 feste Layout-Varianten schlagen infinite Permutationen.
- **Per-Betrieb Custom Components:** Wartungs-Hoelle. Feste Komponenten mit datengetriebener Variation.

---

## 6. Empfohlene Zielarchitektur — Wahrnehmungs-Identitaet

### 6.1 Das Wahrnehmungs-Modell

Mathematische Kombinationen (Layout x Font x Farbe) erzeugen **technische Variation**. Ein Mensch nimmt aber **Stimmung** wahr. Die Stimmung einer Website entsteht durch das Zusammenspiel von 6 Achsen:

| Achse | Was der Besucher fuehlt | Wie wir es steuern |
|-------|------------------------|--------------------|
| **Hero-Dramaturgie** | "Das ist ein serioeser/moderner/warmer Betrieb" | Banana-Bildwelt + Veo-Loop + Hero-Stil |
| **Bildregie** | "Diese Bilder passen zu DIESEM Betrieb" | Banana-generiert pro Betrieb (nicht gecrawlt) |
| **Section-Gewichtung** | "Dieser Betrieb ist stolz auf Tradition/Team/Bewertungen" | Section-Reihenfolge + welche Section PROMINENT ist |
| **Copy-Tonalitaet** | "Diese Leute reden wie ich" | 3 Tonalitaets-Profile (sachlich/warm/direkt) |
| **Trust-Inszenierung** | "Diesem Betrieb kann ich vertrauen" | Was ZUERST gezeigt wird: Bewertungen? Team? Tradition? Notdienst? |
| **Above-the-fold** | "Will ich weiterscrollen?" | Hero + erster Satz + erste Zahl (2 Sekunden Entscheidung) |

### 6.2 Drei Wahrnehmungs-Profile statt 256 Kombinationen

Statt unendlich zu kombinieren, definieren wir **3 klare Identitaets-Profile**, die sich genuegend unterscheiden:

**Profil TRADITION (fuer Generationenbetriebe, 30+ Jahre)**
- Hero: Splitscreen — grosses Bild rechts (Werkstatt/Handwerk), Text links auf solidem Hintergrund. Warm, ruhig.
- Banana-Prompt: "Traditional Swiss workshop, warm wood tones, patina, brass fittings, morning light through frosted window"
- Veo: Subtil — Licht aendert sich, Staub tanzt im Lichtstrahl. Zeitlos.
- Above-the-fold: "Seit [JAHR]" Badge prominent, Bewertungssterne, Firmenname gross
- Section-Reihenfolge: Hero → Geschichte → Leistungen → Bewertungen → Team → Kontakt
- Copy: Warm, respektvoll. "Vertrauen seit drei Generationen." Sorgfalt, Handwerk, Werte.
- Farbe: Warm (cremiger Hintergrund, warme Akzente)
- Font: Source Serif Pro (Headings) — Tradition, Substanz

**Profil KOMPETENZ (fuer moderne, wachsende Betriebe, 5-30 Jahre)**
- Hero: Klassisch links — Vollbild mit dunklem Gradient, praegnante Headline. Klar, professionell.
- Banana-Prompt: "Modern Swiss plumbing workshop, stainless steel, LED lighting, organized tool wall, clean concrete floor"
- Veo: Dynamischer — Kamerabewegung, Werkzeuge, Bewegung. Energie.
- Above-the-fold: Sterne + Fachbereiche prominent, Headline fokussiert auf Kompetenz
- Section-Reihenfolge: Hero → Leistungen → Bewertungen → Einzugsgebiet → Team → Kontakt
- Copy: Sachlich-professionell. "Kompetenz aus einer Hand." Effizienz, Qualitaet, Loesungsorientierung.
- Farbe: Cool (reines Weiss, kühle Akzente)
- Font: Inter — Modern, klar, breit

**Profil NAEHE (fuer kleine Betriebe, 1-5 MA, lokal verankert)**
- Hero: Zentriert — grosser Text, Bild eher als Stimmung im Hintergrund (dunkler Overlay). Direkt, menschlich.
- Banana-Prompt: "Small Swiss village street, residential door with brass nameplate, warm evening light, Lake Zurich in background"
- Veo: Ruhig — Kamera steht still, nur natuerliche Bewegung (Blätter, Licht). Geborgenheit.
- Above-the-fold: Gemeinde-Name prominent, Notdienst-CTA wenn vorhanden, Bewertungen
- Section-Reihenfolge: Hero → Einzugsgebiet → Bewertungen → Leistungen → Kontakt
- Copy: Bodenstaendig-direkt. "Ihr Sanitaer aus [ORT]." Naehe, Erreichbarkeit, Verlaesslichkeit.
- Farbe: Warm (cremiger Hintergrund, erdige Toene)
- Font: DM Sans — Freundlich, rund, zugaenglich

### 6.3 Zuordnung der 6 aktuellen Betriebe

| Betrieb | Profil | Warum |
|---------|--------|-------|
| Doerfler AG (seit 1926, 3. Generation) | TRADITION | 98 Jahre, 2 Geschaeftsfuehrer, Geschichte als Hauptmerkmal |
| Walter Leuthold (seit 2001, Ein-Mann-Betrieb) | NAEHE | Solo-Unternehmer, Oberrieden, 4.9 Sterne — Naehe + Vertrauen |
| Weinberger AG (seit 1912, Thalwil) | TRADITION | 112 Jahre (!), Generationenbetrieb, staerkstes Traditionsargument |
| Brunner Haustechnik (seit 2003, 8 MA) | KOMPETENZ | Groesstes Team, modernster Betrieb, 52 Reviews — Leistung |
| Orlandini (seit 1972, 17 Markenpartner) | KOMPETENZ | Starkes Partnernetzwerk, breites Leistungsspektrum |
| Widmer (seit 1898, 126 Jahre!) | TRADITION | Aeltester Betrieb, aber wenig Content — Tradition als einziger Hebel |

**Ergebnis:** Doerfler und Leuthold (beide Oberrieden) haetten VERSCHIEDENE Profile. Weinberger und Brunner (beide Thalwil) haetten VERSCHIEDENE Profile. Orlandini und Widmer (beide Horgen) haetten VERSCHIEDENE Profile. Jedes Gemeinde-Paar sieht genuegend anders aus.

### 6.4 Above-the-fold: Die entscheidenden 2 Sekunden

Was der Besucher in den ersten 2 Sekunden sieht, bestimmt ob er bleibt:

**TRADITION:** Warmes Werkstatt-Bild (Banana) mit Lichtbewegung (Veo). Badge "Seit 1926". Firmenname gross. Goldener Farbton. → Gefuehl: "Substanz."

**KOMPETENZ:** Modernes Werkstatt-Bild (Banana) mit Kamerabewegung (Veo). Sterne prominent. "Kompetenz aus einer Hand." Kühler Farbton. → Gefuehl: "Professionalitaet."

**NAEHE:** Lokales Dorfbild (Banana) mit ruhiger Atmosphaere (Veo). Gemeinde-Name prominent. Warmer Farbton. → Gefuehl: "Die kenne ich."

Drei KOMPLETT unterschiedliche Ersteindruecke. Aus demselben Template-System.

---

## 7. Minimal sinnvolle Evolutionsstufe in 2-4 Wochen

### Prioritaet nach Impact/Aufwand

| Prio | Massnahme | Impact | Aufwand | Wann |
|------|-----------|--------|---------|------|
| **1** | Banana Hero-Bilder fuer alle 6 Sites generieren | SEHR HOCH | 1h CC + 5 Min Founder | Woche 1 |
| **2** | 3 Wahrnehmungs-Profile definieren (TRADITION/KOMPETENZ/NAEHE) | HOCH | 2h CC (Theme-Objekt in types.ts, 3 Hero-Varianten in page.tsx) | Woche 1-2 |
| **3** | Section-Reihenfolge datengesteuert machen | HOCH | 3h CC | Woche 2 |
| **4** | Veo Hero-Loops fuer 2-3 Premium-Sites | MITTEL-HOCH | 2h CC, CHF 2-3 | Woche 2-3 |
| **5** | Farbmodus (warm/cool/cremig) pro Profil | MITTEL | 2h CC | Woche 3 |
| **6** | framer-motion Scroll-Animationen | NIEDRIG | 2h CC | Woche 3-4 |
| **7** | Font-Variation (3 Familien) | NIEDRIG | 1h CC | Woche 4 |

### Wenn du NUR EINE SACHE tust

**Banana Hero-Bilder.** 1 Stunde Aufwand, 6 unique Heros, sofort sichtbar. Das allein bricht den staerksten Fingerabdruck (Fingerabdruck 1: identischer Hero-Stil mit gecrawlten Bildern).

### Wenn du ZWEI SACHEN tust

Banana Heros + 3 Wahrnehmungs-Profile (mit Section-Reihenfolge). 5 Stunden Aufwand. Danach sind keine zwei Sites in derselben Gemeinde mehr verwechselbar.

### Wenn du in 4 Wochen den vollen Sprung willst

Prio 1-6 = ~12 Stunden CC-Aufwand verteilt auf 4 Wochen. Ergebnis: 3 klar unterscheidbare Identitaets-Profile mit AI-generierten Bildwelten, variablen Heros (teil mit Veo-Loop), datengesteuerter Section-Reihenfolge und Farbmodi.

---

## 8. Auswirkungen auf Delivery, Marge und Skalierung

### Delivery-Aufwand: Vorher vs. Nachher

| Schritt | Heute | Mit Banana+Profile | Delta |
|---------|-------|-------------------|-------|
| Website-Config schreiben (300 Zeilen TS) | 2-3h | 2.5-3.5h (+Profil-Zuweisung) | +30 Min |
| Hero-Bild beschaffen | 30 Min (Crawl + manuell) | 10 Min (Banana generiert, Founder waehlt) | **-20 Min** |
| Service-Bilder | 1h (Crawl + sortieren) | 30 Min (Banana fuer fehlende, Crawl fuer vorhandene) | -30 Min |
| Feedback-Loops (Founder) | 2-4h (Farben, Texte, "gefaellt mir nicht") | **0-30 Min** (Profil ist vorgewaehlt, kein Design-Feedback noetig) | **-2-3h** |
| **Total pro Betrieb** | **~5-8h** | **~3-4.5h** | **-2-3h** |

**Der groesste Gewinn:** Feedback-Loops fallen weg. Wenn der Betrieb eines von 3 Profilen bekommt (nicht "sein" Custom-Design), gibt es nichts zu diskutieren. "Ihr Betrieb hat das Profil TRADITION — das passt zu Ihrer 98-jaehrigen Geschichte." Punkt.

### API-Kosten pro Betrieb

| Tool | Einsatz | Kosten |
|------|---------|--------|
| Banana (Hero, 5 Kandidaten) | 5 Bilder | CHF 0.15 |
| Banana (ServiceArea, 3 Kandidaten) | 3 Bilder | CHF 0.09 |
| Veo (Hero-Loop, 3 Kandidaten) | 3 Videos | CHF 0.50-1.00 |
| **Total ohne Veo** | | **CHF 0.24** |
| **Total mit Veo** | | **CHF 0.74-1.24** |

Bei CHF 299/Mo Pricing und 8 Monaten Retention (CHF 2'392 Lifetime): API-Kosten = 0.01-0.05% des Umsatzes. **Vernachlaessigbar.**

### Marge-Vergleich

| Szenario | Delivery-Kosten (Founder-Zeit @ CHF 100/h) | API | Total | Marge (auf 8 Mo LTV CHF 2'392) |
|----------|---------------------------------------------|-----|-------|------|
| Heute (Modul 1, 5-8h) | CHF 500-800 | CHF 0 | CHF 500-800 | 67-79% |
| Banana + Profile (3-4.5h) | CHF 300-450 | CHF 0.24-1.24 | CHF 300-451 | **81-87%** |

**Banana + Profile ist PROFITABLER als der Status quo** weil Feedback-Loops wegfallen.

### Skalierbarkeit

| Metrik | Heute | Mit Banana + Profile |
|--------|-------|---------------------|
| Sites pro Woche (1 CC) | 1-2 | 2-3 |
| Founder-Zeit pro Site | 2-4h | 30 Min |
| Maximale Sites bevor Template auffaellt | ~8-10 (regional) | ~30-40 (3 Profile, AI-Bildwelten) |
| Sites in derselben Gemeinde | 1 (danach auffaellig) | 2 (verschiedene Profile) |

### Ist Banana/Veo ein "Banger" oder nur huebscheres Beiwerk?

**Banana ist ein operativer Banger.** Nicht weil die Bilder huebscher sind (obwohl sie das sind), sondern weil:
1. Jeder Hero ist genuinely einzigartig → Template-Erkennung gebrochen
2. Kein Crawlen, kein Sortieren, kein "die Bilder von der alten Website sind schlecht" → Delivery schneller
3. Keine Feedback-Loops zu Bildern → Founder-Zeit gespart
4. Konsistente Qualitaet → kein Betrieb hat "schlechte" Hero-Bilder

**Veo ist ein Premium-Banger.** Fuer 2-3 Betriebe pro Quartal, die wirklich beeindrucken sollen. Nicht Default, aber verfuegbar als "Wow"-Moment. Ein 5-Sekunden cinematischer Hero-Loop auf einer Handwerker-Website ist in der Schweiz einzigartig. Kein einziger Mitbewerber hat das.

---

## 9. Klare Empfehlung

### Urteil: (a) Modul 1 gezielt weiterentwickeln

Aber mit klarer Abgrenzung:

**WAS weiterentwickeln:**
- Banana-generierte Hero-Bildwelten (Default fuer alle Modul-1-Sites)
- 3 Wahrnehmungs-Profile (TRADITION/KOMPETENZ/NAEHE) mit datengesteuerter Section-Reihenfolge
- Veo Hero-Loops fuer Premium-Faelle (optional, selektiv)
- Farbmodi (warm/cool/cremig) pro Profil

**WAS NICHT weiterentwickeln:**
- Keine neuen Seitentypen
- Keine Custom-Designs pro Betrieb
- Keine unbegrenzten Feedback-Loops (1 Runde, dann Freeze)
- Keine AI-generierten Texte (handgeschrieben bleibt)

**Regeln fuer Modul 1:**
1. Maximal 2 Modul-1-Betriebe pro Gemeinde (verschiedene Profile Pflicht)
2. Maximal 20% der Kunden sind Modul 1
3. Profil wird von CC zugewiesen, nicht vom Betrieb gewaehlt
4. 1 Feedback-Runde, dann Freeze
5. Banana-Hero ist Standard, Veo-Loop ist optional (nur bei ICP 8+)

### Begruendung

- **Marge steigt** (weniger Feedback-Loops, schnellere Delivery)
- **Wahrnehmung wird genuinely individuell** (Banana-Bildwelten + Profile)
- **Template-Risiko wird beherrschbar** (3 Profile × AI-Bilder = genuegend Variation fuer 30-40 Sites regional)
- **Founder-Aufwand sinkt** (von 2-4h auf 30 Min pro Site)
- **Kein Agentur-Risiko** (Profile sind fix, nicht verhandelbar)

### Was passiert wenn wir das NICHT tun

Modul 1 bleibt auf dem aktuellen Stand. Das heisst:
- Naechste 3-4 Sites in der Region → Template wird erkannt
- Betriebsinhaber reden untereinander → "Das ist doch dieselbe Website"
- FlowSight-Ruf leidet → "Die machen nur Schablonen"
- Modul 1 muss spaeter KOMPLETT eingestellt werden (statt kontrolliert weitergefuehrt)

---

## 10. Fehlende Daten / Naechste Evidenz

| # | Datenluecke | Wie erheben | Prioritaet |
|---|------------|------------|-----------|
| 1 | **Banana-Qualitaet fuer Handwerker-Kontexte.** Generiert Banana genuegend realistische Schweizer Werkstatt-Bilder? | 10 Test-Prompts generieren (1h CC), Founder bewertet | HOCH — vor Implementierung |
| 2 | **Veo-Loop Ladezeit.** Wie gross ist ein 5s WebM-Loop? Welcher Impact auf Lighthouse? | 1 Test-Video generieren, Lighthouse vorher/nachher | MITTEL — vor Veo-Entscheidung |
| 3 | **Doerfler-Feedback.** Sagt Doerfler "Die Website ist toll" oder "Das Telefonsystem ist toll"? | Trial Day 10 Follow-up | HOCH — validiert ob Website ueberhaupt zaehlt |
| 4 | **Prospect-Vergleich.** Hat ein Prospect je 2 FlowSight-Sites verglichen? | Tracking auf Customer-Websites (einmalige IP-Analyse) | NIEDRIG — erst relevant bei 10+ Sites |
| 5 | **Wettbewerber-Websites.** Wie sehen die aktuellen Websites der 34 Scout-Betriebe aus? | Stichprobe: 10 Websites screenshotten, visuelle Baseline dokumentieren | MITTEL — zeigt ob FlowSight-Template trotzdem besser ist als der Marktstandard |
| 6 | **Banana vs. Stock-Bilder.** Ist Banana genuegend besser als Unsplash/Pexels, um den Aufwand zu rechtfertigen? | 5 Banana-Heros vs. 5 Stock-Heros Blindtest mit Founder | MITTEL |

---

## Zusammenfassung in drei Saetzen

Modul 1 hat ein echtes Template-Problem, das mit CSS-Variation allein nicht loesbar ist. Banana-generierte Bildwelten + 3 Wahrnehmungs-Profile (TRADITION/KOMPETENZ/NAEHE) loesen 80% des Problems bei gleichzeitig WENIGER Delivery-Aufwand als heute. Die Investition (12h CC ueber 4 Wochen + CHF 0.24-1.24 API pro Betrieb) zahlt sich direkt in hoehere Marge, schnellere Delivery und beherrschbares regionales Risiko aus.
