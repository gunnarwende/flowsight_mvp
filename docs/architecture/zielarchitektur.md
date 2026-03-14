# FlowSight — Zielarchitektur (Business + Produkt + GTM)

**Version:** 1.2 | **Datum:** 2026-03-11
**Autor:** CC (Head Ops) + Founder-Input
**Status:** v1.2 — D12 ELIMINATED (kein B-Quick, immer B-Full), D16 Trial Machine (11.03.)
**Regel:** Dieses Dokument beschreibt die **Zielarchitektur**. Aktueller Stand → `docs/STATUS.md`. Tasks → `docs/ticketlist.md`.
**Pfad:** `docs/architecture/zielarchitektur.md` (umgezogen von `docs/gtm/architecture_detail.md`)

---

## Decision Map (Schnellzugriff für Founder)

| # | Entscheidung | Status | Wer entscheidet | Referenz |
|---|-------------|--------|-----------------|----------|
| D1 | FlowSight = Leitsystem (nicht Website-Tool, nicht Voice-Demo) | **ENTSCHIEDEN** | Founder | §3 |
| D2 | Leckerli A-D als Proof-System, nicht als Produkt-Tiers | **ENTSCHIEDEN** | Founder | §6 |
| D3 | Quality before Scale — kein Outreach vor Gate-Pass | **ENTSCHIEDEN** | Founder + CC | §18 |
| D4 | Modus 1/2/3 Logik (Full / Extend / Pure System) | **ENTSCHIEDEN** ✅ | Founder | §7 |
| D5 | TenantContext als First-Class Architekturachse | **EMPFOHLEN** | Founder + CC | §9 |
| D6 | Demo-Modi: 3 klar getrennte Welten (Internal/Prospect/Production) | **EMPFOHLEN** | Founder + CC | §8 |
| D7 | Prospect Experience Layer als eigene Architekturschicht | **EMPFOHLEN** | Founder + CC | §8 |
| D8 | Tenant-scoped Case List → **RLS** | **ENTSCHIEDEN** ✅ | Founder | §9, §15 |
| D9 | Demo-Zugang → **Magic-Link via Supabase OTP** | **ENTSCHIEDEN** ✅ | Founder | §11 |
| D10 | Demo-Dataset → **is_demo Boolean auf Cases** | **ENTSCHIEDEN** ✅ | Founder | §16 |
| D11 | SMS-Zielrouting → **tenant.demo_sms_target** | **ENTSCHIEDEN** ✅ | Founder | §12 |
| D12 | ~~G2 B-Quick Agent~~ → **ELIMINATED**. Immer B-Full. Jeder Prospect bekommt eigenen dedizierten Agent. | **ENTSCHIEDEN** ✅ | Founder | §5, operating_model |
| D13 | Multi-Tenant Dashboard UI (>1 Kunde) | **OFFEN** | CC (Vorschlag), Founder (Go) | §9, §15 |
| D14 | Review-Surface Personalisierung (Name, Foto, Stars) | **OFFEN** | CC (Vorschlag) | §13 |
| D15 | Mobile-First als explizites Proof-Kriterium in Quality Gates | **EMPFOHLEN** | CC | §14 |
| D16 | Product-Led Trial Machine (14-Tage Trial, provision_trial.mjs, offboard_tenant.mjs) | **ENTSCHIEDEN** ✅ | Founder | operating_model.md |

---

## 1. Executive Summary

**FlowSight in einem Satz:** Multi-tenant Leitsystem für Schweizer Handwerksbetriebe — damit keine Anfrage verloren geht.

**GTM-Maschine:** Ein reproduzierbarer, qualitätsgesicherter Prozess, der aus einem Scout-Treffer in <25 Minuten ein vollständiges Proof-Paket (Website + Voice Agent + E2E-Beweis + Video) erzeugt und dem Prospect ein Erlebnis liefert, das ihn in 3–10 Minuten überzeugt.

**Demo-Welt:** Kein statischer Showroom, sondern ein lebendiges Prospect Experience Layer — ein kontrollierter Raum, in dem ein Prospect das echte System mit seinen eigenen Daten erlebt, ohne dass Produktionsdaten kontaminiert werden.

**Warum jetzt geschäftskritisch:** 48+ PRs in 6 Tagen haben das Produkt bottom-up gebaut. Bevor systematischer Outreach startet, muss das Zielbild einmal sauber festgezogen werden. Sonst driftet jeder nächste PR — und jeder Prospect sieht Inkonsistenzen (falsche Review-URLs, fremde Firmennamen, SMS ins Nirgendwo). Die Architektur sichert: **jeder Touchpoint ist tenant-sauber, demo-sicher und prospect-ready**.

---

## 2. Zielbild / North Star

### Wie soll sich FlowSight für einen Sanitärbetrieb anfühlen?

> "Ich habe ein System, das meine Anfragen auffängt — egal ob jemand anruft oder schreibt. Ich sehe sofort, was passiert ist, und kann reagieren. Und meine Kunden bekommen das Gefühl, dass bei mir alles professionell läuft."

Nicht: "Ich habe eine neue Website." Nicht: "Ich habe einen Voice-Bot." Sondern: **Ich habe ein Leitsystem.**

### Was soll ein Prospect in 3–10 Minuten verstehen, fühlen, testen können?

1. **Minute 0–1:** Website sehen → "Die kennen mein Geschäft. Das sieht nach mir aus."
2. **Minute 1–3:** Testnummer anrufen → Lisa antwortet mit Firmenname, fragt branchenspezifisch → "Das funktioniert. Sofort."
3. **Minute 3–5:** SMS erhalten → Korrekturlink → "Die denken mit."
4. **Minute 5–7:** Dashboard öffnen → eigener Fall ist da, mit Kategorie, Dringlichkeit, Timeline → "Das ist mein System."
5. **Minute 7–10:** Review-Anfrage sehen → Google-style Bewertungsseite → "Das macht mein Geschäft besser."

### Wow-Effekt

Der Prospect erlebt in 10 Minuten den **kompletten Lebenszyklus einer Kundenanfrage** — von Anruf bis Review — mit seinen eigenen Daten, seiner eigenen Brand, seinem eigenen Firmennamen. Das ist kein Demo. Das ist ein Spiegel seines zukünftigen Alltags.

### Qualität vor Skalierung

Lieber 3 Prospects mit perfektem Erlebnis als 30 mit halbfertigen Demos. Ein einziger Tenant-Leak (falscher Firmenname, fremde Review-URL, SMS an falsche Nummer) zerstört mehr Vertrauen als 10 gute Outreach-Mails aufbauen.

---

## 3. Kernpositionierung

### FlowSight = Leitsystem

| FlowSight IST | FlowSight ist NICHT |
|---------------|---------------------|
| Leitsystem für Anfragen | Website-Baukasten |
| Intake → Ticket → Dispatch → Review | Reines Voice-Demo-Produkt |
| Multi-Channel (Voice + Wizard + SMS) | Formular-Tool |
| Betriebliches Nervensystem | Marketing-Plattform |
| Qualitätsbeweis für den Handwerker | Chatbot / KI-Spielzeug |

### Einordnung der Systemteile

| Modul | Rolle im Leitsystem | Metapher |
|-------|---------------------|----------|
| **Voice** | Telefonischer Eingang — fängt Anrufe auf, 24/7, branchenspezifisch | Die Rezeptionistin |
| **Wizard** | Schriftlicher Eingang — strukturiert Anfragen von der Website | Das Kontaktformular 2.0 |
| **Ops Dashboard** | Fallbearbeitung — Überblick, Triage, Aktion | Die Schaltzentrale |
| **Reviews** | Nachlauf — zufriedene Kunden zu Bewertungen führen | Der Reputationsmotor |
| **SMS** | Brücke — verbindet Voice mit dem Melder, ermöglicht Korrekturen | Der Rückkanal |
| **E-Mail** | Benachrichtigung — informiert Betrieb und Melder | Das Nervensystem |

**Entscheidende Erkenntnis:** Kein Modul allein überzeugt. Der Wert entsteht durch das **Zusammenspiel**: Anruf → SMS → Fall im Dashboard → Review-Anfrage. Erst dieser Kreislauf zeigt dem Prospect: "Das ist ein System, nicht ein Feature."

---

## 4. Produktlogik / Systemlogik

### Der Anfrage-Lebenszyklus

