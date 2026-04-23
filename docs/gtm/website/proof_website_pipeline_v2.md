# Proof-Setup: Website-Pipeline v2 (Banana + Wahrnehmungsprofile)

**Datum:** 2026-04-14
**Owner:** CC + Founder
**Zweck:** Beweisen, dass die neue Website-Pipeline das Template-Problem loest — bevor sie ins Machine Manifest kommt.
**Referenz:** `analyse_website_differenzierung.md` (strategische Grundlage), `machine_manifest.md` (Zielintegration)

---

## 1. Empfohlener zweiter Betrieb neben Doerfler

**Brunner Haustechnik AG (Thalwil)**

Nicht Walter Leuthold. Nicht Weinberger. Brunner.

---

## 2. Warum genau dieser Betrieb

Der Proof muss die maximale Wahrnehmungs-Differenz beweisen. Dafuer brauchen wir zwei Betriebe, die sich auf moeglichst vielen Achsen unterscheiden:

| Achse | Doerfler AG | Brunner Haustechnik AG |
|-------|-------------|----------------------|
| **Profil** | TRADITION | KOMPETENZ |
| **Gruendung** | 1926 (98 Jahre, 3. Generation) | 2003 (21 Jahre, Gruender-gefuehrt) |
| **Team** | 2 Personen (Ramon + Luzian) | 8 Personen (groesstes Team im Portfolio) |
| **Teamfoto** | Nein | Ja (einziger Betrieb mit Gruppenbild) |
| **Farbe** | #2b6cb0 (Blau) | #0d7377 (Teal — einziger Nicht-Blau-Betrieb) |
| **Bewertungen** | 4.7 Sterne, 3 Reviews | 4.8 Sterne, 52 Reviews |
| **Geschichte** | 11 Timeline-Eintraege (reichhaltig) | 4 Eintraege (kompakt) |
| **Markenpartner** | 7 (KWC, Similor, Elco...) | Keine |
| **Karriere** | Keine | 1 Stelle ausgeschrieben |
| **Gemeinde** | Oberrieden | Thalwil |
| **Sections sichtbar** | 10/10 (alle) | 10/10 (alle) |

**Warum nicht Leuthold:** Leuthold hat weniger Content (8/10 Sections, 1 Person, keine Geschichte >20 Jahre). Das wuerde den Vergleich unfair machen — Doerfler haette einfach "mehr Inhalt", nicht "andere Wahrnehmung".

**Warum nicht Weinberger:** Weinberger ist Modus 2 (eigene Website). Wir testen hier explizit Modul 1 (FlowSight baut Website).

**Warum Brunner ideal ist:**
- **Maximaler Kontrast:** Tradition (1926) vs. Moderne (2003). Duo vs. Team von 8. Blau vs. Teal. Geschichte vs. Leistung.
- **Gleiche Content-Tiefe:** Beide haben 10/10 Sections, 6 Services, Bewertungen. Gleiche Ausgangslage.
- **Beide in der Region:** Oberrieden vs. Thalwil — direkte Nachbarn, realistisches "Stammtisch"-Szenario.
- **Brunner ist Demo-Tenant:** Keine Risiken bei Aenderungen. Kein Prospect-Kontakt.

---

## 3. Proof-Setup mit 2 Betrieben

### Was wir beweisen wollen

**These:** Wenn zwei FlowSight-Websites nebeneinander auf einem Bildschirm stehen, sollen sie sich anfuehlen wie zwei voellig verschiedene Auftritte — nicht wie zwei Varianten desselben Templates.

**Kontrollbedingung:** Die beiden Websites nutzen weiterhin denselben Code (`page.tsx`), dieselben Komponenten, dasselbe Build-System. Nur die Daten (Config + Bilder + Theme) sind unterschiedlich.

### Die zwei Ergebnisse

**Doerfler AG → Profil TRADITION**
- Banana Hero: Warme Werkstatt, Patina, Messing, Morgenlicht, traditionelles Handwerk
- Veo Hero-Loop (optional): Subtile Lichtbewegung, Staub im Lichtstrahl
- Farbmodus: WARM (cremiger Hintergrund, warme Grautoene)
- Section-Reihenfolge: Hero → Geschichte → Leistungen → Bewertungen → Team → Einzugsgebiet → Trust → Kontakt
- Font: Source Serif Pro (Headings) + Geist (Body)
- Hero-Stil: SPLIT (Bild rechts, Text links auf solidem Hintergrund)
- Above-the-fold: "Seit 1926" Badge prominent, Familienname gross, warme Toene
- Copy-Ton: Warm, respektvoll. "Handwerk mit Tradition."

