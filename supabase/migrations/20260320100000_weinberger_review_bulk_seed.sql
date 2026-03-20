-- Bulk seed: 60 done cases for Weinberger with review data
-- Admin sees: ~60 angefragt, ~20 erhalten
-- Techniker (Ramon Wende): ~9 angefragt, ~2 erhalten

DO $$
DECLARE
  t_id uuid := 'fc4ba994-c99c-4c17-9fa7-6c10bd0d6fa8';
  i int;
  c_id uuid;
  c_date timestamptz;
  c_rating smallint;
  c_source text;
  c_category text;
  c_name text;
  c_phone text;
  c_plz text;
  c_city text;
  c_street text;
  c_assignee text;
  names text[] := ARRAY['Peter Meier','Hans Keller','Maria Brunner','Thomas Huber','Eva Fischer','Stefan Weber','Andrea Müller','Beat Schneider','Claudia Frei','Daniel Roth','Silvia Baumann','Kurt Zimmermann','Rita Hofer','Markus Steiner','Sandra Moser','Franz Widmer','Heidi Schmid','Rolf Berger','Nicole Gerber','Urs Bühler','Anna Bachmann','Martin Leuthold','Doris Wagner','Christian Ammann','Monika Graf','Patrick Kuster','Brigitte Suter','Roland Kägi','Renate Brun','Marcel Vogel','Christine Ott','Werner Studer','Sonja Egli','Hanspeter Kunz','Rita Hug','Ernst Meyer','Verena Koch','Bruno Lehmann','Margrit Aebischer','Josef Wyss','Barbara Aebi','Max Wirth','Ursula Pfister','Fritz Arnold','Heidi Maier','Ruedi Lanz','Susanne Kern','Alois Bader','Edith Blum','Otto Burri','Erika Frey','Heinrich Grob','Anita Hess','Karl Imhof','Lisbeth Jung','Georg Kramer','Doris Lang','Heinz Morf','Therese Näf','Walter Oser','Trudi Pfeiffer'];
  categories text[] := ARRAY['Sanitär','Heizung','Lüftung','Klima','Sanitär','Heizung','Sanitär','Sanitär','Heizung','Sanitär'];
  sources text[] := ARRAY['voice','wizard','manual','voice','voice','wizard','voice','manual','voice','wizard'];
  streets text[] := ARRAY['Bahnhofstrasse','Seestrasse','Dorfstrasse','Schulstrasse','Kirchstrasse','Alte Landstrasse','Gotthardstrasse','Florastrasse','Mühlestrasse','Rietstrasse'];
  plzs text[] := ARRAY['8800','8942','8810','8802','8803','8134','8135','8820','8805','8804'];
  cities text[] := ARRAY['Thalwil','Oberrieden','Horgen','Kilchberg','Rüschlikon','Adliswil','Langnau am Albis','Wädenswil','Richterswil','Au ZH'];
BEGIN

-- Create 60 done cases spread across YTD
FOR i IN 1..60 LOOP
  c_id := gen_random_uuid();
  -- Spread across Jan-Mar 2026
  c_date := '2026-01-05'::timestamptz + (i * interval '1.2 days') + (random() * interval '12 hours');
  c_source := sources[1 + (i % 10)];
  c_category := categories[1 + (i % 10)];
  c_name := names[1 + (i % 60)];
  c_phone := '+4179' || lpad((1000000 + floor(random() * 9000000))::text, 7, '0');
  c_plz := plzs[1 + (i % 10)];
  c_city := cities[1 + (i % 10)];
  c_street := streets[1 + (i % 10)];
  -- First 12 cases assigned to Ramon Wende (techniker view)
  IF i <= 12 THEN
    c_assignee := 'Ramon Wende';
  ELSE
    c_assignee := CASE WHEN random() < 0.3 THEN 'Ramon Wende' ELSE NULL END;
  END IF;

  INSERT INTO cases (id, tenant_id, source, reporter_name, contact_phone, plz, city, street, house_number, category, urgency, description, status, assignee_text, is_demo, created_at, updated_at)
  VALUES (
    c_id, t_id, c_source::case_source, c_name, c_phone, c_plz, c_city, c_street,
    (1 + floor(random() * 50))::text,
    c_category,
    (CASE WHEN random() < 0.1 THEN 'notfall' WHEN random() < 0.3 THEN 'dringend' ELSE 'normal' END)::case_urgency,
    'Reparatur/Service benötigt — ' || c_category,
    'done'::text,
    c_assignee,
    false,
    c_date,
    c_date + interval '2 days' + (random() * interval '3 days')
  );

  -- All 60 get review_sent_at (= angefragt)
  UPDATE cases SET
    review_sent_at = updated_at + interval '1 day',
    review_sent_count = 1
  WHERE id = c_id;

  -- First 20 get review_rating (= erhalten)
  IF i <= 20 THEN
    -- Mix: 15x 5★, 3x 4★, 1x 3★, 1x 2★
    IF i <= 15 THEN c_rating := 5;
    ELSIF i <= 18 THEN c_rating := 4;
    ELSIF i = 19 THEN c_rating := 3;
    ELSE c_rating := 2;
    END IF;

    UPDATE cases SET
      review_rating = c_rating,
      review_received_at = review_sent_at + interval '1 day' + (random() * interval '2 days')
    WHERE id = c_id;
  END IF;

  -- Add case_created event
  INSERT INTO case_events (case_id, event_type, title, created_at)
  VALUES (c_id, 'case_created', 'Fall erstellt via ' || c_source, c_date);

END LOOP;

-- Store Google review stats in tenant modules
UPDATE tenants
SET modules = COALESCE(modules, '{}'::jsonb)
  || '{"google_review_avg": 4.4, "google_review_count": 20}'::jsonb
WHERE id = t_id;

END $$;
