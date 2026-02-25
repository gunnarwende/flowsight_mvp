# Device Loss Playbook — FlowSight MVP

**Owner:** Founder
**Last updated:** 2026-02-25
**Trigger:** Laptop lost, stolen, or compromised.

## 10-Step Recovery (Priority Order)

Execute top-to-bottom. Higher priority = higher blast radius if attacker has access.

| # | Service | Action | URL | Verify |
|---|---------|--------|-----|--------|
| 1 | **GitHub** | Revoke all sessions. Rotate Personal Access Token. Enable/verify 2FA. Review recent commits for unauthorized changes. | github.com/settings/security | `git pull` works with new token |
| 2 | **Vercel** | Revoke all sessions (Account → Security → Sessions). Rotate any Integration Tokens. Check recent deployments for unauthorized deploys. | vercel.com/account/security | `vercel whoami` from new device |
| 3 | **Supabase** | Rotate Service Role Key + Anon Key (Settings → API). Update Vercel Env Vars immediately. Do NOT rotate JWT Secret unless auth tokens are confirmed leaked. | supabase.com/dashboard → Project → Settings → API | /api/health → 200, then wizard submit |
| 4 | **Resend** | Rotate API Key (API Keys → Revoke + Create new). Update Vercel Env Var `RESEND_API_KEY`. | resend.com/api-keys | Send test email via wizard submit |
| 5 | **Retell** | Rotate API Key (Settings → API Key). Update Vercel Env Vars `RETELL_API_KEY`. Verify webhook secret unchanged. | retell.ai/dashboard | Make test call, verify case created |
| 6 | **Twilio** | Rotate Auth Token (Account → API Keys). Update Vercel Env Var `TWILIO_AUTH_TOKEN`. Verify SIP trunk still connected. | twilio.com/console | Voice call reaches Retell |
| 7 | **Bitwarden** | Change master password. Revoke all sessions. Verify vault contents unchanged. | vault.bitwarden.com | Login with new password |
| 8 | **Google Business** | Revoke device sessions. Change password. Check for unauthorized review replies or profile edits. | myaccount.google.com/security | Profile unchanged |
| 9 | **Sentry** | Revoke auth tokens (Settings → Auth Tokens). Check for unauthorized alert changes. | sentry.io/settings/auth-tokens | Sentry events still flowing |
| 10 | **Peoplefone** | Change password. Verify number routing unchanged. Check for unauthorized forwards. | portal.peoplefone.ch | Inbound calls still route correctly |

## After All Rotations

1. **Sync .env.local** on new device via temp-dir pull (see 99-secrets-policy.md)
2. **Redeploy** Vercel (push empty commit or trigger manual deploy)
3. **Smoke test** all critical paths:
   - GET /api/health → 200
   - Wizard submit → case created + email sent
   - Voice call → case created + email sent
   - /ops/cases → loads with auth
4. **Document** in STATUS.md: date, what happened, what was rotated, verification status

## Time Budget

Target: all 10 steps completed within **2 hours** of discovery.
Priority 1-3 (GitHub/Vercel/Supabase) within **15 minutes** — these have the highest blast radius.
