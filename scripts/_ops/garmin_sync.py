#!/usr/bin/env python3
"""
garmin_sync.py — Garmin Connect -> Supabase (life_activities).

Zwei Modi:
  --login   Einmal-Anmeldung: meldet sich mit GARMIN_EMAIL/GARMIN_PASSWORD
            (+ optional GARMIN_MFA) via garth an, speichert das resultierende,
            widerrufbare Token in life_settings.garmin_token (KEIN Passwort
            wird gespeichert) und macht einen ersten Abruf.
  (default) Abruf: laedt das Token aus life_settings, holt die letzten N
            Aktivitaeten aus Garmin Connect und upsertet sie in life_activities.

Laeuft in GitHub Actions (voller Key-Zugriff). Die App stoesst nur an.

Env:
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (Pflicht)
  GARMIN_EMAIL, GARMIN_PASSWORD, GARMIN_MFA (nur --login)
  LIMIT                                      (optional, Default 30)
"""
import os
import sys
import json
import datetime as dt

import garth
import requests

SUPABASE_URL = (os.environ.get("SUPABASE_URL") or "").rstrip("/")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
LIMIT = int(os.environ.get("LIMIT") or "30")

if not SUPABASE_URL or not SERVICE_KEY:
    print("✗ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen", file=sys.stderr)
    sys.exit(1)

REST = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}


def setting_get(key):
    r = requests.get(f"{REST}/life_settings", headers=HEADERS,
                     params={"key": f"eq.{key}", "select": "value"}, timeout=30)
    r.raise_for_status()
    rows = r.json()
    return rows[0]["value"] if rows else None


def setting_set(key, value):
    body = [{"key": key, "value": value, "updated_at": dt.datetime.now(dt.timezone.utc).isoformat()}]
    r = requests.post(f"{REST}/life_settings", headers={**HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal"},
                      params={"on_conflict": "key"}, data=json.dumps(body), timeout=30)
    r.raise_for_status()


def _iso_utc(s):
    """'2024-09-01 05:30:00' (GMT, naiv) -> ISO mit Z."""
    if not s:
        return None
    return s.strip().replace(" ", "T") + "Z"


def _local_as_utc(s):
    """startTimeLocal als Wand-Uhr beibehalten (wird in der UI mit tz=UTC gerendert)."""
    if not s:
        return None
    return s.strip().replace(" ", "T") + "Z"


def map_activity(a):
    at = a.get("activityType") or {}
    return {
        "source": "garmin",
        "external_id": str(a.get("activityId")),
        "sport_type": at.get("typeKey"),
        "name": a.get("activityName"),
        "start_time": _iso_utc(a.get("startTimeGMT")),
        "start_time_local": _local_as_utc(a.get("startTimeLocal")),
        "distance_m": a.get("distance"),
        "moving_time_s": int(a["movingDuration"]) if a.get("movingDuration") else (int(a["duration"]) if a.get("duration") else None),
        "elapsed_time_s": int(a["duration"]) if a.get("duration") else None,
        "elevation_gain_m": a.get("elevationGain"),
        "avg_hr": a.get("averageHR"),
        "max_hr": a.get("maxHR"),
        "avg_speed_ms": a.get("averageSpeed"),
        "calories": a.get("calories"),
        "raw": a,
        "updated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
    }


def fetch_activities(limit):
    data = garth.connectapi(
        "/activitylist-service/activities/search/activities",
        params={"start": 0, "limit": limit},
    )
    return data or []


def upsert_activities(acts):
    if not acts:
        return 0
    rows = [map_activity(a) for a in acts if a.get("activityId")]
    if not rows:
        return 0
    r = requests.post(
        f"{REST}/life_activities",
        headers={**HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal"},
        params={"on_conflict": "source,external_id"},
        data=json.dumps(rows),
        timeout=60,
    )
    r.raise_for_status()
    return len(rows)


def do_login():
    email = os.environ.get("GARMIN_EMAIL")
    password = os.environ.get("GARMIN_PASSWORD")
    mfa = (os.environ.get("GARMIN_MFA") or "").strip()
    if not email or not password:
        print("✗ GARMIN_EMAIL / GARMIN_PASSWORD fehlen", file=sys.stderr)
        sys.exit(1)
    try:
        if mfa:
            garth.login(email, password, prompt_mfa=lambda: mfa)
        else:
            garth.login(email, password)
    except Exception as e:  # noqa: BLE001
        print(f"✗ Garmin-Login fehlgeschlagen: {e}", file=sys.stderr)
        sys.exit(2)
    token = garth.client.dumps()
    setting_set("garmin_token", {"token": token})
    print("✓ Token gespeichert")
    # Erst-Backfill
    acts = fetch_activities(LIMIT)
    n = upsert_activities(acts)
    setting_set("garmin_last_sync", {"at": dt.datetime.now(dt.timezone.utc).isoformat(), "count": n})
    print(f"✓ Erst-Abruf: {n} Aktivitaeten")


def do_sync():
    saved = setting_get("garmin_token")
    if not saved or not saved.get("token"):
        print("✗ Kein Garmin-Token hinterlegt — erst verbinden (--login)", file=sys.stderr)
        sys.exit(3)
    try:
        garth.client.loads(saved["token"])
    except Exception as e:  # noqa: BLE001
        print(f"✗ Token ungueltig/abgelaufen: {e}", file=sys.stderr)
        sys.exit(4)
    acts = fetch_activities(LIMIT)
    n = upsert_activities(acts)
    setting_set("garmin_last_sync", {"at": dt.datetime.now(dt.timezone.utc).isoformat(), "count": n})
    print(f"✓ Abruf: {n} Aktivitaeten")


if __name__ == "__main__":
    if "--login" in sys.argv:
        do_login()
    else:
        do_sync()
