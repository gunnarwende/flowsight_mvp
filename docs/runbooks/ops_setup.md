# Ops Setup — Founder Handoff (Welle 5)

## 1. Supabase Auth konfigurieren

### 1a. Magic Link aktivieren
1. Supabase Dashboard → Authentication → Providers
2. "Email" Provider: **Enable Email OTP** (Magic Link) = ON
3. "Confirm Email" kann OFF bleiben (MVP: jede Adresse die Magic Link empfängt ist vertraut)

### 1b. Redirect URLs setzen
1. Supabase Dashboard → Authentication → URL Configuration
2. **Site URL:** `https://flowsight-mvp.vercel.app`
3. **Redirect URLs** (alle hinzufügen):
   - `https://flowsight-mvp.vercel.app/auth/confirm`
   - `http://localhost:3000/auth/confirm`

### 1c. Email Templates (optional)
1. Supabase Dashboard → Authentication → Email Templates
2. "Magic Link" Template: Standard reicht für MVP
3. Optional: Absendername auf "FlowSight" ändern

## 2. Vercel Env Vars setzen

Folgende Vars müssen in Vercel gesetzt werden (Production + Preview + Development):

| Variable | Wert | Quelle |
|----------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Gleicher Wert wie SUPABASE_URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Gleicher Wert wie SUPABASE_ANON_KEY | Supabase Dashboard → Settings → API |

**Wichtig:** Die `NEXT_PUBLIC_` Varianten sind für den Browser sichtbar (public). Das ist korrekt — der Anon Key ist designed für Browser-Zugriff (RLS schützt die Daten).

Lokale Entwicklung: Gleiche Werte in `src/web/.env.local` ergänzen:
```
NEXT_PUBLIC_SUPABASE_URL=<gleich wie SUPABASE_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<gleich wie SUPABASE_ANON_KEY>
```

## 3. DB Migration ausführen

Die Migration `supabase/migrations/20260220000000_ops_fields.sql` muss ausgeführt werden.

### Option A: Supabase CLI (bevorzugt)
```bash
supabase db push
```

### Option B: SQL Editor (manuell)
1. Supabase Dashboard → SQL Editor
2. Neues Query → Inhalt von `supabase/migrations/20260220000000_ops_fields.sql` einfügen
3. Execute

### Verifizieren
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'cases'
ORDER BY ordinal_position;
```

Erwartete neue Spalten: `status`, `assignee_text`, `scheduled_at`, `internal_notes`, `updated_at`.

## 4. Ops Benutzer anlegen

1. Supabase Dashboard → Authentication → Users
2. "Create new user" → E-Mail-Adresse des Ops-Benutzers eingeben
3. ODER: Der Benutzer kann sich selbst über `/ops/login` registrieren (Magic Link schickt automatisch eine Einladung)

**MVP:** Jeder authentifizierte User hat Zugang zu /ops. Kein Rollenmodell.

## 5. Test-Flow

1. Öffne `https://flowsight-mvp.vercel.app/ops`
2. Redirect → `/ops/login`
3. E-Mail eingeben → Magic Link senden
4. E-Mail prüfen → Link klicken → Redirect → `/ops/cases`
5. Cases-Liste sichtbar (offene Cases als Default)
6. Case anklicken → Detail → Status/Zuständig/Termin/Notizen ändern → Speichern
