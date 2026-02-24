# Secrets Policy — FlowSight MVP

## SSOT (Single Source of Truth)

| Location | Purpose | Access |
|----------|---------|--------|
| `.env.local` (gitignored) | Local dev & debug | CC + Founder |
| Vercel Env Vars | Production runtime | Vercel functions |
| Bitwarden | Backup & sharing | Founder only |

## Rules (ABSOLUTE — no exceptions)

1. **Never commit** secrets to repo (`.env*` in `.gitignore`)
2. **Never print** secrets in chat, logs, or tool output
3. **Never inline** secrets in shell commands (curl, node -e, etc.)
4. **Never `cat/grep/echo`** on `.env*` files — values leak into chat context
5. **Never hardcode** secrets in scripts, docs, or runbooks

## CC Debug Mode — Safe Secret Access

### Allowed Pattern (node --env-file)
```bash
# Node loads .env.local into process.env — keys never appear in command
node --env-file=src/web/.env.local -e "
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // ... use url/key in fetch() ...
"
```

### Allowed Pattern (script with dotenv)
```bash
# Script reads .env internally — keys never in CLI args
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
Ask the Founder to run the query manually:
1. Provide the query/command template with `$ENV_VAR` placeholders
2. Founder runs in PowerShell with env vars already set
3. Founder pastes result (data only, no keys)

## Vercel Logs
- Hobby plan: 1 log per invocation, 1h retention
- Never include secrets in structured logs (`logDecision`)
- Use temp dir for `vercel logs` CLI (never repo root)

## Incident: Secret Leaked in Chat
1. Rotate the leaked secret immediately (Supabase Dashboard / Vercel / Bitwarden)
2. Update `.env.local` + Vercel Env with new value
3. Document in incident log
