# Onboarding-Bible (Cockpit-Ära)

> **Abschnitt der Customer Journey: Aufbau → Go-live → Begleitung (Sterne 6–8)** (Sales → Pipeline → **Onboarding**). Greift ab der Bau-/Kauf-Zusage.
> Orchestrator: [`../CUSTOMER_JOURNEY_BIBLE.md`](../CUSTOMER_JOURNEY_BIBLE.md) · davor: [`../sales/SALES_BIBLE.md`](../sales/SALES_BIBLE.md) (Akquise + Gespräch) · Asset-Produktion [`../pipeline/PIPELINE_BIBLE.md`](../pipeline/PIPELINE_BIBLE.md).

> **Master-Doc.** Was passiert ab dem **ersten menschlichen Kontakt** eines interessierten
> Prospects, bis er als **zahlender Kunde** autonom mit seinem System läuft.
> Direkter Anschluss an `docs/gtm/pipeline/PIPELINE_BIBLE.md` (die endet beim Versand).
>
> **Version 2.1 — 2026-06-08.** v2.0 (06.06.) neu aufgesetzt; das alte (founder-geführte, Vor-Ort-
> Termin-)Paradigma liegt als Historie in `docs/archive/onboarding/Onboarding_bible_v0.md`.
>
> **Status (08.06.):** **Phase 2 — Cockpit ist GEBAUT & LIVE** auf `flowsight.ch/aufbau/[token]`,
> durchklickbar, in **drei Feedback-Runden gehärtet** (R6 Name/Korb-Wiring · R7 Website-Umbau +
> Badge-SSOT · R8 Leitzentrale + Validierung-an-der-Wurzel). Phase 1 voll ausgearbeitet (Live-
> Playbook). Phase 3/4 als Architektur gesetzt, Go-live-Ops + Voice-`call_type` = Folge-Bau.
> Detail-Stand + 3 Feedback-Runden: §8. **Vor erstem Go-live offen:** Voice VA1-3 (`ticketlist.md`).

---

## §0 · Warum v2 (und was von v0 bleibt)

| | v0 (BigBen-Ära) | v2 (Cockpit-Ära) |
|---|---|---|
| Wer richtet ein | Founder, vor Ort, 60-Min-Termin | **Kunde selbst, geführt im Cockpit** (Co-Pilot) |
| Founder-Rolle | macht alles | **Gate + Eskalation** (qualifiziert, reviewt, schaltet frei) |
| Trial | 14 Tage gratis | **kein Trial — zahlend ab Go-live, monatlich kündbar** |
| Start des Onboardings | beim „Ja, ich kaufe" | **beim ersten menschlichen Kontakt** |

**Bleibt aus v0 (nicht verlieren):** die **G-Regeln G1–G12** (§5), das **Reife-Modell** (§6), und
die **operativen Gold-Stücke** (Telefon-Weiterleitung Schritt-für-Schritt, PWA-Install, Painpoint-
Antworten, 60-Sekunden-Cheat) — die migrieren in **Phase 3 (Go-live)**, sobald die dran ist.

---

## §1 · Leitidee

Onboarding als **Co-Creation**, nicht als Setup-Aufgabe (Self-Checkout-/IKEA-Effekt): der Betrieb
**baut sein System in ~1 Stunde selbst** und besitzt es dadurch emotional. Premium-Erlebnis,
Navy + Gold. Founder-Zeit minimal.

**Dreifach-Ausbeute aus einer Stunde Kundenarbeit:**
1. Sein konfiguriertes System (sein Output),
2. unsere **strukturierten Replikationsdaten** (für Skalierung),
3. das **Eigentumsgefühl = die Konversion** + der Beweis, dass die Entscheidung richtig war.

**Positionierung:** „**Sie bauen Ihr System, wir führen Sie.**" (Eigentum schlägt „für Sie gemacht"
bei diesem kontroll-liebenden ICP — und rechtfertigt den Premium-Preis.)

**Frame, der alles trägt:** *Ich habe 80 % vorbereitet — Sie ergänzen die 20 %, die nur Sie kennen.*

---

## §2 · Der Seam — wo die Pipeline endet, wo das Onboarding beginnt

```
PIPELINE (automatisiert, ohne Founder)            ONBOARDING (hochtouch, Founder im Loop)
Crawl → tenant_config → 4 Takes → Proof-Seite      Phase 1 Gespräch → Phase 2 Cockpit
→ Versand → Reminder → Tag-6-7-Anruf-Trigger        → Phase 3 Review & Go-live → Phase 4 Validierung
        └────────── Naht: der Moment, in dem ein MENSCH redet ──────────┘
```

