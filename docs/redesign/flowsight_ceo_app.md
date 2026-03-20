# FlowSight CEO-App — Gesamtplan

**Version:** 1.0 | **Datum:** 2026-03-20
**Status:** Plan fertig. Phase 1 bereit zur Umsetzung.
**Pfad:** `docs/redesign/flowsight_ceo_app.md`

---

## Founder Tasks (VOR oder PARALLEL zur Umsetzung)

| # | Task | Wann nötig | Beschreibung |
|---|------|-----------|-------------|
| F1 | **Anthropic API Key** | Phase 6 | Account erstellen, API Key für CEO-App AI-Features. `ANTHROPIC_API_KEY` auf Vercel. |
| F2 | **OpenAI API Key** | Phase 6 | Falls GPT-4o gewünscht: Account + Key. `OPENAI_API_KEY` auf Vercel. |
| F3 | **Vercel Pro Upgrade** | Phase 5 | Für Usage API + längere Logs + mehr Serverless-Timeout. $20/Monat. |
| F4 | **Supabase Pro Upgrade** | Phase 5 | Für Backups, mehr Storage, höhere API-Limits. $25/Monat. |
| F5 | **Mapbox Token** (optional) | Phase 2 | Nur wenn Mapbox statt Leaflet/OSM. Gratis bis 50k Loads/Monat. |
| F6 | **Initiale Kostendaten** | Phase 4 | Monatliche Vendor-Kosten der letzten 3 Monate (Twilio, Retell, Peoplefone, eCall). Wird in Finanzen-Seite eingepflegt. |
| F7 | **Sentry API Token** | Phase 5 | Für Sentry-Digest in Monitoring. Project-scoped Read-Only Token. |
| F8 | **Web Push VAPID Keys** | Phase 7 | Generiert CC automatisch. Founder muss nur Push-Berechtigung im Browser akzeptieren. |

**Keine Founder-Action nötig für Phase 1-3.** Alles läuft mit bestehender Infrastruktur.

---

## Context

Der Founder braucht eine **Metaebene** über allen Betrieben. Heute ist die CEO-Sicht verstreut: Morning Report (Telegram), Health Check (API), Tenant-Switcher (OPS), Kosten (Docs), Pipeline (CSV). Bei 7 Betrieben geht das. Bei 50 nicht.

**Ziel:** Eine eigene PWA (`/ceo`) — das FlowSight-Nervenzentrum. Ganzheitlicher Business-Überblick. Mobile-first, skalierbar für 500+ Betriebe, visuell high-end.

**Architektur:** Route Group im bestehenden App (`/ceo/*`). Gleiche Auth, gleicher Deploy, gleiche DB. CEO-Guard: `isAdmin === true`. Cross-Tenant-Queries via `getServiceClient()`.

---

## Umsetzungsphasen

### Phase 1: Foundation + Pulse (~3-4h)

**Ergebnis:** CEO installiert PWA auf Handy. Sieht live Ampel, KPIs, Alerts, Tasks, Notizen.

