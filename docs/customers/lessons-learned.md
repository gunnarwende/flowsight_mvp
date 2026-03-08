# Lessons Learned — Customer Websites

> Lebendes Dokument. Wird nach jedem Kunden-Onboarding ergänzt.
> Ziel: Jeder neue Kunde schneller als der letzte.

---

## Goldene Regeln

1. **NUR verifizierte Fakten.** Lieber Lücke als Lüge. Niemals Content erfinden.
2. **Wizard = Standard.** Das ist das Produkt. Kein Kontaktformular.
3. **Brand Color ab Tag 1.** Aus alter Website extrahieren, nie FlowSight-Farben verwenden.
4. **Bilder: Founder entscheidet.** Crawler ist Fallback, nicht SSOT.
5. **Alle Links prüfen** bevor committed wird.
6. **1 Feedback-Runde reicht** wenn der Intake sauber ist.

---

## Standardisierter Intake-Prozess (10 Regeln)

> Festgelegt 2026-03-08 nach Orlandini + Widmer Feedback. Verbindlich für alle neuen Kunden.

### Founder liefert pro Kunde:

1. **Leistungen:** Liste + je 1 Ordner mit 3-6 Bildern unter `docs/customers/<slug>/leistungen/<service>/`
2. **Hero-Bild:** unter `docs/customers/<slug>/titelbild/` — Founder wählt
3. **Google Reviews:** Screenshots unter `docs/customers/<slug>/reviews/` — wenn vorhanden. Wenn kein Ordner → keine Reviews anzeigen.
4. **Alte Website URL** (für Kontaktdaten, Texte, Einzugsgebiet)

### CC-Regeln (verbindlich):

| # | Thema | Regel |
|---|-------|-------|
| 1 | **Services** | Kommen AUS den Ordnern unter `leistungen/` + Founder-Liste. Nichts erfinden. |
| 2 | **Bilder** | Nur die Bilder aus dem jeweiligen Ordner. Keine generischen Platzhalter. |
| 3 | **Hero** | Immer das Bild aus `titelbild/`. Founder entscheidet. |
| 4 | **Reviews** | NUR wenn `reviews/`-Ordner existiert. Screenshots → Struct extrahieren. Sonst: `highlights: []` |
| 5 | **Brand Color** | Aus alter Website extrahieren. Falls sehr veraltet (>15 Jahre Design) → modernisieren, Founder fragen. |
| 6 | **Gründungsjahr** | Nur anzeigen wenn Betrieb >20 Jahre alt. |
| 7 | **History** | Nur wenn >20 Jahre UND alte Website hat Meilensteine/Text. Wenn nichts → History-Section weglassen. |
| 8 | **Team** | NUR verifizierte Personen (auf alter Website auffindbar). Minimum 2 für Section-Anzeige. |
| 9 | **Text** | Alte Website als Basis + High-End Creative Writing. Keine 1:1-Kopie, kein Erfinden von Fakten. |
| 10 | **Wizard** | Immer aktiv. Kategorien aus `services[]` ableiten. |

### Pflicht-Output pro Kunde (IMMER):
- `docs/customers/<slug>/links.md` — Website-URL, Links-Seite, Wizard-URL
- Config in `src/web/src/lib/customers/<slug>.ts`
- Bilder in `src/web/public/kunden/<slug>/`
- Registry-Eintrag in `registry.ts`

### Zusätzlich wenn vorhanden:
- Zertifizierungen / Verbandsmitgliedschaften
- Markenpartner (URLs geprüft!)
- Karriere / Stellenangebote
- Notdienst + Telefonnummer

---

## Template-Status

| Komponente | Pfad | Status |
|-----------|------|--------|
| Daten-Schema | `src/web/src/lib/customers/types.ts` | fertig |
| Kunden-Registry | `src/web/src/lib/customers/registry.ts` | fertig — 1 Zeile pro Kunde |
| Seiten-Template | `src/web/app/kunden/[slug]/page.tsx` | fertig — 12 Sektionen |
| Bild-Galerie | `src/web/app/kunden/[slug]/ImageGallery.tsx` | fertig — horizontal scroll + lightbox |
| Brand Color System | via `brandColor` in Config | fertig |
| Wizard-Integration | Nav + Hero CTA + Contact Banner | fertig |
| Impressum/Datenschutz | Platzhalter-Links im Footer | **offen** |

### Neuen Kunden anlegen

1. Config erstellen: `src/web/src/lib/customers/<slug>.ts`
2. Registry ergänzen: 1 import + 1 Zeile in `registry.ts`
3. Bilder ablegen: `src/web/public/kunden/<slug>/`
4. **`docs/customers/<slug>/links.md` anlegen** — Website-URL, Links-Seite, Wizard-URL. **PFLICHT bei jedem neuen Kunden.**
5. Build + Push — fertig

