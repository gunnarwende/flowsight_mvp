-- Persistierter, AUTORITATIVER Kanton am Lead.
--
-- Quelle: Google addressComponents (administrative_area_level_1), vom Discovery
-- (discover_targeted.mjs) beim Insert geschrieben. Der Ortsname allein kann
-- Homonyme NICHT trennen (Wetzikon/Eschlikon/Berg liegen in TG *und* ZH) — der
-- namensbasierte Audit-Check produzierte dadurch Falschalarme. Mit dieser Spalte
-- liest das Audit den Kanton direkt statt ihn aus dem Ort abzuleiten.
--
-- Idempotent (IF NOT EXISTS) — gefahrlos mehrfach anwendbar.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS kanton TEXT;
