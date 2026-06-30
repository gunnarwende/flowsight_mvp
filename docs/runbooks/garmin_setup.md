# Runbook: Garmin-Anbindung für „Leben → Running" (Direkt-Import, kostenlos)

> Ziel: Jeder Lauf von der Garmin-Uhr landet **automatisch** in der CEO-App
> (`/ceo/leben`, Tab Running) — ohne Abtippen, ohne Screenshots, **ohne Strava
> und ohne Gebühr**.

## Warum dieser Weg
Strava hat den API-Zugang 2025 hinter eine bezahlte Mitgliedschaft gelegt.
Darum holen wir die Läufe **direkt aus Garmin Connect** — über die bewährte
`garth`-Bibliothek, ausgeführt in einem GitHub-Actions-Cron (selbe „Handy fasst
keinen Key an"-Mechanik wie die anderen Cockpit-Workflows). Garmin hat keinen
Push für Privatkonten → wir **rufen alle 30 Min ab** + „Aktualisieren"-Knopf für
sofort.

## Architektur
```
Garmin Connect  ──garth──►  GitHub Actions (garmin-sync.yml, alle 30 Min)
                                    │  upsert
                                    ▼
                            Supabase life_activities ──►  /ceo/leben (Running)
App-Knopf „Aktualisieren" ─► /api/ceo/leben/garmin/sync ─► workflow_dispatch
App-Login (einmalig)       ─► /api/ceo/leben/garmin/connect ─► garmin-auth.yml
```

## Sicherheit
- **Kein Garmin-Passwort wird dauerhaft gespeichert.** Beim einmaligen Login
  tauscht `garth` das Passwort gegen ein **widerrufbares Token** (gültig ~1 Jahr),
  das in `life_settings.garmin_token` liegt. Der Cron nutzt nur dieses Token.
- Das Passwort wird transient an den `garmin-auth.yml`-Workflow gereicht
  (in den Logs maskiert). Es erscheint einmalig in der dispatch-Run-Übersicht des
  **privaten** Repos; bei Bedarf danach rotieren.
- Token jederzeit widerrufbar: in der App „trennen" (DELETE) oder in den
  Garmin-Connect-Kontoeinstellungen.

## Voraussetzungen (einmalig)
1. **Migration anwenden:** `supabase/migrations/20260630120000_life_running.sql`
   (db-migrate-Workflow / Management-API).
2. **Branch nach main mergen** — der Cron (`schedule`) läuft nur auf der
   Default-Branch; ebenso muss der Dispatch-Ref die Workflows enthalten.
   (Für einen Test **vor** Merge: Vercel-Env `LIFE_WORKFLOW_REF` = Branchname.)
3. `GH_DISPATCH_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` sind bereits
   als Vercel-Env bzw. GitHub-Actions-Secrets vorhanden (mobile-parity).

## Scharfschalten (in der App)
1. `/ceo/leben` → Tab **Running** → **„Mit Garmin verbinden"**: Garmin-E-Mail +
   Passwort (+ 2-Faktor-Code, falls aktiv) eingeben → „Verbinden".
   - Startet `garmin-auth.yml`: Login → Token speichern → erster Abruf (~1–2 Min).
   - Die App lädt den Status danach automatisch nach; deine Läufe erscheinen.
2. Ab jetzt **automatisch alle 30 Min**. **„Aktualisieren"** = sofortiger Abruf.

## Verifikation
- `GET /api/ceo/leben/garmin/status` → `{ connected: true, lastSync, lastCount }`.
- GitHub → Actions → „Garmin – Läufe abrufen" zeigt grüne Läufe.
- Test: kurze Aktivität auf der Uhr → nach Garmin-Sync + spätestens 30 Min (oder
  sofort per Knopf) in der Running-Liste.

## Endpunkte / Dateien (Referenz)
| Pfad | Zweck |
|---|---|
| `POST /api/ceo/leben/garmin/connect` | Einmal-Login (dispatcht garmin-auth.yml) |
| `DELETE /api/ceo/leben/garmin/connect` | Verbindung trennen (Token löschen) |
| `POST /api/ceo/leben/garmin/sync` | Manueller Abruf (dispatcht garmin-sync.yml) |
| `GET /api/ceo/leben/garmin/status` | Verbindungs-Status für die UI |
| `GET /api/ceo/leben/running` | Aktivitäten + Wochenstatistik + Countdown |
| `scripts/_ops/garmin_sync.py` | garth-Abruf + Supabase-Upsert (CI) |
| `.github/workflows/garmin-sync.yml` | Cron + Dispatch (Abruf) |
| `.github/workflows/garmin-auth.yml` | Einmal-Login → Token |

## Fehlerbilder
- **„not_connected"** → noch kein Token: erst „Mit Garmin verbinden".
- **Login schlägt fehl** → falsches Passwort, oder 2-Faktor aktiv ohne Code, oder
  Garmin verlangt CAPTCHA. Code eingeben bzw. erneut versuchen.
- **„Token ungültig/abgelaufen"** (nach ~1 Jahr) → einmal neu verbinden.

## Wettkampf-Datum
Default = 2026-09-05 (Jungfrau-Marathon). Überschreibbar per Env
`LIFE_JUNGFRAU_DATE` oder in-app via `life_settings`-Key `race`
(`{ "date": "2026-09-05", "name": "Jungfrau-Marathon" }`).
**TODO Founder:** exaktes Renndatum bestätigen.
