# FlowSight — GTM + Sales Operating Model

**Created:** 2026-03-10 | **Owner:** Founder + CC
**Status:** ACTIVE — governs all GTM, Trial, and Sales decisions
**Rule:** Update after every model change. Founder reviews weekly.

---

## Was ist das hier?

Dieses Dokument definiert, wie FlowSight Kunden gewinnt. Nicht als Feature-Liste, sondern als **Betriebsmodell** — von Scout bis Conversion oder Clean Delete.

**Kernprinzip:** Product-Led Trial Machine. Kein Pitch-Deck, kein Demo-Call, kein Freemium. Jeder qualifizierte Prospect bekommt sein eigenes System und fühlt das Produkt auf seiner eigenen Nummer.

---

## Phasen-Modell

```
Phase 0: Scout         → 20 Prospects/Tag identifizieren (batch)
Phase 1: Outreach      → Personalisierter Erstkontakt (Founder, persönlich)
Phase 2: Provisioning  → B-Full Trial in <20 Min (bei Signal)
Phase 3: Trial         → 14 Tage eigenes System
Phase 4: Decision      → Convert / Live-Dock / Offboard
Phase 5: Delivery      → Nur bei Conversion (Vertrag, Portierung)
```

---

## Phase 0: Scout (täglich, batch)

| Aspekt | Detail |
|--------|--------|
| **Input** | Region + Gewerk + Mindest-ICP |
| **Tool** | `scout.mjs` → `pipeline.csv` |
| **Output** | 20 Prospect Cards / Tag |
| **Dauer** | ~30 Min (batch) |
| **Owner** | CC |
| **Qualitätsregel** | Nur ICP >= 7 weiter zu Outreach. ICP 6 = parked. ICP < 6 = skip. |

**Artefakt:** `docs/customers/<slug>/prospect_card.json`

---

## Phase 1: Outreach (täglich)

| Aspekt | Detail |
|--------|--------|
| **Trigger** | Prospect Card mit ICP >= 7 |
| **Kanal** | E-Mail (personalisiert) + optional Video |
| **Template** | `docs/gtm/outreach_templates.md` |
| **Owner** | Founder (persönlich, nicht automatisiert) |
| **Ziel** | Signal erzeugen: Antwort, Klick, Rückruf |

**Wichtig:** Outreach != Trial. Kein Prospect wird provisioniert, bevor ein Signal kommt.

**Status-Übergang:** `scouted` → `contacted`

---

## Phase 2: Trial Provisioning (on-demand, bei Signal)

| Aspekt | Detail |
|--------|--------|
| **Trigger** | Prospect zeigt Interesse (Antwort, Rückruf, Klick) |
| **Tool** | `scripts/_ops/provision_trial.mjs` |
| **Dauer** | <20 Min (Ziel: 15 Min) |
| **Owner** | CC |

### Was wird provisioniert

| Asset | Tool | Zeit |
|-------|------|------|
| Supabase Tenant | `onboard_tenant.mjs` (eingebettet) | 2 Min |
| B-Full Voice Agent (DE + INTL) | `retell_sync.mjs` | 8 Min |
| Twilio-Nummer | Manuell oder API | 2 Min |
| Demo-Daten (15 Cases) | `seed_demo_data.mjs` (eingebettet) | 1 Min |
| Magic-Link | `create_prospect_access.mjs` (eingebettet) | 1 Min |
| Website | Nur Modus 1 (separat, vor Trial) | 15 Min |

### Was NICHT Teil des Trial-Provisioning ist

- Website (Modus 2/3) — Prospect hat eigene
- Video (Leckerli A) — separat, Outreach-Phase
- Peoplefone-Routing — erst bei Live-Andocking oder Conversion

**Status-Übergang:** `interested` → `trial_provisioned`

---

## Phase 3: Trial (14 Tage)

### Timeline

