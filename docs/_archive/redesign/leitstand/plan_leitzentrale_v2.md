# Leitzentrale v2 — High-End Systemvisualisierung

**Erstellt:** 2026-03-18
**Letztes Update:** 2026-03-18
**Owner:** Founder + CC
**Prinzip:** Zwei Perspektiven, ein System. Maximales High-End. Kein Dashboard.

---

## Zweck

Die Leitzentrale ist der erste Berührungspunkt. Jeder Morgen, jeder Techniker, jeder Inhaber.
Wenn das nicht knallt, kommt Skepsis statt Begeisterung.

Ziel: Ein geschlossenes System sichtbar machen — Eingang → Arbeit → Ergebnis → ★★★★★ Belohnung.
Nicht Metriken. Sondern: "Dein Betrieb läuft. Hier ist der Beweis."

---

## IST (B1/B2 Screenshots)

- 6 gleiche Cards (Eingang, Bei uns, Wartet, Heute, Erledigt, Bewertungen)
- Funktional: Klick filtert Tabelle
- Visuell: Dashboard-Gefühl, kein System erkennbar
- Keine Rollen-Differenzierung (Admin = Techniker = gleiche Ansicht)
- Keine echten Bewertungstexte
- Keine Quellen-Aufschlüsselung

---

## Zielbild

### Admin/Inhaber: "Mein Betrieb"

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  SYSTEMFLUSS (kompakte Zeile, verbundener Flow)             │
│  📞3 · 🌐1 · ✏️1  ──▸  ⚡ 3  ──▸  ✅ 28  ──▸  ★★★★★     │
│  Eingang              Bei uns       Erledigt      4.8 Ø     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HANDLUNGSBEDARF (collapses zu "Alles im Griff")           │
│  🔴 Notfall: Rohrbruch — Seestrasse 5, Thalwil   [Öffnen] │
│  🟡 Überfällig: Heizung — Müller, seit 2 Tagen   [Öffnen] │
│  📋 Neu heute: 2 Fälle                           [Alle →] │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  WIRKUNG (Gold-Zone, emotionaler Anker)                     │
│  ★★★★★  4.8 Durchschnitt  ·  7d: 3 | 30d: 12 | Gesamt: 47│
│  ████████████████████░░  85% Antwortquote                   │
│  "Super schneller Service!" — Frau Schneider, 14.03.        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FÄLLE (Arbeitsraum)                                        │
│  [Suche]  [Status ▾] [Priorität ▾]     [+ Neuer Fall]      │
│  Tabelle (15 Zeilen, Pagination)                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Techniker: "Meine Arbeit"

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Guten Morgen, Ramon                                        │
│  📞5 ──▸ ⚡3 ──▸ ✅28 ──▸ ★4.8  (kompakt, read-only)      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HEUTE (Termine mit Adresse + Navigation)                   │
│  📍 08:00–09:30  Rohrbruch — Seestr. 5, 8800 Thalwil      │
│     [Navigieren]  [Bin vor Ort]  [Erledigt]                │
│                                                             │
│  📍 10:15–11:45  Heizung — Bahnhofstr. 12, 8810 Horgen    │
│     [Navigieren]  [Bin vor Ort]  [Erledigt]                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MEINE FÄLLE (3 offen)                                     │
│  Tabelle: nur zugewiesene Fälle                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MEINE WOCHE                                               │
│  ✅ 4 erledigt  ·  ★★★★★ 2 Bewertungen                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Architektur-Entscheidungen

| # | Entscheidung | Begründung |
|---|-------------|------------|
| E1 | Systemfluss = EINE kompakte Zeile, kein 6-Karten-Grid | System erkennbar, nicht Dashboard-Gefühl |
| E2 | Quellen-Aufschlüsselung (📞/🌐/✏️) im Eingang | Insight den kein Handwerker sonst hat |
| E3 | Handlungsbedarf zeigt konkrete Fälle, nicht Zahlen | Inhaber sieht WAS zu tun ist, nicht nur WIE VIEL |
| E4 | Handlungsbedarf Priorität: Notfall → Überfällig → Wartet >48h → Neu | Intelligente Sortierung, nicht nur Status |
| E5 | Wirkungszone mit echtem Bewertungstext + Zeitfilter (7d/30d/Gesamt) | Emotionaler Anker, Stolz, Fortschritt sichtbar |
| E6 | Systemfluss rein informativ, Tabelle hat eigene Filter | Klare Trennung: oben = Überblick, unten = Arbeit |
| E7 | Techniker sieht "Meine Arbeit" (persönlich, Termine, Schnellaktionen) | Rollengerecht, keine Ablenkung |
| E8 | "Alles im Griff" wenn kein Handlungsbedarf | Emotionaler Moment, nicht leere Box |
| E9 | Mobile Systemfluss = einzeiliger Ticker, kein Card-Grid | 375px: sofort Handlungsbedarf sichtbar |
| E10 | Bewertungstext manuell via Einstellungen (Phase 1) | Realistisch jetzt, Google API = Phase 2 |

