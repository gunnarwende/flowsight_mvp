# Data Processing — Subprocessors, Retention & Deletion

**Owner:** Founder (policy decisions) + Head Ops (technical documentation)
**Last updated:** 2026-02-25
**Status:** As-built baseline. Retention periods TBD — Founder decides.

## 1. Subprocessors

All vendors process data on behalf of FlowSight GmbH. No vendor receives data beyond what is technically required for their function.

| Vendor | Function | Data processed | Data location | Privacy config |
|--------|----------|---------------|---------------|----------------|
| **Supabase** | Database (SSOT) | Cases, tenants, attachments, auth | AWS eu-central-1 (Frankfurt) | RLS enabled, service role key server-only |
| **Vercel** | Hosting + serverless | Request logs (1h retention on Hobby), env vars | AWS eu-central-1 | Function logs auto-expire 1h. No persistent PII storage. |
| **Retell** | Voice agent | Call audio (live only, not stored), extracted fields via custom_analysis_data | US (Retell infrastructure) | Recording OFF, data_storage="everything_except_pii", PII redaction enabled (name, phone, email, address, postal codes) |
| **Twilio** | Telephony carrier | Call metadata (from/to numbers, duration, SIP routing) | US + EU (Twilio infrastructure) | No call recording. Call logs retained per Twilio default (see Twilio Console → Settings). |
| **Peoplefone** | Brand number + forwarding | Call metadata (forwarding logs) | Switzerland | Simple PSTN forward, no data storage beyond routing logs. |
| **Resend** | Email delivery | Recipient email, subject, body content | US (Resend infrastructure) | Transactional email only. Resend retains delivery logs per their policy. |
| **Sentry** | Error monitoring | Error traces, tags (tenant_id, case_id, source). No PII in tags by design. | US (Sentry infrastructure) | 90-day default retention. No contact info in Sentry events — only IDs and decision tags. |

### What no vendor sees

- **Passwords/auth tokens**: Supabase Auth handles magic links; no vendor sees credentials.
- **Full case descriptions in logs**: Vercel function logs contain only structured JSON with IDs and decisions, never case content.
- **Call recordings**: Recording is OFF at Retell config level (CLAUDE.md hard rule). No audio is stored anywhere.

## 2. Data Retention

### Current reality (as-built)

| Data type | Where stored | Current retention | Policy (TBD) |
|-----------|-------------|-------------------|---------------|
| Cases (all fields) | Supabase `cases` table | Indefinite (no auto-delete) | TBD (Founder) |
| Case attachments | Supabase Storage `case-attachments` bucket | Indefinite (no auto-delete) | TBD (Founder) |
| Tenant records | Supabase `tenants` table | Indefinite | Permanent (config data, not PII) |
| Phone number mappings | Supabase `tenant_numbers` table | Indefinite | Permanent (config data) |
| Voice call transcripts | NOT stored (Retell processes live, webhook receives extracted fields only) | N/A | N/A |
| Voice call recordings | NOT stored (Recording OFF) | N/A | N/A |
| Email content | Resend (transactional, per Resend retention policy) | Per Resend policy | Not under our control — review Resend DPA |
| Vercel function logs | Vercel | 1 hour (Hobby plan) | Automatic, no action needed |
| Sentry error events | Sentry | 90 days (default) | Configurable in Sentry → Settings → Data Retention |

### Founder decisions needed

- **Case retention period**: How long to keep completed cases? (e.g., 2 years, 5 years, indefinite)
- **Attachment retention**: Same as cases, or shorter?
- **Archived cases**: Keep indefinitely as audit trail, or delete after X months?
- **Resend DPA**: Review and accept Resend's Data Processing Agreement.

## 3. Deletion Procedure (manual)

When a tenant requests data deletion or when retention period expires.

### Step 1: Identify scope

```sql
-- List all data for a tenant
SELECT 'cases' AS table_name, count(*) FROM cases WHERE tenant_id = '<TENANT_ID>'
UNION ALL
SELECT 'attachments', count(*) FROM case_attachments WHERE case_id IN (SELECT id FROM cases WHERE tenant_id = '<TENANT_ID>')
UNION ALL
SELECT 'tenant_numbers', count(*) FROM tenant_numbers WHERE tenant_id = '<TENANT_ID>';
```

### Step 2: Delete attachments (Storage + DB)

```sql
-- Get storage paths for manual deletion in Supabase Dashboard → Storage
SELECT file_path FROM case_attachments
WHERE case_id IN (SELECT id FROM cases WHERE tenant_id = '<TENANT_ID>');

-- Delete attachment records
DELETE FROM case_attachments
WHERE case_id IN (SELECT id FROM cases WHERE tenant_id = '<TENANT_ID>');
```

Then delete the files from Supabase Storage → `case-attachments` bucket manually.

### Step 3: Delete cases

```sql
DELETE FROM cases WHERE tenant_id = '<TENANT_ID>';
```

### Step 4: Delete tenant routing

```sql
DELETE FROM tenant_numbers WHERE tenant_id = '<TENANT_ID>';
```

### Step 5: Deactivate tenant

```sql
-- Option A: Delete tenant entirely
DELETE FROM tenants WHERE id = '<TENANT_ID>';

-- Option B: Keep tenant record but disable all modules
UPDATE tenants SET modules = '{}'::jsonb WHERE id = '<TENANT_ID>';
```

### Post-deletion checklist

- [ ] Supabase: Verify `SELECT count(*) FROM cases WHERE tenant_id = '<TENANT_ID>'` = 0
- [ ] Supabase Storage: Verify tenant's files removed from `case-attachments` bucket
- [ ] Peoplefone: Remove call forwarding for tenant's brand number (see docs/runbooks/peoplefone_front_door.md)
- [ ] Retell: No per-tenant config to remove (shared agents, tenant resolved at webhook level)
- [ ] Resend: No per-tenant config (shared API key, tenant resolved at send time)
- [ ] Document deletion in docs/customers/`<slug>`/status.md with date and reason

## 4. References

- Secrets policy: docs/runbooks/99-secrets-policy.md
- Incident triage: docs/runbooks/90-incident-triage.md
- Device loss (credential rotation): docs/runbooks/98-device-loss.md
- Retell privacy config: docs/runbooks/retell_agent_config.md (privacy defaults section)