| Tag | Was | Owner | Pflicht? |
|-----|-----|-------|----------|
| **0** | Trial Start. Welcome-Mail mit Magic-Link. | CC | Ja |
| **0-2** | **First-Call-Moment.** Founder/CC ruft Prospect-Nummer an. Prospect sieht live: Anruf → Lisa → Case → SMS → Dashboard. | Founder | **JA — Pflicht** |
| **3-7** | Eigennutzung. Prospect testet selbst. | Prospect | — |
| **7** | Zwischencheck: Hat Prospect Cases bearbeitet? Login? | CC (Morning Report) | Ja |
| **10** | **Follow-up.** Founder ruft persönlich an. "Wie läuft es?" | Founder | **JA — Pflicht** |
| **13** | Erinnerung: "Ihr Test läuft morgen ab." | Auto (E-Mail) | Ja |
| **14** | **Decision Day.** Convert / Live-Dock / Offboard. | Founder | Ja |

### Was der Prospect bekommt

- **Eigene Schweizer Nummer** (Twilio Festnetz)
- **Lisa (B-Full)** — personalisiert mit seinen Services, PLZ, Firmenname
- **Dashboard** via Magic-Link (Prospect-View: Status + Review)
- **15 Demo-Cases** (realistische Schweizer Daten)
- **SMS-Flow** (Post-Call Korrekturlink)
- **Review-Surface** (Google-Style mit Firmenname)

### Trial Success-Signale

**Starke Signale (Conversion wahrscheinlich):**
- Eigene Test-Anrufe (> 3)
- Cases im Dashboard bearbeitet
- Review-Flow ausgelöst
- Rückfragen ("Kann Lisa auch X?")
- Team einbezogen ("Mein Techniker hat angerufen")

**Schwache Signale (Trial droht zu scheitern):**
- Kein Login nach Tag 3
- Kein eigener Anruf nach Tag 5
- Keine Antwort auf Follow-up Tag 10

**Kill-Signal:**
- Keine Aktivität nach 14 Tagen
- Explizites Nein
- "Kein Budget / kein Interesse"

**Status-Übergang:** `trial_provisioned` → `trial_active` (nach First-Call-Moment)

---

## Phase 4: Decision (Tag 14)

### Pfad A: Convert

| Schritt | Detail |
|---------|--------|
| Vertrag | Founder sendet SaaS-Vertrag (CHF 299/Monat, ein Produkt, alles inklusive) |
| Nummer | Peoplefone-Portierung oder Weiterleitung auf Twilio-Nummer |
| Agent | Finalisierung (letzte Anpassungen nach Feedback) |
| Offboarding Demo | `is_demo` Cases löschen, echte Daten beginnen |

**Status:** `trial_active` → `converted`

### Pfad B: Live-Andocking (selektiv)

Nur bei klaren Signalen:
- Prospect will, hat aber Bedenken ("Was wenn Lisa falsch antwortet?")
- Team muss es sehen
- "Ja, aber erst ab nächstem Monat"
- Hat > 5 eigene Test-Calls gemacht

**Mechanik:**
- Peoplefone-Weiterleitung auf Trial-Nummer (schnell, reversibel)
- Echte Kundenanrufe → echte Cases
- 14 Tage Verlängerung
- Tag 24: Final Decision

**Status:** `trial_active` → `live_dock`

### Pfad C: Offboard

- Keine Aktivität oder explizites Nein
- Freundliches Offboarding-Mail ("Danke, Tür bleibt offen")
- Clean Delete via `offboard_tenant.mjs`
- Agent deaktivieren, Nummer freigeben, Daten löschen

**Status:** `trial_active` → `offboarded`

---

## Phase 5: Delivery (nur bei Conversion)

Beginnt erst nach Vertrag. Kein vorzeitiges Kippen in Delivery.

---

## Tenant Lifecycle Status

| Status | Bedeutung | Nächster Schritt |
|--------|-----------|-----------------|
| `scouted` | In Pipeline, kein Kontakt | Outreach |
| `contacted` | Outreach gesendet | Auf Signal warten |
| `interested` | Prospect hat reagiert | Provisioning |
| `trial_active` | Trial läuft (14d) | Follow-up Tag 10 |
| `follow_up_due` | Tag 10 erreicht | Founder ruft an |
| `decision_pending` | Tag 14 erreicht | Convert / Dock / Offboard |
| `converted` | Vertrag, wird Kunde | Delivery |
| `live_dock` | Echte Calls, Verlängerung (14d) | Final Decision Tag 24 |
| `offboarded` | Sauber gelöscht | — |
| `parked` | Kein Interesse jetzt, aber kein Nein | Re-Outreach in 3 Monaten |

