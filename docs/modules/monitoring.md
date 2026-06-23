# Modul: Monitoring (der Puls)

> Teil der [FlowSight Bible](../flowsight_bible.md). Wie ich sehe, dass alles läuft —
> Geschäft **und** Technik. **Nicht** das Bauen (das ist [Infrastruktur](infrastruktur.md)).

## Zweck
Beobachtbarkeit: läuft das Geschäft (Fälle, Mails, Konversion) und läuft die Technik (Fehler, Uptime)? Ein Blick, der Vertrauen gibt — kein Bauchweh pro Ticket.

## Status heute (geerntet)
- **morning-report** als täglicher Geschäfts-Puls (Live-Stand kommt aus dem System, nicht aus Docs).
- **Sentry:** jeder Fehlerpfad emittiert ein Event; Pflicht-Tags `tenant_id`, `source`, `case_id`. **P0** = Fall-Erstellung oder Mail-Versand schlägt fehl.
- Verify-gegen-System-Prinzip (`retell-inspect` vor/nach Änderungen).

## Kanonische Quelle (SSOT)
- [runbooks/monitoring](../runbooks/monitoring.md).
- Sentry-Setup: [runbooks/sentry_token_setup](../runbooks/sentry_token_setup.md).
- Live-Stand: System (`morning-report`, `retell-inspect`) — **nie in Docs duplizieren**.

## Dateibereich (Parallel-Konflikt-Regel)
- **Besitzt:** `docs/runbooks/monitoring.md`, Monitoring-/Report-Workflows.
- **Kollidiert mit:** Infrastruktur (Sentry-Setup ist Infra-Plumbing, die Alarm-Bedeutung ist Monitoring) — Linie sauber halten.

## Offen / nächster Schritt — Phase 2
- Ein knappes Founder-Dashboard „läuft alles" (Geschäfts-KPIs + P0-Sicht) definieren.
