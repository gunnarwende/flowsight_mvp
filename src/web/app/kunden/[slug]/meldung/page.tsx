import { notFound } from "next/navigation";
import {
  getCustomer,
  getAllCustomerSlugs,
} from "@/src/lib/customers/registry";
import { CustomerWizardForm } from "./CustomerWizardForm";
import type { Metadata } from "next";

// ── Static generation ─────────────────────────────────────────────
export function generateStaticParams() {
  return getAllCustomerSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCustomer(slug);
  if (!c) return {};
  return {
    title: `Anliegen melden — ${c.companyName}`,
    description: `Melden Sie Ihr Anliegen direkt an ${c.companyName}. Schnell, unkompliziert, digital.`,
    robots: { index: false },
  };
}

// ── Category derivation ───────────────────────────────────────────
// Top row: 3 most common cases per business (dynamic from services).
// Bottom row: "Allgemein" + "Angebot" + "Kontakt" (fixed, all customers).

interface WizardCategory {
  value: string;
  label: string;
  hint: string;
  iconKey: string;
  /** true = fixed bottom row */
  fixed?: boolean;
}

/** Each case is triggered by service slugs/icons. Priority = array order. */
const CASE_POOL: { value: string; label: string; hint: string; iconKey: string; triggers: string[] }[] = [
  { value: "Verstopfung", label: "Verstopfung", hint: "Abfluss, WC, Leitung", iconKey: "drain", triggers: ["sanitaer", "sanitär", "bath"] },
  { value: "Leck / Wasserschaden", label: "Leck / Wasserschaden", hint: "Tropft, feucht, nass", iconKey: "drop", triggers: ["sanitaer", "sanitär", "bath", "reparatur"] },
  { value: "Heizungsausfall", label: "Heizungsausfall", hint: "Kalt, keine Wärme, Störung", iconKey: "flame", triggers: ["heizung", "flame", "heating"] },
  { value: "Kein Warmwasser", label: "Kein Warmwasser", hint: "Boiler, Speicher defekt", iconKey: "thermo", triggers: ["heizung", "sanitaer", "sanitär", "wartung", "water", "bath"] },
  { value: "Rohrbruch", label: "Rohrbruch", hint: "Akut, Wasseraustritt", iconKey: "burst", triggers: ["sanitaer", "sanitär", "bath", "reparatur", "pipe"] },
  { value: "Dachschaden", label: "Dachschaden", hint: "Undicht, Sturmschaden", iconKey: "roof", triggers: ["spenglerei", "roof", "dach"] },
  { value: "Fassadenschaden", label: "Fassadenschaden", hint: "Risse, Verkleidung lose", iconKey: "facade", triggers: ["fassade", "facade", "spenglerei"] },
  { value: "Solaranlage defekt", label: "Solaranlage defekt", hint: "Kein Ertrag, Störung", iconKey: "solar", triggers: ["solar", "leaf"] },
  { value: "Leitungsschaden", label: "Leitungsschaden", hint: "Gas, Wasser, Abwasser", iconKey: "pipe", triggers: ["leitungsbau", "pipe"] },
  { value: "Blitzschutzprüfung", label: "Blitzschutzprüfung", hint: "Kontrolle, Wartung", iconKey: "bolt", triggers: ["blitzschutz"] },
];

/** Fixed bottom row — always shown on every wizard. */
const FIXED_CATEGORIES: WizardCategory[] = [
  { value: "Allgemein", label: "Allgemein", hint: "Sonstiges Anliegen", iconKey: "clipboard", fixed: true },
  { value: "Angebot", label: "Angebot", hint: "Offerte, Beratung", iconKey: "document", fixed: true },
  { value: "Kontakt", label: "Kontakt", hint: "Frage, Rückruf", iconKey: "chat", fixed: true },
];

function deriveWizardCategories(services: { slug: string; icon?: string }[]): WizardCategory[] {
  const keys = new Set<string>();
  for (const s of services) {
    keys.add(s.slug.toLowerCase());
    if (s.icon) keys.add(s.icon);
    for (const part of s.slug.toLowerCase().split(/[-_]/)) {
      keys.add(part);
    }
  }

  // Pick top 3 dynamic cases matching this customer's services
  const matched: WizardCategory[] = [];
  for (const p of CASE_POOL) {
    if (matched.length >= 3) break;
    if (p.triggers.some((t) => keys.has(t))) {
      matched.push({ value: p.value, label: p.label, hint: p.hint, iconKey: p.iconKey });
    }
  }

  // If less than 3 matched, fill from pool
  if (matched.length < 3) {
    for (const p of CASE_POOL) {
      if (matched.length >= 3) break;
      if (!matched.some((m) => m.value === p.value)) {
        matched.push({ value: p.value, label: p.label, hint: p.hint, iconKey: p.iconKey });
      }
    }
  }

  // Append fixed bottom row
  return [...matched, ...FIXED_CATEGORIES];
}

// ── Page ──────────────────────────────────────────────────────────
export default async function MeldungPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCustomer(slug);
  if (!c) notFound();

  // Derive top-3 dynamic cases from services + fixed bottom row
  const categories = deriveWizardCategories(c.services);

  return (
    <CustomerWizardForm
      companyName={c.companyName}
      companySlug={c.slug}
      phone={c.contact.phone}
      phoneRaw={c.contact.phoneRaw}
      emergency={c.emergency}
      accent={c.brandColor ?? "#2b6cb0"}
      categories={categories}
      backUrl={`/kunden/${c.slug}`}
    />
  );
}
