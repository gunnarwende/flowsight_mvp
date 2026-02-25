# Onboarding: Neuer Kunde (Full Setup)

**Scope:** Voice + Wizard + Ops + Email + Review Engine
**Dauer:** ~30 Min (ohne Retell-Agent-Setup)
**Voraussetzung:** Vercel Deploy läuft, Supabase Projekt verbunden

---

## 1. Supabase: Tenant anlegen

```sql
-- 1a) Tenant erstellen
INSERT INTO tenants (id, name, slug)
VALUES (gen_random_uuid(), 'Firmenname AG', 'firmenname-ag')
RETURNING id;

-- 1b) Telefonnummer(n) zuordnen (Voice-Routing)
INSERT INTO tenant_numbers (tenant_id, phone_number)
VALUES ('<tenant_id>', '+41XXXXXXXXXX');
```

> **SKIP wenn Voice-only nicht gebraucht wird:** Schritt 1b überspringen.

## 2. Vercel Env Vars setzen

Im Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Wert | Pflicht |
|----------|------|---------|
| `FALLBACK_TENANT_ID` | `<tenant_id>` aus Schritt 1 | Ja |
| `GOOGLE_REVIEW_URL` | Google Maps Review-URL des Kunden | Für Review Engine |

> Bereits gesetzt (global): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_REPLY_TO`, `MAIL_SUBJECT_PREFIX`, `RETELL_API_KEY`.

> **SKIP wenn Wizard-only:** `RETELL_*` Vars nicht nötig. `GOOGLE_REVIEW_URL` optional.

## 3. Resend: Domain verifizieren (wenn Custom Domain)

- Resend Dashboard → Domains → Add Domain
- DNS Records setzen (SPF + DKIM)
- `MAIL_FROM` in Vercel Env anpassen (`noreply@send.kundendomain.ch`)

> **SKIP wenn Standard-Domain** (`send.flowsight.ch`) ausreicht.

## 4. Retell: Agent konfigurieren

Siehe: `docs/runbooks/retell_agent_config.md` (detaillierter Runbook).

Kurzfassung:
- Retell Dashboard → Agents → Agent erstellen
- Prompt: max 7 Fragen, sanitär-spezifisch, Bestätigungssatz am Ende
- Custom Analysis Schema: `plz`, `city`, `category`, `urgency`, `description`
- Webhook URL: `https://<vercel-domain>/api/retell/webhook`
- Events: `call_started`, `call_ended`, `call_analyzed`
- `RETELL_AGENT_ID` in Vercel Env setzen

> **SKIP wenn Voice nicht gebraucht wird:** Schritte 4 + 5 komplett überspringen.

## 5. Twilio: Nummer kaufen + SIP Trunk

- Twilio Console → Phone Numbers → Buy Number (CH +41)
- SIP Trunk erstellen → Termination URI = Retell SIP Endpoint
- Inbound Call Routing → SIP Trunk

> **SKIP wenn Voice nicht gebraucht wird.**

## 5b. Peoplefone: Brand-Nummer → Twilio Forward (optional)

Wenn der Kunde eine eigene Brand-Nummer über Peoplefone hat:

1. Peoplefone Portal → Nummer → Routing → Unconditional Forward → Twilio-Nummer (E.164)
2. `tenant_numbers` Eintrag für die Peoplefone-Nummer erstellen (siehe SQL in Schritt 1b)
3. Test-Anruf über die Brand-Nummer → Retell antwortet

> **Siehe auch:** `docs/runbooks/peoplefone_front_door.md` (detaillierter Runbook).
> **SKIP wenn keine Peoplefone-Nummer vorhanden.**

## 6. MAIL_REPLY_TO prüfen

- Vercel Env: `MAIL_REPLY_TO` = Email-Adresse wohin Case-Notifications gehen sollen
- Muss eine Adresse sein, die der Betrieb aktiv monitort

## 7. Smoke Tests

### 7a) Wizard (2 Min)
1. Öffne `https://<domain>/wizard`
2. Fülle Formular aus (mit echter Email)
3. Prüfe: Case in Supabase (`SELECT * FROM cases ORDER BY created_at DESC LIMIT 1`)
4. Prüfe: Notification-Email an MAIL_REPLY_TO angekommen
5. Prüfe: Bestätigungs-Email an Melder-Email angekommen (wenn angegeben)

### 7b) Voice (3 Min)
1. Rufe die Twilio-Nummer an
2. Beantworte die 5-7 Fragen
3. Prüfe: Case in Supabase (source=voice)
4. Prüfe: Notification-Email an MAIL_REPLY_TO

### 7c) Ops (2 Min)
1. Öffne `https://<domain>/ops/login`
2. Login mit Magic Link
3. Prüfe: Cases sichtbar, Dashboard-Kacheln korrekt
4. Öffne einen Case → Status auf "done" → Speichern
5. E-Mail eintragen (wenn fehlend) → "Review anfragen" → Email prüfen

---

## Checkliste (Founder Sign-off)

- [ ] Tenant in Supabase angelegt
- [ ] Telefonnummer(n) zugeordnet (wenn Voice)
- [ ] Vercel Env Vars gesetzt
- [ ] Retell Agent konfiguriert (wenn Voice)
- [ ] Twilio Nummer + SIP Trunk (wenn Voice)
- [ ] Peoplefone Forward konfiguriert (wenn Brand-Nummer)
- [ ] tenant_numbers für beide Nummern geseeded (wenn Peoplefone)
- [ ] GOOGLE_REVIEW_URL gesetzt (wenn Review)
- [ ] Wizard Smoke Test bestanden
- [ ] Voice Smoke Test bestanden (wenn Voice)
- [ ] Ops Login + Case-Workflow getestet
- [ ] Review Email getestet
