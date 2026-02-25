# Onboarding: Neuer Kunde (Full Setup)

**Scope:** Voice + Wizard + Ops + Email + Review Engine
**Dauer:** ~55 Min (mit Voice + Peoplefone), ~25 Min (Wizard-only)
**Voraussetzung:** Vercel Deploy läuft, Supabase Projekt verbunden

**Owner-Legende:** [F] = Founder-only (Console/Portal) | [CC] = Head Ops (Code/SQL) | [F+CC] = beide

---

## 1. Supabase: Tenant + Modules anlegen (~5 Min) [F]

```sql
-- 1a) Tenant erstellen mit Modulen
INSERT INTO tenants (id, name, slug, modules)
VALUES (
  gen_random_uuid(),
  'Firmenname AG',
  'firmenname-ag',
  '{"website_wizard": true, "ops": true, "voice": true, "reviews": true}'::jsonb
)
RETURNING id;

-- 1b) Telefonnummer(n) zuordnen (Voice-Routing)
-- Twilio Entry number:
INSERT INTO tenant_numbers (tenant_id, phone_number, active)
VALUES ('<tenant_id>', '+41XXXXXXXXXX', true);
-- Peoplefone Brand number (wenn vorhanden):
INSERT INTO tenant_numbers (tenant_id, phone_number, active)
VALUES ('<tenant_id>', '+41XXXXXXXXXX', true);
```

**Modules — nur aktivieren was verkauft wurde:**

| Module | Was es freischaltet | Weglassen wenn |
|--------|--------------------|----|
| `website_wizard` | POST /api/cases source=wizard | Kein Wizard gebraucht |
| `ops` | /ops Dashboard Zugang | Lead-gen only (case+email, kein Ops) |
| `voice` | /api/retell/webhook case creation | Kein Voice gebraucht |
| `reviews` | Review-Request Button in Ops | Keine Google Reviews gewünscht |

> **SKIP 1b** wenn Voice nicht gebraucht wird.

**Evidence:** `SELECT id, slug, modules FROM tenants WHERE slug = '<slug>';`

## 2. Vercel Env Vars setzen (~3 Min) [F]

Im Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Wert | Pflicht |
|----------|------|---------|
| `FALLBACK_TENANT_ID` | `<tenant_id>` aus Schritt 1 | Ja (bis Multi-Tenant-Routing steht) |
| `MAIL_REPLY_TO` | Betriebsemail die aktiv monitort wird | Ja |
| `GOOGLE_REVIEW_URL` | Google Maps Review-URL des Kunden | Nur wenn reviews=true |

> Bereits gesetzt (global, nicht pro Kunde): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_SUBJECT_PREFIX`, `RETELL_API_KEY`.

> **SKIP wenn Wizard-only:** `RETELL_*` Vars nicht nötig. `GOOGLE_REVIEW_URL` optional.

## 3. Resend: Domain + Deliverability (~5 Min) [F]

### 3a) Custom Domain (wenn gewünscht)
- Resend Dashboard → Domains → Add Domain
- DNS Records setzen (SPF + DKIM)
- `MAIL_FROM` in Vercel Env anpassen (`noreply@send.kundendomain.ch`)

> **SKIP wenn Standard-Domain** (`send.flowsight.ch`) ausreicht.

### 3b) Email Deliverability Gate [F]

**Pflicht vor Go-Live — ohne diesen Check können Emails im Spam landen.**

- [ ] SPF Record: `v=spf1 include:amazonses.com ~all` (oder Resend-spezifisch) im DNS des Kunden
- [ ] DKIM Record: von Resend Dashboard generiert, im DNS eingetragen
- [ ] Inbox-Test: eine Test-Email an MAIL_REPLY_TO senden (Resend Dashboard → "Send Test Email")
- [ ] Prüfen: Email im Posteingang (nicht Spam/Junk)
- [ ] Prüfen: "Mailed-By" und "Signed-By" korrekt in Email-Header

> Wenn Email im Spam landet: DNS Records prüfen, 24h warten (DNS Propagation), erneut testen.

## 4. Retell: Agent konfigurieren (~15 Min) [F]

Siehe: `docs/runbooks/retell_agent_config.md` (detaillierter Runbook).

Kurzfassung:
- Retell Dashboard → Agents → Agent erstellen (oder bestehenden klonen)
- Prompt: max 7 Fragen, sanitär-spezifisch, Bestätigungssatz am Ende
- Custom Analysis Schema: `plz`, `city`, `category`, `urgency`, `description`
- Webhook URL: `https://flowsight-mvp.vercel.app/api/retell/webhook`
- Webhook Events: `call_ended`, `call_analyzed`
- Privacy: Recording OFF, data_storage=everything_except_pii, PII redaction ON
- Publish agent (Dashboard → Publish, nicht nur Save)

