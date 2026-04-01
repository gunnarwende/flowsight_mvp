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
    title: `Datenschutz — ${c.companyName}`,
    robots: { index: false, follow: false },
  };
}

export default async function DatenschutzPage({
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
        <h1 className="mb-8 text-2xl font-bold text-gray-900">Datenschutzerklärung</h1>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Verantwortliche Stelle</h2>
            <p>
              {c.companyName}<br />
              {addr.street}<br />
              {addr.zip} {addr.city}
            </p>
            {c.contact.email && (
              <p className="mt-2">
                E-Mail: <a href={`mailto:${c.contact.email}`} className="underline">{c.contact.email}</a>
              </p>
            )}
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Allgemeines</h2>
            <p>
              Gestützt auf Artikel 13 der schweizerischen Bundesverfassung und die datenschutzrechtlichen
              Bestimmungen des Bundes (Datenschutzgesetz, DSG) hat jede Person Anspruch auf Schutz
              ihrer Privatsphäre sowie auf Schutz vor Missbrauch ihrer persönlichen Daten.
              Wir halten diese Bestimmungen ein.
            </p>
            <p className="mt-2">
              Persönliche Daten werden streng vertraulich behandelt und weder an Dritte
              verkauft noch weitergegeben.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Erhebung und Verarbeitung von Daten</h2>
            <p>
              Beim Zugriff auf diese Website werden folgende Daten in Logfiles gespeichert:
              IP-Adresse, Datum, Uhrzeit, Browser-Anfrage und allgemein übertragene Informationen
              zum Betriebssystem bzw. Browser. Diese Nutzungsdaten bilden die Basis für statistische,
              anonyme Auswertungen, sodass Trends erkennbar sind, anhand derer wir unsere Angebote
              entsprechend verbessern können.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Kontaktformular und Meldungsformular</h2>
            <p>
              Wenn Sie uns per Kontaktformular oder Meldungsformular (Serviceanfrage) Anfragen zukommen lassen,
              werden Ihre Angaben zur Bearbeitung der Anfrage sowie für den Fall, dass Anschlussfragen
              entstehen, gespeichert. Diese Daten werden nicht ohne Ihre Einwilligung weitergegeben.
            </p>
            <p className="mt-2">
              Die im Rahmen einer Serviceanfrage erhobenen Daten (Name, Kontaktdaten, Beschreibung,
              Fotos) werden ausschliesslich zur Bearbeitung Ihres Anliegens verwendet.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Telefonische Kontaktaufnahme</h2>
            <p>
              Anrufe werden von einer digitalen Telefonassistentin entgegengenommen. Dabei werden
              folgende Daten erfasst: Name, Anliegen, Adresse, Dringlichkeit. <strong>Anrufe werden
              nicht aufgezeichnet.</strong> Die erfassten Daten werden ausschliesslich zur Bearbeitung
              Ihrer Anfrage verwendet.
            </p>
            <p className="mt-2">
              Nach dem Anruf erhalten Sie eine SMS mit einem Link zur Überprüfung und Ergänzung
              Ihrer Angaben. Die SMS wird über einen Schweizer Anbieter versendet.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Datenübermittlung an Dritte</h2>
            <p>
              Zur Erbringung unserer Dienstleistungen setzen wir folgende Technologie-Partner ein:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Vercel Inc. (Website-Hosting, Serverstandort Frankfurt, Deutschland)</li>
              <li>Supabase Inc. (Datenbank, Serverstandort Frankfurt, Deutschland)</li>
              <li>Resend Inc. (E-Mail-Versand)</li>
              <li>eCall.ch (SMS-Versand, Schweiz)</li>
            </ul>
            <p className="mt-2">
              Alle Daten werden auf Servern in der EU bzw. Schweiz verarbeitet.
              Es findet keine Übermittlung in Drittstaaten statt.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Ihre Rechte</h2>
            <p>
              Sie haben jederzeit das Recht auf Auskunft über die Sie betreffenden personenbezogenen
              Daten. Ebenso haben Sie das Recht auf Berichtigung, Sperrung oder Löschung.
              Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit
              unter der im Impressum angegebenen Adresse an uns wenden.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Technologie-Partner</h2>
            <p>
              Diese Website und die zugehörigen Dienste werden betrieben mit Technologie von{" "}
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
