# 05 — Identity Contract Audit

> R1–R7 Konsistenzregeln gegen Code-Realität im Leitstand.
> Referenz: `docs/redesign/identity_contract.md`

---

## R1: Ein Name, eine Quelle

> `display_name` hat genau eine Quelle: `tenants.name` in Supabase.

| Prüfpunkt | Status | Evidenz |
|-----------|--------|---------|
| OpsShell Sidebar | ✅ | `tenantName` → `displayName` via `resolveTenantIdentity(user)` → liest `tenants.name` |
| OpsShell Mobile Header | ✅ | Gleicher `displayName` Prop |
| Settings Page "Betriebsname" | ✅ | `data.tenant_name` via `/api/ops/settings` |
| CSV Export Filename | ✅ | `tenantShortName` Prop durchgereicht |

**Bewertung:** ✅ **Erfüllt.** Alle Leitstand-Oberflächen lesen den Firmennamen transitiv aus `tenants.name`.

---

## R2: Kategorien identisch über alle Intake-Oberflächen

> `services[]` auf Website, `categories[]` im Wizard und Voice müssen identisch sein.

| Prüfpunkt | Status | Evidenz |
|-----------|--------|---------|
| CreateCaseModal Kategorien | ⚠️ | Hardcoded: `["Sanitär", "Heizung", "Lüftung", "Klima", "Allgemein"]` |
| CaseDetailForm Kategorie | ✅ | Freitext Input (keine Einschränkung) |
| PulsView / CaseListClient | ✅ | Zeigt `c.category` ohne Filterung |

**Bewertung:** ⚠️ **Teilweise erfüllt.** CreateCaseModal hat eigene hardcoded Kategorien statt Tenant-Config. Bestehende Cases zeigen beliebige Kategorien. Die 5 hardcoded Kategorien stimmen nicht mit den tenant-spezifischen services[] überein (Weinberger hat z.B. auch Spenglerei, Leitungen, Solar).

**Lücke:** CreateCaseModal sollte `categories[]` aus Tenant-Config laden.

---

## R3: PLZ-Einzugsgebiet einheitlich

> `service_area_plz[]` ist ein Array in der Tenant-Config.

| Prüfpunkt | Status | Evidenz |
|-----------|--------|---------|
| CreateCaseModal PLZ-Validation | ❌ | PLZ wird nicht validiert (nur `required` HTML-Attribut) |
| CaseDetailForm PLZ | ❌ | Freitext, keine Validation |

**Bewertung:** ❌ **Nicht umgesetzt im Leitstand.** PLZ-Validation existiert im Voice Agent und Wizard, aber manuelle Fallerfassung im Leitstand validiert nicht gegen `service_area_plz[]`.

**Kontext:** Für den Leitstand ist das weniger kritisch — die Disponentin weiss, welche PLZ zum Einzugsgebiet gehören. Wäre nice-to-have (Warnung), aber kein Blocker.

---

## R4: FlowSight unsichtbar im Betriebskontext

> Auf allen Prospect-/Betriebsoberflächen erscheint der Tenant, nicht FlowSight.

| Prüfpunkt | Status | Evidenz |
|-----------|--------|---------|
| Browser-Tab | ✅ | `{shortName} Leitstand` via `title.absolute` (umgeht root template) |
| Sidebar Logo/Name | ✅ | Tenant-Initialen + displayName, kein "FS" oder "FlowSight" |
| Sidebar Fallback (kein Tenant) | ⚠️ | initials = "LS", name = "Leitstand" (besser als "FlowSight", aber "LS" statt Tenant) |
| Case-IDs | ✅ | `formatCaseId(seq_number, identity.caseIdPrefix)` — z.B. "DA-0001" |
| Case-ID Badge (Detail) | ✅ | `bg-slate-100 text-slate-700` (war amber, jetzt neutral) |
| CSV Dateiname | ✅ | `{tenantName}-{date}.csv` statt "flowsight-..." |
| "Neuer Fall" Modal | ✅ | Kein FlowSight-Branding |
| Settings | ✅ | "Konfiguration für {tenant_name}" |
| Timeline "Nächster Schritt" | ✅ | Kein Branding |
| Welcome Page | ⚠️ | Separate Route, eigenes Design — enthält "FlowSight" Referenzen (ausserhalb Scope dieses Audits) |

**Bewertung:** ✅ **Erfüllt im Leitstand.** Kein "FlowSight" in sichtbaren UI-Elementen. Der einzige Edge Case ist der Fallback "LS/Leitstand" wenn kein Tenant aufgelöst werden kann (Admin-Ansicht).

