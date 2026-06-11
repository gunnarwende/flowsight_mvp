# Lessons Learned — Customer Journey (Sales → Onboarding → Go-live)

> **Lebendes Dokument.** Der Lessons-Loop aus [`FlowSight_Customer_Journey_SSOT.md`](FlowSight_Customer_Journey_SSOT.md) §15.
> Ergänzt **innerhalb 24h nach jedem echten Prospect-/Kunden-Kontakt** (Detail ist sonst weg).
> **Zwei Phasen:** **Teil 1 — SALES** (Outreach → Beweis-Seite → Discovery → Founder-Review) · **Teil 2 — ONBOARDING/GO-LIVE** (Cockpit → Live-Setup → Hand-Over → Validierung).
> Verwandt: `docs/customers/lessons-learned.md` (Demo-Pipeline-Lessons pro Betrieb).

---

# TEIL 1 — SALES & DISCOVERY

*(Aktueller Fokus seit Outreach-Phase 06/2026. Gesprächskarte für den Live-Call: `FlowSight_Customer_Journey_Short.md`.)*

## Goldene Sales-Regeln (aus echten Gesprächen extrahiert)

| Regel | Vorfall | Lehre |
|---|---|---|
| **S1 — Eröffnung: GEBEN statt FRAGEN** | Dörfler 11.06 (Besuch) | „Haben Sie die Mail angeschaut?" stellt den Handwerker auf die Probe (Hausaufgabe gemacht?) → Abwehr. Besser das **Geschenk** voranstellen: *„Ich hab Ihnen ein kurzes Video für Ihren Betrieb gemacht, wollte kurz Gesicht zeigen."* Geben entwaffnet, Prüfen verteidigt. |
| **S2 — Beziehungs-Brücke ZUERST** | Dörfler 11.06 | Founder war Dörflers Kunde (Dichtung) — die wärmste In-Road, aber **ungenutzt** → blieb „fremder Vertreter" → Skepsis. Jede bestehende Beziehung im **ersten Satz** nennen: *„Sie haben mir ja damals die Dichtung gemacht."* Schmilzt Skepsis sofort. |
| **S3 — Druck rausnehmen + Raum lesen ✅ (BESTÄTIGT, stärkste Skill)** | Dörfler 11.06 | Was funktioniert hat: skeptischen Blick + „will weiter"-Signal gelesen, **nicht gepusht**, warm + kurz raus mit Neugier-Saat (*„machen Sie in Ruhe, könnte für Sie interessant sein"*) + Blickkontakt → live gesehen, wie der Druck abfiel + er zustimmend nickte. **Besuch ist gewonnen, wenn der Eindruck = „echter Typ, kein Drücker"** — auch ohne konkretes Ergebnis. |
| **S4 — Besuch #1 = Gesicht + Saat, NICHT Abschluss** | Dörfler/Walter 11.06 | Ziel des ersten persönlichen Besuchs: Gesicht zeigen, Neugier säen, **kein Schaden** — nicht an der Tür verkaufen/Discovery durchziehen. Realismus: Handwerker ist oft auf der Baustelle (Walter nicht angetroffen). → **Kurz vorher anrufen** macht aus der kalten Tür einen eingeladenen Besuch + sichert Anwesenheit. |
| **S5 — Skepsis ist normal, nicht persönlich** | Dörfler 11.06 | Ein fremder Typ vor der Werkstatt = erstmal „Vertreter"-Verdacht. Der skeptische Blick ist Default, nicht Ablehnung. Er schmilzt, sobald klar wird: kein Druck (→ S3). |
| **S6 — „durchgespielt"/Demo-Sprache RAUS** | Mail-Reframe 11.06 | „komplett durchgespielt" klingt nach Spielwiese/Simulation → untergräbt den „echt/live"-Frame genau vor dem Klick. Stattdessen: „für Ihren Betrieb **sichtbar gemacht, wie selbst im hektischsten Alltag** keine Anfrage untergeht — egal ob Telefon, Website oder vor Ort, bis zur Bewertung." Real + persönlich, nicht „gespielt". |
| **S7 — Haken zum Profil matchen, NIE über-claimen** | Wälti/Leins-Mail 11.06 | „Der ruft die Konkurrenz / hat sich erledigt" stimmt nur für klein-immer-draußen (Walter auf dem Dach), NICHT für etablierte Betriebe (Showroom/Team) — deren Anrufe sind meist Bestandskunden → über-claim → innere Abwehr „bei mir nicht" → Neugier tot. Etabliert → **Sichtbarkeits-/Überblick-Haken**, nicht Drohung. Prinzip: *Bedrohung senken vor Spannung.* |
| **S8 — Klick-Hürde senken: Format signalisieren + distinkte Beats** | Mail-Reframe 11.06 | Am Link muss der Empfänger wissen, dass ihn ein **kurzes Video** erwartet (nicht eine Website zum Lesen) → Label „Ihr persönlicher Video-Einblick". Mittelteil distinkt halten (Situation ≠ Konsequenz, nicht doppelt). JSON-Falle: in `_variante`-Kommentaren keine geraden `"` (brechen das JSON) — nur typografische oder keine. |

### Kanal-Lehre (11.06., Senior-Analyse)
- **E-Mail ist NICHT der Flaschenhals zum Fixen — sie ist der falsche Lead-Kanal für die Gold-ICP.** Inhaber „wenig im Office" (Dörfler: `view_count=0` trotz Versand) → E-Mail bleibt der durable **Beleg/Link-Träger**, nicht das Überzeugungs-Medium. Geführt wird mit **Mensch** (Besuch/Anruf).
- **WhatsApp = warmer Liefer-Kanal, NICHT Kalt-Blast.** Kalt programmatisch = Meta-Ban-Risiko + UWG + aufdringlich → nein. Aber: **nach jedem Besuch/Anruf den Beweis-Link manuell per WhatsApp vom Handy** schicken (solicited, ~90% Öffnung, persönlich, kein Build). Automatisierter API-Weg nur solicited, später bei Skalierung. Kanal-Stack-Stärke: **vor Ort > Anruf > WhatsApp(warm) > SMS(warm) > E-Mail(Beleg).** → im Customer-Journey-SSOT §4 verankert.

## Gespräch-Log

### 2026-06-11 · Dörfler AG (ein Bruder, Oberrieden) — persönlicher Besuch
- **Kontext:** kalt (Mail 09.06, noch nicht geöffnet). Founder vor Ort nach Arzttermin in Oberrieden. Erster persönlicher Sales-Besuch überhaupt.
- **Verlauf:** vor der Werkstatt getroffen (arbeitete mit anderen), ~10 Sek warten, **sehr skeptischer Blick**, kurzes Händeschütteln. Eröffnung: *„Haben Sie schon dazu gekommen, die Mail anzuschauen?"* → *„Nein, bin zurzeit wenig im Office"*, wollte weiter. Founder nahm den Druck raus, Neugier-Saat, warmer Exit → **Druck fiel sichtbar ab, zustimmendes Nicken.**
- **Ergebnis:** **Kein Nein** — Saat gepflanzt, Gesicht hinterlassen, nächster Kontakt jetzt wärmer.
- **Nächster Schritt:** First-View-Alert beobachten → bei keinem View in ~3 Tagen reibungsarmer Nudge (*„ich weiß, Sie sind selten im Office — das Video sind 60 Sek aufs Handy, hier nochmal der Link"*).
- **Lessons:** → **S1** (mit Email-Frage statt Geschenk eröffnet → Abwehr), **S2** (Dichtungs-Brücke ungenutzt — größter verschenkter Hebel), **S3** (Druck-raus ✅ instinktiv stark gemeistert).
- **Walter Leuthold:** nicht angetroffen (Baustelle) → S4 (vorher anrufen).

<!-- Template Sales: ### YYYY-MM-DD · <Betrieb> (<Person>, <Ort>) — <Kanal: Besuch/Call/Mail-Reply>
- Kontext (warm/kalt, Video gesehen?): · Verlauf: · Ergebnis: · Nächster Schritt: · Lessons (→ S#): -->

---

# TEIL 2 — ONBOARDING & GO-LIVE (Post-Conversion)

> Greift ab dem „Ja" → Cockpit → Live-Setup → Validierung. Historie: bisher **1 Live-Kunde** (BigBen Pub, Barter — anderes Modul, aber die technischen Lessons gelten betriebsübergreifend). Die G-Regeln sind in `ONBOARDING_BIBLE.md` §5 cockpit-gerahmt formalisiert; hier die Geschichte dahinter.

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
