# 01 — JSX→DOM Anatomie

> Jede OPS-Seite: Component Tree, Server/Client-Split, Props-Flow, Render-Bedingungen.

---

## Architektur-Übersicht

```
app/ops/(auth)/login/page.tsx      → Login (standalone, kein Shell)
app/ops/(dashboard)/layout.tsx     → DashboardLayout (Server) → OpsShell (Client)
  ├── cases/page.tsx               → OpsCasesPage (Server)
  │     ├── PulsView (Client)
  │     ├── FilterBar (Server-rendered Links)
  │     └── CaseListClient (Client)
  │           └── CreateCaseModal (Client)
  ├── cases/[id]/page.tsx          → CaseDetailPage (Server)
  │     ├── CaseDetailForm (Client)
  │     ├── CaseTimeline (Client)
  │     └── AttachmentsSection (Client)
  ├── schedule/page.tsx            → ScheduleView (Client)
  ├── staff/page.tsx               → StaffManager (Client)
  ├── metrics/page.tsx             → MetricsView (Client)
  ├── settings/page.tsx            → SettingsPage (Client)
  └── welcome/page.tsx             → WelcomePage (standalone dark theme)
```

---

## 1. DashboardLayout (`layout.tsx`)

**Typ:** Server Component
**Verantwortung:** Auth-Check, Tenant-Identity, Staff-Count, Shell-Rendering

### Data Flow
```
getAuthClient() → user
  → resolveTenantIdentity(user) → { displayName, shortName, caseIdPrefix, primaryColor }
  → resolveTenantScope() → { tenantId, isAdmin, isProspect }
  → supabase.from("staff").select("id", { count: "exact", head: true })
      .eq("tenant_id", scope.tenantId).eq("is_active", true) → staffCount
```

### Props → OpsShell
```typescript
<OpsShell
  userEmail={user.email}
  tenantName={identity?.displayName}     // R4: Tenant, nie FlowSight
  brandColor={identity?.primaryColor}    // E3: Eine Farbe pro Tenant
  staffCount={staffCount}                // §2: Progressive Nutzungstiefe
/>
```

### Metadata
```typescript
generateMetadata() → { title: { absolute: `${shortName} Leitstand` } }
// R4: title.absolute umgeht root layout's " — FlowSight" Template
```

---

## 2. OpsShell (`OpsShell.tsx`)

**Typ:** Client Component ("use client")
**State:** `sidebarOpen: boolean`

### DOM-Struktur

```
div.min-h-screen.bg-slate-100
├── aside.hidden.md:flex (Desktop Sidebar, 224px/w-56)
│   ├── div (Brand Header, backgroundColor = brandColor)
│   │   └── Link /ops/cases → initials + displayName
│   ├── nav.flex-1
│   │   ├── div.space-y-1 (PRIMARY_NAV: 3 Items)
│   │   │   ├── Link "Puls" → /ops/cases
│   │   │   ├── Link "Einsatzplan" → /ops/schedule
│   │   │   └── Link "Einstellungen" → /ops/settings
│   │   └── div.mt-5.pt-4.border-t (SECONDARY_NAV)
│   │       ├── p "Verwaltung" (10px uppercase label)
│   │       ├── Link "Kennzahlen" → /ops/metrics (immer)
│   │       └── Link "Mitarbeiter" → /ops/staff (nur wenn staffCount > 0)
│   └── div (User info + Logout)
├── div.md:hidden (Mobile Header, backgroundColor = brandColor)
│   ├── button (Hamburger)
│   ├── Link → initials + displayName
│   └── div.w-9 (Spacer)
├── div.md:hidden.fixed (Mobile Sidebar Overlay, wenn sidebarOpen)
│   ├── div.bg-black/30 (Backdrop)
│   └── aside.w-64 (gleicher sidebarContent)
└── main.md:ml-56
    └── div.max-w-6xl.mx-auto.px-4.py-6
        └── {children}
```

