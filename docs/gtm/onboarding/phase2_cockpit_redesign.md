# Phase 2 — Cockpit · Redesign v2 (verbindliche IA, 07.06.2026)

> **Founder-abgenommen 07.06.** (Skizze genickt). Dieses Doc ist die **verbindliche
> Bau-Vorlage** für den Cockpit-Umbau und ersetzt die flache 6-Schritt-Form aus
> `phase2_cockpit_structure.md` v1. Grund: das v1-Cockpit war ein *Formular*; v2 ist ein
> **sichtbares System, das man trainiert.** Begleitet `phase2_cockpit_manifest.md` (das „Was").

## Der Paradigmenwechsel (warum)
Der Betrieb soll nicht „Fragen ausfüllen", sondern **verstehen, dass er seinen Betrieb
optimiert**. Drei Träger:
1. **Leitsystem-Karte als Einstieg** — das geschlossene System wird bildlich.
2. **Output-Framing** — „Strang X **trainieren**", nicht „6/10 Fragen".
3. **Progressive Disclosure** — Klick auf Strang/Knoten → erst dann die Fragen (entzerrt Dichte).

## A · Einstieg = die Leitsystem-Karte
```
3 Eingangs-Stränge  →  ◆ IHR LEITSYSTEM (Brand-Icon + Firmenname)  →  Output
[🚪 Vor Ort]  [📞 Lisa/Voice]  [🌐 Website]         ↓
                                          📋 Fälle + ➡ Nächste Schritte (offen)
                                          [ An Gunnar zum Freischalten senden ]
```
- **Desktop:** volle Breite (Geräteweiche wie T2). **Handy:** vertikal gestapelt (Scrollen ok).
- **Icon trägt live Markenfarbe + Firmenname** → „das ist MEINS".
- Oben: Angst-Reducer — „Nichts ist live, bis Sie freigeben · Schweizer Datenschutz, keine
  Aufnahmen · jederzeit speicherbar · später änderbar."
- Fortschritt = **gewonnene Fähigkeiten** (Strang ✓ startklar), kein Fragenzähler.

## B · Die 3 Eingangs-Stränge (Klick → Detail-View, Progressive Disclosure)
1. **🚪 Vor Ort** — Fälle, die der Betrieb selbst erfasst. Dünn (1 Bestätigung).
2. **📞 Lisa / Voice** — der große Strang (Tiefe hier, Defaults sonst):
   - **Begrüssung-Default = der ECHTE T2-Wortlaut**: „Hallo, hier ist Lisa — die digitale
     Assistentin der <Firma>. Wie kann ich Ihnen helfen?" (+ KI-Hinweis darunter).
   - **„Das sagt Ihre Lisa"** — großes Auf-/Zuklapp-Symbol, **eine Karte offen zur Zeit**.
     Inhalt: Öffnungszeiten · Region · Leistungen · Notfall · Preis-Deflekt. **Mitgliedschaften raus.**
   - **Dispositionen mit INFO-WEG** (was bisher fehlte): jede Karte sagt, *wohin* es geht —
     Notfall → sofort **Push + E-Mail an [Inhaber]** (KEIN Live-Transfer, der ist MVP-raus);
     Nachricht/Rückruf → Liste **„Nachrichten"** (OC4) **+ optional E-Mail**.
   - **Pickup: 5 Stufen** sofort/10/15/20/30 Sek. → erzeugt **Telco-Weiterleitungs-Next-Step** (kein Lisa-Setting).
   - **Beweis-Loop** „Lisa jetzt anrufen".
3. **🌐 Website** — Kategorien **editierbar** (3 frei + 3 fix); Verteilung **nach Website-ja/nein**
   verzweigt (Embed-Anleitung intern vs. fertige Agentur-Mail; QR/Profil für website-lose Betriebe —
   **„einfacher Link verschicken" raus**); **Beweis-Loop** „Ihr Formular ansehen".

**Jeder Strang:** unten ein **Freitext-Feld „Ihre Hinweise an uns"** (fängt die 20 %, die nur er
kennt + Replikations-Daten) + Button „✓ Strang als startklar markieren".

## C · Der Leitsystem-Knoten (Klick aufs Icon) = alle Querschnitt-Einstellungen
Hierher gehört, was **nicht** „Strang" ist (löst „Look ≠ Mitarbeiter"):
- **Marke** (Farbe, Logo) · **Fall-Kürzel** (DA-0001)
- **Team & Rollen** — echte Staff (Name/Rolle/E-Mail); **Rollen sind implementiert** (admin sieht
  alles, techniker nur Zugewiesenes, adaptiver Toggle ab >2 MA).
- **Benachrichtigung** — `notification_email` · wann SMS / wann E-Mail / Push.
- **Bewertung** — Google-Link **+ „wo finde ich den?"-Helfer** · **großer Wirkungs-Hinweistext**
  (Außenspiegelung des Unternehmens) · SMS-Inhalt editierbar **mit Zeichenzähler + 160-Cap**
  (Default zeigen; Rückmeldungen = per-Tenant lernbar = Gold).

## D · Output + Freigabe
- Unter dem Icon: **„Ihre Fälle, sauber an einem Ort"** + **Nächste Schritte (offen)** als der
  sichtbare *Output* des Systems (Weiterleitung · Formular platzieren · Freigabe).
- **Freigabe-Schritt:** Admin-Login-E-Mail + **AVV**. ⚠️ **AVV = Rechtsthema, nicht Copy** —
  Mechanik (Doc anzeigen + Zustimmung mit Version/Zeitstempel protokollieren) baue ich;
  **Inhalt muss Schweizer Datenschutz-Anwalt** (revDSG, US-Subprozessoren Retell/OpenAI/Twilio).

## E · Profi-Ergänzungen (über das Founder-Feedback hinaus)
- **Beweis-Loop pro Strang** (nicht nur Lisa): Website-Vorschau, Test-Bewertungsseite.
- **Menschliche Notausstiegs-Tür**: „Kommen Sie nicht weiter? Schreiben Sie Gunnar direkt."
- **Notfall = emotionaler Peak** (verpasster Notruf = verlorener Auftrag + Ruf) → besonders solide zeigen.
- **Website-lose Betriebe**: Website-Strang adaptiert (QR/Profil statt Embed).

## Nicht-Ziele (bewusst)
Kein freies Herumklicken, das die Führung bricht (Karte = Orientierung **und** Fortschritt, ein
klarer Pfad bleibt). Keine Schritt-Aufblähung — Tiefe nur wo es zählt (Lisa).

## Backlog (nicht Teil des ersten Redesigns)
- Auto-Website-Crawl für Lisa-Wissen (Jobs etc.) **mit G11-Leitplanke** (keine Zusagen aus Web-Text).
- Test-Agent-Tuning (Greeting-Wortlaut/Modell — Founder-Befund „etwas verzerrt").
- Per-Tenant-SMS-Lernen aus Rückmeldungen.
