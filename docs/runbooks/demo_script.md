# Demo-Skript: FlowSight 15-Min Remote Demo

**Zielgruppe:** Sanitär-/Heizungsbetriebe Schweiz (5–25 MA)
**Dauer:** 15 Minuten (Remote, Screen-Share)
**Demo-Firma:** Brunner Haustechnik AG (fiktiv, Thalwil)

---

## Vorbereitung (5 Min vorher)

### Browser-Tabs vorbereiten (in Reihenfolge)

1. **Tab 1:** `flowsight.ch` (FlowSight Marketing-Website)
2. **Tab 2:** `flowsight.ch/kunden/brunner-haustechnik` (Kunden-Website)
3. **Tab 3:** `flowsight.ch/brunner-haustechnik/meldung` (Wizard)
4. **Tab 4:** `flowsight.ch/ops/cases?tenant=brunner-haustechnik` (Dashboard, eingeloggt)
5. **Tab 5:** E-Mail-Postfach (für eingehende Notifications)

### Checkliste

- [ ] Telefon bereit (für Lisa-Anruf): **044 552 09 19**
- [ ] E-Mail-Postfach offen (Founder-Adresse)
- [ ] Dashboard zeigt Brunner-Cases (10 Seed Cases sichtbar)
- [ ] Screen-Share bereit, Notifications stumm
- [ ] Internet-Verbindung stabil

---

## Demo-Ablauf

### Min 0–1: Einstieg + Kunden-Website

> "Stellen Sie sich vor, Sie sind die Brunner Haustechnik AG in Thalwil. So sieht Ihre Website bei FlowSight aus."

**Zeigen:**
- Tab 2: `/kunden/brunner-haustechnik`
- Scrolle durch: Hero → Services → Notdienst-Banner → Reviews → Team → Einzugsgebiet
- **Highlight:** "Alles automatisch generiert aus Ihren Daten. Wir richten das für Sie ein."

### Min 1–3: Wizard live ausfüllen

> "Ein Kunde hat ein Problem und geht auf Ihre Website. So meldet er es."

**Zeigen:**
- Tab 3: `/brunner-haustechnik/meldung`
- Fülle live aus:
  - Kategorie: **Verstopfung**
  - Dringlichkeit: **Dringend**
  - Adresse: Seestrasse 42, 8800 Thalwil
  - Telefon: +41 79 000 00 00
  - E-Mail: demo@flowsight.ch
  - Beschreibung: "Abfluss in der Küche komplett verstopft, Wasser steht."
- **Submit** → Bestätigungsseite zeigen
- Tab 5: E-Mail zeigen → **"Schauen Sie — die E-Mail ist schon da."**

**Wow-Moment:** Echtzeit E-Mail-Benachrichtigung innert Sekunden.

### Min 3–5: Lisa anrufen (LIVE!)

> "Jetzt zeige ich Ihnen den zweiten Kanal. Die meisten Kunden rufen an — und da nimmt Lisa ab."

**Aktion:**
- Telefon nehmen, **044 552 09 19** anrufen (Lautsprecher an)
- Lisa meldet sich: "Guten Tag, hier ist Lisa — ich bin die digitale Assistentin von FlowSight."
- Beispiel-Fall durchspielen (Heizung ausgefallen, Kilchberg)
- Auflegen

> "Lisa nimmt 24/7 ab. Kein Anruf geht mehr verloren. Das ist der Gänsehaut-Moment."

**Wow-Moment:** Live-Telefonat mit KI-Assistentin.

### Min 5–8: Dashboard zeigen

> "Und wo landen diese Fälle? In Ihrem Dashboard."

**Zeigen:**
- Tab 4: `/ops/cases?tenant=brunner-haustechnik`
- **KPI-Kacheln** oben: Gesamt, Heute neu, In Bearbeitung, Erledigt (7 Tage)
- **Fälle-Liste:** Mix aus neuen, kontaktierten, geplanten und erledigten Fällen
- Klick auf einen Fall (z.B. den Notfall-Rohrbruch FS-0010):
  - **Timeline** rechts zeigen → "Jeder Schritt ist dokumentiert."
  - **Status ändern** → Kontaktiert → Speichern
  - **Termin setzen** → Datum wählen → "Der Kunde bekommt automatisch eine Terminbestätigung."

