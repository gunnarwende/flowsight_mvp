import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCustomer,
  getAllCustomerSlugs,
} from "@/src/lib/customers/registry";
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
    title: `${c.companyName} — Ihr Leitsystem`,
    description: `Persönliche Telefonassistentin, Meldungsformular und Leitstand für ${c.companyName}.`,
    robots: { index: false },
  };
}

// ── Helpers ───────────────────────────────────────────────────────
function formatPhone(phone: string): string {
  // +41435051101 → 043 505 11 01
  if (phone.startsWith("+41") && phone.length === 12) {
    const local = "0" + phone.slice(3);
    return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 8)} ${local.slice(8)}`;
  }
  return phone;
}

// ── Page ──────────────────────────────────────────────────────────
export default async function StartPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCustomer(slug);
  if (!c) notFound();

  const accent = c.brandColor ?? "#2b6cb0";
  const voicePhone = c.voicePhone ?? c.contact.phone;
  const voicePhoneRaw = c.voicePhoneRaw ?? c.contact.phoneRaw;
  const voicePhoneFormatted = formatPhone(voicePhoneRaw);
  const hasEmergency = c.emergency?.enabled === true;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Top Bar ────────────────────────────────────────────── */}
      <header className="border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: accent }}
            >
              {c.companyName
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm leading-tight">
                {c.companyName}
              </div>
              <div className="text-xs text-gray-500">Ihr Leitsystem</div>
            </div>
          </div>
          {hasEmergency && (
            <a
              href={`tel:${c.emergency!.phoneRaw}`}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
            >
              {c.emergency!.label}
            </a>
          )}
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-6 py-10 sm:py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Willkommen bei Ihrem Leitsystem
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
            Ihre persönliche Telefonassistentin Lisa, Ihr Meldungsformular und
            Ihr Leitstand — alles an einem Ort.
          </p>
        </div>

        {/* ── CTA 1: Anrufen ──────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 sm:p-8 mb-4 border-2 relative overflow-hidden"
          style={{
            borderColor: accent,
            backgroundColor: `${accent}08`,
          }}
        >
          <div className="relative">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${accent}15` }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: accent }}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Lisa anrufen
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Ihre persönliche Telefonassistentin nimmt ab — mit Ihrem
                  Firmennamen. Rund um die Uhr.
                </p>
                <a
                  href={`tel:${voicePhoneRaw}`}
                  className="inline-flex items-center justify-center w-full sm:w-auto gap-2 text-white font-semibold text-base py-3 px-8 rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
                  style={{ backgroundColor: accent }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                    />
                  </svg>
                  {voicePhoneFormatted}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA 2: Meldung erfassen ─────────────────────────── */}
        <Link
          href={`/kunden/${c.slug}/meldung`}
          className="block rounded-2xl p-6 sm:p-8 mb-4 border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors">
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Anliegen schriftlich melden
              </h2>
              <p className="text-sm text-gray-600">
                Meldung erfassen — mit Kategorie, Adresse und Fotos. Der Fall
                landet direkt im Leitstand.
              </p>
            </div>
            <svg
              className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0 group-hover:text-gray-600 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </div>
        </Link>

        {/* ── CTA 3: Leitstand ────────────────────────────────── */}
        <Link
          href="/ops/cases"
          className="block rounded-2xl p-6 sm:p-8 mb-10 border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors">
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Leitstand öffnen
              </h2>
              <p className="text-sm text-gray-600">
                Alle Fälle auf einen Blick — Kategorie, Dringlichkeit, Status.
                Ihre digitale Einsatzzentrale.
              </p>
            </div>
            <svg
              className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0 group-hover:text-gray-600 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </div>
        </Link>

        {/* ── How it works ────────────────────────────────────── */}
        <div className="border-t border-gray-100 pt-10">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6 text-center">
            So funktioniert&apos;s
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-3"
                style={{ backgroundColor: accent }}
              >
                1
              </div>
              <div className="font-medium text-gray-900 text-sm mb-1">
                Anrufen
              </div>
              <div className="text-xs text-gray-500">
                Rufen Sie die Nummer an. Lisa nimmt ab — mit Ihrem Firmennamen.
              </div>
            </div>
            <div className="text-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-3"
                style={{ backgroundColor: accent }}
              >
                2
              </div>
              <div className="font-medium text-gray-900 text-sm mb-1">
                SMS prüfen
              </div>
              <div className="text-xs text-gray-500">
                10 Sekunden nach dem Anruf: SMS mit Zusammenfassung auf Ihrem
                Handy.
              </div>
            </div>
            <div className="text-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-3"
                style={{ backgroundColor: accent }}
              >
                3
              </div>
              <div className="font-medium text-gray-900 text-sm mb-1">
                Leitstand öffnen
              </div>
              <div className="text-xs text-gray-500">
                Jeder Fall ist da — mit Kategorie, Adresse und Dringlichkeit.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-6">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-xs text-gray-400">
            Powered by{" "}
            <a
              href="https://flowsight.ch"
              className="hover:text-gray-600 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              FlowSight
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