- **Pipeline-Job erledigt**, wenn ein **gewärmter, engagierter Prospect** existiert (hat den Proof
  geschaut) **und** der Tag-6-7-Trigger feuert. Preis ist in der Pipeline **nie** Thema (`CTA.md`).
- **Through-Line = `tenant_config.json`:** die Pipeline leitet es aus dem Crawl ab → baut den Proof
  daraus → **das Cockpit lädt es als vorbefüllten Default** → der Kunde bestätigt/verfeinert
  (*confirm, not create*) → es wird die Live-Config. **Ein Artefakt, Ende zu Ende.**

---

## §3 · Die vier Phasen (mit Definition of Done)

| Phase | Name | Wer treibt | Definition of Done |
|---|---|---|---|
| **1** | **Das Gespräch (Kontaktaufnahme)** | Founder | Klares **Ja** (→ Phase 2), sauberes **Nein** (→ Referral-Tür) oder **Geparkt** (terminierter Re-Touch). Preis besprochen (nach Fit). |
| **2** | **Cockpit (Bau)** | Kunde (geführt) | Betrieb hat sein System in den 3 Strängen gebaut/bestätigt, im Test erlebt. Integrations-Manifest 100 % befüllt. |
| **3** | **Review & Go-live (Pay)** | Founder → Kunde | Founder-Review grün (G11), **Zahlung** (Aktivierung + 1. Monat), Weiterleitung eingerichtet, echte Anrufe fließen. |
| **4** | **Validierung** | passiv + Tag-7-Call | ≥1 echter Anruf gelandet, kein Sentry-Fehler, Wochen-Rapport beweist Wert, Kunde sagt „läuft". |

