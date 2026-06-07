# Phase 2 — Voice-Strang · Die 7 Dispositionen (was Lisa mit jedem Anruf tut)

> Der sensible Kern des Voice-Strangs. **Jeder eingehende Anruf → genau eine Disposition → einer von
> 3 Körben.** Das Cockpit konfiguriert die **Policy** je Disposition (der Inhaber reagiert auf eine
> Szenario-Karte); **Lisa erkennt die Disposition live** (kein IVR). Defaults = CC-empfohlen
> (Founder: „nimm deine Empfehlungen"), pro Betrieb bestätigbar.
> Teil der **Onboarding-Bible** Phase 2 · baut auf `phase2_cockpit_manifest.md` · Code-Realität aus
> `src/web/app/api/retell/webhook/route.ts`.

## 3 Meta-Regeln (über allen Dispositionen)
1. **Lisa schließt, sie fragt nicht ab** — sie erkennt den Typ aus dem Gespräch (wie heute Intake/Info), **kein „Drücken Sie die 1"** (das wäre billig, un-premium).
2. **G11 — nie erfinden, immer aufnehmen.** Weiß Lisa etwas nicht 100 % (Auftragsstatus, offene Stelle, Preis) → **erfindet sie NICHTS**, sondern nimmt auf + verspricht menschlichen Rückruf. D2/D3/D4 sind alle Instanzen davon.
3. **Catch-all = Nachricht aufnehmen.** Unklar welcher Typ? → niemals droppen, niemals erfinden → Nachricht + Rückruf. Damit sind die 7 **erschöpfend**.

## Die 3 Körbe (das Sortier-Prinzip)
| Korb | Wann | Wohin |
|---|---|---|
| **🗂️ FALL** | es gibt *Arbeit* (Auftrag, Reklamation) | Leitsystem → Fall |
| **✉️ NACHRICHT** | jemand will *Rückruf*, keine Arbeit | „Rückrufe/Nachrichten"-Liste |
| **— NICHTS** | *erledigt oder irrelevant* (Info beantwortet, privat/Spam) | keine Spur |

---

## Die 7 Dispositionen

### D1 · Neuer Auftrag → 🗂️ FALL
- **Default:** Lisa macht Intake (max 7 Fragen), legt **Fall** an, Urgency normalisiert (Notfall/dringend/normal). Notfall → **sofort-Alarm** an Inhaber. Anrufer bekommt **SMS** mit Korrekturlink.
- **Heute:** ✅ funktioniert (Kern des Webhooks).
- **Cockpit-Karte:** Kategorien ✅ bestätigen · „Bei Notfall sofort eine Meldung an: [Inhaber]".

### D2 · Info-Anfrage → — NICHTS *(latenter Lead → 🗂️ FALL)*
- **Default:** Reine Info (Öffnungszeiten, Adresse, Region) → Lisa **beantwortet**, **kein Fall** (Leitsystem hält Arbeit, nicht Smalltalk). **ABER:** riecht es nach Lead (Preis für ein Projekt, „macht ihr Badsanierung?") → Lisa bietet an, Kontakt aufzunehmen → **wird Fall** (Angebot/Kontakt). *(Der `price_deflect` macht genau das schon.)*
- **Heute:** ⚠️ jeder Call wird Fall → Info-Anrufe erzeugen Müll-Fälle. **Änderung:** Webhook unterdrückt Fall, wenn Intent=Info **und** kein Kontakt aufgenommen.
- **Cockpit-Karte:** „Reine Infos: kein Fall, Lisa beantwortet. Fragt jemand nach Offerte/Beratung: Lisa nimmt Kontakt auf → Fall. [bestätigen / anpassen]"

### D3 · Rückruf-Wunsch / Lieferant / „den Chef sprechen" → ✉️ NACHRICHT
- **Default:** Lisa: „Die Geschäftsleitung ist im Einsatz — ich nehme gern eine Rückruf-Nachricht auf." → Name/Nummer/Grund → **Nachricht mit Rückruf-Flag**, **kein Auftrag**. Benachrichtigung an Inhaber. **Kein SMS** (Rückruf erfolgt eh).
- **Warum:** Lieferant/„Chef sprechen" ist kein Kundenjob — als Fall würde er die Auftrags-Pipeline + KPIs verschmutzen.
- **Heute:** ⚠️ wird Fall. **Änderung:** `call_type=callback` → `tenant_callbacks` (generalisiert aus BigBens `pub_callback_requests`).
- **Cockpit-Karte:** „Rückruf-Wünsche → Ihre Nachrichten-Liste mit Flag, nicht als Auftrag. Melden an: [Inhaber]. [bestätigen]"

### D4 · Nachfrage zu bestehendem Auftrag → ✉️ NACHRICHT *(Flag: Rückfrage)*
- **Default:** „Wo bleibt mein Techniker?" → Lisa **ehrlich: „Darauf hab ich keinen direkten Zugriff — ich nehme Ihre Nachricht auf, [Inhaber/Büro] meldet sich."** → Nachricht „Rückfrage zu Auftrag", **kein neuer Fall** (kein Phantom-Duplikat). Benachrichtigung an Inhaber.
- **Warum:** G11 (Lisa erfindet keinen Status) + keine Daten Dritter preisgeben + kein Doppel-Fall.
- **Heute:** ⚠️ wird Fall. **Änderung:** wie D3 (`tenant_callbacks`, reason=order_followup).
- **Cockpit-Karte:** „Nachfrage zu laufendem Auftrag: Lisa sagt ehrlich 'kein Zugriff', nimmt auf → Notiz 'Rückfrage', Sie melden sich. [bestätigen]"

### D5 · Reklamation / Beschwerde → 🗂️ FALL *(Prio hoch + Sofort-Alarm)*
- **Default:** Lisa **empathisch, würdigt, verspricht NICHTS** (keine Schuld, keine Garantie — No-Gos) → **Fall mit hoher Dringlichkeit** + **sofortige Meldung an den Inhaber (Push)**.
- **Warum:** Reklamation IST Arbeit (muss behoben werden) UND reputationskritisch → tracken (Fall) + sofort eskalieren (wie der „Negativ-Review immer Alert", KR-6).
- **Heute:** ✅ Fall + Urgency hoch (Prompt). **Änderung (klein):** Reklamation→Push-Regel an Inhaber.
- **Cockpit-Karte:** „Beschwerde: Lisa bleibt freundlich, verspricht nichts, nimmt auf → Fall, hohe Prio, sofort eine Meldung an Sie. [bestätigen]"

### D6 · Privat / Familie / Spam / falsch verbunden → — NICHTS
- **Default:** Lisa verabschiedet **freundlich, kurz, kein Intake** → **kein Fall, keine Spur**.
- **Wächter (lessons_learned I1):** „kein Fall" nur, wenn **klar nicht-geschäftlich UND keine Intake-Daten** gesammelt — Lisa darf NIE ein laufendes Anliegen (Rohrbruch-Intake) abwürgen.
- **Heute:** ⚠️ kurzer Call kann Mini-Fall erzeugen. **Änderung:** out_of_scope/privat → Case-Suppression.
- **Cockpit-Karte:** „Private Anrufe, Werbung, falsch verbunden: freundlich tschüss, kein Fall. [bestätigen]"

### D7 · Live-Transfer an einen Menschen → *MVP raus*
- **Default:** **Nicht im ersten Cockpit.** Existiert nicht (Flow-Bau + `is_transfer_cf`-Rebuild-Risiko), und wenn Lisa eh erst nach X Sek. rangeht (= Inhaber konnte nicht), ist Zurückstellen an einen Nicht-Verfügbaren zirkulär. **Interim = D3** (Rückruf aufnehmen).
- **Cockpit:** ausgeblendet (oder „kommt später").

---

## Querschnitt 1 — Alarmierungs-Schwelle (wer wird *sofort* gestört)
**Default:** **Notfall (D1) + Reklamation (D5) → sofort Push an Inhaber.** Alles andere liegt ruhig im Leitsystem / der Nachrichten-Liste — kein Stören.
**Cockpit:** „Sofort melden bei: [Notfall ✓] [Reklamation ✓] [jeder neue Auftrag ☐] [Rückrufe ☐]".

## Querschnitt 2 — Leitsystem-Konsequenz
Neben „Fälle" bekommt das Leitsystem eine **„Rückrufe/Nachrichten"-Ansicht** (D3/D4) — wie BigBens Callback-Liste, generalisiert. Kleiner, einmaliger Leitsystem-Zusatz.

## Querschnitt 3 — SMS-Politik je Disposition
Nur **D1 (Auftrag)** → SMS mit Korrekturlink an den Anrufer. **Nachrichten/Reklamation → kein SMS** (Budget-Schutz KR-7; der Rückruf erfolgt ohnehin persönlich).

---

## Was das Backend dafür braucht (→ #4 Datenmodell)
1. **Agent emittiert `call_type`** (auftrag · info · callback · order_followup · reklamation · private) — Prompt-Arbeit am Voice-Agent.
2. **Webhook verzweigt VOR dem Case-Insert:** 🗂️ → `cases` · ✉️ → `tenant_callbacks` (generalisiert, mit `reason`) · — → unterdrücken.
3. **Reklamation → Push-Regel** an Inhaber; **Info/Privat → Case-Suppression**.
→ **BigBen ist die Blaupause** (`pub_callback_requests` + sync-calls-Branching). Einmaliger Bau, danach reine Config pro Betrieb.

## ✅ Founder-Sanity-Check (meine Defaults — kipp, was nicht passt)
| Disp. | Default |
|---|---|
| D1 Auftrag | Fall + SMS; Notfall → Sofort-Push |
| D2 Info | kein Fall; latenter Lead → Fall |
| D3 Rückruf/Lieferant | Nachricht + Flag, kein Auftrag |
| D4 Nachfrage Auftrag | Nachricht „Rückfrage", kein neuer Fall |
| D5 Reklamation | Fall, hohe Prio, Sofort-Push |
| D6 Privat/Spam | kein Fall, keine Spur |
| D7 Live-Transfer | später (interim = Rückruf) |
| Sofort-Alarm | nur Notfall + Reklamation |
