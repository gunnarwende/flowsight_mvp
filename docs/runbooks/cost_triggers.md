# Cost Thresholds + Upgrade Triggers — FlowSight MVP

**Owner:** Founder
**Last updated:** 2026-03-24
**Rule:** No screenshots in repo. Evidence captured by Founder (PII-free).

## Vendor Trigger Table

### Infrastructure & Product

| Vendor | Trigger | Action |
|--------|---------|--------|
| **Vercel** | ≥80% Used/Limit on any Pro usage metric (bandwidth, function invocations, build minutes) | Review usage, optimize/throttle, or upgrade to Team ($20/user/mo) |
| **Supabase** | ≥80% Pro quota (storage, API requests) OR PITR needed | Add PITR add-on ($100/mo) or upgrade to Team ($599/mo) |
| **Resend** | ≥80% monthly/daily send quota OR domains limit hit (1/1) OR rate-limit impact | Upgrade plan or revise domain strategy |
| **Twilio** | Usage trigger fires ($10 early / $25 critical) | Check billing/payment. Adjust trigger thresholds if volume grows. |
| **Retell** | Monthly spend ≥ $50 OR payment/invoice issue | Review budget/plan/payment method |
| **Peoplefone** | Balance < CHF 20 | Auto top-up +CHF 50 (already configured in F10). If frequent top-ups, increase threshold/amount. |
| **eCall SMS** | Punktestand < 500 | Punkte nachkaufen. Business Account Typ A (CHF 40/Mo Grundgebühr). |

### Produktion & Tools (privat bezahlt, projektgebunden)

| Vendor | Trigger | Action |
|--------|---------|--------|
| **Adobe Premiere Pro** | Projekt abgeschlossen, kein weiteres Video geplant | Monats-Abo kündigen (monatlich kündbar) |
| **Runway** | Credits aufgebraucht oder Projekt abgeschlossen | Plan kündigen oder Credits nachkaufen |
| **ElevenLabs** | Character-Limit erreicht oder Projekt abgeschlossen | Plan prüfen (ggf. downgraden) |

## Current Plan Summary

### Infrastructure & Product

| Vendor | Plan | Monthly Cost | Key Limits |
|--------|------|-------------|------------|
| Vercel | Pro | $20/mo | 1 TB bandwidth, 1M function invocations, 100h build minutes, 30s function timeout |
| Supabase | Pro | $25/mo | 8 GB storage, 250 GB transfer, unlimited API requests, daily backups |
| Resend | Free | $0 | 100 emails/day, 3k/month, 1 domain |
| Twilio | Pay-as-you-go | ~$2-5/mo | Per-minute voice, per-SMS. Usage triggers at $10/$25. |
| Retell | Pay-as-you-go | ~$5-15/mo | Per-minute voice AI. No hard cap. |
| Peoplefone | Prepaid | ~CHF 5-10/mo | Balance-based. Auto top-up configured. |
| eCall SMS | Business Typ A | CHF 40/mo + Punkte | CHF ~0.12/SMS. Alphanumerischer Sender. |
| Sentry | Free | $0 | Error tracking + alerts. |
| GitHub | Free | $0 | Actions: 2k min/month. |

### Produktion & Tools (privat bezahlt, projektgebunden)

| Vendor | Plan | Monthly Cost | Zweck | Zahlung | Status |
|--------|------|-------------|-------|---------|--------|
| Adobe Premiere Pro | Monats-Abo | CHF 38.90/mo | **NUR FALLBACK-Finishing** (nicht Kern) | Privat | AKTIV — kündigen wenn FFmpeg reicht |
| Runway | Pro monthly | $35/mo | AI-generierte Betriebsszenen (CC steuert via API) | Privat | AKTIV (ab 03/2026) |
| ElevenLabs | Pro | ~$22/mo | Voice / TTS (CC steuert via API) | Privat | AKTIV |
| FFmpeg | Open Source | $0 | **KERN** — Video-Assembly, Schnitt, Overlays, Export | — | Zu installieren |
| Playwright | Open Source | $0 | **KERN** — Automatisierte UI-Screenshots | — | CC installiert |
| ~~Artlist / Epidemic Sound~~ | — | — | ~~Lizenzfreie Hintergrundmusik~~ | — | NICHT ABSCHLIESSEN — freie Tracks reichen |

**Hinweis:** Produktions-Tools sind projektgebunden (Website-Videos). Nach Projektabschluss prüfen, ob Abos weiterlaufen sollen oder gekündigt werden. Adobe Stock ist **nicht aktiviert** (nicht nötig).

## Review Cadence

- Founder checks dashboards monthly (or when trigger alert fires).
- CC not blocked — no env vars or code changes needed for plan upgrades.
- **Produktion-Tools:** Nach Video-Projekt (10 Tage) Abo-Status prüfen.

## Cross-References

- Billing guards: ticketlist F10 (DONE)
- Backup awareness: [backup_awareness.md](backup_awareness.md)
- Video-Projekt: `docs/redesign/redesign_website/Website_Video.md` (§8 Tool-Stack, §17 Voraussetzungen)
