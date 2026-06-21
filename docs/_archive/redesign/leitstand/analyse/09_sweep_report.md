# 09 — Sweep Report

> Konsistenz, Farbreste, Accessibility, Wording, Edge Cases.

---

## 1. Farb-Konsistenz

### Primary Button Farben

| Datei | Button | Farbe | Status |
|-------|--------|-------|--------|
| CaseListClient.tsx | "Suchen" | `bg-slate-700` | ✅ |
| CaseListClient.tsx | "+ Neuer Fall" | `bg-slate-800` | ✅ |
| CreateCaseModal.tsx | "Fall erstellen" | `bg-slate-800` | ✅ |
| CaseDetailForm.tsx | "Speichern" | `bg-slate-800` | ✅ |
| StaffManager.tsx | "Hinzufügen" | `bg-slate-800` | ✅ |
| settings/page.tsx | "Einstellungen speichern" | `bg-slate-800` | ✅ |

→ **Konsistent.** Einzige Ausnahme: "Suchen" ist slate-700 (subtil, akzeptabel als sekundärer Button).

### Secondary Button Farben

| Button | Farbe | Status |
|--------|-------|--------|
| "Abbrechen" (Modal/Form) | `border-gray-300 text-gray-700` | ✅ Konsistent |
| "Exportieren" | `border-gray-300 text-gray-700` | ✅ |
| "Filter zurücksetzen" | `text-gray-400` (kein Border) | ✅ Minimalistisch |

### Spezial-Buttons

| Button | Farbe | Begründung |
|--------|-------|------------|
| "Erledigt" | `border-emerald-300 bg-emerald-50 text-emerald-700` | ✅ Positiv-Semantik |
| "Termin senden" | `bg-blue-600 text-white` | ✅ Kalender-Semantik |
| "Review anfragen" | `border-emerald-300 bg-emerald-50 text-emerald-700` | ✅ Gleich wie "Erledigt" |
| "Kein Review" | `border-gray-200 text-gray-500` | ✅ Neutral/Skip |
| "Entfernen" (Staff) | `text-red-400 hover:text-red-600` | ✅ Destruktiv-Semantik |

→ **Kein Farb-Chaos. Semantisches System funktioniert.**

---

## 2. Focus-Ring-Konsistenz

| Datei | Focus-Klassen | Status |
|-------|--------------|--------|
| CaseDetailForm.tsx | `focus:border-slate-500 focus:ring-1 focus:ring-slate-500` | ✅ |
| CreateCaseModal.tsx | `focus:border-slate-500 focus:ring-1 focus:ring-slate-500` | ✅ |
| CaseListClient.tsx | `focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400` | ⚠️ Leicht anders (ring-2, slate-400/30) |
| StaffManager.tsx | Keine expliziten Focus-Klassen | ⚠️ Browser-Default |
| settings/page.tsx | `focus:border-gray-400 focus:ring-1 focus:ring-gray-400` | ⚠️ gray-400 statt slate-500 |
| MetricsView.tsx | Keine Inputs | n/a |

**Inkonsistenz:** 3 verschiedene Focus-Ring-Stile:
1. `slate-500 ring-1` (CaseDetailForm, CreateCaseModal) ← Standard
2. `slate-400/30 ring-2` (CaseListClient Search) ← subtiler
3. `gray-400 ring-1` (Settings) ← anders

**Empfehlung:** Alle auf `focus:border-slate-500 focus:ring-1 focus:ring-slate-500` standardisieren.

---

## 3. Input-Klassen-Konsistenz

| Datei | Input-Klasse | Border | Status |
|-------|-------------|--------|--------|
| CaseDetailForm.tsx | `border-gray-200` | gray-200 | ✅ |
| CreateCaseModal.tsx | `border-gray-300` | gray-300 | ⚠️ |
| StaffManager.tsx | `border-gray-200` | gray-200 | ✅ |
| settings/page.tsx | `border-gray-200` | gray-200 | ✅ |

**Inkonsistenz:** CreateCaseModal verwendet `border-gray-300` (etwas dunkler), alle anderen `border-gray-200`.

---

## 4. Accessibility (a11y)

### Labels

