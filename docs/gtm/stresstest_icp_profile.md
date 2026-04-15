# ICP Stresstest-Profile — Wiederverwendbares Asset

> **Zweck:** Fixe Referenz für Stresstests quer durch das gesamte System.
> Dieses Dokument wird NICHT regelmässig upgedated — es beschreibt stabile ICP-Realitäten.
> Bei jedem Stresstest (Kommunikation, Voice Agent, Leitsystem, Maschine) wird dieses Dokument als Input verwendet.

---

## Die 3 ICP-Profile

### Profil A: "Meier Sanitär" — 2-Mann-Betrieb

**Realität:**
- **Team:** Beat Meier (Chef, 58) + Lehrling Florian (19)
- **Büro:** Beat's Frau Vreni hilft morgens 2h mit Telefon + Buchhaltung
- **Tagesablauf:** Beat fährt um 07:00 los, 4-5 Einsätze/Tag, abends Offerten schreiben
- **Technik:** Beat hat ein Samsung Galaxy (3 Jahre alt), Florian ein iPhone. Kein Laptop auf der Baustelle.
- **Kommunikation:** Beat schaut Handy zwischen Einsätzen (~3x/Tag). Vreni checkt E-Mail morgens.
- **Schwachstelle:** Beat vergisst Rückrufe. Vreni hat keinen Zugang zum Leitsystem.
- **Notfälle:** Beat fährt selber hin, Florian bleibt auf der aktuellen Baustelle.

**Typischer Stress-Montag:**
- 07:00 — 2 Anrufe auf Anrufbeantworter vom Wochenende (1x Leck, 1x Heizung)
- 08:30 — Notfall: Rohrbruch in Thalwil, Wasser läuft
- 09:00-12:00 — Beat beim Notfall, Florian auf geplantem Einsatz
- 12:00 — 3 neue Meldungen im System (1 Voice, 2 Wizard)
- 14:00 — Bewertung vom Freitag: 2 Sterne ("Zu spät gekommen")
- 15:00 — Vreni meldet: "Da hat jemand 3x angerufen wegen Offerte"
- **Total:** 5-6 Fälle, 1 Notfall, 1 negative Bewertung

**Was Beat braucht:** Wenig Benachrichtigungen, nur das Wichtigste. Push nur bei Notfall + negativem Feedback. E-Mail-Flut = Tod (checkt Mail 1x abends).

---

### Profil B: "Brunner Haustechnik" — 15-Mann-Betrieb

**Realität:**
- **Team:** Thomas Brunner (GF, 45) + Sandra (Büro, 38) + 2 Teamleiter + 8 Techniker + 2 Lehrlinge + Lager
- **Büro:** Sandra nimmt Anrufe an, plant Einsätze, schreibt Offerten. Arbeitet 08:00-17:00.
- **Tagesablauf:** Sandra plant morgens die Einsätze, Thomas macht Kundenbesuche + Offerten
- **Technik:** Sandra hat Desktop + Firmen-Handy. Techniker haben Firmen-iPhones. Thomas hat MacBook + iPhone.
- **Kommunikation:** Sandra checkt Leitsystem alle 30min. Techniker checken Handy zwischen Einsätzen. Thomas checkt Mails 3x/Tag.
- **Schwachstelle:** Sandra ist Bottleneck — wenn sie krank ist, steht alles. Teamleiter haben keine Planungstools.
- **Notfälle:** Teamleiter entscheidet wer fährt. Nächsten Techniker umrouten.

**Typischer Stress-Montag:**
- 07:30 — Sandra öffnet Leitsystem: 8 neue Fälle vom Wochenende (3 Voice, 5 Wizard)
- 08:00-09:00 — 4 Anrufe kommen rein (1 Notfall Heizung ausgefallen)
- 09:00 — Sandra weist Fälle zu: 6 Techniker bekommen je 2-3 Einsätze
- 10:00 — 3 weitere Wizard-Meldungen
- 11:00 — Techniker meldet: "Kunde nicht da, vergebliche Anfahrt"
- 13:00 — 2 Bewertungen (1x 5★, 1x 3★)
- 14:00 — Notfall #2: Überschwemmung in Praxis
- 15:00 — Thomas fragt: "Wie sieht's aus mit den Bewertungen diese Woche?"
- 16:00 — 2 weitere Meldungen, 1 Terminverschiebung
- **Total:** 18 Fälle, 2-3 Notfälle, 5 Bewertungsanfragen, 2 Reviews rein

**Was Sandra braucht:** Klare Übersicht morgens, Push nur bei Notfall. Techniker brauchen nur IHRE Fälle als Push.
**Was Thomas braucht:** Wöchentliches Summary, Negativ-Alert sofort, sonst Ruhe.

