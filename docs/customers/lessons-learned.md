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

## Intake-Checkliste (pro Kunde)

### Vom Founder (5 min)

- [ ] URL der alten Website
- [ ] Screenshot der Google Reviews (Sterne + Texte)
- [ ] Brand-Farbe (oder: "extrahiere aus alter Website")
- [ ] Wizard verlinken? (Default: JA)
- [ ] Spezielle Wünsche / Abweichungen
- [ ] Bilder: Kunde liefert eigene? Oder Crawler-Output nutzen?

### CC extrahiert selbst

- [ ] Firmenname, Adresse, Telefon, E-Mail
- [ ] Öffnungszeiten
- [ ] Leistungen + Beschreibungen
- [ ] Team-Namen + Rollen
- [ ] Geschichte / Meilensteine (nur von Website verifiziert!)
- [ ] Zertifizierungen / Verbandsmitgliedschaften
- [ ] Markenpartner + URLs (alle geprüft!)
- [ ] Einzugsgebiet / Gemeinden
- [ ] Karriere / Stellenangebote
- [ ] Notdienst ja/nein + Telefonnummer

### Bilder-Workflow

1. Crawler laufen lassen (`scripts/_tools/crawl-website.mjs`)
2. Ergebnis Founder zeigen (Qualität? Reicht das?)
3. Founder entscheidet: Crawler-Bilder nutzen / Kunde liefert bessere
4. Generische Platzhalter für fehlende Kategorien

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
4. Build + Push — fertig

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

## Offene Punkte (Template-Verbesserungen)

- [ ] Impressum + Datenschutz Seiten (generisch, pro Kunde konfigurierbar)
- [ ] Partner-Logo Crawler Script (generisch)
- [ ] Automatische Brand-Color-Extraktion aus bestehender Website
- [ ] Mobile QA Checklist für Kunden-Websites

---

*Letztes Update: 2026-02-26 | Quelle: Dörfler AG Onboarding*
