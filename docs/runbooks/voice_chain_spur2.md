# Voice Chain — Spur 2: Audio Forensics

## What It Does

Spur 2 extends the voice chain with audio analysis. It:
1. Downloads call recordings (WAV) from Retell CloudFront
2. Re-transcribes with WhisperX (word-level timestamps)
3. Correlates WhisperX output with Retell events
4. Generates correlation.json + enriched reports

## Prerequisites

Installed on dev machine (CC installs these):

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | Already present |
| Python | 3.12 | `winget install Python.Python.3.12` |
| ffmpeg | 8.0+ | `winget install Gyan.FFmpeg` |
| PyTorch | 2.8+ CPU | `pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu` |
| WhisperX | 3.8+ | `pip install whisperx` |

Python path: `C:\Users\wende\AppData\Local\Programs\Python\Python312\python.exe`
ffmpeg path: auto-detected from WinGet packages dir.

## Usage

```bash
# Spur 1 only (no audio)
node scripts/run_chain.mjs voice --last 2

# Spur 1 + 2 (with audio forensics)
node scripts/run_chain.mjs voice --last 1 --with-audio

# Specific call with audio
node scripts/run_chain.mjs voice --id call_546fa9e... --with-audio

# Download audio only (no WhisperX)
node scripts/run_chain.mjs voice --last 1 --with-audio --no-whisperx

# Use smaller/larger model
node scripts/run_chain.mjs voice --last 1 --with-audio --whisper-model tiny
node scripts/run_chain.mjs voice --last 1 --with-audio --whisper-model small
```

## CLI Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--with-audio` | false | Enable Spur 2 pipeline |
| `--no-whisperx` | false | Download audio only, skip transcription |
| `--keep-audio` | ON in debug | Keep WAV files after analysis |
| `--whisper-model` | base | WhisperX model: tiny, base, small, medium |
| `--mode` | debug | debug (full artifacts) or live (redacted) |

## Output Structure

```
tmp/chains/voice/
  raw/<call_id_short>.json          # Retell API response (Spur 1)
  reports/<date>_<call_id>.md       # Human report (Spur 1 + 2)
  reports/<date>_<call_id>.json     # Machine report (Spur 1 + 2)
  reports/<date>_summary.md         # Cross-call summary
  audio/<call_id_short>/            # Spur 2 artifacts
    input.wav                       # Recording (if keep-audio)
    whisperx/
      words.json                    # Word-level [{word, start, end, score}]
      segments.json                 # Segment-level [{text, start, end, words}]
      transcript.vtt                # WebVTT subtitle file
    correlation.json                # Trigger detections + transfer events + findings
```

## Correlation Findings

| Category | Severity | Meaning |
|----------|----------|---------|
| `trigger_heard_transfer_ok` | PASS | WhisperX heard trigger, transfer happened |
| `trigger_heard_no_transfer` | CRITICAL | WhisperX heard trigger, NO transfer |
| `speech_no_transcript` | WARNING | WhisperX heard words where Retell had nothing |
| `inaudible_start` | INFO | First 3s: no words or all low confidence |
| `overlap_hint` | INFO | User words during agent speech windows |

## Performance

On CPU (no GPU):
- tiny model: ~15s for 30s audio
- base model: ~25s for 30s audio
- small model: ~60s for 30s audio

## Troubleshooting

**Python not found**: Set `PYTHON_PATH` env var to Python 3.12 executable.

**ffmpeg not found**: WhisperX auto-detects from WinGet install location. If moved, ensure ffmpeg.exe is on PATH.

**WhisperX alignment fails**: Falls back to segment-level timestamps (no word-level). Check that the detected language has an alignment model available.

**No recording URL**: Retell recording must be enabled. Check Retell Dashboard → Agent Settings → Recording.
