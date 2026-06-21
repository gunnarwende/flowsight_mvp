# Website-Maschine v1 GESCHEITERT — Architekturanalyse + v2 Neuansatz

**Datum:** 2026-04-14
**Status:** v1 Proof NICHT BESTANDEN. Founder-Feedback FB1-FB5 = vernichtend.
**Ursache:** Wir haben ein Template variiert statt drei verschiedene Systeme zu bauen.

---

## 1. Warum v1 noch immer nach derselben Template-Familie riecht

### Die Screenshots zeigen das Problem brutal klar

**FB1 (Doerfler Services):** Editorial-Layout zeigt Service-Card UND Service-Editorial gleichzeitig — doppelt, durcheinander, unfertig. Die Bilder stehen neben den Cards in einer Weise die nach kaputtem Template aussieht, nicht nach Design.

**FB2 (Doerfler Team):** Exakt dasselbe generische Layout wie jede andere FlowSight-Site. Runde Initialen-Kreise, Grid, identische Typografie. Null Persoenlichkeit.

**FB3 (Doerfler Trust/Contact):** Wizard-Overlay ueberlappt den Content. "Qualitaet der Sie vertrauen koennen" ist eine generische Phrase die bei JEDEM Betrieb identisch steht. Kontakt-Section = exakt gleich.

**FB4 (Leuthold Reviews):** KATASTROPHE. 6+ Review-Cards horizontal gescrollt als kleine Kaertchen die niemand lesen kann. Das ist nicht "Carousel" — das ist eine unleserliche Wand aus Text. Ein Handwerker auf dem Handy scrollt da nie durch.

**FB5 (Orlandini Hero):** Sieht EXAKT aus wie das alte Template. Gleicher Hero-Stil (Vollbild + Gradient + links Text + Stats unten). Gleiche Nav. Gleiche "Unsere Leistungen" Section darunter. Die Banana-Bildwelt aendert NULL am Template-Gefuehl.

### Das fundamentale Problem

**Wir haben EINE page.tsx mit if/else-Zweigen gebaut.** Das Ergebnis: Egal wie viele Theme-Variablen wir setzen, es bleibt eine Seite mit Varianten. Die DNA ist identisch:

1. **Gleiche Nav** — Bei allen 3 Sites: Brand-Bar oben, Logo links, Links rechts, CTA-Button rechts. Exakt gleich.
2. **Gleiche Section-Koepfe** — "Unsere Leistungen" + Subtitle. Bei ALLEN. Gleiche H2-Groesse, gleicher Abstand.
3. **Gleiche Card-DNA** — ServiceCard.tsx ist bei ALLEN Sites DIESELBE Komponente. Egal ob Grid/Editorial/Stacked — die CARD selbst hat denselben Aufbau (Icon + Name + Text + Bilder).
4. **Gleiche Trust-Phrasen** — "Qualitaet, der Sie vertrauen koennen", "Kompetenz aus einer Hand" — bei JEDEM Betrieb derselbe Text.
5. **Gleiche Footer** — Pixel-identisch.
6. **Gleiche Contact-Section** — Identisch.
7. **Gleicher weisser Hintergrund** — Die Farbmodus-Variablen (warm/cool) sind SO subtil dass sie auf dem Handy nicht wahrnehmbar sind.

**Das ist nicht "drei Profile". Das ist EIN Template mit drei Farbtoenen.**

---

## 2. Welche Bausteine zu aehnlich sind

### KRITISCH — muessen komplett getrennt werden:

| Baustein | Problem | Warum es auffaellt |
|----------|---------|-------------------|
| **Service-Praesentation** | ServiceCard.tsx ist bei ALLEN identisch — gleicher Icon-Kreis, gleicher Shadow, gleiche Hoehe | Das ist die groesste Section. Wenn DIE gleich ist, ist alles gleich. |
| **Hero-Mechanik** | Split/Center/Classic sind Varianten desselben Hero-Schemas (Text + Bild + Stats + 2 CTAs). Auf Mobile kollabierten alle drei zum selben vertikalen Stack. | Der Hero ist der 2-Sekunden-Moment. Wenn der gleich wirkt → fertig. |
| **Section-Koepfe** | Jede Section hat zentrierten H2 + Subtitle in identischer Groesse | Das erzeugt den "Template-Rhythmus" — H2, Content, H2, Content, H2, Content |
| **Review-Inszenierung** | Das Carousel (FB4) ist UNBRAUCHBAR. Kleine Kaertchen mit langem Text die horizontal scrollen = niemand liest das | Schlechter als das alte Grid. |
| **Nav** | Identisch bei allen 3 | Erstes sichtbares Element. Sofort erkennbar. |

### MITTEL — sollten getrennt werden:

| Baustein | Problem |
|----------|---------|
| Contact-Section | Exakt identisches Layout |
| Trust-Section | Gleiche Phrase, gleiche Icons, gleiche Cards |
| Footer | Pixel-identisch |

### UNKRITISCH — duerfen gleich bleiben:

