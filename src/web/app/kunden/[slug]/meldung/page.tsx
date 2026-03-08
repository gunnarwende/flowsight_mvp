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
    title: `Schaden melden — ${c.companyName}`,
    description: `Melden Sie Ihr Anliegen direkt an ${c.companyName}. Schnell, unkompliziert, digital.`,
    robots: { index: false },
  };
}

// ── Problem derivation ────────────────────────────────────────────
// Maps customer services to the 5 most common problems + "Allgemein" = always 6 tiles.

interface WizardCategory {
  value: string;
  label: string;
  hint: string;
  iconKey: string;
}

/** Each problem is triggered by service slugs/icons. Priority = array order. */
const PROBLEM_POOL: { value: string; label: string; hint: string; iconKey: string; triggers: string[] }[] = [
  { value: "Verstopfung", label: "Verstopfung", hint: "Abfluss, WC, Leitung", iconKey: "drain", triggers: ["sanitaer", "sanitär", "bath"] },
  { value: "Leck / Wasserschaden", label: "Leck / Wasserschaden", hint: "Tropft, feucht, nass", iconKey: "drop", triggers: ["sanitaer", "sanitär", "bath", "reparatur"] },
  { value: "Rohrbruch", label: "Rohrbruch", hint: "Akut, Wasseraustritt", iconKey: "burst", triggers: ["sanitaer", "sanitär", "bath", "reparatur", "pipe"] },
  { value: "Heizungsausfall", label: "Heizungsausfall", hint: "Kalt, keine Wärme, Störung", iconKey: "flame", triggers: ["heizung", "flame", "heating"] },
  { value: "Kein Warmwasser", label: "Kein Warmwasser", hint: "Boiler, Speicher defekt", iconKey: "thermo", triggers: ["heizung", "sanitaer", "sanitär", "wartung", "water", "bath"] },
  { value: "Dachschaden", label: "Dachschaden", hint: "Undicht, Sturmschaden", iconKey: "roof", triggers: ["spenglerei", "roof", "dach"] },
  { value: "Fassadenschaden", label: "Fassadenschaden", hint: "Risse, Verkleidung lose", iconKey: "facade", triggers: ["fassade", "facade", "spenglerei"] },
  { value: "Solaranlage defekt", label: "Solaranlage defekt", hint: "Kein Ertrag, Störung", iconKey: "solar", triggers: ["solar", "leaf"] },
  { value: "Leitungsschaden", label: "Leitungsschaden", hint: "Gas, Wasser, Abwasser", iconKey: "pipe", triggers: ["leitungsbau", "pipe"] },
  { value: "Blitzschutzprüfung", label: "Blitzschutzprüfung", hint: "Kontrolle, Wartung", iconKey: "bolt", triggers: ["blitzschutz"] },
];

function deriveWizardProblems(services: { slug: string; icon?: string }[]): WizardCategory[] {
  // Collect all slugs and icons as trigger keys
  const keys = new Set<string>();
  for (const s of services) {
    keys.add(s.slug.toLowerCase());
    if (s.icon) keys.add(s.icon);
    // Also match partial slugs (e.g. "reparaturen-wartung" → "reparatur", "wartung")
    for (const part of s.slug.toLowerCase().split(/[-_]/)) {
      keys.add(part);
    }
  }

  // Pick problems whose triggers match any service key
  const matched: WizardCategory[] = [];
  for (const p of PROBLEM_POOL) {
    if (matched.length >= 5) break;
    if (p.triggers.some((t) => keys.has(t))) {
      matched.push({ value: p.value, label: p.label, hint: p.hint, iconKey: p.iconKey });
    }
  }

  // If less than 5 matched, fill from pool (in order) to reach 5
  if (matched.length < 5) {
    for (const p of PROBLEM_POOL) {
      if (matched.length >= 5) break;
      if (!matched.some((m) => m.value === p.value)) {
        matched.push({ value: p.value, label: p.label, hint: p.hint, iconKey: p.iconKey });
      }
    }
  }

  // #6: "Allgemein" always last, distinct icon (clipboard)
  matched.push({ value: "Allgemein", label: "Allgemein", hint: "Sonstiges Anliegen", iconKey: "clipboard" });

  return matched;
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

  // Derive the 5 most relevant PROBLEMS from customer services + "Allgemein"
  const categories = deriveWizardProblems(c.services);

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
