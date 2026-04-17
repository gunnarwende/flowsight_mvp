# Kundenakte: Big Ben Pub

## Betrieb
- **Name:** Big Ben Pub
- **Besitzer:** Paul (spricht nur Englisch)
- **Adresse:** Alte Landstrasse 20, 8942 Oberrieden
- **Telefon:** 044 722 20 62
- **E-Mail:** hello@big-ben-oberrieden.ch
- **Website:** big-ben-oberrieden.ch (vernachlässigt)
- **Instagram:** @bigbenpubzh
- **Google:** 4.7/5 (186 Reviews)
- **Branche:** Gastro / Pub (Non-Sanitär Pilot)
- **Beziehung:** Stammgast, persönlich bekannt
- **Deal:** Erster zahlender Kunde. 300 CHF einmalig + ~23 CHF/Mo. Barter-Deal (Free Drinks).
- **Go-Live Target:** 30.04.2026 (Founder danach auf Philippinen, 4 Wochen Testphase)

## Status
- Setup: **LIVE** (Tenant converted, 14.04.2026, Barter-Deal)
- Website: **LIVE** — flowsight.ch/bigben-pub (dark theme kennedys.ch, dynamic events, EN/DE)
- Voice EN: **LIVE** — +41 44 505 48 18 (Lisa, EN-GB Adrian, coffee-shop ambient, 20 Events im Prompt)
- Voice DE: **LIVE** — DE swap via `is_transfer_cf` (holprig — Retell-Limitierung, Transfer-Delay spürbar)
- Dashboard: **LIVE** — /ops/pub-dashboard (EN, Today KPIs klickbar, Next 7 Days, Website-Link)
- Events: **LIVE** — /ops/events (Sport/Events Tabs, Add/Edit/Delete, 20 Events geseedet)
- Reservierungen: **LIVE** — /ops/reservations (Walk-in, Confirm/Decline, SMS an Gast)
- No-Show System: **LIVE** — Yellow Card (1 No-Show) / Red Card (2+ No-Shows), status field on reservations
- Walk-in: **LIVE** — Quick-Add für spontane Gäste
- 24h SMS Reminder: **LIVE** — Automatische Erinnerung 24h vor Reservierung
- Confirmation SMS: **LIVE** — Sofort-Bestätigung bei Reservierung
- Help: **LIVE** — /ops/help (EN, support@flowsight.ch + Gunnar)
- PRs: #457-#467 (initial, 11 PRs), #479-#491 (Go-Live prep, 13 PRs), #493-#499 (Go-Live fixes, 7 PRs)

## Architektur-Besonderheiten
- **Polling statt Webhook:** Retell `webhook_url` feuert nicht zuverlässig für BigBen (nicht-Standard-Tenant). Lösung: Polling via sync-calls API (`/api/retell/sync-calls`) für Voice→Reservation Pipeline.
- **No-Show:** Nutzt bestehendes `status` Feld auf `pub_reservations` (no_show/yellow_card/red_card). Kein separates Tracking-System nötig.
- **Events statisch im Voice Prompt:** Voice Agent hat 20 Events als Text im Prompt. Muss vor Founder-Abreise manuell aktualisiert werden (kein dynamischer Fetch).
- **EN-first:** Alle Oberflächen in Englisch (Paul spricht kein Deutsch). OpsShell, Datumsformate, Fehlermeldungen auditiert.

## Key Challenges (gelöst)
- **Retell webhook_url Bug:** Agent hat `webhook_url` konfiguriert, aber Retell feuert den Webhook nicht für BigBen-Tenant. Root Cause: unklar (Retell-seitig). Workaround: Polling via sync-calls API. Stabil.
- **is_transfer_cf:** Muss bei Flow-Erstellung gesetzt werden (`is_transfer_cf: true`). Kann nicht nachträglich gepatcht werden. Dokumentiert in `voice_agent_lessons_learned.md`, hat uns trotzdem erwischt.
- **Pauls Painpoint No-Show:** Gäste reservieren und erscheinen nicht → Yellow/Red Card System implementiert. Hoher Kundenwert, niedriger Entwicklungsaufwand.

## Inputs (vom Kunden benötigt)
- [ ] 15–20 Fotos (Lokal innen, aussen, Essen, Bier, Events, Paul)
- [ ] Speisekarte (Foto oder Text)
- [ ] Getränkekarte (Foto oder Text)
- [ ] Logo (falls vorhanden, sonst Wordmark)
- [ ] Aktuelle Events bestätigen (Karaoke, Quiz, Live-Musik — Wochentage?)
- [ ] Öffnungszeiten final bestätigen

## Bereits bekannte Infos
- Öffnungszeiten: Mo geschlossen, Di–Do ab 16:00, Fr–Sa ab 16:00, So offen
- Events: Karaoke, Live-Musik, Quiz Night
- Reservierung: persönlich oder Telefon (kein Online-System → jetzt FlowSight)
- Kapazität: ~40 Personen + Aussenbereich
- USPs: Bestes Guinness der Region, Live Sport, familiär
- Sprache: Englisch (primary) + Deutsch

## Phone Numbers
- Voice Agent: +41 44 505 48 18 (EN primary, DE swap)
- Pub Telefon: 044 680 17 77