---

## Kapazitätsmodell

### Bei aktuellem Stand (1 CC + 1 Founder)

| Phase | Kapazität/Tag | Engpass |
|-------|--------------|---------|
| Scout | 20 Prospects | Kein (batch) |
| Outreach | 20 E-Mails | Kein (Templates) |
| Provisioning | 3-5 Trials | CC-Zeit (~15 Min/Trial) |
| Follow-up | 5 Gespräche | Founder-Zeit |

### Funnel-Erwartung

```
20 Outreach/Tag
 → ~5 reagieren (25% Response)
 → ~3 wollen testen (60% der Reagierer)
 → 3 Trials/Tag provisioniert
 → ~1 converted (25-30% Trial→Conversion)
```

**Bei diesen Zahlen:** ~1 neuer Kunde/Tag bei Volllast. Das sind ~20 Kunden/Monat.

---

## Quality Gates vor Skalierung

Bevor wir auf 20 Outreach/Tag hochfahren, muss sitzen:

| # | Gate | Status |
|---|------|--------|
| 1 | `provision_trial.mjs` < 15 Min E2E | OFFEN |
| 2 | `offboard_tenant.mjs` funktioniert sauber | OFFEN |
| 3 | Trial-Tracking in Supabase (trial_start, trial_end, status) | OFFEN |
| 4 | Welcome-Mail Template | OFFEN |
| 5 | Offboarding-Mail Template | OFFEN |
| 6 | Morning Report: aktive Trials + Follow-ups fällig | OFFEN |
| 7 | Agent-Template parametrisierbar (< 5 Min Agent-Setup) | OFFEN |
| 8 | 3 abgeschlossene Trial-Zyklen (learnings) | OFFEN |
| 9 | Conversion-Rate gemessen (min. 5 Trials) | OFFEN |
| 10 | Dörfler AG Live (erster zahlender Kunde) | OFFEN |

**Empfehlung:** Gates 1-6 jetzt bauen. Gates 7-10 brauchen echte Trials.

---

## Risiken

| Risiko | Impact | Mitigation |
|--------|--------|-----------|
| Trial ohne First-Call = wertlos | Hoch | Pflicht-Touchpoint Tag 0-2 |
| Zombie-Tenants (kein Offboarding) | Mittel | offboard_tenant.mjs + Alerts |
| Founder-Engpass bei Follow-up | Hoch | Max 5 aktive Trials parallel |
| Agent-Qualität variiert | Hoch | Quality Gate vor jedem Trial-Start |
| Prospect testet nicht selbst | Mittel | Aktive Begleitung, nicht passiv |
| Twilio-Nummern-Kosten bei vielen Trials | Niedrig | Nummern-Pool, Recycling nach Offboard |

---

## Tools + Artefakte

| Tool | Zweck | Status |
|------|-------|--------|
| `provision_trial.mjs` | Ein Script für kompletten Trial-Setup | OFFEN |
| `offboard_tenant.mjs` | Clean Delete (Agent + Nummer + Daten) | OFFEN |
| `create_prospect_access.mjs` | Magic-Link für Prospect | DONE |
| `seed_demo_data.mjs` | Demo-Cases generieren | DONE |
| `onboard_tenant.mjs` | Tenant anlegen | DONE |
| `retell_sync.mjs` | Agent publish | DONE |
| Morning Report | Trial-Status + Follow-up Alerts | OFFEN |

---

## Referenzen

- **Prospect Card Contract:** `docs/architecture/contracts/prospect_card.md`
- **Role Model:** `docs/architecture/contracts/role_model.md`
- **Einsatzlogik:** `docs/gtm/einsatzlogik.md`
- **Quality Gates:** `docs/gtm/quality_gates.md`
- **Provisioning Runbook:** `docs/runbooks/provisioning_prospect.md`
- **Architecture Detail:** `docs/gtm/architecture_detail.md`