| # | Deliverable | Files |
|---|-------------|-------|
| 1.1 | **CEO Route-Group + Auth-Guard** | `app/ceo/layout.tsx`, `app/ceo/page.tsx`, `app/ceo/(auth)/layout.tsx`, `app/ceo/(auth)/login/page.tsx`, `app/ceo/(dashboard)/layout.tsx` |
| 1.2 | **CeoShell** — Sidebar (Navy, 6 Nav-Items, Mobile Hamburger, Dark Mode Toggle) | `components/ceo/CeoShell.tsx` |
| 1.3 | **PWA Manifest + Icon** — FlowSight-branded, Scope `/ceo` | `api/ceo/pwa/manifest/route.ts`, `api/ceo/pwa/icon/route.tsx` |
| 1.4 | **Design System Grundgerüst** — Framer Motion, Dark Mode, Glassmorphism-Cards | `npm install framer-motion canvas-confetti`, Tailwind dark-mode Config |
| 1.5 | **Pulse API** — Live-KPIs (Morning-Report-Logik als Endpoint) | `api/ceo/pulse/route.ts`, `lib/ceo/severityEngine.ts` |
| 1.6 | **PulseView** — Ampel + 4 KPI-Cards (Cases, Trials, Health, Reviews) + Alert-Feed | `components/ceo/PulseView.tsx`, `TrafficLight.tsx`, `AlertFeed.tsx`, `CeoKpiCard.tsx` |
| 1.7 | **Live Activity Stream** — Echtzeit-Feed (Polling 30s) als Tab auf Pulse | Integriert in PulseView |
| 1.8 | **Quick Notes** — Floating "+" Button, Notiz-Feld, letzte 5 auf Pulse | `api/ceo/notes/route.ts` |
| 1.9 | **Persönliche Task-Liste** — "Meine Aufgaben heute", Quick-Add | `api/ceo/tasks/route.ts` |
| 1.10 | **Shareable Snapshot** — Pulse als Bild exportieren (html2canvas + Share API) | In PulseView |
| 1.11 | **Offline-Cache** — Service Worker cached Pulse-Response | SW-Erweiterung |
| 1.12 | **DB-Migrationen** | `ceo_pulse_snapshots`, `ceo_notes`, `ceo_tasks` |
| 1.13 | **Morning Report: Snapshot schreiben** | `morning_report.mjs` Erweiterung |
| 1.14 | **AI-Provider Interface** (leer, für Phase 6) | `lib/ai/types.ts`, `lib/ai/registry.ts` |

---

### Phase 2: Betriebe (~3-4h)

**Ergebnis:** Alle Betriebe auf einen Blick. Health Score, Onboarding-Checklist, Geo-Karte, Deep-Dive.

| # | Deliverable | Files |
|---|-------------|-------|
| 2.1 | **Tenant API** — Enriched Liste (Case-Stats, Review-Rate, Staff, Trial-Status) | `api/ceo/tenants/route.ts`, `lib/ceo/tenantEnricher.ts` |
| 2.2 | **TenantGrid + TenantCard** — Card-Layout, Status-Badge, Mini-KPIs, Health Score Ring | `components/ceo/TenantGrid.tsx`, `TenantCard.tsx` |
| 2.3 | **Customer Health Score** — Automatisch berechnet (6 Signale, 0-100), Churn-Prediction | In `tenantEnricher.ts` |
| 2.4 | **Onboarding-Checklist** — 10 Standard-Steps pro Tenant, Progress-Bar | `api/ceo/tenants/[id]/onboarding/route.ts` |
| 2.5 | **TenantDeepDive** — Module, Trial-History, Case-Breakdown, Staff, Checklist | `app/ceo/(dashboard)/betriebe/[id]/page.tsx`, `components/ceo/TenantDeepDive.tsx` |
| 2.6 | **Schweiz-Karte** — Leaflet/OSM, farbige Pins, Clustering, Toggle Grid↔Karte | `components/ceo/SwissMap.tsx`, `npm install leaflet react-leaflet` |
| 2.7 | **Global Search (Cmd+K)** — Betriebe, Cases, Notizen durchsuchen | `components/ceo/GlobalSearch.tsx` |
| 2.8 | **Pinned Favoriten** — Stern-Icon, Favoriten oben im Grid + auf Pulse | DB: `ceo_favorites` |
| 2.9 | **Jump-to-Leitsystem** — Cookie setzen + `/ops/cases` öffnen | Button auf TenantCard |
| 2.10 | **Whitelabel Preview** — iframe-Preview ohne Tenant-Switch | Overlay auf TenantCard |
| 2.11 | **One-Tap Dial** — `tel:` Links neben jedem Betrieb | UI-Element |
| 2.12 | **DB-Migrationen** | `ceo_onboarding_steps`, `ceo_favorites` |

---

### Phase 3: Pipeline + Kalender (~2-3h)

**Ergebnis:** Vertrieb steuerbar. Smart-Call-Liste. CEO-Kalender. Batch Provisioning.

