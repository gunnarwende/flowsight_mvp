#!/usr/bin/env python3
"""WhisperX transcription with word-level timestamps.

Usage:
    python whisperx_transcribe.py <input.wav> <output_dir> [--model base]

Output files in <output_dir>/whisperx/:
    words.json     - Word-level timestamps [{word, start, end, score}]
    segments.json  - Segment-level [{text, start, end, words}]
    transcript.vtt - WebVTT subtitle file
"""

import sys
import os
import json
import argparse


def find_ffmpeg():
    """Auto-detect ffmpeg from WinGet install location."""
    winget_dir = os.path.expanduser(
        r"~\AppData\Local\Microsoft\WinGet\Packages"
    )
    if not os.path.isdir(winget_dir):
        return None

    for entry in os.listdir(winget_dir):
        if "FFmpeg" not in entry:
            continue
        pkg_dir = os.path.join(winget_dir, entry)
        for root, _dirs, files in os.walk(pkg_dir):
            if "ffmpeg.exe" in files:
                return root
    return None


def format_vtt_time(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}"


def main():
    parser = argparse.ArgumentParser(description="WhisperX transcription")
    parser.add_argument("input", help="Path to input WAV file")
    parser.add_argument("output_dir", help="Path to output directory")
    parser.add_argument(
        "--model", default="base", help="Whisper model size (default: base)"
    )
    parser.add_argument(
        "--language", default=None, help="Language hint (default: auto-detect)"
    )
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"ERROR: Input file not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    # Ensure ffmpeg is on PATH
    ffmpeg_dir = find_ffmpeg()
    if ffmpeg_dir:
        os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")
        print(f"[whisperx] ffmpeg: {ffmpeg_dir}")
    else:
        print("[whisperx] WARNING: ffmpeg not found via WinGet, hoping it's on PATH")

    import whisperx
    import torch

    device = "cpu"
    compute_type = "int8"  # CPU-optimized quantization

    print(f"[whisperx] model={args.model}, device={device}, compute={compute_type}")
    model = whisperx.load_model(args.model, device, compute_type=compute_type)

    print(f"[whisperx] transcribing: {os.path.basename(args.input)}")
    audio = whisperx.load_audio(args.input)
    result = model.transcribe(audio, batch_size=4)

    detected_lang = result.get("language", "unknown")
    print(f"[whisperx] detected language: {detected_lang}")

    # Align for word-level timestamps
    print("[whisperx] aligning word timestamps...")
    try:
        align_model, align_metadata = whisperx.load_align_model(
            language_code=detected_lang, device=device
        )
        result = whisperx.align(
            result["segments"],
            align_model,
            align_metadata,
            audio,
            device,
            return_char_alignments=False,
        )
    except Exception as e:
        print(f"[whisperx] WARNING: alignment failed ({e}), using segment-level only")

    # Write outputs
    out_dir = os.path.join(args.output_dir, "whisperx")
    os.makedirs(out_dir, exist_ok=True)

    # Extract all words from segments
    all_words = []
    for seg in result.get("segments", []):
        for w in seg.get("words", []):
            all_words.append(
                {
                    "word": w.get("word", ""),
                    "start": round(w.get("start", 0), 3),
                    "end": round(w.get("end", 0), 3),
                    "score": round(w.get("score", 0), 3),
                }
            )

    words_path = os.path.join(out_dir, "words.json")
    with open(words_path, "w", encoding="utf-8") as f:
        json.dump(all_words, f, indent=2, ensure_ascii=False)
    print(f"[whisperx] words: {len(all_words)} -> {words_path}")

    # Segments
    segments = []
    for seg in result.get("segments", []):
        segments.append(
            {
                "text": seg.get("text", ""),
                "start": round(seg.get("start", 0), 3),
                "end": round(seg.get("end", 0), 3),
                "words": [
                    {
                        "word": w.get("word", ""),
                        "start": round(w.get("start", 0), 3),
                        "end": round(w.get("end", 0), 3),
                        "score": round(w.get("score", 0), 3),
                    }
                    for w in seg.get("words", [])
                ],
            }
        )

    segments_path = os.path.join(out_dir, "segments.json")
    with open(segments_path, "w", encoding="utf-8") as f:
        json.dump(segments, f, indent=2, ensure_ascii=False)
    print(f"[whisperx] segments: {len(segments)} -> {segments_path}")

    # VTT subtitle file
    vtt_path = os.path.join(out_dir, "transcript.vtt")
    with open(vtt_path, "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for i, seg in enumerate(segments):
            start = format_vtt_time(seg["start"])
            end = format_vtt_time(seg["end"])
            f.write(f"{i + 1}\n{start} --> {end}\n{seg['text'].strip()}\n\n")
    print(f"[whisperx] vtt: {vtt_path}")

    # Summary JSON to stdout (Node.js parses this)
    summary = {
        "status": "ok",
        "language": detected_lang,
        "word_count": len(all_words),
        "segment_count": len(segments),
        "duration_s": round(all_words[-1]["end"], 3) if all_words else 0,
        "words_path": words_path,
        "segments_path": segments_path,
        "vtt_path": vtt_path,
    }
    print(f"\n__WHISPERX_RESULT__:{json.dumps(summary)}")


if __name__ == "__main__":
    main()
