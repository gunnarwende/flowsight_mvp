# 10 — Lücken & Kompromisse

> Offene Lücken, bewusste Kompromisse, was fehlt, was vertagt, was gebrochen.

---

## 1. Bewusste Kompromisse (deliberate, dokumentiert)

### K1: Überfällig-Schwelle 48h statt 24h

| Aspekt | Detail |
|--------|--------|
| **Zielbild** | leitstand.md §5.1: "Überfällige > 24h ohne Statuswechsel" |
| **Code** | `isStuck48h()`: `Date.now() - new Date(iso).getTime() > 48 * 60 * 60 * 1000` |
| **Begründung** | 24h ist zu aggressiv für Trial-Phase. Neue Betriebe haben noch keine etablierten Reaktionszeiten. 48h verhindert "Achtung-Inflation". |
| **Lösungspfad** | Konfigurierbar machen: `tenant.modules.stuck_threshold_hours` (Default 48, konfigurierbar) |

### K2: Termin auf `cases.scheduled_at` statt `appointments`-Tabelle

| Aspekt | Detail |
|--------|--------|
| **Zielbild** | leitstand.md §6: Termine als eigene Objekte mit eigenem Statusmodell |
| **Code** | Scan-Kopf liest `caseData.scheduled_at`, Quick-Time-Buttons setzen `scheduled_at` direkt |
| **Begründung** | Appointments-Tabelle existiert (Phase 0), aber CaseDetailForm nutzt noch das alte `scheduled_at` Feld. Dual-Write: CaseDetailForm → cases.scheduled_at, ScheduleView liest aus appointments. |
| **Lösungspfad** | CaseDetailForm umbauen: Termin-Abschnitt liest/schreibt direkt an `appointments` API |

### K3: Einsatzplan in Primary Nav auch ohne Staff

| Aspekt | Detail |
|--------|--------|
| **Zielbild** | leitstand.md §5.3: "Ohne Staff: Bereich leer/unsichtbar" |
| **Code** | Einsatzplan ist immer in Primary Nav. Nur Mitarbeiter wird per `staffCount > 0` gesteuert. |
| **Begründung** | Einsatzplan hat einen freundlichen Empty State. Komplett verstecken könnte verwirren wenn jemand gezielt danach sucht. |
| **Lösungspfad** | Optional: Einsatzplan in Primary Nav nur wenn `staffCount > 0`, sonst in Secondary Nav |

### K4: Kennzahlen ohne Trends

| Aspekt | Detail |
|--------|--------|
| **Zielbild** | leitstand.md §7: "Fälle pro Woche (Balken, 8 Wochen)", Trendpfeile, Median-Zeiten |
| **Code** | 8 MetricCards mit Snapshot-Zahlen, keine Charts, keine Pfeile |
| **Begründung** | Richtige Trends brauchen eine Zeitreihen-Query und Chart-Library. Bei frischen Trials mit 3-5 Fällen wären Trends meaningless. |
| **Lösungspfad** | Phase 2: Einfache Sparklines oder Trendpfeile (↑↓→) basierend auf 7d-Vergleich |

### K5: Timeline "Nächster Schritt" in Amber

| Aspekt | Detail |
|--------|--------|
| **Original** | Amber-Bereinigung hat alle amber-500 Buttons/Inputs entfernt |
| **Code** | CaseTimeline.tsx: `border-amber-400` (dashed circle) + `text-amber-600` ("Kunden kontaktieren") |
| **Begründung** | Semantisch korrekt: amber = "Achtung, Handlung nötig". Ist kein Button/Input, sondern Hinweis. Absichtlich beibehalten. |

### K6: Brand Color Fallback = amber-600

| Aspekt | Detail |
|--------|--------|
| **Code** | `const color = brandColor ?? "#d97706"` (OpsShell) |
| **Begründung** | Fallback für Admin-Ansicht oder Tenants ohne konfigurierte Farbe. Amber als "FlowSight Default" ist akzeptabel, da der Fallback nur in Edge Cases greift. |

---

## 2. Offene Lücken (nicht implementiert)

### L1: Prospect-Sichtbarkeit in Navigation

| Aspekt | Detail |
|--------|--------|
| **Zielbild** | leitstand.md §4: Prospect sieht nur Puls (read-only), Fall (nur Status). Kein Einsatzplan, keine Zahlen, keine Einstellungen. |
| **Code** | Nav zeigt alle Items für alle Rollen. Prospect kann zu Einsatzplan, Kennzahlen, Einstellungen navigieren. |
| **Impact** | Mittel. API-Endpoints könnten scoped sein (nicht geprüft), aber UI zeigt die Nav-Items. |
| **Fix** | `isProspect` Prop an OpsShell → Nav-Items filtern |

### L2: Tenant-spezifische Kategorien in CreateCaseModal

| Aspekt | Detail |
|--------|--------|
| **Zielbild** | identity_contract.md R2: Kategorien identisch über alle Intake-Oberflächen |
| **Code** | Hardcoded: `["Sanitär", "Heizung", "Lüftung", "Klima", "Allgemein"]` |
| **Impact** | Low-Medium. Betrieb mit Spenglerei/Solar kann diese Kategorie nicht im Modal wählen. CaseDetailForm hat Freitext-Kategorie (workaround). |
| **Fix** | Kategorien aus Tenant-Config laden (`services[]` oder `voice_config.categories[]`) |

### L3: Mitarbeiter-Filter im Puls (für 20-30-Mann)

| Aspekt | Detail |
|--------|--------|
| **Zielbild** | leitstand.md §2: "15-30 Personen: + Filterlogik nach Mitarbeiter" |
| **Code** | Filter-Bar hat Status, Dringlichkeit, Quelle — kein Mitarbeiter-Filter |
| **Impact** | Low für MVP (keine 20-30-Mann-Betriebe als Kunden). High für Skalierung. |
| **Fix** | Mitarbeiter-Filter in Filter-Bar hinzufügen, im Puls nach Assignee filtern |

