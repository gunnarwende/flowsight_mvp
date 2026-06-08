# Onboarding-Cockpit — Master-Anforderungs-Backlog (SSOT)

> **Zweck:** Damit aus dem intensiven Founder-Feedback (07.–08.06.) NICHTS untergeht.
> Jede Anforderung, pro Strang, mit verifiziertem Code-Stand, offenen Entscheidungen
> und Wellen-Zuordnung. Lebendes Doc — wir arbeiten es ab. Ergänzt
> `phase2_cockpit_redesign.md` (das „Wie") + `phase2_cockpit_manifest.md` (das „Was").

## Leitprinzip (4 Test-Fragen an JEDES Feld)
1. **Klar?** Versteht der Sani in 1 Satz, *was der Eintrag bewirkt* (nicht was er ist)?
2. **Entlasten sichtbar?** Zeigen wir proaktiv, *welchen Alltagsschmerz wir abnehmen*?
3. **Alles erfasst?** Sammeln wir *jede technische Info* pro Betrieb (Anbieter, Keys, Kontakte)?
4. **Lernt er?** Geht er raus und *weiss, was wo eingestellt ist*?

## Verifizierter Code-Stand (Fakten, 08.06.)
- **Nachrichten an Kunden = 1 SMS + 2 E-Mails** (NICHT 3 SMS):
  - SMS Empfangsbestätigung: `"[Absender]: Ihre Meldung wurde aufgenommen. Hier können Sie Angaben ergänzen oder Fotos anfügen: [Link]"` (`postCallSms.ts`).
  - E-Mail 24h-Termin-Reminder (`processTerminReminders` + `sendTerminReminderEmail`).
  - E-Mail Bewertungsanfrage (`sendReviewRequest`).
  - → **Offene Entscheidung F:** SMS-vs-E-Mail-Kanal so lassen (Budget) oder ändern?
- **Bewertungs-Schwelle:** `rating <= 3` → intern (Feedback-Textarea, kein Google); `>= 4` → Google-CTA (Redirect auf `google_review_url`). **Hartcodiert.** End-User: Link → Sterne → Verzweigung.
- **Kalender:** **nur Outlook implementiert** (Application Permissions/client_credentials; Free/Busy + Kollisionsprüfung). **Google = OAuth-App da (KAL2), aber kein Code → nicht nutzbar.** Outlook braucht pro Betrieb: M365/Exchange Online + Postfach je MA + MS-Tenant-ID + einmaliger Admin-Consent.

## Strang-für-Strang