### Navigation Active-State
- Active: `border-l-2`, `backgroundColor: ${color}10`, `color: color`
- Primär: `text-sm font-medium`, Icons `w-5 h-5`
- Sekundär: `text-xs font-medium`, Icons `w-4 h-4`
- Mitarbeiter gerendert: `staffCount > 0`

### Berechnete Werte
```typescript
displayName = tenantName ?? "Leitstand"
initials = tenantName ? erste 2 Wort-Anfangsbuchstaben : "LS"
color = brandColor ?? "#d97706" (amber-600 fallback)
```

---

## 3. Cases Page (`cases/page.tsx`)

**Typ:** Server Component
**Verantwortung:** Daten laden (3 parallele Queries), Puls/Liste entscheiden

### Data Flow
```
searchParams → filterStatus, filterUrgency, filterSource, filterQuery, showAll, showDemo, currentPage
resolveTenantScope() → scope
  → Non-admin: force tenantId
  → Admin: optional URL-filter

showPuls = !filterStatus && !filterUrgency && !filterSource && !filterQuery && !showAll

Promise.all([
  statsQuery    → allCases (für KPI-Berechnung)
  listQuery     → cases (für Tabelle, paginiert)
  pulsQuery     → pulsCases (für PulsView, max 200, nur wenn showPuls)
])

resolveTenantIdentity → caseIdPrefix, tenantShortName
```

### DOM-Struktur (Render-Reihenfolge)
```
<>
  {showPuls && pulsCases && <PulsView cases={pulsCases} caseIdPrefix={caseIdPrefix} />}

  <div.bg-white.border.rounded-xl.p-3.mb-5>   ← Filter Bar (immer sichtbar)
    ├── Demo/Real Toggle (Link-Buttons)
    ├── Offen/Alle Toggle (Link-Buttons)
    ├── Status Dropdown (FilterSelect)
    ├── Urgency Dropdown (FilterSelect)
    ├── Source Dropdown (FilterSelect)
    └── "Filter zurücksetzen" (wenn hasActiveFilters)
  </div>

  <CaseListClient
    rows={rows}
    kpi={kpi}
    hiddenByPuls={showPuls}    ← steuert ob KPIs + Tabelle sichtbar
    ...
  />
</>
```

### FilterSelect Component
- CSS-only Dropdown (`:hover` + `:focus-within`)
- Jede Option = Link (SSR-kompatibel, kein JS nötig)
- Active: `bg-slate-700 text-white`

---

## 4. PulsView (`PulsView.tsx`)

**Typ:** Client Component (pure, kein fetch)
**Props:** `cases: CaseRow[]`, `caseIdPrefix: string`

### Grouping-Logik (`groupCases()`)
```
for each case (nicht archived):
  if status !== "done" && (urgency === "notfall" || stuck > 48h)  → Achtung
  if status === "done" && done < 7d                                → Abschluss
  if status === "new" || created today                             → Heute
  else                                                             → In Arbeit
```

### DOM-Struktur
```
div.space-y-5.mb-6
  └── section (pro Gruppe, 4 möglich)
      ├── div.flex.items-center (Group Header)
      │   ├── span (farbiger Dot)
      │   ├── h2 (Label: "Achtung"/"Heute"/"In Arbeit"/"Abschluss")
      │   └── span (Count Badge)
      ├── [wenn leer && key === "achtung"]
      │   └── div: ✓ "Alles im Griff" (emerald)
      └── [wenn nicht leer]
          └── div.space-y-2
              └── Link → /ops/cases/{id} (Case Card)
                  ├── Row 1: Urgency Dot + Category + Reporter | TimeAgo + CaseID
                  ├── Row 2: Description (line-clamp-1)
                  └── Row 3: PLZ City + Status Badge + Review "R" Badge + Assignee
```

