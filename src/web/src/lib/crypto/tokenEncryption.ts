import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12; // GCM standard
const AUTH_TAG_BYTES = 16;
const KEY_HEX_LENGTH = 64; // 32 bytes = 256 bits

function getKey(): Buffer {
  const hex = process.env.CALENDAR_ENCRYPTION_KEY;
  if (!hex) throw new Error("Missing CALENDAR_ENCRYPTION_KEY env var");
  if (hex.length !== KEY_HEX_LENGTH || !/^[0-9a-f]+$/i.test(hex)) {
    throw new Error(
      `CALENDAR_ENCRYPTION_KEY must be ${KEY_HEX_LENGTH} hex chars (32 bytes)`,
    );
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypt a plaintext string with AES-256-GCM.
 * Returns `iv:authTag:ciphertext` (all hex).
 */
export function encryptToken(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

/**
 * Decrypt a token produced by `encryptToken`.
 * Input format: `iv:authTag:ciphertext` (all hex).
 */
export function decryptToken(encrypted: string): string {
  const parts = encrypted.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format (expected iv:authTag:ciphertext)");
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;
  const key = getKey();
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
