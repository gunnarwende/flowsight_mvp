-- Brunner Haustechnik AG: Voice Agent phone number mapping
--
-- SETUP: Replace the placeholder phone number with the actual Twilio number
-- assigned to the Brunner Retell agent. Use E.164 format (e.g. +41445520920).
--
-- After replacing, apply via:
--   cd C:\tmp\supa_push
--   copy supabase dir, supabase link, supabase db push

INSERT INTO tenant_numbers (tenant_id, phone_number)
VALUES (
  'd0000000-0000-0000-0000-000000000001',  -- Brunner Haustechnik AG
  '+41445054818'                             -- Twilio: +41 44 505 48 18
);
