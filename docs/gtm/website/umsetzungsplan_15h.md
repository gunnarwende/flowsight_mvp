# Umsetzungsplan: Modul-1-Website-Maschine (15h CC)

**Datum:** 2026-04-14
**Ziel:** 3 Websites (Doerfler, Leuthold, Orlandini) die sich auf JEDER Ebene unterscheiden — nicht nur Hero, sondern Service-Praesentation, Reviews, Scroll, Farbe, Hover, CTAs, Sections.
**Regel:** Kein Custom-Code pro Betrieb. Alles datengesteuert via theme-Objekt.

---

## Gesamtplan (15h, nach Impact sortiert)

### BLOCK 1: Lebendigkeit (3.5h) — Hoechster sofortiger Impact

| # | Element | Aufwand | Was es aendert |
|---|---------|---------|---------------|
| **1.1** | **framer-motion Scroll-Animationen** — 3 Familien: fade-up (SUBSTANZ), slide-in (VERTRAUEN), scale-in (PRAEZISION). Jede Section wird beim Scrollen sichtbar animiert. | 2.5h | Seite fuehlt sich lebendig an statt tot. Jedes Profil hat eigene Scroll-Handschrift. |
| **1.2** | **Parallax Hero** — Bild bewegt sich subtil beim Scrollen (CSS transform translateY, 15% Geschwindigkeit). Nur bei Classic + Center Hero (nicht Split). | 1h | Premium-Gefuehl ab der ersten Sekunde. Kein Handwerker-Mitbewerber hat das. |

### BLOCK 2: Service-Differenzierung (4h) — Bricht den staerksten Fingerabdruck

| # | Element | Aufwand | Was es aendert |
|---|---------|---------|---------------|
| **2.1** | **Service-Layout: 2-Col** (fuer SUBSTANZ) — Grosses Bild links (60%), Text rechts (40%). Service-Name + Summary + "Mehr" Link. Horizontal, ruhig, editorial. | 2h | Doerfler sieht komplett anders aus als Orlandini in der Service-Section. |
| **2.2** | **Service-Layout: Stacked List** (fuer VERTRAUEN) — Ein Service pro Zeile. Icon links, Text rechts, volle Breite. Kompakt, direkt, uebersichtlich. | 1.5h | Leuthold sieht komplett anders aus als beide anderen. |
| **2.3** | **theme.serviceLayout** in types.ts + Dispatcher in page.tsx | 0.5h | System-Erweiterung, keine Aenderung pro Betrieb. |

### BLOCK 3: Review-Differenzierung (2h) — Unterschiedliche Trust-Inszenierung

| # | Element | Aufwand | Was es aendert |
|---|---------|---------|---------------|
| **3.1** | **Review-Stil: Grosszitat** (fuer SUBSTANZ) — 1 starkes Review gross und prominent. Anführungszeichen, grosse Schrift, zentriert. Darunter klein: "X weitere Bewertungen auf Google". | 1h | Emotional, persoenlich. Komplett anders als Grid. |
| **3.2** | **Review-Stil: Horizontal Scroll** (fuer VERTRAUEN) — Cards scrollen horizontal (CSS overflow-x, snap-scroll). Auf Mobile: swipe-faehig. | 1h | Interaktiv, modern. Mobile-first Erlebnis. |
| **3.3** | Bestehendes Grid bleibt fuer PRAEZISION (kein Aufwand). | 0 | |

### BLOCK 4: Farbtemperatur DURCHGEHEND (1.5h) — Gesamtwahrnehmung

| # | Element | Aufwand | Was es aendert |
|---|---------|---------|---------------|
| **4.1** | **CSS-Vars durchgehend anwenden** — Alle `bg-gray-50`, `bg-white`, `text-gray-600`, `border-gray-200` ersetzen durch `var(--cs-surface)`, `var(--cs-section-alt)`, `var(--cs-text-muted)`, `var(--cs-border)`. In ALLEN Sections (Reviews, Trust, Careers, Contact, Footer). | 1.5h | Warme Site ist DURCHGEHEND warm. Kuehle Site ist DURCHGEHEND kuehl. Nicht nur im Hero. |

### BLOCK 5: Mobile Conversion (1.5h) — Geschaeftskritisch

