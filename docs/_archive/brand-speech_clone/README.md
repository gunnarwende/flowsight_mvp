# Voice Clone — Aufnahme-Anleitung

## Ziel

60 Minuten Gunnar-Stimme in maximaler Qualität und Bandbreite.
Daraus: ElevenLabs Professional Voice Clone für alle Prospect-Demos.

## Recording-Standard

| Parameter | Wert |
|-----------|------|
| **Mikro** | Rode USB+, ~20cm Abstand, leicht seitlich (nicht frontal = weniger Plosive) |
| **Format** | WAV, 48kHz, 16-bit, Mono |
| **Tool** | OBS Studio (Einstellungen → Ausgabe → Aufnahmeformat: WAV) |
| **Alternative** | Audacity (Aufnahme → Export als WAV) |
| **NICHT** | Loom, Voice Recorder App, MP3, oder sonstige komprimierende Formate |

## Setup-Checkliste (vor dem Start)

- [ ] Rode USB+ angeschlossen, als Standard-Eingabe eingestellt
- [ ] **Test:** 10 Sekunden aufnehmen → abhören → klar, kein Hall, kein Rauschen?
- [ ] **Pegel:** Beim normalen Sprechen soll der Pegel bei etwa -12 dB bis -6 dB liegen (gelber Bereich in OBS/Audacity). NICHT im roten Bereich.
- [ ] Raum: Fenster zu, Tür zu, kein Ventilator/Klima
- [ ] Handy auf stumm (nicht Vibration — stumm)
- [ ] Keine raschelnde Kleidung, kein Stuhl der knarrt
- [ ] Wasser griffbereit (NICHT kohlensäurehaltig — erzeugt Aufstossen)
- [ ] Bequem sitzen, Schultern locker, Arme nicht vor dem Körper verschränkt
- [ ] Alle 5 Script-Dateien geöffnet (block_a bis block_e)

## Aufnahme-Ablauf

**WICHTIG: Pro Block eine SEPARATE Datei.**

| # | Datei | Block | Dauer | Beschreibung |
|---|-------|-------|-------|-------------|
| 1 | `block_a.wav` | Natürlich Sprechen | ~12 Min | Frei erzählen, eigene Worte |
| 2 | `block_c.wav` | Emotionale Bandbreite | ~18 Min | Mikro-Gespräche, 8 Tonstufen |
| — | **PAUSE** | **15 Minuten** | — | **Aufstehen, Wasser, Dehnen** |
| 3 | `block_b.wav` | Scripts Vorlesen | ~10 Min | Ausgewählte Scripts, warm |
| 4 | `block_d.wav` | Domänen-Sätze | ~8 Min | Natürliche Sätze mit Fachvokabular |
| 5 | `block_e.wav` | Precision Pack | ~10 Min | Isolierte Begriffe + Satzkontext |

**Reihenfolge A → C → Pause → B → D → E ist Pflicht.**
A und C brauchen die frischeste Stimme (natürlich, emotional).
B/D/E sind strukturierter und vertragen leichte Ermüdung.

## Während der Aufnahme

- **Versprecher:** Kurz stoppen (2s), Satz nochmal von vorne. Aufnahme NICHT stoppen.
- **Räuspern/Husten:** Kurz warten, weiter. Ist OK — wird rausgeschnitten.
- **Pausen zwischen Abschnitten:** 3-5 Sekunden Stille. Hilft beim späteren Schneiden.
- **Tempo:** Natürlich. Nicht hetzen, nicht schleppen. So wie du einem Menschen gegenübersitzt.
- **Atmung:** Vor jedem neuen Absatz einmal bewusst einatmen. Erzeugt natürliche Pausen.

## Was "gut genug" bedeutet

Die Aufnahme ist gut genug wenn:
- Deine Stimme klingt wie DU, nicht wie eine Vorlesung
- Kein hörbarer Hall (Badezimmer-Effekt)
- Kein Grundrauschen (Lüfter, Strasse)
- Der Pegel ist konsistent (kein Flüstern → Schreien)
- Du klingst entspannt, nicht angestrengt

Die Aufnahme muss NICHT perfekt sein:
- Versprecher sind OK (werden rausgeschnitten)
- Kleine "ähms" sind OK (machen den Clone natürlicher)
- Nicht jeder Satz muss beim ersten Mal sitzen

## Nach der Aufnahme

5 Dateien ablegen:
```
docs/brand/speech_clone/
├── block_a.wav
├── block_b.wav
├── block_c.wav
├── block_d.wav
└── block_e.wav
```

Dann Claude Bescheid geben. Der Rest ist automatisch.