**Brunner Haustechnik AG → Profil KOMPETENZ**
- Banana Hero: Modernes Setting, Edelstahl, LED-Licht, organisierte Werkzeugwand, sauberer Betonboden
- Veo Hero-Loop (optional): Dynamische Kamerabewegung, Werkzeuge, Bewegung
- Farbmodus: COOL (reines Weiss, kuehle Akzente, klare Linien)
- Section-Reihenfolge: Hero → Leistungen → Bewertungen → Team → Einzugsgebiet → Geschichte → Karriere → Kontakt
- Font: Inter (Headings + Body)
- Hero-Stil: CLASSIC links (Vollbild, dunkler Gradient — aber mit Banana-Bild statt gecrawltem Bild)
- Above-the-fold: "52 Bewertungen" + Sterne prominent, Team-Groesse, Teal-Akzent
- Copy-Ton: Sachlich-professionell. "Kompetenz aus einer Hand."

---

## 4. Was konkret gebaut wird

### Phase 1: Datenmodell erweitern (1-2h CC)

**types.ts** — Neues `theme` Objekt hinzufuegen:

```
theme?: {
  profile: 'tradition' | 'kompetenz' | 'naehe';
  heroStyle: 'classic' | 'split' | 'center';
  colorMode: 'warm' | 'cool' | 'neutral';
  fontFamily: 'geist' | 'inter' | 'dm-sans' | 'source-serif';
  sectionOrder?: string[];
}
```

Default (backwards-compatible): `{ profile: 'kompetenz', heroStyle: 'classic', colorMode: 'neutral', fontFamily: 'geist' }`

### Phase 2: Banana Hero-Bilder generieren (1h CC + 5 Min Founder)

**Doerfler-Prompt (TRADITION):**
```
Professional traditional Swiss plumbing workshop interior. Warm morning light 
through frosted window. Brass and copper fittings on wooden workbench. Patina on 
tools. Aged but well-maintained space. Clean, dignified, timeless. No people. 
Photorealistic, high quality, 16:9 aspect ratio.
```

**Brunner-Prompt (KOMPETENZ):**
```
Modern Swiss plumbing workshop interior. Cool LED ceiling lights. Stainless steel 
pipes on organized wall rack. Clean concrete floor. Professional tool board with 
color-coded tools. Bright, efficient, contemporary. No people. Photorealistic, 
high quality, 16:9 aspect ratio.
```

5 Kandidaten pro Betrieb → Founder waehlt je 1.

### Phase 3: Farbmodus implementieren (2h CC)

**globals.css** — CSS Custom Properties pro Modus:

```
[data-color-mode="warm"] {
  --surface: #faf8f5;      /* cremig */
  --card-bg: #fff9f5;
  --text-secondary: #6b5b4f;
  --section-alt: #f5f0ea;
}
[data-color-mode="cool"] {
  --surface: #ffffff;       /* rein weiss */
  --card-bg: #f8fafb;
  --text-secondary: #5b6b7a;
  --section-alt: #f0f4f8;
}
[data-color-mode="neutral"] {
  /* aktuelles Verhalten, aendert sich nicht */
}
```

**page.tsx** — Root-div bekommt `data-color-mode` Attribut.

### Phase 4: Hero-Varianten (2-3h CC)

**HeroSplit** (fuer TRADITION):
- Kein Vollbild-Hintergrund. Stattdessen: links 50% solider Hintergrund (brandColor dunkel), rechts 50% Banana-Bild.
- Textblock links, vertikal zentriert.
- Badge, H1, Tagline, CTAs — gleicher Content, voellig andere Anordnung.
- Stats-Leiste unter dem Text, nicht ueber die ganze Breite.

**HeroCenter** (fuer NAEHE, spaeter):
- Banana-Bild als Vollbild, staerkerer Overlay (90% statt 80%).
- Text zentriert statt links. Groessere Headline. Weniger Stats.

**HeroClassic** (bestehendes Layout, fuer KOMPETENZ):
- Bleibt wie es ist, aber mit neuem Banana-Bild statt gecrawltem Bild.

### Phase 5: Section-Reihenfolge datengesteuert (2h CC)

**page.tsx** — Statt hardcoded Reihenfolge:

```tsx
const SECTION_REGISTRY = {
  hero: HeroSection,
  services: ServicesSection,
  reviews: ReviewsSection,
  serviceArea: ServiceAreaSection,
  team: TeamSection,
  history: HistorySection,
  trust: TrustSection,
  careers: CareersSection,
  contact: ContactSection,
};

const order = c.theme?.sectionOrder ?? DEFAULT_ORDER;
return order.map(key => {
  const Section = SECTION_REGISTRY[key];
  return Section ? <Section key={key} ... /> : null;
});
```

