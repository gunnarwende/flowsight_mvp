import type { Metadata } from "next";
import WizardForm from "@/app/wizard/WizardForm";

export const metadata: Metadata = {
  title: "Schadensmeldung — Brunner Haustechnik AG",
  description:
    "Melden Sie Ihr Anliegen in 3 einfachen Schritten. Sanitär, Heizung, Rohrbruch und mehr.",
};

const ALLOWED_CATEGORIES = [
  "Verstopfung",
  "Leck",
  "Heizung",
  "Boiler",
  "Rohrbruch",
  "Sanitär allgemein",
];

export default async function MeldungPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const category = ALLOWED_CATEGORIES.includes(params.category ?? "")
    ? params.category
    : undefined;

  return <WizardForm initialCategory={category} tenantSlug="brunner-haustechnik" />;
}
