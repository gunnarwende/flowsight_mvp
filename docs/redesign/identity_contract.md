# Tenant Identity Contract

**Typ:** Bindendes Querschnittsdokument (kein Zielbild, kein Strang)
**Status:** SSOT-Referenz — gilt ab sofort fuer alle Straenge
**Letzte Aenderung:** 2026-03-12
**Referenziert von:** voice.md, leitstand.md, prospect_journey.md (kommend), wizard.md (kommend)

---

## 1. Purpose

### Was dieses Dokument ist

Eine verbindliche Wahrheitstabelle fuer Tenant-Identitaet. Es definiert:
- welche Felder einen Tenant beschreiben
- wo jedes Feld erscheint
- welche Quelle autoritativ ist
- welche Naming-Regeln gelten

Jedes Zielbild-Dokument und jede Implementierung, die Tenant-Daten auf einer Oberflaeche zeigt, MUSS gegen dieses Dokument gebaut werden.

### Was dieses Dokument nicht ist

- Kein Zielbild (keine Produktvision, keine Prosa)
- Kein Architektur-Dokument (keine Migrations-Details, keine API-Specs)
- Kein Branding-Guide (keine Farblehre, keine Typografie)
- Kein Ersatz fuer voice.md SS8 oder leitstand.md SS8 (die bleiben autoritativ fuer ihre Domaene)

### Grundprinzip

> FlowSight ist unsichtbare Infrastruktur. Der Betrieb sieht sein System, nicht unsere Software.
> Wie Stripe bei Zahlungen: Der Kunde sieht den Shop, nicht Stripe.
> -- leitstand.md SS8

Jede Oberflaeche, die ein Prospect oder Betrieb sieht, spiegelt den Betrieb, nicht FlowSight. Ausnahmen sind explizit markiert.

---

## 2. Tenant Identity Fields

### 2.1 Primaerfelder (Pflicht fuer jeden Tenant)

| Feld | Bedeutung | Beispiel Weinberger | Beispiel Doerfler | Quelle (SSOT) |
|------|-----------|--------------------|--------------------|---------------|
| `slug` | URL-Identifier, systemweit eindeutig | `weinberger-ag` | `doerfler-ag` | Supabase `tenants.slug` |
| `display_name` | Voller Firmenname fuer alle sichtbaren Oberflaechen | Jul. Weinberger AG | Doerfler AG | Supabase `tenants.name` (*) |
| `short_name` | Kurzform fuer platzbeschraenkte Kontexte (SMS, Tabs) | Weinberger | Doerfler | Supabase `tenants.modules.sms_sender_name` (**) |
| `legal_name` | Rechtlich korrekte Firma (Vertrag, Impressum, AVV) | Jul. Weinberger AG | Doerfler AG | Manuell gepflegt (Vertrag) |
| `brand_color` | Primaere Akzentfarbe (Hex) | #004994 | #2b6cb0 | CustomerSite Registry (***) |
| `contact_phone` | Geschaeftsnummer (oeffentlich) | 044 721 22 23 | 043 443 52 00 | CustomerSite Registry |
| `contact_email` | Geschaefts-E-Mail | info@julweinberger.ch | info@doerflerag.ch | CustomerSite Registry |
| `voice_number` | Twilio SIP Nummer (Lisa) | +41 43 505 11 01 | +41 44 505 74 20 | Supabase `tenants` + Twilio |
| `services[]` | Angebotene Dienstleistungen | [Sanitaer, Heizung, Spenglerei, Leitungen, Solar, Boiler, Wartung, Beratung] | [Sanitaer, Heizung, Boiler, Leitungen, Beratung, Wartung] | CustomerSite Registry → Voice-Agent → Wizard |
| `service_area_plz[]` | PLZ-Einzugsgebiet | [8800, 8802, 8942, ...] | [8804, 8942, 8038, ...] | Supabase `tenants.voice_config.service_area` (Zielbild) |
| `emergency_active` | Notdienst aktiv? | true | true | CustomerSite Registry + Voice-Config |
| `team_size` | Solo-Meister oder Team? | team | team | Supabase (Onboarding) |

