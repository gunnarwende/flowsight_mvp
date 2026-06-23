# Stern 6 — Cockpit

> Arbeitsraum. Stabile Fakten sind SSOT in der
> [Customer Journey Bible §3](../../gtm/CUSTOMER_JOURNEY_BIBLE.md). **Abschnitt: Onboarding.**
> *(Bible-Heading bisher „Aufbau (Cockpit)" — Modulname jetzt „Cockpit".)*

- **Zweck (Orientierung):** Der Kunde baut sein Leitsystem geführt selbst im Cockpit (Self-Service, confirm-not-create, ~70 % aus `tenant_config` vorbefüllt). Inkl. Rückmelde-Versprechen + Wunschtermin.
- **Konversions-Ereignis:** Cockpit durchlaufen → Founder-Review-bereit.

## Kanonische Quelle (SSOT)
- [ONBOARDING_BIBLE](../../gtm/onboarding/ONBOARDING_BIBLE.md) — Cockpit-Aufbau.
- Cockpit-Code: `src/web/app/aufbau/[token]` (Konstellation + progressives Lisa-Gesicht).
- [phase2_rueckmelde_termin_logik](../../gtm/onboarding/phase2_rueckmelde_termin_logik.md) + `cockpit_*`.

## Dateibereich (Parallel-Konflikt-Regel)
- **Besitzt:** diese Karte + `src/web/app/aufbau/` + die `cockpit_*`-Docs in `gtm/onboarding/`.
- **Kollidiert mit:** Stern 7 + 8 (teilen sich `ONBOARDING_BIBLE.md`).

## Offen / nächster Schritt
- Cockpit-Build entlang OC-Backlog (Design steht, Build offen).
