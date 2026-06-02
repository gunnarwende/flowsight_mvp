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
| U1 | **Screenshot @0:00,0** | Frame-Crop Helligkeit/SSIM vs per-Take-Referenz | korrekter Startscreen | ✅ T2 (G_HOMESCREEN0); andere Takes 📋 |
| U2 | Korrekter Tenant | OCR Sidebar/Header/Call-Name | tenant.name | 📋 falscher Betrieb |
| U3 | brand_color | Pixel-Sample Sidebar/Akzent | tenant.brand_color | 📋 falsche Farbe |
| U4 | Datum-Frische | OCR Datum entscheidende Frames | = heute / korrektes Demo-Datum | 📋 alte Daten |
| U5 | Gesamtdauer | ffprobe | = Schablonen-Dauer ±0,1s | 📋 Struktur-Drift |
| U6 | Dev-Badge weg | Pixel-Check unten-links | kein "Issues"-Badge | 📋 |

## T1 — Hero/Intro
| T1.1 | @0:00 Hero-Startframe | U1 | Hero-Layout | 📋 |
| T1.2 | Echte Website sichtbar (Modus-abh.) | Frame | korrekt | 📋 |

## T2 — Anruf + Leitsystem (Variante notruf/preis!)
| T2.1 | @0:00 = **Homescreen** | **G_HOMESCREEN0**: Phone-Interior-Crop (250x400@450,150) YAVG-Band 90–180 | Samsung-Homescreen, NICHT Suche/Dialing | ✅ implementiert+kalibriert (fängt Walter-Offset: Suche YAVG≈225) |
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

## BUG-STATUS (Update 02.06.)
- **T2 Weinberger:** Greeting=Leins → GELÖST 01.06. (PR #533, per-Varianten-Greeting-Slot). Gate G_GREETING (STT) deckt ab.
- **T2 Walter:** Offset 0:00–36s → **WURZEL GEFIXT 02.06.** (siehe Anker-Architektur unten). Gate G_HOMESCREEN0 deckt die Fehlerklasse ab.
- **T4 Walter/Weinberger:** Stern/Maus-Sync passt noch nicht (Einzel-Frame-Check unzureichend) → **NOCH OFFEN** (Schritt 2). Gate T4.4 noch 📋.

## Anker-Architektur T2-Homescreen (02.06., Walter-Offset-Wurzelfix)
**Wurzel:** Playwrights `recordVideo` verschluckt die ersten ~2–3s (Encoder-Startlatenz,
varianzbehaftet). Bei Walter wurde so der KOMPLETTE Pre-Call-Homescreen verschluckt →
`take2_complete[0.3,2.0]` (statische Phase-Library-Range) landete auf der Suche → ganzes T2
verschoben. Bei Dörfler/Stark war die Latenz kürzer → Homescreen knapp erfasst (Glück, nicht Determinismus).
**Fix (deterministisch, skaliert für alle Betriebe):**
1. `produce_screenflow.mjs`: Encoder-Warm-up auf `about:blank` (5s) BEVOR die Sequenz lädt →
   Latenz wird auf neutraler Seite absorbiert, Sequenz ab echtem Start encodiert. Interne
   Sequenz-Timeline (SMS@+27s etc.) bleibt 1:1 erhalten.
2. `pipeline_screenflow.mjs`: `detectHomescreenStart()` findet den Homescreen-Start via YAVG-Band
   (~95–150; blank≈250, Suche≈225, Dialing≈70) → dynamischer Trim statt fix `-ss 0.3`. Sidecar
   `_samsung_trim.json`.
3. `build_take2_final.mjs`: Leit-Offset (STEP 1.5) + SMS-Extract (STEP 2c-4) lesen den dynamischen
   Trim aus dem Sidecar (relativ zum Homescreen-Start statt samsung-absolut).

## Implementierung
Diese Gates als `scripts/_ops/qg_video.mjs --slug X --take N` (post-build, Exit≠0 bei Fail,
Finding-Report) + in build_takeN_final als letzter Schritt. Referenz-Crops aus Stark/Dörfler-Gold.
Implementiert: G_START0, **G_HOMESCREEN0** (T2), G_GREETING (T2, STT). TODO: U2–U6, T2.4–T2.9, T3.*, T4.* (v.a. T4.4 Stern/Maus).
