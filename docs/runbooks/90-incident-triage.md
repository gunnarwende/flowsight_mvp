# Incident Triage Runbook — FlowSight MVP

**Owner:** Head Ops Agent
**Last updated:** 2026-02-25

## 5-Step Incident Flow

### 1. Detect
- **Sentry Alert** (email/slack): Check `_tag`, `decision`, `error_code` tags
- **WhatsApp RED Alert** (when implemented): INCIDENT message with code + refs
- **Founder report**: "Calls aren't creating cases" / "No emails coming through"
- **Morning Report anomaly**: stuck cases, zero volume, email failures

### 2. Assess Severity

| Severity | Criteria | Response Time |
|----------|----------|---------------|
| **RED** | Case creation failed, email dispatch failed, webhook rejected, security event | Immediate (< 15 min) |
| **YELLOW** | Cases stuck > 48h, review email bounced, high volume anomaly | Same day |
| **GREEN** | Cosmetic, non-blocking, known limitation | Next session |

### 3. Contain
- **Secret leak?** → Follow 99-secrets-policy.md Incident Playbook (rotate immediately)
- **Voice broken?** → Check Retell Dashboard for agent status + recent calls
- **Email broken?** → Check Resend Dashboard for delivery status + API key validity
- **DB broken?** → Check Supabase Dashboard for service status
- **Deploy broken?** → Check Vercel Dashboard for deployment status + function logs

### 4. Fix + Verify
- Fix the root cause (code fix, config change, secret rotation)
- Run smoke tests:
  - `GET /api/health` → 200
  - Wizard submit → case created + email
  - Voice webhook → case created + email (if voice-related)
  - `/ops/cases` → loads
- Commit fix with descriptive message

### 5. Document (Evidence Pack)
```markdown
## Incident: [CODE] — YYYY-MM-DD

### What happened
[1-2 sentences]

### Root cause
[Technical root cause]

### Fix applied
[What was changed, commit SHA]

### IDs (no PII)
- call_id / case_id / message_id: ...

### Verification
- [ ] /api/health → 200
- [ ] Wizard smoke → 201
- [ ] Voice smoke → case created
- [ ] /ops/cases → loads

### Prevention
[What changes prevent recurrence]
```

Update STATUS.md Recent Updates with incident summary.

## Supabase Backup Note

Free plan = **no automatic backups**. See [backup_awareness.md](backup_awareness.md) for risk assessment + upgrade triggers. For critical data recovery pre-Pro: manual CSV export via Supabase Dashboard.

## Cross-References
- Secret incidents: [99-secrets-policy.md](99-secrets-policy.md)
- Voice debugging: [voice_debug.md](voice_debug.md)
- Monitoring alerts: [monitoring.md](monitoring.md)
- Device loss: [98-device-loss.md](98-device-loss.md)
- Backup awareness: [backup_awareness.md](backup_awareness.md)
- Cost triggers: [cost_triggers.md](cost_triggers.md)
