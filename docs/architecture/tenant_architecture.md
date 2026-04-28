# Tenant-Architektur — SSOT, Rollen, Routing

> **Dieses Doc ist Querschnittsdokument**, referenziert aus:
> - `docs/gtm/onboarding/ONBOARDING_BIBLE.md` (Goldene Regeln G2 + G8 + G11 + G12)
> - `docs/STATUS.md` Document-Map
> - `docs/business_briefing.md` §7 Zwei-Maschinen-Konzept
>
> **Stand:** 2026-04-28 EOD, post-BigBen-Onboarding-Session

---

## §1 · Vier Tenant-User-Typen

Bisher gab es im Code nur den binären Diskriminator `isAdmin`. Das hat sich beim BigBen-Onboarding als zu grobkörnig erwiesen — Paul (Customer-Tenant-Admin) und Founder (Cross-Tenant-Admin) sahen beide `isAdmin=true` und beide bekamen den Tenant-Switcher mit Customer-Namen-Liste. Major Privacy-Leak. **FB27.**

Die richtige Achse hat **vier** Typen:

| Typ | Beschreibung | Sieht | Beispiel |
|---|---|---|---|
| **Founder** | FlowSight-Owner, cross-tenant-Zugriff | Tenant-Switcher mit allen Customer-Namen, kann impersonate, Sentry, Telegram-Alerts, CEO-App | Gunnar |
| **Customer-Admin** | Owner / Manager des einen Kunden-Tenants | Eigener Tenant. Niemals andere Customer-Namen. Volles Pub-Dashboard / Sanitär-Leitsystem für seinen Tenant. | Paul (BigBen), Beat Dörfler |
| **Customer-Staff (Techniker)** | Mitarbeiter im Customer-Tenant mit reduzierten Rechten | Eigener Tenant, nur Cases & Support, keine Settings | Sanitär-Techniker im Aussendienst |
| **Prospect** | Trial-User während 14 Tage | Eigener Trial-Tenant, read-only / limited write, mit Trial-Branding | Aktiver Trial-User vor Conversion |

**Diskriminatoren:**

```ts
isFounder      = email ∈ FOUNDER_EMAILS env-allowlist
                 (zukünftig: staff.is_founder DB-Flag)
isAdmin        = app_metadata.role === "admin"
                 (gilt für Customer-Admins UND Founder)
isProspect     = app_metadata.role === "prospect"
staffRole      = staff[user_id, tenant_id].role
                 ("admin" | "techniker")
```

**Wichtig:** `isAdmin && !isFounder` = Customer-Admin (nie Switcher-Dropdown). Heute via env-Allowlist, langfristig via `staff.is_founder` DB-Migration.

---

## §2 · URL-Scheme

| URL | Wer landet hier | Behavior |
|---|---|---|
| `/ops/login` | Alle | OTP-Login-Flow |
| `/ops/welcome` | Frische Trials nach Provisioning | Warm-Welcome, Test-Anruf-CTA |
| `/ops/cases` | Sanitär-Tenants (default-Home für Modul=ops) | Leitzentrale, Case-Liste |
| `/ops/pub-dashboard` | Pub-Tenants (modules.events ‖ reservations) | Reservation-Zentrierter Dashboard |
| `/ops/app/[slug]` | **Per-Tenant-Entry** (PWA-Installation, von Founder verlinkt) | Setzt `fs_active_tenant` Cookie, redirected zum richtigen Home je nach Modul |
| `/ops/admin` (TODO) | Founder only | Cross-Tenant-Übersicht mit Switcher prominent |

**Routing-Regel (`/api/ops/tenant-app/[slug]`):**
```ts
const isPub = modules.events || modules.reservations;
const home = isPub ? "/ops/pub-dashboard" : "/ops/cases";
```

---

## §3 · Single Source of Truth pro Datenfeld (G12)

> **G12 (Goldene Regel):** Pro Datenfeld gibt es genau EINE kanonische Quelle. Was die Quelle ist, hängt vom Feld + vom Kunden ab und wird beim Onboarding (Phase 1) festgelegt in `docs/customers/<slug>/data_sources.md`.

### 3.1 · Vier mögliche Quell-Typen

| Typ | Wann | Pflege durch |
|---|---|---|
| **DB (FlowSight)** | Wir bieten dem Betrieb ein Pflege-Tool an (App, Wizard, Admin-Form) | Customer (in unserer App) |
| **Google Business Profile (GBP)** | Betrieb pflegt schon dort, oft umfassender als eigene Website | Customer (bei Google) |
| **External Website** | Betrieb hat starke Website mit strukturierten Infos, will keine Doppelpflege | Customer (auf eigener Website) |
| **Static / Hardcoded** | Stabile Fakten die selten ändern | Founder beim Onboarding |

