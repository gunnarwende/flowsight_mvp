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
- Erwartung: nächster Pub-Kunde sollte mit existierender Infrastruktur in <2h provisionable sein, Bug-Cluster 0.

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
