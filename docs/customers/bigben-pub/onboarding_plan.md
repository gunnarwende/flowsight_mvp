# BigBen Pub — Onboarding-Plan (Erster Kunde)

**Datum:** 2026-04-14
**Owner:** CC + Founder
**Kunde:** Paul (BigBen Pub, Oberrieden)
**Status:** Founder-Go erteilt. Erster zahlender Kunde. Barter-Deal: Freidrinks + Food (~CHF 300/Mo Wert, 3 Jahre).
**Deadline:** Naechstes Treffen mit Paul (Datum TBD)

---

## Was dieses Onboarding besonders macht

1. **Erster Kunde ueberhaupt** → alles was wir hier lernen, wird zum Standard
2. **Erste Nicht-Sanitaer-Branche** → beweist Branchen-Flexibilitaet
3. **Event-Management = neues Produkt-Feature** → existiert noch nicht im System
4. **Paul kennt uns persoenlich** → weniger Sales-Reibung, mehr Ehrlichkeit im Feedback
5. **Im Dorf** → spricht sich sofort rum ("Paul hat eine App fuer sein Pub")

---

## Lessons-Learned-Protokoll (wird laufend ergaenzt)

> Jede Entscheidung, jeder Fehler, jede Ueberraschung wird hier dokumentiert.
> Ziel: Beim zweiten Gastro-Kunden geht alles doppelt so schnell.

| # | Datum | Erkenntnis | Konsequenz |
|---|-------|-----------|-----------|
| L1 | 14.04. | Erster Kunde = Barter, nicht Cash. Funktioniert bei persoenlicher Beziehung. | Barter-Modell als Option fuer Referenz-Kunden dokumentieren. |
| L2 | 14.04. | Gastro braucht Event-Management. Sanitaer nicht. Feature muss modular sein. | pub_events Tabelle = tenant-scoped, nicht global. |
| L3 | 14.04. | Paul ist faul → Pflege MUSS auf dem Handy passieren, maximal 3 Taps. | Event-Formular: Titel + Datum + Kategorie. Fertig. Kein CMS. |
| | | | |

---

## Gesamtplan (4 Phasen, parallel zum Founder-Scriptwork)

### Phase 1: Infrastruktur (Tag 1-2)

**1.1 Supabase: Events-Tabelle**

```sql
CREATE TABLE pub_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  category TEXT NOT NULL CHECK (category IN ('sport', 'event')),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  end_time TIME,
  recurring TEXT CHECK (recurring IN ('weekly', 'biweekly', 'monthly', NULL)),
  recurring_day INTEGER, -- 0=Sun, 1=Mon, ..., 6=Sat (for recurring events)
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: tenant-scoped
ALTER TABLE pub_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON pub_events
  USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

**1.2 Supabase: Reservierungen-Tabelle**

```sql
CREATE TABLE pub_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  guest_email TEXT,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  party_size INTEGER NOT NULL DEFAULT 2,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled')),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pub_reservations ENABLE ROW LEVEL SECURITY;
```

**1.3 Tenant-Setup**

- BigBen Pub ist bereits als Tenant vorhanden (Demo-Status)
- Status aendern: DEMO → LIVE
- Module aktivieren: voice, ops, reviews, sms + NEU: events, reservations
- notification_email setzen (Pauls E-Mail)
- OTP-Zugang fuer Paul erstellen

### Phase 2: Event-Pflege-App (Tag 2-3)

**2.1 Neue Leitsystem-Seite: `/ops/events`**

Paul oeffnet seine App → sieht 2 Tabs: "Sport" + "Events"

```
SPORT-TAB:
  [+ Neues Spiel]
  ---
  Sa 19.04. 17:30  Premier League: Arsenal vs. Chelsea    🗑️
  So 20.04. 14:00  Rugby: England vs. Ireland             🗑️
  Mi 23.04. 21:00  Champions League: Halbfinale           🗑️

