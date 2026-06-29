# Stern 5 — Verkaufsgespräch

> Arbeitsraum. Stabile Fakten sind SSOT in der
> [Customer Journey Bible §3](../../gtm/CUSTOMER_JOURNEY_BIBLE.md). **Abschnitt: Sales.**

- **Zweck (Orientierung):** Das warme Gespräch nach dem Klick: Verortung, profilierter Zweifel, Konsequenz/Wert, Bewertungs-Trumpf, Preis + Gratis-Test, Abschluss.
- **Konversions-Ereignis (neu):** **Zusage zum Gratis-Live-Test** (Preis im Call genannt, Zahlung erst nach Test).
- **Discovery-Anker:** R1 „Wenn um 14 Uhr niemand rangeht — was passiert dann?" · R2 „Woher wissen Sie, dass keine Anfragen verloren gehen?" (Bible §1.1).

## Kanonische Quelle (SSOT)
- **[stern5_warmes_gespraech_neubau_spec.md](../../gtm/sales/stern5_warmes_gespraech_neubau_spec.md) — NEUBAU (Skelett v2 gelockt 2026-06-29).** Übergabe-Zustand + Block-Struktur (Rolle/Aufgabe). Wortlaut folgt Block für Block.
- [stern5_warmes_verkaufsgespraech_uebergabe_cc.md](../../gtm/sales/stern5_warmes_verkaufsgespraech_uebergabe_cc.md) — Altbestand V1 (**Ersatzteillager**, nicht Bauplan).
- [phase1_gespraech_playbook](../../gtm/sales/phase1_gespraech_playbook.md).
- [SALES_BIBLE](../../gtm/sales/SALES_BIBLE.md) — ICP/Preis kanonisch (§3/§5).

## Dateibereich (Parallel-Konflikt-Regel)
- **Besitzt:** diese Karte + `docs/gtm/sales/stern5_*.md` + `phase1_gespraech_playbook.md`.
- **Kollidiert mit:** Stern 1 + 2 (teilen sich `SALES_BIBLE.md`).

## Stand (2026-06-29) — ✅ KOMPLETT (Wortlaut + Code), gemerged
- **Wortlaut vollständig gelockt** (s. Neubau-Spec): Übergabe-Zustand A/B/C/D + 7 Blöcke (0–6) + Einwand-Querschnitt Q, **beide Stränge** (warm + cold) wort-genau.
- **Strategie:** Gratis-Live-Test (Risiko-Umkehr, Sicherheitsnetz-Konfig), Preis im Call genannt / Zahlung nach Test, keine Aktivierung, Self-Scheduling-Mail, Mom-Test-Discovery. Baut Stern 6/7/8 um; Stern 1–3 bleiben.
- **Code (live):** Cal.com-Webhook `/api/cal/webhook` (signiert → eCall-Bestätigungs-SMS) · `send_outreach.mjs` Slot-Button · Templates `email_templates/stern5_{cold,warm}.json`. Bewertungs-Button existierte bereits.

## Offen / nächster Schritt
- **Founder-Cal.com-Setup** (Event-Type abends/Sa · Pflichtfeld Telefon · Webhook+`CAL_WEBHOOK_SECRET` · `CAL_BOOKING_URL`) — s. Neubau-Spec „Founder-Setup".
- **⚠️ Abhängigkeit:** neue Mail erst real versenden, wenn **Hero+Knoten-Neubau (Stern 3)** steht (Mail verlinkt `/p/[token]` = noch altes 4-Video-Modell).
- Warmes Gespräch produktiv durchspielen, sobald erste First-Views (Stern 4) zurückkommen.
