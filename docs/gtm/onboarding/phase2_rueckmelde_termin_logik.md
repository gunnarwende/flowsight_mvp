# Rückmelde-Versprechen & Wunschtermin — Cockpit/Onboarding-Spec

> Schließt die „Wann wird mein Anliegen behoben?"-Lücke (Friend-Review 17.06.): Der Anrufer braucht die
> Gewissheit, **schnell + verlässlich mit einem Termin zurückgerufen** zu werden — sonst ruft er den
> nächsten Betrieb an (Cash-Lücke). Lisa sagt **nie einen fixen Termin zu** (No-Go bleibt) und **bucht nicht**;
> sie **setzt die Erwartung** + **nimmt Wunschzeiten auf**. Per-Tenant — der Betrieb besitzt das Versprechen.
> Teil der Onboarding-Bible (Phase 2, Voice-Dispositionen).

## Prinzip
- **Tenant-konfigurierbar, Default sicher.** Greift nur, wo der Betrieb es will + die Werte liefert (am Go-live eingestellt). Muss nicht bei jedem Betrieb gleich greifen.
- **Lisa bleibt intake-only:** kein fixer Termin, keine Diagnose, keine Buchung (G11 / No-Go „keine Termine zusagen" bleibt Default-Leitplanke, per Tenant bewusst lockerbar).
- **Dringlichkeit gaten:** echter Notfall (Rohrbruch, Wasser läuft) → Telefon/Notdienst-Routing (Wizard N1–N7 + emergency_policy), **nicht** Wunschzeiten. Wunschtermin nur bei **geplanten** Fällen.
- **Verantwortung beim Betrieb:** er wählt die Stufe + liefert die Werte. Produkt-Qualität (Lisa über-verspricht nicht) bleibt unsere Pflicht → höhere Stufen nur unverbindlich.

## Stufen-Leiter (per Tenant)
| Stufe | Was | Bau |
|---|---|---|
| **0** | Standard sicher: „Das Team meldet sich." | da |
| **1** | **Rückmelde-Versprechen** — Lisa setzt die Erwartung (Wortlaut unten). | sofort (Cockpit-Feld + Prompt) |
| **2** | **Wunschtermin-Erfassung** — Lisa fragt 1–2 Wunschzeiten → ins Ticket. Kein Kalender. | sofort (Cockpit-Toggle + Prompt) |
| **3** | Unverbindliches **Free/Busy-Fenster** — Lisa liest Techniker-Kalender, schlägt *vorläufig* vor (Betrieb bestätigt). | später (Kalender↔Voice-Bau + Default-Dauer/Puffer) |
| **4** | **Echte Buchung** — Assistentin bucht aktiv + SMS. | selten; separate Machbarkeits-Prüfung (kann die Telefonassistentin aktiv buchen + SMS senden?), Founder-Entscheidung |

**Sweet Spot = Stufe 1 + 2** (verlässlicher Rückruf + erfasste Wunschzeiten). Deckt die meisten Betriebe komplett ab → macht 3/4 für die meisten überflüssig.

## Lisa-Wortlaut — Default (founder-gewählt)
> „Einen fixen Termin kann ich am Telefon nicht zusagen — aber sagen Sie mir, wann es Ihnen am besten passt, dann gebe ich das auch direkt dem Techniker mit. Er meldet sich so rasch er kann und bestätigt Ihnen einen Termin."

Warm, immer ehrlich, narrensicher (kein absoluter Zeit-Anker, der bricht). Gepaart mit der Wunschtermin-Erfassung fängt es den Anrufer emotional + liefert dem Betrieb einen warmen Rückruf (Wunschzeiten schon im Ticket).

## Cockpit-Feld „Rückmelde-Versprechen"
- **Text-Feld**, Default = der Satz oben, durch den Betrieb editierbar.
- **Hinweisfeld (Vorschläge + Empfehlung):**
  - *Wer zuverlässig noch am selben Werktag zurückruft, sagt es konkret — das bindet den Anrufer stärker:* „…meldet sich **noch heute**" (vor Rückruf-Schluss) bzw. „**gleich am nächsten Werktag-Vormittag**" (nach Schluss/Wochenende). Lisa formuliert das **relativ aus Uhrzeit + Öffnungszeiten** (kein neuer Code) — nie absolut „bis 17 Uhr", nie „24h".
  - Optionales Feld **„Rückruf-Schluss"** (z.B. 16:00) macht die konkrete Variante kantenfest (löst das 16:45-Problem).
  - *Wer das nicht zuverlässig halten kann:* bei „so rasch er kann" bleiben.
  - **Ehrliche Abwägung im Hinweis:** „so rasch er kann" = warm + immer wahr, aber unkonkret; die konkrete Variante konvertiert besser (Gewissheit) — nur versprechen, was gehalten wird.
- **Toggle „Wunschtermin fragen"** (Stufe 2) an/aus.
- (später, Stufe 3) Kalender-Anbindung + Default-Dauer/Puffer pro Auftragsart.

## SMS/Mail-Bestätigung
Übernimmt dasselbe Versprechen, damit es nicht nur am Telefon hängt:
> „Wir haben Ihre Anfrage aufgenommen. Ein Mitarbeiter meldet sich [Versprechen] und bestätigt Ihnen einen Termin."

## Status
- **Stufe 1 + 2: ready to build** — Cockpit-Feld + Lisa-Prompt-Training + SMS-Zeile, **kein neuer Code** (Lisa kennt Datum/Uhrzeit + Öffnungszeiten schon).
- **Stufe 3:** Kalender↔Voice-Webhook + Dauer-/Puffer-Logik (mittelfristig, wenn erste Kunden laufen).
- **Stufe 4:** Founder-Entscheidung + Machbarkeits-Prüfung (aktive Buchung + SMS durch die Assistentin).
