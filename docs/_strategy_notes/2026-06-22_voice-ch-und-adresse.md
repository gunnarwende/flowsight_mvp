# Lisa — Schweizer Stimme + Adress-Genauigkeit (zwei Produkt-Bauchweh-Punkte)

> **STATUS: PRODUKT-ENTSCHEID (2026-06-22)** — aus Founder-Diskussion (am See). Zwei Themen, die
> **vor** der Demo liegen (Produkt selbst). Founder hat die Adress-Schichten **2/3/4 explizit bestätigt**.
> Tickets: V8 (Stimme) + V9 (Adresse) in `docs/ticketlist.md`. **Live-Agent (BigBen) NICHT ohne Founder-Go anfassen.**

> ### 🔖 STAND 2026-06-30 — Swiss-Post-Zugang GEKLÄRT (Antwort da)
> **Wo wir stehen:** V9-Adress-Lib ist gebaut + fail-safe (`src/web/src/lib/address/validateAddress.ts`); offen ist NUR die Stub-Funktion `callSwissPost()`. Ohne Credentials → `skipped` (neutral, kein Flag). Code braucht exakt **BuildingVerification** („existiert die Adresse?", Hauptbedarf Voice-Intake) **+ AutoComplete** (Strasse-Fuzz, Online-Wizard).
> **Antwort Swiss Post (Milena Burgener, 2026-06-30) — alle 3 Fragen beantwortet:**
> - (a) **Ja, server-seitig per REST.** Endpoint: `https://webservices.post.ch:17023/IN_SYNSYN_EXT/REST/v1/autocomplete4`. Doku: developer.post.ch → „Address web services REST".
> - (b) **Auth = BasicAuth** (technischer Benutzer + Passwort bei *jeder* Abfrage). **Kostenlos → KEINE Produktions-Aufschaltung nötig.**
> - (c) **BuildingVerification ist dabei** — Funktion **4.5** (Prüfung Strasse/Nr/PLZ/Ort, nicht-personenbezogen). **AutoComplete = 4.4** (Vervollständigung).
> **Technischen Benutzer anlegen (Founder, manuell im Post-Kundencenter — laut PDF „Technischer_Benutzer_Anleitung_BasicAuth"):** post.ch Geschäftslogin → Kundencenter → „Meine Post" → „Mitarbeiter und Rollen" (braucht **SuperAdmin**) → „Benutzer erfassen" → „Technischer Benutzer" → Username+Passwort werden generiert (**sofort notieren!**) → Bezeichnung → Erfassen → Weiter → Speichern.
> **➡️ Verdrahtung (CC, wenn Creds da):** `callSwissPost()` gegen `autocomplete4` (BuildingVerification 4.5 primär, AutoComplete 4.4 für Wizard) mit **BasicAuth**. Creds als **`SWISSPOST_USER` + `SWISSPOST_PASSWORD`** in Vercel-Env. ⚠️ **Gate anpassen:** `swissPostConfigured()` gated heute auf `SWISSPOST_API_KEY`/`SWISSPOST_CLIENT_ID` — auf die BasicAuth-Paar-Variante umstellen + `env_vars.md` nachziehen. Exakte Request/Response-Form vor dem Coden von developer.post.ch (4.4/4.5) holen. Use-Case (Founder): nur „existiert/auffindbar", **nicht** „wohnt Person dort".
>
> #### ⏸ 2026-06-30 — UNTERBROCHEN (Post-Website-Ladefehler), offene Schritte:
> - ✅ **Geschäftskonto erstellt:** SwissID (Gunnar Wende, gunnar.wende@flowsight.ch) → Geschäftskunde „FlowSight" → **Rolle Superadministrator** bestätigt.
> - ⏳ **Technischen Benutzer anlegen — HÄNGT:** Post-Kundencenter („Meine Post") lädt nicht („Etwas ist schiefgelaufen / Funktionen zurzeit nicht verfügbar") — typisch bei frischem Konto (Provisionierung). **Später erneut** (reload / aus- & einloggen / 5–10 Min warten): `Meine Post → Mitarbeiter und Rollen → Benutzer erfassen → Technischer Benutzer` → Username+Passwort **sofort notieren** → in **Vercel** als `SWISSPOST_USER`/`SWISSPOST_PASSWORD`.
> - ⏳ **Dann:** CC verdrahtet `callSwissPost()` (s. o.).
> - 📧 **REMINDER (Founder):** **Milena Burgener noch auf die Mail antworten** (höflicher Dank/kurze Rückmeldung) — nicht untergehen lassen.

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
- **Prüfstein = echter Sanitär-Tenant** (Dörfler / nächster zahlender Sani) — **NICHT BigBen** (ist ein Pub, nimmt gar keine Adressen auf → für V9 ungeeignet).
- **Live-Agent nicht ohne Founder-Go** (Publish-Pflicht, zahlender Kunde).

---

## Update — Recherche & Korrekturen (22.06., Web)

**ElevenLabs CH-Stimmen (vs. „die eine Katastrophe" vor 2 Mt):** Es gibt inzwischen MEHR — konkret *Heidi factual*
(Schweizer Hochdeutsch = Standarddeutsch mit CH-Akzent) und *Aleks* (m, CH-Akzent). CH-Test (April 2026):
„gut für Content, für hochprofessionell noch nicht perfekt → für Kundenkommunikation **Standarddeutsch-mit-CH-Akzent**
statt Dialekt". ElevenLabs-**STT** erkennt CH-Akzent (hilft beim *Verstehen* der Anrufer). **Qualität = Founder-Ohr-Test**
(ich habe keinen ElevenLabs-Zugang in der Sandbox; No-Go-Maßstab bleibt dein Ohr).

**Retell-Realität (korrigiert meinen Plan):**
- **Pronunciation-Dictionary ist English-only** (Turbo v2, nicht v2.5) → Ortsnamen-Dictionary für den DE-Agenten **geht nicht**. Hebel stattdessen: **CH-Stimme wählen/klonen** + Helvetismen/„Grüezi" im **Prompt-Text** + ggf. de-CH-Engine.
- **Retell-TTS-Provider:** ElevenLabs (v3/Flash v2.5) · OpenAI · Cartesia · PlayHT · Minimax · Fish. **Azure de-CH (Leni/Jan) geht NICHT** in Retell.
- **Stärkster Identitäts-Hebel:** eine echte CH-Sprecherin in Schweizer Hochdeutsch **klonen** (Voice-ID in Retell einsetzbar) → volle Kontrolle über Klang + Außenwirkung statt Community-Lotterie.

**Adresse — Entkopplung (besser als „hängt an V8"):** Lisa muss den **Ortsnamen gar nicht aussprechen.**
Read-back über **PLZ-Ziffern + Strasse + Hausnummer** (alles sagbar), **Ort wird aus der PLZ abgeleitet** (amtl. Verzeichnis),
**Strasse gegen die echten Strassen dieser PLZ** geprüft via **Swiss-Post Address-Web-Services REST** (AutoComplete +
BuildingVerification, `developer.post.ch`; Billing-Beziehung nötig; Alt: `positio.ch`). → Adresse (nahezu) fehlerfrei,
**auch wenn die Stimme „Wädenswil" nicht perfekt sagt.** V9 hängt damit NICHT an V8.

**Zwei Dimensionen (das End-to-End-Bild):**
- **Außenwirkung = wie Lisa KLINGT** → Stimme (V8). Damit identifiziert sich der Betrieb.
- **Fehlerfreiheit = ob die DATEN stimmen** → Capture + Validierung (V9). Unabhängig von der Stimme.
- Ehrliches Versprechen: nicht „Lisa verhört sich nie" (ASR ≠ 100%), sondern **„ein Verhörer führt nie zu einer Fehlfahrt"** (Validierung + Inhaber-Augen + Rückrufnummer).

**Heidi/Aleks ohr-getestet (Founder 22.06.): beide grauenhaft → No-Go.** Community-CH-Stimmen sind raus.

**Hochprofessioneller Weg (Founder will NUR High-End):** ElevenLabs **Professional Voice Clone (PVC)** — NICHT Instant-Clone.
- Echte **Schweizer Profi-Sprecherin** (Schweizer Hochdeutsch, warmer „SRF/Réception"-Ton; kein Dialekt = TTS-untauglich).
- **30 Min–3 h sauberes Studio-Audio**, Skript domänen-getunt: Phonetik-Breite + Sanitär-Vokabular + Ortsnamen der Region + „Grüezi"-Begrüssungen + Dispositions-Sätze.
- **Verifizierte Einwilligung** der Sprecherin (PVC-Pflicht).
- **Eine Premium-Stimme (oder kuratiert 2–3 m/w), amortisiert über ALLE Betriebe/Gewerke** → high-end UND effizient (einmal aufnehmen, alle profitieren).
- **Identität pro Betrieb** ≠ eigene Stimme pro Betrieb (skaliert nie), sondern **dynamische Begrüssung** („Grüezi, do isch d'Lisa vo [Betrieb]") + hinterlegtes Wissen/Regeln. Stimme = FlowSight-Qualitätsstandard; Begrüssung+Inhalt = der konkrete Betrieb.
- **Klon/Anhören läuft über Founder/Vercel** — Sandbox hat keinen Key + api.elevenlabs.io geblockt (geprüft). CC kann das **Aufnahme-Skript** liefern.

**Adresse — Vertrauens-Ampel (Founder-Kern):** „Rückrufnummer liegt vor" ist NICHT die Antwort — 2–3 Fehlfahrten und das
Vertrauen ist komplett weg, dann Bauchweh pro Ticket. Fix: jede Adresse **gegen Swiss Post validiert** → **grün=bestätigt**
(verlässt sich ohne hinschauen) / **gelb=prüfen** (nur die wenigen). Anxiety weg, weil das System sagt, welche bombenfest sind.

Quellen: developer.post.ch (Address Web Services REST) · docs.retellai.com/build/add-pronunciation · retellai.com (TTS-Provider) · aicheck24.ch (CH-Test April 2026) · json2video.com (Heidi/Aleks) · ElevenLabs Professional Voice Cloning.
