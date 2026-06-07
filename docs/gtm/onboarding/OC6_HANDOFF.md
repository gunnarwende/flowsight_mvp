# OC6 — Cockpit Co-Pilot · Handoff (Founder-Test)

> Gebaut autonom 07.06.2026 (CC), Branch `feat/onboarding-oc6-cockpit-flows`
> (gestapelt auf OC1–OC5 #572–#576). **tsc + eslint + `next build` grün.**
> Status: **READY TO TEST** — nichts live, nichts gepublisht, kein Versand.
> Macht das OC5-Gerüst lebendig (Daten-Layer + Flows + Lisa-Testanruf + Promote).

---

## Was OC6 ist (in einem Satz)
Aus der vorbefüllten `tenant_config` baut der Betrieb sein System im Cockpit
selbst (confirm-not-create, Autosave) → sendet an Gunnar → du reviewst → ein
founder-run **Promote** schreibt die bestätigten Werte live. **Während des Baus
ist NICHTS live** (Kunde schreibt nur in `draft`).

## Der Fluss
```
create_cockpit_session.mjs --slug doerfler-ag   (du, nach dem „Ja")
  → cockpit_sessions-Row (Token + prefill-Snapshot)  → /aufbau/<token>
/aufbau/<token>   (Kunde baut: 6 Stränge, Autosave in draft, Lisa-Testanruf)
  → „An Gunnar senden"  → status=submitted + Mail an dich (KEIN Live-Write)
promote_cockpit_session.mjs --token <t> [--confirm]   (du, nach Review)
  → tenants.modules + staff + case_id_prefix + voice_dispositions
  → schreibt bestätigte Werte zurück in tenant_config.json (für Retell-Regen)
  → status=approved   →   dann: retell_sync publish + Nummer = manuell
```

## Dateien (neu/geändert)
- `supabase/migrations/20260607000000_cockpit_sessions.sql` — token-private Tabelle (RLS service-only).
- `src/web/src/lib/cockpit/types.ts` + `cockpitSessions.ts` — Datenvertrag + Datenschicht.
- `scripts/_ops/create_cockpit_session.mjs` — Session anlegen (Prefill aus tenant_config).
- `src/web/app/aufbau/[token]/page.tsx` + `CockpitApp.tsx` + `lisaTestCall.ts` — die Cockpit-UI.
- `src/web/app/api/aufbau/[token]/{save,submit,testcall}/route.ts` — Autosave / Absenden / Lisa-Web-Call.
- `src/web/app/api/retell/webhook/route.ts` — setzt `cases.is_demo` aus `metadata.is_demo` (Testfall raus aus KPIs, G6).
- `src/web/src/lib/email/resend.ts` — `sendCockpitSubmittedAlert` (Founder-Review-Mail).
- `scripts/_ops/promote_cockpit_session.mjs` — Go-live-Promote (DEFAULT dry-run; `--confirm` schreibt).
- `package.json` — `retell-client-js-sdk` (Browser-Web-Call).

## So testest du es (E2E, lokal)
1. **Migration:** `npx supabase db push --linked` (cockpit_sessions anlegen).
   (Bekannter §-Workaround: `.env.local` temporär wegmoven, siehe CLAUDE.md.)
2. **Session anlegen** (Dörfler-Tenant muss existieren):
   `node --env-file=src/web/.env.local scripts/_ops/create_cockpit_session.mjs --slug doerfler-ag`
   → gibt `http://localhost:3000/aufbau/<token>` aus. (Vorher `--dry-run` zeigt nur den Prefill.)
3. **Cockpit durchklicken:** `npm run dev` in `src/web`, Link öffnen. Alle 6 Stränge durchgehen
   (Brand/Staff → Lisa/Greeting/Dispositionen → Wizard → Vor-Ort → Notification/Review → Login/AVV).
   Autosave-Anzeige beobachten. „An Gunnar senden" → prüft die Pflichtfelder, setzt submitted, Mail an dich.
4. **Promote (Vorschau):** `node --env-file=src/web/.env.local scripts/_ops/promote_cockpit_session.mjs --token <token>`
   → zeigt den **Plan** (dry-run). Erst mit `--confirm` schreibt es DB + staff + tenant_config.json.
5. **Live schalten (manuell, wie gehabt):** `retell_sync.mjs --prefix doerfler-ag` (published den
   regenerierten Agenten) + Nummer kaufen + Weiterleitung. Dann Session auf „live".

## Die EINE externe Voraussetzung — Lisa-Testanruf-Agent
Der „Lisa jetzt anrufen"-Button braucht einen **geteilten Cockpit-Test-Agenten** + zwei Env-Vars.
Ohne ihn liefert `/testcall` ein sauberes 503 (Button zeigt „Verbindung fehlgeschlagen") — der Rest
des Cockpits funktioniert voll.

**Setup (einmalig, dein Schritt — ich publishe bewusst nichts):**
1. Bestehenden Gold-Standard-DE-Agenten in Retell **duplizieren** als „FlowSight Cockpit Test (DE)".
2. Im Prompt die **`{{Platzhalter}}` stehen lassen** (NICHT pro Betrieb füllen) — sie werden pro
   Web-Call als `retell_llm_dynamic_variables` injiziert. Es sind exakt die 24 aus
   `retell/templates/global_prompt_de.txt` (company_name, opening_hours, services_list, …).
3. Agenten **publishen**.
4. Env setzen (Vercel + `.env.local`): `RETELL_COCKPIT_TEST_AGENT_ID=<agent_id>` (RETELL_API_KEY ist schon da).
5. Test: im Cockpit „Lisa jetzt anrufen" → du hörst Lisa mit Dörflers Namen/Wissen; der entstehende
   Fall trägt `is_demo` und erscheint im „Testfälle"-Tab, nicht in den KPIs.

## Bewusst NICHT gemacht (Gates bleiben beim Founder)
- Kein Retell-Publish, kein Nummernkauf, **kein Schreiben auf den Live-Tenant** (Promote nur als
  dry-run vorbereitet — du führst `--confirm` nach dem Review aus).
- Kein Push/Merge/Deploy. Migration nicht gepusht.
- Visueller Feinschliff des Cockpits = dein Review-Loop (ich kann hier nicht rendern).

## Offene Folge-Punkte (Backlog)
- **OC7** `send_onboarding.mjs` (Onboarding-Mail mit dem `/aufbau/<token>`-Link) — noch offen.
- `tenant_callbacks` für Test-Callbacks: D3/D4-Testanrufe erzeugen aktuell eine echte Nachrichten-
  Zeile (kein `is_demo`-Feld auf der Tabelle). Niedrige Prio; ggf. später Suppression im Test-Kontext.
- `RETELL_COCKPIT_TEST_AGENT_ID` in den Env-Var-Registry-Doc (`docs/architecture/env_vars.md`) aufnehmen.