```
┌─────────────────────────────────────────────────────────────────┐
│                     EINGANG (Multi-Channel)                      │
│                                                                   │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐                  │
│   │  VOICE   │    │  WIZARD  │    │  (Email)  │  ← künftig      │
│   │ Telefon  │    │ Website  │    │           │                  │
│   └────┬─────┘    └────┬─────┘    └────┬─────┘                  │
│        │               │               │                         │
│        ▼               ▼               ▼                         │
│   ┌──────────────────────────────────────┐                      │
│   │          CASE (Supabase)             │                      │
│   │  tenant_id + category + urgency +    │                      │
│   │  contact + description + source      │                      │
│   └────────────────┬─────────────────────┘                      │
│                    │                                             │
│        ┌───────────┼───────────┐                                │
│        ▼           ▼           ▼                                │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐                          │
│   │  EMAIL  │ │   SMS   │ │  WHATS  │ (Ops-Alert only)         │
│   │ Notify  │ │ Verify  │ │  App    │                          │
│   └─────────┘ └─────────┘ └─────────┘                          │
│                    │                                             │
│                    ▼                                             │
│   ┌──────────────────────────────────────┐                      │
│   │       OPS DASHBOARD                  │                      │
│   │  Fallbearbeitung → status: done      │                      │
│   └────────────────┬─────────────────────┘                      │
│                    │                                             │
│                    ▼                                             │
│   ┌──────────────────────────────────────┐                      │
│   │       REVIEW ENGINE                  │                      │
│   │  Review-Anfrage → Google Bewertung   │                      │
│   └──────────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

### Warum das Zusammenspiel den Wert erzeugt

- **Voice allein:** "Netter Bot." → Kein Beweis, dass der Anruf ankommt.
- **Voice + SMS:** "OK, die SMS kam." → Aber was passiert damit?
- **Voice + SMS + Dashboard:** "Ich sehe den Fall." → Aber was macht der Kunde davon?
- **Voice + SMS + Dashboard + Review:** "Der ganze Kreislauf funktioniert." → **DAS ist der Verkaufsmoment.**

Jedes Modul einzeln ist ein Feature. Alle zusammen sind ein **Leitsystem**.

---

## ARCHITEKTURACHSE I: TENANT CONTEXT

## 5. Tenant Architecture / White-Label

### Prinzip: TenantContext = First-Class Citizen

Jeder Datenpunkt, jeder Touchpoint, jede UI-Komponente muss wissen, **für welchen Tenant** sie arbeitet. Tenant ist keine Filteroption — Tenant ist die **primäre Achse** der gesamten Architektur.

### Warum First-Class?

Ein einziger Tenant-Leak zerstört das Prospect-Erlebnis:
- Weinberger sieht "Dörfler" in der Review-Mail → **Vertrauenstod**
- Prospect hört "Brunner Haustechnik" statt seinen Firmennamen → **Demo gescheitert**
- SMS kommt von "FlowSight" statt "Weinberger" → **Unpersönlich**
- Dashboard zeigt Cases anderer Tenants → **Datenschutz-Desaster**

### Tenant-Touchpoint-Matrix

| Touchpoint | Tenant-aware heute? | Was muss tenant-spezifisch sein | Risiko bei Leak |
|------------|---------------------|--------------------------------|-----------------|
| **Voice Agent** | ✅ Pro Tenant (B-Full, immer dediziert) | Firmenname, Greeting, Gewerke, Kategorien, Notfall-Keywords | Prospect hört falschen Namen |
| **Wizard** | ✅ `/kunden/[slug]/meldung` | Brand Color, Logo, Services, Kategorien | Falsche Services angezeigt |
| **SMS** | ✅ `sms_sender_name` aus tenant modules | Absendername, Korrekturlink-Domain | Falscher Absender |
| **E-Mail** | ⚠️ Teilweise (Ops-Mail ok, Review-Mail tenant-scoped seit PR #126) | Firmenname, Reply-To, Brand | Falscher Firmenname |
| **Ops Dashboard** | ✅ Tenant-Name seit PR #127, Cases tenant-scoped via RLS seit PR #128 | Header-Branding, Case-Liste nur eigene | — |
| **Review Surface** | ✅ `/review/[caseId]` liest Tenant aus Case | Firmenname, Google Review URL | Falscher Google-Link |
| **Review E-Mail/SMS** | ✅ Seit PR #127 tenant-scoped URL + SMS fallback | Firmenname, Review-Link | Falsche Review-Seite |
| **Website** | ✅ SSG per slug | Alles (Brand, Services, Team, Bilder) | Falscher Slug → 404 |
| **Links Page** | ✅ `/kunden/[slug]/links` | Alle URLs | — |
| **Case Events / Timeline** | ✅ case_id → tenant_id | — | — |

### Ops Dashboard Case Scoping — RESOLVED ✅

**Seit PR #128:** RLS-Migration applied. Cases sind tenant-scoped via Supabase RLS (`cases.tenant_id = auth.jwt()->'app_metadata'->>'tenant_id'`). Founder (role=admin) sieht alle, Kunden/Prospects sehen nur eigene Cases. Zusätzlich enforced `resolveTenantScope.ts` Tenant-Isolation auf API-Ebene.

**Architektur (live):**

```
┌─────────────────────────────────────────────┐
│ Supabase Auth: user.app_metadata.tenant_id  │
│                                             │
│ ┌─────────────┐  ┌──────────────────────┐   │
│ │ Founder     │  │ Kunde / Prospect     │   │
│ │ role: admin │  │ tenant_id: fc4ba994  │   │
│ │ → sieht all │  │ → sieht nur eigene   │   │
│ └─────────────┘  └──────────────────────┘   │
│                                             │
│ RLS Policy: cases.tenant_id = auth.tenant_id│
│ ODER: auth.role = 'admin' → all             │
└─────────────────────────────────────────────┘
```

**Entscheidung (D8): UMGESETZT.** RLS für Production + API-Layer (`resolveTenantScope.ts`) als zusätzliche Absicherung. Demo-Modus via Tenant-Flag `is_demo`.

### Zentrale Tenant-Felder (modules JSONB)

Bereits implementiert oder geplant:

| Feld | Typ | Beschreibung | Status |
|------|-----|-------------|--------|
| `voice` | boolean | Voice-Modul aktiviert | ✅ Live |
| `wizard` | boolean | Wizard-Modul aktiviert | ✅ Live (implizit via Website) |
| `ops` | boolean | Ops Dashboard Zugang | ✅ Live |
| `reviews` | boolean | Review Engine aktiviert | ✅ Live |
| `sms` | boolean | SMS Channel aktiviert | ✅ Live |
| `sms_sender_name` | string | Alphanumerischer SMS-Absender | ✅ Live |
| `google_review_url` | string | Google Review Link (tenant-spezifisch) | ✅ Live (PR #126) |
| `brand_color` | string | Primärfarbe für Branding | ⚠️ Nur in Website-Config, nicht in modules |
| `logo_url` | string | Logo für Dashboard/E-Mail | ❌ Nicht implementiert |
| `notification_email` | string | Empfänger für Ops-Mails | ⚠️ Hardcoded in env |

**Empfehlung:** `brand_color` und `notification_email` in `modules` JSONB migrieren. Dann ist **ein einziger DB-Eintrag** die Quelle für alle Tenant-Konfiguration.

---

## ARCHITEKTURACHSE II: PROSPECT EXPERIENCE LAYER

## 6. A–D Proof-/Leckerli-System

### Grundlogik

Leckerli sind **keine Produkt-Tiers** und **keine Preisstufen**. Sie sind **Proof-Elemente** — Beweismittel, die einem Prospect zeigen, was FlowSight für IHN konkret tut.

| Leckerli | Was | Zweck | Wer produziert | Aufwand |
|----------|-----|-------|----------------|---------|
| **D** | Website | Visuelle Vorwegnahme — "So könnte dein digitaler Auftritt aussehen" | CC (SSG Template) | ~15 Min |
| **B** | Voice Agent (Lisa) | Erlebnis-Beweis — "Ruf an und teste selbst" | CC (immer B-Full: eigener dedizierter Agent) | ~10 Min |
| **C** | E2E Proof | System-Beweis — "Der Anruf wird zum Fall, die SMS kommt, das Dashboard zeigt alles" | CC + Founder (Testanruf) | ~10 Min |
| **A** | Video | Persönlicher Beweis — "Der Gründer zeigt dir in 60s, was das System für dich tut" | Founder (Aufnahme) | ~15 Min |

### Hierarchie und Einsatzlogik

```
Primärer Hook:     D (Website) — visuell, sofort teilbar, kein Aufwand für Prospect
Erlebnis-Beweis:   B (Lisa) — der Wow-Moment, "ruf an und teste"
System-Beweis:     C (E2E) — der Knockout, "dein Fall ist im System"
Persönlich:        A (Video) — Vertrauen, Founder-Gesicht, nur für HOT Prospects