| # | Element | Aufwand | Was es aendert |
|---|---------|---------|---------------|
| **5.1** | **Sticky Mobile CTA Bar** — Am unteren Rand, immer sichtbar auf Mobile. 2 Buttons: Telefon-Icon (Anrufen) + Formular-Icon (Online melden). Brand-Color Hintergrund. Verschwindet beim Scrollen nach oben (Scroll-Direction-aware). | 1h | Conversion-Pfad immer erreichbar. 80%+ Traffic ist Mobile. |
| **5.2** | **Mobile Hero-Optimierung** — Split-Hero auf Mobile: Bild oben (40vh), Text darunter (statt nebeneinander). Center-Hero auf Mobile: weniger Padding, groessere Bewertungs-Badge. | 0.5h | Hero wirkt auf 375px genauso stark wie auf Desktop. |

### BLOCK 6: Micro-Interactions (1.5h) — Subtile Qualitaets-Signale

| # | Element | Aufwand | Was es aendert |
|---|---------|---------|---------------|
| **6.1** | **Card Hover-Effekte profilbasiert** — SUBSTANZ: sanfter Schatten + leichter Scale (1.01). VERTRAUEN: Border-Color wechselt zu Brand. PRAEZISION: scharfer Schatten + keine Skalierung. | 0.5h | Jedes Profil fuehlt sich anders an beim Interagieren. |
| **6.2** | **CTA-Buttons profilbasiert** — SUBSTANZ: abgerundeter (rounded-2xl), weicher Schatten. VERTRAUEN: pill-foermig (rounded-full). PRAEZISION: scharfkantig (rounded-lg), kein Schatten. | 0.5h | Buttons-Stil verstaerkt das Profil unbewusst. |
| **6.3** | **Section-Uebergaenge** — Statt harter `border-t border-gray-100` zwischen Sections: profilbasierte Divider. SUBSTANZ: weicher Gradient-Uebergang. VERTRAUEN: keine Linie (nur Abstand). PRAEZISION: scharfe 1px Linie. | 0.5h | Scrollrhythmus fuehlt sich bei jedem Profil anders an. |

### BLOCK 7: Profile konfigurieren + QA (1h) — Zusammenfuegen

| # | Element | Aufwand | Was es aendert |
|---|---------|---------|---------------|
| **7.1** | **types.ts erweitern** — theme.serviceLayout, theme.reviewStyle, theme.animation hinzufuegen | 15 Min | |
| **7.2** | **3 Configs aktualisieren** — Doerfler (SUBSTANZ), Leuthold (VERTRAUEN), Orlandini (PRAEZISION) mit allen neuen Theme-Feldern | 15 Min | |
| **7.3** | **QA** — Alle 6 Sites pruefen (3 mit Theme, 3 ohne = unveraendert). Mobile + Desktop. Lighthouse >= 85. | 30 Min | |

---

## Ergebnis-Vorschau: Die 3 Sites im Vergleich

| Ebene | Doerfler (SUBSTANZ) | Leuthold (VERTRAUEN) | Orlandini (PRAEZISION) |
|-------|--------------------|--------------------|----------------------|
| **Hero** | Split, warm, Serif, Parallax | Center, warm, DM Sans, Parallax | Classic, cool, Inter, Parallax |
| **Hero-Bild** | Banana: Werkstatt, Messing, Morgenlicht | Banana: Dorf, See, goldene Stunde | Banana: Edelstahl, LED, Praezision |
| **Scroll** | Fade-up (langsam, ruhig) | Slide-in (leicht, natuerlich) | Scale-in (praezise, kontrolliert) |
| **Services** | 2-Col mit Bild (editorial) | Stacked List (kompakt, direkt) | 3-Col Grid (breit aufgestellt) |
| **Reviews** | 1 grosses Zitat (emotional) | Horizontal Scroll (swipebar) | 3-Col Grid (professionell) |
| **Farbe** | Cremig-warm durchgehend | Erdig-warm durchgehend | Kuehles Weiss durchgehend |
| **Card-Hover** | Sanfter Schatten + Scale | Border-Color-Wechsel | Scharfer Schatten |
| **Buttons** | Abgerundet (2xl) | Pill (full) | Kantig (lg) |
| **Section-Grenzen** | Gradient-Uebergang | Nur Abstand | Scharfe Linie |
| **Sections** | Geschichte → Services → Reviews | Bewertungen → Gebiet → Services | Services → Partner → Karriere |
| **Mobile CTA** | Sticky Bar (Brand-Color) | Sticky Bar (Brand-Color) | Sticky Bar (Brand-Color) |

**JEDE Ebene ist anders.** Nicht nur der Hero. Der gesamte Seitenkoerper fuehlt sich fundamental verschieden an.

---

## Umsetzungsreihenfolge (empfohlen)

