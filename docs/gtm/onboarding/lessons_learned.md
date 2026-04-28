# Onboarding Lessons Learned

> Lebendes Dokument. Wird **innerhalb 24h nach jedem Kunden-Hand-Over** ergänzt.
> Format: 1× Eintrag pro Kunde + Goldene Regeln am Anfang.
>
> Scope: Post-Conversion-Phase (Live-Setup → Hand-Over → Validation → Convert).
> Pre-Conversion / Demo-Pipeline-Lessons: `docs/customers/lessons-learned.md`.

---

## Goldene Regeln (extrahiert aus Vorfällen)

Diese sind in `ONBOARDING_BIBLE.md` §1 als G1-G10 formalisiert. Hier die Geschichte dahinter.

| Regel | Vorfall (Kunde / Tag) | Was wäre fast passiert |
|---|---|---|
| G1 — Pre-Flight-Check | BigBen 28.04. | Hätte Termin gestartet ohne Voice-Cron-Verifikation; Lisa hätte am Folgetag noch "28 April" gesagt obwohl 29. |
| G2 — Kein Kunden-Leak | BigBen 28.04. (FB27) | Tenant-Switcher zeigte allen anderen Kunden-Namen wenn Founder testweise auf Pauls Tenant ging. Wenn Paul gleich neben dem Founder am Bildschirm stand → privacy disaster. |
| G3 — Kunden-Sprache | BigBen 28.04. (FB22+FB23) | Englischer Pub mit deutschem Date-Picker = "1990er Software" Eindruck → Vertrauensverlust. |
| G4 — Voice dynamisch | BigBen 28.04. (FB1+FB26) | Lisa sagte 11 Tage altes Datum + las "03 May" als "zero three may". Beides hätte Founder beim Kunden-Termin als unprofessionell entlarvt. |
| G5 — SMS bei Confirm only | BigBen 28.04. (FB24) | Doppel-SMS: erst "Paul wird bestätigen" beim Submit, dann "Confirmed" beim Confirm. Kunde glaubte, er sei schon bestätigt → Doppel-Buchungen. |
| G6 — App leer übergeben | BigBen 28.04. | Test-Reservierungen vom Founder waren noch in DB. Kunde sieht eigene erste Reservierung dann nicht als "die erste". Bricht das Gefühl. |
| G7 — GH-Secrets verifizieren | BigBen 28.04. | `SUPABASE_URL` + `RETELL_API_KEY` waren NICHT als GH-Secret gesetzt — Cron hätte stillschweigend gefailed. Bonus-Fund: Morning-Report war seit März stumm kaputt aus selbem Grund. |
| G8 — Per-Tenant-Routing | BigBen 28.04. (FB25) | `/ops/app/bigben-pub` redirected hardcoded auf `/ops/cases` (Sanitär). Paul hätte leeren Sanitär-Dashboard gesehen statt Pub-Dashboard. |
| G9 — Cross-Platform Pfade | BigBen 28.04. | Daily-Refresh-Skript funktionierte lokal (Windows) aber failte auf GitHub Actions (Linux) wegen URL-Pfad-Regex. Cron hätte morgen ohne Fix nichts updated. |
| G10 — Lessons innerhalb 24h | meta | Vorfälle vergisst man schnell. 24h später ist Detail weg. |
| G11 — Voice 100%-bestätigt | BigBen 28.04. PM (Pauls Termin) | Lisa versprach "Quiz every Wednesday" obwohl nicht in pub_events. Hardcoded Recurrings im Skript + WHAT WE OFFER. → wenn Caller kommt und nichts ist, Trust kaputt. Worst-Case: Sanitär-Stellenanzeige nicht mehr aktuell, Lisa nimmt trotzdem Bewerbungen entgegen. |
| G12 — SoT pro Feld + Tier | BigBen 28.04. PM (Pauls Termin, Stellenanzeigen-Hypothese) | Naive Pauschalisierung "Website ist immer SoT" funktioniert nicht. Manche Sanitär-Betriebe haben schwache Website + starkes GBP. Per-Kunde-Source-Map ist Pflicht-Deliverable in Phase-1. |

---

## Customer Log

### 2026-04-29 · Big Ben Pub (Paul Hadley, Oberrieden)

**Modul:** Pub (events + reservations + voice + sms + reviews)
**Sprache:** Englisch (mit DE-Swap-Agent)
**Voice:** `+41 44 505 48 18` (Lisa, Retell, EN+DE)
**Forwarding-Quelle:** `044 722 20 62` via Swisscom
**Live-Setup-Termin:** 29.04.2026 ~60 Min vor Ort

