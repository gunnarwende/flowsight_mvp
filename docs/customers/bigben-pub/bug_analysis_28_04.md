# BigBen Pub — Bug-Analyse 28.04.2026 (vor Live-Termin morgen)

## Bug 1 — Voice Datum-Bug ⚡ CRITICAL

**User-Befund:** Test-Call `call_53e7b50c8ca86706ee1ee498fdd`. Reservierung für morgen (29.04). Lisa sagt "18. April".

**Root Cause:** `retell/exports/bigben-pub_agent.json` hat **statische Events-Liste mit hardcoded Daten** (15 Apr - 03 May). Lisa hat KEINE Kenntnis vom heutigen Datum — keine `{{today_date}}`-Variable im Prompt.

```
EVENTS (hardcoded):
- Fri 18 Apr, 20:00: Karaoke Night  ← Lisa pickt das vermutlich als "morgen"
- Wed 23 Apr, 20:00: Quiz Night
- Fri 25 Apr, 20:00: Karaoke Night
- Sat 26 Apr, 21:00: Live Music
- Wed 30 Apr, 20:00: Quiz Night
- Fri 02 May, 20:00: Karaoke Night
```

Plus die GANZE Liste hat Daten aus April mit längst vergangenen Events (15-26 Apr).

**Fix-Pfad:**

### Option A — Tagesfrisches Update (manuell, vor jedem Tag)
1. `retell/exports/bigben-pub_agent.json` editieren
2. Events-Liste auf future-only filtern (heute + nächste 14 Tage)
3. **Today's Date prominent im Prompt:** `Today is {DATE}.` als erste Zeile nach Persona
4. `node scripts/_ops/retell_sync.mjs --slug bigben-pub` → Republish

### Option B — Daily Cron-Refresh (automatisch)
- GitHub Actions Workflow `bigben-voice-refresh.yml`, läuft täglich 06:00 UTC
- Liest aktuelle pub_events aus DB, generiert Events-Liste, setzt today's date
- Publisht via Retell-API

**Empfehlung für morgen:** Option A heute manuell, Option B nächste Woche bauen.

**Konkreter Prompt-Edit:**
```diff
+ Today is Tuesday, 29 April 2026.
+ This is the date you must use when callers ask about "today", "tomorrow", or "this week".
+
  PERSONA
  - Your name is not important...
```

Plus Events-Liste filtern (alles ab 29.04. behalten, alles davor löschen).

---

## Bug 2 — Reservierung kommt nicht in App ⚡ CRITICAL

**User-Befund:** Test-Anruf gemacht, Reservierung getätigt — landet nicht in der App. App-Refresh bringt nichts.

**Architektur-Kontext (per status.md):**
- Retell `webhook_url` feuert nicht zuverlässig für BigBen → **Polling-Workaround** via `/api/retell/sync-calls`
- Polling-Endpoint sollte completed calls ziehen + Reservation-Records erstellen

**Vermutete Root Causes (Reihenfolge nach Wahrscheinlichkeit):**

### Hypothese 1: Polling-Cron läuft nicht / nicht oft genug
- Cron `lifecycle-tick.yml` läuft täglich 07:00 UTC — DAS REICHT NICHT für Live-Reservierungen
- Live braucht Polling alle 1-5 Minuten

### Hypothese 2: Sync-Calls API findet Call nicht
- Retell-API filtert nach Agent-ID
- Falls Pollings-Filter nicht den BigBen-Agent matched → keine Reservierungs-Erstellung

### Hypothese 3: Reservation-Schema-Validation schlägt fehl
- Voice-PCA extrahiert guest_name, party_size, time, date
- Falls eines fehlt → Insert schlägt fehl → kein Eintrag

### Hypothese 4: Tenant-Routing stimmt nicht
- API erstellt Reservation aber mit falschem tenant_id
- App zeigt nur eigene tenant-Reservations → leer für BigBen

**Debug-Schritte (vor morgen):**

