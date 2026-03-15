# 08 — Viewport-Hierarchie

> Render-Reihenfolge, Pixel-Budget, Informationshierarchie pro Seite.
> Gemessen für: Desktop 1920×1080 (Disponentin), Mobile 390×844 (Meister iPhone)

---

## 1. Puls-Seite (Startseite) — Desktop 1080p

### Layout-Budget (vertikal, in px, geschätzt)

```
┌─────────────────────────────────────────────────────┐
│ Sidebar (fixed left, 224px breit, nicht im Budget)  │
├─────────────────────────────────────────────────────┤
│ py-6 (24px Padding oben)                            │  24px
│                                                      │
│ ┌── PulsView ──────────────────────────────────────┐│
│ │ Achtung Header (bg-red-100, py-2, text-sm)       ││  36px
│ │ [wenn leer: "Alles im Griff" Zeile]              ││  28px
│ │ [wenn gefüllt: Case Cards à ~96px]               ││  n × 96px
│ │                                                   ││
│ │ Heute Header                                      ││  36px
│ │ Case Cards                                        ││  n × 96px
│ │                                                   ││
│ │ In Arbeit Header                                  ││  36px
│ │ Case Cards                                        ││  n × 96px
│ │                                                   ││
│ │ Abschluss Header                                  ││  36px
│ │ Case Cards                                        ││  n × 96px
│ │ mb-6 (24px)                                       ││  24px
│ └──────────────────────────────────────────────────┘│
│                                                      │
│ ┌── Filter Bar (bg-white, p-3) ────────────────────┐│  52px
│ │ Demo/Real Toggle | Offen/Alle | Dropdowns        ││
│ └──────────────────────────────────────────────────┘│
│                                                      │
│ ┌── Action Bar ────────────────────────────────────┐│  48px
│ │ Search | {n} Fälle | Exportieren | + Neuer Fall  ││
│ └──────────────────────────────────────────────────┘│
│                                                      │
│ [Tabelle: HIDDEN (hiddenByPuls = true)]             │  0px
│ [KPI Cards: HIDDEN]                                 │  0px
│                                                      │
│ py-6 (24px Padding unten)                           │  24px
└─────────────────────────────────────────────────────┘
```

### Above-the-Fold (1080p − 24px padding = 1056px nutzbar)

**Szenario A: Achtung leer, 3 Heute, 2 In Arbeit, 1 Abschluss**
```
Achtung Header: 36px
"Alles im Griff": 28px
Heute Header: 36px
3 × Case Card: 288px
In Arbeit Header: 36px
2 × Case Card: 192px
Abschluss Header: 36px
1 × Case Card: 96px
mb-6: 24px
Filter Bar: 52px
──────────────────
Total: 824px → ✅ Alles above-fold
```

**Szenario B: 2 Achtung, 5 Heute, 5 In Arbeit, 3 Abschluss (15 Fälle)**
```
Achtung Header + 2 Cards: 228px
Heute Header + 5 Cards: 516px
In Arbeit Header + 5 Cards: 516px
Abschluss Header + 3 Cards: 324px
mb-6 + Filter: 100px
──────────────────
Total: 1684px → ❌ Scroll nötig ab ~5 Heute-Cards
```

### Informationshierarchie (Ist-Zustand nach Renovation)

```
1. PULS (Was braucht Aufmerksamkeit?) ← FIRST VISIBLE ✅
   ├── Achtung (Notfälle + Überfällige) ← IMMER sichtbar
   ├── Heute (Neue + Heutige) ← sichtbar wenn vorhanden
   ├── In Arbeit ← sichtbar wenn vorhanden
   └── Abschluss ← sichtbar wenn vorhanden
2. FILTER BAR (Drill-down) ← unterhalb des Puls
3. ACTION BAR (Suche + Neuer Fall) ← unterhalb Filter
4. TABELLE (versteckt) ← nur bei aktiven Filtern
5. KPI CARDS (versteckt) ← nur bei aktiven Filtern
```

### Vor-Renovation Hierarchie (zum Vergleich)
```
1. PAGE HEADER ("Fälle — Übersicht aller eingehenden Aufträge")
2. KPI CARDS (4 Stück, ~100px)
3. FILTER BAR
4. SEARCH BAR + "Neuer Fall"
5. TABELLE (chronologisch)
→ PULS war NICHT sichtbar (existierte nicht / war nach Tabelle)
```

→ **Renovation hat die Hierarchie fundamental verbessert.**

---

## 2. Puls-Seite — Mobile (390px breit)

### Layout-Budget

```
┌──────────────────────────────────┐
│ Mobile Header (brand color, 52px)│  52px
├──────────────────────────────────┤
│ px-4 py-6 (24px Padding oben)   │  24px
│                                   │
│ PulsView (identisch Desktop)     │  variable
│                                   │
│ Filter Bar (wrapping)            │  ~80-100px
│                                   │
│ Action Bar (stacking)            │  ~48px
│                                   │
│ py-6 (24px Padding unten)        │  24px
└──────────────────────────────────┘
```

### Above-the-Fold (844px − 52px Header − 24px padding = 768px nutzbar)