| Baustein | Warum unkritisch |
|----------|-----------------|
| Wizard-Route | Eigene Seite, nicht auf der Hauptseite sichtbar |
| Impressum/Datenschutz | Rechtlich identisch, niemand vergleicht |
| SEO/Schema | Unsichtbar |
| Performance-Budget | Technisch, nicht visuell |

---

## 3. Die 3 neuen Master-Systeme

### Nicht Varianten. Sondern 3 grundverschiedene Seitenarchitekturen.

**System A: EDITORIAL (fuer Substanz/Tradition)**

Referenz: Hochwertige Magazine-Websites, Swiss Architecture Studios, Tradition-Marken.

```
Charakter: Ruhig. Vertikal. Viel Weissraum. Bilder dominant. Text zurueckhaltend.
          Wie eine Architektur-Monografie, nicht wie eine Business-Website.

Nav:      Minimal — nur Logo links + Telefon rechts. KEINE Navigations-Links.
          Auf Scroll: erscheint sticky mit Hamburger-Menu.

Hero:     KEIN Vollbild-Image. Stattdessen: Grosser Firmenname (Serif, 60-80px)
          + Einzeiler darunter + "100 Jahre" Kranz-Element
          + Bild darunter (Banana-Werkstatt) mit abgerundeten Ecken, 80% Breite.
          Luft oben und unten. Atmet.

Services: Vertikal gestapelt. KEIN Grid. Jeder Service:
          Grosses Bild (volle Breite, 40vh) → darunter Text.
          Wie Kapitel in einem Buch. Man scrollt DURCH die Services, nicht UEBER sie.

Reviews:  1 grosses Zitat. Serif-Font. Zentriert. Anfuehrungszeichen gross.
          Darunter: "X weitere auf Google →" Link.

Team:     2 grosse Portraets nebeneinander (wenn Fotos vorhanden).
          KEINE runden Kreise mit Initialen.

History:  Timeline prominent, mit Bildern. Nicht als letzte Section versteckt.
          Bei SUBSTANZ ist die Geschichte das Herzstuck.

Contact:  Schlank. Nur Adresse + Telefon + 1 CTA.
```

**System B: KOMPAKT (fuer Vertrauen/Naehe)**

Referenz: App-artig. Mobile-first. Schnell. Review-getrieben.

```
Charakter: Kompakt. Dicht. Sofort auf den Punkt. Wie eine gut gemachte App-Landingpage.
          Alles Wichtige above-the-fold. Minimaler Scroll.

Nav:      Nur Logo + Telefon. Kein Menu. Seite ist kurz genug.

Hero:     Volle Breite Banana-Bild, STARKER Overlay (90%).
          Zentriert: Bewertungs-Badge RIESIG ("4.9★ · 44 Bewertungen")
          Darunter: Firmenname + Ort.
          2 Buttons: "Anrufen" (primaer) + "Online melden".
          Kein "Seit XXXX", keine Stats-Leiste. NUR Reviews + Aktion.

Services: Kompakte Chips/Tags statt Cards. 1 Zeile pro Service.
          Klickbar → Overlay mit Details (wie bisher).
          Auf Mobile: 2 Spalten, nur Name + Icon. Nichts anderes.

Reviews:  3 GROSSE Review-Karten. Volle Breite. Lesbarer Text.
          KEIN Carousel. KEIN Mini-Card-Scroll.
          Jede Karte: 5 Sterne + Zitat + Autor. Gross, klar, lesbar.

Team:     NICHT gezeigt (Solo-Betriebe haben kein Team).

Einzugsgebiet: Karte prominent. Gemeinden als Tags.

Contact:  Telefon-Button RIESIG (48px Hoehe). "Jetzt anrufen" als Haupt-CTA.
```

**System C: SYSTEMATISCH (fuer Praezision/Kompetenz)**

Referenz: Technische Dienstleister. SaaS-Produktseiten. Schweizer Engineering.

```
Charakter: Strukturiert. Klar. Grid-basiert. Wie ein technisches Datenblatt
          das gut aussieht. Information > Emotion.

Nav:      Volle Nav mit Links (Leistungen, Partner, Karriere, Kontakt).
          Brand-Color Accent-Bar oben.

Hero:     Vollbild-Hintergrund (Banana-Werkstatt). Dunkelblauer Gradient.
          Links: H1 + Subtitle + 2 CTAs.
          Rechts: 3-4 Key-Facts als Karten-Grid ("17 Partner", "5 Fachbereiche",
          "Seit 1972", "24h Notdienst"). NICHT als Zahlenreihe, sondern als Karten.

Services: 3-Col Grid MIT Hover-Effekt:
          Bei Hover: Card dreht sich leicht (2deg), Schatten wird staerker.
          Jede Card: Groesseres Icon (32px statt 20px), kuerzerer Text.
          Klick → Overlay (wie bisher).

Reviews:  Grid. 3 Karten. Standard — passt zum systematischen Stil.

Partner:  PROMINENT. Logos in einem horizontalen Scroll-Band.
          Nicht versteckt in "Trust"-Section, sondern als eigene Visual-Leiste
          direkt nach den Services.

Karriere: Cards mit "Jetzt bewerben" CTA. Professional.

Contact:  Strukturiert: linke Spalte (Infos), rechte Spalte (Karte).
```

