# Quality Gates pro Take — SoT (Stresstest-Lessons 01.06.2026)

**Zweck:** Jede Fehlerklasse, die der Founder im Review findet, wird ein automatischer
Gate → fängt sie beim nächsten Build selbst ab. Ziel: Founder muss NICHT mehr jedes
Video manuell prüfen. Verify-Prinzip: **am echten Frame** (accurate-seek `-ss` NACH `-i`),
mehrere Frames an Bewegungs-Stellen, Audio-INHALT (nicht nur Datei-Existenz).

Status: 📋 = Spec, noch nicht als Code-Gate implementiert.

---

## UNIVERSAL (alle Takes)
| # | Gate | Methode | Erwartet | Fängt |
|---|---|---|---|---|
| U1 | **Screenshot @0:00,0** | Frame-Crop vs per-Take-Referenz (SSIM ≥0.95) | korrekter Startscreen | 📋 Schieflage/Offset (Walter T2!) |
| U2 | Korrekter Tenant | OCR Sidebar/Header/Call-Name | tenant.name | 📋 falscher Betrieb |
| U3 | brand_color | Pixel-Sample Sidebar/Akzent | tenant.brand_color | 📋 falsche Farbe |
| U4 | Datum-Frische | OCR Datum entscheidende Frames | = heute / korrektes Demo-Datum | 📋 alte Daten |
| U5 | Gesamtdauer | ffprobe | = Schablonen-Dauer ±0,1s | 📋 Struktur-Drift |
| U6 | Dev-Badge weg | Pixel-Check unten-links | kein "Issues"-Badge | 📋 |

## T1 — Hero/Intro
| T1.1 | @0:00 Hero-Startframe | U1 | Hero-Layout | 📋 |
| T1.2 | Echte Website sichtbar (Modus-abh.) | Frame | korrekt | 📋 |

## T2 — Anruf + Leitsystem (Variante notruf/preis!)
| T2.1 | @0:00 = **Homescreen** | U1 | Samsung-Homescreen, NICHT mid-call | 📋 Walter-Offset |
| T2.2 | **Akku = 86** im Call | Crop Status-Bar @1:30 vs 86-Ref | 86 | ✅ Param-Wurzel gefixt; Gate 📋 |
| T2.3 | **Greeting-INHALT = Firmenname** | Greeting-Region (Slot) transkribieren (STT) ODER cross-correlate vs tenant agent_01.wav | sagt tenant.name | 📋 **Weinberger=Leins-Bug!** |
| T2.4 | **Variante korrekt** | call_proof_variante vs Call-Inhalt (notruf=Notfall / preis=Preisanfrage) | match | 📋 |
| T2.5 | **Phone-Sequenz-Timing** | Frames an Phasengrenzen: homescreen→call→ended→homescreen→**SMS-notif flattert rein**→SMS-thread→app-open | jede Phase @Schedule ±0,3s; SMS NICHT früh (Walter @3:35 zu früh!) | 📋 |
| T2.6 | **SMS-Reveal** | @~3:33 SMS-Notif über Homescreen (leicht verdeckt), NICHT Vollbild-SMS zu früh | wie Stark | 📋 Walter-SMS-Bug |
| T2.7 | **KPI-Belegung-Timing** | Frames @4:37/4:40/4:42,5/4:45,8: welcher KPI hervorgehoben | NEU→BEI UNS→ERLEDIGT→BEWERTUNG ±0,2s = Dörfler-Schablone | 📋 Walter-KPI |
| T2.8 | Leitsystem-Daten frisch | U4 @4:20 | heutige/letzte-Woche-Daten | 📋 |
| T2.9 | Loom-Face durchgehend | Frame-Check Loom-Kreis | vorhanden | 📋 |

## T3 — Wizard
| T3.1 | @0:00 Wizard Step 1 | U1 | korrekt | 📋 |
| T3.2 | Kategorie "Leck" klickbar/vorhanden | wizard categories = config | "Leck" da | ✅ (weinberger gefixt); Gate 📋 |
| T3.3 | Loom-Fallback ok | Frame | Loom sichtbar | 📋 |
| T3.4 | Leitsystem-Daten frisch (ab 1:44) | U4 | heutig | 📋 Stark-April-Bug |

## T4 — Lifecycle/Review
| T4.1 | @0:00 Fallliste | U1 | Liste | 📋 |
| T4.2 | **Reveal @11.0** | Frame @11.0 = Detail (nicht Liste) | Detail | ✅ Anker; Gate 📋 |
| T4.3 | **"Termin versenden"-Button @0:25** | Frame | Button sichtbar | 📋 (war Regression) |
| T4.4 | **Stern/Maus-Sync @1:13,5** | **Mehrere Frames 73,5–74,5**: Maus-Position vs Anzahl gefüllter Sterne | Maus führt Stern-Fill (±0,1s), wie Stark | 📋 **Walter-Bug noch offen!** |
| T4.5 | Akku = 71 (T4) | Crop Status-Bar | 71 | 📋 |
| T4.6 | Toast "Bewertung erhalten" | Frame | sichtbar | 📋 |
| T4.7 | Termin-Datum = morgen | OCR @0:25 | morgen, tenant-spezifisch | 📋 |

---

## NOCH OFFENE BUGS (01.06., nach meinem fehlerhaften "final")
- **T2 Weinberger:** Greeting = Leins (preis-Swap-Slot falsch — preis-Greeting-Position ≠ notruf [44–51]). MUSS: echte preis-Greeting-Position finden + per Ohr validieren.
- **T2 Walter:** Offset 0:00–36s + SMS-Sequenz kaputt (homescreen/SMS-Reveal-Timing). MUSS: Phone-Sequenz neu prüfen.
- **T4 Walter:** Stern/Maus-Sync passt noch nicht (mein Einzel-Frame-Check war unzureichend).

## Implementierung
Diese Gates als `scripts/_ops/qg_video.mjs --slug X --take N` (post-build, Exit≠0 bei Fail,
Finding-Report) + in build_takeN_final als letzter Schritt. Referenz-Crops aus Stark/Dörfler-Gold.
