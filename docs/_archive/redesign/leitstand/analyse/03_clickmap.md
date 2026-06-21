# 03 — Clickmap

> Jedes interaktive Element im Leitstand: Was, Wo, Wohin/Funktion.

---

## 1. OpsShell (Sidebar + Header)

### Desktop Sidebar

| Element | Typ | Ziel/Funktion |
|---------|-----|---------------|
| Tenant Logo/Name | Link | `/ops/cases` |
| "Puls" | Link | `/ops/cases` |
| "Einsatzplan" | Link | `/ops/schedule` |
| "Einstellungen" | Link | `/ops/settings` |
| "Kennzahlen" | Link | `/ops/metrics` |
| "Mitarbeiter" | Link | `/ops/staff` (nur wenn staffCount > 0) |
| "Abmelden" | Form POST | `/api/ops/logout` |

### Mobile Header + Sidebar

| Element | Typ | Ziel/Funktion |
|---------|-----|---------------|
| Hamburger Button | onClick | `setSidebarOpen(true)` |
| Tenant Logo/Name | Link | `/ops/cases` |
| Backdrop (schwarz) | onClick | `setSidebarOpen(false)` |
| Close Button (×) | onClick | `setSidebarOpen(false)` |
| (gleiche Nav-Items wie Desktop) | | |

---

## 2. Cases Page — Filter Bar

| Element | Typ | Ziel/Funktion |
|---------|-----|---------------|
| "Ihre Fälle" Toggle | Link | `/ops/cases` (reset demo filter) |
| "Demo" Toggle | Link | `/ops/cases?tab=demo` |
| "Offen" Toggle | Link | `/ops/cases` (default, keine done/archived) |
| "Alle" Toggle | Link | `/ops/cases?show=all` (inkl. done, ohne archived) |
| Status Dropdown | Hover-Dropdown → Links | `?status={value}` |
| Dringlichkeit Dropdown | Hover-Dropdown → Links | `?urgency={value}` |
| Quelle Dropdown | Hover-Dropdown → Links | `?source={value}` |
| "Filter zurücksetzen" | Link | `/ops/cases` (alle Filter weg) |

---

## 3. Cases Page — PulsView

| Element | Typ | Ziel/Funktion |
|---------|-----|---------------|
| Case Card (ganze Karte) | Link | `/ops/cases/{id}` |

**Innerhalb jeder Case Card (nicht separat klickbar):**
- Urgency Dot, Category, Reporter, TimeAgo, CaseID, Description, Location, Status Badge, Review "R" Badge, Assignee — alles Teil des Link-Blocks

---

## 4. Cases Page — CaseListClient

### Action Bar

| Element | Typ | Ziel/Funktion |
|---------|-----|---------------|
| Search Input | Text Input | Lokal state `search` |
| "Suchen" Button | Submit | Navigation zu `?q={search}` |
| "×" (Clear Search) | onClick | `?q=` entfernt, navigation |
| "Exportieren" | onClick | CSV-Download (client-side Blob) |
| "+ Neuer Fall" | onClick | `setModalOpen(true)` |

### KPI Cards (nur bei !hiddenByPuls)

| Card | Typ | Ziel |
|------|-----|------|
| "Total Fälle" | Link | `/ops/cases?show=all` |
| "Neu heute" | Link | `/ops/cases?status=new` |
| "In Bearbeitung" | Link | `/ops/cases?status=in_progress` |
| "Erledigt (7d)" | Link | `/ops/cases?show=all&status=done` |

### Desktop Table

| Element | Typ | Ziel/Funktion |
|---------|-----|---------------|
| Table Row | onClick | `router.push(/ops/cases/{id})` |
| Fall-ID Link | Link | `/ops/cases/{id}` |

### Mobile Cards

| Element | Typ | Ziel/Funktion |
|---------|-----|---------------|
| Ganze Card | Link | `/ops/cases/{id}` |

### Pagination

| Element | Typ | Ziel/Funktion |
|---------|-----|---------------|
| "← Zurück" | onClick | `goToPage(currentPage - 1)` |
| "Weiter →" | onClick | `goToPage(currentPage + 1)` |

---

## 5. CreateCaseModal

| Element | Typ | Ziel/Funktion |
|---------|-----|---------------|
| Backdrop | onClick | `onClose()` |
| Close Button (×) | onClick | `onClose()` |
| Name Input | Text | `setReporterName()` |
| Kategorie Select | Select | `setCategory()` |
| Dringlichkeit Select | Select | `setUrgency()` |
| Telefon Input | Tel (required) | `setPhone()` |
| E-Mail Input | Email | `setEmail()` |
| PLZ Input | Text (required) | `setPlz()` |
| Ort Input | Text (required) | `setCity()` |
| Strasse Input | Text | `setStreet()` |
| Nr Input | Text | `setHouseNumber()` |
| Beschreibung Textarea | Text (required) | `setDescription()` |
| "Abbrechen" | onClick | `onClose()` |
| "Fall erstellen" | Submit | `POST /api/cases` → resetForm → onClose → router.refresh |

---

## 6. Case Detail Page — Header + Scan-Kopf

| Element | Typ | Ziel/Funktion |
|---------|-----|---------------|
| Back Arrow (←) | Link | `/ops/cases` |
| Maps Icon (Scan-Kopf "Wo") | External Link | `https://www.google.com/maps/search/?api=1&query={address}` |

---

## 7. CaseDetailForm — Full View

### Formular-Felder

