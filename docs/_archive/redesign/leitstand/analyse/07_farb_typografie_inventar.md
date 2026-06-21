# 07 — Farb- & Typografie-Inventar

> Vollständiges Inventar aller Farben und Typografie-Klassen im Leitstand.

---

## 1. Farbsystem — Übersicht

### Primärfarben (Tailwind)

| Farbe | Verwendung | Kontext |
|-------|-----------|---------|
| **slate-800** | Primary Buttons | "Speichern", "Fall erstellen", "+ Neuer Fall", "Einstellungen speichern", "+ Mitarbeiter" |
| **slate-700** | Button Hover, Toggle Active, Quick-Time Active | Hover-State aller Primary Buttons, aktiver Today/Week Toggle |
| **slate-600** | Avatare, Download-Links | Staff-Avatar im Einsatzplan, Attachment-Download |
| **slate-500** | Focus Rings | `focus:border-slate-500 focus:ring-slate-500` auf allen Form-Inputs |
| **slate-400** | Timeline Dots | CaseTimeline Event-Punkte |
| **slate-100** | Backgrounds, Badges | Case-ID Badge, OpsShell bg, Table Header bg (slate-50/80) |
| **slate-50** | Shell Background | `bg-slate-50` Desktop Sidebar, Table Header |

### Semantische Farben

| Farbe | Bedeutung | Verwendungsorte |
|-------|-----------|----------------|
| **red-500** | Notfall-Urgency | Urgency Dot (notfall), Puls "Achtung" Dot |
| **red-700** | Notfall-Text | Puls "Achtung" Header, Kennzahlen "Notfälle" |
| **red-100/200** | Achtung Background/Border | Puls "Achtung" Section |
| **red-600** | Error Messages | Fehlermeldungen überall |
| **amber-500** | Dringend-Urgency | Urgency Dot (dringend), Puls "Heute" Dot |
| **amber-700** | Heute-Text | Puls "Heute" Header |
| **amber-100/200** | Heute Background/Border | Puls "Heute" Section |
| **amber-400/600** | Timeline Next-Step | Dashed Circle + Text (deliberate — "nächster Schritt") |
| **blue-500/700** | In Arbeit + Neu-Status | Puls "In Arbeit", Status "new" Badge |
| **blue-100/200** | In Arbeit Background/Border | Puls "In Arbeit" Section |
| **blue-600** | Contact Links + Termin-Button | tel:/mailto: Links, "Termin senden" Button |
| **sky-100/700** | Contacted-Status | Status Badge "Kontaktiert" |
| **violet-100/700** | Scheduled-Status + Bestätigt | Status Badge "Geplant", Appointment "Bestätigt" |
| **emerald-500/700** | Done + Positive | Puls "Abschluss", Status "Erledigt", "Gespeichert", "Alles im Griff" |
| **emerald-100/200** | Abschluss Background/Border | Puls "Abschluss" Section |
| **emerald-50/300** | Review + Erledigt Buttons | "Erledigt" Button, Review-Buttons |
| **gray-400** | Normal-Urgency + Muted | Urgency Dot (normal), Placeholder-Text, Muted Info |

### Tenant-Farbe (dynamisch)

| Kontext | Anwendung | Fallback |
|---------|-----------|----------|
| Sidebar Header Background | `style={{ backgroundColor: color }}` | `#d97706` (amber-600) |
| Mobile Header Background | `style={{ backgroundColor: color }}` | `#d97706` |
| Nav Active Background | `${color}10` (10% Opacity) | amber-600 at 10% |
| Nav Active Text + Border | `color: color` | amber-600 |

---

## 2. Farb-Audit: Amber-Reste

### Nach Renovation (15.03.) bereinigt ✅

| Datei | Was | Vorher | Nachher |
|-------|-----|--------|---------|
| CaseDetailForm.tsx | Focus Rings | amber-500 | slate-500 |
| CaseDetailForm.tsx | Save Buttons | amber-500 | slate-800 |
| CaseDetailForm.tsx | Quick-Time Active | amber-500 | slate-700 |
| CaseDetailForm.tsx | Time Hover | amber-500 | slate-500 |
| CreateCaseModal.tsx | Focus Rings | amber-500 | slate-500 |
| CreateCaseModal.tsx | Submit Button | amber-500 | slate-800 |
| ScheduleView.tsx | Avatar | amber-500 | slate-600 |
| ScheduleView.tsx | "Fall →" Link | amber-600 | slate-700 |
| StaffManager.tsx | Save Button | amber-500 | slate-800 |
| settings/page.tsx | Save Button | amber-500 | slate-800 |
| settings/page.tsx | Toggle Active | amber-500 | slate-700 |
| settings/page.tsx | NavCard Hover | amber-300 | gray-300 |
| AttachmentsSection.tsx | Download Link | amber-600 | slate-600 |
| cases/[id]/page.tsx | Case-ID Badge | amber-100/700 | slate-100/700 |

### Verbleibende Amber-Verwendungen (deliberate)

