# Session-Ritual — Tagesabschluss + produktives Handy-Arbeiten

Wie eine Session sauber endet, damit die Doku synchron bleibt, und wie man vom Handy am produktivsten arbeitet.

## Tagesabschluss (sag: „Tagesabschluss" / „EOD-Sync")

Dann werden die **lebenden Docs** gepflegt:

1. **`STATUS.md`** — 5–10 Zeilen: Datum, was geändert, was ist live, nächste Schritte (Format: CLAUDE.md, „Status Update Format").
2. **`ticketlist.md`** — Erledigtes abhaken, Neues/Offenes rein. Der **einzige** Task-Tracker.
3. **Betroffene Quelle, nur bei Substanz-Änderung:** die passende Bible (Sales/Onboarding/Pipeline/Customer-Journey), `architecture/zielarchitektur.md` (neue D-Nummer bei Tech-Entscheid), oder `customers/<slug>/status.md`.
4. **Memory** — CC pflegt den Resume-Anker (still).

**Was NICHT nachgepflegt wird:** Live-Zustand (Fälle, Voice-Config, Reservierungen) gehört nicht in Docs — der kommt aus dem System (`morning-report`, `retell-inspect`). So driftet nichts.

## Die drei „immer prüfen"-Docs (täglicher Puls)

Beim Start, egal ob Laptop oder Handy:

1. **`INDEX.md`** — die Karte (wo finde ich was).
2. **`STATUS.md`** — was ist live / zuletzt passiert.
3. **`ticketlist.md`** — was ist offen.

Der Rest (Bibles, Architektur) ändert sich langsam und wird nur bei echten Entscheidungen angefasst.

## Tipps für produktives Handy-Arbeiten

Die Cloud-Sandbox am Handy ist **ephemer** — nur Committet + Gepushtes überlebt. Daraus folgt:

- **Ein klarer Task pro Session**, der in einem Commit/PR endet. Nicht auf lokalen Mehr-Schritt-Zustand verlassen.
- **Immer in einen PR enden** → Diff in der GitHub-Mobile-App prüfen → mergen. Das ist dein Review-Surface.
- **Live-Ops über den Workflow-Katalog** (`mobile_ops.md`) — triggern, nicht in der Sandbox basteln. Secrets bleiben im Runner.
- **Schreibendes/Publishendes zuerst im Dry-Run**, Ergebnis lesen, dann scharf — durch die Founder-Gates (Environment-Approval).
- **Den Agenten gegen das System verifizieren lassen** (z. B. `inspect` vor/nach einer Änderung), nicht raten.
- **Decision-Packet anfordern:** „Was geändert · welche Dateien · welche Checks · welche Entscheidung brauchst du · nächster Schritt" — so entscheidest du in 30–60 Sek am kleinen Screen.
- **GitHub-App parallel nutzen:** Diffs reviewen, Deployments approven (Gates), Workflows starten, CI lesen. Claude Code fürs Denken/Editieren, die App fürs Kontrollieren.
- **Founder-Gates bleiben heilig:** vor dem Approve kurz schauen, was du freigibst — nicht reflexhaft tappen.
- **Schweres/Visuelles** (Video-Pipeline, große Refactors) → Laptop, oder vom Handy nur **vorbereiten** lassen (Branch + Entwurf), Feinschliff/Abnahme am Laptop.