### 📞 Telefon / Lisa
| # | Anforderung | Stand | Welle |
|---|---|---|---|
| T1 | **Telefonanbieter erfassen** (Swisscom/Sunrise/Salt/Quickline/…) + bestehende Nummer | **FEHLT** — Pflicht für Weiterleitung | 1 |
| T2 | **Notfall-Empfänger klar formuliert**: „Lisa stellt NICHT durch — nimmt auf + alarmiert [X] sofort per SMS/Push" + nur wenn Notdienst angeboten (Conditional) | teils (Toggle), Mechanik unklar | 1 |
| T3 | **Notdienst ja/nein** als Weiche (steuert T2 + Feiertags-Reaktion) | fehlt explizit | 1 |
| T4 | **Feiertags-/Geschlossen-Handling** (s. Querschnitt K) | fehlt | 1 |
| T5 | Greeting-Default = echter T2-Wortlaut | ✅ | — |
| T6 | „Das sagt Ihre Lisa" Akkordeon (Öffnungszeiten/Region/Leistungen/Notfall/Preis) | ✅ | — |
| T7 | 6 Dispositionen mit Info-Weg | ✅ (Wording schärfen je „Klar?") | 1 |
| T8 | 5 Pickup-Stufen | ✅ | — |
| T9 | Terminvergabe-Erwartung („Lisa nimmt auf, bucht nicht") als Hinweis | fehlt | 1 |
| T10 | Notfall-Definition (Rohrbruch=ja, tropfender Hahn=nein) | im Text, schärfen | 2 |
| T11 | Sprachen (DE+EN/FR/IT) bestätigbar | im Datenmodell, kein UI | **parkiert** (Founder: erstmal ohne) |

### 🌐 Website / Wizard
| # | Anforderung | Stand | Welle |
|---|---|---|---|
| W1 | **Agentur-Kontakt** (Name + E-Mail), wenn „liegt bei Agentur" | **FEHLT** — sonst Sackgasse | 1 |
| W2 | Kategorien editierbar (3 frei/3 fix) | ✅ | — |
| W3 | Verteilung nach Website-ja/nein (GBP/Embed/Agentur/QR) | ✅, je Option 1 Satz erklären | 1 |
| W4 | **Foto-Upload sichtbar machen** (Kundenwert) | fehlt | 1 |

### ◆ Leitsystem-Knoten (Querschnitt-Settings)
| # | Anforderung | Stand | Welle |
|---|---|---|---|
| L1 | Marke/Logo/Fall-Kürzel | ✅ | — |
| L2 | **Team & Rollen größen-adaptiv** (1-MA: ausblenden; 30-MA: Pikett/Dispatch) | nicht adaptiv | 1 |
| L3 | **Benachrichtigungen VORAUSGEFÜLLT** (SMS-Bestätigung + 24h-Reminder-Mail + Bewertungs-Mail im Wortlaut), Edit ≤160 Zeichen mit Zähler/Hinweis | **FEHLT vorausgefüllt** | 1 |
| L4 | notification_email (echte Ops-Mail) | ✅ | — |

### ⭐ Bewertungen
| # | Anforderung | Stand | Welle |
|---|---|---|---|
| R1 | Google-Link + „wo finde ich den?"-Helfer | ✅ Helfer-Text | 1 |
| R2 | **Place-ID / Google-Profilname** zusätzlich (für Auto-Crawl) | fehlt | 1 |
| R3 | **Schwelle wählbar** (≤2/≤3/≤4 intern, oder alle) statt hartcodiert ≤3 | hartcodiert | 1 |
| R4 | **End-User-Flow als Lern-/Aha-Schritt** zeigen (so landet's intern vs. Google) | fehlt | 1 |
| R5 | SMS-Inhalt editierbar ≤160 + Zähler | ✅ (Default fehlt, s. L3) | 1 |

### 📅 Kalender (sehr sensibel — KEIN „weglassen")
| # | Anforderung | Stand | Welle |
|---|---|---|---|
| K1 | **Kalender-Anbindung für Free/Busy** (nicht Techniker überplanen) | Outlook implementiert; Google fehlt | 1 |
| K2 | Provider erfassen (Outlook/Google/anderer/keiner) + Helfer je Provider | fehlt | 1 |
| K3 | **Outlook-Onboarding sauber**: MS-Tenant-ID + Exchange-Postfächer je MA + Admin-Consent (geführt, ggf. founder-assistiert) | Runbook da, nicht im Cockpit | 1 |
| K4 | **Google-Kalender im Code bauen** (OAuth-Flow) — sonst nur Outlook-Betriebe | **Code fehlt** | 1/2 (Entscheidung E) |
| K5 | Staff-E-Mails (für per-MA Free/Busy) | via Team (L2) | 1 |
| K6 | **Admin erfassen** (Name + welche M365-E-Mail = „Ihr Admin, der bestätigt") + **klar machen, wie er sich bei Microsoft anmeldet** — „ruht alles aufeinander auf" | **FEHLT** (Cascade verweist auf „Ihr Admin", ohne ihn zu erfassen) | 1 |

### 🚪 Vor-Ort · 🚀 Freigabe & Recht
| # | Anforderung | Stand | Welle |
|---|---|---|---|
| V1 | Manuelle Erfassung (Bestätigung) | ✅ | — |
| G1 | Admin-Login-E-Mail | ✅ | — |
| G2 | AVV-Mechanik (Doc + Version/Zeitstempel) | ✅, Inhalt = Anwalt | — |
| G3 | Telefon-Weiterleitung (provider-spezifisch aus T1) als Next-Step | teils | 1 |
| G4 | **PWA/Handy-Nutzung** („App aufs Handy", Techniker auf Baustelle) | fehlt | 2 |
| G5 | **Demo-Fälle weg / erster echter Fall** (G6-Erklärung) | fehlt | 2 |

## Querschnitt
- **K · Feiertags-/Geschlossen-Logik (inkl. Voice-Scripting!):** Standard an CH-Feiertagen/ausserhalb Öffnungszeiten → Lisa sagt „geschlossen", **nimmt den Fall TROTZDEM auf**, setzt Erwartung („nächster Werktag" / bei Notdienst „Pikett alarmiert"). **Ehrliche Lücke:** Live-Voice-Agent kennt Datum/CH-Feiertage heute NICHT (nur Demo-`demo_time`). → Bau am Voice-Prompt nötig. **Welle 1.**
- **„Zeigen, dass wir entlasten":** optionale „Kennen Sie das?"-Karten je Strang (Baustelle/Zettel/Lieferant/verpasster Notruf/Bewertungen/Wartung). **Welle 2.**

## Meta (übergeordnet)
- **M1 · Lernen/spielerisch:** Fähigkeits-Freischalten zelebrieren, Beweis-Loops (Lernen durch Erleben), je Strang 1-Satz-„So funktioniert's", End-User-Flows zeigen (R4). Welle 1/2.
- **M2 · „Meine Einstellungen" dauerhaft** (Cockpit nach Go-live wieder aufrufbar im Leitsystem). Welle 2.
- **M3 · PDF-Export „Ihr FlowSight-Setup"** (Beleg + Eigentum + Nachweis). **Founder-bestätigt sinnvoll.** Welle 2.

## ═══ VERTIEFUNG 08.06. — die zwei tragenden Säulen ═══

> Diese zwei Prinzipien sind ab jetzt das Rückgrat über ALLEM. Jeder Strang wird daran gebaut.

### Säule 1 · VERANTWORTUNGS-TRANSFER (entlastet UNS, schützt UNS)
Der Betrieb **konfiguriert + bestätigt aktiv jedes Live-Verhalten** → er *besitzt* es und *weiss*, was scharf ist.
Folge: Wenn ein Kunde vor verschlossener Tür steht oder „keinen Reminder bekommen" hat, liegt die
Verantwortung beim Betrieb (er hat's eingestellt + gelernt), **nicht bei uns**. Konsequenz für den Bau:
**Jedes automatische Verhalten muss im Onboarding sichtbar + aktiv eigen-bestätigt werden — nichts läuft
still im Hintergrund, das der Betrieb nicht gesehen + verantwortet hat.**

### Säule 2 · DYNAMISCHER LERN-CASCADE (Lehrbuch + Nachschlagewerk)
Jede nicht-triviale Wahl kaskadiert: **Frage → Konsequenz erklären (Aha) → Verzweigung → exakt sagen,
WAS wir brauchen + WO er es findet.** Beispiel Kalender: „Anbinden? (was bringt's/was folgt)" → „Welcher
Anbieter?" → Outlook → „Das brauchen wir von Ihnen, hier finden Sie es: …". Das Onboarding ist ein
**Lehrbuch** (Aha beim ersten Mal) UND ein **Nachschlagewerk** (Wochen später: „wie war das nochmal?").
Plus: **spielerisch + Spass + High-End-Optik.**

## Entscheidungen (08.06. gefällt)
- **E (Kalender):** **Drei Pfade dynamisch** — M365/Outlook · Google · kein Business-Kalender. Markt-Read:
  ~80–90 % M365, ~20 % Google, ~2–5 % keiner. → **Google im Code bauen** (nicht nur Outlook). Aufbau
  streng als Lern-Cascade (s. Säule 2). **Dörflers Tool noch offen** (Mail noch nicht raus) → Bau provider-agnostisch.
  **08.06. präzisiert:** **Welle 1 = M365/Outlook voll**; **Google-Kalender-Code = Welle 2** (Founder: „Google in Vorbereitung passt, das machen wir mit Welle 2"). Im Cockpit Google ehrlich als „in Vorbereitung" zeigen.
- **F (Kanäle):** **Der Betrieb entscheidet selbst** je Nachricht (24h-Reminder + Bewertungsanfrage: SMS oder
  E-Mail) — bewusst NICHT von uns vorgesetzt (Säule 1: er trägt die Verantwortung, dass es ankommt).
- **R3 (Bewertungs-Schwelle):** Default ≤3 intern **bleibt**, aber **Wirkung klar erklären** (wann/wo was auf
  Google landet) + optional einstellbar. Lehrbuch-Moment.
- **Scope:** Welle 1 = Spalte „1" + die neuen Funde unten.

## NEUE FUNDE (Verantwortungs-Lens: stille Live-Verhalten, die der Betrieb OWNEN muss)
| # | Stilles Verhalten heute | Im Onboarding sichtbar machen + bestätigen | Welle |
|---|---|---|---|
| N1 | Lisa-**No-Gos** (nie Preis/Termin/Diagnose/Garantie zusagen) | „Lisa verspricht nie X" — Vertrauen + er besitzt die Grenze | 1 |
| N2 | Lisa: **max 7 Fragen, KEINE Aufnahme** | als Trust-/Erwartungs-Punkt zeigen | 1 |
| N3 | Bewertungsanfrage = **manuell** ausgelöst (Betrieb klickt) + **max 2 / 7-Tage-Cooldown** | erklären, dass + wann sie feuert (er löst aus) | 1 |
| N4 | **Google-Rating-Auto-Crawl** (wöchentlich Mo) | „Ihr Rating aktualisiert sich automatisch" + braucht Place-ID (R2) | 1 |
| N5 | **Wochen-Rapport-E-Mail** an Inhaber (Mo) | Empfänger bestätigen + Wert zeigen | 2 |
| N6 | **Push-Benachrichtigungen** je Ereignis (Notfall/Zuweisung/Bewertung) | wer bekommt was — bestätigen | 1 |
| N7 | **Fall-Status-Lebenszyklus** (Neu→Geplant→In Arbeit→Erledigt) | zeigen, damit er den Ablauf kennt | 2 |
| N8 | **Datenhaltung** (keine Aufnahme, Datenminimierung, revDSG) | Trust-Block (auch fürs Recht) | 1/2 |
| N9 | **SMS-/E-Mail-Versand passiert automatisch** bei jedem Fall | Wortlaut + Kanal eigen-bestätigen (= L3 + F) | 1 |

## ═══ RUNDE 4 (08.06.) — nach Kalender-Cascade-Screenshot ═══

> Founder: Cascade-**Pattern** „für mich ganz okay" — aber 4 strukturelle/inhaltliche Nachschärfungen,
> bevor es 1:1 ausgerollt wird. Vollständiger Wortlaut: `cockpit_founder_feedback_protokoll.md` (Runde 4).

| # | Befund (Founder-Wortlaut sinngemäss) | Konsequenz für den Bau | Welle |
|---|---|---|---|
| Q1 | **„Wo ist generell das Thema E-MAIL?"** — E-Mail taucht nur verstreut auf (notification_email vergraben), kein klarer E-Mail-Block. | E-Mail als **eigenes, sichtbares Thema** im Leitsystem-Strang führen: welche Geschäfts-Mail empfängt Fälle, welche Mails gehen automatisch raus (Reminder/Bewertung = L3/F), Admin-Mail (G1). Logisch gruppiert, nicht verstreut. | 1 |
| Q2 | **Roter Faden / logischer Strang-Aufbau** — „nicht einfach wild irgendwelche Cards hinlegen"; „für mich kein roter Faden eindeutig erkennbar". | Jeder Strang bekommt **eine erkennbare Dramaturgie** (Intro „was dieser Strang bewirkt" → Schritte in logischer Reihenfolge → Abschluss/„erledigt"). Karten nicht lose stapeln. **Gilt für ALLE Stränge.** | 1 |
| Q3 | **Kalender-Admin pflegen** — „Ihr Admin bestätigt. **Wer ist Ihr Admin?** Welche E-Mail? Wie melde ich mich bei Microsoft an? Das ruht doch alles aufeinander auf." | = **K6**: Admin (Name + M365-Mail) **erfassen** + Microsoft-Anmeldung erklären. Die Cascade darf nicht auf „Ihr Admin" verweisen, ohne ihn zu erheben. | 1 |
| Q4 | **Hinweise ein-/ausklappbar** — der „so einfach"-Hinweis (und Hinweise generell) **collapsible**, „sonst viel zu viel Text". | **Globale UI-Regel:** lange Erklär-/Helfer-Hinweise default **eingeklappt** (Disclosure „mehr erfahren ▸"), Textdichte runter. Teil der Optik-Politur. | 1 |

**Status Strang 1 (Kalender):** Pattern abgenommen „ganz okay" → **nachschärfen** (Q3 Admin + Q4 collapsible) + Optik (Katastrophe-Punkte = Optik-Top-4) **bevor** Ausrollen. Founder: „korrigiere es nochmal, schau nochmal selber drauf."

## Verbleibend offen (klein)
- Dörflers Kalender-Anbieter (sobald Mail-Feedback da) — Bau läuft provider-agnostisch weiter.
- Finaler Welle-1-Cut nach diesem Deepening (s. Synthese im Chat).
