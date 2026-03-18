# Scaling & Access — Multi-Tenant Admin, Support, Dev/Prod

**Erstellt:** 2026-03-18
**Letztes Update:** 2026-03-18
**Owner:** Founder + CC
**Status:** IN ARBEIT

---

## Zweck

FlowSight skaliert in 2-3 Wochen auf 5-10 Betriebe/Tag Outreach. Dieses Dokument definiert:
1. **Tenant-Switcher** — CEO kann in der PWA zwischen Betrieben wechseln
2. **Support-System** — Betriebe können Hilfe anfordern, CC bearbeitet Issues autonom
3. **Dev/Prod-Trennung** — Klare visuelle Trennung, keine Cross-Tenant-Fehler
4. **CC-Anbindung** — Maximale Effizienz: CEO → Bug-Report → GitHub Issue → CC Fix → Deploy
5. **Pipeline-Integration** — Nahtlos mit `machine_manifest.md` (Provisioning → QA → Live)

---

## IST-Stand

| Thema | Status |
|-------|--------|
| Admin-Login | Fest an Weinberger (JWT `tenant_id = fc4ba994`) |
| Tenant-Wechsel | Unmöglich ohne Logout/Login mit anderem User |
| Support im Leitsystem | Nicht vorhanden |
| Dev/Prod-Trennung | Nur `is_demo` Flag auf Cases. Kein visueller Indikator. |
| Cross-Tenant-Fehler | Mehrfach aufgetreten (Brunner HT, Dörfler AG Leak) |
| CC-Anbindung | Verbal per Sprachnachricht/Chat. Kein strukturierter Bug-Report. |
| Pipeline-QA | Manuell: Logout → Login → Prüfen. Umständlich. |

---

## Zielbild

- CEO öffnet PWA → sieht Dropdown mit allen Betrieben → wechselt per Tap
- Branding (Farben, Name, Cases, Settings, Staff) schalten sofort um
- Amber-Banner zeigt klar: "Du siehst gerade Brunner HT, nicht Weinberger"
- Betriebe sehen NUR ihr eigenes System (kein Switcher, kein Banner)
- "Hilfe"-Seite im Leitsystem → Betrieb meldet Problem → GitHub Issue mit vollem Kontext
- CEO sieht "Aktualisiert vor 2h" im Sidebar-Footer
- Admin Quick-Report: Ein Klick → Bug mit Kontext gemeldet
- Error Boundary: App-Crash → Sentry-Event automatisch

---

## Architektur-Entscheidung: Cookie-Switcher

**Mechanik:** HttpOnly Cookie `fs_active_tenant` überschreibt JWT `tenant_id` NUR für `role=admin`.

**Warum:** `resolveTenantScope.ts` ist der einzige Choke-Point — alle 10+ API-Routes und alle Dashboard-Seiten lesen davon. Eine Änderung dort kaskadiert automatisch überall hin.

**Sicherheit:**
1. Cookie nur gelesen wenn JWT `role=admin` → nicht spoofbar
2. HttpOnly → kein XSS-Zugriff
3. RLS als zweite Verteidigungslinie
4. E-Mail-Versand immer `case.tenant_id` → Cookie irrelevant für E-Mails
5. Techniker-Micro-Surface → HMAC-Auth, nicht betroffen
6. Concurrent Sessions: Cookie per-Device (Handy ≠ Laptop)

---

## Umsetzungs-Blöcke

### Block 1: Tenant-Scope + Switch-API (~2h)

| # | Task | Datei | Status |
|---|------|-------|--------|
| 1.1 | `resolveTenantScope.ts` — Cookie-Override für Admin | `src/web/src/lib/supabase/resolveTenantScope.ts` | **DONE** |
| 1.2 | `GET /api/ops/tenants` — Tenant-Liste (Admin-only) | `src/web/app/api/ops/tenants/route.ts` | **DONE** |
| 1.3 | `POST /api/ops/switch-tenant` — Cookie-Setter (HttpOnly) | `src/web/app/api/ops/switch-tenant/route.ts` | **DONE** |

### Block 2: UI — Tenant-Switcher + Layout (~3h)

