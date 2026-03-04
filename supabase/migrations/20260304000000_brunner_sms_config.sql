-- Enable SMS module for Brunner Haustechnik AG (demo tenant)
-- Required for post-voice-intake SMS (correction link + confirmation)
-- Without sms=true + sms_sender_name, getTenantSmsConfig() returns null → SMS skipped

UPDATE tenants
  SET modules = modules || '{"sms": true, "sms_sender_name": "BrunnerHT"}'::jsonb
  WHERE id = 'd0000000-0000-0000-0000-000000000001';