**Anmerkungen:**

(*) **`display_name` = `tenants.name` in der heutigen DB.** voice.md SS8 benennt das Feld als `display_name`. Bis zur Migration bleibt `tenants.name` das physische Feld. Dieses Dokument verwendet `display_name` als logischen Namen. Mapping: `display_name` == `tenants.name`.

(**) **`short_name`:** Heute als `modules.sms_sender_name` gespeichert. Logisch ist es der Kurzname des Betriebs und wird kuenftig ueber SMS hinaus verwendet (Browser-Tab, Telegram-Alerts). Migrationspfad: `short_name` als eigenes Feld auf `tenants`-Tabelle, `sms_sender_name` wird Alias.

(***) **`brand_color`:** Heute nur in der TypeScript CustomerSite Registry. Migrationspfad: In Supabase `tenants.brand_config.color` ueberfuehren. Bis dahin bleibt die Registry SSOT fuer Web-Rendering.

### 2.2 Voice-Konfiguration (Pflicht fuer jeden Tenant mit Voice-Agent)

| Feld | Bedeutung | Beispiel | Quelle (SSOT) |
|------|-----------|---------|---------------|
| `greeting_style` | Begruessung | `gruezi` / `guten_tag` | Supabase `tenants.voice_config` (Zielbild) |
| `owner_name` | Inhaber/Geschaeftsfuehrer | Christian Weinberger | Supabase `tenants.voice_config` (Zielbild) |
| `hours` | Oeffnungszeiten | Mo-Fr 07:00-17:00 | Supabase `tenants.voice_config` (Zielbild) |
| `categories[]` | Meldungskategorien (Voice + Wizard) | [Sanitaer, Heizung, Leitungen, ...] | Supabase `tenants.voice_config` (Zielbild) |
| `emergency_desc` | Notdienst-Beschreibung | 24/7 Notdienst Sanitaer | Supabase `tenants.voice_config` (Zielbild) |
| `price_hints` | Unverbindliche Richtwerte | Besichtigung CHF 100-150 | Supabase `tenants.voice_config` (Zielbild) |

**Hinweis:** Diese Felder existieren heute als Hardcoded-Werte in den Agent-JSONs (`retell/exports/`). Das Zielbild (voice.md SS8.3) sieht eine Migration nach Supabase `voice_config` JSONB vor. Bis dahin sind die Agent-JSONs die faktische Quelle.

### 2.3 Abgeleitete Felder (automatisch generiert)

| Feld | Ableitungsregel | Beispiel Weinberger | Beispiel Doerfler |
|------|----------------|--------------------|--------------------|
| `initials` | Erste 2 Buchstaben von `display_name` (ohne Rechtsform) | WE | DO |
| `tab_title` | `{short_name} OPS` | Weinberger OPS | Doerfler OPS |
| `sidebar_label` | `{initials}` + `{display_name}` | WE Jul. Weinberger AG | DO Doerfler AG |
| `email_sender_name` | `{display_name} via FlowSight` | Jul. Weinberger AG via FlowSight | Doerfler AG via FlowSight |
| `welcome_title` | `{display_name} — Ihre digitale Einsatzzentrale` | Jul. Weinberger AG — Ihre digitale Einsatzzentrale | Doerfler AG — Ihre digitale Einsatzzentrale |
| `agent_name_retell` | `{display_name} Intake ({lang})` | Jul. Weinberger AG Intake (DE) | Doerfler AG Intake (DE) |
| `greeting_text` | Template: `{greeting_style}, hier ist Lisa von der {display_name}` | Gruezi, hier ist Lisa von der Weinberger AG | Guten Tag, hier ist Lisa von der Doerfler AG |