| Datei | Kontext | Farbe | Begründung |
|-------|---------|-------|------------|
| CaseTimeline.tsx | Next-Step Hint Circle | `border-amber-400` (dashed) | Semantisch korrekt: amber = "Achtung, nächste Aktion nötig" |
| CaseTimeline.tsx | Next-Step Hint Text | `text-amber-600` | Gleiche Semantik |
| PulsView.tsx | "Heute" Group | `bg-amber-100`, `text-amber-700` | Semantisches Farbsystem: amber = "Heute/Aufmerksamkeit" |
| CaseListClient.tsx | Urgency Dot "dringend" | `bg-amber-500` | Semantisch: amber = "Mittel-Dringlichkeit" |
| cases/[id]/page.tsx | Urgency Dot "dringend" | `bg-amber-500` | Gleiches System |
| OpsShell.tsx | Brand Color Fallback | `#d97706` | Fallback wenn kein Tenant — korrekt als "Standardfarbe" |
| settings/page.tsx | NavCard "Mitarbeiter" BG | `bg-amber-50` | Dekorative Farbunterscheidung (amber/emerald/blue) |

→ **Alle verbleibenden Amber-Verwendungen sind semantisch korrekt.** Kein Cleanup nötig.

---

## 3. Typografie-Inventar

### Schriftgrössen (Tailwind)

| Klasse | Verwendung |
|--------|-----------|
| `text-2xl` | KPI-Card Zahlen, Metric-Card Zahlen |
| `text-lg` | Page Headers ("Einstellungen", "Kennzahlen", "Neuer Fall"), Section Titles |
| `text-base` | Attachments Section Title ("Anhänge") |
| `text-sm` | Formular-Felder, Tabellen-Content, Puls Case-Cards, Nav Primary Items, Buttons, Descriptions |
| `text-xs` | Labels, Badges, Timestamps, Nav Secondary Items, Filter Buttons, Status Badges, Pagination, Muted Info |
| `text-[11px]` | Section Labels (UPPERCASE: "KONTAKT", "VERLAUF", "STATUS"), Form Labels in CaseDetailForm |
| `text-[10px]` | "Verwaltung" Nav Separator, Review "R" Badge, Appointment Status Badge |

### Schriftgewichte

| Klasse | Verwendung |
|--------|-----------|
| `font-bold` | Page Headers, KPI-Zahlen, Metric-Zahlen, Puls Group Labels, Staff Avatare Initiale, Tenant Name |
| `font-semibold` | Section Titles, Nav Active, Case-Card Category, Case-ID Badge, Settings Save Button, Table Headers |
| `font-medium` | Form Labels, Nav Items, Buttons, Table Cell Primary, Status Badges, Filter Buttons |
| (normal) | Body Text, Descriptions, Placeholder Text |

### Text-Transformationen

| Klasse | Verwendung |
|--------|-----------|
| `uppercase` | Section Labels (lbl class in CaseDetailForm), Table Headers, "Verwaltung" Separator |
| `tracking-wide` | Section Labels, Table Headers |
| `tracking-wider` | "Verwaltung" Separator |
| `capitalize` | Staff Role in Table, Staff Role in Einsatzplan |
| `truncate` | Sidebar Name, Table Cells (Adresse, Problem), Reporter Name |
| `line-clamp-1` | Puls Case-Card Description |

---

## 4. Spacing-System

### Consistent Patterns

| Pattern | Wert | Verwendung |
|---------|------|-----------|
| Page Padding | `px-4 py-6` (in main) | Alle Seiten |
| Section Gap | `space-y-4` bis `space-y-6` | Zwischen Sektionen |
| Card Padding | `p-3.5` bis `p-5` | Cards, Sections |
| Form Gap | `gap-3` | Grid-Gaps in Forms |
| Button Padding | `px-3.5 py-2` bis `px-6 py-2.5` | Alle Buttons |
| Border Radius | `rounded-lg` (Buttons, Inputs) / `rounded-xl` (Cards, Sections) | Durchgängig |

---

## 5. Responsive Breakpoints

| Breakpoint | Klasse | Effekt |
|-----------|--------|--------|
| `md:` (768px) | `md:flex`, `md:fixed` | Sidebar Desktop vs Mobile |
| `md:` | `md:h-auto`, `md:max-w-lg`, `md:rounded-xl` | Modal sizing |
| `sm:` (640px) | `sm:grid-cols-2`, `sm:grid-cols-3`, `sm:grid-cols-4` | Form Grids erweitern |
| `sm:` | `sm:inline`, `sm:table-cell` | Reporter Name, Staff Phone/Email |
| `lg:` (1024px) | `lg:grid-cols-4`, `lg:grid-cols-5` | KPI Grid, Case Detail Columns |
| `lg:` | `lg:block`, `lg:hidden` | Desktop Table vs Mobile Cards |

---

## 6. Schatten & Borders

| Element | Border | Schatten |
|---------|--------|---------|
| Cards / Sections | `border border-gray-200` | `shadow-sm` |
| Puls Case-Cards | `border ${group.borderColor}` | Kein Schatten (hover: `shadow-md`) |
| Sidebar | `border-r border-slate-200` | Kein Schatten |
| Mobile Sidebar | — | `shadow-xl` |
| Modals | — | `shadow-xl` |
| KPI Cards | `border border-gray-200 border-l-4 ${accent}` | Kein Schatten |
| Inputs | `border border-gray-200` oder `border-gray-300` | Kein Schatten |
