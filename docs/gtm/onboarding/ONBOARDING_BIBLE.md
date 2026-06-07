# Onboarding-Bible (Cockpit-Ära)

> **Master-Doc.** Was passiert ab dem **ersten menschlichen Kontakt** eines interessierten
> Prospects, bis er als **zahlender Kunde** autonom mit seinem System läuft.
> Direkter Anschluss an `docs/gtm/pipeline/PIPELINE_BIBLE.md` (die endet beim Versand).
>
> **Version 2.0 — 2026-06-06, komplett neu aufgesetzt.** Das alte (founder-geführte, Vor-Ort-
> Termin-)Paradigma liegt als Historie in `docs/archive/onboarding/Onboarding_bible_v0.md`.
>
> **Status:** Gerüst. Phase 1 ist voll ausgearbeitet (Live-Playbook). Phase 2–4 sind als
> Architektur gesetzt; der Cockpit-Bau (Phase 2) ist Folge-Arbeit (mehrere Tage).

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
→ **Live-Werkzeug: [`phase1_gespraech_playbook.md`](phase1_gespraech_playbook.md)** — das öffnest du
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
- **Pro-Strang-Beweis-Loop:** konfigurieren → sofort testen (Retell-Web-Call, Testfälle `is_demo`) →
  Aha. **Finale:** „Schauen Sie, was Sie gebaut haben" (der Knall).

### Phase 3 — Review & Go-live (Pay) *(Folge-Bau, migriert v0-Operatives)*
- **Founder-Review** des Cockpit-Ergebnisses (G11 — keine halb-konfigurierte Lisa geht live).
- **Zahlung** (Aktivierung + 1. Monat) am Go-live-Gate. **Nummer erst jetzt kaufen.**
- **Zwei Stufen live:** A = sofort testbar (bereitgestellte Nr.) · B = echte Anrufe erst nach
  Weiterleitung (die eine Kunden-Aktion). v0-Schritte (Swisscom/Sunrise/Salt, PWA-Install) hierher.
- **AVV/DPA** wird hier akzeptiert (§7).

### Phase 4 — Validierung
Tag 1–7 passiv beobachten + Tag-7-Call. **Der Wochen-Rapport ist die Churn-Versicherung** — er
beweist Monat für Monat den Wert (X Anrufe gefangen, Y Termine, Z Bewertungen).

---

## §4 · Pricing (der Frame zuerst, dann die Struktur)

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

## §8 · Bau-Status (06.06.) + was Folge-Bau bleibt

**Autonom gebaut (06.06.) als gestapelte, rein additive, live-sichere PRs** — dormant bis ein
Voice-Agent `call_type` emittiert; nichts geht live bis Merge + `supabase db push`:
- **OC1 → PR #572:** `tenant_callbacks` (Migration + `tenantCallbacks.ts`-Lib).
- **OC2 → PR #573:** Webhook `call_type`-Verzweigung (FALL/NACHRICHT/NICHTS, backward-compatible).
- **OC3 → PR #574:** Reklamation-Push (eventType `negative_review`) + `voiceDispositions.ts`-Policy.
- **OC4 → PR #575:** Leitsystem-„Nachrichten"-View `/ops/nachrichten` + generische API.
- **OC5 → PR #576:** Cockpit-**Gerüst** `/aufbau/[token]` (Navy/Gold-Schale, strukturell).
- **Merge-Reihenfolge:** #571 (Design) → #572 → #573 → #574 → #575 → #576.

**Folge-Bau — braucht Founder (NICHT autonom gemacht):**
- **Cockpit-Daten-Layer + interaktive Flows (OC6):** Token-Lookup/`cockpit_sessions`,
  `tenant_config`-Vorbefüllung (confirm-not-create), Frage-für-Frage-Flows + Beweis-Loops,
  Schreiben in DB (`modules` inkl. `voice_dispositions`, `staff`) + Retell-Prompt, „An Gunnar
  senden"→Review-Gate. (= ersetzt die alte `prospect_to_onboarding`-Idee.)
- **Retell-Prompt:** Lisa `call_type` emittieren lassen + publish → erst dann werden OC2/OC3 aktiv;
  dann E2E-Test je Disposition. · **Nav-Eintrag** `/ops/nachrichten`.
- **Phase 3 Go-live-Ops:** v0-Operatives migrieren (Weiterleitung, PWA, Painpoint-Antworten, Cheat).
- **Onboarding-Mail-Versand (OC7):** `send_onboarding.mjs`. · **Pricing/AVV-Mechanik** (Go-live-Gate).

---

## §9 · Anker & Links

- **Phase-1-Live-Playbook:** [`phase1_gespraech_playbook.md`](phase1_gespraech_playbook.md) ← das „HOW"
- **Pipeline-Bible (was davor passiert):** `docs/gtm/pipeline/PIPELINE_BIBLE.md`
- **Discovery/Mom-Test-Quelle:** `docs/sales/discovery_questions.md` · **CTA-Strategie:** `docs/gtm/CTA.md`
- **Reife-/Feedback-Loop:** `operating_model.md` · **Lessons:** `lessons_learned.md`
- **Archiv (v0):** `docs/archive/onboarding/Onboarding_bible_v0.md`
- **Memory:** `project_onboarding_cockpit_design`
