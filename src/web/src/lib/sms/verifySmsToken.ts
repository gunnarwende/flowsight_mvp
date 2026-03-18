import { createHmac, timingSafeEqual } from "crypto";

/**
 * Stateless HMAC-SHA256 token for SMS verification links.
 * Input: caseId + ":" + created_at (ISO string).
 * Secret: SMS_HMAC_SECRET env var.
 *
 * Security: UUID (non-guessable) + 256-bit HMAC + timingSafeEqual.
 * No expiry needed — correction page is idempotent.
 */

function getSecret(): string {
  const secret = process.env.SMS_HMAC_SECRET;
  if (!secret) throw new Error("Missing SMS_HMAC_SECRET");
  return secret;
}

function computeHmac(caseId: string, createdAt: string): Buffer {
  const payload = `${caseId}:${createdAt}`;
  return createHmac("sha256", getSecret()).update(payload).digest();
}

/** Generate a 64-char hex HMAC token for a case. */
export function generateVerifyToken(caseId: string, createdAt: string): string {
  return computeHmac(caseId, createdAt).toString("hex");
}

/** Validate a full HMAC token (timing-safe). Returns false if token is invalid or env missing. */
export function validateVerifyToken(
  caseId: string,
  createdAt: string,
  token: string,
): boolean {
  try {
    const expected = computeHmac(caseId, createdAt);
    const provided = Buffer.from(token, "hex");
    if (expected.length !== provided.length) return false;
    return timingSafeEqual(expected, provided);
  } catch {
    return false;
  }
}

/** Generate a short (16 hex char) token for SMS links. First 8 bytes of HMAC = 64-bit security. */
export function generateShortVerifyToken(caseId: string, createdAt: string): string {
  return computeHmac(caseId, createdAt).subarray(0, 8).toString("hex");
}

// ---------------------------------------------------------------------------
// Einsatz tokens (technician mobile surface) — separate HMAC namespace
// ---------------------------------------------------------------------------

function computeEinsatzHmac(caseId: string, createdAt: string): Buffer {
  const payload = `einsatz:${caseId}:${createdAt}`;
  return createHmac("sha256", getSecret()).update(payload).digest();
}

/** Generate a short einsatz token (16 hex chars). Separate namespace from correction tokens. */
export function generateEinsatzToken(caseId: string, createdAt: string): string {
  return computeEinsatzHmac(caseId, createdAt).subarray(0, 8).toString("hex");
}

/** Validate an einsatz token (timing-safe). */
export function validateEinsatzToken(caseId: string, createdAt: string, token: string): boolean {
  try {
    const expected = computeEinsatzHmac(caseId, createdAt).subarray(0, 8);
    const provided = Buffer.from(token, "hex");
    if (expected.length !== provided.length) return false;
    return timingSafeEqual(expected, provided);
  } catch {
    return false;
  }
}

/** Validate a short token (first 8 bytes, timing-safe). */
export function validateShortVerifyToken(
  caseId: string,
  createdAt: string,
  shortToken: string,
): boolean {
  try {
    const expected = computeHmac(caseId, createdAt).subarray(0, 8);
    const provided = Buffer.from(shortToken, "hex");
    if (expected.length !== provided.length) return false;
    return timingSafeEqual(expected, provided);
  } catch {
    return false;
  }
}