---

## 4. Was zwischen den 3 Systemen NICHT mehr geteilt werden darf

| Komponente | Warum trennen |
|-----------|---------------|
| **Hero-Implementierung** | 3 komplett verschiedene Hero-Layouts. Nicht if/else-Zweige, sondern 3 separate Komponenten. |
| **Service-Darstellung** | EDITORIAL: Bild-dominiert, vertikal. KOMPAKT: Chips/Tags. SYSTEMATISCH: Grid mit Hover. 3 verschiedene Komponenten. |
| **Review-Darstellung** | EDITORIAL: 1 Grosszitat. KOMPAKT: 3 grosse lesbare Karten. SYSTEMATISCH: Grid. |
| **Nav-Struktur** | EDITORIAL: Minimal (Logo + Tel). KOMPAKT: Minimal (Logo + Tel). SYSTEMATISCH: Voll (Logo + Links + Tel + CTA). |
| **Section-Koepfe** | EDITORIAL: Keine zentrierten H2. Stattdessen: links ausgerichtet, Serif, gross. KOMPAKT: Keine Section-Koepfe (alles fliesst). SYSTEMATISCH: Zentrierte H2 (wie bisher). |
| **Farbfuehrung** | EDITORIAL: Viel Weissraum, Bilder tragen die Farbe. KOMPAKT: Brand-Color dominant. SYSTEMATISCH: Dunkel (Navy) + Akzent. |

---

## 5. Was systemisch gleich bleiben darf

| Komponente | Warum gleich |
|-----------|-------------|
| Service-Detail-Overlay | Nutzer hat Card geklickt → Overlay mit Details. Funktioniert, ist Standard. |
| ImageGallery-Lightbox | Bewaehrt, keine Aenderung noetig. |
| Wizard-Route | Eigene Seite, nicht betroffen. |
| Footer (minimal) | Impressum + Datenschutz + FlowSight. |
| SEO-Struktur | Schema.org, OpenGraph, Meta. |
| Datenmodell (CustomerSite) | types.ts bleibt. Nur theme-Feld steuert welches System geladen wird. |
| Sticky Mobile CTA | Alle 3 brauchen "Anrufen + Online melden" auf Mobile. |

---

## 6. Kleinster radikaler Umbau zu v2

### Die Architekturentscheidung

**Statt EINER page.tsx mit Theme-Variablen → 3 separate Layout-Dateien:**

```
app/kunden/[slug]/
  page.tsx              → Dispatcher: laedt Layout-Datei basierend auf theme.profile
  layouts/
    LayoutEditorial.tsx  → System A (Substanz)
    LayoutKompakt.tsx    → System B (Vertrauen)
    LayoutSystematisch.tsx → System C (Praezision)
  components/
    ServiceCard.tsx      → Gemeinsam (Detail-Overlay)
    ImageGallery.tsx     → Gemeinsam (Lightbox)
    StickyMobileCTA.tsx  → Gemeinsam (Mobile-Bar)
    AnimatedSection.tsx  → Gemeinsam (Scroll-Wrapper)
```

page.tsx wird MINIMAL — nur noch:
```tsx
const LAYOUTS = {
  tradition: LayoutEditorial,
  naehe: LayoutKompakt,
  kompetenz: LayoutSystematisch,
};
const Layout = LAYOUTS[c.theme?.profile ?? "kompetenz"];
return <Layout company={c} />;
```

Jedes Layout-File hat 200-300 Zeilen und ist KOMPLETT eigenstaendig in seiner Darstellung. Nur der Daten-Input (CustomerSite) ist identisch.

### Der Aufwand

| Element | Aufwand |
|---------|---------|
| page.tsx zu Dispatcher umbauen | 1h |
| LayoutEditorial.tsx (System A) | 4-5h |
| LayoutKompakt.tsx (System B) | 3-4h |
| LayoutSystematisch.tsx (System C) | 3-4h (Basis = aktuelle page.tsx, verfeinert) |
| Doerfler "100 Jahre" Kranz-Element | 1h |
| QA + Mobile-Test | 2h |
| **Total** | **~15-17h** |

---

## 7. Empfehlung

**Architektur neu schneiden. Keine weitere Optimierung der v1.**

Die v1 hat bewiesen: Theme-Variablen auf EINER page.tsx reichen nicht. Egal wie viele CSS-Vars, Farbmodi, Font-Swaps und Layout-Flags wir setzen — es bleibt EIN Template.

**3 separate Layout-Dateien die denselben Daten-Input verarbeiten, aber komplett verschiedene HTML/CSS erzeugen.** Das ist der einzige Weg von "1 Template mit 3 Farben" zu "3 echte Systeme."

### Sofort-Fix fuer Doerfler (parallel zur v2-Entwicklung)

Der "100 Jahre" Lorbeerkranz-Badge — das ist ein konkreter, umsetzbarer Quick-Fix der den Doerfler-Hero sofort aufwertet. Unabhaengig vom v2-Umbau machbar.
