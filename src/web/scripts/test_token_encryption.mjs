#!/usr/bin/env node
/**
 * Lightweight verification: tokenEncryption round-trip.
 * Run: node src/web/scripts/test_token_encryption.mjs
 *
 * Uses a temporary key — no .env needed.
 */

import { randomBytes } from "crypto";

// Set a test key before importing (dynamic import so env is set first)
process.env.CALENDAR_ENCRYPTION_KEY = randomBytes(32).toString("hex");

const { encryptToken, decryptToken } = await import(
  "../src/lib/crypto/tokenEncryption.ts"
);

function assert(condition, label) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exit(1);
  }
  console.log(`PASS: ${label}`);
}

// 1. Round-trip
const plain = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.fake-refresh-token";
const enc = encryptToken(plain);
const dec = decryptToken(enc);
assert(dec === plain, "round-trip preserves plaintext");

// 2. Format: iv:authTag:ciphertext (3 hex parts)
const parts = enc.split(":");
assert(parts.length === 3, "output has 3 colon-separated parts");
assert(parts[0].length === 24, "IV = 12 bytes = 24 hex chars");
assert(parts[1].length === 32, "authTag = 16 bytes = 32 hex chars");
assert(parts.every((p) => /^[0-9a-f]+$/.test(p)), "all parts are hex");

// 3. Each encryption produces unique IV
const enc2 = encryptToken(plain);
assert(enc !== enc2, "different IVs produce different ciphertexts");
assert(decryptToken(enc2) === plain, "second ciphertext also decrypts");

// 4. Tampered ciphertext fails
try {
  const tampered = enc.replace(/.$/, enc.endsWith("0") ? "1" : "0");
  decryptToken(tampered);
  assert(false, "tampered ciphertext should throw");
} catch {
  assert(true, "tampered ciphertext throws");
}

// 5. Empty string round-trip
const emptyEnc = encryptToken("");
assert(decryptToken(emptyEnc) === "", "empty string round-trip");

// 6. Unicode round-trip
const unicode = "Müller Söhne GmbH — Zürich 🔧";
assert(decryptToken(encryptToken(unicode)) === unicode, "unicode round-trip");

// 7. Missing key throws
const saved = process.env.CALENDAR_ENCRYPTION_KEY;
delete process.env.CALENDAR_ENCRYPTION_KEY;
try {
  encryptToken("test");
  assert(false, "missing key should throw");
} catch (e) {
  assert(e.message.includes("Missing"), "missing key error message");
}
process.env.CALENDAR_ENCRYPTION_KEY = saved;

console.log("\n✅ All token encryption tests passed");
