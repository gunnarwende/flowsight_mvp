-- Demo Tenant: Brunner Haustechnik AG (Thalwil)
-- Deterministic UUID for easy reference in demo scripts.
-- 10 seed cases across the last 14 days + case_events for realistic timeline.
-- Modules: all enabled (website_wizard, ops, voice, reviews).

-- ============================================================
-- Tenant
-- ============================================================

INSERT INTO tenants (id, slug, name) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'brunner-haustechnik', 'Brunner Haustechnik AG');

-- Enable all modules for demo tenant
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS modules jsonb;
UPDATE tenants
  SET modules = '{"website_wizard": true, "ops": true, "voice": true, "reviews": true}'::jsonb
  WHERE id = 'd0000000-0000-0000-0000-000000000001';

-- ============================================================
-- 10 Seed Cases
-- ============================================================

-- FS-0001: Verstopfung, normal, done (12 days ago)
INSERT INTO cases (id, tenant_id, source, reporter_name, contact_phone, contact_email, street, house_number, plz, city, category, urgency, description, status, review_sent_at, created_at)
VALUES (
  'd1000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'wizard', 'Anna Meier', '+41794561234', 'anna.meier@example.ch',
  'Dorfstrasse', '8', '8800', 'Thalwil',
  'Verstopfung', 'normal',
  'Abfluss in der Küche läuft nur noch sehr langsam ab. Schon Hausmittel versucht, aber ohne Erfolg.',
  'done', now() - interval '10 days',
  now() - interval '12 days'
);

-- FS-0002: Heizung, dringend, done (10 days ago)
INSERT INTO cases (id, tenant_id, source, reporter_name, contact_phone, street, house_number, plz, city, category, urgency, description, status, created_at)
VALUES (
  'd1000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000001',
  'voice', 'Peter Keller', '+41787654321',
  'Alte Landstrasse', '15', '8810', 'Horgen',
  'Heizung', 'dringend',
  'Heizung springt nicht mehr an. Display zeigt Fehlermeldung E04. Wohnung wird langsam kalt.',
  'done',
  now() - interval '10 days'
);

-- FS-0003: Rohrbruch, notfall, done (8 days ago)
INSERT INTO cases (id, tenant_id, source, reporter_name, contact_phone, plz, city, category, urgency, description, status, created_at)
VALUES (
  'd1000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000001',
  'voice', 'Maria Huber', '+41761234567',
  '8802', 'Kilchberg',
  'Rohrbruch', 'notfall',
  'Wasserrohr im Keller geplatzt. Wasser läuft ununterbrochen. Haupthahn bereits zugedreht.',
  'done',
  now() - interval '8 days'
);

-- FS-0004: Boiler, normal, done (7 days ago)
INSERT INTO cases (id, tenant_id, source, reporter_name, contact_phone, contact_email, street, house_number, plz, city, category, urgency, description, status, review_sent_at, created_at)
VALUES (
  'd1000000-0000-0000-0000-000000000004',
  'd0000000-0000-0000-0000-000000000001',
  'wizard', 'Thomas Brunner', '+41798765432', 'thomas.b@example.ch',
  'Bergstrasse', '22', '8800', 'Thalwil',
  'Boiler', 'normal',
  'Boiler heizt nur noch lauwarm. Wasser wird nicht mehr richtig heiss. Gerät ist ca. 8 Jahre alt.',
  'done', now() - interval '5 days',
  now() - interval '7 days'
);

-- FS-0005: Leck, dringend, done (6 days ago)
INSERT INTO cases (id, tenant_id, source, reporter_name, contact_phone, street, house_number, plz, city, category, urgency, description, status, created_at)
VALUES (
  'd1000000-0000-0000-0000-000000000005',
  'd0000000-0000-0000-0000-000000000001',
  'voice', 'Sandra Weber', '+41765432198',
  'Seestrasse', '71', '8810', 'Horgen',
  'Leck', 'dringend',
  'Unter dem Lavabo im Bad tropft es konstant. Schon einen Eimer drunter gestellt.',
  'done',
  now() - interval '6 days'
);

