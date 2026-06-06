# Phase 2 — Cockpit · Struktur & Erlebnis (Screen-Flow)

> Wie aus dem **Manifest** (das „Was", `phase2_cockpit_manifest.md`) das **Erlebnis** wird (das „Wie").
> Der premium, klick-getriebene Co-Pilot. Teil der **Onboarding-Bible** Phase 2.
> Navy + Gold. Prinzip: „Sie bauen Ihr System, wir führen Sie."

## Leitprinzipien
1. **Confirm-not-create** — 70 % ist vorbefüllt; er bestätigt/feilt, erschafft selten.
2. **Output-Frame, nicht Dauer** — „Sie trainieren Ihre Lisa", nie „Schritt 2: 20 Min".
3. **Fortschritt = gewonnene Fähigkeit** — „Lisa kann jetzt: Notfälle erkennen ✓ · Termine aufnehmen ✓" statt „7/20 Fragen".
4. **Pro-Strang-Beweis-Loop** — konfigurieren → sofort testen → sehen, dass es geht.

## Die Karte (dein Bild, formalisiert)

```
        ┌── 📞 TELEFON (Voice/Lisa) ──┐   ┌── 🌐 WEBSITE (Wizard) ──┐   ┌── 🚪 VOR-ORT (manuell) ──┐
        │   der große Strang          │   │  Quick-light            │   │  1 Bestätigung           │
        └──────────────┬──────────────┘   └────────────┬───────────┘   └────────────┬─────────────┘
                       └──────────────┬─────────────────┴────────────────────────────┘
                                      ▼
                        ╔═══════════════════════════════╗
                        ║   IHR LEITSYSTEM (Mitte)      ║   ← Brand/Look + Team + alle Fälle
                        ╚═══════════════╤═══════════════╝
                                        ▼
                        ┌───────────────────────────────┐
                        │  NEXT-STEPS (raus)            │   ← was SIE noch tun: Weiterleitung,
                        │  dynamisch aus Ihrer Config   │      Wizard platzieren, AVV
                        └───────────────────────────────┘
```
Oben ein Fortschritts-Band aus **Fähigkeits-Häkchen** (nicht Fragenzähler).

## Der Pfad durchs Cockpit (Reihenfolge — klein anfangen, groß enden)

**0 · Eröffnung** (aus der Mail kommend): „Schön, dass Sie da sind. 80 % ist vorbereitet — ergänzen Sie die 20 %, die nur Sie kennen. Ca. eine Stunde, jederzeit speicherbar."

**1 · QUICK-WIN — Ihr Leitsystem-Look** *(risikolos, sofort sichtbar, lehrt die Mechanik)*
Brand-Farbe ✅ bestätigen · Logo · `case_id_prefix` ✅ · **echte Staff** 🆕 (Name/Rolle/E-Mail). → er sieht sofort „sein" Leitsystem in seinen Farben. Erstes Häkchen.

**2 · VOICE — Ihre Lisa** *(der große Strang)*
a) Identität + **Greeting/KI-Hinweis** wählen · b) **„Das sagt Ihre Lisa"** — der große Bestätigungs-Screen (Öffnungszeiten, Region, Leistungen, Preis-Deflekt … alles ✅, er liest/korrigiert) · c) die **7 Dispositions-Karten** (Szenario → er wählt die Policy) · d) Pickup/Notfall.
→ **Beweis-Loop: „Lisa jetzt anrufen"** (Retell-Web-Call, Testfall `is_demo`) — er hört SEINE Lisa seinen Fall behandeln. Der Aha.

**3 · WEBSITE — Ihr Meldeformular** *(leicht)*
Kategorien ✅ bestätigen · Branding ✅ · **Verteilung wählen** 📞 (GBP-Button / Link / Embed / Agentur-Mail). → **Beweis: das gebrandete Formular ansehen.**

**4 · VOR-ORT** — eine Bestätigung („manuelle Erfassung aktiv"). Fertig.

**5 · BENACHRICHTIGUNG & BEWERTUNG** — `notification_email` 🆕 · `google_review_url` 🆕 · `sms_sender_name` ✅. → **Beweis: Test-Bewertungs-Seite ansehen.**

**6 · FINALE — „Schauen Sie, was Sie gebaut haben"** *(der Knall)*
Die drei Stränge fügen sich sichtbar zum **lebenden System** (Zusammenspiel-Animation: Anruf → SMS → Fall → Bewertung). Stolz-Moment, Eigentum. **CTA: „An Gunnar zum Freischalten senden"** → Phase 3.

## Die Next-Steps-Karte (was unten rauskommt)
Dynamisch aus seinen Antworten generiert, klar getrennt von der Config:
- **Telefon-Weiterleitung** (provider-spezifisch, je nach Pickup-Wahl) — die eine Go-live-Aktion.
- **Wizard platzieren** (sein gewählter Verteilungsweg / fertige Agentur-Mail).
- **AVV akzeptieren.**

## Handoff → Phase 3 (Review & Go-live)
„Senden" → **Founder-Review** (prüft gezielt die 🆕-Zeilen des Manifests — dort könnte ein Fehler durchrutschen) → **Zahlung** (Aktivierung + 1. Monat) → Weiterleitung scharf → **Stufe B: echte Anrufe**. (Stufe A — Testen — lief schon im Beweis-Loop.)

## Technisch, in einem Satz (Detail = #4 Datenmodell)
Cockpit **lädt `tenant_config`** (Vorbefüllung) → schreibt die Bestätigungen + die 🆕-Felder + die Dispositionen zurück → Test-Calls als `is_demo` → Founder-Review → `provision/activate`. Die Disposition-Trennung braucht das neue Routing-Fundament (`tenant_callbacks`).