### 3.2 · Per-Kunde Source-Map

Jeder Kunde bekommt in Phase-1-Discovery eine `data_sources.md` Datei:

**Beispiel BigBen Pub:**
```
field            source                 cadence       fetcher
─────            ──────                 ───────       ───────
events           pub_events             3× daily      bigben_voice_daily_refresh
sport            pub_events             3× daily      bigben_voice_daily_refresh
reservations     pub_reservations       30s polling   reservation_polling
address          GBP                    daily         gbp_sync (Stufe 2 — TODO)
phone            GBP                    daily         gbp_sync (Stufe 2 — TODO)
hours            GBP                    daily         gbp_sync (Stufe 2 — TODO)
owner_name       static                 manual        —
brand_color      tenants.modules        on-change     DB-trigger
```

**Beispiel Sanitär Modus 2 (typisch — schwache Website, starkes GBP):**
```
address          GBP                    daily         gbp_sync (Stufe 2)
phone            GBP                    daily         gbp_sync (Stufe 2)
hours            GBP                    daily         gbp_sync (Stufe 2)
services         tenant_master_data     on-change     DB-trigger
notdienst        tenant_master_data     on-change     DB-trigger
open_jobs        tenant_master_data     on-change     DB-trigger
team             static                 manual        —
emergency_text   tenant_master_data     on-change     DB-trigger
```

**Beispiel Sanitär Modus 3 (starke Website, viel Tiefe):**
```
services         website (LLM-extract)  daily         website_crawl + extract
process_descr    website (LLM-extract)  daily         website_crawl + extract
usps             website (LLM-extract)  daily         website_crawl + extract
address          website (selector)     daily         website_crawl
hours            website (selector)     daily         website_crawl
open_jobs        website (LLM-extract)  hourly        website_crawl
```

### 3.3 · Voice-Knowledge-Tiers

Die **Tiefe** mit der Lisa einen Betrieb kennt = Reife-Achse zur Hochwertigkeit:

| Tier | Was Lisa weiß | Quellen | Anspruch |
|---|---|---|---|
| **T1 — Generic** | Name, Adresse, Telefon, Services-Liste, Öffnungszeiten | Static + GBP | "Wir machen Sanitär in Zürich" — Commodity |
| **T2 — Branded** | + Tonalität, USPs, Notdienst-Policy, Service-Kurzbeschreibungen | + Tenant-Config | "Wir sind seit 1985 hier, Spezialgebiet Heizung" |
| **T3 — Knowledgeable** | + Prozess-Beschreibungen, Preis-Indikationen, Team-Awareness, Region-Spezifika, FAQs | + **Website-Knowledge-Extract** (kanonisch für 80%+ der Sanitär-Tiefe) | "Bei Notfall am Wochenende ist Andreas direkt erreichbar, normale Termine planen wir Mo-Fr" |
| **T4 — Long-Time-Employee** | + Edge-Cases, Customer-Stories, Tone-Matching, "wie der Chef sprechen würde" | + Founder-Verfeinerungs-Loop (Voice-Quality-Validation) | "Ja, das mit den älteren Mira-Boilern kennen wir gut, das machen wir oft, Stefan ist da unser Spezialist" |

**Standard-Ziel:** T3 für jeden Kunden. T4 für Premium / Goldstandards. T1-T2 ist Wettbewerbs-Niveau, nicht unser Differenzierer.

**Die meisten (~90%) Sanitär-Kunden haben eine umfassende Website** mit allem was Lisa wissen sollte (Services, Prozess, Spezialisierungen, Team). External Website ist **primary** Quelle für T3, **nicht** Edge-Case.

---

## §4 · G-Rules — Operationelle Regeln

Die Goldenen Regeln aus `docs/gtm/onboarding/ONBOARDING_BIBLE.md` haben unterschiedliche Reife-Stufen:

