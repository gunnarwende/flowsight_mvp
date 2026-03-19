-- Update staff display_name for Founder's techniker test account
UPDATE staff
  SET display_name = 'Ramon Wende'
  WHERE email = 'gunnarwende@gmx.ch'
    AND display_name IS DISTINCT FROM 'Ramon Wende';
