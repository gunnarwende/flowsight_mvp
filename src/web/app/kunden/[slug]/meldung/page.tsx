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

// ── Page ──────────────────────────────────────────────────────────
export default async function MeldungPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCustomer(slug);
  if (!c) notFound();

  // Derive wizard categories from customer services
  const categories = c.services.map((s) => ({
    value: s.name,
    label: s.name,
    hint: s.summary.split(" — ")[0].slice(0, 50),
    iconKey: s.icon ?? "tool",
  }));

  // Always add a general "Allgemein" option
  categories.push({
    value: "Allgemein",
    label: "Allgemein",
    hint: "Sonstiges Anliegen",
    iconKey: "wrench",
  });

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
