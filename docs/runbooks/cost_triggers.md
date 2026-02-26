# Cost Thresholds + Upgrade Triggers — FlowSight MVP

**Owner:** Founder
**Last updated:** 2026-02-25
**Rule:** No screenshots in repo. Evidence captured by Founder (PII-free).

## Vendor Trigger Table

| Vendor | Trigger | Action |
|--------|---------|--------|
| **Vercel** | ≥80% Used/Limit on any usage metric (bandwidth, function invocations, build minutes) | Upgrade to Pro ($20/mo) or optimize/throttle |
| **Supabase** | ≥80% quota (storage, API requests, edge functions) OR backups/PITR needed | Upgrade to Pro ($25/mo). PITR add-on if needed ($100/mo). |
| **Resend** | ≥80% monthly/daily send quota OR domains limit hit (1/1) OR rate-limit impact | Upgrade plan or revise domain strategy |
| **Twilio** | Usage trigger fires ($10 early / $25 critical) | Check billing/payment. Adjust trigger thresholds if volume grows. |
| **Retell** | Monthly spend ≥ $50 OR payment/invoice issue | Review budget/plan/payment method |
| **Peoplefone** | Balance < CHF 20 | Auto top-up +CHF 50 (already configured in F10). If frequent top-ups, increase threshold/amount. |

## Current Plan Summary

| Vendor | Plan | Monthly Cost | Key Limits |
|--------|------|-------------|------------|
| Vercel | Hobby (Free) | $0 | 100 GB bandwidth, 100k function invocations, 6k build minutes |
| Supabase | Free | $0 | 500 MB storage, 2 GB transfer, 50k API requests, no backups |
| Resend | Free | $0 | 100 emails/day, 3k/month, 1 domain |
| Twilio | Pay-as-you-go | ~$2-5/mo | Per-minute voice, per-SMS. Usage triggers at $10/$25. |
| Retell | Pay-as-you-go | ~$5-15/mo | Per-minute voice AI. No hard cap. |
| Peoplefone | Prepaid | ~CHF 5-10/mo | Balance-based. Auto top-up configured. |

## Review Cadence

- Founder checks dashboards monthly (or when trigger alert fires).
- CC not blocked — no env vars or code changes needed for plan upgrades.

## Cross-References

- Billing guards: OPS_BOARD F10 (DONE)
- Backup awareness: [backup_awareness.md](backup_awareness.md)