**Generierung:** `provision_trial.mjs` berechnet alle abgeleiteten Felder bei Tenant-Erstellung. Manuelle Ueberschreibung moeglich fuer `initials` (z.B. wenn Kollision).

---

## 3. Oberflaechen-Matrix

Welches Feld erscheint wo. Leere Zelle = Feld nicht relevant fuer diese Oberflaeche.

| Feld | Website | Wizard | Voice/Lisa | SMS | E-Mail (Betrieb) | E-Mail (Caller) | Leitstand | Welcome Page | Telegram Ops |
|------|---------|--------|-----------|-----|-------------------|-----------------|-----------|-------------|-------------|
| `display_name` | Hero, Nav, Footer | Header | Greeting | — | Subject + Body | — | Sidebar | Titel | — |
| `short_name` | — | — | — | Absender | — | — | Tab-Titel | — | Alert-Text |
| `brand_color` | Akzent, Nav, CTA | Akzent | — | — | — | — | Akzent (Zielbild) | — | — |
| `contact_phone` | Kontakt-Sektion | — | Rueckfrage-Info | — | Footer | — | — | — | — |
| `contact_email` | Kontakt-Sektion | — | Rueckfrage-Info | — | Reply-To | — | — | — | — |
| `voice_number` | CTA "Jetzt anrufen" | — | — | — | — | — | — | CTA + Nummer | — |
| `services[]` | Service-Grid | Kategorie-Dropdown | Kategorie-Erkennung | — | — | — | Case-Kategorien | — | — |
| `service_area_plz[]` | — | PLZ-Validation | PLZ-Check (SS6.2) | — | — | — | — | — | — |
| `emergency_active` | Notfall-Banner | Dringlichkeits-Feld | Empathie-Branch | — | Subject-Prefix | — | Notfall-Flag | — | Alert-Flag |
| `owner_name` | Team-Sektion | — | Rueckfrage-Info | — | — | — | — | — | — |
| `hours` | Oeffnungszeiten | — | Auskunft | — | — | — | — | — | — |
| `slug` | URL-Pfad | URL-Pfad | — | — | — | — | Scope-Filter | URL-Pfad | Identifier |
| `initials` | — | — | — | — | — | — | Sidebar-Avatar | — | — |
| `tab_title` | — | — | — | — | — | — | Browser-Tab | — | — |
| `greeting_text` | — | — | Eroeffnung | — | — | — | — | — | — |
| `email_sender_name` | — | — | — | — | Sender-Name | Sender-Name | — | — | — |

### Legende Oberflaechen

| Oberflaeche | Wer sieht es | Beispiel |
|------------|-------------|---------|
| **Website** | Oeffentlichkeit, Prospect, Endkunde | `/kunden/weinberger-ag` |
| **Wizard** | Endkunde (Web-Intake auf Website) | Eingebettet in Website |
| **Voice/Lisa** | Anrufer (Endkunde oder Prospect-Test) | Telefonanruf |
| **SMS** | Anrufer (nach Gespraech) | Post-Call SMS |
| **E-Mail (Betrieb)** | Prospect / Disponentin | Case-Notification, Trial-Mails |
| **E-Mail (Caller)** | Anrufer (Bestaetigung) | Reporter-Confirmation (Zielbild) |
| **Leitstand** | Prospect / Disponentin | `/ops/cases` |
| **Welcome Page** | Prospect (erster Besuch) | `/ops/welcome` |
| **Telegram Ops** | Founder (intern) | Morning Report, Lifecycle Alerts |

---

## 4. Konsistenzregeln

7 harte Regeln. Jede ist testbar — ein konkreter Verstoss ist benennbar.

### R1: Ein Name, eine Quelle

> `display_name` hat genau eine Quelle: `tenants.name` in Supabase.
> Jede Oberflaeche, die den Firmennamen zeigt, liest direkt oder transitiv aus diesem Feld.
> Die TypeScript CustomerSite Registry MUSS `companyName` identisch zu `tenants.name` fuehren.

