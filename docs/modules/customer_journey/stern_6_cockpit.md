# Stern 6 — Cockpit

> Arbeitsraum. Stabile Fakten sind SSOT in der
> [Customer Journey Bible §3](../../gtm/CUSTOMER_JOURNEY_BIBLE.md). **Abschnitt: Onboarding.**
> *(Bible-Heading bisher „Aufbau (Cockpit)" — Modulname jetzt „Cockpit".)*

- **Zweck (Orientierung):** Der Inhaber baut geführt seine **Lisa + sein Leitsystem** — *„seine neue Mitarbeiterin anlernen"*, default-first, in unter einer Stunde, mit minimalem Aufwand → **Live-Test, der WOWt**.
- **Konversions-Ereignis (neu):** Cockpit durchlaufen → Founder-Review → **gemeinsam live** (Gratis-Test, nicht Post-Kauf).

## Kanonische Quelle (SSOT)
- **[stern6_cockpit_neubau_spec.md](../../gtm/onboarding/stern6_cockpit_neubau_spec.md) — NEUBAU (Design KOMPLETT 2026-06-29).** Übergabe-Zustand · Design-Prinzipien (Default-first · ein Bauplan/Strang · Hilfe-die-sitzt) · 2-Strang-Kanal-Modell (Telefon/Lisa · Online-Anfragen → Leitsystem) · alle Karten · Freigabe. Ist-Cockpit = Ersatzteillager.
- [ONBOARDING_BIBLE](../../gtm/onboarding/ONBOARDING_BIBLE.md) — Cockpit-Aufbau.
- Cockpit-Code: `src/web/app/aufbau/[token]` („Redesign v2" = Altlast, wird nach Neubau-Spec umgebaut).
- [phase2_rueckmelde_termin_logik](../../gtm/onboarding/phase2_rueckmelde_termin_logik.md) + `cockpit_*`.

## Dateibereich (Parallel-Konflikt-Regel)
- **Besitzt:** diese Karte + `src/web/app/aufbau/` + die `cockpit_*`-Docs in `gtm/onboarding/`.
- **Kollidiert mit:** Stern 7 + 8 (teilen sich `ONBOARDING_BIBLE.md`).

## Stand (2026-06-29) — ✅ Design-Teil KOMPLETT
- Kompletter Neubau durchdacht (s. Neubau-Spec): 2-Strang-Kanal-Modell · Default-first · Audio-Lisa + Foto-Hilfe · Gratis-Test-Reframe · inhaltlich vollständig (pingpong-fest).
- Inhalts-Audit gegen die neue Welt: E-Mail = kein eigener Strang (Offerte-Thread, nicht Intake; Formular ist die Antwort) · „Vor Ort" raus · Hero-E-Mail-Versprechen reframen.

## Stand (2026-06-30) — ✅ Code-Redesign KOMPLETT + live
- Alle Bereiche auf Schablone (vertikale Karten, default-first): **Lisa** (`#748`/`#750`) · **Online-Anfragen** (`#754`) · **Leitsystem-Hub** 6 Karten (`#757`) · **Freigabe** = Gratis-Test (`#758`). Go-live-Prüfung entschärft + „Vor Ort"-Strang raus (`#757`); Journey-Stern-6-Sessions klickbar → live Cockpit (`#755`).

## Offen / nächster Schritt
- **Founder-Verifikation** (Cockpit-Durchklick, Desktop+Handy) · **Audio-Lisa-Clips + Foto-Guides** produzieren (ersetzen Platzhalter) · **Hero-Konsistenz** (E-Mail-Reframe).