| Element | Typ | Ziel/Funktion |
|---------|-----|---------------|
| Status Select | Select | `setStatus()` |
| Dringlichkeit Select | Select | `setUrgency()` |
| Kategorie Input | Text | `setCategory()` |
| PLZ Input | Text | `setPlz()` |
| Ort Input | Text | `setCity()` |
| Strasse Input | Text | `setStreet()` |
| Nr Input | Text | `setHouseNumber()` |
| Melder Input | Text | `setReporterName()` |
| Telefon Input | Tel | `setContactPhone()` |
| E-Mail Input | Email | `setContactEmail()` |
| Zuständig Select/Input | Select (wenn staff) / Text | `setAssigneeText()` |
| Beschreibung Textarea | Text | `setDescription()` |
| Termin datetime-local | DateTime | `setScheduledAt()` |
| "Heute" Quick-Day | onClick | `setQuickDay(0)` |
| "Morgen" Quick-Day | onClick | `setQuickDay(1)` |
| "08:00" Quick-Time | onClick | `setScheduledAt(quickDateTime(day, "08:00"))` |
| "11:00" Quick-Time | onClick | `setScheduledAt(quickDateTime(day, "11:00"))` |
| "15:00" Quick-Time | onClick | `setScheduledAt(quickDateTime(day, "15:00"))` |
| "Termin senden" | onClick | `handleSendInvite()` → `POST /api/ops/cases/{id}/send-invite` |
| Interne Notizen Textarea | Text | `setInternalNotes()` |

### Action Bar

| Element | Typ | Ziel/Funktion |
|---------|-----|---------------|
| "Speichern" | onClick | `performSave()` → `PATCH /api/ops/cases/{id}` |
| "Erledigt" | onClick | `handleQuickDone()` → `PATCH status=done` |

### Review Nachlauf (nur wenn status === "done")

| Element | Typ | Ziel/Funktion |
|---------|-----|---------------|
| "Review anfragen" | onClick | `handleRequestReview()` → `POST /api/ops/cases/{id}/request-review` |
| "Nochmals anfragen" | onClick | (gleich wie oben, nur anderes Label) |
| "Kein Review" | onClick | `handleSkipReview()` → `POST /api/ops/cases/{id}/skip-review` |

---

## 8. Case Detail — Right Column

### Contact Card

| Element | Typ | Ziel/Funktion |
|---------|-----|---------------|
| Telefon | tel: Link | System-Anruf |
| E-Mail | mailto: Link | System-Mail |
| "Google Maps" | External Link | Maps URL |

### Attachments

| Element | Typ | Ziel/Funktion |
|---------|-----|---------------|
| "Dateien hochladen" | File Input | `handleUpload()` (multi-step upload) |
| "Download" | External Link | Supabase Storage signed URL |

---

## 9. Schedule Page

| Element | Typ | Ziel/Funktion |
|---------|-----|---------------|
| "Heute" Toggle | onClick | `setView("today")` |
| "Woche" Toggle | onClick | `setView("week")` |
| "Fall →" Link | Link | `/ops/cases/{case_id}` |

---

## 10. Staff Page

| Element | Typ | Ziel/Funktion |
|---------|-----|---------------|
| "+ Mitarbeiter" | onClick | `setShowForm(true)` |
| Name Input | Text | `setName()` |
| Rolle Select | Select | `setRole()` |
| Telefon Input | Tel | `setPhone()` |
| E-Mail Input | Email | `setEmail()` |
| "Hinzufügen"/"Aktualisieren" | onClick | `handleSave()` → `POST/PATCH /api/ops/staff` |
| "Abbrechen" | onClick | `resetForm()` |
| "Bearbeiten" (pro Row) | onClick | `startEdit(s)` |
| "Entfernen" (pro Row) | onClick | `handleDeactivate(s.id)` → `DELETE /api/ops/staff/{id}` |

---

## 11. Metrics Page

Keine interaktiven Elemente (nur Anzeige).

---

## 12. Settings Page

| Element | Typ | Ziel/Funktion |
|---------|-----|---------------|
| NavCard "Mitarbeiter" | Link | `/ops/staff` |
| NavCard "Kennzahlen" | Link | `/ops/metrics` |
| NavCard "Einsatzplan" | Link | `/ops/schedule` |
| Google Review URL Input | URL | `setGoogleReviewUrl()` |
| Termindauer Select | Select | `setAppointmentDuration()` |
| Kalender-E-Mail Input | Email | `setCalendarEmail()` |
| E-Mail Toggle | Switch | `setNotifyEmail()` |
| SMS Toggle | Switch | `setNotifySms()` |
| "Einstellungen speichern" | onClick | `handleSave()` → `PATCH /api/ops/settings` |

---

## Zusammenfassung: API-Endpunkte

| Methode | Route | Aufrufer |
|---------|-------|----------|
| GET | `/api/ops/appointments?from=&to=` | ScheduleView |
| GET | `/api/ops/staff` | StaffManager, CaseDetailForm |
| POST | `/api/ops/staff` | StaffManager |
| PATCH | `/api/ops/staff/{id}` | StaffManager |
| DELETE | `/api/ops/staff/{id}` | StaffManager |
| GET | `/api/ops/metrics` | MetricsView |
| GET | `/api/ops/settings` | SettingsPage |
| PATCH | `/api/ops/settings` | SettingsPage |
| POST | `/api/cases` | CreateCaseModal |
| PATCH | `/api/ops/cases/{id}` | CaseDetailForm |
| POST | `/api/ops/cases/{id}/send-invite` | CaseDetailForm |
| POST | `/api/ops/cases/{id}/request-review` | CaseDetailForm |
| POST | `/api/ops/cases/{id}/skip-review` | CaseDetailForm |
| GET | `/api/ops/cases/{id}/attachments` | AttachmentsSection |
| POST | `/api/ops/cases/{id}/attachments` | AttachmentsSection (upload) |
| POST | `/api/ops/logout` | OpsShell |
