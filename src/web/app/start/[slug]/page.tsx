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
    description: c.metaDescription,
    robots: { index: false },
  };
}

// ── Helpers ───────────────────────────────────────────────────────
function formatPhone(phone: string): string {
  if (phone.startsWith("+41") && phone.length === 12) {
    const local = "0" + phone.slice(3);
    return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 8)} ${local.slice(8)}`;
  }
  return phone;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.3;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    } else if (i === full && half) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="halfStar">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill="url(#halfStar)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    } else {
      stars.push(
        <svg key={i} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
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
  const isModus1 = (c.modus ?? 1) === 1;
  const hasReviews = c.reviews && c.reviews.totalReviews > 0;
  const addr = c.contact.address;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Emergency Bar ──────────────────────────────────────── */}
      {hasEmergency && (
        <div className="bg-red-600 text-white">
          <div className="max-w-2xl mx-auto px-6 py-2 flex items-center justify-between">
            <span className="text-xs font-medium">
              {c.emergency!.label} — {c.emergency!.description}
            </span>
            <a
              href={`tel:${c.emergency!.phoneRaw}`}
              className="text-xs font-bold underline whitespace-nowrap ml-4"
            >
              {c.emergency!.phone}
            </a>
          </div>
        </div>
      )}

      {/* ── Main Content ───────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-6 py-10 sm:py-16">

        {/* ── Spiegel: Firmenkarte ─────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ backgroundColor: accent }}
            >
              {c.companyName
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                {c.companyName}
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">{c.tagline}</p>
            </div>
          </div>

          {/* Google Stars */}
          {hasReviews && (
            <div className="flex items-center gap-2 mb-4">
              <Stars rating={c.reviews!.averageRating} />
              <span className="text-sm font-medium text-gray-700">
                {c.reviews!.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({c.reviews!.totalReviews} Google-Bewertungen)
              </span>
            </div>
          )}

          {/* Services as pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {c.services.map((s) => (
              <span
                key={s.slug}
                className="text-xs font-medium px-3 py-1 rounded-full border"
                style={{
                  borderColor: `${accent}40`,
                  color: accent,
                  backgroundColor: `${accent}08`,
                }}
              >
                {s.name}
              </span>
            ))}
          </div>

          {/* Address + Region */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span>
              {addr.street}, {addr.zip} {addr.city}
              {c.serviceArea?.region ? ` — ${c.serviceArea.region}` : ""}
            </span>
          </div>
        </div>

        {/* ── Personal Message ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
          <p className="text-base sm:text-lg text-gray-800 leading-relaxed">
            Ich habe für die <strong>{c.companyName}</strong> eine persönliche
            Telefonassistentin eingerichtet:{" "}
            <strong style={{ color: accent }}>Lisa</strong>.
          </p>
          <p className="text-sm text-gray-600 mt-3">
            Lisa nimmt ab — mit Ihrem Firmennamen. Sie erfasst das Anliegen,
            erkennt Notfälle und schickt Ihnen innert Sekunden eine Zusammenfassung
            aufs Handy. Jeder Fall landet im Leitstand.
          </p>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            Probieren Sie es aus — rufen Sie jetzt an.
          </p>
        </div>

        {/* ── CTA 1: Lisa anrufen (Primary) ────────────────────── */}
        <div
          className="rounded-2xl p-6 sm:p-8 mb-4 border-2 relative overflow-hidden"
          style={{
            borderColor: accent,
            backgroundColor: `${accent}08`,
          }}
        >
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
                &laquo;Grüezi, hier ist Lisa von der {c.companyName}. Wie kann ich
                Ihnen helfen?&raquo; — Rund um die Uhr.
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

        {/* ── CTA 2: Anliegen melden ───────────────────────────── */}
        <Link
          href={`/start/${c.slug}/meldung`}
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </Link>

        {/* ── CTA 3: Leitstand ─────────────────────────────────── */}
        <Link
          href="/ops/cases"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </Link>

        {/* ── CTA 4: Website (Modus 1 only) ────────────────────── */}
        {isModus1 && (
          <Link
            href={`/kunden/${c.slug}`}
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
                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Ihre Website
                </h2>
                <p className="text-sm text-gray-600">
                  Ihr professioneller Webauftritt — Leistungen, Galerie, Kontakt.
                  Bereit für Google.
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0 group-hover:text-gray-600 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </Link>
        )}

        {/* ── So funktioniert's ────────────────────────────────── */}
        <div className="border-t border-gray-200 pt-10 mt-6">
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
                Rufen Sie die Nummer an. Lisa nimmt ab — mit &laquo;{c.companyName}&raquo;.
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
                Leitstand
              </div>
              <div className="text-xs text-gray-500">
                Jeder Fall ist da — mit Kategorie, Adresse und Dringlichkeit.
                Alles auf einen Blick.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 py-6">
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
