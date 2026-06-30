-- Aufräumen: doppelte Dörfler-Onboarding-Test-Sessions in cockpit_sessions.
-- Es liegen drei building-Drafts (7./8./17.6.) derselben Test-Firma „Dörfler AG".
-- Wir behalten die NEUESTE (max created_at) als einziges Beispiel und löschen die
-- älteren building-Dubletten.
--
-- Hart eingegrenzt + sicher per Konstruktion:
--   • NUR status = 'building'  → submitted/approved/live bleiben unberührt
--   • NUR Dörfler (company_name ODER slug)
--   • created_at < max(...)    → die neueste kann NIE gelöscht werden
-- Idempotent: ein erneuter Lauf löscht nichts mehr (dann gibt es nur noch eine).
delete from cockpit_sessions
where status = 'building'
  and (company_name = 'Dörfler AG' or slug = 'doerfler-ag')
  and created_at < (
    select max(created_at)
    from cockpit_sessions
    where status = 'building'
      and (company_name = 'Dörfler AG' or slug = 'doerfler-ag')
  );
