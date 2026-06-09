# FlowSight Sales Pipeline

**Owner:** Founder
**Aktualisiert:** 2026-06-09
**Regel:** Jeder Prospect wird **max. 3×** kontaktiert, dann ruhen lassen (parken).
**Modell (aktuell):** Premium, **kein Trial** — Proof-Seite (`/p/[token]`) → Versand → tracking-gesteuerte Kadenz → das Gespräch (Phase-1-Playbook) → Onboarding-Cockpit → Go-live/Zahlung. Pipeline-Bible (Video) + Onboarding-Bible (ab erstem menschlichem Kontakt). *(Altes Trial-Lifecycle-Modell unten = historisch, abgelöst.)*

---

## 🎯 OUTREACH-LOG — aktives Tracking (SSOT für „wer wann kontaktiert")

> **Zweck:** keine Doppel-Anfragen, Reminder für nächsten Touch, Engagement-Signal.
> **First-View-Alert ist LIVE:** öffnet ein Prospect seine Beweis-Seite, kommt automatisch eine E-Mail an den Founder (`sendProofViewAlert`, im Track-Endpoint). Watch-Tiefe: `proof_watch_report.mjs --slug X`.

| # | Betrieb | Variante | Proof-Token | **Versandt** | Status | Nächster Touch | Notiz |
|---|---------|----------|-------------|--------------|--------|----------------|-------|
| 1 | **Dörfler AG** (Oberrieden) | A (persönlich, notruf) | `8a0fbf247e745ab3d465db27` | **2026-06-09** | versendet (info@) | Tag-3-Nudge ~12.06 (nur falls kein View) · Tag-6-7-Anruf ~15.–16.06 | **Erster echter Outreach.** Reply-To→Outlook. Founder war Kunde (Dichtung). |

### Kadenz pro Prospect (McKinsey-/Mom-Test-Rhythmus)
- **Tag 0** — Versand (`send_outreach --slug X --live`), Eintrag hier + Datum.
- **First-View** — automatische Alert-Mail → wärmster Lead, beim Anruf priorisieren.
- **Tag 3** — sanfter Nudge **nur falls kein View** („kurz reingeschaut?"). Hat er geschaut → nicht nerven, auf Tag 6-7 warten.
- **Tag 6-7** — persönlicher Anruf (`phase1_gespraech_playbook.md`), sortiert nach Watch-Signal (`proof_watch_report.mjs`).
- **Max. 3 Kontakte** → dann parken (Re-Outreach frühestens in ~3 Monaten).
- **Geparkt/Datum-Re-Touch** im Gespräch vereinbart → hier mit Datum festhalten.

> **Offen (empfohlen, noch nicht gebaut):** automatischer Reminder-Cron (Tag-3/Tag-6-7 fällige Touches → Founder-Mail). Bis dahin = diese Tabelle manuell prüfen. Ticket in `ticketlist.md`.

---

## Daten

**Pipeline-CSV:** `docs/sales/pipeline.csv` · **Scout-CSV:** `docs/sales/scout_raw.csv`. Die CSVs = SSOT für Prospect-Rohdaten; das Outreach-Log oben = SSOT für Kontakt-Historie/Kadenz.

---

## Tenant Lifecycle Status

| Status | Bedeutung | Nächster Schritt |
|--------|-----------|--------------------|
| `scouted` | In Pipeline, kein Kontakt | Outreach |
| `contacted` | Outreach gesendet | Auf Signal warten |
| `interested` | Prospect hat reagiert | Provisioning |
| `trial_active` | Trial läuft (14d) | Follow-up Tag 10 |
| `follow_up_due` | Tag 10 erreicht | Founder ruft an |
| `decision_pending` | Tag 14 erreicht | Convert / Dock / Offboard |
| `converted` | Vertrag, wird Kunde | Delivery |
| `live_dock` | Echte Calls, Verlängerung (14d) | Final Decision Tag 24 |
| `offboarded` | Sauber gelöscht | — |
| `parked` | Kein Interesse jetzt | Re-Outreach in 3 Monaten |

---

## Gewonnene Kunden

| # | Firma | Ort | Module | MRR (CHF) | Go-Live |
|---|-------|-----|--------|-----------|---------|
| 1 | Dörfler AG | Oberrieden | Voice, Wizard, Ops, Reviews | — | Website LIVE |

---

## Provisioning Tools

| Tool | Zweck |
|------|-------|
| `provision_trial.mjs` | Unified Trial Setup (tenant + phone + seed + magic link) |
| `offboard_tenant.mjs` | Clean Delete (cases + agents + auth + status) |
| `retell_sync.mjs` | Voice Agent publish (B-Full, DE + INTL) |
| `seed_demo_data.mjs` | Demo-Cases generieren |
| `scout.mjs` | Prospect Discovery + ICP Scoring |

---

## Outreach Templates

Siehe `docs/gtm/outreach_templates.md` — 3 Templates (nach ICP Tier) + Anruf-Skript.

---

## Quality Gates

Siehe `docs/gtm/quality_gates.md` — 5 Gates müssen PASS sein vor Outreach.

---

## Notizen / Learnings

(Hier nach jeder Woche festhalten: Was hat funktioniert? Was nicht? Was anpassen?)

