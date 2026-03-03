-- =============================================================================
-- FlowSight Demo Reset — VOLLSTÄNDIG
-- Brunner Haustechnik AG (Tenant d0000000-0000-0000-0000-000000000001)
--
-- Setzt alle 10 Seed Cases auf Original-Status zurück und löscht
-- alle während Demos erstellten Cases (Wizard + Voice).
--
-- Ausführen: Supabase Dashboard > SQL Editor > Paste > Run
-- Sicher: Nur Brunner-Tenant betroffen, keine anderen Tenants.
-- =============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Demo-Cases löschen (alles ausser Seed Cases)
--    case_events + case_attachments werden via CASCADE automatisch gelöscht.
-- ─────────────────────────────────────────────────────────────────────────────
DELETE FROM cases
WHERE tenant_id = 'd0000000-0000-0000-0000-000000000001'
  AND id NOT IN (
    'd1000000-0000-0000-0000-000000000001',
    'd1000000-0000-0000-0000-000000000002',
    'd1000000-0000-0000-0000-000000000003',
    'd1000000-0000-0000-0000-000000000004',
    'd1000000-0000-0000-0000-000000000005',
    'd1000000-0000-0000-0000-000000000006',
    'd1000000-0000-0000-0000-000000000007',
    'd1000000-0000-0000-0000-000000000008',
    'd1000000-0000-0000-0000-000000000009',
    'd1000000-0000-0000-0000-000000000010'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Alle 10 Seed Cases auf Original-Status zurücksetzen
-- ─────────────────────────────────────────────────────────────────────────────

-- FS-0001 bis FS-0005: done (abgeschlossene Fälle mit Reviews)
UPDATE cases SET status = 'done', assignee_text = NULL, internal_notes = NULL
WHERE id IN (
  'd1000000-0000-0000-0000-000000000001',
  'd1000000-0000-0000-0000-000000000002',
  'd1000000-0000-0000-0000-000000000003',
  'd1000000-0000-0000-0000-000000000004',
  'd1000000-0000-0000-0000-000000000005'
);

-- FS-0006: scheduled (Termin morgen)
UPDATE cases SET status = 'scheduled', assignee_text = NULL, internal_notes = NULL
WHERE id = 'd1000000-0000-0000-0000-000000000006';

-- FS-0007, FS-0008: contacted
UPDATE cases SET status = 'contacted', assignee_text = NULL, internal_notes = NULL
WHERE id IN (
  'd1000000-0000-0000-0000-000000000007',
  'd1000000-0000-0000-0000-000000000008'
);

-- FS-0009, FS-0010: new (frisch eingegangen)
UPDATE cases SET status = 'new', assignee_text = NULL, internal_notes = NULL
WHERE id IN (
  'd1000000-0000-0000-0000-000000000009',
  'd1000000-0000-0000-0000-000000000010'
);

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Verification: Status aller 10 Seed Cases prüfen
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
  id,
  seq_number,
  category,
  status,
  urgency
FROM cases
WHERE tenant_id = 'd0000000-0000-0000-0000-000000000001'
ORDER BY seq_number;

-- Erwartetes Ergebnis:
-- FS-0001  Verstopfung       done       normal
-- FS-0002  Heizung           done       dringend
-- FS-0003  Rohrbruch         done       notfall
-- FS-0004  Boiler            done       normal
-- FS-0005  Leck              done       dringend
-- FS-0006  Sanitär allgemein scheduled  normal
-- FS-0007  Heizung           contacted  dringend
-- FS-0008  Verstopfung       contacted  normal
-- FS-0009  Boiler            new        dringend
-- FS-0010  Rohrbruch         new        notfall

-- ─────────────────────────────────────────────────────────────────────────────
-- HINWEIS: Supabase Storage (Fotos)
-- Falls während der Demo Fotos hochgeladen wurden, bleiben diese im
-- Storage-Bucket "case-attachments". Die DB-Referenzen werden via CASCADE
-- gelöscht, aber die Dateien bleiben. Bei Bedarf manuell löschen:
-- Supabase Dashboard > Storage > case-attachments > Dateien löschen
-- ─────────────────────────────────────────────────────────────────────────────
