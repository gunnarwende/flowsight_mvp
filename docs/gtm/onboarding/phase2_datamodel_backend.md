# Phase 2 — Cockpit · Datenmodell & Backend-Routing

> Die **letzte Design-Stufe** vor dem Code: wie die Dispositionen (`phase2_voice_dispositions.md`) und
> das Cockpit (`phase2_cockpit_structure.md`) technisch landen. Geerdet an der echten Architektur
> (`retell/webhook/route.ts`, `tenants.modules`, `pub_callback_requests`, `staff`, `cases.is_demo`).
> Teil der **Onboarding-Bible** Phase 2.

## 0 · Die zentrale Klarstellung — wo lebt die Config?
Zwei Ebenen, nicht verwechseln:
- **`tenant_config.json`** (File, pro Kunde) = **Pipeline- / Vorbefüll-Quelle** (für Demo-Produktion abgeleitet).
- **Runtime-SSoT (live)** = **DB** (`tenants.modules` JSONB + `staff`) **+ der Retell-Agent-Prompt**. Das Leitsystem liest von hier (via `resolveTenantIdentity`).

**Das Cockpit ist die Brücke:** liest `tenant_config` (Vorbefüllung) → Kunde bestätigt/ergänzt → **schreibt in die DB** (`modules`, `staff`) **+ in den Retell-Prompt** (via `generate_voice_agent` + `retell_sync`).

## 1 · Schema (existiert / erweitern / neu)
| Objekt | Status | Inhalt |
|---|:--:|---|
| `cases` | ✅ | + `is_demo` (✅, D10) für Cockpit-Test-Calls |
| `tenant_callbacks` | 🆕 generalisiert aus `pub_callback_requests` | `tenant_id`, `reason` (callback\|order_followup), `caller_name`, `caller_phone`, `topic`, `call_id` (Idempotenz), `status` (pending\|resolved\|dismissed), `created_at` |
| `tenants.modules.voice_dispositions` | 🆕 JSONB | pro Disposition: `korb` (fall\|nachricht\|nichts) + `notify` (none\|board\|push) |
| `tenants.modules.notification_email` / `google_review_url` | ✅ Felder da | Cockpit füllt die **echten** Werte |
| `tenants.modules.greeting_text` / `ki_disclosure` | 🆕 | gewählter Greeting-Wortlaut + Mindesthinweis |
| `staff` | ✅ | Cockpit schreibt **echte** Staff (nicht die Video-Dummys!) |
| Retell-Agent-Prompt | ✅ Template | Cockpit-Daten → 23 Platzhalter + Dispositions-Verhalten → **publish** |

## 2 · Webhook-Routing (Rewrite in `retell/webhook/route.ts`)
```
call_analyzed → 25s-Gate → call_type bestimmen:
   (a) aus analysis.call_type   ← Agent emittiert (bevorzugt)
   (b) Fallback ohne call_type: Intake-Daten vorhanden (Kategorie + Kontakt)? → FALL, sonst → NACHRICHT
→ Korb:
   🗂️ FALL      → cases.insert (wie heute) + Urgency-Norm + SMS (nur D1) + Push (Notfall/Reklamation)
   ✉️ NACHRICHT → tenant_callbacks.insert (reason) + Notify (KEIN SMS)
   —  NICHTS    → log + 204 (kein Insert)
```
**Sicherheits-Regel (G11):** Catch-all defaultet zu **NACHRICHT**, nie zu „droppen" — aber **Intake-Daten ziehen immer FALL** (kein verlorener Auftrag). Bei Unsicherheit: aufnehmen.
→ ersetzt den heutigen „jeder Call → Fall"-Pfad; der Content-Gate (≥2/5) wird vom `call_type` abgelöst.

## 3 · Dispositions-Config = Dual-Use
Die Policy wird an **zwei** Stellen gebraucht:
- **Agent-Prompt:** damit Lisa den richtigen `call_type` emittiert + sich verhält (Prompt-Sektion).
- **Webhook:** liest `modules.voice_dispositions` → entscheidet Notify/Suppress **pro Betrieb**.
Cockpit schreibt **beides** (DB + Prompt-Regeneration + publish).

## 4 · is_demo — der Test-Call-Loop
Cockpit „Lisa jetzt testen" → Retell-Web-Call im **Test-Kontext** → Webhook setzt `is_demo=true` auf den entstehenden Fall/Callback → **Leitsystem filtert aus KPIs + zeigt „Testfälle"** (G6: erster echter Fall bleibt der erste). Mechanik: der Test-Call trägt ein Demo-Flag in der Metadata, das der Webhook liest.

## 5 · Leitsystem — „Nachrichten"-Ansicht (neu)
Neuer Tab/Seite liest `tenant_callbacks` (Resolve/Dismiss-Aktionen) — **analog BigBens Callback-Seite**, nur tenant-agnostisch. Kleiner UI-Zusatz neben „Fälle".

## 6 · Go-live-Pfad (existiert)
Cockpit fertig → **Founder-Review** (prüft die 🆕-Zeilen) → `provision_trial`/`activate_prospect` (DB) + `retell_sync` (Agent publish) + **Nummer kaufen** → Weiterleitung (Kunden-Aktion) → **live (Stufe B)**.

## 7 · Bau-Reihenfolge (Backend-first) + ehrlicher Aufwand
1. **`tenant_callbacks`** + BigBen-Callback-Pfad **tenant-agnostisch generalisieren** *(Muster existiert)*
2. **Webhook `call_type`-Verzweigung** + Suppression + Fallback
3. **`modules.voice_dispositions`** + Webhook liest Notify/Suppress + **Reklamation-Push**
4. **Leitsystem „Nachrichten"-Ansicht**
5. **Cockpit-UI** — die 3 Stränge/Screens aus Manifest + Struktur *(der große, mehrtägige Posten)*
6. **Cockpit → DB/Retell-Write** + `is_demo`-Test-Call-Wiring

**Exists vs New:**
- ✅ **existiert:** `cases`, `pub_callback_requests` (Muster), `tenants.modules`, `staff`, `is_demo`, Webhook, `retell_sync`, `provision/activate`, BigBen-Callback-Branching.
- 🆕 **neu:** `tenant_callbacks` (generalisieren), `modules.voice_dispositions`, Webhook-`call_type`-Branching, Case-Suppression, Reklamation-Push, Leitsystem-„Nachrichten", **das Cockpit-UI selbst** (größter Posten), Cockpit-Read/Write, `is_demo`-Test-Wiring.

→ **Schritte 1–4 sind überschaubar** (BigBen liefert das Muster). **Schritt 5 (Cockpit-UI) ist der mehrtägige Hauptbau.**
