// Time-format helpers for schedule files.
// Supports both formats:
//   - decimal seconds: "130.5"
//   - minutes:seconds,tenths: "2:10,5" (German comma decimal)

// Parse a time string into seconds (float). Accepts both formats.
//   "130.5"     → 130.5
//   "2:10,5"    → 130.5
//   "0:36,5"    → 36.5
//   "10:00"     → 600.0
//   "10:00,7"   → 600.7
export function parseTime(s) {
  const trimmed = String(s).trim();
  if (trimmed.includes(":")) {
    const [mPart, secPart] = trimmed.split(":");
    if (secPart === undefined) throw new Error(`invalid time: "${s}"`);
    // Allow comma OR dot as decimal separator
    const seconds = parseFloat(secPart.replace(",", "."));
    if (Number.isNaN(seconds)) throw new Error(`invalid seconds part: "${secPart}"`);
    return parseInt(mPart, 10) * 60 + seconds;
  }
  // Plain decimal seconds (allow comma OR dot)
  const v = parseFloat(trimmed.replace(",", "."));
  if (Number.isNaN(v)) throw new Error(`invalid time: "${s}"`);
  return v;
}

// Format seconds into M:SS,T format (German comma).
//   130.5  → "2:10,5"
//   36.5   → "0:36,5"
//   5.0    → "0:05,0"
//   600.7  → "10:00,7"
//   59.99  → "0:59,9" (truncated, not rounded — preserves source decimal)
//   0.0    → "0:00,0"
export function formatTime(seconds) {
  if (typeof seconds !== "number" || Number.isNaN(seconds)) return "0:00,0";
  const total = Math.max(0, seconds);
  const m = Math.floor(total / 60);
  const remaining = total - m * 60;
  // Truncate to 1 decimal (don't round, to preserve user's exact value)
  const wholeSeconds = Math.floor(remaining);
  const tenths = Math.floor((remaining - wholeSeconds) * 10);
  const ss = String(wholeSeconds).padStart(2, "0");
  return `${m}:${ss},${tenths}`;
}

// Format range "start-end" into "M:SS,T-M:SS,T"
export function formatRange(start, end) {
  return `${formatTime(start)}-${formatTime(end)}`;
}
