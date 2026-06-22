# Lisa — Schweizer Stimme + Adress-Genauigkeit (zwei Produkt-Bauchweh-Punkte)

> **STATUS: PRODUKT-ENTSCHEID (2026-06-22)** — aus Founder-Diskussion (am See). Zwei Themen, die
> **vor** der Demo liegen (Produkt selbst). Founder hat die Adress-Schichten **2/3/4 explizit bestätigt**.
> Tickets: V8 (Stimme) + V9 (Adresse) in `docs/ticketlist.md`. **Live-Agent (BigBen) NICHT ohne Founder-Go anfassen.**

## Ground Truth (im Code geprüft, deutscher Strang)
Quellen: `retell/templates/global_prompt_de.txt`, `retell/templates/agent_template_de.json`, `retell/exports/doerfler_agent.json`.
- **Engine-Sprache = `de-DE`** (Deutschland) — obwohl der Prompt „AUSSCHLIESSLICH Schweizer Hochdeutsch (de-CH)" sagt. Mismatch: Text schweizerisch, Engine deutsch.
- **Custom-ElevenLabs-Stimme** (`custom_voice_3d93cf97…`), Akzent vermutlich deutsch-deutsch.
- **Kein Pronunciation-Dictionary** (Helvetismen + Ortsnamen „auf gut Glück").
- **Adresse wird bewusst NICHT zurückgelesen** (Flow wörtlich: Ort „klingt falsch vorgelesen" → Ticket **V3**). Einziges Netz heute: **Post-Call-SMS** (Daten prüfen/korrigieren/Fotos).
- Pflichtfelder Intake: PLZ (4 Ziffern), Ort, Strasse+Hausnr (best-effort, kein Blocker), Name, Kategorie, Dringlichkeit, Beschreibung.

**Der Knoten:** Weil die deutsche Stimme Schweizer Orte nicht sauber sagt, wurde die Rückbestätigung
abgeschaltet — und damit das einzige Live-Sicherheitsnetz für die Adresse. **Sprachproblem → Adressproblem.
Eines lösen löst das andere mit.**

---

## A) Schweizer Stimme (Ticket V8)

**Reframe:** Lisa ist **Fallback** (nur wenn der Inhaber nicht rangeht). Messlatte = „besser als tote Combox",
nicht „von Einheimischer ununterscheidbar". **Perfektes Mundart = falsche Messlatte und Falle** (Dialekte
zersplittert, keine Schrift, TTS-Qualität ~null). Ziel ist nicht „Züritüütsch", sondern **„aufhören, wie eine
Deutsche zu klingen"**.

**Leiter:**
- **Sofort (klein, hoch wirksam):** Engine auf **de-CH** (falls Retell es unterstützt) · **Pronunciation-Dictionary
  pro Tenant**: Helvetismen (Lavabo, Velo, Spital, Trottoir, parkieren, Natel) **+ die Ortsnamen des
  Einzugsgebiets** (Wädenswil, Kilchberg, Rüschlikon …) · Helvetismen-Glossar in den Prompt.
- **Mittel (Test + Auswahl):** **Schweizer-Hochdeutsch-Stimme** wählen/klonen (ElevenLabs aus CH-Quelle — der
  SRF-/Réception-Ton). Grösster Hebel gegen „klingt fremd". Ggf. alternative TTS-Provider für CH-Deutsch prüfen.
- **Später / R&D (parken):** echtes Mundart; evtl. Hybrid (Mundart-**Begrüssung** „Grüezi, do isch d'Lisa vo …"
  + Schweizer Hochdeutsch im Gespräch).

**Empfehlung:** Schweizer Hochdeutsch **richtig gemacht** (CH-Stimme + Pronunciation-Dict + de-CH). Nicht aufs
volle Mundart wetten.

---

## B) Adresse — Verteidigung in der Tiefe (Ticket V9)

**Prinzip: Lisa ist nie die einzige Wahrheit; es wird nie blind losgefahren.** Schichten:

1. **PLZ als Anker** (wird schon erfasst, 4 Ziffern = zuverlässig) → PLZ→Ort via **amtliches Post-PLZ-Verzeichnis**.
   Ort kommt aus der PLZ, nicht aus dem Verstehen von „Wädenswil". Widerspruch PLZ↔Ort → Flag.
   *(Technische Grundlage für 2 — Founder ok implizit über 2.)*
2. **Strasse gegen echte Strassen dieser PLZ prüfen** (Swiss-Post-Adress-/Match-API) → Verhörer fuzzen/Flag.
   **← Founder bestätigt.**
3. **Rückbestätigung wieder einschalten** — sobald die Stimme die Namen richtig sagt (A). Hebt V3 gezielt auf.
   **← Founder bestätigt.**
4. **Inhaber-Augen vor der Fahrt** (stärkstes Netz 1–3-Mann: kennt sein Einzugsgebiet) + **Karten-Pin** in der
   Leitzentrale (falscher Ort = sofort sichtbar). Lisa stellt nie selbst zu. **← Founder bestätigt.**
5. **Rückrufnummer = ultimativer Backstop** (liegt immer vor) — selbst total verhörte Adresse ≠ Fehlfahrt. *(gratis)*
6. **SMS-Korrektur** (schon geplant) = gute *spätere* Schicht, nicht die erste. *(gratis)*

**Verkaufs-Reframe:** „Lisa nimmt auf, aber **SIE** entscheiden — kein Techniker fährt blind los." Aus der Angst
wird ein Feature (passt zu „kein blindes Durchstellen").

---

## Sequenzierung
- Beide sind **Produkt-Themen vor der Demo.** Der **„Lisa hören"-Beweis** in der Demo darf einem Schweizer erst
  gezeigt werden, **wenn die Stimme nicht mehr deutsch klingt** (sonst nach hinten los).
- **BigBen = Prüfstein** (echter Sani am Zürichsee): Ortsnamen-Aussprache + Adress-Capture genau dort validieren.
- **Live-Agent nicht ohne Founder-Go** (Publish-Pflicht, zahlender Kunde).