---

## Umsetzungs-Blöcke

### Block 1: Systemfluss-Komponente (~2h)

| # | Task | Status |
|---|------|--------|
| 1.1 | `SystemflussBar.tsx` — verbundener Flow (📞→⚡→✅→★) | **DONE** |
| 1.2 | Quellen-Aufschlüsselung (voice/wizard/manual counts) | **DONE** |
| 1.3 | Mobile: einzeiliger Ticker mit Icons + Zahlen | **DONE** |
| 1.4 | Daten: cases page.tsx um source-counts erweitern | **DONE** |

### Block 2: Handlungsbedarf-Zone (~2h)

| # | Task | Status |
|---|------|--------|
| 2.1 | `HandlungsbedarfZone.tsx` — priorisierte Fall-Liste | **DONE** |
| 2.2 | Prioritäts-Logik: Notfall → Überfällig → Wartet >48h → Neu heute | **DONE** |
| 2.3 | Max 3 Einträge + "X weitere" Link | **DONE** |
| 2.4 | "Alles im Griff" State wenn leer (Haken-Icon + Text) | **DONE** |
| 2.5 | Klick → direkt zum Fall | **DONE** |

### Block 3: Wirkungszone (~2h)

| # | Task | Status |
|---|------|--------|
| 3.1 | `WirkungZone.tsx` — Gold-Zone mit Stars + Progress | **DONE** |
| 3.2 | Zeitfilter-Toggle (7d / 30d / Gesamt) | **DONE** |
| 3.3 | Progress-Bar (Antwortquote: gesendet vs. Total erledigt) | **DONE** |
| 3.4 | Bewertungstext aus Einstellungen (neues Feld `featured_review`) | **DONE** |
| 3.5 | Gold-Akzent-Styling (warm, nicht laut) | **DONE** |

### Block 4: Techniker-Ansicht (~2h)

| # | Task | Status |
|---|------|--------|
| 4.1 | Persönliche Begrüssung ("Guten Morgen, Ramon") | **DONE** |
| 4.2 | Heute-Termine mit Adresse + Navigieren + Schnellaktionen | **DONE** |
| 4.3 | "Meine Fälle" — nur zugewiesene | **DONE** |
| 4.4 | "Meine Woche" — persönlicher Erfolg + Bewertungen | **DONE** |
| 4.5 | Kompakter Systemfluss (read-only, eine Zeile) | **DONE** |

### Block 5: Integration + Tabelle (~1h)

| # | Task | Status |
|---|------|--------|
| 5.1 | `LeitzentraleView.tsx` refactored — Admin vs. Techniker | **DONE** |
| 5.2 | Tabelle bleibt (Suche, Filter-Chips, Pagination) | **DONE** (bestehend) |
| 5.3 | Filter-Chips statt Karten-Klick (Status, Priorität) | Phase 2 |
| 5.4 | cases/page.tsx — erweiterte Datenabfrage | **DONE** |

### Block 6: Settings + Docs (~30min)

| # | Task | Status |
|---|------|--------|
| 6.1 | Einstellungen: "Ihre beste Bewertung" Textfeld | OFFEN |
| 6.2 | SSOT-Docs aktualisieren | OFFEN |

---

## Betriebsgrössen-Matrix

| Feature | 2 MA (Meister) | 10 MA | 30 MA |
|---------|---------------|-------|-------|
| Systemfluss | Sieht alles, IST Admin + Techniker | Disponent-Sicht | Büro-Team-Sicht |
| Handlungsbedarf | "Mein nächster Fall" | "Was braucht Aufmerksamkeit" | "Was eskaliert" |
| Wirkung | Persönlicher Stolz | Team-Performance | Betriebskennzahl |
| Techniker-View | Nicht relevant (Admin = Techniker) | Tagesplan + Fälle | Tagesplan + Fälle |
| Bewertungen | "Frau Müller war zufrieden" | "3 neue diese Woche" | "Ø 4.8, 85% Quote" |

---

## Verifikation

1. Admin: Systemfluss zeigt verbundenen Flow mit Quellen-Icons
2. Admin: Handlungsbedarf zeigt Notfall rot, Überfällig amber, "Alles im Griff" wenn leer
3. Admin: Wirkungszone zeigt Gold-Sterne, Bewertungstext, Progress-Bar, Zeitfilter
4. Techniker: "Guten Morgen, {Name}" + Heute-Termine + Meine Fälle
5. Techniker: Schnellaktionen (Navigieren, Bin vor Ort, Erledigt)
6. Mobile: Systemfluss als einzeiliger Ticker, sofort Handlungsbedarf
7. 100% Zoom Desktop: alles ohne Scrollen sichtbar