| # | Deliverable | Files |
|---|-------------|-------|
| 3.1 | **Pipeline API** — Funnel-Daten aus `tenants` (trial_status Gruppierung) | `api/ceo/pipeline/route.ts`, `lib/ceo/pipelineQuery.ts` |
| 3.2 | **FunnelView** — Scout→Kontakt→Trial→Convert Visualisierung | `components/ceo/FunnelView.tsx` |
| 3.3 | **SmartCallList** — "Wen muss ich heute anrufen?" (Day-2, Day-10, Expiring) | `components/ceo/SmartCallList.tsx` |
| 3.4 | **Conversion-Rate Tracking** — Trial→Paid Trend (aus Snapshots) | In FunnelView |
| 3.5 | **CEO-Kalender** — Trial-Milestones, Tasks, Follow-ups als Kalender-View | `components/ceo/CeoCalendar.tsx` |
| 3.6 | **Batch Provisioning** — CSV-Upload → Queue → Multi-Tenant-Provisioning | `api/ceo/batch-provision/route.ts`, `components/ceo/BatchProvisioner.tsx` |

---

### Phase 4: Finanzen + Analytics (~2-3h)

**Ergebnis:** MRR, Kosten, P&L, Unit Economics, Feature Usage. Gamification.

| # | Deliverable | Files |
|---|-------------|-------|
| 4.1 | **Finanzen API** — MRR (live), Kosten (aus `ceo_costs`), P&L | `api/ceo/finanzen/route.ts` |
| 4.2 | **MRR-Chart** — 12-Monats-Trend (aus Snapshots) | `components/ceo/MrrChart.tsx`, `npm install recharts` |
| 4.3 | **CostBreakdown** — Vendor-Tabelle + Eingabeformular | `components/ceo/CostBreakdown.tsx` |
| 4.4 | **Upgrade-Trigger-Ampel** — % Nutzung vs. Free-Limit pro Vendor | In Finanzen-Page |
| 4.5 | **Unit Economics** — CAC, LTV, LTV:CAC, Payback, Churn Rate, NRR (7 Kacheln) | In Finanzen-Page |
| 4.6 | **Feature Usage Analytics** — Welche Module werden genutzt? Sparklines pro Modul | In TenantDeepDive erweitert |
| 4.7 | **Gamification / Milestones** — MRR-Badges, Kunden-Milestones, Streaks, Konfetti | `components/ceo/Milestones.tsx` |
| 4.8 | **DB-Migrationen** | `ceo_costs`, `ceo_milestones` |

---

### Phase 5: Monitoring + Admin (~2-3h)

**Ergebnis:** System komplett steuerbar. Health, Sentry, Audit-Log, Integration Hub.

| # | Deliverable | Files |
|---|-------------|-------|
| 5.1 | **HealthPanel** — Live Health + History (aus Snapshots), Uptime-Tracking | `components/ceo/HealthPanel.tsx` |
| 5.2 | **Sentry-Digest** — Letzte 24h Errors via Sentry API, gruppiert nach Area | `api/ceo/monitoring/sentry-digest/route.ts` |
| 5.3 | **Tick-History** — Lifecycle Tick Log (letzte Runs, Failures) | `api/ceo/monitoring/tick-status/route.ts` |
| 5.4 | **Audit Log** — Wer hat was wann gemacht (Middleware-Pattern) | `components/ceo/AuditLog.tsx` |
| 5.5 | **Script-Runner** — Morning Report, Tick, Smoke Tests manuell triggern | `api/ceo/admin/run-script/route.ts`, `components/ceo/ScriptRunner.tsx` |
| 5.6 | **Env-Status-Dashboard** — Was ist konfiguriert, was fehlt | `api/ceo/admin/env-status/route.ts` |
| 5.7 | **Deploy-Info** — Letzter Vercel Deploy, Commit SHA, Branch | `api/ceo/admin/deploy-info/route.ts` |
| 5.8 | **Integration Hub** — Service-Cards für alle Vendor (Status, Usage, Errors) | `components/ceo/IntegrationHub.tsx` |
| 5.9 | **DB-Migrationen** | `ceo_audit_log` |

