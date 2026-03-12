// ---------------------------------------------------------------------------
// Shared category constants — SSOT for wizard + voice alignment (S1.6)
// ---------------------------------------------------------------------------
import type { CustomerCategory } from "./types";

/** Fixed bottom row — identical for every customer wizard. */
export const FIXED_CATEGORIES: CustomerCategory[] = [
  { value: "Allgemein", label: "Allgemein", hint: "Sonstiges Anliegen", iconKey: "clipboard", fixed: true },
  { value: "Angebot", label: "Angebot", hint: "Offerte, Beratung", iconKey: "document", fixed: true },
  { value: "Kontakt", label: "Kontakt", hint: "Frage, Rückruf", iconKey: "chat", fixed: true },
];
