# Leitstand Renovation — 15.03.2026

> Companion-Doc zu [leitstand.md](leitstand.md). Dokumentiert die strukturelle Renovation des Leitstands am 15.03. Referenziert leitstand.md per §-Nummern.

---

## 1. Ausgangslage

Founder-Diagnose: "Unser Leitstand ist untauglich." Nach struktureller Analyse: **Nicht untauglich, aber psychologisch falsch priorisiert.** Architektur (Puls-Gruppen, Tenant-Branding, Fall-Detail, 6 Seiten) korrekt — Viewport-Hierarchie und Navigation gebrochen.

## 2. Diagnose

### 2.1 Viewport-Hierarchie falsch (§5.1)
Cases-Page lud: Header → Filter-Bar → 4 KPI-Karten → Search-Bar → **dann erst Puls**. 4 UI-Blöcke vor dem Inhalt der zählt. Auf 1080p war der Puls below-the-fold.

### 2.2 KPI-Karten konkurrieren mit Puls (§7)
KPIs (Total, Neu heute, In Bearbeitung, Erledigt 7d) und Puls-Gruppen (Achtung, Heute, In Arbeit, Abschluss) beschrieben dasselbe auf zwei Arten. §7: "Keine Zähler. Sondern Zustände die Handlung erfordern."

### 2.3 Navigation suggerierte Gleichwertigkeit (§2)
5 Nav-Items gleich gewichtet. Operativ: "Fälle" = 50×/Tag, "Einsatzplan" = 3×, "Mitarbeiter" = 1×/Woche. §2 Progressive Nutzungstiefe verletzt.

### 2.4 Header "Fälle" war falsch
"Fälle — Übersicht aller eingehenden Aufträge" = Datenbankbeschreibung statt Handlungsaufforderung.

### 2.5 Einsatzplan-Zeilen ohne Falldetails (§5.3)
Nur Zeit, Dauer, Status — keine Adresse, keine Kategorie, kein Meldername.

## 3. Psychologische Einordnung

| Ansicht | Soll-Gefühl | War-Gefühl | Lücke |
|---------|-------------|------------|-------|
| **Puls** | Kontrolle, Erleichterung | Überforderung (zu viel vor Inhalt) | KPI stehlen Viewport |
| **Fall-Detail** | Handlungsfähigkeit | Nah dran | Scan-Zusammenfassung fehlte |
| **Einsatzplan** | Zuversicht ("Morgen läuft") | Halbwissen | Keine Adressen in Zeilen |
| **Mitarbeiter** | "Mein Team ist hier" | Admin-Seite | Prominent für 2-Mann-Meister |
| **Kennzahlen** | Stolz | Flach (keine Trends) | Bei frischem Trial bedeutungslos |

## 4. Umsetzungsentscheidungen

### E1: Puls-First (§5.1)
PulsView wird VOR CaseListClient gerendert. KPI-Karten nur sichtbar wenn Puls inaktiv (Filter/Suche aktiv). Puls-Header-Badges SIND die KPI.

### E2: Leere Puls-Gruppen collapsieren
Nur "Achtung" ist immer sichtbar. Bei 0 Fällen: "Alles im Griff" (positiv). Andere Gruppen bei 0 = nicht gerendert.

### E3: Navigation 3+2 (§2 Progressive Nutzungstiefe)
- **Primär:** Puls, Einsatzplan, Einstellungen
- **Sekundär** (visuell abgesetzt, "Verwaltung" Label): Kennzahlen (immer), Mitarbeiter (nur wenn staffCount > 0)
- 2-Mann-Meister sieht 3 Nav-Items. 10-Mann-Betrieb mit Staff sieht 5.
- Staff-Count: lightweight HEAD-Query in layout.tsx.

### E4: Label "Fälle" → "Puls"
Ändert Erwartungshaltung von "Datenbank durchsuchen" zu "Was braucht jetzt Aufmerksamkeit?"

### E5: Einsatzplan-Zeilen angereichert (§5.3)
Appointments-API liefert Case-Daten per JOIN (category, reporter_name, street, house_number, plz, city). Termin-Zeilen zeigen Kategorie + Adresse + Meldername.

### E6: Fall-Detail Scan-Kopf
Kompakter Block zwischen Header und Two-Column: Was / Wo / Wer / Wann — beantwortet die 4 Kernfragen in 3 Sekunden.

### E7: Amber-Bereinigung
Alle `amber-500` Primary-Buttons → `slate-800`. Focus-Ringe → `slate-500`. Avatar → `slate-600`. Konsistenz mit bestehendem Design-System.

## 5. Was NICHT gemacht wurde

- Micro-Surfaces (/einsatz/[token], /meldung/[token])
- ICS v2 (UID/SEQUENCE/CANCEL)
- Termin-Statusmodell UI
- Kennzahlen-Charts / 8-Wochen-Trends
- Techniker-SMS-Integration

## 6. Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `cases/page.tsx` | Puls vor CaseList, Header entfernt |
| `CaseListClient.tsx` | KPI-Karten bei hiddenByPuls verborgen |
| `PulsView.tsx` | Leere Gruppen collapsed, "Alles im Griff" |
| `OpsShell.tsx` | 3+2 Nav, staffCount Prop |
| `layout.tsx` | Staff-Count Query |
| `ScheduleView.tsx` | Case-Daten in Zeilen, Avatar slate |
| `cases/[id]/page.tsx` | Scan-Kopf, Case-ID Badge slate |
| `CaseDetailForm.tsx` | Focus-Ringe + Buttons slate |
| `settings/page.tsx` | Save-Button + Toggles slate |
| `StaffManager.tsx` | Save-Button slate |
| `appointments/route.ts` | JOIN case_info |
