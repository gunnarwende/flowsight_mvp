# Archive Test Data — One-Time Cleanup

**Owner:** Founder (SQL execution)
**Last updated:** 2026-02-25

## Context

Cases created during development/testing (Feb 19–24) pollute the ops dashboard and morning report. The `archived` status hides them from all views while preserving them for audit.

## Step 1: Apply migration (Supabase SQL Editor)

```sql
-- Add 'archived' to status CHECK constraint
ALTER TABLE cases DROP CONSTRAINT cases_status_check;
ALTER TABLE cases ADD CONSTRAINT cases_status_check
  CHECK (status IN ('new', 'contacted', 'scheduled', 'done', 'archived'));

-- Update partial index to also exclude archived
DROP INDEX IF EXISTS idx_cases_status;
CREATE INDEX idx_cases_status ON cases (status) WHERE status NOT IN ('done', 'archived');
```

## Step 2: Archive old test cases

```sql
-- Preview: which cases will be archived?
SELECT id, created_at::date, source, status, category
FROM cases
WHERE status = 'new' AND created_at < '2026-02-24T00:00:00Z'
ORDER BY created_at;

-- Archive them (only 'new' cases from before Feb 24 — real cases have been moved to contacted/scheduled/done)
UPDATE cases
SET status = 'archived'
WHERE status = 'new' AND created_at < '2026-02-24T00:00:00Z';
```

## Step 3: Verify

```sql
SELECT status, count(*) FROM cases GROUP BY status ORDER BY status;
```

**Expected:** `new` count drops significantly, `archived` appears with the test case count.

## What this affects

| System | Behavior |
|--------|----------|
| Ops dashboard (default view) | Archived cases hidden |
| Ops dashboard ("Alle" view) | Archived cases hidden (use "Archiviert" filter to see them) |
| Ops dashboard tiles | Archived excluded from Open/Today/Done counts |
| Morning report | Archived excluded from all KPIs (backlog, stuck, recent, scheduled) |
| API PATCH | `archived` is a valid status (can archive via ops detail if needed) |
| Case creation (wizard/voice) | Unaffected (new cases always start as `new`) |

## Future use

To archive a single case from the ops UI: open case detail → change status to "Archiviert" → save.
