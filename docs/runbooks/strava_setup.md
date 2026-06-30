# Runbook: Strava-Anbindung für „Leben → Running" (Garmin-Auto-Import)

> Ziel: Jeder Lauf von der Garmin-Uhr landet **automatisch** in der CEO-App
> (`/ceo/leben`, Tab Running) — ohne Abtippen, ohne Screenshots.
> Weg: **Garmin → (Auto-Sync) → Strava → Webhook → FlowSight**.

## Warum diese Brücke
Garmin gibt Web-Apps keinen einfachen Zugriff. Strava hat dagegen eine offene,
offizielle API mit **Webhook** (Strava ruft uns bei jeder neuen Aktivität von
selbst an). OAuth statt Passwort → wir speichern **kein Garmin-Passwort**.

## Einmalige Einrichtung (Founder, ~10 Min)

1. **Strava-Konto** anlegen (kostenlos), falls noch keins da: strava.com.
2. **Garmin → Strava Auto-Sync:** Garmin Connect App → Einstellungen →
   Verbundene Apps / Partner-Apps → **Strava** → verbinden. Ab jetzt synct jede
   Garmin-Aktivität automatisch in Strava (inkl. Fussball; Tischtennis wird bewusst
   nicht als Running gewertet).
3. **Strava-API-Anwendung:** strava.com/settings/api → Anwendung erstellen.
   - **Authorization Callback Domain:** die App-Domain (z. B. `flowsight.ch`).
   - Notiere **Client ID** + **Client Secret**.
4. **Vercel-Env setzen** (Production):
   - `STRAVA_CLIENT_ID` = Client ID
   - `STRAVA_CLIENT_SECRET` = Client Secret
   - `STRAVA_WEBHOOK_VERIFY_TOKEN` = beliebiger String (z. B. `flowsight-leben`)
   - danach **redeploy** (Env greift erst nach Deploy).
5. **DB-Migration anwenden:** `supabase/migrations/20260630120000_life_running.sql`
   (über den db-migrate-Workflow / Management-API, wie bei anderen Migrationen).

## Scharfschalten (in der App)

1. `/ceo/leben` → Tab **Running** → **„Mit Strava verbinden"** → Strava-Freigabe
   bestätigen (Scope: Profil + alle Aktivitäten lesen). Es werden sofort die
   letzten ~30 Aktivitäten geladen.
2. **„Auto-Import aktivieren"** antippen → legt die Strava-Webhook-Subscription an.
   Ab jetzt erscheint jeder neue Lauf **automatisch**, ohne Zutun.
   - Funktioniert nur mit öffentlich erreichbarer URL (Produktion), nicht localhost.
3. **„Aktualisieren"** = manueller Nachzug (holt die letzten ~50 Aktivitäten),
   falls mal ein Webhook verpasst wurde.

## Verifikation
- `GET /api/ceo/leben/strava/status` → `{ configured, connected, webhookActive }`
  sollte alle drei `true` zeigen.
- `GET /api/ceo/leben/strava/subscribe` → listet die aktive Webhook-Subscription.
- Test: kurze Aktivität auf der Uhr → nach Garmin-Sync sollte sie binnen ~1 Min
  in der Running-Liste auftauchen.

## Endpunkte (Referenz)
| Route | Zweck |
|---|---|
| `GET /api/ceo/leben/strava/connect` | OAuth-Start (Redirect zu Strava) |
| `GET /api/ceo/leben/strava/callback` | OAuth-Rückkehr, Token speichern + Backfill |
| `GET/POST/DELETE /api/ceo/leben/strava/subscribe` | Webhook-Subscription verwalten |
| `GET/POST /api/ceo/leben/strava/webhook` | Strava-Validierung (GET) + Events (POST) |
| `POST /api/ceo/leben/strava/sync` | Manueller Backfill |
| `GET /api/ceo/leben/strava/status` | Verbindungs-Status für die UI |
| `GET /api/ceo/leben/running` | Aktivitäten + Wochenstatistik + Countdown |

## Wettkampf-Datum
Default = 2026-09-12 (Jungfrau-Marathon). Überschreibbar per Env
`LIFE_JUNGFRAU_DATE` oder in-app via `life_settings`-Key `race`
(`{ "date": "2026-09-12", "name": "Jungfrau-Marathon" }`).
**TODO Founder:** exaktes Renndatum bestätigen.
