# Leitstand Analyse-Paket — Index

> **Stand:** 2026-03-15 | **Quelle:** Code-basierte Analyse (Track A)
> **Zweck:** Vollständiges Capture-Set für externe Analyse (psychologisch, emotional, operativ, strukturell, visuell, Gold-Contact, Betriebsgrössen)

---

## Dokumente

| # | Datei | Inhalt |
|---|-------|--------|
| 01 | [01_dom_anatomie.md](01_dom_anatomie.md) | JSX→DOM-Anatomie jeder OPS-Seite (Component Tree, Server/Client, Props, Render-Bedingungen) |
| 02 | [02_state_matrix.md](02_state_matrix.md) | Alle Zustände pro Seite (leer, geladen, Fehler, Varianten) mit exakten Rendering-Bedingungen |
| 03 | [03_clickmap.md](03_clickmap.md) | Jedes interaktive Element: Was, Wo, Wohin, Funktion |
| 04 | [04_gold_contact_audit.md](04_gold_contact_audit.md) | leitstand.md §-für-§ Abgleich gegen Code-Realität |
| 05 | [05_identity_contract_audit.md](05_identity_contract_audit.md) | R1–R7 Konsistenzregeln gegen Code-Realität |
| 06 | [06_betriebsgroessen_matrix.md](06_betriebsgroessen_matrix.md) | Was ein 2-Mann, 5-10-Mann, 20-30-Mann-Betrieb sieht/braucht/fehlt |
| 07 | [07_farb_typografie_inventar.md](07_farb_typografie_inventar.md) | Vollständiges Farb- und Typografie-Inventar aller OPS-Komponenten |
| 08 | [08_viewport_hierarchie.md](08_viewport_hierarchie.md) | Render-Reihenfolge, Pixel-Budget, Informationshierarchie pro Seite |
| 09 | [09_sweep_report.md](09_sweep_report.md) | Konsistenz-Sweep: Farbreste, a11y, Wording, Edge Cases |
| 10 | [10_luecken_kompromisse.md](10_luecken_kompromisse.md) | Offene Lücken + bewusste Kompromisse (was fehlt, was vertagt, was gebrochen) |
| 11 | [11_screenshot_anleitung.md](11_screenshot_anleitung.md) | Track B: Screenshot-Anleitung für Owner (Desktop + Mobile, alle Zustände) |

## Screenshots

Ordner `aktueller_stand/` — Owner legt hier aktuelle Screenshots ab.

## Methodik

- **Quelle:** Ausschliesslich Code-Analyse (kein Browser, kein Runtime)
- **Referenzdokumente:** `leitstand.md` (Gold-Contact), `identity_contract.md` (R1–R7), `leitstand_renovation.md` (Entscheidungen 15.03.)
- **Stand des Codes:** Post-Renovation (PR #210, Commit `e8a3516`)
- **Nicht enthalten:** Runtime-Verhalten (JS-Execution, API-Responses, Latenz), Supabase-Daten, Vercel-Config
