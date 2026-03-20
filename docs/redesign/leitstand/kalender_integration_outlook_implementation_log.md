# Outlook Kalender-Integration — Implementation Log

> **Verwandte Dokumente:**
> - Technischer Plan: [`plan_kalender_integration.md`](plan_kalender_integration.md)
> - Onboarding-Runbook: [`docs/runbooks/outlook_kalender_onboarding.md`](../../runbooks/outlook_kalender_onboarding.md)
> - Terminführung Produktbild: [`leitstand.md §6`](leitstand.md)

## Ziel
Outlook Business Kalender high-end in FlowSight PWA integrieren.

## Scope heute
- Outlook zuerst
- real-life-fähiges Modell vorbereiten
- Admin + spätere Techniker mitdenken
- Free/Busy sichtbar machen
- Konflikte in Terminvergabe sichtbar machen
- Go-Live-/Onboarding-relevante Erkenntnisse laufend dokumentieren

## Entschiedene Leitfragen (2026-03-20)
- **Wer verbindet?** Admin, einmalig pro Tenant (Admin-Consent)
- **Consent-Modell?** Tenant-weit, `Calendars.Read` Scope
- **Welche Daten?** Nur Free/Busy Status (free/busy/tentative/oof), keine Termindetails
- **Mapping?** `staff.email` = Outlook-Adresse (1:1, kein Extra-Feld)

## Session Log
- Start: 2026-03-20 07:44:24
- Founder-Ziel: Outlook Business testweise als echter Vertical Slice

## Architekturentscheidung — Outlook Integration (Stand heute)

### Zielmodell
FlowSight nutzt für Outlook-Kalender primär ein **tenant-weites Microsoft-Connect-Modell mit Admin-Consent**.

### Begründung
Dieses Modell passt besser zum realen Betriebsablauf als ein reines Per-User-/Self-Connect-Modell:
- Büro / Dispo muss freie/belegte Zeiten von Technikern sehen
- nicht jeder Techniker soll zuerst separat verbinden müssen
- ein Betrieb soll zentral angebunden werden können
- späteres Onboarding für echte Kundenbetriebe wird dadurch einfacher und robuster

### Kalender-Mapping
`staff.email` ist bereits vorhanden und dient als Outlook-Mailadresse.
Kein zusätzliches Mapping-Feld notwendig, solange `staff.email` der echten Microsoft-365-Adresse entspricht.

### Token-Ablage
Tokens werden in `tenants.modules` gespeichert (verschlüsselt).

**Encryption (entschieden 2026-03-20):**
- **Methode:** AES-256-GCM (App-Layer, kein Supabase Vault)
- **Key:** `CALENDAR_ENCRYPTION_KEY` Vercel Env Var (64 hex chars = 32 bytes)
- **Utility:** `src/web/src/lib/crypto/tokenEncryption.ts` — `encryptToken()` / `decryptToken()`
- **Format:** `iv:authTag:ciphertext` (hex), zufälliger IV pro Aufruf
- **Kein** Plaintext-Token in Supabase

### Technische Einstiegspunkte
1. `src/web/app/api/ops/appointments/check-collision/route.ts`
   - bestehender interner Collision-Check bleibt
   - Outlook Free/Busy wird zusätzlich geprüft
   - Ergebnis wird zusammengeführt

2. `src/web/app/api/ops/calendar/connect/route.ts` ✅ implementiert
   - GET → Admin-Auth-Check → Redirect zu Microsoft Consent Screen
   - State-Parameter: `tenantId:nonce:hmacSignature` (CSRF-Schutz)
   - Scopes: `offline_access Calendars.Read`
   - Callback: `/api/ops/calendar/callback` (noch nicht implementiert)

3. Neue Route `src/web/app/api/ops/calendar/freebusy/route.ts`
   - UI-Abruf von Free/Busy-Daten

### Produktlogik
Eine Kollision liegt vor, wenn
- entweder interne appointments kollidieren
- oder Outlook Free/Busy im gleichen Zeitfenster belegt meldet

### Fallback
Wenn kein Outlook verbunden ist:
- Verhalten wie bisher
- nur interne appointments-Tabelle

## Produktprinzip — Kein Zwei-Tool-Gefühl

### Grundsatz
Der tägliche Betrieb darf niemals das Gefühl haben, zwischen FlowSight und Outlook parallel arbeiten zu müssen.

### Bedeutet konkret
- Termine werden in FlowSight im Fall angelegt
- Termine werden von dort an Kunden verschickt
- Outlook muss automatisch mitsynchronisiert werden
- keine manuelle Doppelpflege in zwei Tools

### Produktlogik
FlowSight ist das führende Arbeitswerkzeug.
Outlook ist angebundene Kalender-Infrastruktur im Hintergrund.

### Konsequenz für die Umsetzung
Phase 1:
- Outlook Free/Busy lesen
- Verfügbarkeit im Leitstand sichtbar machen
- Kollisionen vermeiden

Phase 2:
- Write-back nach Outlook
- Wenn in FlowSight ein Termin erstellt / geändert / gelöscht wird, muss Outlook entsprechend mitziehen

### Warum das kritisch ist
Jede manuelle Nachpflege in Outlook erzeugt Reibung.
Für Handwerksbetriebe ist Doppelpflege im Alltag nicht akzeptabel.
Die Integration ist nur dann produktionsreif, wenn FlowSight operativ als zentrale Oberfläche genügt.

