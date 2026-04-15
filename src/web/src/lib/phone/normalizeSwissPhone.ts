/**
 * Normalize a Swiss phone number to E.164 format (+41...).
 *
 * Accepts:
 *   076 123 45 67  →  +41761234567
 *   0761234567     →  +41761234567
 *   +41 76 123 45 67 → +41761234567
 *   0041761234567  →  +41761234567
 *
 * Returns null if the input doesn't look like a valid Swiss number.
 */
export function normalizeSwissPhone(raw: string): string | null {
  // Strip whitespace, dashes, dots, parentheses
  const cleaned = raw.replace(/[\s\-.()/]/g, "");

  if (cleaned.length === 0) return null;

  // Already E.164: +41...
  if (/^\+41\d{9}$/.test(cleaned)) return cleaned;

  // International with 00 prefix: 0041...
  if (/^0041\d{9}$/.test(cleaned)) return "+" + cleaned.slice(2);

  // Local format: 07x... (10 digits)
  if (/^0[1-9]\d{8}$/.test(cleaned)) return "+41" + cleaned.slice(1);

  // Partial E.164 without +: 41... (11 digits starting with 41)
  if (/^41\d{9}$/.test(cleaned)) return "+" + cleaned;

  return null;
}
