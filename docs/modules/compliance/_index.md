# Modul: Compliance

> Teil der [FlowSight Bible](../../flowsight_bible.md). DSG · PII · Recording-OFF ·
> Daten-Verarbeitung. (Verträge/AGB = eigenes Modul [Recht](../recht.md).)

## Zweck
Sicherstellen, dass FlowSight schweizer Datenschutz (revDSG) einhält und keine PII unkontrolliert nach aussen geht.

## Status heute (geerntet — was wir HABEN)
- **`data_processing.md` (in diesem Ordner) ist solide:** Subprozessoren-Tabelle (Funktion · Daten · Ort · Privacy-Config), Aufbewahrung (Ist-Stand), manuelles **Löschverfahren** (SQL + Checkliste), CH-SMS-Regeln + finale SMS-Templates (≤160). **Keeper, keine Altlast.**
- **Recording OFF** bei Lisa (fix). **Ausgabe an Kunden = E-Mail.**
- **WhatsApp = nur Founder-Ops-Alerts, intern, ohne PII.**
- **Sentry:** keine PII in Tags (nur IDs/Entscheidungs-Tags) — by design.

## Kanonische Quelle (SSOT)
- [data_processing.md](data_processing.md) — Subprozessoren, Aufbewahrung, Löschung, CH-SMS (in diesem Modul-Ordner).
- PII-Leitplanken auch in `CLAUDE.md` (No-Drift) verankert.

## Dateibereich (Parallel-Konflikt-Regel)
- **Besitzt:** `docs/modules/compliance/` (diese Karte + `data_processing.md`).
- **Kollidiert mit:** Betrieb (setzt die Regeln um) — Regeln hier, Umsetzung dort.

## Lücke zum Nordstern (was FEHLT für „100 % verlässlich")
Damit ein Founder der Compliance *blind vertrauen* kann, fehlt heute:

1. **Aufbewahrungsfristen entscheiden** — Fälle / Anhänge / archivierte Fälle stehen in `data_processing.md` als **TBD (Founder)**. Solange offen = keine Löschautomatik, unklare Pflicht. → Founder-Entscheid.
2. **AVV je Subprozessor abgelegt** — Vendors sind gelistet, aber kein AVV/DPA als *unterzeichnet/abgelegt* geführt (Resend-DPA explizit „review offen"). → AVV-Status-Tabelle (signiert ja/nein/Link).
3. **US-Subprozessoren-Angemessenheit (revDSG)** — Retell/Resend/Sentry (+ Twilio US) = offener Adäquanz-Punkt (auch in ONBOARDING_BIBLE geflaggt). → SCC/DPF-Grundlage je Vendor dokumentieren.
4. **Bearbeitungsverzeichnis + TOMs** — revDSG-Bausteine (Verzeichnis der Bearbeitungstätigkeiten + technisch-organisatorische Massnahmen) existieren noch nicht als Doc.
5. **Endkunden-Betroffenenrechte** — Löschverfahren deckt *Tenant*-Löschung; Auskunft/Löschung für die *Endkunden des Betriebs* (deren PII in `cases`) fehlt als Verfahren.
6. **Kunden-Datenschutzerklärung** — fehlt (Grenze zu [Recht](../recht.md): Vertrag/AGB = Recht, Datenschutzhinweis = hier).
7. **Aktualität prüfen** — `data_processing.md` Stand **2026-02-25**; gegen heutigen As-built gegenchecken (z. B. neues `address_status`-Feld; Löschen-SQL noch vollständig?).

**Priorität für den Nordstern:** 1 + 3 zuerst (blockieren echtes Vertrauen), 2/4/5/6 als Founder/Recht-Paket, 7 als kurzer Verify-Lauf.