### Collapse-Logik
```
if (isEmpty && group.key !== "achtung") return null;
// → Nur Achtung immer sichtbar, rest nur wenn Cases vorhanden
```

### Farbsystem
| Gruppe | Header BG | Border | Dot | Text |
|--------|-----------|--------|-----|------|
| Achtung | bg-red-100 | border-red-200 | bg-red-500 | text-red-700 |
| Heute | bg-amber-100 | border-amber-200 | bg-amber-500 | text-amber-700 |
| In Arbeit | bg-blue-100 | border-blue-200 | bg-blue-500 | text-blue-700 |
| Abschluss | bg-emerald-100 | border-emerald-200 | bg-emerald-500 | text-emerald-700 |

---

## 5. CaseListClient (`CaseListClient.tsx`)

**Typ:** Client Component
**State:** `modalOpen`, `search`
**Props:** `rows`, `kpi`, `currentPage`, `totalPages`, `totalCount`, `searchQuery`, `caseIdPrefix`, `tenantShortName`, `hiddenByPuls`

### DOM-Struktur
```
<>
  {!hiddenByPuls && <KPI Cards (4x: Total, Neu heute, In Bearbeitung, Erledigt 7d)>}

  <Action Bar>
    ├── Search Form (input + Suchen button)
    ├── Count Label ("{n} Fälle")
    ├── "Exportieren" Button (CSV)
    └── "+ Neuer Fall" Button (öffnet Modal)
  </Action Bar>

  {hiddenByPuls ? null :
    rows.length === 0 ? <Empty> :
    <>
      <Desktop Table (hidden lg:block)>
      <Mobile Cards (lg:hidden)>
    </>
  }

  {!hiddenByPuls && totalPages > 1 && <Pagination>}

  <CreateCaseModal open={modalOpen} />
</>
```

### KPI Cards
- Grid: `grid-cols-2 lg:grid-cols-4`
- Jede Karte: `border-l-4 ${accent}`, Link zu gefilterter Ansicht
- **Nur sichtbar wenn `!hiddenByPuls`** (also nur bei aktiven Filtern/Suche)

### Desktop Table Columns
| # | Header | Breite | Inhalt |
|---|--------|--------|--------|
| 1 | Fall-ID | auto | formatCaseId (Link) |
| 2 | Kunde | auto | reporter_name |
| 3 | Adresse | max-w-180px | street + PLZ city |
| 4 | Problem | max-w-220px | category — description (truncated) |
| 5 | Quelle | auto | Icon + Label |
| 6 | Dringlichkeit | auto | Dot + Label |
| 7 | Status | auto | Badge + Review "R"/"R✓" |
| 8 | Erstellt | auto | date |

---

## 6. Case Detail Page (`cases/[id]/page.tsx`)

**Typ:** Server Component
**Data:** `cases.*` + `case_events.*` + `resolveTenantIdentityById()`

### DOM-Struktur
```
<>
  <Header>
    ├── Link ← (back to /ops/cases)
    ├── Urgency Dot + Category (h1)
    ├── Date + Source
    └── Case ID Badge (bg-slate-100 text-slate-700)
  </Header>

  <Scan-Kopf (bg-white border rounded-xl p-4)>
    ├── Was: Category — Description (truncated 60)
    ├── Wo: Address + Maps Icon Link
    ├── Wer: → Assignee oder "Nicht zugewiesen"
    └── Wann: Termin-Datum oder "Kein Termin"
  </Scan-Kopf>

  <Grid grid-cols-1 lg:grid-cols-5>
    ├── Left (col-span-3): CaseDetailForm
    └── Right (col-span-2):
        ├── Contact Card (hidden for prospects)
        │   └── Name, Phone (tel: link), Email (mailto: link), Address, Maps Link
        ├── Timeline (CaseTimeline)
        └── Attachments (hidden for prospects)
  </Grid>
</>
```

---

## 7. CaseDetailForm (`CaseDetailForm.tsx`)