| Phase | Blocks | Stunden | Ergebnis |
|-------|--------|---------|----------|
| **Tag 1 Vormittag** | Block 1 (Scroll-Animationen + Parallax) | 3.5h | Alle 6 Sites werden lebendig |
| **Tag 1 Nachmittag** | Block 2 (Service-Layouts) | 4h | Doerfler/Leuthold Services sehen voellig anders aus |
| **Tag 2 Vormittag** | Block 3 (Review-Varianten) + Block 4 (Farbtemperatur) | 3.5h | Trust + Farbe differenziert |
| **Tag 2 Nachmittag** | Block 5 (Mobile CTA) + Block 6 (Micro-Interactions) | 3h | Conversion + Feinschliff |
| **Tag 2 Ende** | Block 7 (Profile konfigurieren + QA) | 1h | Alles zusammen, deployed |
| | **Total** | **15h** | **3 Sites, komplett differenziert** |

---

## Appendix: Systemische Regeln (founder-unabhaengig)

### Section-Eligibility (bereits im Code, komplett automatisch)

| Section | Zeigen wenn | Verstecken wenn |
|---------|------------|----------------|
| Team | `team.length > 1` | 0-1 Mitglieder (Solo/unverified) |
| History | `history.length >= 2 AND years >= 20` | Weniger als 2 Eintraege oder < 20 Jahre |
| Reviews (Sterne) | `averageRating >= 4.0` | Unter 4.0 → nur Textzitate, keine Sterne |
| Reviews (prominent) | `averageRating >= 4.5 AND totalReviews >= 10` | Darunter → Reviews NICHT als Fuehrungselement |
| Trust | `certifications.length > 0 OR brandPartners.length > 0` | Beides leer |
| Careers | `careers.length > 0` | Leer |
| Emergency | `emergency.enabled === true` | Nicht konfiguriert |

### Asset-Quality-Regeln (CC-Entscheidung beim Config-Schreiben)

| Regel | Aktion |
|-------|--------|
| Kein Hero-Bild vorhanden | Banana generiert (Pflicht) |
| Gecrawltes Hero < 800px breit | Banana generiert (Pflicht) |
| Gecrawlte Service-Bilder < 400px | Banana generiert ODER Bilder weglassen |
| Weniger als 3 Service-Bilder pro Service | Gallery-Streifen auf Card versteckt |
| Kein Atmosphaere-Bild fuer ServiceArea | Banana generiert ODER Karte ohne Bild |

### Modul-1-Go/No-Go (deterministische Gates)

| Gate | Bedingung | Ergebnis bei FAIL |
|------|----------|-------------------|
| M1-CHECK-1 | Website erreichbar (HTTP 200, kein SSL-Fehler) | KEIN Modul 1 |
| M1-CHECK-2 | Handelsregister aktiv (zefix.ch) | KEIN Modul 1 |
| M1-CHECK-3 | Telefon-Test ODER Vor-Ort verifiziert | KEIN Modul 1 |
| ICP-Schwelle | ICP >= 5 | KEIN Modul 1 (zu schwach) |
| Region-Check | Max 2 Modul-1-Sites pro Gemeinde | KEIN Modul 1 (Saettigung) |
| Content-Minimum | >= 3 verifizierte Services + Adresse + Telefon | KEIN Modul 1 |

### Profil-Zuweisung (regelbasiert, kein Override noetig)

```
WENN Gruendungsjahr < 1985 UND history.length >= 3     → SUBSTANZ
WENN reviews.avg >= 4.5 UND reviews.count >= 20         → VERTRAUEN
WENN team.length <= 2 UND kein History-Match             → VERTRAUEN
SONST                                                    → PRAEZISION
```

Kein Override. Kein Founder-Input. Kein "im Zweifel". Deterministische Zuordnung.

---

## Nicht-Verhandelbare Qualitaetsgates nach Umsetzung

| # | Gate | Schwelle |
|---|------|---------|
| 1 | Alle 6 bestehenden Sites rendern korrekt (kein Bruch) | 6/6 funktionieren |
| 2 | Lighthouse Performance >= 85 auf allen 3 Proof-Sites | Kein Score unter 85 |
| 3 | framer-motion Bundle-Size Impact | < 15 KB gzipped zusaetzlich |
| 4 | Mobile 375px: Sticky CTA sichtbar, Hero lesbar | Visueller Check |
| 5 | Kein harter Layout-Shift beim Scroll (CLS < 0.1) | Core Web Vital |
| 6 | Sites ohne theme-Feld rendern EXAKT wie vorher | Backwards-Kompatibilitaet |