### L4: Micro-Surfaces (Techniker + Melder)

| Aspekt | Detail |
|--------|--------|
| **Zielbild** | leitstand.md §5.6: `/einsatz/[token]` + `/meldung/[token]` |
| **Code** | Nicht implementiert |
| **Impact** | High für Betriebsgrössen 5+. Techniker muss aktuell per SMS/Anruf informiert werden. |
| **Fix** | Eigene Route, HMAC-Auth, Minimal-UI |

### L5: ICS v2 (UID/SEQUENCE/CANCEL)

| Aspekt | Detail |
|--------|--------|
| **Zielbild** | leitstand.md §6: Stabile UID, SEQUENCE-Counter, METHOD:CANCEL |
| **Code** | ICS wird versendet, aber Qualität des ICS-Builders nicht im Frontend prüfbar |
| **Impact** | Medium. Kalender-Updates könnten als Duplikate erscheinen statt als Updates. |

### L6: 24h Reminder an Melder

| Aspekt | Detail |
|--------|--------|
| **Zielbild** | leitstand.md §6: "24h vor Termin: SMS/E-Mail an den Melder" |
| **Code** | Kein Reminder-System sichtbar |
| **Impact** | Medium. Leitstand.md: "Reduziert Leerfahrten" |
| **Fix** | Lifecycle-Tick oder dedizierter Cron |

### L7: Case-Status-Kopplung mit Appointments

| Aspekt | Detail |
|--------|--------|
| **Zielbild** | leitstand.md §6: "Appointment bestätigt → case.status = scheduled (automatisch)" |
| **Code** | Status-Wechsel ist manuell (User setzt Status in CaseDetailForm) |
| **Impact** | Low. Disponentin setzt Status ohnehin manuell. Automatik wäre nice-to-have. |

### L8: Review-basierte Abschluss-Gruppe im Puls

| Aspekt | Detail |
|--------|--------|
| **Zielbild** | leitstand.md §5.1: "Abschluss: Erledigte Fälle ohne Review-Anfrage" |
| **Code** | Abschluss-Gruppe filtert nach `done && < 7 Tage alt`, nicht nach Review-Status |
| **Impact** | Low. Review "R" Badge ist in der Karte sichtbar, aber die Gruppierung ist zeitbasiert statt review-basiert. |

---

## 3. Inkonsistenzen (minor)

### I1: SOURCE_LABELS "Voice Agent" in Detail-Page

| Aspekt | Detail |
|--------|--------|
| **cases/[id]/page.tsx** | `voice: "Voice Agent"` |
| **CaseListClient.tsx** | `voice: "Anruf"` |
| **Fix** | `"Voice Agent"` → `"Anruf"` oder `"Telefonisch"` |

### I2: Focus-Ring Varianten (3 Stile)

| Datei | Stil |
|-------|------|
| CaseDetailForm, CreateCaseModal | `slate-500 ring-1` |
| CaseListClient Search | `slate-400/30 ring-2` |
| Settings | `gray-400 ring-1` |
| **Fix** | Standardisieren auf `slate-500 ring-1` |

### I3: Input Border Varianten

| Datei | Border |
|-------|--------|
| CreateCaseModal | `border-gray-300` |
| Alle anderen | `border-gray-200` |
| **Fix** | CreateCaseModal → `border-gray-200` |

### I4: "Laden..." vs "Laden…"

| Datei | Text |
|-------|------|
| AttachmentsSection | `"Laden..."` (ASCII) |
| Alle anderen | `"Laden…"` (Ellipsis) |
| **Fix** | `"Laden..."` → `"Laden…"` |

---

## 4. Priorisierung

### Sofort beheben (Quick Wins, <30min)
1. **I1:** SOURCE_LABELS "Voice Agent" → "Anruf"
2. **I4:** "Laden..." → "Laden…"

### Nächste Iteration (1-2h)
3. **I2 + I3:** Focus/Input Konsistenz
4. **L1:** Prospect Nav-Filterung
5. **L2:** Tenant-spezifische Kategorien

### Phase 2 (bewusst vertagt)
6. **K1:** Überfällig-Schwelle konfigurierbar
7. **K2:** CaseDetailForm → Appointments API
8. **K4:** Kennzahlen Trends
9. **L3:** Mitarbeiter-Filter
10. **L5:** ICS v2
11. **L6:** Melder-Reminder
12. **L4:** Micro-Surfaces

---

## 5. Architektur-Schulden

| Schuld | Beschreibung | Risiko |
|--------|-------------|--------|
| **Dual-Write Termin** | `cases.scheduled_at` + `appointments` Tabelle koexistieren. CaseDetailForm schreibt nur scheduled_at, ScheduleView liest nur appointments. | Medium — kann zu Inkonsistenz führen |
| **Staff-Fetch ungecacht** | Jedes CaseDetailForm-Mount fetcht `/api/ops/staff`. Kein SWR/React-Query. | Low — <10 Mitarbeiter, schnell |
| **Puls 200er Limit** | Puls-Query limitiert auf 200 Cases. Bei grossen Betrieben könnten ältere aktive Fälle fehlen. | Low — aktuell kein Betrieb mit >200 aktiven Fällen |
| **Hardcoded Kategorien** | CreateCaseModal hat eigene Kategorie-Liste statt Tenant-Config. | Medium — wird bei jedem neuen Tenant sichtbar |
| **Filter Dropdowns CSS-only** | Hover/focus-within Dropdowns sind nicht optimal für Touch-Geräte. | Low — funktioniert, aber nicht ideal auf Tablets |
