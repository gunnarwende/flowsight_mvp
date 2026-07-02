# Hero — Audio-Schablone · Regie (Temp-Track aus den vorhandenen Schnipseln)

> **Zweck:** Aus den bestehenden Founder-Schnipseln (HERO-01…14 + CALL) EINE starke, sauber
> getaktete **Referenz-Schablone** bauen — Segment für Segment mit **dynamischen** Übergängen,
> menschlichem Ton-Fluss, ohne Klicks/Stop-Geräusche, ohne abgeschnittene Wort-Enden.
> **Sie ist Referenz, nicht Endprodukt** — die letzten Prozent Überzeugung über den Übergang kommen
> aus der echten Master-Neuaufnahme (Founder performt *gegen* diese Schablone).
>
> **Arbeitsteilung:** Diese Datei = Regie (Handy-CC). Umsetzung in ffmpeg = Laptop-CC. Founder hört → iterieren.

## Grundregeln (für JEDEN Schnitt — nicht verhandelbar)
1. **Keine festen Pausen.** Jede Lücke unten ist bewusst gewählt (aus dem Sinn) — kein 0,15s-Raster.
2. **Letzten Laut schützen.** Tail-Trim nur bis zum echten Sprech-Ende + kleiner natürlicher Ausklang; **nie** den Schluss-Konsonanten/Zischlaut wegschneiden („heiß" ≠ „hei").
3. **Klick/Stop raus.** Maus-/Stop-Klick am Take-Ende weg-gaten (Silence-Gate an den Kanten), aber Punkt 2 wahren.
4. **Atem behalten, wo er trägt.** Kurzer Einatmer vor einem gewichtigen Satz = menschlich → nicht wegschneiden; nur echtes Rauschen/Totstille raus.
5. **Loudness zum Schluss** (−16 LUFS / TP −1 dBTP) über den ganzen zusammengesetzten Track — nicht pro Schnipsel.

## Segment-für-Segment (COLD)

> **⚠️ Hook neu 2026-07-02:** Segmente 2–5 haben **neuen Wortlaut**, Segment „4B" ist **neu**. Die alten
> Schnipsel HERO-02/03/04/05 (alter Wortlaut) sind **überholt** → diese Regie führt die **Neuaufnahme**.

