# GTM-Maschine — Phase A Checkliste (pro Betrieb)

> Wiederverwendbare Checkliste für jeden Betrieb der durch die Maschine läuft.
> Referenz: `docs/customers/lessons-learned.md` (Regeln M1-M6 + Website-Regeln 1-15)
> Ziel: Komplettes Leitsystem in <60 Min (Phase A, ohne Video).

---

## Voraussetzungen

- [ ] Prospect identifiziert (scout.mjs oder manuell)
- [ ] prospect_card.json existiert (ICP, Kontakt, Services)
- [ ] Freie Twilio CH-Nummer verfügbar

---

## 1. Daten & Analyse (~10 Min)

- [ ] **FACTS_VERIFIED.md** prüfen/erstellen — nur verifizierte Daten (Regel M2)
- [ ] **pain_types** identifizieren aus Website-Analyse (Regel M3)
- [ ] **Ansprechperson** verifiziert (Name muss in FACTS_VERIFIED stehen!)
- [ ] **prospect_card.json** updaten: pain_types, team, provisioning_status
- [ ] **Modus bestimmen:** 1 (Website von uns) / 2 (eigene Website)

## 2. Website (~0 Min wenn bereits live, ~60 Min wenn neu)

- [ ] Config existiert: `src/web/src/lib/customers/<slug>.ts`
- [ ] Registry-Eintrag: `registry.ts`
- [ ] Bilder: `src/web/public/kunden/<slug>/`
- [ ] Website erreichbar: `/kunden/<slug>`
- [ ] Wizard funktioniert: `/kunden/<slug>/meldung`
- [ ] Impressum + Datenschutz: `/kunden/<slug>/impressum` + `/datenschutz`
- [ ] **Regeln 1-15 aus lessons-learned.md befolgt** (keine erfundenen Daten!)

## 3. Voice Agent (~5 Min)

- [ ] Agent JSONs existieren: `retell/exports/<slug>_agent.json` + `_intl.json`
- [ ] **Voice = Ela DE** (`custom_voice_3d93cf97532572d3980044468a`)
- [ ] **Voice = Juniper INTL** (`custom_voice_cf152ba48ccbac0370ecebcd88`)
- [ ] **DSGVO:** `data_storage_setting = "everything_except_pii"`
- [ ] `retell_sync.mjs --prefix <slug>` → Published: YES
- [ ] Twilio-Nummer → Retell Agent zugewiesen (Phone Number → inbound_agent_id)
- [ ] Customer Config: `voicePhone` + `voicePhoneRaw` eingetragen

## 4. Provisioning (~5 Min)

```bash
node --env-file=src/web/.env.local scripts/_ops/provision_trial.mjs \
  --slug=<slug> \
  --name="<Firmenname>" \
  --phone="<Twilio E.164>" \
  --prospect-email=<email> \
  --pain-type=<primary_pain_type> \
  --gewerk=sanitaer \
  --no-welcome-mail
```

- [ ] trial_status = "interested" (NICHT trial_active!)
- [ ] 15 Demo-Cases geseedet
- [ ] Prospect-Auth-User erstellt (aber NICHT aktiviert)

## 5. DB-Konfiguration (~3 Min)

- [ ] `modules.primary_color` = Brand-Farbe aus Config
- [ ] `modules.sms_sender_name` = max 11 Zeichen, kein Umlaut
- [ ] `modules.notification_email` = **NICHT GESETZT** (Phase A! → Regel M1)
- [ ] `modules.google_review_url` = nicht nötig (GOOGLE_REVIEW_URL Env = FlowSight Default)

## 6. Smoke-Test (~5 Min)

- [ ] Testanruf auf Twilio-Nummer → Ela antwortet auf Deutsch
- [ ] SMS kommt an Founder-Handy
- [ ] Ops-Email kommt an Founder (MAIL_REPLY_TO)
- [ ] **Prospect bekommt NICHTS** (Regel M1!)
- [ ] Fall erscheint in Leitzentrale (Admin, Tenant-Switcher)
- [ ] Leitzentrale zeigt Branding (Farbe)
- [ ] Demo-Cases sichtbar
- [ ] Wizard-Submit → Fall in Leitzentrale

## 7. Demo-Script (~15 Min)

- [ ] `docs/customers/<slug>/demo_script.md` erstellen
- [ ] pain_types im Script eingewoben (Regel M4)
- [ ] Persönliche Story / Lokalbezug (wenn vorhanden)
- [ ] 7 Abschnitte: Intro → Alltag → Telefon → Leitzentrale → Website → Bewertung → Abschluss
- [ ] Dont's beachtet (kein Preis, kein KI, kein Dashboard, kein Lisa)
- [ ] Mail 1 Text geschrieben (persönlich, nur Video + Feedback-Bitte)

## 8. SSOT-Update (~5 Min)

- [ ] `docs/customers/<slug>/status.md` aktualisiert
- [ ] `docs/sales/pipeline.csv` aktualisiert
- [ ] `docs/customers/<slug>/prospect_card.json` provisioning_status aktualisiert
- [ ] `docs/STATUS.md` Kunden-Tabelle aktualisiert

## 9. Git & Deploy

- [ ] Branch → PR → CI green → Merge
- [ ] Vercel deployed
- [ ] Retell Agents published

---

## Nach Aufnahme: Phase B Ablauf

```
1. Founder nimmt Video auf (demo_script.md)
2. Founder schickt Mail 1 (nur Video + Feedback)
3. Prospect antwortet mit Email → Founder: activate_prospect.mjs
4. Mail 2 automatisch (Leitzentrale + Testnummer + PWA)
5. Trial 14 Tage → Follow-up Tag 10 → Decision Tag 14
```

---

## Lessons Learned Verweis

| Regel | Inhalt | Quelle |
|-------|--------|--------|
| M1 | Phase A/B Trennung, --no-welcome-mail, notification_email NICHT setzen | lessons-learned.md |
| M2 | prospect_card: Jeder Name aus FACTS_VERIFIED | lessons-learned.md |
| M3 | pain_types dokumentieren | lessons-learned.md |
| M4 | Demo-Script pain_type-basiert | lessons-learned.md |
| M5 | Smoke-Test vor Video | lessons-learned.md |
| M6 | SSOT-Update nach jedem Schritt | lessons-learned.md |
| Voice | 4-Schritt-Workflow: list-voices → JSONs → sync → PR | feedback_voice_change_workflow.md |
| Website | 15 CC-Regeln (keine erfundenen Daten!) | lessons-learned.md §2 |

---

*Template erstellt: 2026-04-01 | Erster Durchlauf: Dörfler AG (~70 Min) | Ziel: <60 Min ab Betrieb #2*