| G | Regel | Reife heute | Ziel | Migration |
|---|---|---|---|---|
| **G1** | Pre-Flight-Check 4/4 vor Termin | Doc + Run-Sheet | Skript | `pre_flight_check.mjs` mit Hard-Fail |
| **G2** | Customer sieht NIE einen anderen Customer | **Code (Gate)** ✓ | Code | TenantSwitcher hidden bei Customer-Admins |
| **G3** | Kunden-Sprache (EN/DE) durchgängig | Code | Code | Phase-1-Discovery-Field |
| **G4** | Voice-Datum dynamisch + verifiziert | **Code+Cron+Verify** ✓ | Code | Telegram-Alert bei Mismatch |
| **G5** | SMS only on confirmed-transition | Code | Code | API-Endpoint kein SMS bei Submit |
| **G6** | App leer übergeben (events=0, reservations=0) | Skript | Skript+Gate | Phase-2 fail wenn count > 0 |
| **G7** | GH-Secrets vor Cron-Setup | Manual | Skript | `pre_flight` validiert Secrets-Set |
| **G8** | Per-Tenant-Routing nach Modul | Code | Code | Modules-basierter Redirect |
| **G9** | Cross-Plattform-Pfade (`fileURLToPath`) | Code | Code+CI | Linux-Runner-Test in CI |
| **G10** | Lessons innerhalb 24h nach Kunde | Doc | Reminder | Telegram-Reminder Tag-1 |
| **G11** | Voice macht nur 100%-bestätigte Versprechen | **Skript-Scrub** | Skript+Gate | Voice-Knowledge-Coverage-Test (20 Fragen, Score) |
| **G12** | SSOT pro Datenfeld + Tier-Plan | Doc | Doc+Skript | `data_sources.md` als Phase-1-Pflicht-Deliverable |

**Reife-Stufen:** Doc → Run-Sheet-Item → Skript-Check → Automated Gate. Pro Customer-Onboarding (Phase 6 Convert) wird in einem 15-Min Founder+CC-Review entschieden, welche G-Rule eine Stufe hochgepusht wird.

---

## §5 · Reality-Gap — Wo wir vom 10/Tag-E2E entfernt sind

Ehrliche Bestandsaufnahme nach BigBen-Onboarding (28.04.2026):

| Phase | Reife | Realistic Output / Tag heute |
|---|---|---|
| 0 Scout | **3** (Skripte gut, manuelle Nacharbeit) | ~50 Candidates |
| 1 Demo-Produktion | **3** (§43 Master-Source-Brand-Overlay LIVE) | ~10-15 Videos |
| 2 Outreach | **2** (Templates, manuelle Personalisierung) | ~10-20 Mails |
| 3 Trial | **2** (provision_trial, manueller Founder-Touch) | max 5 parallel |
| 4 Onboarding | **1** (60-90 min Live-Termin, 27 Bugs bei BigBen geloggt) | **2-3 Kunden / Tag MAX** |
| 5 Operate / Retain | **0** (Konzept fehlt) | unbekannt |

**E2E-Realismus heute: 2-3 Kunden / Tag mit Founder-Aktivbeteiligung.** 10/Tag ist 4-6 Wochen weg. 20/Tag ist 8-10 Wochen weg.

### Vier strukturelle Lücken

1. **Phase-Übergänge nicht automated** — jede X→X+1-Übergabe ist Founder-Brain
2. **Quality-Gates nur in Phase 1** — Phase 2-5 haben keine QGs
3. **E2E-Quality-Gate fehlt komplett** — niemand merkt wenn Customer in Phase 4 hängt
4. **Onboarding-Self-Service existiert nicht** — 60-min Live-Termin ist Hard-Cap

---

## §6 · 6-Wochen-Roadmap (ab Founder-Rückkehr aus den Philippinen)

> **Pre-Trip (jetzt - 3 Tage):** Pre-Trip-Hardening, BigBen-Stabilisierung, Health-Score, Smoke-Tests. Siehe §7.
> **Trip (30 Tage, davon 15 ohne Laptop):** System läuft autonom. Telegram-Alerts. Paul via WhatsApp falls Notfall.
> **Rückkehr-Sprint:** Diese Roadmap.

