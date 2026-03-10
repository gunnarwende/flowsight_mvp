# Runbooks Index

**33 runbooks. Find the right one in 10 seconds.**

Last updated: 2026-03-10

---

## Daily Ops

| File | What | When |
|------|------|------|
| `monitoring.md` | Health endpoint, uptime checks, alerting setup | Something feels down -- check health first |
| `90-incident-triage.md` | 5-step incident flow: Detect, Assess, Isolate, Fix, Review | RED/YELLOW alert came in, need structured response |
| `email_smoke.md` | Resend email pipeline: env vars, format, failure behavior | Case created but customer got no email |
| `cost_triggers.md` | Vendor spend thresholds and upgrade triggers for all services | Monthly cost review or unexpected bill |
| `backup_awareness.md` | Supabase backup status (Free plan = none), risk + mitigations | Wondering if data is safe, planning Pro upgrade |
| `phone_routing_registry.md` | SSOT for all phone numbers, providers, Retell agent assignments | Need to check which number routes where |
| `release_checklist.md` | Pre-push gates: lint, build, diff review, deploy verification | About to ship code to production |
| `mobile_qa.md` | 30-min manual smartphone test for /ops/cases workflow | Before go-live or after major UI change |

## Setup / Onboarding

| File | What | When |
|------|------|------|
| `onboarding_customer_full.md` | Full customer setup: Supabase tenant, voice, wizard, email, reviews (~55 min) | New paying customer signed, need everything |
| `onboarding_reviews_only.md` | Lightweight setup: just Google Review request engine (~5 min) | Customer only wants review emails |
| `supabase_seed_tenant.md` | Insert first tenant row (doerfler-ag) into Supabase | Fresh Supabase project, no tenants yet |
| `entitlements_setup.md` | Add modules column to tenants table, set per-tenant flags | Need to gate features per customer |
| `ops_setup.md` | Supabase Auth config: Magic Link, redirects, allowed emails | Setting up /ops dashboard access for first time |
| `storage_setup.md` | Create case-attachments bucket + migration SQL | Before enabling file uploads on cases |
| `brunner_voice_setup.md` | Brunner demo tenant voice agent pair (DE + INTL, intake + info) | Setting up or resetting the Brunner demo |
| `retell_agent_config.md` | Retell agent settings: webhook URL, events, analysis schema | Configuring a new Retell agent from scratch |
| `peoplefone_front_door.md` | Brand number (044 552 09 19) routing: Peoplefone -> Twilio -> Retell | Setting up or debugging the PSTN front door |
| `twilio_a2p_registration.md` | Register SMS sender for A2P compliance (~30 min + carrier approval) | SMS being filtered/blocked, need verified sender |
| `corebot_setup.md` | Telegram -> GitHub Issues bot: PAT, webhook, labels | Setting up CoreBot for bug intake |
| `sentry_token_setup.md` | Create Sentry API token with read-only scopes for ops scripts | Sentry scripts returning 403 |
| `archive_test_data.md` | Archive dev/test cases to clean up dashboard + morning report | Dashboard polluted with test data |

## Debug / Troubleshooting

| File | What | When |
|------|------|------|
| `voice_debug.md` | Decision tree: Twilio logs, Sentry events, Retell dashboard, prod probe | Voice calls not creating cases -- start here |
| `voice_e2e.md` | End-to-end voice verification: Twilio -> Retell -> webhook -> case -> email | After voice setup, verify the full chain works |
| `voice_multilingual_acceptance.md` | 17-point checklist for DE/INTL agent language switching | After multilingual agent deploy, founder acceptance |
| `voice_chain_spur2.md` | Audio forensics: download recordings, WhisperX re-transcribe, correlate | Deep-dive on a specific call's audio quality |
| `api_cases.md` | POST /api/cases reference: required fields, payload format | Building or debugging case creation |
| `api_cases_min_payload.md` | Minimum passing curl payloads for /api/cases (copy-paste ready) | Quick smoke test of case API |

## Sales / GTM

| File | What | When |
|------|------|------|
| `demo_script.md` | 15-min remote demo script with guardrails and demo-kit references | Preparing for a prospect demo call |
| `sales_agent.md` | Sales voice agent (Lisa) brief: architecture, dual-agent, webhook | Understanding or debugging the sales voice flow |
| `provisioning_prospect.md` | Prospect -> outreach-ready in <25 min: crawl, website, agent, email | New prospect scored, need demo assets fast |

## Security / Compliance

| File | What | When |
|------|------|------|
| `99-secrets-policy.md` | Secrets SSOT hierarchy: Vercel > .env.local > Bitwarden | Unsure where a secret lives or how to sync |
| `98-device-loss.md` | 10-step recovery if laptop is lost/stolen/compromised | Device lost -- execute immediately, top to bottom |
| `access_matrix.md` | Who has access to what: Vercel, Supabase, Twilio, Retell, etc. | Audit or onboarding a new team member |