## Retell Agent IDs
- EN Agent: `agent_96a9aef429eee1e015795439dc` (Flow: `conversation_flow_9a3daeba7dec`)
- DE Agent: `agent_0e34197d7e1a8427a41193972e` (Flow: `conversation_flow_bf214fe29fc2`)
- Last synced: 2026-04-16

## Links
- Website: flowsight.ch/bigben-pub
- Dashboard: flowsight.ch/ops/pub-dashboard
- Events: flowsight.ch/ops/events
- Reservations: flowsight.ch/ops/reservations
- Briefing: [briefing.md](briefing.md)
- Onboarding-Plan: [onboarding_plan.md](onboarding_plan.md)
- Projekt-Briefing: [projekt_briefing.md](projekt_briefing.md)
- Feedback: [feedback/FB1-FB10.png](feedback/)

## Updates

### 2026-04-16 | CC | Go-Live Prep Complete (PRs #479-#491, 13 PRs)
- No-Show System LIVE (Yellow/Red Card, status field)
- Walk-in Quick-Add LIVE
- 24h SMS Reminder LIVE (automatische Erinnerung)
- Confirmation SMS LIVE (bei Reservierung)
- Voice DE swap LIVE (holprig, Retell is_transfer_cf Limitierung)
- Voice→Reservation Polling LIVE (sync-calls API, Webhook-Workaround)
- Website noch nicht 100% High-End (Founder-Feedback pending)
- Voice Events statisch im Prompt (manuell updaten vor Abreise)
- i18n Audit: OpsShell logout, Datumsformate, Fehlermeldungen auf EN

### 2026-04-14 | CC | Komplett-Onboarding (PRs #457-#467, 11 PRs, 1 Tag)
- Tenant erstellt + converted (Barter-Deal)
- pub_events + pub_reservations DB-Tabellen (Migration)
- 20 Events geseedet (7 Sport + 13 Events, 21 Tage)
- Event-Pflege LIVE (Sport/Events Tabs, Add/Edit/Delete)
- Reservierungs-System LIVE (Walk-in, Confirm/Decline, SMS)
- Pub Dashboard LIVE (EN, Today KPIs klickbar, Next 7 Days, Website-Link)
- Website dark theme (kennedys.ch-Basis, dynamic events 2-Spalten, compact 3+more)
- Voice Agent EN (Lisa, Adrian, coffee-shop ambient, +41445054818)
- Nav: Dashboard → Events → Reservations → Help (EN only)
- Help-Page EN (support@flowsight.ch + Gunnar-Kontakt)
- Staff "Paul" (admin), OTP: gunnar.wende@flowsight.ch
- Review-Error-Messages spezifisch (alle Tenants)

### 2026-03-05 | CC | Kundenordner angelegt
- Struktur erstellt, Briefing verschoben aus docs/briefings/

### 2026-04-17 | CC | SMS_ALLOWED_NUMBERS fix
- `SMS_ALLOWED_NUMBERS` env var removed from Vercel — was blocking all external numbers (only allowlisted numbers received SMS). SMS now works for everyone.

## ERLEDIGT (17.04.2026, PRs #493-#499)
- [x] Voice Extraction: Retell PCA-Felder (guest_name, party_size, time, date) statt Transcript-Parsing
- [x] Voice: Öffnungszeiten-Validierung (Lisa lehnt Zeiten ausserhalb ab)
- [x] Voice: DE Switch funktioniert (Ela übernimmt bei Deutsch)
- [x] Voice: Richtiger Tag/Datum im Prompt
- [x] Dashboard: 6 Cards (Reservations, Guest Watch, Events, Sports, Website, Bookings Analytics)
- [x] Guest Watch: Eigene Seite (/ops/guest-watch) — read-only Gelb/Rot-Liste
- [x] Bookings Analytics: Walk-in/Online/Phone Breakdown + Monatstrend
- [x] Time Picker: 15-Min-Intervalle (Select statt native Input)
- [x] Event/Description: max 30/40 Zeichen
- [x] Cancelled Reservations: verschwinden aus Übersicht (nur pending/confirmed/no_show sichtbar)
- [x] "guests this week" aus Header entfernt (irreführend bei Laufkundschaft)

## OFFEN
### Website (wartet auf Pauls Input — Fotos/Videos kommen)
- [ ] **Hero: GIF/belebendes Element** — Founder hat Datei, muss eingebaut werden
- [ ] **Galerie aufräumen** — luxuriöser gestalten, nicht nur 8 Bilder nebeneinander. Neue Fotos/Videos von Paul einbauen
- [ ] **Instagram zentral bei Galerie** — Paul pflegt Galerie nur über Instagram. @bigbenpubzh prominent bei/statt Galerie platzieren
- [ ] **Echte Fotos** von Paul ersetzen Platzhalter
- [ ] Sport/Event Cards Overflow auf Mobile (FB16/FB19) — Zeichenlänge begrenzt, aber Layout muss noch getestet werden

### Sonstige offene Punkte
- [ ] Voice Events statisch im Prompt (manuell updaten vor Abreise 30.04.)
- [ ] Pauls eigene E-Mail für OTP (aktuell auf gunnar.wende@flowsight.ch)
- [ ] Pauls finale Telefonnummer für Website + Voice Agent (aktuell Founder-Nr.)
- [ ] Voice → DB: Polling statt Webhook (funktioniert, aber nicht real-time — Retell Webhook-Bug ungelöst)
