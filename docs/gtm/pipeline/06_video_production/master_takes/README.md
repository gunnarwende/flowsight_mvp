# Master Takes — Ablagestruktur

## Aufnahme-Setup
- Mikrofon: Rode USB + NTT
- Software: Audacity
- Format: WAV (unkomprimiert)
- Lisa-Audio: Separat aus Retell (Call-ID → `extract_call_audio.mjs`)

## Ordnerstruktur

```
docs/gtm/pipeline/06_video_production/master_takes/
├── take1/
│   └── take1_complete.wav          ← Durchgehend aufgenommen
│
├── take2/
│   ├── segments/
│   │   ├── seg1.wav ... seg6.wav   ← Founder-Segmente (Audacity)
│   └── retell_call/
│       └── (Call-ID Ordner → extract_call_audio.mjs)
│
├── take3/
│   └── segments/
│       └── seg1.wav ... seg4.wav
│
├── take4/
│   └── segments/
│       └── seg1.wav ... seg4.wav
│
└── pip/
    └── pip_master.mp4              ← Loom (einmal, für alle Betriebe)
```

## Workflow
1. Founder nimmt Segmente auf (Audacity, Rode USB)
2. WAVs hier ablegen
3. Retell Call-ID mitteilen → Lisa-Audio wird extrahiert
4. Pipeline assembliert pro Betrieb: Founder-Audio + Lisa-Audio + STS-Swap