**Typ:** Client Component
**State:** 14 form fields + baseline + saveState + inviteState + reviewState + staffMembers
**Logik:** dirty-check (14-field comparison), beforeunload guard

### Prospect View (isProspect === true)
```
section.bg-white.border.rounded-xl.p-5
├── Status (select, einziges editierbares Feld)
├── Kategorie + Dringlichkeit (read-only)
├── Beschreibung (read-only)
├── Ort + Melder (read-only)
├── Action Bar: "Status speichern" + "Erledigt"
└── Review Nachlauf (wenn status === "done")
```

### Full View (Admin/Tenant)
```
section.bg-white.border.rounded-xl.p-5
├── Row 1: Status (select) + Dringlichkeit (select) + Kategorie (input)
├── Row 2: PLZ + Ort + Strasse + Nr
├── Row 3: Melder + Telefon + E-Mail + Zuständig (dropdown wenn staff > 0, sonst input)
├── Row 4: Beschreibung (textarea)
├── Row 5: Termin (datetime-local + Quick-Time Buttons) | Interne Notizen (textarea)
│   └── Quick-Time: Heute/Morgen Toggle + 08:00/11:00/15:00 Buttons
│   └── "Termin senden" Button (wenn scheduledAt gesetzt)
├── Action Bar: "Speichern" + "Erledigt"
└── Review Nachlauf (wenn status === "done")
    ├── Status Badge (deriveReviewStatus)
    ├── "Review anfragen" / "Nochmals anfragen"
    ├── "Kein Review"
    └── Counter "{n}/2 Anfragen"
```

---

## 8. ScheduleView (`ScheduleView.tsx`)

**Typ:** Client Component
**State:** `appointments[]`, `loading`, `view: "today" | "week"`
**Fetch:** `GET /api/ops/appointments?from=...&to=...`

### DOM-Struktur
```
div
├── Header: "Einsatzplan" + "Termine nach Mitarbeiter gruppiert" + Heute/Woche Toggle
└── Content:
    ├── [loading] → "Laden…"
    ├── [empty] → "Termine erscheinen hier, sobald Sie im Fall einen Termin anlegen."
    └── [appointments grouped by staff]
        └── section (pro Mitarbeiter)
            ├── Header: Avatar (Initiale, bg-slate-600) + Name + Role + Count
            └── Rows (pro Termin):
                ├── Time + Duration + Status Badge + Category + Reporter
                ├── Address Line (street house_number, PLZ city)
                ├── Notes (truncated)
                └── "Fall →" Link
```

### Appointment Grouping
```typescript
const byStaff = new Map<string, { staff: StaffMember; items: Appointment[] }>();
// Key: staff_id, grouped in order of first appearance
```

---

## 9. StaffManager (`StaffManager.tsx`)

**Typ:** Client Component
**State:** `staff[]`, `loading`, `showForm`, `editingId`, form fields (name, role, phone, email), `saving`
**Fetch:** `GET /api/ops/staff`, `POST /api/ops/staff`, `PATCH /api/ops/staff/{id}`, `DELETE /api/ops/staff/{id}`

### DOM-Struktur
```
div
├── Header: "Mitarbeiter" + "Team verwalten..." + "+ Mitarbeiter" Button
├── [showForm] → Form Card (Name, Rolle, Telefon, E-Mail + Hinzufügen/Abbrechen)
└── [staff list]
    ├── [empty] → "Noch keine Mitarbeiter erfasst."
    └── Table (bg-white border rounded-xl)
        ├── thead: Name | Rolle | Telefon | E-Mail | (actions)
        └── tbody: Rows mit "Bearbeiten" + "Entfernen" Links
```

### Rollen-Dropdown
```
techniker | projektleiter | buero | inhaber | lernender
```

---

## 10. MetricsView (`MetricsView.tsx`)