### Phase 6: Font-Variation (1h CC)

**layout.tsx** — 3 zusaetzliche Fonts laden via `next/font/google`:
- Inter
- DM Sans
- Source Serif Pro

**page.tsx** — Font-Klasse auf Root-div basierend auf `theme.fontFamily`.

### Phase 7: Veo Hero-Loop fuer Doerfler (optional, 1h CC)

Banana-Keyframe → Veo Image-to-Video → 5s Loop → WebM/MP4 → `<video autoPlay muted loop playsInline>` im Hero.

Nur fuer Doerfler (TRADITION). Brunner bleibt statisches Bild (KOMPETENZ braucht Schaerfe, nicht Atmosphaere).

---

## 5. Woran wir Erfolg messen

### Test 1: Visueller Differenz-Test (Founder)

**Methode:** Beide Websites auf einem Laptop nebeneinander oeffnen (Split-Screen).

**Bewertung (Founder, 1-10):**
- "Sehen die aus wie dasselbe Template?" (1 = identisch, 10 = voellig verschieden)
- "Wuerde ein Handwerker erkennen, dass beide von FlowSight kommen?" (1 = sofort, 10 = nie)
- "Passt die Stimmung zum jeweiligen Betrieb?" (1 = generisch, 10 = trifft den Charakter)

**Schwelle:** Alle drei Werte muessen >= 7 sein. Unter 7 = Proof nicht bestanden.

### Test 2: Delivery-Aufwand messen

| Metrik | Zielwert | Messmethode |
|--------|---------|-------------|
| CC-Zeit fuer Banana-Heros (2 Betriebe) | < 1h | Timer |
| CC-Zeit fuer Theme-Zuweisung + Config | < 30 Min pro Betrieb | Timer |
| Founder-Zeit (Auswahl + Review) | < 5 Min pro Betrieb | Timer |
| Feedback-Runden (Founder-Aenderungswuensche) | 0-1 | Zaehlen |
| API-Kosten | < CHF 2 total | Banana + Veo API Logs |

### Test 3: Blind-Test (optional, aber stark)

2-3 Personen (nicht Founder, nicht CC) sehen nacheinander:
1. Doerfler-Website (30 Sek)
2. Brunner-Website (30 Sek)

Frage: "Wurden diese Websites vom selben Anbieter gebaut?"
- Wenn > 50% sagen "Nein" → Proof bestanden
- Wenn > 70% sagen "Ja" → Proof nicht bestanden

---

## 6. Minimale Pipeline-Version fuers Machine Manifest

Nach erfolgreichem Proof wird die Website-Pipeline v2 als Schritt im Machine Manifest integriert:

### Neuer Schritt im Machine Manifest: "Website Produzieren"

```
SCHRITT 5b: Website produzieren (nur Modul 1, ~45 Min CC)

  INPUT:
    - prospect_card.json (Branche, Ort, Team-Groesse, Gruendungsjahr)
    - Profil-Zuweisung (TRADITION / KOMPETENZ / NAEHE — aus Analyse-Schritt)
    - Gecrawlte Bilder (falls vorhanden, optional)

  CC MACHT:
    1. Profil zuweisen basierend auf:
       - Gruendungsjahr > 50 Jahre → TRADITION
       - Team > 5 MA ODER Bewertungen > 30 → KOMPETENZ
       - Team <= 3 MA UND lokal verankert → NAEHE
    2. Banana: 5 Hero-Kandidaten generieren (Prompt aus Profil-Template)
    3. Banana: 3 ServiceArea-Atmosphaere-Kandidaten (optional)
    4. CustomerSite Config schreiben mit theme-Objekt
    5. Bilder platzieren (Banana-Hero + gecrawlte Services)
    6. Build + Deploy

  FOUNDER MACHT:
    1. Hero aus 5 Kandidaten waehlen (30 Sek)
    2. Website kurz pruefen (1 Min)

  OUTPUT:
    - /kunden/{slug} LIVE mit Profil-spezifischer Wahrnehmung
    - Banana-Hero (unique pro Betrieb)
    - Profil-spezifische Section-Reihenfolge + Farbmodus + Font

  DAUER: 45 Min CC, 2 Min Founder
  KOSTEN: CHF 0.24 (Banana) + CHF 0 (kein Veo im Default)

  OPTIONAL (Premium, nur bei ICP 8+ und Founder-Entscheid):
    - Veo Hero-Loop (5s, CHF 0.50-1.00, +15 Min CC)
```

