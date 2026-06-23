# FlowSight Bible — das Dach über allem

> Das **oberste** Dokument von FlowSight. Es bildet nicht das Produkt ab, sondern
> **das Geschäft als Ganzes** — und vor allem: **wie die Arbeit organisiert ist**,
> damit der Founder mehrere Themen parallel und ohne Qualitätsverlust bauen kann.
> Stand: **Phase-1-Gerüst** (Grundwahrheit + Karte; Tiefe folgt Modul für Modul).

---

## 0. Was dieses Dokument ist (und was nicht)

Es gibt drei oberste Dokumente — mit klar getrennten Rollen, **keine Dublette**:

| Dokument | Linse | Antwortet auf |
|---|---|---|
| **FlowSight Bible** (dies) | Geschäft als **Module** + Nordstern + Parallel-Arbeit | „Woran arbeite ich, wie hängt alles zusammen, wie baue ich parallel?" |
| [Customer Journey Bible](gtm/CUSTOMER_JOURNEY_BIBLE.md) | Der **Weg des Kunden** (8 Sterne) | „Wie läuft der Umsatzprozess von Kontakt bis Referenz?" |
| [business_briefing](business_briefing.md) | Executive One-Pager | „Was ist FlowSight in 5 Minuten?" |

Darunter die **Datei-Ebene**: [INDEX](INDEX.md) (wo liegt welche Datei) · [STATUS](STATUS.md) (Puls) · [ticketlist](ticketlist.md) (Aufgaben).
Die Bible ersetzt die nicht — sie steht **darüber** und zeigt auf sie.

---

## 1. Nordstern (Founder-Betriebsziel)

**Nicht** „den ersten zahlenden Kunden um jeden Preis." Sondern:

> **Ein solides, High-End-Fundament, dem ich zu 100 % vertraue — das mich in den
> täglichen Flow bringt: 20 Betriebe kontaktieren, 10 durch die Pipeline jagen,
> sukzessive aufgebaut.**

Der erste Kunde ist dann ein **Nebenprodukt** der Maschine, nicht das Ziel. Einen
Kunden mit einer schwachen Variante zu holen und dabei 20 zu verlieren, wäre nach
diesem Nordstern ein **Rückschritt**.

*(Abgrenzung: Der **Produkt**-Nordstern „vom Reagieren zum Steuern" — die Positionierung
gegenüber dem Kunden — lebt in der [Customer Journey Bible §1.1](gtm/CUSTOMER_JOURNEY_BIBLE.md).
Hier geht es um das **Betriebs**-Ziel des Founders.)*

---

## 2. Die Module (die flache Karte)

Gleichrangige Module. Eines (Customer Journey) hat eine innere Hierarchie (8 Sterne),
die anderen sind in sich geschlossen. Jedes Modul = **ein klarer Name, ein eigener
Datei-Bereich** → parallel bearbeitbar, ohne zu kollidieren.

| Modul | Zweck (1 Zeile) | Karte |
|---|---|---|
| **Customer Journey** | Der Kundenweg von Kontakt bis Referenz (8 Sterne) | [→](modules/customer_journey/_index.md) |
| **Betrieb** | Das Produkt im laufenden Betrieb: Lisa · Leitzentrale · Mail · Leitsystem | [→](modules/betrieb.md) |
| **Finanzen** | Einnahmen · Ausgaben · Pricing · Marge · Runway | [→](modules/finanzen.md) |
| **Infrastruktur** | Bauen & Ausliefern: Vercel · CI · Migrations · Secrets | [→](modules/infrastruktur.md) |
| **Compliance** | DSG · PII · Recording-OFF · Daten-Verarbeitung | [→](modules/compliance/_index.md) |
| **Recht** | Verträge · AGB · Haftung | [→](modules/recht.md) |
| **Monitoring** | Der Puls: morning-report · Sentry · Kennzahlen | [→](modules/monitoring.md) |
| **Marke** | Positionierung · Kategorie-Claim · Ton · Sprache | [→](modules/marke.md) |

---

## 3. Parallel arbeiten — die Mechanik

Verlust entsteht nie durch die Arbeit, sondern an **einer** Stelle: zwei Sessions
schreiben dieselbe Datei. Drei Regeln verhindern das:

1. **Disjunkte Dateien.** Jede Session besitzt ihren Datei-Bereich (steht je Modul-/
   Stern-Karte unter „Dateibereich"). Kein Überlapp → kein Konflikt.
2. **Nur EINE Session pflegt die gemeinsamen Manager-Dateien** (`STATUS.md`,
   `ticketlist.md`, diese Bible). Die anderen melden zurück, diese eine schreibt.
3. **Jede Session endet in ihrem eigenen PR** — das Review-Surface in der GitHub-App.

Start einer Session: **„Du bist Modul X."** Dann liest CC die Modul-Karte und weiß
Bereich, kanonische Quelle und nächsten Schritt.

---

## 4. Wie die Bible befüllt wird (Phasen)

- **Phase 1 (Gerüst — dieser Stand):** Apex + Modul-/Stern-Karten. Jede Karte zeigt
  auf die **bestehende kanonische Quelle** (SSOT bleibt, wo sie ist) und definiert
  den Dateibereich für Parallel-Arbeit. **Umräumen, nicht umschreiben.**
- **Phase 2 (Tiefe, pro Modul):** Inhalt nach und nach auf High-End ausbauen bzw.
  in die Modul-/Stern-Karte einarbeiten. Eigener PR je Modul. Der Stern-3-Pipeline-
  Neubau (Audio · Script · Loom · Screenflow) ist einer dieser Ströme.

**SSOT-Disziplin:** Solange eine Karte auf eine bestehende Bible zeigt, lebt die
Wahrheit dort — die Karte dupliziert nicht. Erst in Phase 2 wandert Inhalt um, und
dann verschwindet er an der Quelle.