**Verstoss-Beispiel:** Website zeigt "Doerfler AG", DB hat "Doerfler Haustechnik AG".
**Pruefung:** `CustomerSite.companyName === tenants.name` fuer jeden aktiven Tenant.

### R2: Kategorien identisch ueber alle Intake-Oberflaechen

> `services[]` auf Website, `categories[]` im Wizard und `categories[]` im Voice-Agent MUESSEN aus derselben Quelle stammen und identisch sein.
> Keine Oberflaeche darf Kategorien anzeigen, die eine andere nicht kennt.

**Verstoss-Beispiel:** Voice-Agent bietet "Spenglerei" an, Wizard hat nur "Sanitaer, Heizung, Boiler".
**Pruefung:** Diff zwischen Website-Services, Wizard-Options und Agent-Kategorien pro Tenant.

### R3: PLZ-Einzugsgebiet einheitlich

> `service_area_plz[]` ist ein Array in der Tenant-Config. Sowohl Voice (SS6.2 PLZ-Check) als auch Wizard (PLZ-Validation) und Post-Call-Check validieren gegen dasselbe Array.
> Kein eigenes PLZ-Set pro Oberflaeche.

**Verstoss-Beispiel:** Voice-Agent akzeptiert PLZ 8805, Wizard lehnt 8805 ab.
**Pruefung:** PLZ-Array im Agent-JSON vs Wizard-Config vs Supabase.

### R4: FlowSight unsichtbar im Betriebskontext

> Auf allen Oberflaechen, die der Prospect oder Betrieb sieht, erscheint der Tenant — nicht FlowSight.
> Ausnahme: E-Mail-Sender (`{display_name} via FlowSight`) und rechtliche Dokumente.

**Erlaubt:** "Jul. Weinberger AG via FlowSight" als E-Mail-Absender.
**Verboten:** "FlowSight" im Browser-Tab, "FS" als Sidebar-Logo, "FlowSight Trial" auf Welcome Page.
**Pruefung:** String-Suche nach "FlowSight" in allen Prospect-sichtbaren UI-Elementen.

### R5: `short_name` nur wo Platz fehlt

> `short_name` wird NUR verwendet wo technische Laengenbeschraenkungen gelten:
> - SMS-Absender (max ~11 Zeichen)
> - Browser-Tab-Titel (Lesbarkeitslimit)
> - Telegram Ops Alerts (Kompaktheit)
>
> Ueberall sonst gilt `display_name`.

**Verstoss-Beispiel:** Welcome Page zeigt "Weinberger" statt "Jul. Weinberger AG".
**Pruefung:** Alle Oberflaechen in der Matrix checken: wird `short_name` nur dort verwendet, wo markiert?

### R6: Keine Halluzination von Tenant-Daten

> Lisa und der Wizard duerfen nur Informationen verwenden, die in der Tenant-Config stehen.
> Keine Ableitungen, keine Schaetzungen, keine Annahmen ueber Oeffnungszeiten, Preise oder Team-Groesse.
> Quelle: voice.md SS8.2 Halluzinationsverbot.

**Verstoss-Beispiel:** Lisa sagt "Wir sind von 8 bis 17 Uhr erreichbar", aber `hours` ist nicht konfiguriert.
**Pruefung:** Jede Aussage im Agent-Prompt gegen vorhandene Config-Felder matchen.

### R7: Slug als systemweiter Identifier

> `slug` ist der einzige Identifier, der ueber alle Systeme hinweg gleich ist:
> Supabase, CustomerSite Registry, Agent-JSON-Prefix, URL-Pfad, docs/customers/{slug}/.
> Ein Tenant hat genau einen Slug. Ein Slug zeigt auf genau einen Tenant.

**Verstoss-Beispiel:** DB hat slug `brunner-haustechnik`, Agent-JSON heisst `brunner_agent.json`, URL ist `/kunden/brunner-ht`.
**Pruefung:** Slug-Konsistenz ueber alle Systeme pruefen (DB, Registry, Agent-Prefix, URL, Docs-Ordner).