| # | Task | Datei | Status |
|---|------|-------|--------|
| 2.1 | `TenantSwitcher.tsx` — Dropdown (Mobile-first, 44px Touch) | `src/web/src/components/ops/TenantSwitcher.tsx` | **DONE** |
| 2.2 | `OpsShell.tsx` — Switcher einbinden + isAdmin Prop | `src/web/src/components/ops/OpsShell.tsx` | **DONE** |
| 2.3 | `layout.tsx` — Scope-basierte Identity (statt JWT-basiert) | `src/web/app/ops/(dashboard)/layout.tsx` | **DONE** |
| 2.4 | Impersonation-Banner (Amber, sticky) | In OpsShell integriert | **DONE** |
| 2.5 | Fallübersicht-Konsistenz — Cookie auch in `/ops/faelle` | `src/web/app/ops/(dashboard)/faelle/page.tsx` | **DONE** |

### Block 3: Support-System ("Hilfe") (~2h)

| # | Task | Datei | Status |
|---|------|-------|--------|
| 3.1 | Nav-Item "Hilfe" in OpsShell | `src/web/src/components/ops/OpsShell.tsx` | **DONE** |
| 3.2 | Support-Seite (FAQ + Formular) | `src/web/app/ops/(dashboard)/hilfe/page.tsx` | **DONE** |
| 3.3 | Support-API (GitHub Issue + Resend Fallback) | `src/web/app/api/ops/support/route.ts` | **DONE** |

### Block 4: CC-Anbindung (~2h)

| # | Task | Datei | Status |
|---|------|-------|--------|
| 4.1 | Admin Quick-Report Button (Bug-Icon oben rechts) | → Nutzt Support-API (/ops/hilfe) | **DONE** (via Hilfe-Seite) |
| 4.2 | Deploy-Status im Sidebar-Footer (Build SHA) | `src/web/src/components/ops/OpsShell.tsx` | **DONE** |
| 4.3 | Error Boundary (Sentry Auto-Report + Fallback-UI) | Phase 2 — Sentry bereits integriert | GEPARKT |

### Block 5: Dokumentation + SSOT (~30min)

| # | Task | Datei | Status |
|---|------|-------|--------|
| 5.1 | modules_contract.md (alle Keys + Typen + Defaults) | `docs/architecture/contracts/modules_contract.md` | OFFEN |
| 5.2 | STATUS.md + ticketlist.md + plan_Leitsystem.md Update | Diverse SSOT-Docs | OFFEN |

**Status:** Block 1-4 DONE. Block 5 (Docs) nach Deploy.

---

## Tipps & Tricks (Implementierungs-Hinweise)

1. **"Zuletzt"-Sektion:** Cookie `fs_recent_tenants` (JSON-Array, max 3 UUIDs). Kein DB-Write.
2. **Deploy-Timestamp:** `process.env.VERCEL_GIT_COMMIT_SHA` + Build-Time → kein extra API-Call.
3. **GITHUB_ISSUES_TOKEN:** Liegt auf Vercel + .env.local. Env-Var-Name: `GITHUB_ISSUES_TOKEN`.
4. **Default Tenant exkludieren:** `slug !== "default"` im Tenant-Liste-API.
5. **Fallback Support:** Ohne GITHUB_ISSUES_TOKEN → Resend-E-Mail an Founder.
6. **PWA-Name nach Switch:** Manifest ist dynamisch → passt sich automatisch an.

---

## Mobile-First

- Switcher im Brand-Header: grosser Touch-Target (min 44px), kein Scrollen
- Impersonation-Banner: sticky top, klar auf 375px
- Support-Formular: volle Breite, grosse Buttons
- CEO am Handy: Tenant wechseln → Cases prüfen → Support beantworten → zurück

---

## Pipeline-Skalierung (machine_manifest.md)

| Phase | Switcher-Nutzen |
|-------|-----------------|
| Provisioning | Neuer Tenant erscheint sofort im Dropdown |
| QA | "Zuletzt"-Sektion → schnelles Durchklicken |
| Support | Betrieb meldet Problem → GitHub Issue → CC fixt → Deploy |
| Monitoring | Deploy-Status im Footer → CEO sieht ob Fix live ist |

**Zukunft (vorbereitet, nicht jetzt):**
- Tenant-Health-Übersicht (Nav-Punkt "Betriebe", disabled)
- QA-Checkliste im Dropdown (grüner Haken wenn E2E bestanden)
- Batch-QA-Workflow (5 Tenants morgens → alle schnell prüfen)

---

## Skalierung

| Tenants | UI | Nötige Änderung |
|---------|-----|-----------------|
| 5-20 | Dropdown mit "Zuletzt" | Keine |
| 20-50 | Dropdown + Suche | Textfilter |
| 50-100 | Eigene Seite + Health | Tenant-Liste-Seite |
| 100+ | Suche + Favoriten + Teams | Erweiterte Verwaltung |
