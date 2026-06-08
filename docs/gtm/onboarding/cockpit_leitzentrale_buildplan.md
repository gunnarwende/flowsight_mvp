# Cockpit R8 — Leitzentrale-Feedback (Founder-Sprachnachricht „Feedback Layer Leitzentrale", 08.06.)

> Kompressionssicher. Quelle: `Feedback Layer Leitzentrale.txt` (Founder, Walk-through Leitsystem-Strang + Freigabe, live auf flowsight.ch).
> Jede Task ist gegen den **Live-Code (main@3712d70)** verifiziert — Datei `src/web/app/aufbau/[token]/CockpitApp.tsx`.
> **WICHTIG (Architektur):** SystemNode IST live ein **Sternbild** (Sterne: Marke·Team·Kalender·Benachrichtigungen·Bewertungen), nicht lineare Sektionen. Founder nennt sie „Sterne".

## 🤖 AUTONOMIE-VERTRAG (gilt wie R7, falls Founder „selbstständig abarbeiten" sagt)
Geordnete Queue + Abnahme-Kriterium pro Punkt · SYSTEM/POLISH autonom, echte Gabelung vorlegen · Deploy+Doc-Sync pro Batch · EIN Branch (`feat/cockpit-r8-leitzentrale`) off main, EIN PR am Ende.

## 📋 R8-QUEUE (Vorschlag-Reihenfolge: Struktur → Inhalt → Politur)