-- FS-0006: Sanitär allgemein, normal, scheduled (4 days ago)
INSERT INTO cases (id, tenant_id, source, reporter_name, contact_phone, contact_email, street, house_number, plz, city, category, urgency, description, status, scheduled_at, created_at)
VALUES (
  'd1000000-0000-0000-0000-000000000006',
  'd0000000-0000-0000-0000-000000000001',
  'wizard', 'Claudia Frei', '+41791112233', 'claudia.frei@example.ch',
  'Bahnhofstrasse', '3', '8134', 'Adliswil',
  'Sanitär allgemein', 'normal',
  'Möchten die Armaturen im Bad und der Küche ersetzen lassen. Beratung vor Ort gewünscht.',
  'scheduled', now() + interval '1 day',
  now() - interval '4 days'
);

-- FS-0007: Heizung, dringend, contacted (3 days ago)
INSERT INTO cases (id, tenant_id, source, reporter_name, contact_phone, plz, city, category, urgency, description, status, created_at)
VALUES (
  'd1000000-0000-0000-0000-000000000007',
  'd0000000-0000-0000-0000-000000000001',
  'voice', 'Reto Müller', '+41793334455',
  '8820', 'Wädenswil',
  'Heizung', 'dringend',
  'Heizkörper im Wohnzimmer wird nicht warm, Rest der Wohnung funktioniert. Entlüften hat nicht geholfen.',
  'contacted',
  now() - interval '3 days'
);

-- FS-0008: Verstopfung, normal, contacted (2 days ago)
INSERT INTO cases (id, tenant_id, source, reporter_name, contact_phone, contact_email, street, house_number, plz, city, category, urgency, description, status, created_at)
VALUES (
  'd1000000-0000-0000-0000-000000000008',
  'd0000000-0000-0000-0000-000000000001',
  'wizard', 'Lisa Gut', '+41764445566', 'lisa.gut@example.ch',
  'Rainstrasse', '14', '8942', 'Oberrieden',
  'Verstopfung', 'normal',
  'WC im EG verstopft. Pömpel funktioniert nicht. Bitte um baldigen Termin.',
  'contacted',
  now() - interval '2 days'
);

-- FS-0009: Boiler, dringend, new (yesterday, voice)
INSERT INTO cases (id, tenant_id, source, reporter_name, contact_phone, plz, city, category, urgency, description, status, created_at)
VALUES (
  'd1000000-0000-0000-0000-000000000009',
  'd0000000-0000-0000-0000-000000000001',
  'voice', 'Hans Widmer', '+41797778899',
  '8802', 'Kilchberg',
  'Boiler', 'dringend',
  'Kein Warmwasser seit heute Morgen. Familie mit kleinen Kindern. Bitte um schnelle Hilfe.',
  'new',
  now() - interval '1 day'
);

-- FS-0010: Rohrbruch, notfall, new (today, voice)
INSERT INTO cases (id, tenant_id, source, reporter_name, contact_phone, plz, city, category, urgency, description, status, created_at)
VALUES (
  'd1000000-0000-0000-0000-000000000010',
  'd0000000-0000-0000-0000-000000000001',
  'voice', 'Ursula Schmid', '+41768889900',
  '8800', 'Thalwil',
  'Rohrbruch', 'notfall',
  'Wasserfleck an der Decke im 1. OG wird grösser. Tropft bereits durch. Kommen Sie bitte sofort!',
  'new',
  now() - interval '2 hours'
);

-- ============================================================
-- Case Events (realistic timeline for each case)
-- ============================================================