**Founder Tasks:** F3 (Vercel Pro), F4 (Supabase Pro), F7 (Sentry Token)

---

### Phase 6: AI-Copilot + Reports (~3-4h)

**Ergebnis:** AI analysiert, kommentiert, triagiert. Monthly Report als PDF.

| # | Deliverable | Files |
|---|-------------|-------|
| 6.1 | **AI-Provider aktivieren** — Anthropic + OpenAI Implementierung | `lib/ai/providers/anthropic.ts`, `openai.ts` |
| 6.2 | **AI-Kosten-Tracking** — Jeder Call geloggt (Tokens, Kosten, Latenz) | `lib/ai/middleware/costTracker.ts` |
| 6.3 | **Pulse-Kommentar** — AI-generierte 3-Satz-Zusammenfassung morgens | In PulseView |
| 6.4 | **Error-Triage** — Sentry-Error → AI analysiert, schlägt Fix vor | In Monitoring |
| 6.5 | **Support-Antwort-Draft** — GitHub Issue → AI-Draft-Antwort | In Admin |
| 6.6 | **Revenue Forecast** — Pipeline-basierte MRR-Prognose, Szenario-Analyse | In Finanzen erweitert |
| 6.7 | **Monthly Report PDF** — Ein-Klick-Report (Executive Summary, Zahlen, Trends) | `api/ceo/reports/monthly/route.ts` |
| 6.8 | **DB-Migrationen** | `ceo_ai_usage` |

**Founder Tasks:** F1 (Anthropic Key), F2 (OpenAI Key)

---

### Phase 7: Notifications + Kommunikations-Hub (~2-3h)

**Ergebnis:** Zentrales Notification Center. Alle Kommunikation auf einen Blick.

| # | Deliverable | Files |
|---|-------------|-------|
| 7.1 | **In-App Notification Feed** — Bell Icon + Badge, chronologisch, filterbar | `components/ceo/NotificationFeed.tsx` |
| 7.2 | **Push Notifications** — Web Push API, Service Worker, Subscription-Management | `api/ceo/push/route.ts`, `npm install web-push` |
| 7.3 | **Notification Preferences** — Pro Kanal, pro Severity, Ruhezeit | In Settings |
| 7.4 | **Kommunikations-Hub** — Alle E-Mails, SMS, Calls pro Betrieb | `components/ceo/CommsHub.tsx` |
| 7.5 | **DB-Migrationen** | `ceo_notifications`, `ceo_push_subscriptions`, `ceo_comms_log` |

**Founder Tasks:** F8 (Push-Berechtigung akzeptieren)

---

### Phase 8: Knowledge Base + Vendor-API-Integration (~2h)

**Ergebnis:** Runbooks in der App. Vendor-Daten automatisch statt manuell.

| # | Deliverable | Files |
|---|-------------|-------|
| 8.1 | **Knowledge Base** — Durchsuchbare Runbooks (Markdown→HTML), zuletzt geöffnet | `app/ceo/(dashboard)/knowledge/page.tsx` |
| 8.2 | **AI-Powered Q&A** — "Wie onboarde ich einen Kunden?" → Antwort aus Runbooks | AI-Feature auf Knowledge-Seite |
| 8.3 | **Vercel Usage API** — Bandwidth, Invocations auto-sync | In Integration Hub |
| 8.4 | **Supabase Billing API** — Storage, API Requests auto-sync | In Integration Hub |
| 8.5 | **Sentry API** — Events/day, Quota auto-sync | In Integration Hub |
| 8.6 | **Outlook/Google Calendar Sync** — CEO-Kalender mit externem Kalender verbinden | In CEO-Kalender |

---

### Phase 9: Forecast + Intelligence (~2-3h)

**Ergebnis:** Vorausschauende Intelligenz. Churn-Prediction, Anomalie-Erkennung, Outreach-Drafts.

