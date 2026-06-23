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
- [data_processing.md](data_processing.md) — Subprozessoren, Aufbewahrung, Löschung, CH-SMS, offene Aufgaben (§6).
- [revdsg_entwuerfe.md](revdsg_entwuerfe.md) — Bearbeitungsverzeichnis · TOMs · Betroffenenrechte (**Entwurf**).
- PII-Leitplanken auch in `CLAUDE.md` (No-Drift) verankert.

## Dateibereich (Parallel-Konflikt-Regel)
- **Besitzt:** `docs/modules/compliance/` (diese Karte + `data_processing.md`).
- **Kollidiert mit:** Betrieb (setzt die Regeln um) — Regeln hier, Umsetzung dort.

## Lücke zum Nordstern — Stand nach Runde 1 (2026-06-23)

**Geschlossen / adressiert:**
1. ✅ **Aufbewahrungsfristen entschieden** — 24 Mt Fälle / 12 Mt Anhänge / 24 Mt Anonymisierung archivierter Fälle (`data_processing.md` §2). *Arbeits-Default, Anwalt vor Skalierung.*
4. ✅ **Bearbeitungsverzeichnis + TOMs** — Entwurf in `revdsg_entwuerfe.md`.
5. ✅ **Endkunden-Betroffenenrechte** — Verfahren-Entwurf in `revdsg_entwuerfe.md`.
7. ✅ **As-built-Gegencheck** — Löschverfahren unvollständig: `proof_pages`/`tenant_callbacks`/`cockpit_sessions`/Gastro-`pub_*` fehlen (notiert `data_processing.md` §6.3).

**Noch offen (Founder / Recht / Bau):**
2. **AVV je Subprozessor ablegen** — Checkliste steht (`data_processing.md` §6.1), Einsammeln = Founder.
3. **US-Adäquanz (Retell/Resend/Sentry)** — SCC/DPF-Grundlage dokumentieren (§6.1).
6. **Kunden-Datenschutzerklärung** — Entwurf + [Recht](../recht.md), vor Roll-out mit Anwalt.
8. **Auto-Löschjob bauen** (Aufbewahrung durchsetzen) + §3-Löschverfahren um die neuen Tabellen erweitern → Modul [Betrieb](../betrieb.md)/[Infrastruktur](../infrastruktur.md).