> **WICHTIG:** Schritt 4 ist nicht optional. `links.md` ist die SSOT für alle Kunden-URLs.
> Ordnerstruktur pro Kunde: `docs/customers/<slug>/` muss mindestens `links.md` enthalten.

---

## Institutional Learnings

### 2026-02-18 | internal
**Worked:** SSOT backbone established in one wave (STATUS, contracts, env vars, agent briefs). Clean commit, no drift.
**Failed:** Nothing blocked — first wave was docs-only.
**New Standard:** Every wave starts by reading docs/STATUS.md + relevant contracts before writing code.

---

## Kunden-spezifische Learnings

### Dörfler AG (2026-02-26) — Erster Kunde

**Kontext:** Sanitär/Heizung, Oberrieden ZH, Familienbetrieb seit 1926

**Was gut lief:**
- Puppeteer-Crawler extrahierte 297 Bilder automatisch
- TypeScript Schema erzwingt Vollständigkeit
- Registry-Pattern macht Skalierung trivial
- Brand Color (#2b6cb0) aus alter Website übernommen

**Was unnötig Zeit kostete:**

| Problem | Ursache | Fix |
|---------|---------|-----|
| 90% gecrawlte Bilder unbrauchbar | 20KB-Thumbnails von 2005 | Bilder vom Kunden holen |
| Erfundener Content (2024 Eintrag) | CC hat Lücke gefüllt statt zu fragen | Regel 1: nur verifizierte Fakten |
| Google Reviews nicht scrapebar | Google blockt Automatisierung | Screenshot vom Founder |
| Partner-URLs kaputt (KWC, Similor) | Domains geändert/merged | Links vor Commit prüfen |
| 3+ Feedback-Loops | Kein strukturierter Intake | Checkliste oben nutzen |
| FlowSight-Gold auf Kundenseite | Default-Farbe nicht überschrieben | Brand Color ab Tag 1 |
| Kontaktformular statt Wizard | CC kannte Produktstrategie nicht | Wizard = immer Standard |
| Separate Galerie-Sektion | Bilder ohne Kontext | Galerie in Services integriert |

**Zeitaufwand:**

| Phase | Ist | Soll (nächster Kunde) |
|-------|-----|----------------------|
| Intake + Daten | ~2h | ~15 min |
| Bilder | ~1.5h | ~10 min |
| Config erstellen | ~1h | ~20 min |
| Template anpassen | ~3h | 0 min (steht) |
| Feedback-Loops | ~3h | ~30 min |
| **Total** | **~10h** | **~1h** |

---

### Walter Leuthold (2026-03-08) — High-End-Kunde, Gründer-Feedback

**Kontext:** Sanitär, Heizung, Spenglerei, Dachdecker, Fassadenbau. Zürich-Süd. Seit 2001. 25 Kunden-Bilder.

**Was gut lief:**
- Gründer lieferte 25 Bilder + 6 Google Reviews → Config-Qualität sofort hoch
- Template skaliert: 5 Services + Detail-Overlays in ~30 min konfiguriert
- 1 Feedback-Runde reichte (Nav, Hero, Icons, Texte, Overlays, Reviews, Bilder)
- Wizard cross-business (Kategorien aus `services[]` abgeleitet) funktioniert für alle Branchen
- reporter_name als Feature direkt produktiv — sofort für alle Kunden live

**Was wir gelernt haben:**

| Learning | Impact | Jetzt Standard? |
|---------|--------|-----------------|
| **ServiceCard + ServiceDetailOverlay** Pattern | Kunden erwarten "Mehr" → Overlay mit Expertise, Bullets, Galerie | ✅ Ja |
| **`bullets?: string[]`** pro Service nutzen | High-End-Kunden brauchen Kompetenz-Bullet-Points | ✅ Schema erweitert |
| **`"facade"` als ServiceIcon** | Neue Branche = neuer Icon-Typ | ✅ Typ erweitert |
| **Bilder VOM Kunden** > Crawler | 25 echte Bilder vs. 297 Thumbnails bei Dörfler | Immer Kunden fragen |
| **Galerie pro Service-Slug** | 1 Ordner = 1 Service, 3-6 Bilder. Nicht nach "Kategorie" | ✅ Standard |
| **Unicode `\uXXXX` in JSX ist fatal** | Rendert literal ("Zur\u00fcck"). Fix: `{"Zurück"}` oder echte UTF-8 | ✅ Nie wieder escapes in JSX |
| **reporter_name überall** | Wizard (required), Voice (fragen), Verify (editierbar), E-Mail (anzeigen) | ✅ Ab PR #86 |
| **Nav: vereinfachen** | Nur Leistungen/Kontakt/Notfall. Kein "Schaden melden" in Nav. | ✅ Standard |
| **Reviews: ohne Datum, 6 Stück** | Wirkt zeitlos frischer. Grid max-w-5xl. | ✅ Standard |
| **Hero: starkes Overlay** | `from-gray-900/90 via-gray-900/80 to-gray-900/55` — Text immer lesbar | ✅ Standard |
| **Team-Sektion ausblenden** wenn nur 1 Person | Unnötig, wirkt dünn | ✅ `c.team.length <= 1` |

**Zeitaufwand Leuthold:**

| Phase | Ist |
|-------|-----|
| Config + Bilder (real data) | ~45 min |
| Template-Erweiterung (Overlays, Bullets) | ~2h |
| Feedback-Runde (Nav, Hero, Icons, Reviews) | ~1.5h |
| Wizard-Fixes (Umlaute, Foto-Upload, reporter_name) | ~1.5h |
| Voice-Update (reporter_name, Prompt-Änderung) | ~30 min |
| **Total** | **~6h** |

---

### Orlandini + Widmer (2026-03-08) — Rebuild nach Qualitäts-Audit

**Kontext:** Beide Websites hatten Qualitätsprobleme: erfundene Services (Erdsonden), nicht-verifizierte Team-Mitglieder, fehlende Services.

**Kritische Fehler die zum Rebuild führten:**

| Fehler | Kunde | Impact | Fix |
|--------|-------|--------|-----|
| Service "Erdsonden" erfunden | Widmer | Nicht auf alter Website → falsche Behauptung | Service entfernt |
| Team-Mitglied nicht verifiziert | Widmer (Brigitte) | Nicht auf alter Website → Showstopper | Entfernt, Section auto-hidden |
| Service vergessen | Widmer (Spenglerei) | Founder musste erinnern → schlechte UX | Nachträglich hinzugefügt |
| Gründungsjahr falsch | Widmer (1974 statt 1898) | Grob falsch → Vertrauensverlust | Korrigiert auf 1898 |
| Falsche Brand Color | Widmer (Grün statt Blau) | Unpassend zum Betrieb | Auf #1a4b8c korrigiert |

**Ergebnis:** Standardisierter 10-Regeln Intake-Prozess (siehe oben). Founder liefert Ordnerstruktur, CC baut daraus. Kein Content mehr erfinden.

**Zeitaufwand Rebuild (beide Kunden):**

| Phase | Zeit |
|-------|------|
| Analyse alte Websites + Reviews | ~30 min |
| Orlandini Rebuild (5 Services, 3 Reviews) | ~45 min |
| Widmer Rebuild (5 Services, Korrekturen) | ~45 min |
| Intake-Prozess definieren | ~30 min |
| **Total** | **~2.5h** |

---

## Playbook: Neuen Kunden in 1h onboarden

### Voraussetzungen (Gründer liefert — gemäss Intake-Prozess oben):
1. Leistungen-Ordner mit Bildern (`docs/customers/<slug>/leistungen/<service>/`)
2. Hero-Bild (`docs/customers/<slug>/titelbild/`)
3. Google Reviews Screenshots (wenn vorhanden)
4. URL alter Website
5. Sonderwünsche

### CC-Workflow:
1. **Config erstellen** (`src/web/src/lib/customers/<slug>.ts`) — Schema-konform, alle Services mit `bullets`, `description`, `icon`
2. **Bilder** → `public/kunden/<slug>/<service-slug>/` (3-6 pro Service)
3. **Registry** ergänzen (1 Import + 1 Zeile in `registry.ts`)
4. **Build + Push** → PR → CI → Merge
5. **Voice Agent** erstellen (nur wenn Kunde Voice-Modul hat)
6. **SSOT updaten**: STATUS.md, OPS_BOARD.md, customer status.md

### Template-Features (alle automatisch):
- ServiceCard + ServiceDetailOverlay (wenn `description` + `bullets` vorhanden)
- Wizard mit Kategorien aus `services[]`
- reporter_name in Wizard + Voice + Verify
- Responsive Galerie pro Service
- Reviews ohne Datum
- Notdienst-Banner (wenn `emergency.enabled`)
- Team-Sektion (wenn > 1 Mitglied)

---

## Offene Punkte (Template-Verbesserungen)

- [ ] Impressum + Datenschutz Seiten (generisch, pro Kunde konfigurierbar)
- [ ] Partner-Logo Crawler Script (generisch)
- [ ] Automatische Brand-Color-Extraktion aus bestehender Website
- [ ] Mobile QA Checklist für Kunden-Websites

---

*Letztes Update: 2026-03-08 | Quelle: Orlandini + Widmer Rebuild, Standardisierter Intake-Prozess*
