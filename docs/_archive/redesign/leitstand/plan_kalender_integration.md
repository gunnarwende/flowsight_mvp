# Kalender-Integration — Plan

## Ziel

Terminüberschneidungen sichtbar machen. Outlook/Google-Kalender anbinden.

## Phase 1: Interne Termine (MVP) ✅ DONE

- Termine aus `appointments` Tabelle anzeigen
- MiniCalendar im Leitstand: Tage mit Terminen markiert
- Terminüberschneidungs-Check bei neuer Terminvergabe (CaseDetailForm)
- Techniker-View: Tages-Termine aus eigener DB

## Phase 2: Outlook Free/Busy ✅ LIVE (2026-03-20)

**Architektur:** Application Permissions (client_credentials), nicht Delegated OAuth.
**API:** `GET /users/{email}/calendarView` (Graph API)
**Permission:** `Calendars.Read` (Application)

### Was funktioniert
- App-Token auto-cached + auto-refreshed (kein User-Login nötig)
- FreeBusy pro Mitarbeiter via `staff.email` → Graph calendarView
- Grün/rote Verfügbarkeitsbalken im Terminpicker
- Kollisionsprüfung kombiniert intern + Outlook
- Animierter Outlook-Status-Indikator

### Entschiedene Fragen

- **Provider:** Outlook zuerst (CH-KMU-Standard)
- **Consent-Modell:** Application Permission + Admin-Consent im Azure Portal (1× pro Betrieb)
- **Datenschutz:** Nur busy/free Status, keine Termindetails im UI. Token verschlüsselt (AES-256-GCM).
- **Onboarding-Runbook:** [`docs/runbooks/outlook_kalender_onboarding.md`](../../runbooks/outlook_kalender_onboarding.md)
- **Implementation Log:** [`kalender_integration_outlook_implementation_log.md`](kalender_integration_outlook_implementation_log.md)

### Learnings aus Founder-Test

1. **Delegated OAuth funktioniert nicht für Multi-Tenant:** Admin-Consent überschreibt User-Token → Application Permissions sind die richtige Architektur
2. **Exchange Online Postfach ist Pflicht:** `MailboxNotEnabledForRESTAPI` wenn Lizenz fehlt/nicht provisioniert
3. **Postfach-Provisionierung dauert:** 15 Min bis 24h nach Lizenz-Aktivierung
4. **Graph gibt Zeiten in Request-Timezone zurück:** Muss serverseitig nach UTC konvertiert werden

## Phase 3: Write-back nach Outlook (offen)

- Scope-Erweiterung: `Calendars.ReadWrite` (Application Permission)
- Graph API: `POST /users/{email}/events`, `PATCH`, `DELETE`
- Mapping: `appointments.ics_uid` ↔ Outlook Event-ID
- Neuer Admin-Consent nötig (für ReadWrite)

## Phase 4: Google Workspace (bei Bedarf)

- Gleiche Architektur (Application Credentials via Service Account)
- `calendar_provider=google`, eigene Credentials
- Erst wenn erster Kunde ohne M365