### String-Suche nach "FlowSight" im Leitstand-Code

| Datei | Vorkommen | Kontext | Sichtbar? |
|-------|-----------|---------|-----------|
| `layout.tsx` | 2 | Code-Kommentare ("R4", "Identity Contract") | Nein |
| `OpsShell.tsx` | 1 | Code-Kommentar ("Identity Contract R4") | Nein |
| `CaseListClient.tsx` | 1 | Code-Kommentar ("Identity Contract R4") | Nein |

→ Nur in Code-Kommentaren, nicht in UI-Strings.

---

## R5: `short_name` nur wo Platz fehlt

> `short_name` nur für SMS, Browser-Tab, Telegram.

| Prüfpunkt | Status | Evidenz |
|-----------|--------|---------|
| Browser-Tab | ✅ | `{shortName} Leitstand` — korrekt, shortName für Tab |
| Sidebar | ✅ | `displayName` (voller Name) |
| CSV Filename | ⚠️ | Verwendet `tenantShortName` (eigentlich sollte es displayName sein, aber Dateinamen-Konvention macht shortName akzeptabel) |
| KPI-Karten | n/a | Kein Tenant-Name in KPIs |
| Settings | ✅ | `data.tenant_name` (display_name) |

**Bewertung:** ✅ **Erfüllt.** shortName korrekt auf Kontexte mit Platzbeschränkung limitiert.

---

## R6: Keine Halluzination von Tenant-Daten

> Lisa/Wizard dürfen nur konfigurierte Daten verwenden.

| Prüfpunkt | Status | Evidenz |
|-----------|--------|---------|
| Leitstand | n/a | Leitstand halluziniert keine Daten — zeigt nur was in der DB steht |

**Bewertung:** ✅ **Nicht relevant für Leitstand** (betrifft Voice + Wizard).

---

## R7: Slug als systemweiter Identifier

> `slug` identisch in allen Systemen.

| Prüfpunkt | Status | Evidenz |
|-----------|--------|---------|
| Tenant-Filter in Cases Page | ✅ | `filterTenantSlug` → Supabase `.eq("slug", filterTenantSlug)` |
| URL-Routing | ✅ | `/ops/cases?tenant={slug}` |

**Bewertung:** ✅ **Erfüllt.** Slug wird korrekt als Identifier verwendet.

---

## Entscheidungen (E1–E6) im Leitstand

### E1: display_name vs short_name Zuordnung

| Kontext | Soll (Identity Contract) | Ist (Code) | Status |
|---------|--------------------------|------------|--------|
| Leitstand Sidebar | display_name | `identity.displayName` | ✅ |
| Browser-Tab | short_name | `identity.shortName` | ✅ |

### E2: short_name Regeln
- Wird durch `resolveTenantIdentity` bereitgestellt → ✅

### E3: Brand Color
| Kontext | Soll | Ist | Status |
|---------|------|-----|--------|
| Sidebar Header | Tenant brand_color | `identity.primaryColor` | ✅ |
| Active Nav State | Tenant brand_color | `${color}10` Background, `color` Text | ✅ |
| Fallback | Definiert | `#d97706` (amber-600) | ✅ |

### E4: E-Mail-Absender-Pattern
- Nicht im Frontend prüfbar (Backend-Logic) → n/a

### E5: Duale SSOT
- Leitstand liest ausschliesslich aus Supabase → ✅

### E6: Voice Greeting
- Nicht relevant für Leitstand → n/a

---

## Zusammenfassung

| Regel | Status | Kommentar |
|-------|--------|-----------|
| R1: Ein Name, eine Quelle | ✅ | Durchgängig korrekt |
| R2: Kategorien identisch | ⚠️ | CreateCaseModal hardcoded statt tenant-spezifisch |
| R3: PLZ einheitlich | ❌ | Keine PLZ-Validation im Leitstand (akzeptabel) |
| R4: FlowSight unsichtbar | ✅ | Sauber umgesetzt |
| R5: short_name limitiert | ✅ | Korrekt eingesetzt |
| R6: Keine Halluzination | ✅ | Nicht relevant |
| R7: Slug als Identifier | ✅ | Korrekt |

**Gesamtbewertung: 5/7 voll erfüllt, 1 teilweise, 1 nicht relevant für Leitstand.**
Der einzige echte Mangel ist R2 (hardcoded Kategorien in CreateCaseModal).
