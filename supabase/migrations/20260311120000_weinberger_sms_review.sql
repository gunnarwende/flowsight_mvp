-- Enable SMS module + Google Review URL for Jul. Weinberger AG
-- Required for:
--   1. Post-voice-intake SMS (correction link + confirmation) via getTenantSmsConfig()
--   2. Review Surface "Posten" button → links to Google Review page
--
-- Without sms=true + sms_sender_name, getTenantSmsConfig() returns null → SMS skipped.
-- Without google_review_url, Review Surface shows non-functional button.

UPDATE tenants
  SET modules = modules || '{
    "sms": true,
    "sms_sender_name": "Weinberger",
    "google_review_url": "https://www.google.com/maps/place/Jul.+Weinberger+AG"
  }'::jsonb
  WHERE slug = 'weinberger-ag';