#### Was hat funktioniert
- **Master-Run-Sheet** (`docs/customers/bigben-pub/onboarding_paul.md`) als 60-Min-Block hat scharfe Struktur gegeben — wird Template für alle weiteren Kunden.
- **Voice-Cron 3× täglich + Post-Publish-Verify + Telegram-Bestätigung** = Founder schläft nachts ruhig.
- **Reservation-Polling alle 30s + manueller Refresh-Button** war robuster Fallback gegen unzuverlässiges Retell-Webhook.
- **End-to-End-Test mit echtem Anruf** im Run-Sheet (Founder ruft an, Reservation erscheint in Pauls App, Paul confirmt → SMS) hat Vertrauen vor Ort hergestellt.
- **Direkter Retell-Publish-Pfad** (statt `retell_sync.mjs` der nur DE+INTL-Pair kennt) — `bigben_publish.mjs` als modul-spezifisches Pendant.

#### Was hat genervt / gebrochen
1. **Voice-Datum war 11 Tage alt** beim ersten Test (FB1) — kein Cron, niemand hat's bemerkt. → Cron + Verify standardisiert (G4).
2. **TTS las "03 May" als "zero three may"** (FB26) — Datums-Format-Padding in Verbindung mit Retell-TTS. → Format ohne Leading-Zero + explizite Aussprache-Hints im Prompt.
3. **TenantSwitcher-Leak** (FB27) — Major. Sidebar-Dropdown zeigte ALLE Kunden-Namen wenn Founder als Admin auf Pauls App ging. → TenantSwitcher auf Pub-Tenants komplett versteckt; nur "Admin: back to workspace" als Single-Action-Button.
4. **`/ops/app/bigben-pub` redirected auf Sanitär-Leitzentrale** (FB25) — selbe Familie wie Tenant-Switcher-Bug, nur auf der PWA-Entry-URL. → Per-Tenant-Routing auf Modul-Basis.
5. **Premature SMS bei Submit** (FB24) — Customer kriegt SMS vor Pauls Confirm, dann nochmal beim Confirm. Bricht Trust. → SMS-Lifecycle nur an `confirmed`-Transition gebunden.
6. **Date-Picker zeigte deutsche Wochentage** (FB22+FB23) — Browser-native Picker ist immer Browser-Locale-abhängig. → Custom Pill-Scroller mit forced English.
7. **GH-Secrets fehlten still** — `gh secret list` zeigte nur `SUPABASE_SERVICE_ROLE_KEY`. URL + RETELL_API_KEY waren nicht da. Cron hätte gefailed. → G7: Secrets-Audit als Phase-2-Pflicht.
8. **Linux-Pfad-Bug** im Cron — `import.meta.url.pathname.replace(/^\//, "")` strippt nur auf Windows den nutzlosen Slash; auf Linux killt es den absoluten Pfad. → `fileURLToPath` als Standard.
9. **Patcher war nicht idempotent** — Mehrfaches Publishen prependete Datum-Blocks statt sie zu ersetzen, Live-Prompt wuchs jeden Tag. → Anchor auf erste kanonische ═══ Section, Top wegwerfen, neu aufbauen.
10. **Morning-Report war seit März stumm kaputt** (Bonus-Fund) — selbe Secrets-Lücke. → G7 lieferte Bonus-Reparatur über die ganze Cron-Familie.

#### Pattern für Folge-Kunden
- Pub-Tenants bekommen einen **eigenen Voice-Cron-Workflow** (Vorlage: `.github/workflows/bigben-voice-daily.yml`), nicht den generischen `retell_sync`.
- Bei Kunden mit `module_type=pub` muss `flowsight.ch/ops/app/<slug>` IMMER auf `/ops/pub-dashboard` redirecten — Test gehört in Phase-2-Provisioning-Checkliste.
- TenantSwitcher-Verhalten (hidden auf Customer-Tenants) ist tenant-agnostisch und gilt jetzt für ALLE customer-facing Tenants — nicht nur Pubs. Wenn wir je einen "Sanitär-Customer-Tenant" haben, sollte der Switcher dort auch versteckt werden. Aktuell gated auf `isPubTenant` — bei nächstem Kunden überdenken.
- Aussprache-Hints im Prompt sind generisch — auch für Sanitär-Kunden in Lisa-DE-Prompts übernehmen.