### Profil-Zuweisungsregel (fester Bestandteil)

| Wenn | Dann Profil | Hero-Stil | Farbmodus | Font |
|------|-------------|-----------|-----------|------|
| Gruendungsjahr vor 1975 | TRADITION | Split | Warm | Source Serif |
| Team >= 5 ODER Reviews >= 30 | KOMPETENZ | Classic | Cool | Inter |
| Team <= 3 UND Solo/Familie | NAEHE | Center | Warm | DM Sans |

Bei Grenzfaellen entscheidet CC, nicht Founder. Keine Diskussion, kein "welches Profil gefaellt Ihnen besser."

### Regeln (fest, nicht verhandelbar)

1. **Maximal 2 Modul-1-Sites pro Gemeinde.** Verschiedene Profile Pflicht.
2. **1 Feedback-Runde, dann Freeze.** Kein endloses Iteration.
3. **Profil wird zugewiesen, nicht gewaehlt.** Weder vom Founder noch vom Betrieb.
4. **Banana-Hero ist Pflicht.** Keine gecrawlten Hero-Bilder mehr fuer neue Modul-1-Sites.
5. **Veo-Loop ist optional.** Nur auf Founder-Entscheid bei ICP 8+.

---

## 7. Entscheidungskriterien: Wann gilt die Pipeline als bewiesen?

### Proof BESTANDEN wenn:

| # | Kriterium | Schwelle |
|---|----------|---------|
| 1 | Visueller Differenz-Score (Founder) | Alle 3 Werte >= 7/10 |
| 2 | CC-Delivery-Zeit pro Betrieb | <= 60 Min |
| 3 | Founder-Zeit pro Betrieb | <= 5 Min |
| 4 | Feedback-Runden | <= 1 |
| 5 | API-Kosten | < CHF 2 pro Betrieb |
| 6 | Keine Lighthouse-Regression | Performance Score >= 85 |

**Wenn 5/6 Kriterien erfuellt → Pipeline v2 wird in Machine Manifest aufgenommen.**
**Wenn 3/6 oder weniger → Pipeline braucht weiteren Iteration.**
**Wenn Founder sagt "sieht trotzdem gleich aus" → Modul 1 zurueck auf Eis.**

### Proof NICHT BESTANDEN wenn:

- Doerfler und Brunner sehen trotz Profil-Unterschied noch wie "dasselbe Template" aus
- Banana-Heros sehen kuenstlich/AI-generiert aus (Handwerker erkennen das sofort)
- Delivery-Zeit steigt statt sinkt (Theme-System erzeugt mehr Aufwand statt weniger)
- Founder gibt nach 5 Min kein "sieht gut aus" sondern will Aenderungen

### Nach erfolgreichem Proof:

1. Machine Manifest v3.2: Schritt 5b "Website produzieren" mit vollstaendiger Pipeline
2. Alle 6 bestehenden Sites auf das Profil-System migrieren (1 Tag CC)
3. Naechster Modul-1-Betrieb nutzt die Pipeline (Skalierungstest)
4. Nach 3 weiteren Betrieben: Review ob Differenzierung genuegt

### Timeline

| Tag | Was | Output |
|-----|-----|--------|
| 1 | types.ts erweitern + Farbmodus + Fonts laden | Infrastruktur bereit |
| 2 | HeroSplit bauen + Section-Registry + Banana Heros generieren | 2 Hero-Varianten + 10 Banana-Kandidaten |
| 3 | Doerfler = TRADITION, Brunner = KOMPETENZ zuweisen + Config anpassen | 2 Sites mit verschiedenen Profilen |
| 4 | Deploy + Founder-Review + Proof-Bewertung | GO / NO-GO Entscheidung |
| 5 (optional) | Veo Hero-Loop fuer Doerfler | Premium-Differenzierung |

---

## Zusammenfassung

Zwei Betriebe. Zwei Profile. Vier Tage. Eine Entscheidung.

Wenn Doerfler (TRADITION, Split-Hero, warme Toene, Serif-Font, Banana-Werkstatt) und Brunner (KOMPETENZ, Classic-Hero, kuehle Toene, Inter-Font, Banana-Modern) nebeneinander NICHT wie dasselbe Template aussehen → Website-Pipeline v2 ist bewiesen und kommt ins Machine Manifest.

Wenn doch → Modul 1 bleibt auf Eis und wir fokussieren 100% auf Modul 2.
