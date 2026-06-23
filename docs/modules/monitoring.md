# Modul: Monitoring (der Puls)

> Teil der [FlowSight Bible](../flowsight_bible.md). Wie ich sehe, dass alles läuft —
> Geschäft **und** Technik. **Nicht** das Bauen (das ist [Infrastruktur](infrastruktur.md)).

## Zweck
Beobachtbarkeit: läuft das Geschäft (Fälle, Mails, Konversion) und die Technik (Fehler, Uptime)? Ein Blick, der Vertrauen gibt — kein Bauchweh pro Ticket.

## Status heute (geerntet — was wir HABEN)
- **Health-Endpoint:** `GET /api/health` (kein Auth, kein DB) — für externes Uptime-Monitoring.
- **Sentry-Tag-Schema** sauber definiert (`_tag`, `stage`, `decision`, `error_code`, `tenant_id`, `case_id` …); **P0-Coverage** dokumentiert (Voice-Intake, Mail, Wizard).
- **WhatsApp Founder-Incident-Alerts** (Code-seitig gebaut): `CASE_CREATE_FAILED`, `EMAIL_DISPATCH_FAILED`, Throttle 1×/15 min. Schalter `FOUNDER_WHATSAPP_ENABLED`.
- **morning-report** (Telegram) = täglicher Geschäfts-Puls.
- **CEO-App Pulse + Monitoring** (Phase 1+5 live): Ampel, KPI-Cards, Alert-Feed, Live-Activity, HealthPanel, Sentry-Digest, Tick-History, Audit-Log, Integration-Hub.

## Kanonische Quelle (SSOT)
- [`runbooks/monitoring.md`](../runbooks/monitoring.md) — Health, Tag-Schema, Sentry-Alerts A/B/C, P0-Coverage, WhatsApp-Incident.
- Sentry-Setup: [`runbooks/sentry_token_setup`](../runbooks/sentry_token_setup.md) · Incident: [`90-incident-triage`](../runbooks/90-incident-triage.md).
- Live-Puls: System (`morning-report`, CEO-App `/ceo`, `retell-inspect`) — **nie in Docs duplizieren**.

## Dateibereich (Parallel-Konflikt-Regel)
- **Besitzt:** `docs/runbooks/monitoring.md`, Report-/Monitoring-Workflows.
- **Kollidiert mit:** Infrastruktur (Sentry-Plumbing/Health = Infra, Alarm-Bedeutung = Monitoring), Betrieb (CEO-App-Code).

## Lücke zum Nordstern (was FEHLT für „100 % verlässlich")
1. **Stille P0? Sentry-Alerts A/B/C verifizieren** — `monitoring.md` beschreibt sie als **Founder-Handarbeit (je ~5 min im Sentry-Dashboard)**. Wenn nie erstellt, werden P0-Fehler zwar *geloggt*, aber **nicht alarmiert** → ein verlorener Fall fällt nicht auf. **Höchste Priorität: prüfen, ob Alert A/B/C existieren.**
2. **WhatsApp-Incident scharf?** — `FOUNDER_WHATSAPP_ENABLED` auf `"true"` verifizieren, sonst sind die gebauten Incident-Alerts stumm.
3. **Externes Uptime-Monitoring** — Health-Endpoint existiert, aber kein Dienst (z. B. UptimeRobot) pingt ihn → Totalausfall würde nicht gemeldet.
4. **CEO-App ist der Founder-Cockpit, wird aber nicht genutzt** — siehe **Strategischer Thread** unten. Das ist der eigentliche „läuft alles"-Blick.

## Strategischer Thread: CEO-App ↔ Bible-Struktur
Der Founder hat eine **vollständig gebaute CEO-App** (`/ceo/*`, alle 10 Phasen live), deren Sektionen die Module schon ~spiegeln (Pulse · Betriebe · Finanzen · Monitoring · Journey · Notifications · Knowledge · Admin) — sie wird aber **kaum genutzt / wirkt unbrauchbar**.

**Hypothese, warum unbrauchbar:** (a) Daten-Schicht leer/ungepflegt (z. B. `ceo_costs` ohne F6-Daten → Finanzen tot), (b) Sektions-Taxonomie ist *vor* der sauberen Bible-Struktur entstanden, (c) Live-Verifikation 06-21 fand Drift (Journey-Sektion fehlt im Plan, Trial-Framing überholt).

**Vision (Founder):** CEO-App-Navigation = **FlowSight-Bible-Modulstruktur** → der Founder steuert sein Business in Docs *und* App nach derselben Karte. Das ist die **tägliche-Flow-Oberfläche** des Nordsterns.

**Einordnung:** Das ist **Ausrichten + brauchbar-machen**, kein Neubau (Skelett existiert) — aber Code = **Brocken** für eine eigene, fokussierte Session (Modul Betrieb/CEO-App). Erst diagnostizieren (warum ungenutzt), dann Sektionen an die 8 Module angleichen + Datenschicht füllen.