> **SKIP wenn voice=false:** Schritte 4 + 5 + 5b komplett überspringen.

## 5. Twilio: Nummer + SIP Trunk (~5 Min) [F]

- Twilio Console → Phone Numbers → Buy Number (CH +41)
- SIP Trunk erstellen → Termination URI = Retell SIP Endpoint
- Inbound Call Routing → SIP Trunk
- `tenant_numbers` Eintrag für Twilio-Nummer erstellt in Schritt 1b

> **SKIP wenn voice=false.**

## 5b. Peoplefone: Brand-Nummer Forward (~5 Min) [F]

Wenn der Kunde eine eigene Brand-Nummer über Peoplefone hat:

1. Peoplefone Portal → Nummer → Routing → Unconditional Forward → Twilio-Nummer (E.164)
2. `tenant_numbers` Eintrag für Brand-Nummer erstellt in Schritt 1b
3. Test-Anruf: Brand-Nummer wählen → Retell antwortet

> **Detaillierter Runbook:** `docs/runbooks/peoplefone_front_door.md`
> **SKIP wenn keine Peoplefone-Nummer vorhanden.**

## 6. Smoke Tests (~10 Min) [F+CC]

### 6a) Wizard (~3 Min)
1. Öffne `https://<domain>/wizard`
2. Fülle Formular aus (mit echter Email)
3. Prüfe: Case in Supabase (`SELECT id, source, status FROM cases ORDER BY created_at DESC LIMIT 1`)
4. Prüfe: Notification-Email an MAIL_REPLY_TO angekommen (nicht im Spam)
5. Prüfe: Bestätigungs-Email an Melder-Email angekommen

### 6b) Voice (~5 Min)
1. Rufe die Brand-Nummer (oder Twilio-Nummer) an
2. Beantworte die 5–7 Fragen, sage PLZ + Ort deutlich
3. Warte ~60s auf call_analyzed webhook
4. Prüfe: Case in Supabase (source=voice, Felder plausibel)
5. Prüfe: Notification-Email an MAIL_REPLY_TO

### 6c) Ops (~2 Min)
1. Öffne `https://<domain>/ops/login`
2. Login mit Magic Link
3. Prüfe: Cases sichtbar, Dashboard-Kacheln korrekt
4. Öffne einen Case → Status auf "contacted" → Speichern
5. E-Mail eintragen → "Review anfragen" → Email prüfen (wenn reviews=true)

## 7. Post-Onboarding (~5 Min) [CC]

- [ ] `docs/customers/<slug>/status.md` anlegen (Datum, Module, Brand-Nummer, Evidence)
- [ ] `scripts/_ops/seed_tenant_number.mjs` aktualisieren (neuen Kunden hinzufügen)
- [ ] Morning Report laufen lassen → neuer Tenant erscheint in Zahlen
- [ ] STATUS.md updaten (neuer Kunde, Datum, Evidence)

---

## Sign-off Checkliste (~55 Min total)

| # | Step | Owner | ~Min | Done |
|---|------|-------|------|------|
| 1 | Tenant + Modules in Supabase | [F] | 5 | [ ] |
| 2 | Vercel Env Vars gesetzt | [F] | 3 | [ ] |
| 3a | Resend Domain (wenn Custom) | [F] | 5 | [ ] |
| 3b | **Email Deliverability Gate** | [F] | — | [ ] |
| 4 | Retell Agent konfiguriert | [F] | 15 | [ ] |
| 5 | Twilio Nummer + SIP Trunk | [F] | 5 | [ ] |
| 5b | Peoplefone Forward (wenn Brand) | [F] | 5 | [ ] |
| 6a | Wizard Smoke Test PASS | [F+CC] | 3 | [ ] |
| 6b | Voice Smoke Test PASS | [F+CC] | 5 | [ ] |
| 6c | Ops Smoke Test PASS | [F+CC] | 2 | [ ] |
| 7 | Post-Onboarding Docs | [CC] | 5 | [ ] |
| — | **Total (Voice + Peoplefone)** | | **~55** | |
| — | **Total (Wizard-only)** | | **~25** | |

**Evidence pro Kunde:** tenant_id, slug, modules, Brand-Nummer, smoke test case_ids (wizard + voice), email delivery confirmed.