---

### Profil C: "Leuthold AG" — 25-Mann-Betrieb

**Realität:**
- **Team:** Walter Leuthold (GF, 52) + 2 Büro-MA + 1 Teamleiter Sanitär + 1 Teamleiter Heizung + 15 Techniker + 3 Lehrlinge + 2 Lager/Logistik
- **Büro:** 2 MA teilen sich Telefon + Planung. Eine macht Sanitär, andere Heizung.
- **Tagesablauf:** Strukturiert — Morgen-Meeting 07:15, Einsatzplanung digital, Teamleiter koordinieren.
- **Technik:** Firmenlaptop für Büro, iPads für Teamleiter, iPhones für Techniker. WLAN auf dem Firmengelände.
- **Kommunikation:** Büro im Leitsystem den ganzen Tag. Teamleiter schauen alle 1-2h. Techniker 2-3x/Tag.
- **Schwachstelle:** Kommunikation zwischen Sanitär-Team und Heizung-Team. Doppelbuchungen.
- **Notfälle:** Dienstplan: je 1 Techniker pro Team ist "Notfall-Bereitschaft". Wechselt wöchentlich.

**Typischer Stress-Montag:**
- 07:15 — Morgen-Meeting: 12 geplante Einsätze, 5 offene Fälle vom Wochenende
- 07:30-09:00 — 8 Anrufe (2 Notfälle)
- 09:00 — Büro plant: 15 Techniker auf 20 Einsätze verteilen
- 10:00-12:00 — 10 weitere Meldungen (Mix Voice/Wizard/Manuell)
- 12:00 — 3 Bewertungsanfragen raus, 2 Terminverschiebungen
- 13:00 — Notfall #3: Gasgeruch → sofort raus
- 14:00 — 5 neue Bewertungen eingegangen (4x positiv, 1x negativ)
- 15:00 — Teamleiter Heizung: "Morgen sind 3 Techniker krank"
- 16:00 — 5 weitere Meldungen, Büro plant morgen
- **Total:** 35 Fälle, 3-5 Notfälle, 10 Bewertungsanfragen, 5 Reviews rein

**Was Büro braucht:** Digest statt Einzelmails. Push nur Notfall.
**Was Teamleiter braucht:** Sein Team sehen, Notfall in seinem Bereich.
**Was Walter braucht:** Dashboard 1x/Tag, Negativ-Alert sofort, Weekly Summary.

---

## Stresstest-Methodik

### Wie den Stresstest anwenden:

1. **Objekt wählen:** Was wird getestet? (Kommunikation, Voice Agent, Leitsystem-UI, Maschine Manifest, etc.)
2. **Profil wählen:** A (2-MA), B (15-MA), C (25-MA) — oder alle drei
3. **Stress-Montag durchspielen:** Für jede Person im Betrieb: Was passiert wann? Was sieht sie? Was verpasst sie? Was nervt sie?
4. **Reibungspunkte dokumentieren:** Jeder "Moment wo es hakt" wird als Problem notiert
5. **Fixes priorisieren:** Kritisch (Funktionsstörung) → Hoch (Noise) → Mittel (Ergonomie) → Niedrig (Nice-to-have)

### Stresstest-Checkliste (für jedes System/Feature):

- [ ] Profil A durchgespielt — Probleme notiert
- [ ] Profil B durchgespielt — Probleme notiert
- [ ] Profil C durchgespielt — Probleme notiert
- [ ] Probleme konsolidiert und priorisiert
- [ ] Top-3-Fixes identifiziert
- [ ] Fixes implementiert oder als Ticket erfasst

---

## Referenz: Schweizer Sanitär/Heizung Markt-Daten

- **Ø Betriebsgrösse CH:** 4.2 Mitarbeiter (suissetec Branchenstatistik)
- **Verteilung:** ~60% haben 1-5 MA, ~25% haben 6-20 MA, ~15% haben 20+ MA
- **Digitalisierungsgrad:** Tief. ~70% nutzen noch Papier-Rapporte.
- **Smartphone-Penetration Techniker:** ~95% haben Smartphone, aber nur ~30% nutzen eine Business-App
- **E-Mail-Nutzung:** Chef/Büro = täglich. Techniker = selten bis nie auf dem Handy.
- **Hauptkanal Techniker:** Telefon + WhatsApp-Gruppenchat (informell)
- **Hauptkanal Büro → Kunde:** Telefon + E-Mail
- **Notfall-Erwartung Endkunde:** Rückruf innerhalb 30 Minuten