-- FS-0001: Verstopfung → done + review_sent
INSERT INTO case_events (case_id, event_type, title, created_at) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'case_created', 'Fall erstellt via Website-Formular', now() - interval '12 days'),
  ('d1000000-0000-0000-0000-000000000001', 'email_notification_sent', 'Benachrichtigung an Betrieb gesendet', now() - interval '12 days' + interval '1 minute'),
  ('d1000000-0000-0000-0000-000000000001', 'reporter_confirmation_sent', 'Bestätigung an Melder gesendet', now() - interval '12 days' + interval '1 minute'),
  ('d1000000-0000-0000-0000-000000000001', 'status_changed', 'Status → Kontaktiert', now() - interval '12 days' + interval '2 hours'),
  ('d1000000-0000-0000-0000-000000000001', 'status_changed', 'Status → Geplant', now() - interval '11 days'),
  ('d1000000-0000-0000-0000-000000000001', 'appointment_sent', 'Terminbestätigung gesendet', now() - interval '11 days' + interval '5 minutes'),
  ('d1000000-0000-0000-0000-000000000001', 'status_changed', 'Status → Erledigt', now() - interval '11 days' + interval '4 hours'),
  ('d1000000-0000-0000-0000-000000000001', 'review_request_sent', 'Bewertungsanfrage gesendet', now() - interval '10 days');

-- FS-0002: Heizung → done
INSERT INTO case_events (case_id, event_type, title, created_at) VALUES
  ('d1000000-0000-0000-0000-000000000002', 'case_created', 'Fall erstellt via Voice Agent', now() - interval '10 days'),
  ('d1000000-0000-0000-0000-000000000002', 'email_notification_sent', 'Benachrichtigung an Betrieb gesendet', now() - interval '10 days' + interval '1 minute'),
  ('d1000000-0000-0000-0000-000000000002', 'status_changed', 'Status → Kontaktiert', now() - interval '10 days' + interval '30 minutes'),
  ('d1000000-0000-0000-0000-000000000002', 'status_changed', 'Status → Geplant', now() - interval '9 days'),
  ('d1000000-0000-0000-0000-000000000002', 'appointment_sent', 'Terminbestätigung gesendet', now() - interval '9 days' + interval '5 minutes'),
  ('d1000000-0000-0000-0000-000000000002', 'status_changed', 'Status → Erledigt', now() - interval '9 days' + interval '6 hours');

-- FS-0003: Rohrbruch Notfall → done
INSERT INTO case_events (case_id, event_type, title, created_at) VALUES
  ('d1000000-0000-0000-0000-000000000003', 'case_created', 'Fall erstellt via Voice Agent', now() - interval '8 days'),
  ('d1000000-0000-0000-0000-000000000003', 'email_notification_sent', 'Benachrichtigung an Betrieb gesendet', now() - interval '8 days' + interval '30 seconds'),
  ('d1000000-0000-0000-0000-000000000003', 'status_changed', 'Status → Kontaktiert', now() - interval '8 days' + interval '5 minutes'),
  ('d1000000-0000-0000-0000-000000000003', 'status_changed', 'Status → Erledigt', now() - interval '8 days' + interval '3 hours');

-- FS-0004: Boiler → done + review_sent
INSERT INTO case_events (case_id, event_type, title, created_at) VALUES
  ('d1000000-0000-0000-0000-000000000004', 'case_created', 'Fall erstellt via Website-Formular', now() - interval '7 days'),
  ('d1000000-0000-0000-0000-000000000004', 'email_notification_sent', 'Benachrichtigung an Betrieb gesendet', now() - interval '7 days' + interval '1 minute'),
  ('d1000000-0000-0000-0000-000000000004', 'reporter_confirmation_sent', 'Bestätigung an Melder gesendet', now() - interval '7 days' + interval '1 minute'),
  ('d1000000-0000-0000-0000-000000000004', 'status_changed', 'Status → Kontaktiert', now() - interval '7 days' + interval '1 hour'),
  ('d1000000-0000-0000-0000-000000000004', 'status_changed', 'Status → Geplant', now() - interval '6 days'),
  ('d1000000-0000-0000-0000-000000000004', 'status_changed', 'Status → Erledigt', now() - interval '6 days' + interval '5 hours'),
  ('d1000000-0000-0000-0000-000000000004', 'review_request_sent', 'Bewertungsanfrage gesendet', now() - interval '5 days');

