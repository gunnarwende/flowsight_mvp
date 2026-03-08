import { notFound } from "next/navigation";
import { getCustomer, getAllCustomerSlugs } from "@/src/lib/customers/registry";
import type { Metadata } from "next";

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
    title: `${c.companyName} — Links`,
    robots: { index: false, follow: false },
  };
}

export default async function CustomerLinksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCustomer(slug);
  if (!c) notFound();

  const accent = c.brandColor ?? "#2b6cb0";
  const baseUrl = "https://flowsight.ch";

  const links: { label: string; url: string; description: string; icon: string }[] = [
    {
      label: "Website",
      url: `${baseUrl}/kunden/${c.slug}`,
      description: "Kunden-Website mit allen Leistungen und Kontaktdaten",
      icon: "🌐",
    },
    {
      label: "Schaden melden (Wizard)",
      url: `${baseUrl}/kunden/${c.slug}/meldung`,
      description: "Online-Formular für Schadensmeldungen",
      icon: "📋",
    },
  ];

  if (c.voicePhone) {
    links.push({
      label: `Voice Agent: ${c.voicePhone}`,
      url: `tel:${c.voicePhoneRaw}`,
      description: "KI-Telefonassistent für telefonische Schadensmeldungen",
      icon: "🤖",
    });
  }

  links.push({
    label: `Geschäftsnummer: ${c.contact.phone}`,
    url: `tel:${c.contact.phoneRaw}`,
    description: "Hauptnummer des Betriebs",
    icon: "📞",
  });

  if (c.contact.email) {
    links.push({
      label: c.contact.email,
      url: `mailto:${c.contact.email}`,
      description: "E-Mail-Adresse",
      icon: "✉️",
    });
  }

  links.push({
    label: "Ops Dashboard",
    url: `${baseUrl}/ops`,
    description: "Fallübersicht und Verwaltung (Login erforderlich)",
    icon: "📊",
  });

  if (c.emergency?.enabled) {
    links.push({
      label: `Notfall: ${c.emergency.phone}`,
      url: `tel:${c.emergency.phoneRaw}`,
      description: c.emergency.description ?? "Notdienst-Nummer",
      icon: "🚨",
    });
  }

  if (c.reviews?.googleUrl) {
    links.push({
      label: "Google Reviews",
      url: c.reviews.googleUrl,
      description: `${c.reviews.averageRating}★ — ${c.reviews.totalReviews} Bewertungen`,
      icon: "⭐",
    });
  }

  if (c.contact.website) {
    links.push({
      label: `Alte Website: ${c.contact.website}`,
      url: c.contact.website.startsWith("http") ? c.contact.website : `https://${c.contact.website}`,
      description: "Bisherige Website des Kunden",
      icon: "🔗",
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-5">
        <div className="mx-auto max-w-lg">
          <h1 className="text-xl font-bold" style={{ color: accent }}>
            {c.companyName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Alle Links auf einen Blick</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <div className="space-y-3">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target={link.url.startsWith("tel:") || link.url.startsWith("mailto:") ? undefined : "_blank"}
              rel={link.url.startsWith("tel:") || link.url.startsWith("mailto:") ? undefined : "noopener noreferrer"}
              className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
            >
              <span className="mt-0.5 text-2xl">{link.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{link.label}</p>
                <p className="mt-0.5 text-sm text-gray-500">{link.description}</p>
                {!link.url.startsWith("tel:") && !link.url.startsWith("mailto:") && (
                  <p className="mt-1 truncate text-xs text-gray-400">{link.url}</p>
                )}
              </div>
              <svg className="mt-1 h-5 w-5 flex-shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-100 px-4 py-3 text-center text-xs text-gray-400">
        Powered by FlowSight
      </footer>
    </div>
  );
}