EVENTS-TAB:
  [+ Neues Event]
  ---
  Mi 16.04.  Quiz Night (wöchentlich)                     🗑️
  Fr 18.04.  Karaoke Night (wöchentlich)                  🗑️
  Sa 19.04.  Live Music: The Dublin Boys                  🗑️
```

**"+ Neues Spiel/Event" Button:**
- Titel (Pflicht)
- Datum (Pflicht) — Date-Picker
- Uhrzeit (Optional) — Time-Picker
- Beschreibung (Optional) — 1 Zeile
- Wiederkehrend? (Toggle: woechentlich/einmalig)
- Speichern → sofort in DB → Website aktualisiert sich

**Maximal 3 Taps fuer ein neues Event:** [+] → Titel tippen → Datum waehlen → Speichern.

**2.2 Reservierungen-Ansicht: `/ops/reservations`**

Paul sieht eingehende Reservierungen:

```
HEUTE (Sa 19.04.):
  ✅ 18:00  Markus K. · 4 Pers.  "Geburtstag"
  ⏳ 19:30  Sarah L.  · 2 Pers.
  ⏳ 20:00  Tim W.    · 6 Pers.  "Quiz Night table"

[✅ Bestätigen]  [❌ Ablehnen]
```

Bei Bestaetigung: SMS an Gast ("Your table at BigBen Pub is confirmed for 19:30!")
Bei Ablehnung: SMS an Gast ("Sorry, we're fully booked. Try calling us at...")

### Phase 3: Voice Agent (Tag 3-4)

**3.1 Agent-Konfiguration**

- **Sprache:** Englisch (Default)
- **Stimme:** Retell English voice (maennlich, warm, British accent ideal)
- **Sprachgate:** EN → DE/FR/IT Transfer (wie bei Sanitaer-Agents)
- **Persona:** "Hi, this is BigBen Pub, Oberrieden. How can I help you?"

**3.2 Use Cases (Prompt-Design)**

| Use Case | Beispiel | Agent-Verhalten |
|----------|---------|----------------|
| **Reservierung** | "Table for 4, Saturday 7pm" | Nimmt auf: Name, Telefon, Datum, Zeit, Personen → DB + SMS an Paul |
| **Events heute** | "What's on tonight?" | Liest aus pub_events (heutiges Datum) → antwortet |
| **Events diese Woche** | "Any live music this week?" | Liest pub_events (naechste 7 Tage, category=event) → antwortet |
| **Sport** | "Is there a match on Saturday?" | Liest pub_events (category=sport) → antwortet |
| **Oeffnungszeiten** | "What time do you open?" | Aus Prompt (hardcoded) |
| **Speisekarte** | "Do you have food?" | "Yes! We serve proper pub food — burgers, wings, fish & chips. Check our menu on the website." |
| **Standort** | "Where are you?" | "We're at [Adresse], Oberrieden, right by the lake." |
| **Preise** | "How much is a Guinness?" | Deflect: "Our drinks start at CHF 5 — best to check at the bar!" |
| **Sprachswitch** | "Sprechen Sie Deutsch?" | Transfer zu DE-Agent |

**3.3 Retell-Setup**

- Neues Agent-Paar: bigben-pub_agent.json (EN) + bigben-pub_agent_de.json (DE)
- Webhook: /api/retell/webhook (gleicher wie Sanitaer, tenant-routed)
- Twilio-Nummer: Neue Schweizer Nummer fuer BigBen
- retell_sync.mjs → publish

**3.4 Event-Daten im Voice Agent**

Der Agent braucht AKTUELLE Event-Daten. Loesung:
- Webhook enrichment: Wenn Agent nach Events gefragt wird → API-Call an /api/bigben-pub/events → aktuelle Events aus DB
- ODER: Agent-Prompt wird taeglich aktualisiert (Cron) mit den naechsten 7 Tagen Events
- Empfehlung: **Taeglich aktualisierter Prompt** (einfacher, zuverlaessiger als Live-API im Call)

### Phase 4: Website dynamisch + Reservierung E2E (Tag 4-5)

**4.1 Events auf der Website dynamisch laden**

Aktuell: Events sind hardcoded in BigBenContent.tsx
Neu: Events kommen aus Supabase via API-Route

```
/api/bigben-pub/events → GET → aktuelle + kommende Events aus pub_events
```

Website-Darstellung:
- **Desktop:** 2 Spalten nebeneinander (Sport links, Events rechts)
- **Mobile:** Sport oben, Events unten
- Nur zukuenftige Events anzeigen (vergangene automatisch ausblenden)
- Wiederkehrende Events: naechstes Datum berechnen

**4.2 Reservierungs-API**

```
POST /api/bigben-pub/reserve
  → Speichert in pub_reservations (status=pending)
  → Push-Notification an Paul
  → SMS an Paul: "Neue Reservierung: {name}, {datum} {zeit}, {personen} Pers."
  → Response an Gast: "Your reservation request has been received. We'll confirm shortly!"

