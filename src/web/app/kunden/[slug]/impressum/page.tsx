import { notFound } from "next/navigation";
import { getCustomer, getAllCustomerSlugs } from "@/src/lib/customers/registry";
import type { Metadata } from "next";
import Link from "next/link";

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
    title: `Impressum — ${c.companyName}`,
    robots: { index: false, follow: false },
  };
}

export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCustomer(slug);
  if (!c) notFound();

  const addr = c.contact.address;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href={`/kunden/${c.slug}`} className="text-lg font-bold" style={{ color: c.brandColor }}>
            {c.companyName}
          </Link>
          <Link href={`/kunden/${c.slug}`} className="text-sm text-gray-500 hover:text-gray-900">
            Zur Website
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">Impressum</h1>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Kontaktadresse</h2>
            <p>
              {c.companyName}<br />
              {addr.street}<br />
              {addr.zip} {addr.city}
            </p>
            <p className="mt-2">
              Telefon: <a href={`tel:${c.contact.phoneRaw}`} className="underline">{c.contact.phone}</a>
              {c.contact.email && (
                <>
                  <br />
                  E-Mail: <a href={`mailto:${c.contact.email}`} className="underline">{c.contact.email}</a>
                </>
              )}
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Vertretungsberechtigte Personen</h2>
            <p>Inhaber bzw. Geschäftsleitung der {c.companyName}.</p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Haftungsausschluss</h2>
            <p>
              Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit,
              Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen.
            </p>
            <p className="mt-2">
              Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art,
              welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten
              Informationen, durch Missbrauch der Verbindung oder durch technische Störungen
              entstanden sind, werden ausgeschlossen.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Haftung für Links</h2>
            <p>
              Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres
              Verantwortungsbereichs. Jegliche Verantwortung für solche Webseiten wird abgelehnt.
              Der Zugriff und die Nutzung solcher Webseiten erfolgen auf eigene Gefahr des Nutzers.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Urheberrechte</h2>
            <p>
              Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien
              auf der Website gehören ausschliesslich der {c.companyName} oder den speziell genannten
              Rechtsinhabern. Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung
              der Urheberrechtsträger im Voraus einzuholen.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Technologie-Partner</h2>
            <p>
              Diese Website wird betrieben mit Technologie von{" "}
              <a href="https://flowsight.ch" className="underline" target="_blank" rel="noopener noreferrer">
                FlowSight GmbH
              </a>, Zürich.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
