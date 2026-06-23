# Modul: Finanzen

> Teil der [FlowSight Bible](../flowsight_bible.md). Einnahmen · Ausgaben · Pricing ·
> Marge · Runway.

## Zweck
Den finanziellen Puls führen: was kostet der Betrieb, was bringt ein Kunde, wo liegt die Marge, wie lange reicht der Runway.

## Status heute (geerntet — was wir HABEN)
- **Pricing (kanonisch SALES_BIBLE §5):** Solo 1–3 MA ≈ **CHF 950/Mt** · Premium 4–12 MA ≈ **CHF 2'000/Mt** · Aktivierung einmalig ≈ **CHF 2'500**. Monatlich kündbar, kein Trial, zahlend am Go-live, nie rabattieren.
- **Kosten-SSOT = [`runbooks/cost_triggers.md`](../runbooks/cost_triggers.md):** vollständige Plan-/Kosten-Tabelle + Upgrade-Trigger je Vendor. Infra-Fixkosten heute ~**$45/Mt** (Vercel $20 · Supabase $25 · Resend/Sentry/GitHub $0) + nutzungsbasiert (Twilio ~$2–5 · Retell ~$5–15 · Peoplefone ~CHF 5–10 · eCall CHF 40 + Punkte). Produktions-Tools (privat, projektgebunden): Adobe CHF 38.90 · Runway $35 · ElevenLabs ~$22.
- **CEO-App Finanzen-Seite ist GEBAUT** (Phase 4 live): MRR-Chart, CostBreakdown + Eingabeformular, Upgrade-Trigger-Ampel, **Unit Economics** (CAC/LTV/Payback/Churn/NRR), Forecast. Tabelle `ceo_costs`.
- **Einnahmen heute:** 0 zahlende SaaS-Kunden; BigBen (Gastro) zahlend, separat.

## Kanonische Quelle (SSOT)
- Preis/Marge: [SALES_BIBLE](../gtm/sales/SALES_BIBLE.md) §5 (Anker auch Customer Journey Bible §4).
- Kosten/Trigger: [`runbooks/cost_triggers.md`](../runbooks/cost_triggers.md) + [`backup_awareness`](../runbooks/backup_awareness.md).
- Live-Zahlen: CEO-App `/ceo/finanzen` (`ceo_costs`, MRR aus System) — **nicht in Docs duplizieren**.
- Marge-Herleitung (Roh, archiviert): `docs/_archive/redesign/leitstand/pricing_und_marge.md`.

## Dateibereich (Parallel-Konflikt-Regel)
- **Besitzt:** diese Karte. Preis bleibt **eine** SSOT (SALES_BIBLE) — hier nur Anker.
- **Kollidiert mit:** Stern 7 (Go-live/Vertrag), Monitoring (Kosten-Trigger = Alert), Betrieb (CEO-App-Code).

## Lücke zum Nordstern (was FEHLT für „100 % verlässlich")
1. **CEO-App Finanzen-Seite ist gebaut, aber unbenutzt** — Hypothese: Founder-Task **F6 (initiale Vendor-Kostendaten der letzten 3 Mt) nie erledigt** → `ceo_costs` leer → Seite zeigt nichts → wirkt „unbrauchbar". **Höchste Priorität: echte Kosten eintragen**, dann lebt MRR/P&L/Unit-Economics.
2. **Keine laufende Runway-Sicht** — bei 0 MRR + privat getragenen Kosten: wie lange trägt der Founder? Einfache Monats-Burn-Zahl definieren.
3. **Marge je Kunde modellieren** — CHF 950 − variable Kosten (SMS Hauptkostentreiber, Voice-Minuten, Infra-Anteil) pro Tenant. Unit-Economics-Kacheln mit **echten** Zahlen statt Platzhaltern füllen.
4. **Produktions-Tool-Abos prüfen** (Adobe/Runway/ElevenLabs ~$95/Mt privat) — laufen weiter, obwohl Voice geparkt + Video-Projekt pausiert? → kündigen/pausieren-Entscheid.