| # | Deliverable | Files |
|---|-------------|-------|
| 9.1 | **Revenue Forecast** — Best/Expected/Worst Szenario (3/6/12 Monate) | In Finanzen erweitert |
| 9.2 | **Churn Prediction** — Health Score <40 für >14d → Alarm + Empfehlung | AI-Feature auf Betriebe |
| 9.3 | **Anomalie-Erkennung** — Case-Drop, Review-Einbruch, SMS-Fails automatisch | AI-Feature auf Monitoring |
| 9.4 | **Outreach-Drafts** — Personalisierte E-Mail pro Prospect via AI | AI-Feature auf Pipeline |
| 9.5 | **Prospect-Scoring** — AI analysiert Website, Reviews → ICP-Score schärfen | AI-Feature auf Pipeline |
| 9.6 | **Voice-Agent-QA** — AI reviewt Transkripte, bewertet Qualität | AI-Feature auf Betriebe |

---

### Phase 10: Team-Management (~2h)

**Ergebnis:** Wenn FlowSight Mitarbeiter hat: Aufgaben, Workload, Kapazität.

| # | Deliverable | Files |
|---|-------------|-------|
| 10.1 | **Team-Übersicht** — Wer arbeitet woran? Workload-Verteilung | `app/ceo/(dashboard)/team/page.tsx` |
| 10.2 | **Aufgaben-Zuweisung** — CEO-Tasks an Mitarbeiter delegieren | Erweiterung ceo_tasks |
| 10.3 | **Kapazitäts-Dashboard** — Wie viele Onboardings kann das Team diese Woche? | Berechnung aus Tasks + Staff |
| 10.4 | **Bottleneck-Alerts** — "5+ Trials aktiv, Outreach verlangsamen" | AI-Feature |

---

## Zeitübersicht

| Phase | Scope | Geschätzt |
|-------|-------|-----------|
| 1 | Foundation + Pulse | ~3-4h |
| 2 | Betriebe | ~3-4h |
| 3 | Pipeline + Kalender | ~2-3h |
| 4 | Finanzen + Analytics | ~2-3h |
| 5 | Monitoring + Admin | ~2-3h |
| 6 | AI-Copilot + Reports | ~3-4h |
| 7 | Notifications + Comms | ~2-3h |
| 8 | Knowledge + Vendor-APIs | ~2h |
| 9 | Forecast + Intelligence | ~2-3h |
| 10 | Team-Management | ~2h |
| **Total** | **27 Feature-Bereiche** | **~23-31h** |

---

## Design System — Visual Language

### Brand-Achse
| Token | Wert | Verwendung |
|-------|------|-----------|
| Primary | Navy `#1a2744` | Sidebar, Header, Buttons |
| Accent | Gold `#c8965a` | Highlights, Milestones, Stars |
| Success | Emerald `#10b981` | Ampel grün, Health Score, Erledigt |
| Warning | Amber `#f59e0b` | Ampel gelb, Reviews, Trials |
| Danger | Red `#ef4444` | Ampel rot, Errors, Churn |
| Surface Light | `#f8fafc` | Hintergrund (Light Mode) |
| Surface Dark | `#0f172a` | Hintergrund (Dark Mode) |

### Micro-Animations (Framer Motion)
- Page Transitions: fade + slide-up (200ms, ease-out)
- Card Hover: scale 1.01 + shadow elevation
- KPI Count-Up: Zahlen animieren von 0 zum Wert (400ms)
- Traffic Light: Pulse-Glow auf aktiver Farbe
- Skeleton Shimmer: statt Spinner
- Pull-to-Refresh: native-feel auf Mobile
- Konfetti: canvas-confetti für Milestones

### Card Design
- Glassmorphism: `backdrop-blur-sm bg-white/80 dark:bg-slate-800/80`
- `rounded-2xl`, `shadow-sm` → `shadow-md` on hover → `shadow-lg` on active
- `border border-gray-200/50 dark:border-slate-700/50`

### Typography
- Headings: Inter extrabold (Zahlen), Inter bold (Titel)
- Body: Inter normal, text-sm
- Mono: JetBrains Mono (Case-IDs, technische Werte)