D ist STANDARD (immer).
B ist STANDARD (immer B-Full, eigener dedizierter Agent).
C ist SELEKTIV (nur ICP ≥ 9, erfordert Supabase Tenant).
A ist SELEKTIV (nur ICP ≥ 9, erfordert Founder-Aufnahme).
```

### Einsatzlogik nach ICP-Score

| ICP | Tier | Paket | Assets | Aufwand |
|-----|------|-------|--------|---------|
| 9–10 | HOT | A+B-Full+C+D | Website, eigener Agent, Tenant, Video, Outreach | ~45 Min |
| 7–8 | WARM-HOT | A+B-Full+D | Website, eigener Agent, Video | ~35 Min |
| 6 | WARM | B-Full+D | Website, eigener Agent | ~30 Min |
| <6 | COLD | SKIP | — | 0 |

**Referenz:** `docs/gtm/einsatzlogik.md` (Entscheidungstabelle + Pseudocode)

### Leckerli-Abhängigkeiten

```
D ──────── B ──────── C ──────── A
Website    Voice      E2E        Video
(immer     (immer     (nur       (nur
 zuerst)    nach D)    nach B)    nach C)
```

C ohne B ist sinnlos (kein Anruf → kein Fall).
A ohne C ist möglich, aber schwächer (Video zeigt fremden Fall).
B ohne D ist möglich, aber der Prospect hat keinen visuellen Kontext.

---

## 7. Zwei-Modi-Logik / Prospect-Logik

### Das Problem

Nicht jeder Prospect braucht eine neue Website. Weinberger hat eine funktionale eigene Website (julweinberger.ch). Denen eine FlowSight-Website zu zeigen, wäre:
- Unsensibel ("Eure Website ist schlecht")
- Unnötig (sie haben bereits eine)
- Kontraproduktiv (zeigt FlowSight als Website-Tool statt Leitsystem)

### Zwei Modi

| | Modus 1: Neue Website | Modus 2: Extend |
|---|----------------------|-----------------|
| **Wann** | Prospect hat keine oder schwache Website | Prospect hat starke eigene Website |
| **Was FlowSight liefert** | Komplette High-End-Website + Wizard + Voice + Ops | Wizard-CTA auf bestehender Website + Voice + Ops |
| **Leckerli D** | Vollständige Demo-Website unter /kunden/[slug] | Lightweight Landing mit Wizard + CTA-Vorschlag |
| **Kernbotschaft** | "Wir machen alles digital — Website bis Ops" | "Wir erweitern dein bestehendes System um ein Leitsystem" |
| **Beispiel** | Dörfler AG (keine eigene Website) | Weinberger AG (julweinberger.ch ist gut) |

### Entscheidungslogik (nicht binär)

Die Entscheidung ist kein Schalter, sondern ein Spektrum. Relevante Faktoren:

| Faktor | Gewicht | Modus-1-Signal | Modus-2-Signal |
|--------|---------|----------------|----------------|
| Bestehende Website vorhanden? | Hoch | Nein / nur Verzeichnis-Eintrag | Ja, eigene Domain |
| Website-Qualität | Hoch | Veraltet, nicht responsive, kein SSL | Modern, responsive, gepflegt |
| Eigene Brand-Identität | Mittel | Schwach / kein Logo | Stark, wiedererkennbar |
| Bereitschaft für Neues | Mittel | "Wir brauchen alles" | "Wir wollen ergänzen" |
| Gewerk-Komplexität | Niedrig | Einfach (1 Gewerk) | Komplex (3+ Gewerke) |

**Schwellenwert-Empfehlung (OFFEN — Founder-Entscheid D4):**
- Website-Score ≥ 6/10 → Modus 2
- Website-Score < 6/10 → Modus 1
- Kein Website → automatisch Modus 1

**Systemische Bedeutung:** Modus 2 wird mit wachsender Pipeline wichtiger. Die meisten etablierten Sanitärbetriebe (ICP 7+) HABEN eine Website. Wenn FlowSight nur Modus 1 kann, schliesst das ~60% der Pipeline aus.

**Modus 2 konkret (Weinberger-Pattern):**
1. Demo-Website unter /kunden/weinberger-ag zeigt, was FlowSight kann
2. Wizard-Integration: CTA-Button-Vorschlag für julweinberger.ch → leitet auf /kunden/weinberger-ag/meldung
3. Voice: Eigene Lisa unter eigener Nummer
4. Ops: Dashboard mit Tenant-Branding
5. Botschaft: "Du behältst deine Website. FlowSight wird dein unsichtbares Leitsystem dahinter."

---

## ARCHITEKTURACHSE III: DEMO-MODI

## 8. Demo-Welt / Prospect Experience Layer

### Warum "Demo" das falsche Wort ist

"Demo" suggeriert: Simulation, Fake, Showroom. Was wir bauen, ist ein **Prospect Experience Layer** — ein kontrollierter Raum, in dem ein Prospect das **echte System** mit **seinen Daten** erlebt, ohne Production zu kontaminieren.

### Drei Demo-Modi (klar getrennt)

| Modus | Wer | Zweck | Was ist echt | Was ist kontrolliert | Risiken |
|-------|-----|-------|-------------|---------------------|---------|
| **Internal Test** | Founder + CC | Qualitätssicherung, Regression | Alles (Voice, SMS, DB) | Nichts — volle Production | SMS an falsche Nr, Cases in Prod-DB |
| **Prospect Demo** | Prospect (geführt oder selbständig) | Überzeugung, Wow-Moment | Voice Agent, SMS, Dashboard-UI | Demo-Dataset, Tenant-Isolation, SMS-Routing | Prospect sieht fremde Cases, SMS geht verloren |
| **Production** | Echte Endkunden des Handwerkers | Täglicher Betrieb | Alles | Nichts | — |

### Prospect Demo im Detail

Das ist der geschäftskritischste Modus. Hier entscheidet sich, ob der Prospect kauft.

**Was der Prospect erlebt (Prospect Journey):**

```
1. E-Mail/Anruf von Founder
   ↓
2. "Schau dir an, was wir für dich vorbereitet haben:"
   ↓
3. Website öffnen: flowsight.ch/kunden/weinberger-ag
   → Sieht seine Brand, seine Services, seine Bilder
   ↓
4. "Ruf diese Nummer an:" +41 43 505 11 01
   → Hört: "Grüezi, hier ist Lisa von der Weinberger AG"
   → Gibt Testfall durch (z.B. Wasserleck in Thalwil)
   ↓
5. SMS erhalten (von "Weinberger")
   → Korrekturlink, Foto-Upload möglich
   ↓
6. Dashboard öffnen (Link in E-Mail oder Magic-Link)
   → Sieht seinen Fall, Kategorie, Dringlichkeit, Timeline
   → Sieht Demo-Dataset mit 15 realistischen Fällen
   ↓
7. Review auslösen (Button im Dashboard)
   → Google Review-style Bewertungsseite erscheint
   ↓
