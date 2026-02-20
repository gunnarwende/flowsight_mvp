# Mobile QA Runbook (30min)

**Ziel:** Manueller Test auf Smartphone (iOS + Android), nur Go-Live-Blocker fixen.
**Scope:** /ops/cases Workflow (list → detail → edit → save → ICS → attachments).

## Voraussetzungen

- Smartphone mit aktuellem Browser (Safari iOS / Chrome Android)
- Bestehender Ops-Login (Magic Link via Desktop holen, Link auf Phone öffnen)
- Mindestens 1 Case in Supabase (wizard oder voice)

## Test-Steps

### 1. Login (2min)
- [ ] /ops/login öffnen → Magic Link anfordern → E-Mail auf Phone öffnen → Link klicken
- [ ] Redirect zu /ops/cases (authentifiziert)
- **Erwartung:** Login funktioniert, keine Layout-Brüche

### 2. Cases Liste (3min)
- [ ] /ops/cases: Liste lädt, Cases sichtbar
- [ ] Filter-Chips (Status/Urgency) antippen → Liste filtert korrekt
- [ ] Case antippen → navigiert zu Detail
- **Erwartung:** Chips klickbar, kein Overflow, Text lesbar

### 3. Case Detail (5min)
- [ ] Alle Felder sichtbar (scrollbar): Status, Assignee, Scheduled, Notes, Kontaktdaten
- [ ] Felder sind nicht abgeschnitten oder überlappend
- [ ] Beschreibung/Notes vollständig lesbar
- **Erwartung:** Responsive Layout, kein horizontaler Scroll

### 4. Edit + Save (5min)
- [ ] Status-Dropdown ändern → "Speichern" Button wird aktiv
- [ ] Assignee-Text eingeben (Tastatur öffnet sich korrekt)
- [ ] scheduled_at Datum wählen (datetime-local Picker funktioniert)
- [ ] Internal Notes eingeben (Textarea scrollt korrekt)
- [ ] "Speichern" antippen → Erfolgsmeldung, Felder persistiert
- [ ] Dirty-State Guard: Felder ändern → "Zurück" versuchen → Warnung erscheint
- **Erwartung:** Alle Inputs touch-freundlich, Save funktioniert, Guard aktiv

### 5. ICS Invite (3min)
- [ ] scheduled_at setzen + speichern
- [ ] "Termin senden" Button aktiv (nicht disabled)
- [ ] "Termin senden" antippen → Erfolgsmeldung
- [ ] E-Mail-Postfach prüfen: ICS Invite angekommen, Outlook/Apple Calendar öffnet korrekt
- **Erwartung:** Button-Grösse touch-freundlich, Invite funktioniert

### 6. Attachments (5min)
- [ ] Attachments-Section sichtbar im Case Detail
- [ ] "Datei hochladen" antippen → Phone-Kamera/Galerie öffnet sich
- [ ] Foto auswählen → Upload startet → Datei erscheint in Liste
- [ ] Datei antippen → Download / Preview funktioniert (signed URL)
- **Erwartung:** Upload von Phone-Kamera funktioniert, Liste aktualisiert sich

### 7. Navigation (2min)
- [ ] Zurück-Navigation (Browser Back / App Back) funktioniert
- [ ] Logout funktioniert
- [ ] Deep Link aus E-Mail öffnen → Login → richtiger Case
- **Erwartung:** Keine Sackgassen, Deep Links funktionieren

## DoD (Definition of Done)

**Mobile QA = PASS wenn:**
- Alle Steps oben ohne Blocker durchlaufen (minor Kosmetik = ok, Funktionsblocker = fail)
- Getestet auf mindestens 1x iOS (Safari) + 1x Android (Chrome)

**Evidence (kein Screenshot ins Repo nötig):**
- Notiz in STATUS.md: "Mobile QA PASS — iOS Safari + Android Chrome, [Datum]"
- Falls Blocker gefunden: Issue beschreiben, fix priorisieren vor Go-Live

## Bekannte Akzeptanz-Grenzen (kein Blocker)
- datetime-local Picker sieht auf iOS/Android unterschiedlich aus — ok
- Hobby Plan: kein Custom Domain — URL ist flowsight-mvp.vercel.app — ok
- File-Upload max size hängt von Supabase Free Tier ab (~50MB) — ok für Fotos
