import type { Metadata } from "next";
import { theme } from "@/src/lib/demo_theme/doerfler_ag";

/* ------------------------------------------------------------------ */
/*  Metadata                                                          */
/* ------------------------------------------------------------------ */
export const metadata: Metadata = {
  title: `${theme.brandName} — Sanitär & Heizung in ${theme.location}`,
  description: `Ihr Spezialist für Sanitär, Heizung, Spenglerei und Solartechnik seit ${theme.founded}. Familienbetrieb in ${theme.location}, Bezirk Horgen.`,
};

/* ------------------------------------------------------------------ */
/*  Stock images – Phase A Demo only (replaced in Phase B)            */
/* ------------------------------------------------------------------ */
const HERO_IMG =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1920&q=80";

/* ------------------------------------------------------------------ */
/*  Service → Wizard category mapping (only matched services deep-link) */
/* ------------------------------------------------------------------ */
const SERVICE_CATEGORY_MAP: Record<string, string> = {
  "Sanitär": "Sanitär allgemein",
  "Heizung": "Heizung",
  "Reparaturservice": "Sanitär allgemein",
};

const GALLERY: { label: string; url: string; alt: string }[] = [
  {
    label: "Sanitär",
    url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80",
    alt: "Sanitärarbeiten — Beispielbild (Demo)",
  },
  {
    label: "Heizung",
    url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80",
    alt: "Heizungstechnik — Beispielbild (Demo)",
  },
  {
    label: "Spenglerei",
    url: "https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&w=800&q=80",
    alt: "Spenglereiarbeiten — Beispielbild (Demo)",
  },
  {
    label: "Leitungsbau",
    url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80",
    alt: "Leitungsbau — Beispielbild (Demo)",
  },
  {
    label: "Solartechnik",
    url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    alt: "Solartechnik — Beispielbild (Demo)",
  },
];

/* ------------------------------------------------------------------ */
/*  Inline SVG icons (Heroicons outline, consistent line style)       */
/* ------------------------------------------------------------------ */
function PhoneIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}

function MailIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

function MapPinIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default function DoerflerAgDemo() {
  return (
    <div className="bg-white text-[#1a1a1a]">
      {/* ============ NAVIGATION ============ */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16 lg:h-20">
          <a
            href="#"
            className="text-xl lg:text-2xl font-bold tracking-tight"
            style={{ color: theme.primaryHex }}
          >
            {theme.logoText}
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#leistungen" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Leistungen
            </a>
            <a href="#ueber-uns" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Über uns
            </a>
            <a href="#kontakt" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Kontakt
            </a>
          </div>

          <a
            href={theme.phoneHref}
            className="hidden lg:flex items-center gap-2 text-sm font-semibold"
            style={{ color: theme.primaryHex }}
          >
            <PhoneIcon className="w-4 h-4" />
            {theme.phone}
          </a>
        </div>
      </nav>

      <main>
        {/* ============ HERO ============ */}
        <section className="relative min-h-[85vh] flex items-center pt-20">
          <div
            className="absolute inset-0 bg-cover bg-center"
            role="img"
            aria-label="Handwerker bei der Arbeit — Beispielbild (Demo)"
            style={{ backgroundImage: `url(${HERO_IMG})` }}
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(26, 46, 68, 0.82)" }}
          />

          <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-20 w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-8 backdrop-blur-sm">
                Familienbetrieb seit {theme.founded}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Sanitär &amp; Heizung
                <br />
                in {theme.location}
              </h1>

              <p className="text-lg lg:text-xl text-white/80 leading-relaxed mb-10 max-w-xl">
                Ihr Spezialist für Sanitär, Heizung, Spenglerei und
                Solartechnik. Zuverlässig, fachkundig, lokal.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/doerfler-ag/meldung"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg text-white font-semibold text-lg transition-colors"
                  style={{ backgroundColor: theme.accentHex }}
                >
                  Online melden
                </a>
                <a
                  href={theme.phoneHref}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition-colors"
                >
                  <PhoneIcon />
                  Anrufen: {theme.phone}
                </a>
              </div>
            </div>

            <div className="mt-16 flex flex-wrap gap-3">
              {theme.proofItems.map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 rounded-full border border-white/20 text-white/80 text-sm font-medium backdrop-blur-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ============ SERVICES ============ */}
        <section id="leistungen" className="py-24 lg:py-32 px-6 lg:px-8 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{ color: theme.primaryHex }}
            >
              Unsere Leistungen
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-12 max-w-2xl">
              Seit {theme.founded} bieten wir umfassende Dienstleistungen rund
              um Sanitär, Heizung und Gebäudetechnik.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {theme.services.map((svc) => {
                const cat = SERVICE_CATEGORY_MAP[svc.name];
                const href = cat
                  ? `/doerfler-ag/meldung?category=${encodeURIComponent(cat)}`
                  : "/doerfler-ag/meldung";
                return (
                  <a
                    key={svc.name}
                    href={href}
                    className="block p-8 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <h3
                      className="text-xl font-semibold mb-3"
                      style={{ color: theme.primaryHex }}
                    >
                      {svc.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{svc.desc}</p>
                    <p
                      className="mt-4 text-sm font-medium"
                      style={{ color: theme.accentHex }}
                    >
                      Jetzt melden &rarr;
                    </p>
                  </a>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <a
                href="/doerfler-ag/meldung"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg text-white font-semibold text-lg transition-colors"
                style={{ backgroundColor: theme.accentHex }}
              >
                Jetzt online melden
              </a>
            </div>
          </div>
        </section>

        {/* ============ NOTFALL CTA ============ */}
        <section
          className="py-20 lg:py-24 px-6 lg:px-8"
          style={{ backgroundColor: theme.primaryHex }}
        >
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Notfall?
            </h2>
            <p className="text-lg text-white/80 leading-relaxed mb-4 max-w-2xl mx-auto">
              Rohrbruch, Wasserschaden oder Heizungsausfall?
              <br />
              Rufen Sie uns an — auch an Sonn- und Feiertagen erreichbar.
            </p>
            <p className="text-sm text-white/60 mb-8">
              Quelle: doerflerag.ch (Team-Seite) — Erreichbarkeit bestätigt. Kein
              expliziter 24h-Notdienst beworben.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href={theme.phoneHref}
                className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-lg bg-white font-bold text-xl transition-colors"
                style={{ color: theme.primaryHex }}
              >
                <PhoneIcon className="w-6 h-6" />
                Jetzt anrufen: {theme.phone}
              </a>
              <a
                href="/doerfler-ag/meldung"
                className="inline-flex items-center justify-center px-10 py-5 rounded-lg border-2 border-white/30 text-white font-bold text-xl hover:bg-white/10 transition-colors"
              >
                Online melden
              </a>
            </div>
          </div>
        </section>

        {/* ============ PROCESS ============ */}
        <section
          className="py-24 lg:py-32 px-6 lg:px-8"
          style={{ backgroundColor: theme.lightBgHex }}
        >
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4 text-center"
              style={{ color: theme.primaryHex }}
            >
              So funktioniert&apos;s
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-16 text-center max-w-2xl mx-auto">
              In drei einfachen Schritten zu Ihrer Lösung.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  step: "1",
                  title: "Anfrage senden",
                  desc: "Beschreiben Sie Ihr Problem per Telefon oder über unser Kontaktformular. Wir melden uns umgehend.",
                },
                {
                  step: "2",
                  title: "Fachliche Bewertung",
                  desc: "Unsere Spezialisten bewerten Ihr Anliegen und planen den Einsatz — schnell und transparent.",
                },
                {
                  step: "3",
                  title: "Einsatz & Lösung",
                  desc: "Unser Team kommt zu Ihnen und löst das Problem fachgerecht. Sauber, zuverlässig, erledigt.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-6"
                    style={{ backgroundColor: theme.accentHex }}
                  >
                    {item.step}
                  </div>
                  <h3
                    className="text-xl font-semibold mb-3"
                    style={{ color: theme.primaryHex }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PROOF / REFERENCES ============ */}
        <section id="referenzen" className="py-24 lg:py-32 px-6 lg:px-8 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4 text-center"
              style={{ color: theme.primaryHex }}
            >
              Vertrauen &amp; Qualität
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-16 text-center max-w-2xl mx-auto">
              Seit knapp 100 Jahren setzen Kunden in der Region auf die Dörfler
              AG — über drei Generationen Familienbetrieb.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-8 rounded-xl border border-gray-200">
                <div
                  className="text-4xl font-bold mb-2"
                  style={{ color: theme.accentHex }}
                >
                  {theme.founded}
                </div>
                <div className="text-gray-600">Gründungsjahr</div>
              </div>
              <div className="text-center p-8 rounded-xl border border-gray-200">
                <div
                  className="text-4xl font-bold mb-2"
                  style={{ color: theme.accentHex }}
                >
                  {theme.generations}
                </div>
                <div className="text-gray-600">Generationen</div>
              </div>
              <div className="text-center p-8 rounded-xl border border-gray-200">
                <div
                  className="text-4xl font-bold mb-2"
                  style={{ color: theme.accentHex }}
                >
                  {theme.services.length}
                </div>
                <div className="text-gray-600">Fachbereiche</div>
              </div>
            </div>

            <div className="text-center mb-8">
              <p
                className="text-sm font-semibold uppercase tracking-wider mb-6"
                style={{ color: theme.primaryHex }}
              >
                Suissetec-Mitglied &middot; Unsere Partner
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                {theme.partners.map((p) => (
                  <span
                    key={p}
                    className="px-5 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-500"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-12 text-center">
              <a
                href="/doerfler-ag/meldung"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg text-white font-semibold text-lg transition-colors"
                style={{ backgroundColor: theme.accentHex }}
              >
                Jetzt online melden
              </a>
            </div>
          </div>
        </section>

        {/* ============ GALLERY ============ */}
        <section
          id="galerie"
          className="py-24 lg:py-32 px-6 lg:px-8 scroll-mt-20"
          style={{ backgroundColor: theme.lightBgHex }}
        >
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4 text-center"
              style={{ color: theme.primaryHex }}
            >
              Einblicke in unsere Arbeit
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-12 text-center max-w-2xl mx-auto">
              Fünf Fachbereiche — ein Qualitätsanspruch.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GALLERY.map((img) => (
                <div
                  key={img.label}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    role="img"
                    aria-label={img.alt}
                    style={{ backgroundImage: `url(${img.url})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 text-white font-semibold text-lg">
                    {img.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-gray-400 mt-6">
              Bilder exemplarisch (Demo) — werden durch reale Fotos ersetzt.
            </p>
          </div>
        </section>

        {/* ============ ÜBER UNS ============ */}
        <section id="ueber-uns" className="py-24 lg:py-32 px-6 lg:px-8 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl">
              <h2
                className="text-3xl lg:text-4xl font-bold mb-6"
                style={{ color: theme.primaryHex }}
              >
                Über die Dörfler AG
              </h2>

              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Die Dörfler AG wurde <strong>1926</strong> von Emil Dörfler
                  senior als kleiner Sanitär- und Spenglereibetrieb an der
                  Dörflistrasse 14 in Oberrieden gegründet. Seither hat sich das
                  Unternehmen über{" "}
                  <strong>drei Generationen Familienführung</strong> hinweg zu
                  einem umfassenden Gebäudetechnik-Spezialisten entwickelt.
                </p>
                <p>
                  1970 übernahm Emil Dörfler junior den Betrieb und baute das
                  Angebot aus. 1988 erfolgte der Umzug an den heutigen Standort
                  an der Hubstrasse 30. Seit <strong>2004</strong> führen{" "}
                  <strong>{theme.leadership}</strong> — die dritte
                  Generation — das Unternehmen als Dörfler AG.
                </p>
                <p>
                  Heute deckt die Dörfler AG sieben Fachbereiche ab: Sanitär,
                  Heizung, Spenglerei, Blitzschutz, Solartechnik, Leitungsbau
                  und Reparaturservice. Als{" "}
                  <strong>Suissetec-Mitglied</strong> stehen wir für geprüfte
                  Qualität und Weiterbildung.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { year: "1926", label: "Gründung" },
                  { year: "1988", label: "Umzug Hubstrasse" },
                  { year: "2004", label: "3. Generation" },
                  { year: "Heute", label: "7 Fachbereiche" },
                ].map((m) => (
                  <div key={m.year} className="p-4 rounded-lg border border-gray-200">
                    <div
                      className="text-lg font-bold"
                      style={{ color: theme.accentHex }}
                    >
                      {m.year}
                    </div>
                    <div className="text-sm text-gray-500">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ SERVICE AREA ============ */}
        <section
          id="einzugsgebiet"
          className="py-24 lg:py-32 px-6 lg:px-8 scroll-mt-20"
          style={{ backgroundColor: theme.lightBgHex }}
        >
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{ color: theme.primaryHex }}
            >
              Unser Einzugsgebiet
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl">
              Wir sind für Sie da in <strong>{theme.serviceArea}</strong> und
              Umgebung am linken Zürichseeufer.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 mt-1 shrink-0 text-gray-400" />
                <div>
                  <p className="font-semibold" style={{ color: theme.primaryHex }}>
                    {theme.address}
                  </p>
                  <a
                    href={theme.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm transition-colors"
                    style={{ color: theme.accentHex }}
                  >
                    Auf Google Maps anzeigen &rarr;
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <PhoneIcon className="w-5 h-5 mt-1 shrink-0 text-gray-400" />
                <div>
                  <a
                    href={theme.phoneHref}
                    className="font-semibold"
                    style={{ color: theme.primaryHex }}
                  >
                    {theme.phone}
                  </a>
                  <p className="text-sm text-gray-500">
                    Auch Sonn- &amp; Feiertags
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-8">
              Einzugsgebiet: Assumption — genaues Gebiet wird vom Inhaber
              bestätigt.
            </p>
          </div>
        </section>

        {/* ============ KONTAKT ============ */}
        <section id="kontakt" className="py-24 lg:py-32 px-6 lg:px-8 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl mx-auto text-center">
              <h2
                className="text-3xl lg:text-4xl font-bold mb-4"
                style={{ color: theme.primaryHex }}
              >
                Kontakt aufnehmen
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-12">
                Sie haben ein Anliegen? Kontaktieren Sie uns — wir beraten Sie
                gerne persönlich.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 text-left">
                <div className="flex items-start gap-3">
                  <PhoneIcon className="w-5 h-5 mt-1 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <a
                      href={theme.phoneHref}
                      className="font-semibold"
                      style={{ color: theme.primaryHex }}
                    >
                      {theme.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MailIcon className="w-5 h-5 mt-1 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">E-Mail</p>
                    <a
                      href={`mailto:${theme.email}`}
                      className="font-semibold"
                      style={{ color: theme.primaryHex }}
                    >
                      {theme.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 mt-1 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p
                      className="font-semibold"
                      style={{ color: theme.primaryHex }}
                    >
                      {theme.address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href="/doerfler-ag/meldung"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg text-white font-semibold text-lg transition-colors"
                  style={{ backgroundColor: theme.accentHex }}
                >
                  Online melden
                </a>
                <a
                  href={theme.phoneHref}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border-2 font-semibold text-lg transition-colors"
                  style={{
                    borderColor: theme.primaryHex,
                    color: theme.primaryHex,
                  }}
                >
                  <PhoneIcon />
                  Anrufen
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="py-12 px-6 lg:px-8" style={{ backgroundColor: theme.primaryHex }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <p className="text-lg font-bold text-white mb-2">
                {theme.brandName}
              </p>
              <p className="text-sm text-white/60">{theme.address}</p>
              <p className="text-sm text-white/60">
                {theme.phone} &middot; {theme.email}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40 mb-1">
                Bilder exemplarisch (Demo) — werden durch reale Fotos ersetzt.
              </p>
              <p className="text-xs text-white/40 mb-1">
                Farbgebung: Assumption (Classic Premium) — wird vom Inhaber
                bestätigt.
              </p>
              <p className="text-xs text-white/40">
                &copy; {new Date().getFullYear()} {theme.brandName}. Alle Rechte
                vorbehalten.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
