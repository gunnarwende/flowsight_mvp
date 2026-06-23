-- Adress-Validierung (V9): Status der Swiss-Post-Prüfung pro Fall.
--
-- Ampel (Founder 2026-06-22): nur ROT ist sichtbar.
--   'unconfirmed'                       → rotes Flag + Klartext-Grund (Strasse/Hausnr)
--   'confirmed' / 'skipped' / 'error' / NULL → neutral (kein Flag)
-- 'skipped'  = Swiss Post (noch) nicht konfiguriert → wir behaupten nichts.
-- 'error'    = Prüfung versucht, aber API nicht erreichbar.
-- Best-effort befüllt bei Fall-Erstellung (api/cases) — blockiert NIE die Erstellung.

ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS address_status TEXT,
  ADD COLUMN IF NOT EXISTS address_reason TEXT;

COMMENT ON COLUMN cases.address_status IS 'Swiss-Post-Adressprüfung: confirmed | unconfirmed | error | skipped (NULL = nicht geprüft)';
COMMENT ON COLUMN cases.address_reason IS 'Klartext-Grund wenn address_status != confirmed (rotes Flag + Inhaber-Anzeige)';
