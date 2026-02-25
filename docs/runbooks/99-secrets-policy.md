# Secrets Policy — FlowSight MVP

**Owner:** Head Ops Agent
**Last updated:** 2026-02-25

## SSOT Hierarchy

| Priority | Location | Purpose | Who sets |
|----------|----------|---------|----------|
| **1 (SSOT)** | Vercel Env Vars | Production runtime — all secrets live here | Founder |
| 2 | `.env.local` (gitignored) | Local dev & debug — synced FROM Vercel | CC + Founder |
| 3 | Bitwarden | Offline backup only — NOT operative SSOT | Founder only |

**Rule:** Vercel is always authoritative. If Vercel and .env.local differ, Vercel wins. Resync.

## .env.local Sync Process

```
1. Create temp dir:          mkdir C:\tmp\vercel_sync
2. Pull from Vercel:         cd C:\tmp\vercel_sync && npx vercel env pull .env.local
3. Backup existing:          copy src\web\.env.local src\web\.env.local.bak
4. Copy to project:          copy C:\tmp\vercel_sync\.env.local src\web\.env.local
5. Verify key count:         node --env-file=src/web/.env.local -e "console.log(Object.keys(process.env).length)"
6. Clean temp:               rmdir /s C:\tmp\vercel_sync
```

Never run `vercel env pull` in the repo directory (creates .vercel/).

## Rules (ABSOLUTE — no exceptions)

1. **Never commit** secrets to repo (`.env*` in `.gitignore`)
2. **Never print** secrets in chat, logs, or tool output
3. **Never inline** secrets in shell commands (curl -H "apikey: ...", etc.)
4. **Never `cat/grep/echo`** on `.env*` files — values leak into chat context
5. **Never hardcode** secrets in scripts, docs, or runbooks
6. **Never log** secrets in structured JSON logs (`logDecision` must be PII-free)

## CC Debug Mode — Safe Secret Access

### Allowed Pattern (node --env-file)
```bash
node --env-file=src/web/.env.local -e "
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // ... use url/key in fetch() ...
"
```

### Allowed Pattern (script with dotenv)
```bash
node --env-file=src/web/.env.local scripts/_ops/verify_voice_pipeline.mjs
```

### Forbidden Patterns
```bash
# FORBIDDEN: secret inline in command
curl -H "apikey: eyJ..." ...

# FORBIDDEN: reading env file content
cat src/web/.env.local
grep KEY src/web/.env.local

# FORBIDDEN: echoing env vars
echo $SUPABASE_SERVICE_ROLE_KEY
node -e "console.log(process.env.SUPABASE_SERVICE_ROLE_KEY)"
```

### Fallback (if node --env-file fails)
1. Provide the query/command template with `$ENV_VAR` placeholders
2. Founder runs in PowerShell with env vars already set
3. Founder pastes result (data only, no keys)

## Vercel Logs
- Hobby plan: 1 log per invocation, 1h retention
- Never include secrets in structured logs (`logDecision`)
- Use temp dir for `vercel logs` CLI (never repo root)

## Incident Playbook: Secret Leaked

**Trigger:** Any secret value appears in chat, log output, commit, or shared doc.

| Step | Action | Who |
|------|--------|-----|
| 1 | **Stop.** Do not run further commands with the leaked secret. | CC |
| 2 | **Rotate** the secret at its source (Supabase Dashboard / Resend / Retell / Twilio). | Founder |
| 3 | **Update Vercel Env** with the new value (Vercel Dashboard → Settings → Env Vars). | Founder |
| 4 | **Sync .env.local** via temp-dir pull process (see above). | CC |
| 5 | **Redeploy** if the secret is used at build time (push empty commit or trigger via Vercel). | CC/Founder |
| 6 | **Test** critical paths: /api/health, wizard submit, voice webhook. | CC |
| 7 | **Document** in STATUS.md Recent Updates (date, what leaked, what rotated, verification). | CC |

**Recovery time target:** < 30 minutes from detection to verified fix.

## Compliance Modes (Voice)

| Setting | Debug | Live |
|---------|-------|------|
| `opt_out_sensitive_data_storage` | `false` | `true` |
| `recording_enabled` | `true` | `false` |
| Retell deploy flag | `--mode debug` | `--mode live --confirm` |

Enforced by `retell_deploy.mjs`. If `recording_url` appears in webhook payload during Live mode → Sentry WARNING.
