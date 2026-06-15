# Lessons Learned — ONBOARDING & Go-live (Post-Conversion)

> **Lebendes Dokument der Onboarding-Säule.** Greift ab dem „Ja" → Cockpit → Live-Setup → Validierung.
> Ergänzt **innerhalb 24h nach jedem echten Kunden-Kontakt** (Detail ist sonst weg).
> Die G-Regeln sind in [`ONBOARDING_BIBLE.md`](ONBOARDING_BIBLE.md) §5 cockpit-gerahmt formalisiert; hier die Geschichte dahinter.
>
> **Sales-/Discovery-Lessons (vor dem „Ja", S-Regeln):** → [`../sales/lessons_learned_sales.md`](../sales/lessons_learned_sales.md).
> Verwandt: `docs/customers/lessons-learned.md` (Demo-Pipeline-Lessons pro Betrieb).

---

## Goldene Regeln (G1-G12, aus Vorfällen)

| Regel | Vorfall (Kunde / Tag) | Was wäre fast passiert |
|---|---|---|
| G1 — Pre-Flight-Check vor Go-live | BigBen 28.04. | Termin gestartet ohne Voice-Cron-Verify; Lisa hätte am Folgetag „28. April" gesagt obwohl 29. |
| G2 — Kein Kunden-Leak | BigBen 28.04. (FB27) | Tenant-Switcher zeigte ALLE Kunden-Namen, wenn Founder auf Pauls Tenant ging → Privacy-Desaster, wenn Paul danebensteht. |
| G3 — Kunden-Sprache | BigBen 28.04. (FB22/23) | Englischer Pub mit deutschem Date-Picker = „1990er-Software"-Eindruck → Vertrauensverlust. |
| G4 — Voice dynamisch + verifiziert | BigBen 28.04. (FB1/26) | Lisa sagte 11 Tage altes Datum + las „03 May" als „zero three may" → unprofessionell beim Kunden. |
| G5 — SMS nur bei Confirm | BigBen 28.04. (FB24) | Doppel-SMS (Submit + Confirm) → Kunde glaubt, schon bestätigt → Doppelbuchungen. |
| G6 — App leer übergeben | BigBen 28.04. | Founder-Testdaten noch in DB → Kunde sieht eigene erste Reservierung nicht als „die erste". |
| G7 — GH-Secrets verifizieren | BigBen 28.04. | `SUPABASE_URL` + `RETELL_API_KEY` nicht als GH-Secret → Cron failt still. (Bonus-Fund: Morning-Report seit März stumm kaputt — selbe Ursache. Wiederholt 09.06. bei Bunny-Secrets!) |
| G8 — Per-Tenant-Routing | BigBen 28.04. (FB25) | `/ops/app/<slug>` redirected hardcoded auf Sanitär → falsches Dashboard. |
| G9 — Cross-Platform-Pfade | BigBen 28.04. | Cron lief lokal (Windows), failte auf GH Actions (Linux) wegen Pfad-Regex. (Wiederholt 09.06.: `execSync` nutzt cmd.exe — `/dev/null`/`&&` brechen.) |
| G10 — Lessons innerhalb 24h | meta | 24h später ist das Detail weg. |
| G11 — Voice macht NUR 100%-bestätigte Versprechen | BigBen 28.04. PM | Lisa versprach „Quiz every Wednesday" obwohl nicht in DB → Trust kaputt, wenn Caller kommt + nichts ist. (= Cockpit-Compliance-Sandbox heute.) |
| G12 — SoT pro Feld + Voice-Tier | BigBen 28.04. PM | „Website ist immer SoT" stimmt nicht; per-Kunde-Source-Map nötig. 90% Sanitär = Website primär für T3-Wissen. |

## Customer Log

### 2026-04-29 · Big Ben Pub (Paul Hadley, Oberrieden) — erster Live-Kunde
**Modul:** Pub (events/reservations/voice/sms/reviews) · **Sprache:** EN (+DE-Swap) · **Voice:** +41 44 505 48 18 · **Forwarding:** 044 722 20 62 (Swisscom) · **Setup:** ~60 Min vor Ort.

**Was funktioniert hat:**
- **Master-Run-Sheet** als 60-Min-Block = scharfe Struktur (Template für Folge-Kunden).
- Voice-Cron 3×/Tag + Post-Publish-Verify + Telegram-Bestätigung → Founder schläft ruhig.
- Reservation-Polling 30s + manueller Refresh = robuster Fallback gg. unzuverlässiges Webhook.
- **End-to-End-Test mit echtem Anruf** vor Ort (Anruf → erscheint in App → Confirm → SMS) = Vertrauen live hergestellt.

**Was brach (Auswahl):** Voice-Datum 11 Tage alt (→G4) · TenantSwitcher-Leak (→G2) · `/ops/app/<slug>`→Sanitär-Redirect (→G8) · Premature-SMS bei Submit (→G5) · deutscher Date-Picker (→G3) · GH-Secrets fehlten still (→G7) · Linux-Pfad-Bug im Cron (→G9) · Patcher nicht idempotent (Prompt wuchs täglich).

**Patterns für Folge-Kunden (Onboarding):**
1. Customer-User **pre-provisionieren** vor OTP-Login (`app_metadata.tenant_id` + `staff`), sonst „LS"-Default-Branding-Bug.
2. `isFounder` als separater Diskriminator (nicht „admin = customer").
3. Per-Kunde **`data_sources.md`** (DB/GBP/Website/Static) + Voice-Knowledge-Tier (T1 generic → T4).
4. Voice-Knowledge-Coverage-Test (20 Fragen) vor Go-live.
5. Push: **persistente Card** statt Banner (0 Subscriptions bei Banner-only).
6. `/ops/app/[slug]` redirected nach Modul-Typ.

**Time-Investment:** Bug-Cluster + Cron-Hardening ~5h · Doku ~1h · PM-Sprint (Tenant-Architektur) ~5h. Erwartung: nächster Pub-Kunde <2h provisionierbar.

<!-- Template Onboarding: ### YYYY-MM-DD · <Kunde> (<Person>, <Ort>)
**Modul/Sprache/Voice/Forwarding/Setup:** ...
**Was funktioniert / Was brach / Patterns / Time-Investment:** ... -->
