# Runbook: Strava-Anbindung für „Leben → Running" (Garmin → Strava → Webhook)

> Ziel: Jeder Lauf von der Garmin-Uhr landet **automatisch** in der CEO-App
> (`/ceo/leben`, Tab Running) — ohne Abtippen, ohne Screenshots.
> Weg: **Garmin → (Auto-Sync) → Strava → Webhook → FlowSight**.

## Warum dieser Weg (statt Garmin-direkt)
Der direkte Garmin-Zugriff (garth) ist gescheitert: Garmin **drosselt/blockt den
Login mit 429** (auch von privaten IPs) und die `garth`-Bibliothek ist offiziell
eingestellt. Strava hat dagegen eine **offizielle, stabile API mit Webhook** —
Garmin synct automatisch zu Strava, Strava ruft uns bei jeder neuen Aktivität an.
OAuth statt Passwort → **kein Garmin-Passwort** wird gespeichert.

## Einmalige Einrichtung (Founder, ~10 Min)
1. **Garmin → Strava Auto-Sync:** Garmin Connect App → Einstellungen → Verbundene
   Apps → **Strava** → verbinden. Ab jetzt synct jede Garmin-Aktivität automatisch
   in Strava (inkl. Fussball; Tischtennis zählt nicht als Lauf).
2. **Strava-Mitgliedschaft starten** (Gratis-Probemonat) — die Strava-API ist nur
   für Mitglieder verfügbar. (Danach ~CHF 75/Jahr oder kündbar.)
3. **Strava-API-Anwendung:** strava.com/settings/api → Anwendung erstellen.
   - **Authorization Callback Domain:** App-Domain, z. B. `flowsight.ch` (nur Domain,
     ohne `https://`, ohne Pfad).
   - **Client ID** + **Client Secret** notieren.
4. **Vercel-Env setzen** (Production):
   - `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`,
   - `STRAVA_WEBHOOK_VERIFY_TOKEN` (beliebiger String, z. B. `flowsight-leben`)
   - danach **redeploy**.
   (Migration `20260630120000_life_running.sql` ist bereits angewandt — life_activities
   + life_settings stehen; das Strava-Token liegt in life_settings.strava_token.)

## Scharfschalten (in der App)
1. `/ceo/leben` → Tab **Running** → **„Mit Strava verbinden"** → Strava-Freigabe
   bestätigen (Scope: Profil + alle Aktivitäten lesen). Lädt sofort die letzten ~30.
2. **„Auto-Import aktivieren"** → legt die Strava-Webhook-Subscription an. Ab dann
   erscheint jeder neue Lauf automatisch. (Braucht öffentliche URL = Produktion.)
3. **„Aktualisieren"** = manueller Nachzug (letzte ~30 Aktivitäten).

## Verifikation
- `GET /api/ceo/leben/strava/status` → `{ configured, connected, webhookActive }` alle true.
- `GET /api/ceo/leben/strava/subscribe` → listet die aktive Webhook-Subscription.
- Test: kurze Aktivität auf der Uhr → nach Garmin→Strava-Sync binnen ~1 Min in der
  Running-Liste.

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
Default = 2026-09-05 (Jungfrau-Marathon). Überschreibbar per Env
`LIFE_JUNGFRAU_DATE` oder in-app via `life_settings`-Key `race`.
