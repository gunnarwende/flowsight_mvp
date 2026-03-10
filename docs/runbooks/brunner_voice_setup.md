# Runbook: Brunner Haustechnik AG — Voice Agent Setup

**Datum:** 2026-03-01
**Geschätzte Dauer:** ~30 Min
**Voraussetzung:** Retell Account, Twilio Account, Supabase Zugang
**Twilio-Nummer:** +41 44 505 48 18 (gekauft 01.03.2026)

---

## Übersicht

Der Brunner Demo-Tenant hat ein eigenes Voice-Agent-Paar (DE + INTL) mit **zwei Modi**:
- **INTAKE:** Schadensmeldungen aufnehmen (wie Dörfler, mit Ticket-Erstellung)
- **INFO:** Allgemeine Fragen beantworten (Öffnungszeiten, Preise, Einzugsgebiet, etc.)

Der Agent erkennt automatisch, ob der Anrufer ein Problem meldet oder eine Frage hat.

**Dateien:**
- `retell/exports/brunner_agent.json` — DE Agent (Susi-Stimme, 9 Nodes, Intake + Info)
- `retell/exports/brunner_agent_intl.json` — INTL Agent (Juniper-Stimme, 9 Nodes, EN/FR/IT)
- `supabase/migrations/20260301000000_brunner_voice_number.sql` — DB-Mapping (+41445054818)
- `retell/templates/README.md` — Template-Guide für neue Kunden

**Diese Configs sind gleichzeitig die Schablone für alle künftigen Kunden-Agents.**

---

## Schritt 1: DE Agent erstellen

1. Öffne **Retell Dashboard** → **Agents** → **Create Agent**
2. Wähle **"Import from JSON"**
3. Importiere `retell/exports/brunner_agent.json`
4. Prüfe:
   - Agent Name: **Brunner Haustechnik AG Intake (DE)**
   - Webhook URL: `https://flowsight-mvp.vercel.app/api/retell/webhook`
   - Voice: **Ela** (NE7AIW5DoJ7lUosXV2KR)
   - Language: de-DE
   - Conversation Flow: **9 Nodes** (Welcome, Language Gate, Main Conversation, Logic Split, Closing Intake, Closing Info, Out-of-scope, Language Transfer, End Call)
5. **Notiere die agent_id** (Format: `agent_xxxxxxxxxxxxxxxxxxxx`)

---

## Schritt 2: INTL Agent erstellen

1. Retell Dashboard → **Create Agent** → Import `retell/exports/brunner_agent_intl.json`
2. Prüfe:
   - Agent Name: **Brunner Haustechnik AG Intake (INTL)**
   - Webhook URL: `https://flowsight-mvp.vercel.app/api/retell/webhook`
   - Voice: **Juniper** (aMSt68OGf4xUZAnLpTU8)
   - Language: en-US
   - Conversation Flow: **9 Nodes** (Welcome, Main Conversation, Logic Split, Closing Intake, Closing Info, Out-of-scope, DE Transfer, End Call)
3. **Notiere die agent_id**

---

## Schritt 3: Agents verknüpfen (Agent Swap)

### In DE Agent:
1. Öffne **Language Transfer** Node
2. Tool `swap_to_intl_agent` → **agent_id** = die INTL Agent-ID aus Schritt 2

### In INTL Agent:
1. Öffne **DE Transfer** Node
2. Tool `swap_to_de_agent` → **agent_id** = die DE Agent-ID aus Schritt 1

---

## Schritt 4: Beide Agents publishen

**WICHTIG:** Immer vom Retell Dashboard publishen (nicht via API).

1. DE Agent → **Publish** → Version notieren
2. INTL Agent → **Publish** → Version notieren

---

## Schritt 5: Twilio Nummer konfigurieren

Nummer: **+41 44 505 48 18** (bereits gekauft)

