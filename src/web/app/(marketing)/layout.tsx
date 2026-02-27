import Link from "next/link";
import { SITE } from "@/src/lib/marketing/constants";
import { Logo } from "@/src/components/Logo";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ── Navigation ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-navy-200 bg-warm-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
          <a href="/" aria-label="FlowSight Home">
            <Logo variant="on-light" height={26} />
          </a>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/#funktionen"
              className="text-sm font-medium text-navy-900/60 transition-colors hover:text-navy-900"
            >
              Funktionen
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-navy-900/60 transition-colors hover:text-navy-900"
            >
              Preise
            </Link>
            <Link
              href="/demo"
              className="text-sm font-medium text-navy-900/60 transition-colors hover:text-navy-900"
            >
              Kontakt
            </Link>
            <a
              href={`tel:${SITE.phoneRaw}`}
              className="text-sm font-medium text-navy-900/60 transition-colors hover:text-navy-900"
            >
              {SITE.phone}
            </a>
            <a
              href={SITE.demoUrl}
              className="rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-md hover:shadow-gold-500/15"
            >
              Demo vereinbaren
            </a>
          </div>

          {/* Mobile CTA only */}
          <a
            href={SITE.demoUrl}
            className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 transition-all hover:bg-gold-400 md:hidden"
          >
            Demo vereinbaren
          </a>
        </div>
      </nav>

      {/* ── Page content ───────────────────────────────────── */}
      <main>{children}</main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-navy-700 bg-navy-950 text-navy-400">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Logo variant="on-dark" height={24} />
              <p className="mt-4 max-w-sm text-sm leading-relaxed">
                {SITE.subtitle} Entwickelt in der Schweiz.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-navy-400/60">
                Produkt
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link
                    href="/#funktionen"
                    className="transition-colors hover:text-gold-400"
                  >
                    Funktionen
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="transition-colors hover:text-gold-400"
                  >
                    Preise
                  </Link>
                </li>
                <li>
                  <Link
                    href="/demo"
                    className="transition-colors hover:text-gold-400"
                  >
                    Demo
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-navy-400/60">
                Rechtliches
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link
                    href="/impressum"
                    className="transition-colors hover:text-gold-400"
                  >
                    Impressum
                  </Link>
                </li>
                <li>
                  <Link
                    href="/datenschutz"
                    className="transition-colors hover:text-gold-400"
                  >
                    Datenschutz
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kontakt */}
            <div className="sm:col-span-2 lg:col-span-1">
              <p className="text-sm font-semibold uppercase tracking-wider text-navy-400/60">
                Kontakt
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <p className="font-medium text-navy-300">{SITE.legalName}</p>
                <p>
                  {SITE.address.city}, Zürich
                </p>
                <p>
                  <a
                    href={`tel:${SITE.phoneRaw}`}
                    className="transition-colors hover:text-gold-400"
                  >
                    {SITE.phone}
                  </a>
                </p>
                <p>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="transition-colors hover:text-gold-400"
                  >
                    {SITE.email}
                  </a>
                </p>
                <p>
                  <a
                    href={SITE.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-gold-400"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-navy-800 pt-8 text-center text-xs text-navy-400/60">
            &copy; {new Date().getFullYear()} {SITE.legalName}. Alle Rechte
            vorbehalten.
          </div>
        </div>
      </footer>
    </>
  );
}
