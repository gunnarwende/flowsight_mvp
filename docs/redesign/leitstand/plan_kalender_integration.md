# Kalender-Integration — Plan

## Ziel

Terminüberschneidungen sichtbar machen. Outlook/Google-Kalender anbinden.

## Phase 1: Interne Termine (MVP)

**Status:** Appointments-Tabelle existiert (Phase 0 Renovation).

- Termine aus `appointments` Tabelle anzeigen
- MiniCalendar im Leitstand: Tage mit Terminen markiert
- Terminüberschneidungs-Check bei neuer Terminvergabe (CaseDetailForm)
- Techniker-View: Tages-Termine aus eigener DB

**Aufwand:** ~2h
**Abhängigkeiten:** Keine (Tabelle existiert)

## Phase 2: Externe Kalender (Go-Live)

**Ziel:** Outlook/Google FreeBusy → belegte Slots grau im MiniCalendar.

### Google Calendar

- API: `freebusy.query` (Calendar API v3)
- Auth: OAuth 2.0 (Service Account oder User Consent)
- Scope: `https://www.googleapis.com/auth/calendar.freebusy`
- Liefert: busy/free Zeitblöcke pro Kalender
- Rate Limit: 10 requests/sec/user

### Microsoft Outlook (Graph API)

- API: `POST /me/calendar/getSchedule`
- Auth: OAuth 2.0 (Delegated, `Calendars.Read` Scope)
- Liefert: availability (free, busy, tentative, oof)
- Tenant: Multi-Tenant App Registration nötig

### Integration-Ansatz

1. **OAuth Setup:** Admin verbindet Kalender in Einstellungen
2. **Token Storage:** Encrypted refresh tokens in `tenants.modules.calendar_*`
3. **FreeBusy Fetch:** Server-side, cached 15min
4. **UI:** Belegte Slots grau im MiniCalendar + AppointmentPicker

### Offene Fragen

- Welcher Provider zuerst? (Outlook wahrscheinlicher bei CH-KMU)
- Soll der Techniker seinen eigenen Kalender verbinden oder der Admin für alle?
- Datenschutz: Nur Free/Busy, keine Termindetails speichern

**Aufwand:** ~8h (pro Provider)
**Abhängigkeiten:** OAuth App Registration, Datenschutz-Klärung