1. Twilio Console → **Phone Numbers** → +41 44 505 48 18
2. Voice Configuration → SIP Trunk zum Brunner DE Retell Agent
3. Konfiguration wie bei Dörfler (Peoplefone → Twilio → Retell)

---

## Schritt 6: Supabase — Nummer registrieren

Die Migration `20260301000000_brunner_voice_number.sql` enthält bereits die korrekte Nummer.

**Option A — Migration anwenden:**
```bash
cd C:\tmp\supa_push
# supabase/ Verzeichnis kopieren
supabase link --project-ref oyouhwcwkdcblioecduo
supabase db push
```

**Option B — Direkt im Supabase SQL Editor:**
```sql
INSERT INTO tenant_numbers (tenant_id, phone_number)
VALUES ('d0000000-0000-0000-0000-000000000001', '+41445054818');
```

---

## Schritt 7: Verifizierung

### Test A: Intake-Modus (Schadensmeldung)
1. **Anruf:** +41 44 505 48 18
2. Lisa: *"Guten Tag, hier ist Lisa — die digitale Assistentin der Brunner Haustechnik AG. Wie kann ich Ihnen helfen?"*
3. Sage: *"Ich habe einen Rohrbruch im Keller, Postleitzahl 8800 Thalwil"*
4. Agent sammelt Details, fasst zusammen, verabschiedet sich
5. **Vercel Logs:** `{"_tag":"retell_webhook","decision":"created","tenant":"brunner-haustechnik"}`
6. **Dashboard:** `flowsight.ch/ops/cases?tenant=brunner-haustechnik` → neuer Fall
7. **E-Mail:** Ops-Notification erhalten

### Test B: Info-Modus (Allgemeine Frage)
1. **Anruf:** +41 44 505 48 18
2. Sage: *"Haben Sie heute offen?"*
3. Agent antwortet: *"Wir sind Montag bis Freitag von sieben bis siebzehn Uhr für Sie da..."*
4. Sage: *"Kommen Sie auch nach Kilchberg?"*
5. Agent bestätigt Einzugsgebiet
6. Sage: *"Danke, das reicht mir"*
7. Agent verabschiedet sich freundlich
8. **Vercel Logs:** `decision: "missing_fields"` (korrekt — kein Ticket erstellt)

### Checkliste
- [ ] DE Agent importiert + published
- [ ] INTL Agent importiert + published
- [ ] Agent Swap IDs gegenseitig eingetragen
- [ ] Twilio-Nummer +41 44 505 48 18 konfiguriert
- [ ] tenant_numbers Eintrag in Supabase
- [ ] Test A: Intake — Fall erstellt, E-Mail erhalten
- [ ] Test B: Info — Fragen korrekt beantwortet, kein Fall erstellt
- [ ] Dashboard: Neuer Fall unter Brunner-Filter sichtbar

---

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| Agent meldet sich als "Dörfler" | Prüfe global_prompt und Welcome Node — "Brunner Haustechnik AG" |
| `decision: "no_tenant"` in Logs | tenant_numbers Eintrag fehlt oder Nummer nicht E.164 (+41445054818) |
| `decision: "module_disabled"` | Brunner Tenant braucht `"voice": true` in modules |
| Agent Swap funktioniert nicht | Agent IDs gegenseitig prüfen, beide publishen |
| Info-Fragen werden falsch beantwortet | Firmen-Wissen im global_prompt prüfen |
| Kein Webhook-Event | Webhook URL + Events (`call_analyzed`) prüfen |
| Voice klingt anders | Voice-ID im Dashboard prüfen (Susi / Juniper) |

---

## Referenzen

- Template-Guide: `retell/templates/README.md`
- Allgemeines Retell Setup: `docs/runbooks/retell_agent_config.md`
- Brunner Tenant Migration: `supabase/migrations/20260228300000_demo_tenant_brunner.sql`
- Webhook Handler: `src/web/app/api/retell/webhook/route.ts`
- Tenant Resolution: `src/web/src/lib/tenants/resolveTenant.ts`
