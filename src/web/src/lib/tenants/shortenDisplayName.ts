/**
 * Shortens a tenant display name for narrow UI slots (mobile nav header, etc.).
 *
 * Strategy:
 *   - If name ≤ 22 chars: keep as-is.
 *   - Otherwise strip common CH business suffixes that don't add brand value
 *     in a header context (GmbH, AG variants, "& Sohn AG", etc.).
 *   - Fallback: truncate with ellipsis.
 *
 * Examples:
 *   "Dörfler AG" (10)                     → "Dörfler AG"
 *   "Leins AG" (8)                        → "Leins AG"
 *   "Wälti & Sohn AG" (15)                → "Wälti & Sohn AG"
 *   "Stark Haustechnik GmbH" (22)         → "Stark Haustechnik"   (22 chars, strip GmbH)
 *   "Fröhlich Haustechnik AG & Co KG" (31) → "Fröhlich Haustechnik" (strip AG & Co KG)
 */
const SUFFIX_STRIP_ORDER = [
  / GmbH & Co\.? KG$/i,
  / & Co\.? KG$/i,
  / AG & Co\.? KG$/i,
  / GmbH$/i,
  / & Sohn AG$/i,
  / & Söhne AG$/i,
  / AG$/i,
  / KG$/i,
  / KlG$/i,
];

export function shortenDisplayName(fullName: string | null | undefined, maxLen = 19): string {
  if (!fullName) return "Leitsystem";
  let name = fullName.trim();
  if (name.length <= maxLen) return name;

  // Progressiv Suffixe abstreifen bis unter Grenze
  for (const suffix of SUFFIX_STRIP_ORDER) {
    const trial = name.replace(suffix, "").trim();
    if (trial.length <= maxLen && trial.length > 0) {
      return trial;
    }
  }

  // Wenn immer noch zu lang: ellipsis
  return name.slice(0, maxLen - 1).trimEnd() + "…";
}