PATCH /api/ops/reservations/[id]
  → Paul bestaetigt/ablehnt
  → SMS an Gast: "Confirmed!" / "Sorry, fully booked."
```

**4.3 Website Redesign (kennedys.ch Richtung)**

Aenderungen an BigBenContent.tsx:
- Dunkleres Farbschema (Holz/Braun statt helles Beige)
- Events-Section: 2-Spalten (Sport | Events) mit Datumsanzeige
- Reservierungs-CTA prominenter
- Menu als eigene Section (nicht nur Text)
- Gallery groesser
- Insgesamt waermer, Pub-atmosphaerischer

---

## Checkliste vor Treffen mit Paul

- [ ] Events-Tabelle in Supabase erstellt
- [ ] Event-Pflege (/ops/events) funktioniert auf dem Handy
- [ ] 5-10 Test-Events eingetragen (Sport + Events der naechsten 2 Wochen)
- [ ] Voice Agent (EN) antwortet auf "What's on tonight?"
- [ ] Reservierungs-Flow funktioniert E2E (Form → DB → SMS an Paul)
- [ ] Website zeigt Events dynamisch (nicht mehr hardcoded)
- [ ] Paul hat OTP-Zugang (Login per E-Mail-Code)
- [ ] PWA installierbar auf Pauls Handy

---

## Risiken + Gegenmassnahmen

| Risiko | Wahrscheinlichkeit | Gegenmassnahme |
|--------|-------------------|---------------|
| Paul pflegt Events nicht regelmaessig | HOCH (Paul ist faul) | Event-Pflege maximal vereinfachen: 3 Taps. Wiederkehrende Events (Quiz=Mi, Karaoke=Fr) einmal anlegen, dann laeuft es. |
| Voice Agent versteht Schweizer Akzent schlecht | MITTEL | Retell EN-Agent auf "international English" einstellen, nicht British-strict. Schweizer sprechen "Swiss English". |
| Reservierungs-No-Shows | MITTEL | Bestaetigungs-SMS mit "Reply CANCEL to cancel". Paul sieht No-Show-Rate in der App. |
| Sport-Events aendern sich kurzfristig (Verlegung, Absage) | HOCH | Paul muss einzelne Sport-Events loeschen/aendern koennen. App braucht Edit + Delete. |
| Gaeste erwarten sofortige Reservierungs-Bestaetigung | MITTEL | SMS an Gast: "Received! Paul will confirm within 30 minutes." Nicht "confirmed" — erst nach Paul-Approval. |

---

## Definition of Done (Wann ist Paul LIVE?)

| # | Kriterium | Check |
|---|----------|-------|
| 1 | Paul kann Events auf dem Handy pflegen (Sport + Events getrennt) | |
| 2 | Website zeigt aktuelle Events dynamisch | |
| 3 | Voice Agent beantwortet "What's on tonight?" korrekt | |
| 4 | Reservierung E2E funktioniert (Form → Paul-SMS → Gast-SMS) | |
| 5 | Paul hat seine App auf dem Homescreen (PWA) | |
| 6 | 10+ Events fuer die naechsten 2 Wochen eingetragen | |
| 7 | Paul sagt: "Das ist genau was ich brauche" | |