### 🟥 STRUKTUR / VERHALTEN (die zwei grossen Brocken)
- [x] **L-17 — Pflichtfeld-Validierung an der WURZEL (Founder-Präferenz „Umsetzung 2", der wichtigste Punkt).**
  Heute: Sterne/Cards werden bedingungslos gold (`markStar` setzt `stepDone=true`), erst beim „An Gunnar senden" kommt serverseitig (`/api/aufbau/[token]/submit` → 422 `missing[]`) eine Mängelliste OHNE Sprung-Links. Founder: „katastrophal" — psychologisch hat man abgeschlossen, muss dann zurück Fehler suchen.
  **Soll:** Ein Stern/Strang wird **nur gold, wenn seine Pflichtfelder ausgefüllt sind**; sonst Stern bleibt offen + inline-Hinweis „hier fehlt noch X". Validierung an der Quelle, nicht am Ende.
  Sekundär (Option 1, nur falls am Ende noch was fehlt): Mängelliste-Items als **Sprung-Links** zum Feld/Strang.
  *Klärung beim Bau:* Pflichtfelder pro Strang müssen mit den Server-Regeln in `/api/aufbau/[token]/submit` übereinstimmen. **⚠️ RISIKO:** Server prüft evtl. noch `wizard_distribution` (R7 entfernt → `formRelevant`) → submit-Endpoint MUSS auf das R7-Wizard-Modell nachgezogen werden, sonst blockt es fälschlich. Zuerst Endpoint lesen.
  *Fertig wenn:* Stern wird ohne Pflichtfeld nicht gold + zeigt was fehlt; submit-Validierung deckt sich; tsc/build grün; prod-Sicht.
- [x] **L-13 — Goldener Card-Umriss auf der Hauptübersicht für „Ihr Leitsystem".**
  Die 3 Strang-Cards bekommen bei `done` schon den Gold-Rand (Overview ~Z.317). Die **Leitsystem-Hub-Card** (~Z.344-354) hat hardcoded weissen Rand — wird bei `progress.system` NICHT gold (nur Text „✓ bestätigt"). Founder vermisst genau diesen Gold-Umriss „dass ich fertig bin".
  *Fertig wenn:* Hub-Card bei `progress.system` goldener Rand + ✓-State, analog Strang-Cards.

### 🟧 HAUPTÜBERSICHT (Overview)
- [x] **L-14 — Statische „Ihre Fälle — sauber an einem Ort"-Card eliminieren + Send-Button höher.**
  Card (~Z.359-362) ist nicht klickbar, „inhaltlich leer". Founder: „können wir gerne eliminieren" → stattdessen den **„An Gunnar zum Freischalten senden"-Button höher legen, sodass der goldene ↓-Pfeil darauf zeigt**.
  *Fertig wenn:* Output-Card weg, Flow Hub → ↓ → Send-Button, Pfeil zeigt auf den Button.
- [x] **L-18 — PDF-Auszug auf der Hauptseite sichtbar.**
  PDF-Link existiert nur auf der Freigabe-/Geschafft-Seite (~Z.1130) + via /ops/settings. Founder vermisst „unten auf der Hauptseite mir selber einen PDF-Auszug ziehen". → sichtbarer Link `/aufbau/[token]/zusammenfassung` unten auf der Overview.

### 🟨 NAVIGATION
- [x] **L-1 — „Schöner Zurück-Button" überall (Strang-Ebene, nicht nur Stern-Drill-in).**
  Der Pill-Button „‹ Zurück zum Sternbild" (Drill-in, ~Z.1061) ist schön; die **Strang-Ebene** (Detail-Rahmen ~Z.382) nutzt nur schlichtes „← Übersicht". Founder will den schönen Pill-Button **auch hier** (Lisa-Übersicht, Leitsystem-Übersicht, Website, Vor Ort, Freigabe). → Detail-Back als Pill stylen („‹ Übersicht").

### 🟦 LEITSYSTEM-STERNE (SystemNode)
- [x] **L-2 — Leitsystem-Icon ◆ ersetzen → weisses Herz 🤍** (Founder-Entscheid 08.06.: „nimm das Herz, nicht das Gehirn"). Detail-Header `icon="◆"` (~Z.1080).
- [x] **L-3 — Stern „Marke": Notiz minimal.** Wie bei Lisa „So meldet sich" — statt langem Hinweis nur **„Hinweis (optional)" + leeres Feld**. (Drill-in-Notiz ~Z.1064-1067 ist aktuell generisch für alle System-Sterne.)
- [x] **L-4 — Stern „Team": Demo-Namen-Satz streichen.** „Die Demo-Namen aus dem Video werden nicht übernommen — tragen Sie Ihre echten Personen ein." (~Z.923) → **raus** (Demo spielt keine Rolle mehr).
- [x] **L-5 — Stern „Team": Rollen-Dropdown lesbar machen.** `<select>` (~Z.929) hat **weisse Schrift auf weissem Grund** (Optionen unleserlich). → select/option-Styling: dunkler Grund, helle Schrift (High-End, stark leserlich).
- [x] **L-6 — per-System-Stern strang-spezifische Notiz-Placeholder** (wie Lisa in R7). Heute EIN generischer Placeholder für alle System-Sterne (~Z.1066). Founder mehrfach: „Vorauswahl Strang für Strang dynamisch anpassen", „zwei typische Anwendungsfälle". Je Stern 2 konkrete Sani-Beispiele:
  - Kalender: z. B. „Wir nutzen keinen Kalender", „Nur der Chef-Kalender ist relevant".
  - Team / Benachrichtigungen / Bewertungen: je 2 knackige (Marke = minimal, s. L-3).
- [x] **L-8 — Stern „Benachrichtigungen": „(nicht aus dem Demo)" streichen.** Hint bei „Wohin neue Fälle?" (~Z.990) → „(nicht aus dem Demo)" raus. Demo irrelevant.
- [x] **L-9 — Toggle „Rückruf-Nachrichten per E-Mail" umformulieren + Wiring prüfen.** Label „Auch Rückruf-Nachrichten zusätzlich per E-Mail melden" (~Z.993) verwirrt („melden oder erhalten?"). Founder erkennt: das ist genau das R6-#2-Feature. → klar formulieren (Empfänger-Sicht, z. B. „Rückruf-Nachrichten zusätzlich **per E-Mail an mich**"). **⚠️ Wiring prüfen:** R6 #2 sendet die Callback-Mail bereits, wenn `tenantNotificationEmail` existiert — gated der Webhook wirklich auf `notifyMessagesByEmail`? Falls nein: Toggle verdrahten (sonst Schein-Schalter).
- [x] **L-11 — Stern „Bewertungen": Google Place-ID auffindbar machen.** Founder: weiss nicht, „wonach ich suchen muss und wo ich es finde". Für den Link gibt's eine „Wo finde ich …?"-Disclosure (~Z.1028), für die **Place-ID nicht**. → kurze „Wo finde ich die Place-ID?"-Hilfe mit konkreten Schritten (oder klarer: Feld leer lassen, Link/Firmenname oben genügt).

### 🟩 FREIGABE-SEITE
- [x] **L-16 — „Eingesetzte Dienstleister (Subprozessoren)" dezenter.** (~Z.1148-1151) aktuell als eigener hervorgehobener Block. Founder: keine Pflicht, „dezent untermischen". → kleiner/unauffälliger in den AVV-Text einbetten.
- [x] **L-15 — AVV-Vollständigkeit verifizieren** (Founder: „sieht soweit gut aus" — reiner Check, kein Umbau). Hinweis „was passiert nach Freischalten" = gelobt, so lassen.

## ✅ AUSDRÜCKLICH KEINE TASK (Founder hat sich's überlegt)
- Leitsystem-Sterne brauchen **kein** „Training/Liebe"-Framing wie Voice — statische Config, „sehr treffend so". NICHT hinzufügen.

## 📝 R8-PROTOKOLL
- 08.06. | Analyse fertig, gegen Live-Code verifiziert. Branch `feat/cockpit-r8-leitzentrale` off main@3712d70. Quelle `Feedback Layer Leitzentrale.txt`.
- 08.06. | Founder-Go „selbstständig abarbeiten + prüfen". Icon-Entscheid: 🤍 Herz.
- 08.06. | **ALLE 15 TASKS UMGESETZT** (autonom). tsc grün + Production-Build grün.
  - **L-17 (Kern):** ⚠️ Wurzelfund — Submit-Endpoint prüfte noch das R7-entfernte `wizard.distribution` → **Versand war komplett blockiert**. Fix: submit auf R7-Modell (`formRelevant`/`integrationLocation`/`agency`). + Client-Gold-Stern-Sperre: Sterne (Lisa: Begrüssung/Telefonie/Notfall · System: Team/Benachrichtigungen/Bewertungen) + Website-„✓ passt" werden NUR gold/fertig, wenn Pflichtfelder sitzen — sonst bleibt offen + Inline-Hinweis „fehlt noch X". MISSING_LABEL `wizard_distribution`→`wizard_integration`.
  - **L-9 (Kern):** ⚠️ Wurzelfund — Toggle war Schein-Schalter: Webhook sendete Callback-Mail immer (nur an `notification_email` gebunden), ignorierte `notify_messages_email`. Fix: Webhook gated jetzt wirklich auf den Toggle. + Label umformuliert (Empfänger-Sicht).
  - L-1 Detail-Back als Pill · L-2 ◆→🤍 · L-3 Marke-Notiz minimal · L-4 Demo-Namen-Satz raus · L-5 Rollen-Dropdown lesbar (colorScheme dark + Option-Styling) · L-6 per-System-Stern-Placeholder (`SYSTEM_STAR_NOTE_PLACEHOLDER`) · L-8 „(nicht aus dem Demo)" raus · L-11 Place-ID-„Wo finde ich das?"-Disclosure · L-13 goldener Umriss Leitsystem-Hub · L-14 statische „Fälle"-Card raus, Pfeil→Send-Button · L-16 Dienstleister dezent · L-18 PDF-Link auf Hauptseite.
  - **L-15:** AVV verifiziert — sauberer, strukturell vollständiger Entwurf (revDSG, US-Adäquanz als offen markiert, versionierte Zustimmung). Kein Code-Change; echter offener Punkt = Anwaltsprüfung (im Code + Compliance-Docs schon vermerkt).
  - **Bewusst KEINE Task:** kein „Training/Liebe"-Framing fürs (statische) Leitsystem.