#### Time-Investment
- **Bug-Fixes-Cluster (FB22-FB27 + Cron-Hardening + Path-Bug + Lessons):** ~5h Founder-CC-Pair-Programming am 28.04.
- **Doku (Run-Sheet + Onboarding-Bible + Lessons):** ~1h
- **PM-Sprint (post-meeting B1-C1, FB27 nochmal verschärft + Tenant-Architektur):** ~5h
- Erwartung: nächster Pub-Kunde sollte mit existierender Infrastruktur in <2h provisionable sein, Bug-Cluster <5.

#### Post-Meeting Findings (28.04. PM nach Pauls Termin)
Pauls Termin war eine Stunde frühere als geplant. Confidence: 60% smooth, 25% Reibung, 15% kaputt.

**Was kaputt war ("LS Guidance system"-Bug):**
- Paul OTP-loggte sich ein → seine `auth.users` hatte KEIN `app_metadata.tenant_id` → resolveTenantScope fiel auf Default-Tenant → Paul sah "Leitsystem" Default-Branding (Browser-übersetzt zu "Guidance system") mit Initialen "LS"
- Founder hatte als Collateral seinen Switcher verloren weil FB27-Fix auf `isPubTenant` gegated war (Paul ist auch admin → Switcher sah ihn als customer-admin)

**Architektur-Fix:**
- `isFounder` als separater Diskriminator (Email-Allowlist initial, langfristig DB-Flag)
- Customer-User-Pre-Provisioning vor OTP-Login: `app_metadata.tenant_id + role` setzen + `staff` Eintrag (B1-Pattern)
- `tenant_architecture.md` als Querschnittsdokument

**Lisa-Purist-Mode (G11):**
- Hardcoded Recurrings (Quiz Wed, Karaoke Fri, Live Music Sat) entfernt
- Static-Prompt-Sections (WHAT WE OFFER, OPENING HOURS) gescrubbt
- NO-GO-Sektion verschärft: "NEVER claim weekly recurrings unless explicitly listed"
- Callback-Antwort bei nicht-geplanten Anfragen: "talk to Paul, he might arrange it"

**SSOT pro Feld (G12):**
- Per-Kunde `data_sources.md` als neuer Phase-1-Deliverable
- Vier Quell-Typen: DB / GBP / External-Website / Static
- Voice-Knowledge-Tier-Modell (T1 Generic → T4 Long-Time-Employee)
- 90% Sanitär-Kunden = External Website primary für T3-Wissen, NICHT Edge-Case

**Reality-Check für 10/Tag E2E:**
- Heute: 2-3 Kunden/Tag E2E mit Founder-Aktivbeteiligung
- 10/Tag ist 4-6 Wochen weg, 20/Tag 8-10 Wochen
- 4 strukturelle Lücken: Phase-Übergänge nicht automated, QGs nur in Phase 1, kein E2E-QG, Self-Service fehlt
- 6-Wochen-Roadmap in `tenant_architecture.md` §6 dokumentiert

**Push-Setup:**
- 0 Push-Subscriptions in DB für ALLE Tenants (Founder + Customer)
- Banner-only-Approach hat versagt (User klickt "später")
- Persistent `PushEnableCard` ins Pub-Dashboard eingebaut
- `/api/ops/push/send-test` für Verifikation während Onboarding

**No-Show Override:**
- NoShowBadge clickable mit Forgive-Modal
- `/api/bigben-pub/no-shows/forgive` flippt past no_show → cancelled
- Lisa bleibt aussen vor (versprach Founder + CC)

#### Patterns die MORGEN für Folge-Kunden gelten
1. **Phase 2 Pflicht: Customer-User pre-provisioniert** vor OTP-Login. Sonst "LS"-Bug.
2. **Phase 1 Pflicht: data_sources.md** + Tier-Plan pro Datenfeld.
3. **Phase 2 Pflicht: Voice-Knowledge-Extract** für T3+ (Website-Crawl + LLM-Strukturierung).
4. **Phase 5 Pflicht: Voice-Knowledge-Coverage-Test** (20 Fragen, 80% bzw 95% Hürde).
5. **Pub vs Sanitär Routing:** `/ops/app/[slug]` redirected nach Modulen.
6. **Push:** persistente Card statt Banner — Customer kann jederzeit aktivieren.

---

<!-- Template für nächsten Eintrag — kopieren und ausfüllen -->
<!--
### YYYY-MM-DD · <Kunde-Name> (<Kontaktperson>, <Ort>)

**Modul:** ...
**Sprache:** ...
**Voice:** ...
**Forwarding-Quelle:** ...
**Live-Setup-Termin:** ...

#### Was hat funktioniert
- ...

#### Was hat genervt / gebrochen
1. ...

#### Pattern für Folge-Kunden
- ...

#### Time-Investment
- ...
-->