**Szenario A: Achtung leer, 3 Heute**
```
Achtung + Griff: 64px
Heute + 3 Cards: ~324px
Filter Bar: ~100px
Action Bar: ~48px
──────────────────
Total: 536px → ✅ Alles above-fold
```

**Szenario B: Viele Fälle (10+)**
→ Scroll nötig, aber Achtung + erste Heute-Cards above-fold ✅

### Mobile-Spezifika
- Reporter Name: `hidden sm:inline` (nur Desktop)
- Staff Phone/Email Spalten: `hidden sm:table-cell`
- Count Label: `hidden sm:block`
- Puls Cards: volle Breite, gleiche Struktur wie Desktop

---

## 3. Fall-Detail — Desktop

### Layout-Budget (vertikal)

```
┌─────────────────────────────────────────────────────┐
│ Header (Back + Category + Date + Case-ID)           │  48px
│                                                      │
│ ┌── Scan-Kopf (bg-white border rounded-xl p-4) ───┐│  ~80px
│ │ Was: Category — Description                       ││
│ │ Wo: Address [Maps]  |  Wer: → Assignee           ││
│ │ Wann: Termin Datum                                ││
│ └──────────────────────────────────────────────────┘│
│                                                      │
│ ┌── Two-Column Grid (5 cols) ──────────────────────┐│
│ │ LEFT (3 cols): CaseDetailForm                     ││  ~600-700px
│ │   ├── Status/Urgency/Category                     ││
│ │   ├── PLZ/Ort/Strasse/Nr                         ││
│ │   ├── Melder/Telefon/Email/Zuständig             ││
│ │   ├── Beschreibung                                ││
│ │   ├── Termin + Quick-Time | Notizen              ││
│ │   ├── Action Bar (Speichern, Erledigt)           ││
│ │   └── Review Nachlauf (wenn done)                 ││
│ │                                                   ││
│ │ RIGHT (2 cols):                                   ││  ~400-500px
│ │   ├── Kontakt-Card                                ││
│ │   ├── Timeline                                    ││
│ │   └── Anhänge                                     ││
│ └──────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Above-the-Fold (1080p)

```
Header: 48px
Scan-Kopf: 80px
Form (first 3 rows): ~220px
Right Column (Kontakt + Timeline start): ~300px
──────────────────
Total visible: ~648px → ✅ Kerninfo above-fold
```

→ **Scan-Kopf beantwortet "Was? Wo? Wer? Wann?" in den ersten ~130px.** Das ist der grösste Gewinn der Renovation.

---

## 4. Fall-Detail — Mobile

```
Header: 48px
Scan-Kopf: ~120px (stacks to 1 col)
CaseDetailForm: ~700-800px (full width)
Contact Card: ~150px
Timeline: ~200px
Attachments: ~100px
```

→ Alles vertikal gestapelt. Scan-Kopf + erste Form-Zeile above-fold.

---

## 5. Einsatzplan — Desktop

```
Header: "Einsatzplan" + Toggle (48px)
Per Staff Section:
  Staff Header (Avatar + Name, 52px)
  Per Appointment Row (~56px)
```

**Szenario: 3 Mitarbeiter, je 3 Termine**
```
Header: 48px
3 × (52 + 3 × 56) = 3 × 220 = 660px
──────────────────
Total: 708px → ✅ Above-fold bei 1080p
```

---

## 6. Kennzahlen — Desktop

```
Header: "Kennzahlen" + Subtext (48px)
8 Cards in 4×2 Grid (~180px)
──────────────────
Total: 228px → ✅ Komplett above-fold
```

---

## 7. Einstellungen — Desktop

```
Header: (48px)
Quick Links: 3 NavCards (~80px)
Google Review Section: (~120px)
Termine Section: (~160px)
Benachrichtigungen Section: (~100px)
Betriebsinfo Section: (~80px)
Save Bar: (~60px)
──────────────────
Total: ~648px → ✅ Above-fold bei 1080p
```

---

## 8. Mitarbeiter — Desktop

```
Header: (48px)
[Form wenn offen: ~200px]
Table (abhängig von Anzahl):
  Header: ~48px
  Per Row: ~48px
```

**5 Mitarbeiter:** 48 + 48 + 5×48 = 336px → ✅ Above-fold

---

## Zusammenfassung: Viewport-Effizienz

| Seite | First Meaningful Content | Above-Fold? | Scroll-Bedarf |
|-------|------------------------|------------|---------------|
| **Puls** | Achtung-Gruppe (28px offset) | ✅ bei <10 Fällen | Ab ~10 Fällen |
| **Fall-Detail** | Scan-Kopf (48px offset) | ✅ Was/Wo/Wer/Wann sofort | Form + rechte Spalte |
| **Einsatzplan** | Erste Staff-Section (48px offset) | ✅ bei <5 Mitarbeiter | Ab 5+ Mitarbeiter |
| **Kennzahlen** | Alle 8 Karten | ✅ komplett | Nie |
| **Einstellungen** | Quick Links + Google Review | ✅ | Leichtes Scrollen |
| **Mitarbeiter** | Staff-Tabelle | ✅ | Ab 10+ Mitarbeiter |

→ **Renovation-Ziel "Puls ist erstes was sichtbar ist" = ✅ erreicht.**