### Min 8–10: Review-Anfrage

> "Und nach getaner Arbeit? Holen Sie sich automatisch eine Google-Bewertung."

**Zeigen:**
- Erledigten Fall öffnen (z.B. FS-0001)
- **"Review anfragen"** Button klicken
- E-Mail zeigen (oder erklären): "Der Kunde bekommt eine freundliche E-Mail mit dem direkten Link zu Ihrem Google-Profil."

### Min 10–12: Fragen

> "Was sind Ihre ersten Gedanken? Wo sehen Sie den grössten Nutzen für Ihren Betrieb?"

- Aktiv zuhören
- Auf spezifische Bedenken eingehen
- Bei technischen Fragen: "Das richten wir für Sie ein — Sie müssen sich um nichts kümmern."

### Min 12–14: Preise + 30-Tage-Versprechen

> "Was kostet das?"

**Preise nennen:**
- **Starter:** CHF 390/Mt. (Website + Wizard + E-Mail)
- **Professional:** CHF 690/Mt. (+ Voice Agent Lisa)
- **Enterprise:** CHF 990/Mt. (+ Review Engine + Priority Support)

> "Und das Beste: Sie testen 30 Tage kostenlos. Kein Risiko. Wenn Sie nicht zufrieden sind, zahlen Sie nichts."

### Min 14–15: Close

> "Sollen wir das für Ihren Betrieb einrichten? Ich brauche nur Ihren Firmennamen, die Adresse und eine Telefonnummer — den Rest machen wir."

- **Nächster Schritt:** Onboarding-Termin vereinbaren (Cal.com / MS Bookings)
- Kontaktdaten austauschen
- Bedanken + verabschieden

---

## Fallback-Szenarien

### Lisa nimmt nicht ab / Fehler

> "Manchmal braucht die Leitung einen Moment. Das ist die Live-Telefonie — normalerweise klappt das innert 2 Sekunden."

- **Retry:** Nochmal anrufen
- **Plan B:** Recording abspielen (falls vorhanden) oder überspringen: "Im Normalbetrieb klappt das zuverlässig. Ich zeige Ihnen stattdessen das Dashboard."

### E-Mail kommt verzögert

> "Die E-Mail braucht manchmal 10–15 Sekunden. Das ist die Resend-API im Hintergrund."

- Kurz warten, ggf. Postfach refreshen
- **Plan B:** Screenshot einer früheren E-Mail zeigen

### Dashboard lädt langsam

- Seite refreshen
- Ggf. auf vorbereiteten Screenshot zurückgreifen

---

## Reset-Anleitung (vor nächster Demo)

Die 10 Seed Cases bleiben dauerhaft in der DB. Für einen sauberen Demo-State:

1. **Wizard-Test-Cases löschen:** Im Dashboard manuell archivieren (Status → Archiviert) oder via Supabase:
   ```sql
   UPDATE cases SET status = 'archived'
   WHERE tenant_id = 'd0000000-0000-0000-0000-000000000001'
     AND id NOT LIKE 'd1000000-0000-0000-0000-0000000000%';
   ```

2. **Seed Cases zurücksetzen** (falls Status geändert):
   ```sql
   UPDATE cases SET status = 'new' WHERE id = 'd1000000-0000-0000-0000-000000000009';
   UPDATE cases SET status = 'new' WHERE id = 'd1000000-0000-0000-0000-000000000010';
   UPDATE cases SET status = 'contacted' WHERE id = 'd1000000-0000-0000-0000-000000000007';
   UPDATE cases SET status = 'contacted' WHERE id = 'd1000000-0000-0000-0000-000000000008';
   UPDATE cases SET status = 'scheduled' WHERE id = 'd1000000-0000-0000-0000-000000000006';
   ```

3. **Browser-Tabs** neu laden

---

## Key Messages (Elevator-Pitch-Bausteine)

- "Kein Anruf geht mehr verloren — 24/7, auch am Wochenende."
- "Ihre Kunden sehen eine professionelle Website, nicht eine Baustelle."
- "Vom Anruf bis zur Google-Bewertung — alles in einem System."
- "30 Tage kostenlos testen. Kein Risiko."
- "Wir richten alles für Sie ein. Sie müssen nichts tun."