| Woche | Fokus | Konkrete Deliverables | Outcome |
|---|---|---|---|
| **+1** | Onboarding Stufe-2→3 | `pre_flight_check.mjs`, `customer_health_check.mjs`, automatisches Phase-2-Provisioning für Sanitär (nicht nur Pub), `data_sources.md` Pflicht-Deliverable | 1. Sanitär-Customer kann onboarded werden (analog BigBen-Workflow) |
| **+2** | Self-Service-MVP Phase 4 | `OnboardingWizard.tsx` als Customer-Self-Service-Frontend (Telefon-Forwarding mit Anbieter-Detect, App-Install mit OS-Detect, Test-Anruf-Flow), Founder bekommt Telegram nach jedem Schritt | 60-min Live-Termin auf 15-min Verifikation reduziert |
| **+3** | Phase-Übergänge automatisieren | Phase-2→3, Phase-3→4, Phase-4→5 mit Skript-Triggern + Telegram-Hand-offs. Customer-Health-Score-Daily | Founder ist Backstop, nicht Frontline |
| **+4** | Voice-Knowledge-Tier T3 | `website_knowledge.json` als Phase-2-Output (crawl + LLM-extract). 20-Fragen-Coverage-Test als Smoke-Gate. Pro Customer T3-Score erreichen. | High-End-Voice ist Standard |
| **+5** | Sourcing-Skalierung | Scout-Engine 200+/Tag, ICP-Filter automatisch, Pipeline 1→2 ohne Founder-Touch für Standard-Profile | Funnel füllt sich für 10/Tag-Output |
| **+6** | Phase-5 Operate-Maschine MVP | Customer-Health-Score per-Tenant, Renewal-Reminder, Churn-Detection, Monthly-Bericht an Founder | Customer bleibt langfristig, nicht nur kurzfristig |
| **+8-10** | Skalierung + Refinement | 20/Tag E2E-Stabilisierung. T4-Pfad für Premium-Kunden. | Maschine läuft selbstständig |

**North Star:** Founder kann 5 Kunden/Woche onboarden ohne Kontextwechsel innerhalb 6 Wochen, 20 Kunden/Woche innerhalb 10 Wochen.

---

## §7 · Pre-Trip-Hardening (3 Tage vor Abreise)

System muss 30 Tage ohne Founder laufen, davon 15 Tage ohne Laptop. Paul via WhatsApp als einzige Inbound-Linie.

| Was | Status heute | Pre-Trip-TODO |
|---|---|---|
| Voice-Cron 3× tgl. + Telegram | ✅ | nichts — du siehst täglich Bestätigung |
| Morning-Report | ✅ (28.04. gefixt) | nichts |
| Sentry Error-Catch | ✅ | spezifischer "founder-offline-window" Tag in Sentry damit Alerts priorisiert werden |
| Reservation-Polling | ✅ | nichts |
| Lifecycle-Tick | ✅ | nichts |
| **Customer-Health-Score** für BigBen | ❌ | **Daily-Telegram (08:00 CEST): "BigBen Health 🟢/🟡/🔴" mit 5 Checks (Voice live? letzter Reservation-Sync OK? Pauls Push letzte 24h aktiv? pub_events count > 0? website 200?)** |
| **Pre-Trip E2E-Smoke-Test** | ❌ | **3 Tage vor Abreise: Test-Anruf, Web-Reservation, App-Confirm, SMS-Empfang verifizieren** |
| **Last-Stable-Tag** | ❌ | git tag `pre-trip-stable` setzen vor Abreise — Roll-Back-Anker |
| **Sentry-Tag** | ❌ | Sentry-SDK-Tag `founder_offline_window=true` setzen ab Tag-3 für 30 Tage |
| **Auto-Reply-Plan für WhatsApp** | ❌ | optional: Auto-Antwort "wir antworten innerhalb 24h" während Offline-Tagen |

---

## §8 · Pipeline ↔ Onboarding Feedback-Loop

Die zwei Maschinen müssen sich gegenseitig informieren — sonst wachsen sie auseinander.

| Pipeline → Onboarding | Onboarding → Pipeline |
|---|---|
| `prospect_card.json` → `onboarding_plan.md` | `lessons_learned.md` Pattern → Pipeline-Demo-Script reflektiert "echte Schmerzen" |
| Modus (1/2/3) → Onboarding-Tier-Plan-Default | Customer-Pflege-Bereitschaft → Pipeline-Outreach-Promise |
| Prospect ist Pub → Onboarding lädt Pub-Skripte | Sanitär-Customer pflegt GBP nicht → Pipeline ändert Promise |

Konkret: beim Übergang Phase-3-Trial → Phase-4-Convert wird `prospect_card.json` aufgelöst in `onboarding_plan.md` + `data_sources.md` + Tier-Plan. Dieses Übergangs-Skript ist die formale Schnittstelle der zwei Maschinen.

---

## §9 · Anker

- **Pipeline-Bible:** `docs/gtm/pipeline/PIPELINE_BIBLE.md`
- **Onboarding-Bible:** `docs/gtm/onboarding/ONBOARDING_BIBLE.md`
- **Onboarding-Lessons:** `docs/gtm/onboarding/lessons_learned.md`
- **Onboarding-Operating-Model:** `docs/gtm/onboarding/operating_model.md`
- **Run-Sheet-Template:** `docs/gtm/onboarding/customer_runbook_template.md`
- **Status:** `docs/STATUS.md`
- **Business-Briefing:** `docs/business_briefing.md` §7 Zwei-Maschinen
