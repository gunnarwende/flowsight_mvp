# Runbook: Email Smoke (Resend)

**Date:** 2026-02-19
**Owner:** Head Ops Agent

## Overview

On each case creation (`POST /api/cases`), a notification email is sent to `MAIL_REPLY_TO` via Resend. This is fire-and-forget: email failure never fails case creation.

## Env Vars Required

| Var | Required | Notes |
|---|---|---|
| `RESEND_API_KEY` | Yes | From Resend Dashboard |
| `MAIL_FROM` | No | Defaults to `noreply@flowsight.ch` |
| `MAIL_REPLY_TO` | Yes | Recipient for case notifications |
| `MAIL_SUBJECT_PREFIX` | No | Defaults to `[FlowSight]` |

## Email Format

- **Subject:** `[FlowSight] 🔴 NOTFALL – Sanitär (Oberrieden)` (urgency-dependent prefix)
- **Body:** Plain text with case ID, source, category, urgency, PLZ/city, description.
- **No PII in subject line** (no phone/email).

## Error Handling

- If `MAIL_REPLY_TO` is not set: warning logged to Sentry (`area:email, provider:resend`), email skipped.
- If Resend API fails: exception captured to Sentry (`area:email, provider:resend, tenant_id, case_id`).
- Case creation always succeeds regardless of email outcome.

## Smoke Test

1. Ensure env vars are set in `.env.local`.
2. Start dev server: `cd src/web && npm run dev`.
3. Create a test case via curl (see `docs/runbooks/api_cases.md`).
4. Check Resend Dashboard for sent email.
5. Check Sentry for any email-related events.

## Files

- Email lib: `src/web/src/lib/email/resend.ts`
- Called from: `src/web/app/api/cases/route.ts`
