# 02 — State Matrix

> Alle Zustände pro Seite/Komponente mit exakten Rendering-Bedingungen.

---

## Legende

| Symbol | Bedeutung |
|--------|-----------|
| ✅ | Zustand implementiert |
| ⚠️ | Teilweise implementiert / Edge Case |
| ❌ | Nicht implementiert |

---

## 1. OpsShell (Layout)

| Zustand | Bedingung | Rendering |
|---------|-----------|-----------|
| Desktop | `md:` breakpoint (768px+) | Sidebar fest links, main rechts |
| Mobile | `< md` | Top-Bar mit Hamburger, Sidebar als Overlay |
| Sidebar offen (Mobile) | `sidebarOpen === true` | Overlay mit Backdrop + Sidebar |
| Sidebar zu (Mobile) | `sidebarOpen === false` | Nur Top-Bar sichtbar |
| Tenant vorhanden | `tenantName !== undefined` | Initialen aus Name, displayName = tenantName |
| Kein Tenant (Admin) | `tenantName === undefined` | initials = "LS", displayName = "Leitstand" |
| Brand Color gesetzt | `brandColor !== undefined` | Header + Active-State in brandColor |
| Brand Color fehlt | `brandColor === undefined` | Fallback: amber-600 (#d97706) |
| Staff vorhanden | `staffCount > 0` | "Mitarbeiter" in Sekundär-Nav sichtbar |
| Kein Staff | `staffCount === 0` | "Mitarbeiter" ausgeblendet |

---

## 2. Cases Page (Puls + Filter + Liste)

| Zustand | Bedingung | Rendering |
|---------|-----------|-----------|
| **Puls aktiv** | `showPuls = !filterStatus && !filterUrgency && !filterSource && !filterQuery && !showAll` | PulsView + Filter Bar + CaseListClient(hiddenByPuls=true) |
| **Gefilterte Liste** | Irgendein Filter aktiv ODER showAll | Filter Bar + CaseListClient(hiddenByPuls=false) mit KPIs + Tabelle |
| **Demo-Tab** | `params.tab === "demo"` | Queries filtern `is_demo = true` |
| **Real-Tab** | `params.tab !== "demo"` | Queries filtern `is_demo = false` |
| **Fehler** | `error !== null` | Rote Fehlermeldung, kein Content |
| **Tenant-gefiltert** | Non-admin user | `tenant_id` Filter automatisch gesetzt |
| **Admin** | `scope.isAdmin` | Optional tenant URL-Filter, sonst alle Tenants |

### 2a. PulsView Zustände

| Zustand | Bedingung | Rendering |
|---------|-----------|-----------|
| **Achtung leer** | `achtung.length === 0` | Grüner Haken + "Alles im Griff" |
| **Achtung gefüllt** | `achtung.length > 0` | Rote Karten (Notfälle + stuck >48h) |
| **Heute leer** | `heute.length === 0` | Gruppe wird NICHT gerendert |
| **Heute gefüllt** | `heute.length > 0` | Amber Karten |
| **In Arbeit leer** | `inArbeit.length === 0` | Gruppe wird NICHT gerendert |
| **In Arbeit gefüllt** | `inArbeit.length > 0` | Blaue Karten |
| **Abschluss leer** | `abschluss.length === 0` | Gruppe wird NICHT gerendert |
| **Abschluss gefüllt** | `abschluss.length > 0` | Grüne Karten |
| **Komplett leer** | Alle 4 Gruppen leer (inkl. Achtung) | Nur "Achtung" mit "Alles im Griff" |
| **Viele Fälle** | `> 200` | Limitiert durch `.limit(200)` im Query |

### Puls Grouping Edge Cases

| Edge Case | Verhalten |
|-----------|-----------|
| Notfall + status "done" | Geht in "Abschluss" (done hat Vorrang) |
| Notfall + stuck >48h | Geht in "Achtung" (Notfall-Check kommt zuerst) |
| Heute erstellt + status "contacted" | Geht in "Heute" (isToday hat Vorrang) |
| Gestern erstellt + status "new" | Geht in "Heute" (status "new" hat Vorrang) |
| Status "archived" | Wird komplett übersprungen |
| Status "done" + älter als 7d | Wird komplett übersprungen |

### 2b. CaseListClient Zustände

| Zustand | Bedingung | Rendering |
|---------|-----------|-----------|
| **Puls aktiv** | `hiddenByPuls === true` | KPIs hidden, Tabelle hidden, nur Action Bar |
| **Keine Fälle** | `rows.length === 0 && !hiddenByPuls` | "Keine Fälle gefunden." |
| **Fälle vorhanden** | `rows.length > 0 && !hiddenByPuls` | Desktop-Tabelle + Mobile-Karten |
| **Suche aktiv** | `searchQuery !== ""` | Such-Input mit "×" Clear-Button |
| **Dirty Search** | `search !== searchQuery` | "Suchen" Button erscheint |
| **Mehrere Seiten** | `totalPages > 1 && !hiddenByPuls` | Pagination-Bar |
| **Modal offen** | `modalOpen === true` | CreateCaseModal overlay |

---

## 3. Case Detail Page

| Zustand | Bedingung | Rendering |
|---------|-----------|-----------|
| **Fall nicht gefunden** | `error || !row` | `notFound()` (Next.js 404) |
| **Tenant-Verletzung** | `!isAdmin && tenantId !== row.tenant_id` | `notFound()` |
| **Prospect** | `scope.isProspect === true` | Reduzierte Form, kein Kontakt-Block, keine Anhänge |
| **Admin/Tenant** | `scope.isProspect === false` | Volle Form + Kontakt + Timeline + Anhänge |
| **Kein Assignee** | `assignee_text === null` | Scan-Kopf: "Nicht zugewiesen" (grau) |
| **Kein Termin** | `scheduled_at === null` | Scan-Kopf: "Kein Termin" (grau) |
| **Kein Reporter** | `reporter_name === null` | Kontakt-Block ohne Name |
| **Kein Telefon** | `contact_phone === null` | Kontakt-Block ohne Telefon-Link |
| **Kein E-Mail** | `contact_email === null` | Kontakt-Block ohne E-Mail-Link |

### 3a. CaseDetailForm Zustände

| Zustand | Bedingung | Rendering |
|---------|-----------|-----------|
| **Clean** | `isDirty === false` | "Speichern" disabled (opacity-40) |
| **Dirty** | `isDirty === true` | "Speichern" aktiv + beforeunload-Guard |
| **Saving** | `saveState === "saving"` | "Speichern…" Text |
| **Saved** | `saveState === "saved"` | Grüner "Gespeichert" Text (2s) |
| **Save Error** | `saveState === "error"` | Rote Fehlermeldung |
| **Status = done** | `status === "done"` | Review Nachlauf sichtbar |
| **Status ≠ done** | `status !== "done"` | "Erledigt" Quick-Button sichtbar |
| **Staff vorhanden** | `staffMembers.length > 0` | Assignee = Dropdown |
| **Kein Staff** | `staffMembers.length === 0` | Assignee = Freitext Input |
| **Termin gesetzt** | `scheduledAt !== ""` | "Termin senden" Button sichtbar |
| **Invite sending** | `inviteState === "sending"` | "Sende…" |
| **Invite sent** | `inviteState === "sent"` | "Einladung gesendet ✓" (3s) |

### Review Nachlauf Zustände (deriveReviewStatus)

| Status | Bedingung | Label | Actions |
|--------|-----------|-------|---------|
| `nicht_bereit` | status ≠ done ODER kein Kontakt | — | Nicht gerendert |
| `bereit` | done + Kontakt + 0 Anfragen | "Review möglich" | "Review anfragen" + "Kein Review" |
| `gesendet` | 1 Anfrage gesendet | "Gesendet" | "Nochmals anfragen" + "Kein Review" |
| `max_erreicht` | 2 Anfragen gesendet | "2/2 gesendet" | nur "Kein Review" |
| `uebersprungen` | review_skipped Event | "Übersprungen" | — |

---

## 4. Schedule Page (Einsatzplan)

| Zustand | Bedingung | Rendering |
|---------|-----------|-----------|
| **Laden** | `loading === true` | "Laden…" |
| **Leer** | `appointments.length === 0` | "Termine erscheinen hier, sobald Sie im Fall einen Termin anlegen." |
| **Heute-Ansicht** | `view === "today"` | Termine nur heute, Toggle "Heute" aktiv |
| **Wochen-Ansicht** | `view === "week"` | Termine heute + 6 Tage, Toggle "Woche" aktiv, Datum in Klammern |
| **Mehrere Mitarbeiter** | `byStaff.size > 1` | Mehrere Sektionen mit Mitarbeiter-Kopf |
| **Ein Mitarbeiter** | `byStaff.size === 1` | Eine Sektion |

### Appointment-Status-Badges

| Status | Farbe | Label |
|--------|-------|-------|
| `scheduled` | bg-blue-100 text-blue-700 | Geplant |
| `confirmed` | bg-violet-100 text-violet-700 | Bestätigt |
| `completed` | bg-emerald-100 text-emerald-700 | Erledigt |
| `cancelled` | bg-gray-100 text-gray-500 | Abgesagt |

---

## 5. Staff Page (Mitarbeiter)

| Zustand | Bedingung | Rendering |
|---------|-----------|-----------|
| **Laden** | `loading === true` | "Laden…" (return early) |
| **Leer** | `staff.length === 0` | "Noch keine Mitarbeiter erfasst." |
| **Staff vorhanden** | `staff.length > 0` | Tabelle mit Rows |
| **Form geschlossen** | `showForm === false` | "+ Mitarbeiter" Button sichtbar |
| **Form offen (neu)** | `showForm === true && editingId === null` | "Neuer Mitarbeiter" Form |
| **Form offen (edit)** | `showForm === true && editingId !== null` | "Mitarbeiter bearbeiten" Form |
| **Saving** | `saving === true` | "Speichern…" |

---

## 6. Metrics Page (Kennzahlen)

| Zustand | Bedingung | Rendering |
|---------|-----------|-----------|
| **Laden** | `loading === true` | "Laden…" |
| **Fehler** | `data === null && !loading` | Rote Fehlermeldung |
| **Daten vorhanden** | `data !== null` | 8 MetricCards im Grid |
| **Keine avg Resolution** | `avgResolutionHours === null` | "—" statt Zahl |

---

## 7. Settings Page

| Zustand | Bedingung | Rendering |
|---------|-----------|-----------|
| **Laden** | `loading === true` | "Laden…" |
| **Fehler laden** | fetch fehlgeschlagen | Fehlermeldung |
| **Normal** | `data !== null` | Alle Sections + Quick Links |
| **Saving** | `saving === true` | "Speichern…" |
| **Saved** | `saved === true` | "Gespeichert" (3s) |
| **Save Error** | `error !== null` | Rote Fehlermeldung |

---

## 8. Attachments

| Zustand | Bedingung | Rendering |
|---------|-----------|-----------|
| **Laden** | `loading === true` | "Laden..." |
| **Leer** | `attachments.length === 0` | "Keine Anhänge." |
| **Vorhanden** | `attachments.length > 0` | Liste mit Download-Links |
| **Uploading** | `uploading === true` | "Hochladen…", Input disabled |
| **Upload-Fehler** | `error !== ""` | Rote Fehlermeldung |
| **Datei zu gross** | `file.size > 10MB` | Fehlermeldung, Upload abgebrochen |
| **Zu viele Dateien** | `files.length > 5` | Fehlermeldung |