### Phase 1 — Das Gespräch
Die menschliche Dialog-/Entscheidungs-Phase. Hier fällt Ja/Nein. **Owner: Founder.**
→ **Live-Werkzeug: [`phase1_gespraech_playbook.md`](../sales/phase1_gespraech_playbook.md)** — das öffnest du
vor/während jedem Kontakt und liest ab. (Das ist das „HOW".)

### Phase 2 — Cockpit (Bau) *(Folge-Bau)*
Geführtes Self-Service-Cockpit, klick-getrieben, premium. **Karte:** 3 Stränge rein → Leitsystem →
Next-Steps raus. **Pfad:** Quick-Win (Brand-Farbe) → **Voice** (größter/sensibelster Strang) →
**Website/Wizard** (zuletzt, externe Abhängigkeit).
- **3 Outputs:** (1) was er **antwortet** (Config, 100 % vollständig = Anti-Ping-Pong), (2) was er
  **tut** (Next-Steps-Karte, dynamisch aus seiner Config — z.B. Weiterleitung Sunrise), (3) was nur
  **wir tun** (Backend, unsichtbar).
- **Voice = 7 Dispositionen** statt 1000 Fälle (neuer Auftrag · Info · Rückruf · Nachfrage best.
  Auftrag · Reklamation · privat/Spam · [Live-Transfer = später]). Heute: keine serverseitige
  Klassifikation → Routing-Fundament (`pub_callback_requests` → generisch `tenant_callbacks`) ist
  einmaliger Bau. Pickup-Sekunden = Telco-Weiterleitung (Kunden-Aktion, nicht Lisa-Config).
- **Pro-Strang-Beweis-Loop:** konfigurieren → bestätigen → Stern leuchtet gold (Eigentums-Moment).
  **Validierung an der Wurzel (R8):** ein Stern/Strang wird *nur* gold, wenn seine Pflichtfelder sitzen —
  sonst bleibt er offen mit Inline-Hinweis. Keine Mängelliste-Überraschung erst beim Senden.
  **Finale:** „Schauen Sie, was Sie gebaut haben" (der Knall).
- **Test-Call-Status:** der In-Cockpit-Retell-Web-Call ist aktuell **entfernt** (zu hohe Erwartung, bis
  Voice VA1-3 sitzen). Testfälle laufen weiter über `is_demo` (G6: fallen beim Go-live raus).
- **Mehrsprachigkeit = Schablone, kein Extra-Bau:** Lisa ist der Zwei-Agent-Gold-Standard —
  **DE-only** (Ela-Stimme, spricht nie eine Fremdsprache) ↔ **multilingual INTL** (Juniper, EN/FR/IT),
  verbunden über `swap_to_intl_agent`/`swap_to_de_agent`. Wird am Go-live mit den 23 Platzhaltern via
  `retell_sync.mjs` für jeden Betrieb **identisch** provisioniert (Dörfler = Referenz). Spec NICHT hier
  duplizieren → SSOT: `docs/runbooks/voice_multilingual_acceptance.md` + `docs/redesign/voice.md`.

### Phase 3 — Review & Go-live (Pay) *(Folge-Bau, migriert v0-Operatives)*
- **Founder-Review** des Cockpit-Ergebnisses (G11 — keine halb-konfigurierte Lisa geht live).
- **Sprach-Switch-Akzeptanz (Go-live-Gate):** ein Testanruf DE→EN→FR→IT→DE — jeder Wechsel sauber,
  Ela bleibt deutsch, INTL übernimmt die Fremdsprachen, Rückweg auf Deutsch greift. Checkliste:
  `docs/runbooks/voice_multilingual_acceptance.md` (Dörfler validiert 09.06.).
- **Zahlung** (Aktivierung + 1. Monat) am Go-live-Gate. **Nummer erst jetzt kaufen.**
- **Zwei Stufen live:** A = sofort testbar (bereitgestellte Nr.) · B = echte Anrufe erst nach
  Weiterleitung (die eine Kunden-Aktion). v0-Schritte (Swisscom/Sunrise/Salt, PWA-Install) hierher.
- **AVV/DPA** wird hier akzeptiert (§7).

### Phase 4 — Validierung
Tag 1–7 passiv beobachten + Tag-7-Call. **Der Wochen-Rapport ist die Churn-Versicherung** — er
beweist Monat für Monat den Wert (X Anrufe gefangen, Y Termine, Z Bewertungen).

---

## §4 · Pricing (der Frame zuerst, dann die Struktur)

> **Kanonische Preis-Zahlen: [`../sales/SALES_BIBLE.md`](../sales/SALES_BIBLE.md) §5** (zweistufig: Solo CHF 900 / Premium CHF 2'000). Hier nur der Frame.

**Du verkaufst keine Software — du installierst ein Leitsystem + betreibst eine Telefonzentrale, die
nie krank ist.** Anker = **eine Teilzeit-Empfangskraft (3–5k/Mo)** oder **ein verpasster
Badsanierungs-Auftrag (15–30k)** — **nicht** andere Apps. Sprache raus: *Abo/Plan/Tier/Lizenz*; rein:
*Aktivierung / Leitsystem / Betrieb*.

- **Struktur:** einmalige **Aktivierung** (~1 Monatsbetrag, Richtwert CHF 1'500–2'500) + **Premium-
  Monatsbetrieb** (Richtwert CHF 1'900–2'400). **Monatlich kündbar = die Risiko-Umkehr** (kein Trial nötig).
- **Timing:** gezahlt wird **am Go-live-Gate** (Phase 3) — nachdem er gebaut, getestet und du
  freigegeben hast. „Build-love-then-pay."
- **Disziplin:** 0 Kunden → Premium ist Hypothese. Selbstbewusster Anker, **nie rabattieren**
  (Scarcity 10/Monat schützt den Preis), erste 3–5 Abschlüsse = Preis-Findung.
- Detail-Choreografie des Preis-Moments → im Phase-1-Playbook §5.

---

## §5 · Die G-Regeln (aus v0 übernommen, cockpit-gerahmt)

Nicht-verhandelbar. Geschichte dahinter: `lessons_learned.md`. **Fett = wird zur gesperrten
Cockpit-Leitplanke** (der Kunde kann sie nicht wegkonfigurieren).

| # | Regel | Cockpit-Ära |
|---|---|---|
| G1 | Pre-Flight vor Go-live | wird Founder-Review-Gate (Phase 3) |
| **G2** | **Kunde sieht NIE einen anderen Kunden** | Cockpit + Leitsystem strikt tenant-isoliert |
| G3 | Sprache des Kunden | Cockpit + Voice in Kundensprache |
| G4 | Voice-Datum dynamisch + verifiziert | bleibt Cron-Gate |
| G5 | SMS nur bei echter Bestätigung | bleibt |
| **G6** | **App/Leitsystem leer übergeben** | Testfälle `is_demo` → fallen raus; erster echter Fall = erster Fall |
| G7 | GH-Secrets vor Cron verifizieren | bleibt Provisioning-Check |
| G8 | Per-Tenant-Entry-URL routet richtig | bleibt |
| G9 | Cross-Plattform-Pfade | bleibt |
| G10 | Lessons Learned nach jedem Kunden | bleibt (Per-Customer-Ritual §6) |
| **G11** | **Voice macht NUR 100%-bestätigte Versprechen** | = die Compliance-Sandbox: das Cockpit lässt den Betrieb nur *innerhalb* der No-Gos konfigurieren |
| **G12** | **Single Source of Truth pro Datenfeld** | das Cockpit IST die SoT-Erfassung (confirm-not-create aus `tenant_config`) |

---

## §6 · Reife-Modell (wie Learnings „erwachsen werden")

`Doc → Checklist → Skript → Gate → **Cockpit**`. Die neue Top-Stufe: ein Learning ist so
operationalisiert, dass **der Kunde es selbst ausführt** (Cockpit). Nicht jedes Learning muss bis
oben; Schmerz × Wahrscheinlichkeit entscheidet.

- **Phase 1 (Gespräch) lebt bewusst auf Doc/Checklist-Reife** — sie darf nie Skript/Gate sein, weil
  sie „echter Mensch schlägt glatte Maschine" IST. Vorbereitet, nicht skriptet.
- Per-Customer-Ritual nach Phase 4: Lessons-Eintrag + Pattern-Diff (siehe `operating_model.md`).

---

## §7 · Compliance-Leitplanken (revDSG, nicht primär DSGVO)

Schweizer Recht = **revDSG/nDSG** (seit 1.9.2023); DSGVO nur bei EU-Bezug. *Kein Rechtsrat — vor
Produktiv-Roll-out Schweizer Datenschutz-Anwalt.*
- **(A) Datenschutz:** Datenminimierung + **Recording OFF** ✓; Transparenz/**KI-Hinweis** (Cockpit-
  Element, Betrieb wählt Wortlaut, wir geben den Mindesthinweis daneben); **keine fremde PII**;
  US-Subprozessoren (Retell/OpenAI/Twilio) = offener Adäquanz-Punkt → `docs/compliance/`.
- **(B) Haftung/Repräsentation:** keine Preise/Garantien/Diagnose/Termin-Zusagen (= die No-Gos).
- **Beides = gesperrte Cockpit-Leitplanken** → Verkaufsargument: „Sie können Lisa gar nicht in einen
  Verstoß konfigurieren." **AVV/DPA** = Commitment-Artefakt (Phase 3).

---

## §8 · Bau-Status (08.06.) — Cockpit LIVE, in 3 Runden gehärtet

**Fundament (06.06., OC1-OC5, gemergt + `supabase db push`):** `tenant_callbacks` (#572) ·
Webhook `call_type`-Verzweigung FALL/NACHRICHT/NICHTS (#573) · Reklamation-Push + Dispositions-
Policy (#574) · `/ops/nachrichten`-View (#575) · Cockpit-Gerüst (#576).

**OC6 = Cockpit-Daten-Layer + interaktive Flows — GEBAUT & LIVE.** `cockpit_sessions` (token-privat,
RLS service-only, prefill+draft+status), `tenant_config`-Vorbefüllung (*confirm-not-create*, ≈70 %),
Autosave, alle 3 Stränge interaktiv, „An Gunnar senden" → Review-Gate (`/api/aufbau/[token]/submit`),
`promote_cockpit_session.mjs` schreibt bestätigte Werte in DB (`modules` inkl. `voice_dispositions`,
`staff`) + `tenant_config` für Retell-Regeneration. Plus M2 „Meine Einstellungen" (über `/ops/settings`)
+ M3 PDF-Auszug (`/aufbau/[token]/zusammenfassung` + Hauptseite).

**Form (Founder-Design):** 3 Eingangs-Stränge → Leitsystem-Hub → Freigabe. **Lisa** + **Leitsystem**
= 5-Sterne-**Konstellationen** (Stern antippen → ausfüllen → „✓ passt" → leuchtet gold; Lisa-Avatar
mit progressivem Gesicht 1★→5★). **Website** = nummerierter Strang mit hartem Punkt-1-Gate. Headline
„Bauen wir gemeinsam Ihre rechte Hand am Telefon".

**Drei Feedback-Runden (Founder-Sprachnachrichten, je verbatim gesichert):**
- **R6** (#590): Name-Personalisierung (`assistantName` durch Cockpit + Agent-Prompt `{{assistant_name}}`);
  **Korb-Wiring** (Webhook liest `modules.voice_dispositions` voll → Fall/Nachricht/nichts); Nachrichten-
  E-Mail (`sendCallbackNotification`); „So soll Lisa reagieren" aufgeräumt (Kanal-Klarheit, nie SMS).
- **R7** (#591): **Website-Strang neu** — Punkt-1-Gate „Spielt das Online-Formular eine Rolle?", alte
  „Haben Sie Website?"-Frage raus, Integrations-Karte (Betreuung/ersetzen-ergänzen/wer-kümmert/Agentur);
  **Badge-SSOT** (App-Icon + Nav-Zähler = offene Fälle + pending Nachrichten via `opsBadge.ts` +
  `/api/ops/badge-count`); per-Stern konkrete Beispiel-Placeholder.
- **R8** (#593): **Validierung an der Wurzel** — Sterne/Strang werden nur gold, wenn Pflichtfelder
  sitzen, sonst Inline-Hinweis (statt Mängelliste erst beim Senden). 2 Wurzel-Bugs gefixt (Submit prüfte
  R7-entferntes `wizard.distribution` → Versand war blockiert; E-Mail-Toggle war Schein-Schalter →
  echt verdrahtet auf `modules.notify_messages_email`). Politur: 🤍-Icon, Pill-Back-Buttons, goldener
  Leitsystem-Umriss, statische „Fälle"-Card raus, PDF auf Hauptseite, Rollen-Dropdown lesbar, Place-ID-
  Hilfe, Demo-Texte raus, Dienstleister dezent. AVV verifiziert (Entwurf; Anwalt offen).
- Tracker (kompressionssicher): `cockpit_round6_buildplan.md` (R6/R7) + `cockpit_leitzentrale_buildplan.md`
  (R8) + `cockpit_founder_feedback_protokoll.md`.

**Folge-Bau — bleibt offen (braucht Founder / echtes Gerät):**
- **🔴 Voice VA1-3 (vor erstem Go-live, `ticketlist.md`):** Lisa legt nicht auf · Sprachwechsel feuert
  nicht · Web-Audio holprig. Der Cockpit-Test-Call wurde bewusst entfernt (zu hohe Erwartung); kommt
  ggf. nach VA1-3 zurück, dann MIT sichtbarem Auflegen-Button.
- **Retell-Prompt:** Lisa `call_type` zuverlässig emittieren lassen + publish → erst dann werden
  Korb-Routing (R6) + Reklamation-Push *real* aktiv (heute dormant); dann E2E-Test je Disposition.
- **Badge-Reste:** stiller Push (iOS-Limit), per-Eintrag-„neu"-Marker, **Handy-Test** am echten Gerät.
- **Phase 3 Go-live-Ops:** v0-Operatives migrieren (Weiterleitung, PWA, Painpoint-Antworten, Cheat).
- **Onboarding-Mail-Versand (OC7):** `send_onboarding.mjs` (Ziel-Link = Cockpit). · Pricing/AVV-Anwalt.

---

## §9 · Anker & Links

- **🧭 Customer Journey (kanonisch, ganze Strecke):** [`FlowSight_Customer_Journey_SSOT.md`](FlowSight_Customer_Journey_SSOT.md) — vom Outreach bis 30 Tage nach Go-live (Beweis-Seite → Discovery warm/kalt → Cockpit → Founder-Review → Premium-Preis → 2-stufiges Go-live). **Übergreifend; die Onboarding-Bible ist der Cockpit-Teil davon.**
- **📇 Gesprächskarte (Live-Call, 3 S.):** [`FlowSight_Customer_Journey_Short.md`](FlowSight_Customer_Journey_Short.md) — auf einen Blick „wo bin ich / welche Frage jetzt", inkl. wörtlicher Discovery-Fragen.
- **Phase-1-Live-Playbook:** [`phase1_gespraech_playbook.md`](../sales/phase1_gespraech_playbook.md) ← das „HOW" für Phase 1 (Read-Along; geht in der Journey-Gesprächskarte auf).
- **Rückmelde-Versprechen & Wunschtermin (Voice-Erwartung):** [`phase2_rueckmelde_termin_logik.md`](phase2_rueckmelde_termin_logik.md) — schließt die „Wann?"-Lücke; Stufen 0–4, per-Tenant, Lisa setzt Erwartung + nimmt Wunschzeiten auf (kein fixer Termin).
- **Pipeline-Bible (was davor passiert):** `docs/gtm/pipeline/PIPELINE_BIBLE.md`
- **Discovery/Mom-Test-Quelle:** `docs/sales/discovery_questions.md` · **CTA-Strategie:** `docs/gtm/CTA.md`
- **Reife-/Feedback-Loop:** `operating_model.md` · **Lessons:** `lessons_learned.md`
- **Archiv (v0):** `docs/archive/onboarding/Onboarding_bible_v0.md`
- **Memory:** `project_onboarding_cockpit_design`
