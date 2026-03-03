# CoreBot Setup — Telegram → GitHub Issues

## Overview

CoreBot is a single Vercel API route (`/api/telegram/webhook`) that receives Telegram messages and creates GitHub Issues with auto-classification labels.

## Prerequisites

- Telegram Bot already created (via @BotFather) — `TELEGRAM_BOT_TOKEN` exists
- GitHub account with repo access to `gunnarwende/flowsight_mvp`
- Vercel project deployed

## Step 1: Create GitHub Fine-Grained PAT

1. Go to GitHub → Settings → Developer Settings → Fine-grained personal access tokens
2. Click **Generate new token**
3. Token name: `flowsight-corebot`
4. Expiration: 90 days (set calendar reminder to rotate)
5. Resource owner: `gunnarwende`
6. Repository access: **Only select repositories** → `flowsight_mvp`
7. Permissions: **Issues** → Read & Write
8. Click **Generate token** and copy immediately

## Step 2: Add Env Vars to Vercel

Vercel Dashboard → flowsight-mvp → Settings → Environment Variables:

| Variable | Value | Environments |
|----------|-------|-------------|
| `GITHUB_ISSUES_TOKEN` | [the PAT from Step 1] | Production, Preview |
| `TELEGRAM_ALLOWED_USER_ID` | `8658747389` | Production, Preview |
| `TELEGRAM_SHARED_SECRET` | [same value as GitHub Secret] | Production, Preview |

Note: `TELEGRAM_BOT_TOKEN` should already be configured.

## Step 3: Register Telegram Webhook

After deploy, register the webhook URL with Telegram:

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://flowsight-mvp.vercel.app/api/telegram/webhook&secret_token=<SHARED_SECRET>"
```

Expected response: `{"ok":true,"result":true,"description":"Webhook was set"}`

## Step 4: Verify

1. Send a text message to the bot in Telegram
2. Check GitHub Issues — new issue should appear with labels
3. Check Telegram — bot should reply with issue number and link

## Token Rotation

### GitHub PAT
1. Create new PAT (Step 1)
2. Update `GITHUB_ISSUES_TOKEN` in Vercel Env
3. Redeploy (or wait for next deploy)
4. Revoke old PAT in GitHub

### Telegram Shared Secret
1. Generate new secret: `openssl rand -hex 32`
2. Update `TELEGRAM_SHARED_SECRET` in Vercel Env + GitHub Secrets
3. Re-register webhook (Step 3) with new `secret_token`
4. Redeploy

### Telegram Bot Token
1. Generate new token via @BotFather `/revoke`
2. Update `TELEGRAM_BOT_TOKEN` in Vercel Env + GitHub Secrets
3. Re-register webhook (Step 3) with new bot token in URL
4. Redeploy

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| No issue created, no ACK | Wrong user ID or missing secret | Check `TELEGRAM_ALLOWED_USER_ID` matches your Telegram user ID |
| ACK says "Issue creation failed" | PAT expired or wrong permissions | Rotate PAT (see above) |
| Bot doesn't respond at all | Webhook not registered or wrong URL | Re-run Step 3, check `getWebhookInfo` |
| 500 error in Vercel logs | Missing env vars | Check all 4 vars are set in Vercel |

### Useful debug commands

```bash
# Check current webhook status
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"

# Health check
curl https://flowsight-mvp.vercel.app/api/telegram/webhook
# Should return: "ok"
```
