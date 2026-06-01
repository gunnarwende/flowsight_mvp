# Stresstest-Status — 01.06. (für dich, nach dem Fussball)

## Abnahme-Stand deines Reviews
| Betrieb | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| **Stark** | ✅ | ✅ | ✅ | ✅ | → **final, alle 4 in `stark-haustechnik/`** |
| Walter | ✅ | ❌ Akku+KPI | ✅ | ❌ Sterne |
| Weinberger | ✅ | ✅ | ✅ | ❌ Sterne |

## Was ich gefunden + an der Wurzel gefixt habe

### A) Akku 71 statt 86 (Walter T2) — GEFIXT (code)
**Wurzel:** `record_phone_call_visual.mjs` sendete URL-Param `batt=86`, aber `take2_samsung.html` liest den Param **`battery`** (Default 71). → Heute neu generierte Phone-Extendeds (Walter/Weinberger) = 71; Stark (Apr-30, via produce_screenflow das `battery=86` korrekt sendet) = 86.
**Fix:** Param-Name korrigiert (`batt`→`battery`). Jeder künftige Build = 86. **Bestehende Walter/Weinberger-T2 brauchen einen Rebuild des Call-Teils**, um 86 zu zeigen.

### B) KPI-Belegung-Timing (Walter T2 @4:36–4:38 ≠ Dörfler)
**Wurzel:** Die KPI-Klick-Sektion (NEU→BEI UNS→ERLEDIGT→BEWERTUNG) in `record_leitsystem_take2.mjs` ist **nicht an feste Master-Zeiten geankert** — feste Dwells ab variablem Tour-Start → akkumulierte Drift. Kanonisch: NEU@4:37,2. Walter driftet ~1s früh → deine Narration passt nicht.
**Fix-Plan:** KPI-Sektion an Master-Zeit ankern (holdUntilMaster bis 4:37,2 vor NEU-Klick), analog zum T4-Reveal@11.0. Dann deterministisch für alle Betriebe.

### C) T4-Sternen-Animation (Walter+Weinberger @1:13.5, Maus 0.1–0.2s spät)
**Wurzel:** Die Review-Stern-Sektion (Part 6 in `record_take4.mjs`) ist **nicht geankert** (akt1 ist es). Der Stern-Fill driftet pro Build relativ zum universellen Maus-Layer (Dörfler-getimt) → Maus hinkt nach. Stark (früherer Build) lag zufällig richtig.
**Fix-Plan:** Stern-Fill an Master-Zeit ankern → Maus + Sterne deterministisch synchron für alle.

## Quality Gates (deine Lessons Learned → Pipeline)
Diese 4 Checks gehören als automatische Gates in den Build (PIPELINE_BIBLE §66, jetzt dokumentiert), damit du nicht mehr manuell prüfen musst:
1. **Akku = 86** im T2-Call (Pixel-Check Status-Bar).
2. **KPI-Timing**: NEU@4:37,2 ±0,2s (Event-Log/Frame-Check).
3. **Voice-Greeting** = korrekter Firmenname (✅ bereits gelöst, PR #533).
4. **T4-Stern/Maus-Sync** @1:13.5 (Maus-Position vs Stern-Fill ±0,1s).

## Warum ich B+C nicht überstürzt rebuilde
B+C brauchen Anker-Code + Re-Recording + Zehntelsekunden-Verifikation. Ein blinder Rebuild würde Walters Recording neu würfeln (B evtl. nicht gelöst) UND könnte **Weinbergers approved KPI zerstören**. Das verletzt dein „absolut korrekt". → Ich setze die Anker sauber, dann rebuilde + verifiziere ich gezielt.

**Nächster Schritt:** Anker für KPI (B) + T4-Sterne (C) setzen → Walter T2/T4 + Weinberger T4 rebuilden + verifizieren. Akku-Fix ist im Code, greift beim Rebuild automatisch.