---

## 5. Entscheidungen

Entscheidungen, die in diesem Dokument getroffen werden. Gelten ab sofort.

### E1: `display_name` vs `short_name` — Zuordnung

| Kontext | Feld | Beispiel |
|---------|------|---------|
| Website (Hero, Nav, Footer) | `display_name` | Jul. Weinberger AG |
| Voice Greeting | `display_name` | ...von der Weinberger AG |
| Leitstand Sidebar | `display_name` | Jul. Weinberger AG |
| E-Mail Subject / Sender | `display_name` | Jul. Weinberger AG via FlowSight |
| Welcome Page | `display_name` | Jul. Weinberger AG |
| SMS Absender | `short_name` | Weinberger |
| Browser-Tab | `short_name` | Weinberger OPS |
| Telegram Alert | `short_name` | Weinberger |
| Vertrag, Impressum | `legal_name` | Jul. Weinberger AG |

**Sonderfall Voice Greeting:** Lisa sagt den Firmennamen so, wie ein Anrufer ihn erwartet. Fuer Weinberger: "Weinberger AG" (ohne "Jul."). Fuer Doerfler: "Doerfler AG". Das ist NICHT `short_name` (zu kurz) und nicht immer `display_name` (kann zu formell sein). Deshalb: Voice Greeting verwendet ein **gesprochenes Muster**, abgeleitet aus `display_name` durch manuelles Kuerzen der Rechtsform-Praefixe im Onboarding.

### E2: `short_name` Regeln

- Max 15 Zeichen (SMS-Absender-Limit)
- Rechtsform weglassen (kein "AG", "GmbH")
- Keine Leerzeichen wenn >11 Zeichen (SMS-Kompatibilitaet)
- Wird bei Onboarding gesetzt und gilt danach fuer alle Oberflaechen

| display_name | short_name | Begruendung |
|-------------|-----------|-------------|
| Jul. Weinberger AG | Weinberger | Rechtsform + Praefix weg |
| Doerfler AG | Doerfler | Rechtsform weg |
| Brunner Haustechnik AG | BrunnerHT | Zu lang → Abkuerzung, kein Leerzeichen |
| Widmer Sanitaer | Widmer | Fachbezeichnung weg |

### E3: Brand Color — eine Farbe pro Tenant

- Jeder Tenant hat genau eine `brand_color` (Hex).
- Wird auf Website (Akzent, Nav, CTA) und Wizard (Akzent) verwendet.
- Leitstand: Neutral (FlowSight-Palette) im MVP, Tenant-Akzent als Zielbild (leitstand.md SS8).
- Kein Farbpaletten-Generator, keine automatische Logo-Ableitung im MVP.
- Quelle heute: CustomerSite Registry. Migrationsziel: Supabase.

### E4: E-Mail-Absender-Pattern

- **Sender-Name:** `{display_name} via FlowSight`
- **From-Adresse:** `noreply@send.flowsight.ch` (unveraendert, Domain-Constraint)
- **Reply-To:** `{contact_email}` des Tenants
- "via FlowSight" bleibt — es ist die einzige erlaubte Stelle, wo FlowSight fuer den Betrieb sichtbar wird. Der Grund: E-Mail-Zustellbarkeit (verifizierte Domain).

### E5: Duale SSOT — Uebergangsregel

**IST:** Tenant-Identitaet lebt an zwei Orten:
1. **Supabase `tenants`-Tabelle** — Runtime (Dashboard, SMS, Trial-Lifecycle, Welcome)
2. **TypeScript CustomerSite Registry** — Build-Time (Website, Service-Grid, Reviews)

**Zielbild:** Supabase als alleinige SSOT. CustomerSite Registry liest bei Build aus Supabase.