| Komponente | Label-Status | Details |
|-----------|-------------|---------|
| CaseDetailForm | ✅ | Alle Inputs haben `htmlFor` Labels |
| CreateCaseModal | ✅ | Alle Inputs haben `htmlFor` Labels |
| StaffManager | ✅ | Labels vorhanden |
| Settings | ✅ | Labels vorhanden |
| CaseListClient Search | ⚠️ | Kein Label (nur Placeholder) |
| OpsShell Hamburger | ✅ | `aria-label="Menü öffnen"` |
| OpsShell Close | ✅ | `aria-label="Menü schliessen"` |
| Settings Toggles | ✅ | `role="switch"` + `aria-checked` |

### Farb-Kontrast

| Element | Vordergrund | Hintergrund | Geschätztes Verhältnis | Status |
|---------|------------|-------------|----------------------|--------|
| Primary Button | white | slate-800 (#1e293b) | >7:1 | ✅ AAA |
| Muted Text | gray-400 (#9ca3af) | white | ~3:1 | ⚠️ AA-Large only |
| Placeholder Text | gray-400 | white | ~3:1 | ⚠️ Typisch für Placeholders |
| Status Badge "Neu" | blue-700 (#1d4ed8) | blue-100 (#dbeafe) | >4.5:1 | ✅ AA |
| Puls "Achtung" | red-700 | red-100 | >4.5:1 | ✅ AA |
| Review "R" Badge | emerald-600 | emerald-50 | ~4.5:1 | ⚠️ Grenzwertig |
| Timestamp | gray-400 | white | ~3:1 | ⚠️ AA-Large only |

**Kritisch:** Keine. Timestamps und Placeholder in gray-400 sind branchenüblich und kein Blocker.

### Keyboard Navigation

| Funktion | Keyboard-Support | Status |
|----------|-----------------|--------|
| Nav-Links | ✅ Standard (Tab + Enter) | ✅ |
| Form Inputs | ✅ Standard | ✅ |
| Filter Dropdowns | ⚠️ Hover-only (`:hover` + `:focus-within`) | ⚠️ |
| Modal Close | ❌ Kein Escape-Handler | ⚠️ |
| Puls Case-Cards | ✅ Links (Tab + Enter) | ✅ |
| Desktop Table Rows | ⚠️ onClick (nicht keyboard-navigierbar ausser Fall-ID Link) | ⚠️ |

**Empfehlung:** Filter Dropdowns könnten ein `tabIndex` und explicit `:focus-within` brauchen. Modal sollte Escape schliessen. Table Rows sind per Fall-ID-Link erreichbar (akzeptabel).

---

## 5. Wording-Konsistenz

### Deutsche Begriffe

| Konzept | Verwendung | Konsistent? |
|---------|-----------|-------------|
| Fall | "Neuer Fall", "Fall erstellen", "Fall →", "Fälle" | ✅ |
| Melder | "Name des Melders", "Melder", "reporter_name" | ✅ |
| Puls | Nav-Label "Puls" | ✅ |
| Leitstand | Tab-Titel "{Name} Leitstand" | ✅ |
| Einsatzplan | Nav-Label, Page Title | ✅ |
| Termin | "Termin", "Termine" | ✅ |
| Mitarbeiter | Nav-Label, Page Title | ✅ |
| Erledigt | Status Label, Quick-Button | ✅ |
| Dringlichkeit | Label, Filter | ✅ |

### SaaS-Wording Check (verboten laut Memory)

| Verboten | Vorkommen im UI? | Status |
|----------|-----------------|--------|
| "Wizard" | ❌ Nicht in UI (nur in Code: `SOURCE_LABEL.wizard = "Website"`) | ✅ |
| "Cockpit" | ❌ | ✅ |
| "Dashboard" | ❌ | ✅ |
| "Onboarding" | ❌ | ✅ |
| "Pipeline" | ❌ | ✅ |
| "Ticket" | ❌ | ✅ |
| "Agent" | ❌ (nur in Source Label: "Voice Agent" — intern) | ⚠️ |
| "User" | ❌ | ✅ |

**Anmerkung:** `SOURCE_LABELS` in `cases/[id]/page.tsx` hat `voice: "Voice Agent"`. Das ist in der Fall-Detail-Ansicht sichtbar. Sollte "Anruf" oder "Telefonisch" sein (wie in CaseListClient: `voice: "Anruf"`).

---

## 6. Edge Cases

### Leere Zustände

| Kontext | Empty State Text | Qualität |
|---------|-----------------|----------|
| Puls komplett leer | Nur "Achtung" mit "Alles im Griff" | ✅ Positiv |
| Tabelle leer | "Keine Fälle gefunden." | ✅ |
| Einsatzplan leer | "Termine erscheinen hier, sobald..." | ✅ Handlungsorientiert |
| Mitarbeiter leer | "Noch keine Mitarbeiter erfasst." | ✅ |
| Timeline leer | "Noch keine Einträge." | ✅ |
| Anhänge leer | "Keine Anhänge." | ✅ |
| Kennzahlen Fehler | "Fehler beim Laden der Kennzahlen." | ✅ |

### Loading States

| Kontext | Loading State | Qualität |
|---------|-------------|----------|
| Einsatzplan | "Laden…" | ✅ Minimal |
| Mitarbeiter | "Laden…" | ✅ |
| Kennzahlen | "Laden…" | ✅ |
| Einstellungen | "Laden…" | ✅ |
| Cases Page | Server-rendered (kein Spinner) | ✅ |
| Anhänge | "Laden..." | ⚠️ Drei Punkte statt "…" (Stilbruch) |

**Inkonsistenz:** AttachmentsSection verwendet "Laden..." (ASCII dots) statt "Laden…" (Ellipsis char) wie alle anderen Komponenten.

### Error Handling

| Kontext | Error UI | Qualität |
|---------|---------|----------|
| Cases Page Supabase-Fehler | Rote Meldung mit error.message | ✅ |
| Save fehlgeschlagen | Rote Inline-Meldung | ✅ |
| Invite fehlgeschlagen | Rote Inline-Meldung | ✅ |
| Upload fehlgeschlagen | Rote Inline-Meldung | ✅ |
| Settings laden fehlgeschlagen | Fehlermeldung | ✅ |
| Staff-API fehlgeschlagen | Silent (kein Fehler-UI) | ⚠️ |
| Metrics laden fehlgeschlagen | Rote Meldung | ✅ |

---

## 7. Responsive Edge Cases

| Situation | Verhalten | Status |
|-----------|-----------|--------|
| Sehr langer Tenant-Name | `truncate` auf Sidebar-Name | ✅ |
| Sehr langer Reporter-Name | `truncate` in Tabelle | ✅ |
| Kein Adresse (nur PLZ/Ort) | Graceful degradation | ✅ |
| Kein Reporter-Name | Dash (—) in Tabelle | ✅ |
| Sehr lange Beschreibung | `line-clamp-1` (Puls), `truncate` (Tabelle), full (Detail) | ✅ |
| Case ohne seq_number | `formatCaseId(null, "DA")` | ⚠️ Zeigt "DA-????" oder similar |
| 0 Fälle im System | Puls: "Alles im Griff", Tabelle: "Keine Fälle", KPIs: alle 0 | ✅ |

---

## 8. Performance-Relevante Patterns

| Pattern | Evidenz | Risiko |
|---------|---------|--------|
| Puls-Query limitiert auf 200 | `.limit(200)` | Low (bei >200 aktiven Fällen: älteste werden abgeschnitten) |
| Stats-Query limitiert auf 1000 | `.limit(1000)` | Low |
| Server Components für Datenladen | cases/page.tsx, cases/[id]/page.tsx | ✅ Keine Client-Fetches für Primärdaten |
| Client Components für Interaktion | CaseDetailForm, PulsView, etc. | ✅ Korrekte Trennung |
| Staff-Fetch pro CaseDetailForm-Mount | `useEffect` → `GET /api/ops/staff` | ⚠️ Nicht gecacht, bei jedem Fall-Öffnen |

---

## Zusammenfassung: Prioritisierte Findings

### Must-Fix (vor nächstem Release)
1. SOURCE_LABELS: `voice: "Voice Agent"` → `voice: "Anruf"` in `cases/[id]/page.tsx`

### Should-Fix (nächste Iteration)
2. Focus-Ring-Konsistenz standardisieren (3 verschiedene Stile → 1)
3. Input-Border-Konsistenz (gray-200 vs gray-300)
4. "Laden..." → "Laden…" in AttachmentsSection
5. Modal Escape-Handler

### Nice-to-Have
6. Search Input Label (a11y)
7. Table Row Keyboard-Navigierbarkeit
8. Staff-Fetch Caching