| # | Schnipsel / Wortlaut | Ton (wie es endet → wie's weitergeht) | Pause DAVOR | Pause DANACH | Schnitt-Notiz |
|---|---|---|---|---|---|
| 1 | **HERO-01** „…diesen Monat verloren haben?" | Echte Frage, direkt | — (Start) | **1,0s** | Frage-Intonation-Tail schützen; die Frage muss stechen |
| 2 | **HERO-02** „Ich hab grad versucht, Sie zu erreichen — keiner ist rangegangen." | Fakt, nüchtern; am „—" **ein Schlag** (aufs Klingeln lauschen), dann trocken | 0,4s | **0,8s** | die Mini-Pause im Satz (—) ist Pflicht; kein Vorwurf |
| 3 | **HERO-03** „Wenn das bei mir passiert, passiert's bei Ihren Kunden auch." | ruhig verallgemeinern; dreht auf *seinen* Betrieb | 0,4s | **0,6s** | bestimmt, nicht belehrend |
| 4 | **HERO-04** „So geht der Kunde lautlos zum Nächsten. Sie merken's nicht mal." | **leiser**, „lautlos" fast geflüstert; „merken's nicht mal" kalter Nachsatz | 0,5s | **1,2s** | *COLD-only*; die Wunde wirken lassen; End-„l" schützen |
| 4B | **HERO-04B** „Ab jetzt nicht mehr." | **Kipp-Punkt**: Resignation → ruhige Entschlossenheit | **1,0s** (Atem) | 0,5s | *COLD-only, neu*; Konter auf „merken's nicht mal", nicht laut |
| 5 | **HERO-05** „Schauen Sie selbst. Ein Kunde ruft grad wieder bei Ihnen an." | einladend, du trittst zurück und zeigst hin | 0,4s | → **KLINGELN** | danach NICHT direkt Lisa |
| — | **CALL-Block** (Klingeln — *ein vollständiges* → Lisa+Brunner) | menschlich: klingelt einmal ganz, *dann* abnehmen | — | **1,0s** (Anruf beendet) | Founder schweigt; **ein voller „Rrring"** (nicht abgeschnitten) = Pflicht — Kontrast zu „keiner ist rangegangen" |
| 6 | **HERO-06** „Ein vollständiger Auftrag. Angenommen, während Sie auf der Baustelle oder in einem Kundengespräch waren." | stiller Stolz, unterstated | — | **dynamisch** ↓ | **eigenes Snippet**; Pause danach = Dauer des Screen-Übergangs (Tipp→Detail→Scroll), fix erst mit gebautem Screen |
| 7 | **HERO-07** „Eingegangen, erfasst, schon bei Ihnen. Bevor Sie überhaupt davon wussten." | drei Beats leicht getaktet, „…davon wussten" weicher | **dynamisch** ↑ | **1,5s** | **eigenes Snippet** (getrennt von 06 → Pause dazwischen frei setzbar); danach Atem für die Rückkehr (Bookend) |
| 8 | **HERO-08** „Das ist Ihr echtes System — auf Ihren Namen." | Schluss beginnt: geerdet, warm | **1,2s** | 0,3s | Bookend-Rückkehr; betone „Ihr"/„auf Ihren Namen" |
| 9 | **HERO-09** „Und nicht nur Anrufe: … am selben Ort." | ruhig ergänzend | 0,3s | **0,5s** | ein Gedanke mit 08 (fließend) |
| 10 | **HERO-10** „Kein IT-Projekt — Sie steuern alles selbst." | Mauer runter | 0,5s | 0,35s | fließend (eine Bewegung) |
| 11 | **HERO-11** „Monatlich kündbar." | knapp, klar, ein Fakt | 0,35s | 0,4s | keine Angst |
| 12 | **HERO-12** „Das Risiko trage ich, nicht Sie." | ruhige Gewissheit | **0,5s** | **1,5s** ⭐ | kleine Pause davor; danach die **heilige** Pause |
| 13 | ⭐ **HERO-13** „Ich hab das gebaut, weil ich gesehen hab, … ohne es überhaupt zu merken. Genau wie Sie's bis eben nicht gemerkt haben." | **langsamer, leiser, persönlich** — der Lackmustest | **1,5s** (deutlich) | **1,0s** | NICHTS drängen; volle Wirkung |
| 14 | **HERO-14** „Wie viele Aufträge Sie ab jetzt noch verlieren? — Keinen. Und Sie sehen jeden einzelnen." | letztes Wort, **am langsamsten**; am „—" kurz halten, „Keinen." hart & einzeln | 1,0s | **2,0s** Stille | *neuer Bogen-Schluss*; Ende NICHT abschneiden; ausklingen lassen |

## WARM-Variante (nur der Kopf ändert)
Ersetze Segmente 1–4B durch **HERO-W1 → W2 → W3**, dann Segment 5 (HERO-05). **Kein HERO-04/04B** (COLD-only: Wunde + Turn).
Übergänge W1→W2→W3: warm, vertraut, **kein Hook/keine Wunde** — kleinere Pausen (~0,4–0,6s), W3 „Fangen wir an." leicht → Klingeln.
⚠️ **Offen:** WARM-Anschluss an das neue HERO-05 („Schauen Sie selbst …") — wird als Nächstes gelockt (Task „WARM-Variante").

## Iteration
Leppy rendert nach dieser Regie → Founder hört → Feinjustierung der Pausen-Werte/Trims hier eintragen → neu rendern. Die Zahlen oben sind **Startwerte** (aus dem Sinn), nicht heilig — das Ohr des Founders entscheidet final.
