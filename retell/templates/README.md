# Voice Agent Templates — Neuen Kunden-Agent erstellen

**Schablone:** Brunner Haustechnik AG (`retell/exports/brunner_agent.json` + `brunner_agent_intl.json`)

## Übersicht

Jeder Kunde bekommt ein eigenes Agent-Paar (DE + INTL). Die Brunner-Configs dienen als Vorlage — kopieren, Firmendaten ersetzen, importieren, fertig.

**Geschätzte Zeit:** ~20 Min pro Kunde (Copy + Anpassen + Import + Verknüpfen)

**Persona:** Alle Agents heissen "Lisa" — die digitale Assistentin. Begrüssung: "Guten Tag, hier ist Lisa — die digitale Assistentin der [Firma]. Wie kann ich Ihnen helfen?"

**Stimmen (Standard):**
- **DE Agent:** Ela (`custom_voice_3209d3305910d955836523bfac`)
- **INTL Agent:** Juniper (`custom_voice_cf152ba48ccbac0370ecebcd88`)

**WICHTIG:** Beim JSON-Import in Retell MUSS die `voice_id` im Format `custom_voice_*` angegeben sein. ElevenLabs-IDs (z.B. `v3V1d2rk...`) funktionieren beim Import NICHT — Retell setzt dann eine Default-Stimme (Cimo). Die Brunner-Vorlage hat bereits die korrekten IDs.

---

## Schritt-für-Schritt

### 1. JSON kopieren

```bash
cp retell/exports/brunner_agent.json retell/exports/<kunde>_agent.json
cp retell/exports/brunner_agent_intl.json retell/exports/<kunde>_agent_intl.json
```

### 2. Firmendaten ersetzen

In BEIDEN Dateien (DE + INTL) folgende Stellen anpassen:

#### Top-Level Felder

| Feld | Brunner (Vorlage) | Ersetzen mit |
|------|-------------------|-------------|
| `agent_name` | "Brunner Haustechnik AG Intake (DE)" | "[Firma] Intake (DE)" |
| `version_title` | "Brunner Haustechnik AG Intake (DE) v2" | "[Firma] Intake (DE) v1" |

#### global_prompt — FIRMEN-WISSEN Section

Alles zwischen `FIRMEN-WISSEN` und dem nächsten `═══` Block ersetzen:

| Feld | Was anpassen |
|------|-------------|
| Firma | Firmenname |
| Inhaber | Name des Inhabers |
| Adresse | Strasse, PLZ, Ort |
| Telefon | Geschäftsnummer |
| E-Mail | Firmen-E-Mail |
| Website | URL |
| Gegründet | Gründungsjahr |
| Team | Mitarbeiter-Liste mit Rollen |
| Leistungen | Services des Betriebs |
| Einzugsgebiet | Gemeinden |
| Öffnungszeiten | Büro + Notdienst |
| Preisindikationen | Richtwerte für häufige Services |
| Lehrstellen | Aktueller Stand |

#### Nodes — Firmenname ersetzen

| Node | Feld | Brunner (Vorlage) |
|------|------|-------------------|
| Welcome Node | `instruction.text` | "Brunner Haustechnik AG" |
| Main Conversation | `instruction.text` | "brunner-haustechnik.ch" (E-Mail-Verweise) |
| Closing Intake | `instruction.text` | "Brunner Haustechnik AG meldet sich" |
| Closing Info | `instruction.text` | "Brunner Haustechnik AG" |
| Language Transfer | `tools[0].agent_id` | INTL Agent-ID (nach Import) |

**Tipp:** Global Find & Replace:
- `Brunner Haustechnik AG` → `[Neuer Firmenname]`
- `brunner-haustechnik` → `[neuer-slug]`
- `Thomas Brunner` → `[Inhaber-Name]`
- `Seestrasse 42, 8800 Thalwil` → `[Neue Adresse]`
- `044 505 48 18` → `[Neue Nummer]`

### 3. In Retell importieren

1. Retell Dashboard → Create Agent → Import JSON
2. DE Agent importieren → **agent_id notieren**
3. INTL Agent importieren → **agent_id notieren**

### 4. Agents verknüpfen

- DE Agent → Language Transfer Node → `swap_to_intl_agent.agent_id` = INTL Agent-ID
- INTL Agent → DE Transfer Node → `swap_to_de_agent.agent_id` = DE Agent-ID

### 5. Publishen

Beide Agents im Retell Dashboard publishen (NICHT via API).

### 6. Twilio + Supabase

1. Twilio-Nummer dem Retell DE Agent zuweisen (SIP Trunk)
2. Supabase `tenant_numbers`: Nummer → tenant_id eintragen

### 7. Testanruf

- Anrufen → Agent meldet sich mit korrektem Firmennamen
- Schaden melden → Fall im Dashboard prüfen
- Info-Frage stellen → Agent antwortet korrekt

---

## Agent-Architektur (beide Agents)

### DE Agent — 9 Nodes

```
Welcome → Language Gate → Main Conversation → Closing Intake → End Call
                                            → Closing Info   → End Call
                                            → Out-of-scope   → End Call
                       → Language Transfer (swap to INTL)
         Logic Split (fallback router)
```

### INTL Agent — 9 Nodes

```
Welcome → Main Conversation → Closing Intake → End Call
                            → Closing Info   → End Call
                            → Out-of-scope   → End Call
                            → DE Transfer (swap to DE)
         Logic Split (fallback router)
```

### Zwei Modi (automatische Erkennung)

| Modus | Auslöser | Was passiert |
|-------|----------|-------------|
| **INTAKE** | Schaden, Notfall, Problem | Pflichtfelder sammeln → Fall erstellen |
| **INFO** | Öffnungszeiten, Preise, Fragen | Aus Firmen-Wissen beantworten |

Modi können wechseln: Info → Intake ("Ach, ich habe auch ein Leck...") oder Intake → Info ("Was kostet das ungefähr?")

### Post-Call Analysis

| Feld | Intake | Info |
|------|--------|------|
| `call_type` | "intake" | "info" |
| `plz` | "8800" | "" (leer) |
| `city` | "Thalwil" | "" (leer) |
| `category` | "Rohrbruch" | "" (leer) |
| `urgency` | "notfall" | "" (leer) |
| `description` | "Rohrbruch im Keller..." | "Anrufer fragte nach Öffnungszeiten und Preisen" |

---

## Welche Info-Fragen der Agent beantwortet

Diese Fragen bekommt ein typischer Sanitärbetrieb täglich — sie bringen kein Geld, kosten aber Zeit und Nerven:

1. **Öffnungszeiten** — "Haben Sie heute offen?"
2. **Einzugsgebiet** — "Kommen Sie auch nach [Ort]?"
3. **Preisanfragen** — "Was kostet ein neuer Boiler?"
4. **Chef sprechen** — "Kann ich mit dem Inhaber reden?"
5. **Terminrückfrage** — "Stimmt mein Termin am Dienstag?"
6. **Bewerbungen** — "Suchen Sie Lehrlinge?"
7. **Adresse / Anfahrt** — "Wo ist Ihr Büro?"
8. **Beratung** — "Soll ich den Boiler ersetzen oder reparieren?"
9. **Offertanfrage** — "Ich brauche eine Offerte für mein Bad"

→ In der Demo: Agent beantwortet ALL diese Fragen natürlich und kompetent.
→ Value Proposition: "Diese Anrufe stören Ihren Arbeitsfluss. Unser Agent übernimmt das."
