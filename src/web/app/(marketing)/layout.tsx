import Link from "next/link";
import { SITE } from "@/src/lib/marketing/constants";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ── Navigation ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-slate-900"
          >
            {SITE.name}
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/#funktionen"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Funktionen
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Preise
            </Link>
            <a
              href={`tel:${SITE.phoneRaw}`}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {SITE.phone}
            </a>
            <a
              href={SITE.calendlyUrl}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Demo buchen
            </a>
          </div>

          {/* Mobile CTA only */}
          <a
            href={SITE.calendlyUrl}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 md:hidden"
          >
            Demo buchen
          </a>
        </div>
      </nav>

      {/* ── Page content ───────────────────────────────────── */}
      <main>{children}</main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 bg-slate-900 text-slate-400">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-2">
              <p className="text-lg font-bold text-white">{SITE.name}</p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed">
                {SITE.tagline}. Entwickelt in der Schweiz für Sanitär- und
                Heizungsbetriebe.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Produkt
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/#funktionen" className="hover:text-white transition-colors">
                    Funktionen
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Preise
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Rechtliches
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/impressum" className="hover:text-white transition-colors">
                    Impressum
                  </Link>
                </li>
                <li>
                  <Link href="/datenschutz" className="hover:text-white transition-colors">
                    Datenschutz
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} {SITE.legalName}. Alle Rechte
            vorbehalten.
          </div>
        </div>
      </footer>
    </>
  );
}