-- FS-0005: Leck → done
INSERT INTO case_events (case_id, event_type, title, created_at) VALUES
  ('d1000000-0000-0000-0000-000000000005', 'case_created', 'Fall erstellt via Voice Agent', now() - interval '6 days'),
  ('d1000000-0000-0000-0000-000000000005', 'email_notification_sent', 'Benachrichtigung an Betrieb gesendet', now() - interval '6 days' + interval '1 minute'),
  ('d1000000-0000-0000-0000-000000000005', 'status_changed', 'Status → Kontaktiert', now() - interval '6 days' + interval '45 minutes'),
  ('d1000000-0000-0000-0000-000000000005', 'status_changed', 'Status → Geplant', now() - interval '5 days'),
  ('d1000000-0000-0000-0000-000000000005', 'status_changed', 'Status → Erledigt', now() - interval '5 days' + interval '3 hours');

-- FS-0006: Sanitär → scheduled (Termin morgen)
INSERT INTO case_events (case_id, event_type, title, created_at) VALUES
  ('d1000000-0000-0000-0000-000000000006', 'case_created', 'Fall erstellt via Website-Formular', now() - interval '4 days'),
  ('d1000000-0000-0000-0000-000000000006', 'email_notification_sent', 'Benachrichtigung an Betrieb gesendet', now() - interval '4 days' + interval '1 minute'),
  ('d1000000-0000-0000-0000-000000000006', 'reporter_confirmation_sent', 'Bestätigung an Melder gesendet', now() - interval '4 days' + interval '1 minute'),
  ('d1000000-0000-0000-0000-000000000006', 'status_changed', 'Status → Kontaktiert', now() - interval '4 days' + interval '3 hours'),
  ('d1000000-0000-0000-0000-000000000006', 'status_changed', 'Status → Geplant', now() - interval '3 days'),
  ('d1000000-0000-0000-0000-000000000006', 'appointment_sent', 'Terminbestätigung gesendet', now() - interval '3 days' + interval '5 minutes');

-- FS-0007: Heizung → contacted
INSERT INTO case_events (case_id, event_type, title, created_at) VALUES
  ('d1000000-0000-0000-0000-000000000007', 'case_created', 'Fall erstellt via Voice Agent', now() - interval '3 days'),
  ('d1000000-0000-0000-0000-000000000007', 'email_notification_sent', 'Benachrichtigung an Betrieb gesendet', now() - interval '3 days' + interval '1 minute'),
  ('d1000000-0000-0000-0000-000000000007', 'status_changed', 'Status → Kontaktiert', now() - interval '3 days' + interval '2 hours');

-- FS-0008: Verstopfung → contacted
INSERT INTO case_events (case_id, event_type, title, created_at) VALUES
  ('d1000000-0000-0000-0000-000000000008', 'case_created', 'Fall erstellt via Website-Formular', now() - interval '2 days'),
  ('d1000000-0000-0000-0000-000000000008', 'email_notification_sent', 'Benachrichtigung an Betrieb gesendet', now() - interval '2 days' + interval '1 minute'),
  ('d1000000-0000-0000-0000-000000000008', 'reporter_confirmation_sent', 'Bestätigung an Melder gesendet', now() - interval '2 days' + interval '1 minute'),
  ('d1000000-0000-0000-0000-000000000008', 'status_changed', 'Status → Kontaktiert', now() - interval '2 days' + interval '1 hour');

-- FS-0009: Boiler → new (yesterday)
INSERT INTO case_events (case_id, event_type, title, created_at) VALUES
  ('d1000000-0000-0000-0000-000000000009', 'case_created', 'Fall erstellt via Voice Agent', now() - interval '1 day'),
  ('d1000000-0000-0000-0000-000000000009', 'email_notification_sent', 'Benachrichtigung an Betrieb gesendet', now() - interval '1 day' + interval '1 minute');

-- FS-0010: Rohrbruch Notfall → new (today)
INSERT INTO case_events (case_id, event_type, title, created_at) VALUES
  ('d1000000-0000-0000-0000-000000000010', 'case_created', 'Fall erstellt via Voice Agent', now() - interval '2 hours'),
  ('d1000000-0000-0000-0000-000000000010', 'email_notification_sent', 'Benachrichtigung an Betrieb gesendet', now() - interval '2 hours' + interval '30 seconds');
