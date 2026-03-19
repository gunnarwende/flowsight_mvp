# Founder-Anleitung: Kalender-Integration (Outlook + Google)

> Status: OFFEN — Founder-Aktion nötig vor Umsetzung Phase 2

## Warum?

Die Termin-Kollisions-Warnung (Phase 2) braucht Zugriff auf externe Kalender von Mitarbeitern. Phase 1 (interne DB-Prüfung) funktioniert ohne externen Zugriff. Für Outlook/Google OAuth braucht Claude eine App-Registrierung, die nur der Founder anlegen kann.

---

## 1. Microsoft Outlook (Azure App Registration)

### Was du tun musst:
1. Gehe zu [Azure Portal → App registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Klicke **"New registration"**
3. Name: `FlowSight Kalender`
4. Supported account types: **"Accounts in any organizational directory + personal Microsoft accounts"**
5. Redirect URI: `https://flowsight-mvp.vercel.app/api/auth/outlook/callback` (Web)
6. Klicke **Register**
7. Kopiere:
   - **Application (client) ID** → wird `OUTLOOK_CLIENT_ID`
   - **Directory (tenant) ID** → wird `OUTLOOK_TENANT_ID`
8. Gehe zu **Certificates & secrets** → **New client secret**
   - Description: `FlowSight Production`
   - Expires: 24 months
   - Kopiere den **Value** (nur einmal sichtbar!) → wird `OUTLOOK_CLIENT_SECRET`
9. Gehe zu **API permissions** → **Add a permission** → **Microsoft Graph** → **Delegated permissions**:
   - `Calendars.Read` (FreeBusy lesen)
   - `User.Read` (Profil)
10. Klicke **"Grant admin consent"** (grüner Haken erscheint)

### Was du mir gibst:
```
OUTLOOK_CLIENT_ID=...
OUTLOOK_CLIENT_SECRET=...
OUTLOOK_TENANT_ID=...
```
→ Diese setze ich als Vercel Env Vars (Secrets — nie im Code).

---

## 2. Google Calendar (Google Cloud Console)

### Was du tun musst:
1. Gehe zu [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Wähle dein Projekt (oder erstelle eins: "FlowSight")
3. **Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `FlowSight Kalender`
   - Authorized redirect URIs: `https://flowsight-mvp.vercel.app/api/auth/google/callback`
4. Kopiere **Client ID** + **Client Secret**
5. Gehe zu **Library** → aktiviere **Google Calendar API**
6. Unter **OAuth consent screen**: Füge `Calendars.readonly` Scope hinzu

### Was du mir gibst:
```
GOOGLE_CALENDAR_CLIENT_ID=...
GOOGLE_CALENDAR_CLIENT_SECRET=...
```

---

## 3. Google Places API (für automatischen Review-Abgleich, Phase 2)

### Was du tun musst:
1. In der gleichen Google Cloud Console
2. **Library** → aktiviere **Places API (New)**
3. **Credentials** → **Create Credentials → API key**
4. Beschränke den Key auf **Places API (New)** only
5. Kopiere den API Key

### Was du mir gibst:
```
GOOGLE_PLACES_API_KEY=...
```

---

## Wann brauche ich das?

- **Phase 1 (jetzt aktiv):** Interne Termin-Prüfung gegen `appointments` + `cases.scheduled_at` — braucht KEINE externen Keys
- **Phase 2 (nach Kern-Umbau):** Outlook/Google FreeBusy-Abgleich — braucht die Keys oben
- **Google Places:** Erst wenn automatischer Review-Abgleich gewünscht ist

## Zeitaufwand für dich

~15 Minuten pro Provider (Azure / Google Console). Danach übernehme ich alles.
