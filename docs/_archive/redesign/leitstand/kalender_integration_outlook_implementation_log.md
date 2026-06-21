# Outlook Kalender-Integration — Implementation Log

> **Status:** Phase 1 LIVE ✅ (2026-03-20)
> **Verwandte Dokumente:**
> - Technischer Plan: [`plan_kalender_integration.md`](plan_kalender_integration.md)
> - Onboarding-Runbook: [`docs/runbooks/outlook_kalender_onboarding.md`](../../runbooks/outlook_kalender_onboarding.md)
> - Terminführung Produktbild: [`leitstand.md §6`](leitstand.md)

## Ziel
Outlook Business Kalender high-end in FlowSight PWA integrieren.

## Entschiedene Leitfragen

| Frage | Entscheidung | Datum |
|-------|-------------|-------|
| Wer verbindet? | Admin, einmalig pro Tenant (Azure Portal) | 2026-03-20 |
| Consent-Modell? | **Application Permissions** (client_credentials) | 2026-03-20 |
| Permission? | `Calendars.Read` (Application, nicht Delegated) | 2026-03-20 |
| Welche Daten? | Events mit showAs ≠ free, keine Termindetails im UI | 2026-03-20 |
| Mapping? | `staff.email` = Outlook-Adresse (1:1) | 2026-03-20 |
| API Endpoint? | `GET /users/{email}/calendarView` (pro Mitarbeiter) | 2026-03-20 |

## Architektur-Evolution (Learnings)

### Versuch 1: Delegated OAuth (prompt=consent) ❌
- Problem: Admin-Consent überschreibt User-Token. Callback speichert immer Admin-Account.
- Symptom: `jwt_claims.upn` zeigt Admin, nicht User.

### Versuch 2: Getrennter Admin-Consent + User-Connect ❌
- Problem: Microsoft erzwingt trotzdem Admin-Redirect bei `Calendars.Read` in Multi-Tenant-Apps.
- Auch mit `prompt=login` und `login_hint` nicht lösbar.

### Versuch 3: Application Permissions (client_credentials) ✅
- Lösung: App authentifiziert sich selbst, kein User-Login nötig.
- Admin erteilt einmalig Consent im Azure Portal.
- App liest Kalender aller Mitarbeiter via `/users/{email}/calendarView`.
- **Das ist die finale Architektur.**

### Weiteres Learning: Exchange Online Pflicht
- `MailboxNotEnabledForRESTAPI` = User hat kein Exchange Online Postfach
- Tritt auch bei M365-Lizenzen auf, wenn Exchange-Komponente deaktiviert
- Test: User muss sich auf outlook.office.com einloggen können
- Provisionierung nach Lizenz-Aktivierung: 15 Min bis 24h

## Technischer Stack (final)

### Token-Ablage
- `tenants.modules.calendar_ms_tenant_id` — Microsoft Tenant ID des Betriebs
- `tenants.modules.calendar_app_token` — AES-256-GCM verschlüsselter App-Token (auto-cached)
- `tenants.modules.calendar_app_token_expires_at` — Ablaufzeitpunkt
- `tenants.modules.calendar_provider` — "microsoft"

### Encryption
- **Methode:** AES-256-GCM (App-Layer, kein Supabase Vault)
- **Key:** `CALENDAR_ENCRYPTION_KEY` Vercel Env Var (64 hex chars = 32 bytes)
- **Utility:** `src/web/src/lib/crypto/tokenEncryption.ts`

### API-Routen (LIVE)

| Route | Status | Zweck |
|-------|--------|-------|
| `src/web/src/lib/calendar/outlookClient.ts` | ✅ | Core: Token-Abruf (client_credentials) + FreeBusy (calendarView) |
| `src/web/app/api/ops/calendar/freebusy/route.ts` | ✅ | UI-Abruf, staff.email Mapping, cached |
| `src/web/app/api/ops/appointments/check-collision/route.ts` | ✅ | Intern + Outlook Kollisionsprüfung |
| `src/web/app/api/ops/calendar/debug/route.ts` | ✅ | Temporäre Diagnose (JWT decode, raw Graph test) |
| `src/web/app/api/ops/calendar/connect/route.ts` | Legacy | Delegated OAuth Start (nicht mehr primär) |
| `src/web/app/api/ops/calendar/callback/route.ts` | Legacy | Delegated OAuth Callback (nicht mehr primär) |
| `src/web/app/api/ops/calendar/admin-consent/route.ts` | Legacy | Admin-Consent Redirect (nicht mehr primär) |

### UI-Komponenten (LIVE)

| Komponente | Was es tut |
|-----------|-----------|
| `AppointmentPicker.tsx` | Fetcht FreeBusy bei Datumsauswahl, zeigt Outlook-Status |
| `TimeSlotSelector.tsx` | Grün/rote Verfügbarkeitsbalken, "belegt" Badge |
| `CaseDetailForm.tsx` | Übergibt assignee an Picker, zeigt Kollisionswarnung (intern vs. Outlook) |

## Produktprinzip — Kein Zwei-Tool-Gefühl

FlowSight ist das führende Arbeitswerkzeug. Outlook ist angebundene Kalender-Infrastruktur im Hintergrund.

- Phase 1 (LIVE): Outlook Free/Busy lesen, Verfügbarkeit im Terminpicker sichtbar, Kollisionen vermeiden
- Phase 2 (offen): Write-back nach Outlook — Termine in FlowSight erstellt → automatisch in Outlook

## Session Log
- Start: 2026-03-20 07:44:24
- Phase 1 LIVE: 2026-03-20 ~21:00 (nach Architektur-Pivot auf Application Permissions)
- PRs: #317 (Crypto + Connect), #319 (Callback), #321 (FreeBusy UI), #324 (TZ Fix), #326 (calendarView statt getSchedule), #328 (Application Permissions), #330 (Modern UI)