**Typ:** Client Component
**State:** `data: MetricsData | null`, `loading`
**Fetch:** `GET /api/ops/metrics`

### DOM-Struktur
```
div
├── Header: "Kennzahlen" + "Trends und Übersicht — nur für Inhaber sichtbar"
└── Grid (grid-cols-2 lg:grid-cols-4, 8 Karten)
    ├── Total Fälle (slate-900)
    ├── Offen (blue-700)
    ├── Erledigt Woche (emerald-700)
    ├── Erledigt Monat (emerald-700)
    ├── Ø Bearbeitungszeit
    ├── Notfälle (red-700)
    ├── Anrufe
    └── Website
```

---

## 11. SettingsPage (`settings/page.tsx`)

**Typ:** Client Component
**State:** form fields + loading/saving/saved/error
**Fetch:** `GET /api/ops/settings`, `PATCH /api/ops/settings`

### DOM-Struktur
```
div
├── Header: "Einstellungen" + "Konfiguration für {tenant_name}"
├── Quick Links (3 NavCards: Mitarbeiter, Kennzahlen, Einsatzplan)
├── Section: Google-Bewertungen (URL Input)
├── Section: Termine (Duration Select + Calendar Email Input)
├── Section: Melder-Benachrichtigungen (2 Toggles: E-Mail, SMS)
├── Section: Betriebsinformationen (read-only: Name, Fall-Präfix)
└── Save Bar: "Einstellungen speichern" Button
```

---

## 12. CaseTimeline (`CaseTimeline.tsx`)

**Typ:** Client Component (pure)
**Props:** `events: CaseEvent[]`, `status?: string`

### DOM-Struktur
```
div.relative
├── div (vertical connecting line, bg-gray-200)
└── ul.space-y-3
    ├── li (pro Event)
    │   ├── dot (bg-slate-400, 14px)
    │   └── title + date
    └── [nextStep hint, wenn status in {new, contacted, scheduled}]
        ├── dot (border-dashed border-amber-400, bg-white)
        └── text (text-amber-600: "Kunden kontaktieren" / "Termin vereinbaren" / "Einsatz durchführen")
```

---

## 13. AttachmentsSection (`AttachmentsSection.tsx`)

**Typ:** Client Component
**State:** `attachments[]`, `loading`, `uploading`, `error`
**Fetch:** `GET /api/ops/cases/{id}/attachments`, `POST .../attachments` (upload flow: request-upload → PUT → confirm)

### DOM-Struktur
```
section.bg-white.border.rounded-xl.p-5
├── h2 "Anhänge"
├── Upload Label (file input, accept: image/*,.pdf, max 10MB, max 5 files)
├── Error Message
└── List
    ├── [loading] → "Laden..."
    ├── [empty] → "Keine Anhänge."
    └── ul (Attachment Items: filename, size, date, Download Link)
```

---

## 14. CreateCaseModal (`CreateCaseModal.tsx`)

**Typ:** Client Component
**State:** 10 form fields + saving + error
**Conditional:** `if (!open) return null;`
**Fetch:** `POST /api/cases`

### DOM-Struktur
```
div.fixed.inset-0.z-50
├── div.bg-black/30 (Backdrop, onClick: close)
└── div.relative.w-full.h-full.md:max-w-lg.md:rounded-xl
    ├── Header: "Neuer Fall" + Close Button
    ├── Form (scrollable): Name, Kategorie+Dringlichkeit, Telefon*, E-Mail, PLZ*+Ort*, Strasse+Nr, Beschreibung*
    └── Footer: "Abbrechen" + "Fall erstellen"
```

### Pflichtfelder (HTML required)
- Telefon, PLZ, Ort, Beschreibung

### Kategorien
```
"Sanitär" | "Heizung" | "Lüftung" | "Klima" | "Allgemein"
```

### Dringlichkeiten
```
"normal" (Normal) | "dringend" (Dringend) | "notfall" (Notfall)
```
