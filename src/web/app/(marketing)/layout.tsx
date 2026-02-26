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
          <Link href="/" aria-label="FlowSight Home">
            <Logo variant="on-light" height={26} />
          </Link>

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
            <a
              href="#demo"
              className="text-sm font-medium text-navy-900/60 transition-colors hover:text-navy-900"
            >
              Kontakt
            </a>
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
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
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