---

## DB-Tabellen (Übersicht)

| Tabelle | Phase | Zweck |
|---------|-------|-------|
| `ceo_pulse_snapshots` | 1 | Tägliche KPI-Snapshots für Trends |
| `ceo_notes` | 1 | Quick Notes (verknüpfbar mit Tenant) |
| `ceo_tasks` | 1 | Persönliche CEO-Aufgaben |
| `ceo_onboarding_steps` | 2 | Onboarding-Checklist pro Tenant |
| `ceo_favorites` | 2 | Pinned/Favoriten Tenants |
| `ceo_costs` | 4 | Monatliche Vendor-Kosten |
| `ceo_milestones` | 4 | MRR/Kunden-Milestones |
| `ceo_audit_log` | 5 | Audit-Trail (Compliance) |
| `ceo_ai_usage` | 6 | AI-Kosten-Tracking (Tokens, Modell, Feature) |
| `ceo_notifications` | 7 | In-App Notification Feed |
| `ceo_push_subscriptions` | 7 | Web Push Subscriptions |
| `ceo_comms_log` | 7 | E-Mail/SMS Delivery-Status |

---

## AI-Provider Architektur

```
src/web/src/lib/ai/
  types.ts                    # AiProvider Interface, Message, AiOpts
  registry.ts                 # Feature → Provider+Model Mapping
  providers/
    anthropic.ts              # Claude (Opus, Sonnet, Haiku)
    openai.ts                 # GPT-4o, GPT-4-mini
  middleware/
    costTracker.ts            # Loggt in ceo_ai_usage
    rateLimiter.ts            # Budget-Limit pro Tag/Feature
```

**Model-Config (austauschbar ohne Code-Änderung):**
```typescript
const AI_CONFIG = {
  triage:        { provider: "anthropic", model: "claude-haiku-4-5" },
  analysis:      { provider: "anthropic", model: "claude-opus-4-6" },
  outreach:      { provider: "openai",    model: "gpt-4o" },
  pulse_comment: { provider: "anthropic", model: "claude-haiku-4-5" },
  forecast:      { provider: "openai",    model: "gpt-4o" },
};
```

---

## Kritische Files zum Klonen/Reuse

| Was | Source | Reuse für |
|-----|--------|-----------|
| Sidebar-Pattern | `OpsShell.tsx` | `CeoShell.tsx` |
| Auth-Guard | `app/ops/(dashboard)/layout.tsx` | `app/ceo/(dashboard)/layout.tsx` |
| KPI-Query-Logik | `morning_report.mjs` | `severityEngine.ts` + `/api/ceo/pulse` |
| PWA Manifest | `api/ops/pwa/manifest/route.ts` | `api/ceo/pwa/manifest/route.ts` |
| PWA Icon | `api/ops/pwa/icon/route.tsx` | `api/ceo/pwa/icon/route.tsx` |
| Tenant-Query | `api/ops/tenants/route.ts` | `api/ceo/tenants/route.ts` |
| KPI-Card-Pattern | `FlowBar.tsx` | `CeoKpiCard.tsx` |

---

## Design-Prinzipien

| Prinzip | Umsetzung |
|---------|-----------|
| **CEO sieht alles, editiert wenig** | Read-heavy. Writes: Kosten, Tasks, Notizen, Scripts |
| **Jede Karte ist ein Portal** | Klick auf Metrik → Drill-down in Detail |
| **Mobile-first** | 2x2 Grid Mobile, 4 Spalten Desktop. Min 44px Touch-Targets |
| **FlowSight-Branding** | Kein Identity-Contract R4 (CEO-App, nicht Kunden-facing) |
| **Skalierbar** | Pagination, Search, Filter. Server-side bei 50+ Tenants |
| **Inkrementell** | Jede Phase standalone deploybar |
| **Joy to use** | Framer Motion, Konfetti, Glassmorphism, Dark Mode, Sounds |
| **AI-first** | Model-agnostisch, austauschbar, Kosten-transparent |