```bash
# 1. Manuell sync-calls triggern
curl -X POST https://flowsight.ch/api/retell/sync-calls \
  -H "Authorization: Bearer $LIFECYCLE_TICK_SECRET"

# 2. DB-Check: existiert Call-Record?
SELECT * FROM call_records WHERE call_id = 'call_53e7b50c8ca86706ee1ee498fdd';

# 3. DB-Check: existiert Reservation?
SELECT * FROM pub_reservations 
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'bigben-pub')
ORDER BY created_at DESC LIMIT 5;

# 4. Retell-API direkt: Call-Daten abrufen
# Per Retell Dashboard: Call ID inspizieren, PCA-Felder prüfen
```

**Fix-Pfad:**
1. Polling-Cron auf 1-5 Min Intervall erhöhen (für BigBen)
2. Sync-Calls-Logging erweitern (welcher Call, warum kein Reservation-Insert)
3. Worst-Case für morgen: SMS an Founder als Fallback bei jedem Voice-Call (separate Trigger)

---

## Bug 3 — App-Aktualisieren bringt nichts

**User-Befund:** PWA-Refresh bringt keine neuen Daten.

**Vermutete Root Causes:**

### Hypothese A: Service-Worker-Cache stale
- PWA cached aggressiv für Offline-Fähigkeit
- Reservations-API-Response wird gecached → alte Daten

### Hypothese B: Auto-Refresh-Polling auf 30s, aber DB selbst hat keine neuen Daten
- Wenn Bug 2 (Reservierung kommt nicht in DB) → App refresht korrekt, sieht nur leere DB
- Hängt von Bug 2 ab

**Debug-Schritte:**
1. **DevTools → Application → Service Workers** — manuell unregister + reload
2. **DevTools → Network → "/api/ops/reservations"** — was returnt der Endpoint?
3. **DB-Direct-Check** (siehe Bug 2)

**Fix-Pfad (für morgen):**
- Service-Worker `Cache-Control: no-cache` für Reservations-API einstellen
- PWA-Auto-Refresh-Intervall reduzieren auf 15s für reservation-relevante Pages
- Manueller "Refresh-Button" prominent in App

---

## Bug 4 — FB21 Tenant-Switcher routet falsch

**User-Befund:** Founder wählt "Big Ben Pub" im Dropdown → sieht Sanitär-Leitsystem (Fälle/Wizard) statt Pub-App (6 Cards).

**Code-Analyse:**
- `src/web/src/components/ops/OpsShell.tsx` hat `isPubTenant` flag
- Brand-Header-Link routet richtig: `/ops/pub-dashboard` für Pub, `/ops/cases` für Sanitär
- ABER: Tenant-Switcher (`/api/ops/switch-tenant`) macht nach Cookie-Switch nur einen `router.push("/ops/cases")` (default)

**Fix-Pfad:**
1. Switch-Tenant-API erweitern: nach Cookie-Set Modul-Type-Lookup → redirect auf passende Landing-Page
2. ODER: Client-Component nach switch-tenant cookies setzen → `router.push(isPubTenant ? "/ops/pub-dashboard" : "/ops/cases")`

```typescript
// Pseudo-code für Fix
async function switchTenant(slug) {
  await fetch('/api/ops/switch-tenant', { method: 'POST', body: { slug } });
  const tenantInfo = await fetch(`/api/ops/tenant-info?slug=${slug}`).then(r => r.json());
  const dest = tenantInfo.is_pub ? '/ops/pub-dashboard' : '/ops/cases';
  router.push(dest);
}
```

---

## Priorität für morgen früh (vor Termin)

| Bug | Priorität | Aufwand | Status |
|-----|-----------|---------|--------|
| Bug 1 Voice Datum | 🔥 P0 | 30 Min | OFFEN (manueller Prompt-Update + retell_sync) |
| Bug 2 Reservierung-Sync | 🔥 P0 | 60-120 Min | OFFEN (Debug-Phase) |
| Bug 3 App-Refresh | 🟡 P1 | 30-60 Min | hängt an Bug 2 |
| Bug 4 Tenant-Switcher | 🟡 P1 | 30 Min | OFFEN (Code-Fix) |

**Bug 1 + 2 sind Live-Blocker. Müssen vor 29.04. nachmittag gefixt sein.**
