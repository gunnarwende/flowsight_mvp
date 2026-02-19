#!/usr/bin/env node
/**
 * Lightweight regression check: alias → canonical field normalization.
 * Run: node src/web/scripts/test_normalize_aliases.js
 */

// Mirror of normalizeAliases from app/api/cases/route.ts
function normalizeAliases(raw) {
  const b = { ...raw };
  if (!b.contact_phone && b.phone) b.contact_phone = b.phone;
  if (!b.contact_email && b.email) b.contact_email = b.email;
  if (!b.description && b.message) b.description = b.message;
  return b;
}

function assert(condition, label) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exit(1);
  }
  console.log(`PASS: ${label}`);
}

// phone → contact_phone
const t1 = normalizeAliases({ phone: "+41790000000" });
assert(t1.contact_phone === "+41790000000", "phone → contact_phone");

// email → contact_email
const t2 = normalizeAliases({ email: "test@example.com" });
assert(t2.contact_email === "test@example.com", "email → contact_email");

// message → description
const t3 = normalizeAliases({ message: "Rohrbruch" });
assert(t3.description === "Rohrbruch", "message → description");

// canonical wins over alias
const t4 = normalizeAliases({ contact_phone: "+411111", phone: "+412222" });
assert(t4.contact_phone === "+411111", "contact_phone takes priority over phone");

// canonical description wins over message
const t5 = normalizeAliases({ description: "canonical", message: "alias" });
assert(t5.description === "canonical", "description takes priority over message");

// no alias, no canonical → stays undefined
const t6 = normalizeAliases({ source: "wizard" });
assert(t6.contact_phone === undefined, "no phone alias → stays undefined");

console.log("\nAll 6 normalization checks passed.");
