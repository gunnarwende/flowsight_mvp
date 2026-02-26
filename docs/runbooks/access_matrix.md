# Access Matrix — FlowSight MVP

**Owner:** Founder
**Last updated:** 2026-02-25
**Rule:** No PII (emails/phones/names). Identity account placeholders only.

## Service Access

| Service | Founder | CC (Head Ops) | 2FA | Recovery Codes | Notes |
|---------|---------|---------------|-----|----------------|-------|
| Vercel | Owner (full) | Read-only (logs, deploys) | ✅ enabled | ✅ verified | |
| Supabase | Owner (full) | Service role key (API only) | ✅ enabled | ✅ verified | |
| Twilio | Owner (full) | No direct access | ✅ enabled | ✅ verified | CC uses API via env vars only |
| Retell | Owner (full) | No direct access | ⚠️ not available | n/a | Retell has no 2FA option; password-only |
| Resend | Owner (full) | No direct access | ✅ enabled | ✅ verified | |
| Sentry | Owner (full) | Read-only (events) | ✅ enabled | ✅ verified | |
| Peoplefone | Owner (full) | No direct access | ⚠️ not available | n/a | Portal login; no 2FA option |
| GitHub | Owner (full) | Contributor (repo only) | ✅ enabled | ✅ verified | |

## Legend

- **Owner (full):** Admin/billing/config/delete access
- **Read-only:** Can view but not modify
- **Service role key:** API-level access via env var (no dashboard)
- **No direct access:** CC operates only through code/scripts that use Founder-provisioned keys

## Vendor 2FA Gaps

| Vendor | Gap | Mitigation |
|--------|-----|------------|
| Retell | No 2FA available | Strong unique password + password manager. Monitor for 2FA feature release. |
| Peoplefone | No 2FA available | Strong unique password + password manager. Portal access is Founder-only. |

## Review Cadence

- Founder reviews this matrix quarterly or when adding a new service/team member.
- CC does not modify this file — Founder-owned SSOT.