8. Prospect denkt: "Das funktioniert. Das ist mein System."
```

**Kritische Unterscheidungen:**

| Aspekt | Internal Test | Prospect Demo | Production |
|--------|--------------|---------------|------------|
| Voice Agent | Echter Agent, Retell published | Echter Agent, Retell published | Echter Agent |
| SMS-Ziel | Founder-Handy (DEMO_SIP_CALLER_ID) | Prospect-Handy (TBD) | Echter Melder |
| Cases in DB | Echte Cases (prod) | Demo-Cases (seed) + Test-Cases | Echte Cases |
| Dashboard-Zugang | Founder-Login | Prospect-Link (D9 — offen) | Kunde-Login |
| Case-Liste | Alle Tenants (Founder) | Nur eigener Tenant + Demo-Dataset | Nur eigener Tenant |
| Review-URL | Google (echt oder Test) | Tenant-spezifisch (konfiguriert) | Tenant-spezifisch |

### Was heute fehlt für saubere Demo-Modi

| Gap | Impact | Lösung | Aufwand | Priorität |
|-----|--------|--------|---------|-----------|
| Kein Demo-Dataset | Prospect sieht leeres Dashboard | Seed-Script (§16) | ~2h | HOCH |
| ~~Cases nicht tenant-scoped~~ | ~~Prospect sieht fremde Cases~~ | ✅ RLS applied (PR #128) + resolveTenantScope.ts | DONE | ERLEDIGT |
| Kein Demo-Zugang | Prospect braucht Founder-Login | Magic-Link oder Read-Only (§11) | ~3h | HOCH |
| SMS-Routing unklar | SMS geht an Founder statt Prospect | Routing-Logik (§12) | ~2h | MITTEL |
| Kein "Demo-Modus"-Flag | Kein Unterschied zwischen Demo und Prod | Tenant-Flag `is_demo` | ~1h | MITTEL |

---

## 9. TenantContext — Detailarchitektur

### Architekturprinzip

TenantContext ist nicht "ein Feature" — es ist eine **Architekturachse**, die sich durch **jeden Layer** zieht:

```
┌────────────────────────────────────────────────────────┐
│                    TENANT CONTEXT                        │
│                                                          │
│  ┌──────────────┐                                        │
│  │ Supabase     │  tenants.id = PRIMARY KEY              │
│  │ (SSOT)       │  tenants.modules = JSONB config        │
│  │              │  tenant_numbers = phone → tenant_id     │
│  └──────┬───────┘                                        │
│         │                                                │
│  ┌──────┴───────────────────────────────────────────┐    │
│  │            RESOLUTION LAYER                       │    │
│  │                                                   │    │
│  │  Voice:    phone → tenant_numbers → tenant_id     │    │
│  │  Wizard:   slug → registry → tenant_id            │    │
│  │  Dashboard: user.app_metadata.tenant_id           │    │
│  │  Review:   case.tenant_id (from case lookup)      │    │
│  │  SMS:      case.tenant_id (from case lookup)      │    │
│  │  Email:    case.tenant_id (from case lookup)      │    │
│  └──────┬───────────────────────────────────────────┘    │
│         │                                                │
│  ┌──────┴───────────────────────────────────────────┐    │
│  │            BRANDING LAYER                         │    │
│  │                                                   │    │
│  │  Dashboard: tenantName + initials (PR #127)       │    │
│  │  SMS:      sms_sender_name from modules           │    │
│  │  Email:    tenant name in subject + body           │    │
│  │  Review:   company name in header                  │    │
│  │  Voice:    Firmenname in Greeting + Prompt         │    │
│  │  Website:  Full brand (SSG, static)                │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### Resolution-Konsistenz-Check

| Einstieg | Resolution-Pfad | Tenant am Ende korrekt? |
|----------|-----------------|------------------------|
| Anruf auf +41435051101 | phone → tenant_numbers → fc4ba994 | ✅ |
| Wizard /kunden/weinberger-ag/meldung | slug → registry → tenant_id in hidden field | ✅ |
| Dashboard Login | user.app_metadata.tenant_id | ⚠️ nur wenn gesetzt |
| Dashboard (single tenant fallback) | count(tenants) == 1 → use that | ⚠️ bricht bei >1 Tenant |
| Review /review/[caseId] | case → tenant_id → tenant name | ✅ |
| SMS Korrekturlink /v/[id] | case → tenant_id | ✅ |

**Einzige unsichere Stelle:** Dashboard-Login bei >1 Tenant ohne explizites app_metadata. Muss vor Kunde #2 gelöst sein.

### Empfohlene TenantContext-Erweiterungen

1. **`is_demo` Flag** in tenant modules → ermöglicht Demo-spezifisches Verhalten (Demo-Dataset laden, SMS-Routing überschreiben)
2. **`brand_color`** in modules → Dashboard-Branding, E-Mail-Header
3. **`notification_email`** in modules → statt Env-Var pro Tenant
4. **`demo_sms_target`** in modules → SMS-Ziel für Demo-Calls (statt globaler DEMO_SIP_CALLER_ID)

---

## 10. Touchpoint-Architektur

### Touchpoint-Matrix (Übersicht)

| Touchpoint | Rolle | Tenant-aware | Demo-Mode | Mobile-Proof | Quality Gate |
|------------|-------|-------------|-----------|-------------|-------------|
| Voice Call | Eingang, Wow | ✅ (B-Full, immer dediziert) | ✅ Echter Agent | ✅ Telefon = mobil | G3 (Lisa) |
| Wizard | Eingang, Schrift | ✅ (slug-basiert) | ✅ Echter Wizard | ✅ Responsive | G2 (Website) |
| SMS | Brücke, Korrektur | ✅ (sender_name) | ⚠️ Routing-Frage | ✅ SMS = mobil | G3 (E2E) |
| E-Mail | Benachrichtigung | ⚠️ (teilweise) | ⚠️ Geht an echte Adresse | ⚠️ Nur responsive | — |
| Ops Dashboard | Steuerung | ✅ (seit PR #127) | ✅ Cases tenant-scoped (PR #128) | ⚠️ Responsive, nicht optimiert | G5 (Outreach) |
| Review Surface | Nachlauf, Wow | ✅ (tenant name) | ✅ Mock möglich | ✅ Mobile-first | — |
| Mobile Erlebnis | Proof-Dimension | — (Querschnitt) | ✅ Zentral | ✅ Muss perfekt sein | G2 + G3 |
| CTA / Website | Entry Point | ✅ (slug-basiert) | ✅ Echte Website | ✅ Responsive | G2 (Website) |
| Video / Outreach | Erstkontakt | ✅ (personalisiert) | — | ✅ Muss mobil spielbar sein | G4 + G5 |

### Touchpoint-Details

#### Voice Call
- **Rolle:** Primärer Wow-Moment. Prospect ruft an, hört seinen Firmennamen, erlebt branchenspezifische Triage.
- **Qualitätsanspruch:** Greeting muss stimmen. Kategorien müssen zum Gewerk passen. Notfall muss Empathie zeigen. Closing darf nicht abrupt enden.
- **Typische Risiken:** skip_response_edge → Stille (PR #126 gefixt). "Danke" als FAQ-Abbruch (PR #127 gefixt). STT-Fehler bei PLZ/Ort (PLZ-Map gefixt). Falscher Firmenname (Grep-Check in Provisioning).
- **Zielzustand:** Prospect legt auf und denkt: "Das war besser als erwartet. Die Lisa kennt sich aus."

#### Wizard
- **Rolle:** Schriftlicher Eingang. Strukturiert, branded, mit Photo-Upload.
- **Qualitätsanspruch:** Kategorien müssen zum Gewerk passen. Brand-Farbe sichtbar. "Anliegen melden" statt "Schaden melden".
- **Typische Risiken:** Falsche Kategorien (Copy-Paste von anderem Kunden). Fehlende Brand-Farbe. Photo-Upload-Bug auf iOS.
- **Zielzustand:** Melder füllt Wizard in <90s aus. Fühlt sich professionell an.

#### SMS
- **Rolle:** Brücke zwischen Voice und Korrektur. Einziger Post-Call-Kontakt zum Melder.
- **Provider:** eCall.ch (Schweizer SMS-Gateway). Twilio = nur Voice/SIP, kein SMS.
- **Sender-Logik (2-Tier):** (1) Alphanumerischer Sender pro Tenant (z.B. "Weinberger") — muss im eCall-Portal freigeschaltet sein. (2) Fallback: ECALL_SENDER_NUMBER (FlowSight-Servicenummer, global).
- **Qualitätsanspruch:** Muss von Firmenname kommen (alphanumeric sender). Muss Korrekturlink enthalten. Muss unter 160 Chars (~85 Chars aktuell). Muss auf Handy funktionieren.
- **Typische Risiken:** Alphanumerischer Sender nicht im eCall-Portal freigeschaltet → 400 → Fallback auf Servicenummer. eCall-Env-Vars nicht gesetzt → SMS-Versand komplett blockiert.
- **Zielzustand:** Melder erhält SMS innerhalb 10s nach Anruf. Korrekturlink funktioniert. Foto-Upload möglich. Absender = Firmenname (nach eCall-Freischaltung).

#### Ops Dashboard
- **Rolle:** "Mein System" — der Ort, an dem der Handwerker seine Fälle sieht und bearbeitet.
- **Qualitätsanspruch:** Muss sich anfühlen wie SEIN Dashboard (Tenant-Branding). Cases müssen nur seine sein. KPI-Zahlen müssen stimmen.
- **Typische Risiken:** Cases anderer Tenants sichtbar. Leeres Dashboard (kein Demo-Dataset). "FlowSight" statt Firmenname (gefixt PR #127).
- **Zielzustand:** Prospect öffnet Dashboard, sieht 15 realistische Fälle, seinen Firmennamen, seine Farbe. Klickt auf einen Fall, sieht Timeline, kann Status ändern, Review auslösen.

#### Review Surface
- **Rolle:** Nachlauf-Wow. Der letzte Schritt im Kreislauf — vom Fall zur Bewertung.
- **Qualitätsanspruch:** Muss wie Google aussehen (Vertrautheit). Muss tenant-spezifisch sein (Firmenname). Muss mobile-first sein. "Posten" muss auf echten Google Review Link führen.
- **Typische Risiken:** google_review_url nicht konfiguriert → Sentry-Warning. HMAC ungültig → "Link ungueltig". Falscher Firmenname.
- **Zielzustand:** Melder bekommt SMS/E-Mail → öffnet Review Surface → sieht Google-style Card mit Firmenname → klickt "Posten" → landet auf Google → schreibt Bewertung.

#### Mobile
- **Rolle:** Nicht ein Touchpoint, sondern eine **Proof-Dimension** (siehe §14).
- **Qualitätsanspruch:** Jeder Touchpoint muss mobil einwandfrei funktionieren. Mobile ist der Default-Kontext des Prospects (E-Mail auf Handy → Link → Website → Anruf → SMS → Dashboard).
- **Zielzustand:** Die gesamte Prospect Journey ist mobil erlebbar, ohne dass ein einziger Schritt einen Desktop erfordert.

---

## 11. Demo-Zugang / Auth / Sessions

### Arten von Zugängen

| Zugangsart | Wer | Wie | Was sichtbar | Schreibrechte |
|------------|-----|-----|-------------|---------------|
| **Founder-Login** | Founder | E-Mail + Passwort (Supabase Auth) | Alle Tenants, alle Cases | Voll |
| **Kunden-Login** | Zahlender Kunde | E-Mail + Passwort, tenant_id in app_metadata | Nur eigener Tenant | Voll (eigene Cases) |
| **Prospect Demo-Link** | Prospect | Magic-Link oder tokenisierte URL | Nur Demo-Tenant, Demo-Dataset | Read-Only + eigener Test-Call |
| **Review Surface** | Melder (Endkunde) | HMAC-Token in URL (/review/[caseId]?token=xxx) | Nur eine Review-Card | Keine (externer Link) |
| **SMS Korrekturlink** | Melder (Endkunde) | HMAC-Token in URL (/v/[id]?t=xxx) | Nur ein Case (Korrektur) | Begrenzt (Korrekturfelder) |

### Empfohlene Zielarchitektur für Prospect Demo-Link (D9)

**Option A: Magic-Link (empfohlen)**
- Founder sendet Prospect eine URL: `flowsight.ch/demo/weinberger-ag?token=<signed>`
- Token enthält: tenant_id, expires_at, permissions (read-only)
- Prospect öffnet Link → sieht Dashboard mit Demo-Dataset + eigenen Test-Cases
- Kein Passwort nötig. Kein Supabase-User nötig.
- Ablauf nach 7 Tagen.

**Option B: Temporärer Supabase-User**
- Founder erstellt Prospect-Account mit read-only Rolle
- Prospect loggt sich ein wie ein Kunde
- Aufwändiger, aber natürlicher für "wie fühlt sich das System an"

**Empfehlung:** Option A für MVP. Niedrigerer Aufwand, kein Account-Management, saubere Isolation. Option B erst wenn Kunden-Login ohnehin steht.

**Risiken beider Optionen:**
- Token-Leak (Prospect teilt Link) → TTL + Single-Use mitigieren
- Demo-Dataset veraltet → Seed-Script mit festen Timestamps (relativ zu heute)

---

## 12. SMS-Architektur (eCall.ch)

### Architekturentscheidung (14.03.2026)

**eCall.ch = einziger SMS-Provider für Schweiz. Twilio = nur Voice/SIP, kein SMS.**

Grund: Twilio-SMS via internationale Carrier verursachen Spam-Friktion bei Schweizer Empfängern. eCall.ch routet direkt über Schweizer Carrier → keine Spam-Filter-Probleme. Ein Twilio-SMS-Fallback wäre ein Fallback der nicht funktioniert und false confidence gibt.

### Provider-Architektur

```
┌──────────────────────────────────────────────────┐
│  SMS (eCall.ch)          │  Voice/SIP (Twilio)    │
│                          │                        │
│  sendSms()               │  Retell → Twilio SIP   │
│    → sendSmsEcall()      │    → Peoplefone         │
│                          │                        │
│  Env: ECALL_API_*        │  Env: TWILIO_*          │
│  Env: ECALL_SENDER_NUMBER│                        │
└──────────────────────────────────────────────────┘
```

### Sender-Logik (1-Tier, direkt)

```
ECALL_SENDER_NUMBER = +41766012739 (FlowSight-Servicenummer)
→ Immer als Absender verwendet (keine alphanumerische Sender-Registrierung nötig)
→ Empfänger sieht: +41766012739 + Text "Weinberger: Ihre Meldung..."
→ Firmenname steht im SMS-Text, nicht im Absender-Feld
→ Skaliert: Ein Sender für alle Tenants, kein Setup pro Betrieb
```

Bewusste Entscheidung (14.03.): Alphanumerische Sender (z.B. "Weinberger" als Absendername)
erfordern pro Tenant eine Freischaltung im eCall-Portal. Bei 50+ Betrieben = operativer Overhead.
Stattdessen: Eine Nummer für alle, Firmenname im Text. Upgrade auf Alpha-Sender optional pro Tenant.

### SMS-Empfänger-Routing (unverändert)

| Auslöser | Modus | SMS-Empfänger | Logik |
|----------|-------|---------------|-------|
| Voice-Call | **Production** | Anrufer-Nummer (Melder) | Standard |
| Voice-Call | **Internal Test** | DEMO_SIP_CALLER_ID (Founder-Handy) | Twilio-owned Detection |
| Voice-Call | **Prospect Demo** | demo_sms_target (Prospect-Handy) | Tenant-spezifisch |
| Review-SMS | **Production** | case.contact_phone | Standard |

### Richtung

**One-Way.** Kein Reply-Handling. Korrekturen/Interaktion laufen über Korrekturlink → Wizard → Leitstand.

### Code-Pfade

```
postCallSms.ts  →  sendSms()  →  sendSmsEcall()  →  eCall REST API
                    ↑ Whitelist                        ↑ 2-Tier Sender
                    SMS_ALLOWED_NUMBERS                 Tier 1 → Tier 2
```

### Produktionsreife-Checkliste

- [x] eCall REST API Client (`sendSmsEcall.ts`)
- [x] Twilio-SMS-Pfad entfernt
- [x] FlowSight-Servicenummer beschafft: +41766012739 (eCall)
- [x] ECALL_SENDER_NUMBER auf Vercel gesetzt
- [x] Direkt-Sender: ECALL_SENDER_NUMBER immer als Absender (kein Alpha-Fallback-Tanz)
- [ ] SMS_ALLOWED_NUMBERS Whitelist entfernen (nach Go-Live-Entscheid)
- [ ] Delivery-Status-Monitoring (eCall Status-Webhooks → Morning Report)
- [ ] Optional: Alpha-Sender pro Tenant im eCall-Portal (UX-Upgrade, kein Blocker)

---

## 13. Review Architecture

### Warum Review ein eigener Wow-Moment ist

Review ist nicht "ein Link am Ende". Review ist der **Beweis, dass das System den Kreis schliesst**:

```
Anruf → Fall → Bearbeitung → Abschluss → Review-Anfrage → Google-Bewertung
```

Für den Handwerker bedeutet das: "FlowSight bringt mir nicht nur Anfragen, sondern auch Bewertungen." Das ist ein eigenes Verkaufsargument.

### Aktuelle Review-Architektur

```
┌──────────────────────────────────────────────────┐
│ Ops Dashboard: Case status = "done"               │
│ → Button "Review-Anfrage senden"                  │
│                                                    │
│ Gate: status=done AND (email OR phone)             │
│       AND review_sent_at IS NULL                   │
│                                                    │
│ Channel-Logik:                                     │
│   1. E-Mail (bevorzugt) → sendReviewRequest()      │
│   2. SMS (Fallback) → sendSms() mit Review-Link    │
│                                                    │
│ Review-Link: /review/[caseId]?token=<HMAC>         │
│ → Google-style Review Surface                      │
│ → "Posten" → tenant.google_review_url (extern)     │
│                                                    │
│ Nach Versand: review_sent_at = NOW()               │
│ Event: case_events.review_requested (channel)      │
└──────────────────────────────────────────────────┘
```

### Skalierbare Review-Surface (Zielzustand)

Die aktuelle Review Surface (PR #127) ist ein guter Start, aber statisch. Zielzustand:

| Feature | Heute | Ziel |
|---------|-------|------|
| Firmenname | ✅ Aus Tenant | ✅ |
| Google Review URL | ✅ Aus Tenant modules | ✅ |
| Bewertungs-Text | ❌ Hardcoded Placeholder | Dynamisch: basierend auf Case-Kategorie |
| Sterne | ❌ Statisch (5 Sterne) | Interaktiv: Klick → Auswahl |
| Melder-Name | ❌ "Max Mustermann" | ✅ Aus case.reporter_name |
| Foto-Upload | ❌ Button ohne Funktion | Optional: Foto-Upload für Google |
| Multi-Platform | ❌ Nur Google | Kununu, Yelp, etc. (pro Tenant konfigurierbar) |

**Empfehlung (D14):** Kurzfristig: `reporter_name` einbauen + Sterne interaktiv. Mittelfristig: Kategorie-basierter Textvorschlag. Langfristig: Multi-Platform.

### Demo-/Preview-Logik für Reviews

Im Prospect-Demo-Modus:
- Review-Anfrage auslösen → Prospect bekommt SMS/E-Mail
- Review Surface zeigt Prospect-Firmennamen
- "Posten" führt auf Google Review URL des Prospects (wenn konfiguriert) oder auf Preview-Seite
- **Kein Mock nötig** — das echte System funktioniert, nur mit Demo-Daten

---

## 14. Mobile as Proof Dimension

### Warum Mobile nicht "responsive" heissen darf

"Responsive" = "funktioniert auch auf dem Handy." Das reicht nicht.

**Mobile ist der Default-Kontext** des Prospects und seiner Endkunden:
- Founder sendet Outreach-E-Mail → Prospect liest auf Handy
- Prospect klickt Website-Link → mobiler Browser
- Prospect ruft Testnummer an → Handy
- SMS kommt → Handy
- Korrekturlink → mobiler Browser
- Dashboard → mobiler Browser
- Review Surface → mobiler Browser

**Mobile ist kein Fallback. Mobile ist der Hauptweg.**

### Mobile-Proof-Kriterien (empfohlen für Quality Gates)

| Touchpoint | Mobile-Kriterium | Heute erfüllt? |
|------------|-----------------|----------------|
| Website | Responsive, Touch-friendly, <3s Load | ✅ (SSG + Tailwind) |
| Wizard | Responsive, Keyboard-friendly, Photo-Upload | ✅ |
| SMS Korrekturlink | Responsive, einfache Felder | ✅ |
| Review Surface | Mobile-first, Thumb-friendly | ✅ (PR #127) |
| Ops Dashboard | Responsive, Touch-friendly KPIs | ⚠️ Responsive ja, optimiert nein |
| Video | Mobil abspielbar, Hochformat möglich | ⚠️ Noch kein Video |
| Outreach-E-Mail | Mobile-friendly HTML | ⚠️ Nicht getestet |

**Empfehlung (D15):** Mobile-Check als **explizites Kriterium in Quality Gate 2 (Website) und Gate 3 (Lisa/E2E)** aufnehmen. Nicht optional, sondern Pflicht.

### Mobile im Demo-/Prospect-Erlebnis

Der stärkste Demo-Moment: Founder sitzt mit Prospect zusammen. Prospect nimmt SEIN Handy. Ruft Testnummer an. Bekommt SMS. Öffnet Dashboard. Sieht seinen Fall. Alles auf SEINEM Gerät. **Das ist kein Demo — das ist sein zukünftiger Alltag.**

---

## 15. Dashboard / Ops Experience

### Wie sich das Dashboard anfühlen soll

> "Das ist MEIN System. Hier sehe ich, was bei mir passiert."

Nicht: "Das ist ein Tool, das ich benutze." Sondern: "Das ist die Schaltzentrale meines Betriebs."

### Elemente des "Mein System"-Gefühls

| Element | Status | Wirkung |
|---------|--------|---------|
| Firmenname im Header | ✅ PR #127 | "Das ist für mich gemacht" |
| Firmen-Initialen im Avatar | ✅ PR #127 | Visuelle Zugehörigkeit |
| Brand-Farbe im Dashboard | ❌ Offen | Stärkere Identifikation |
| Nur eigene Cases | ❌ Offen (D8) | Relevanz + Datenschutz |
| KPI-Zahlen (nur eigene) | ❌ Offen | "So steht mein Betrieb" |
| Benutzername | ✅ E-Mail im Header | Persönlich |

### Demo-Dashboard (Prospect-Erlebnis)

Wenn ein Prospect das Dashboard öffnet, muss er sehen:
1. **Seinen Firmennamen** im Header
2. **15 realistische Cases** (Demo-Dataset) — nicht leer, nicht generisch
3. **Seinen eigenen Test-Call** (gerade eben gemacht) — oben in der Liste
4. **KPIs**: 15 Fälle, 3 Notfälle, 8 erledigt, 4 offen
5. **Timeline** bei Case-Detail: case_created → sms_sent → status_changed

### Typische Demo-Cases (Cluster-Empfehlung für §16)

| Cluster | Anzahl | Beispiele | Urgency |
|---------|--------|-----------|---------|
| Notfälle | 3 | Wasserrohrbruch, Heizungsausfall, verstopfter Abfluss | emergency |
| Geplante Reparaturen | 5 | Tropfender Hahn, Thermostat defekt, Dusche undicht | normal |
| Neuinstallationen | 3 | Badezimmer-Umbau, neue Heizung, Boiler-Ersatz | normal |
| Wartung | 2 | Heizungswartung, Entkalkung | low |
| Anfragen / Kontakt | 2 | Offerte gewünscht, allgemeine Frage | low |

---

## 16. Demo-Dataset / Seed Data Strategy

### Warum Demo-Daten kein Testdaten-Thema sind

Demo-Daten sind **Verkaufsmaterial**. Sie erzeugen drei Effekte:

1. **Wow:** Dashboard ist nicht leer → "Da passiert was"
2. **Trust:** Cases sind realistisch → "Das sieht nach echtem Betrieb aus"
3. **Alltag:** Verschiedene Kategorien, Dringlichkeiten, Status → "So würde mein Tag aussehen"

### Seed-Data-Strategie

**Grundsatz:** Demo-Daten müssen **relativ zu heute** generiert werden, nicht mit festen Timestamps. Sonst veralten sie.

```
Seed-Script Logik:
1. Input: tenant_id, tenant_slug, gewerk
2. Generiere 15 Cases:
   - created_at: heute -1d bis heute -14d (verteilt)
   - status: 8x done, 4x open, 3x in_progress
   - urgency: 3x emergency, 7x normal, 5x low
   - source: 8x voice, 5x wizard, 2x manual
   - category: gewerk-spezifisch (aus Prospect Card)
   - reporter_name: Schweizer Namen (Meyer, Müller, Brunner, etc.)
   - contact_phone: +41 79 xxx xx xx (Fake, aber formatkonform)
   - contact_email: test@example.com
3. Generiere Case Events pro Case (timeline)
4. Setze review_sent_at für 3 "done" Cases (Review-Demo)
5. Markiere Cases als demo: true (neues Feld oder Convention)
```

**Skalierbarkeit:**
- Script parametrisiert: `seed_demo_data.mjs --tenant=fc4ba994 --gewerk=sanitaer --count=15`
- Gewerk-spezifische Kategorie-Templates (Sanitär, Heizung, Lüftung, Elektro, Dachdecker, etc.)
- Idempotent: Script löscht alte Demo-Cases vor Neuerstellung

**Entschieden (D10):** `is_demo: boolean DEFAULT false` auf Cases-Tabelle.
- Semantisch sauber: `source` = Kanal (voice/wizard/manual), `is_demo` = Datenzweck
- Migration: `supabase/migrations/20260310000000_rls_tenant_isolation.sql`
- Seed-Script: `scripts/_ops/seed_demo_data.mjs --tenant=<id> --gewerk=sanitaer`
- Cleanup: `--clean` Flag löscht bestehende Demo-Cases vor Neuerstellung

---

## 17. Rollenmodell

### Wer macht was?

| Rolle | Verantwortung | Entscheidet über | Nicht delegierbar |
|-------|---------------|-----------------|-------------------|
| **Founder** | Vision, Kundenkontakt, Go/No-Go, Video, Outreach-Versand | Produkt-Richtung, Preise, Kunden-Kommunikation, Outreach-Timing | Kundengespräch, Video-Aufnahme, finale Go-Entscheidung |
| **CC (Claude Code)** | Architektur, Code, Provisioning, Quality Gates, SSOT-Pflege | Technische Architektur, Implementierungsreihenfolge, Code-Qualität | — (alles delegierbar, aber CC ist Primär-Implementierer) |
| **ChatGPT** | Strategie-Sparring, Messaging, Texte, Prompt-Optimierung | Messaging-Formulierungen, Strategie-Empfehlungen | — |
| **Spezialisierte Agents** | Gezielte Aufgaben (Scout, Crawl, Retell Sync) | Nichts (Tool, nicht Entscheider) | — |

### Zusammenarbeitsmodell

```
Founder ←→ ChatGPT:  Strategie, Messaging, "Wie sage ich das?"
Founder ←→ CC:       "Baue das.", "Prüfe das.", "Ship it."
CC ←→ Agents:        scout.mjs, crawl-website.mjs, retell_sync.mjs
CC ←→ SSOT:          STATUS.md, Ticketlist.md, gtm_tracker.md, customer/status.md

Entscheidungsregel:
- Founder sagt WAS und WARUM
- CC sagt WIE und prüft MACHBARKEIT
- ChatGPT sagt WIE ES KLINGT
- CC challenged IMMER (bevor implementiert wird)
```

### Was automatisierbar ist (heute und morgen)

| Aufgabe | Heute | Ziel |
|---------|-------|------|
| Website-Provisioning | Halbautomatisch (crawl + config + build) | Voll (prospect_pipeline.mjs --provision) |
| Voice Agent | Manuell (JSON edit + retell_sync) | Template-basiert (B-Full, ~10 Min) |
| Demo-Dataset | ✅ seed_demo_data.mjs | Automatisch (in provision_trial.mjs integriert) |
| Quality Gates | Manuell (Checklist) | Halbautomatisch (smoke_voice.mjs + build check) |
| SSOT-Updates | Manuell (CC nach jedem PR) | Bleibt manuell (SSOT-Drift-Risiko bei Automation) |
| Outreach | Manuell (Founder sendet) | Bleibt manuell (persönlich > automatisch) |

---

## 18. Quality-First before Scale

### Architekturprinzip

> Kein systematischer Outreach, bevor die Qualität des Prospect-Erlebnisses nicht nachweisbar auf dem Niveau ist, das wir selbst als "würde ich kaufen" bezeichnen.

### Was vor Skalierung sitzen muss

| # | Element | Status | Warum kritisch |
|---|---------|--------|---------------|
| 1 | Tenant-Isolation (Cases, Dashboard, Review) | ⚠️ Teilweise | Ein Leak = Vertrauenstod |
| 2 | Demo-Dataset (15 realistische Cases) | ❌ Offen | Leeres Dashboard = kein Wow |
| 3 | SMS E2E (Prospect erhält SMS) | ⚠️ Founder-Check offen | SMS = Beweis dass System funktioniert |
| 4 | Review E2E (Review-Anfrage → Google) | ⚠️ google_review_url offen | Review = Geschäftswert-Beweis |
| 5 | Demo-Zugang (Prospect kann Dashboard sehen) | ❌ Offen | Ohne Zugang kein "Mein System"-Moment |
| 6 | Voice Closing korrekt | ✅ PR #126 | Abruptes Ende = Vertrauensverlust |
| 7 | Voice FAQ-safe | ✅ PR #127 | Vorzeitiges Auflegen = Frustration |
| 8 | Mobile E2E Journey | ⚠️ Nicht systematisch getestet | Mobile = Default-Kontext |

### Go/No-Go Kriterien vor Outreach

**MUST (alle müssen PASS sein):**
- [x] Tenant-scoped Cases (Prospect sieht nur eigene) — PR #128, RLS live
- [ ] Demo-Dataset geladen (15+ Cases)
- [ ] Demo-Zugang funktioniert (Link oder Login)
- [ ] SMS E2E (Prospect erhält SMS auf eigenes Handy)
- [ ] Review E2E (Review-Anfrage → Review Surface → Google)
- [ ] Mobile Journey getestet (Website → Call → SMS → Dashboard → Review)
- [ ] Quality Gates G1-G5 PASS für den konkreten Prospect

**SHOULD (erhöhen Conversion, kein Blocker):**
- [ ] Brand-Farbe im Dashboard
- [ ] Video (Leckerli A) aufgenommen
- [ ] Interaktive Sterne in Review Surface

---

## 19. Delivery / Operations / SSOT

### SSOT-Hierarchie

```
docs/STATUS.md              ← Was ist live? (Produkt-Überblick)
docs/ticketlist.md           ← Was ist offen? (EINZIGER Task-Tracker)
docs/gtm/gtm_tracker.md    ← GTM-spezifische Tasks + Weinberger-Status
docs/gtm/architecture_detail.md ← Zielarchitektur (DIESES Dokument)
docs/customers/<slug>/status.md ← Pro-Kunde Status
MEMORY.md                   ← CC-Kontext über Sessions hinweg
CLAUDE.md                   ← Repo-Guardrails (fix, kein Drift)
```

### Wie die Dokumente zusammenspielen

| Frage | Dokument |
|-------|----------|
| "Was ist live?" | STATUS.md |
| "Was muss ich als nächstes tun?" | Ticketlist.md |
| "Wie steht es um Weinberger?" | docs/customers/weinberger-ag/status.md |
| "Wie soll die Architektur aussehen?" | **architecture_detail.md** (dieses Dok.) |
| "Wie provisioniere ich einen Prospect?" | docs/runbooks/provisioning_prospect.md |
| "Welche Quality Gates muss der Prospect passieren?" | docs/gtm/quality_gates.md |
| "Welches Paket bekommt der Prospect?" | docs/gtm/einsatzlogik.md |

### Drift-Prävention

| Regel | Mechanismus |
|-------|------------|
| Anti-Drift nach jedem PR | CC aktualisiert STATUS.md + Ticketlist.md + customer status.md |
| Kein zweiter Task-Tracker | Ticketlist.md = EINZIGER Ort für Tasks |
| Challenge before Build | CC challenged jeden Prompt bevor Implementierung |
| SSOT-Check vor Outreach | Quality Gate 5: Docs aktuell? Pipeline aktuell? |
| Memory Hygiene | CC aktualisiert MEMORY.md vor Context-Komprimierung |

---

## 20. Offene Architekturfragen / Entscheidungsbedarf

### Entschieden (kein Drift)

| Entscheidung | Wann | Referenz |
|-------------|------|----------|
| FlowSight = Leitsystem | 2026-03-10 | §3 |
| Leckerli A-D = Proof, nicht Tiers | 2026-03-09 | operating_model.md |
| Quality before Scale | 2026-03-10 | §18 |
| Voice: Intake-only, max 7 Fragen, Recording OFF | 2026-02-18 | CLAUDE.md |
| Output: E-Mail (Kunden), WhatsApp: Founder-only | 2026-02-18 | CLAUDE.md |
| Wizard = universeller Intake ("Anliegen") | 2026-03-09 | PR #113 |
| E-Mail-Outreach bleibt manuell (Founder) | 2026-03-09 | gtm_tracker.md |
| Keine Supabase prospects-Tabelle bis >30 | 2026-03-09 | gtm_tracker.md |

### Entschieden (Founder GO — 10.03.)

| # | Entscheidung | Umsetzung |
|---|-------------|-----------|
| D4 | 3-Modi-Logik (Full/Extend/Pure System) | `einsatzlogik.md` + `prospect_card.json` → `modus: 1\|2\|3` |
| D8 | RLS als Zielarchitektur für Tenant-Isolation | Migration `20260310000000_rls_tenant_isolation.sql` + API-Filter als Transition |
| D9 | Magic-Link via Supabase OTP für Prospect-Zugang | Noch zu bauen (nach RLS-Migration angewandt) |
| D10 | `is_demo: boolean` auf Cases + Seed-Script | Migration ready, `seed_demo_data.mjs` ready |
| D11 | `demo_sms_target` in tenant modules | Webhook refactored, 3-Tier SMS Routing |

### Offen — CC kann vorschlagen + umsetzen

| # | Frage | Nächster Schritt |
|---|-------|-----------------|
| D5 | TenantContext-Erweiterungen (brand_color, notification_email) | Migration planen |
| D12 | ~~G2 B-Quick~~ ELIMINATED — immer B-Full | — |
| D13 | Multi-Tenant Dashboard UI | Design nach D8 |
| D14 | Review Surface Personalisierung | reporter_name einbauen |
| D15 | Mobile-Check in Quality Gates | quality_gates.md ergänzen |

### Nächste Klärungen (nach D4/D8/D9/D10/D11)

```
1. ✅ RLS-Migration applied (PR #128)
2. Founder: DEMO_SIP_CALLER_ID prüfen (SMS E2E)
3. ✅ Magic-Link gebaut (PR #130)
4. ✅ Seed-Script gebaut + ausgeführt (PR #128)
5. CC: reporter_name in Review Surface einbauen
6. CC: Welcome-Mail + Offboarding-Mail Templates
7. CC: Morning Report mit Trial-Status
```

---

## 21. Empfohlene Zielarchitektur (konkretes Urteil)

### Gesetzte Prinzipien

1. **TenantContext = First-Class.** Jeder Touchpoint resolves seinen Tenant. Kein Fallback auf "FlowSight" in Produktion.
2. **Demo-Modi = klar getrennt.** Internal Test ≠ Prospect Demo ≠ Production. Keine Grauzone.
3. **Prospect Experience = echter Systemdurchlauf.** Kein Mock, kein Fake. Echtes Voice, echte SMS, echtes Dashboard — nur mit kontrollierten Daten.
4. **Quality Gate = kein Outreach ohne PASS.** Lieber 1 Woche später mit perfektem Erlebnis als 1 Tag früher mit Leaks.
5. **Mobile = Default.** Jeder Flow muss mobil funktionieren, nicht "auch" mobil.

### Konkrete Architekturempfehlungen

| # | Empfehlung | Begründung |
|---|-----------|-----------|
| 1 | **Supabase RLS für Tenant-Isolation** (Production) + API-Layer für Demo-Modus | Sicherste Lösung für Multi-Tenant. Demo braucht Flexibilität (Dataset laden, Cross-Tenant für Founder). |
| 2 | **Magic-Link für Demo-Zugang** mit signed JWT (tenant_id, expires, read-only) | Niedrigster Aufwand, kein Account-Management, saubere Isolation. |
| 3 | **is_demo Flag auf Cases** + Seed-Script | Saubere Trennung. Dashboard kann Demo-Cases filtern. Cleanup einfach. |
| 4 | **demo_sms_target in tenant modules** statt globaler DEMO_SIP_CALLER_ID | Tenant-spezifisch. Prospect bekommt SMS auf eigenes Handy. |
| 5 | **brand_color + notification_email in modules JSONB** | Ein Ort für alle Tenant-Config. Kein Env-Var-Wildwuchs. |
| 6 | **Mobile-Check als Pflicht in Quality Gates G2 + G3** | Mobile = Default-Kontext. Kein Outreach ohne Mobile-PASS. |
| 7 | **reporter_name in Review Surface** (statt "Max Mustermann") | Schneller Win, grosser Effekt auf Glaubwürdigkeit. |
| 8 | ~~B-Quick~~ **ELIMINATED** — immer B-Full. Jeder Prospect bekommt eigenen dedizierten Agent. | Qualität > Skalierung. Template-basierter B-Full flow dauert ~10 Min. |

### Top-10 Architektur-Prioritäten (jetzt → nächste 2 Wochen)

| Rang | Was | Warum | Aufwand |
|------|-----|-------|---------|
| 1 | Tenant-scoped Cases (D8) | Blockiert Demo-Zugang + Multi-Tenant | ~4h |
| 2 | Demo-Dataset Seed-Script (D10) | Blockiert Dashboard-Wow | ~2h |
| 3 | Demo-Zugang Magic-Link (D9) | Blockiert Prospect-Erlebnis | ~3h |
| 4 | SMS E2E Fix (Founder Env-Check) | Blockiert SMS-Proof | ~30min (Founder) |
| 5 | google_review_url für Weinberger (Founder DB) | Blockiert Review-Proof | ~10min (Founder) |
| 6 | reporter_name in Review Surface (D14) | Quick Win, hoher Impact | ~30min |
| 7 | Mobile E2E Journey Test | Validiert Mobile-Proof-Dimension | ~1h |
| 8 | ~~G2 B-Quick~~ ELIMINATED — immer B-Full | — | — |
| 9 | Modus 1/2 in Einsatzlogik Docs (D4) | Skaliert Pipeline-Entscheidung | ~1h |
| 10 | brand_color + notification_email → modules (D5) | Konsolidiert Tenant-Config | ~2h |

---

## 22. Next Decision Agenda

### Founder + CC: Nächste Architektur-Klärungen

| # | Thema | Format | Dauer | Output |
|---|-------|--------|-------|--------|
| 1 | **D8: Tenant-scoped Cases** — RLS vs. API-Filter, Founder-Ausnahme, Demo-Modus | Kurzdiskussion | 15 Min | Entscheidung → CC baut |
| 2 | **D9: Demo-Zugang** — Magic-Link vs. Temp-User, TTL, Permissions | Kurzdiskussion | 10 Min | Entscheidung → CC baut |
| 3 | **D10: Demo-Dataset** — is_demo Flag, Case-Cluster, Gewerk-Templates | Review CC-Vorschlag | 10 Min | Go → CC baut Seed-Script |
| 4 | **D11: SMS-Routing Demo** — Prospect-Handy oder Founder zeigt | Kurzdiskussion | 5 Min | Entscheidung |
| 5 | **Founder-Aktionen** — DEMO_SIP_CALLER_ID, google_review_url, Testanruf | Founder allein | 15 Min | Env gesetzt, getestet |

### Founder + ChatGPT: Strategie-Themen

| # | Thema | Warum jetzt |
|---|-------|------------|
| 1 | Modus 1/2 Messaging — wie kommunizieren wir "Extend" vs. "Replace"? | Weinberger = erster Modus-2-Prospect |
| 2 | Outreach-Timing — wann ist Weinberger-Erlebnis gut genug für Outreach? | Quality Gate für ersten echten Outreach |
| 3 | Pricing-Kommunikation — wie passt Starter/Alltag/Wachstum zu Leckerli? | Prospect fragt nach Preis |
| 4 | Video-Aufnahme Weinberger (Leckerli A) — Skript + Setup | Einziger Founder-only Deliverable |

---

## Appendix: Referenz-Dokumente

| Dokument | Pfad | Inhalt |
|----------|------|--------|
| STATUS.md | docs/STATUS.md | Was ist live (17 Module, 7 Websites) |
| Ticketlist.md | docs/ticketlist.md | Einziger Task-Tracker |
| Operating Model | docs/gtm/operating_model.md | 6 Phasen, Trial Lifecycle, Quality Gates |
| GTM Tracker | docs/gtm/gtm_tracker.md | Execution-Status + Weinberger |
| Einsatzlogik | docs/gtm/einsatzlogik.md | ICP → Paket → Assets |
| Quality Gates | docs/gtm/quality_gates.md | 5 Gates mit Pass/Fail |
| Provisioning Runbook | docs/runbooks/provisioning_prospect.md | <25 Min Provisioning |
| Prospect Card Contract | docs/architecture/contracts/prospect_card.md | JSON Schema |
| Case Contract | docs/architecture/contracts/case_contract.md | Case-Datenmodell |
| CLAUDE.md | CLAUDE.md | Repo-Guardrails |
| Weinberger Status | docs/customers/weinberger-ag/status.md | Goldstandard-Tenant |

---

*Erstellt: 2026-03-10 | CC (Head Ops) | Version 1.0*
*Nächster Review: Nach Founder-Feedback zu D8/D9/D10/D11*