**Uebergangsregel (gilt jetzt):**
- Bei jedem Tenant-Update MUESSEN beide Quellen synchron aktualisiert werden.
- `provision_trial.mjs` ist verantwortlich fuer initiale Synchronisation bei Onboarding.
- Pruefung: R1 (Name identisch), R2 (Kategorien identisch), R7 (Slug identisch).
- Wenn Konflikt: Supabase gewinnt (Runtime-Daten sind aktueller als Build-Time-Code).

### E6: Voice Greeting — kein statischer Template-Text

Das Greeting ist der erste Eindruck. Es muss natuerlich klingen, nicht generiert.

**Regel:** Jeder Tenant bekommt bei Onboarding ein **manuell formuliertes Greeting**, das auf `display_name` basiert aber sprachlich angepasst wird. Kein starrer Template-String.

| Tenant | Greeting |
|--------|---------|
| Weinberger | "Gruezi, hier ist Lisa von der Weinberger AG — schoen, dass Sie anrufen." |
| Doerfler | "Guten Tag, hier ist der Sanitaer- und Heizungsdienst der Doerfler AG." |
| Brunner | "Gruezi, Brunner Haustechnik, mein Name ist Lisa." |

Das Greeting wird als `greeting_text` in der Tenant-Config gespeichert (nicht aus Feldern zusammengebaut).

---

## 6. Offene Punkte

Bewusst offen gelassen. Wird in den jeweiligen Straengen entschieden.

| # | Frage | Wo entscheiden | Warum nicht hier |
|---|-------|---------------|-----------------|
| O1 | Case-ID-Prefix (z.B. WA-0001 statt FS-0001) | Leitstand-Implementierung | Erfordert DB-Migration + UI-Aenderung. Architekturentscheidung, nicht Identity. leitstand.md SS8 hat das Zielbild bereits definiert. |
| O2 | Accent Color im Leitstand (Amber vs Tenant-Farbe) | Leitstand-Implementierung | leitstand.md SS11 #1 hat die Optionen definiert. UX-Entscheidung. |
| O3 | ICS/Kalender-Integration | Nicht im MVP-Scope | plan.md Anti-Drift schliesst Kalender-Sync aus. |
| O4 | Logo-Upload pro Tenant | Nicht im MVP-Scope | Initialen reichen. Logo ist Nice-to-have fuer spaeter. |
| O5 | Automatische Brand-Color-Erkennung aus Website | Nicht im MVP-Scope | Manuelle Setzung bei Onboarding reicht fuer <10 Tenants. |
| O6 | `voice_config` Migration nach Supabase JSONB | Voice-Implementierung | voice.md SS8.3 definiert das Schema. Timing ist Implementierungsentscheidung. |
| O7 | Wizard-spezifische Konfigurationsfelder | Wizard-Zielbild | Erst mit wizard.md wird klar, welche Felder der Wizard braucht, die noch nicht in der Tenant-Config stehen. |

---

## 7. Pruef-Checkliste (bei jedem neuen Tenant)

Beim Onboarding oder bei jeder Aenderung an Tenant-Daten:

- [ ] `display_name` in Supabase == `companyName` in CustomerSite Registry
- [ ] `short_name` in Supabase == `sms_sender_name` in modules
- [ ] `short_name` max 15 Zeichen, keine Rechtsform
- [ ] `slug` identisch in: Supabase, Registry, Agent-JSON-Prefix, URL, docs/customers/
- [ ] `services[]` identisch auf: Website, Wizard-Dropdown, Voice-Agent-Kategorien
- [ ] `service_area_plz[]` identisch in: Voice-Agent, Wizard-Validation, Post-Call-Check
- [ ] `brand_color` gesetzt in Registry (Hex, keine Named Colors)
- [ ] `voice_number` korrekt in: Website CTA, Welcome Page, SMS-Config
- [ ] `greeting_text` manuell formuliert und in Agent-Config eingetragen
- [ ] Kein "FlowSight" in Prospect-sichtbaren UI-Elementen (ausser E-Mail-Sender)
