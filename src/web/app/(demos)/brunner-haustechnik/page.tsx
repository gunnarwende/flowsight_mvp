import type { Metadata } from "next";
import { theme } from "@/src/lib/demo_theme/brunner_haustechnik";
import { ServiceGallery } from "./ServiceGallery";

/* ------------------------------------------------------------------ */
/*  Metadata                                                          */
/* ------------------------------------------------------------------ */
export const metadata: Metadata = {
  title: `${theme.brandName} — Sanitär & Heizung in ${theme.location}`,
  description: `Ihr Spezialist für Sanitär, Heizung, Boiler und Notdienst seit ${theme.founded}. ${theme.teamSize} in ${theme.location}, am linken Zürichseeufer.`,
};

/* ------------------------------------------------------------------ */
/*  Stock images (Unsplash, license-free)                             */
/* ------------------------------------------------------------------ */
const U = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const HERO_IMG = U("1585704032915-9f4cb67e55c3", 1920); // plumber working

const SERVICE_IMAGES: Record<string, { src: string; alt: string }[]> = {
  "Sanitär": [
    { src: U("1552321554-5fefe8c9ef14"), alt: "Moderne Badezimmer-Renovation" },
    { src: U("1584622650111-993a426fbf0a"), alt: "Waschbecken-Installation" },
    { src: U("1507089947017-82a3470e0b8b"), alt: "Professionelle Duschkabine" },
    { src: U("1620626011761-996317b8d101"), alt: "Armaturen-Montage" },
    { src: U("1600585154526-990dced4db0d"), alt: "WC-Renovation" },
  ],
  "Heizung": [
    { src: U("1585771724684-38269d6639fd"), alt: "Modernes Heizsystem" },
    { src: U("1558618666-fcd25c85f82e"), alt: "Thermostat-Einstellung" },
    { src: U("1513694203232-719a280e022f"), alt: "Heizungsraum mit Technik" },
    { src: U("1497366754035-f200968a6e72"), alt: "Wärmepumpe aussen" },
    { src: U("1631545806609-05d3b6c1d0e0"), alt: "Fussbodenheizung Verlegung" },
  ],
  "Boiler & Warmwasser": [
    { src: U("1504328345606-18bbc8c9d7d1"), alt: "Boiler-Installation" },
    { src: U("1621905252507-b35492cc74b4"), alt: "Warmwasserspeicher" },
    { src: U("1581092160562-40aa08e78837"), alt: "Technische Wartung" },
    { src: U("1574269909862-7e1d70bb8078"), alt: "Rohrleitungen Technikraum" },
    { src: U("1590479773265-7464e5d48118"), alt: "Monteur bei Arbeit" },
  ],
  "Leitungsbau": [
    { src: U("1504307651254-35680f356dfd"), alt: "Rohrverlegung auf Baustelle" },
    { src: U("1581092918056-0c4c3acd3789"), alt: "Kupferrohre und Anschlüsse" },
    { src: U("1513467535987-fd81bc7d62f8"), alt: "Professionelle Installation" },
    { src: U("1565008447742-97f6f38c985c"), alt: "Schweissarbeiten Rohre" },
    { src: U("1541123603104-512919d6a96c"), alt: "Baustelle Leitungsbau" },
  ],
  "Reparaturservice": [
    { src: U("1621905251189-08b02e8588fd"), alt: "Werkzeugkasten Monteur" },
    { src: U("1607472586893-edb57bdc0e39"), alt: "Reparatur unter Spüle" },
    { src: U("1585704032915-9f4cb67e55c3"), alt: "Monteur bei der Arbeit" },
    { src: U("1572981779307-38b8cabb2407"), alt: "Rohrzange und Werkzeuge" },
    { src: U("1558618666-fcd25c85f82e"), alt: "Notfall-Einsatz" },
  ],
};

const SERVICE_CATEGORY_MAP: Record<string, string> = {
  "Sanitär": "Sanitär allgemein",
  "Heizung": "Heizung",
  "Boiler & Warmwasser": "Boiler",
  "Reparaturservice": "Sanitär allgemein",
};

const TEAM = [
  {
    name: "Thomas Brunner",
    role: "Inhaber / Sanitärmeister",
    img: U("1560250097-0b93528c311a"), // professional male portrait
  },
  {
    name: "Marco Steiner",
    role: "Projektleiter Heizung",
    img: U("1507003211169-0a1dd7228f2d"), // friendly male portrait
  },
  {
    name: "Luca Berger",
    role: "Sanitärmonteur",
    img: U("1500648767791-00dcc994a43e"), // young professional
  },
];

const REVIEWS = [
  {
    author: "Claudia M.",
    rating: 5,
    date: "vor 2 Wochen",
    text: "Rohrbruch in der Küche — innert einer Stunde war jemand da. Schnelle, professionelle Hilfe. Absolut empfehlenswert!",
  },
  {
    author: "Peter Keller",
    rating: 5,
    date: "vor 1 Monat",
    text: "Brunner hat unsere gesamte Heizung ersetzt. Tolle Beratung, faire Preise und eine saubere Baustelle. Wir sind begeistert.",
  },
  {
    author: "Sandra W.",
    rating: 5,
    date: "vor 2 Monaten",
    text: "Rohrbruch am Sonntagabend — innert 45 Minuten war jemand da. Das nenne ich Notdienst! Danke an das ganze Team.",
  },
  {
    author: "Martin Huber",
    rating: 5,
    date: "vor 3 Monaten",
    text: "Badsanierung von A bis Z. Termingerecht, saubere Baustelle und ein Ergebnis, das sich sehen lassen kann. Top!",
  },
  {
    author: "Ursula Schmid",
    rating: 4,
    date: "vor 4 Monaten",
    text: "Boiler-Wartung schnell und unkompliziert erledigt. Freundliches Team und fairer Preis. Gerne wieder.",
  },
];

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                  */
/* ------------------------------------------------------------------ */
function PhoneIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg className={`h-5 w-5 ${filled ? "text-amber-400" : "text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default function BrunnerHaustechnikDemo() {
  const wizardUrl = "/brunner-haustechnik/meldung";

  return (
    <div className="bg-white text-[#1a1a1a]">
      {/* ============ 1. NAVIGATION (sticky) ============ */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-20">
          <a href="#" className="text-lg lg:text-xl font-bold tracking-tight" style={{ color: theme.primaryHex }}>
            {theme.logoText}
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#leistungen" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Leistungen</a>
            <a href="#bewertungen" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Bewertungen</a>
            <a href="#team" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Team</a>
            <a href="#kontakt" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Kontakt</a>
            <a href={theme.phoneHref} className="hidden lg:flex items-center gap-1.5 text-sm font-semibold" style={{ color: theme.primaryHex }}>
              <PhoneIcon className="w-4 h-4" />
              {theme.phone}
            </a>
            <a href={theme.phoneHref} className="rounded-lg bg-[#c41e3a] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90">
              24h Notdienst
            </a>
          </div>

          {/* Mobile nav */}
          <div className="flex items-center gap-2 md:hidden">
            <a href={wizardUrl} className="rounded-lg px-3 py-2 text-sm font-semibold text-white" style={{ backgroundColor: theme.accentHex }}>
              Melden
            </a>
            <a href={theme.phoneHref} className="rounded-lg bg-[#c41e3a] px-3 py-2 text-sm font-bold text-white">
              Notfall
            </a>
          </div>
        </div>
      </nav>

      <main>
        {/* ============ 2. HERO (full-bleed image) ============ */}
        <section className="relative min-h-[90vh] flex items-center pt-20">
          <div
            className="absolute inset-0 bg-cover bg-center"
            role="img"
            aria-label="Sanitär-Fachmann bei der Arbeit"
            style={{ backgroundImage: `url(${HERO_IMG})` }}
          />
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(15, 76, 84, 0.80)" }} />

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Sanitär &amp; Heizung
                <br />
                in {theme.location}
              </h1>

              <p className="text-lg lg:text-xl text-white/80 leading-relaxed mb-10 max-w-xl">
                Ihr Spezialist für Sanitär, Heizung und Haustechnik.
                Persönlich, zuverlässig, regional — seit {theme.founded}.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={wizardUrl}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg text-white font-semibold text-lg transition-all hover:brightness-110"
                  style={{ backgroundColor: theme.accentHex }}
                >
                  Schaden online melden
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

            {/* Trust chips */}
            <div className="mt-16 flex flex-wrap gap-3">
              {theme.proofItems.map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 rounded-full border border-white/20 text-white/90 text-sm font-medium backdrop-blur-sm bg-white/5"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 3. LEISTUNGEN (5 Services + Gallery) ============ */}
        <section id="leistungen" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: theme.primaryHex }}>
              Unsere Leistungen
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-14 max-w-2xl">
              {theme.teamSize} — ein Team. Fünf Fachbereiche. Alles aus einer Hand.
            </p>

            <div className="space-y-4">
              {theme.services.map((svc) => {
                const images = SERVICE_IMAGES[svc.name] ?? [];
                const cat = SERVICE_CATEGORY_MAP[svc.name];
                const href = cat
                  ? `/brunner-haustechnik/meldung?category=${encodeURIComponent(cat)}`
                  : wizardUrl;
                return (
                  <details key={svc.name} className="group rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
                    <summary className="flex cursor-pointer items-center gap-4 p-5 sm:p-6 [&::-webkit-details-marker]:hidden">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: theme.accentHex }}>
                        <ServiceIconSvg name={svc.name} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold" style={{ color: theme.primaryHex }}>{svc.name}</h3>
                        <p className="mt-0.5 text-sm text-gray-600 line-clamp-1">{svc.desc}</p>
                      </div>
                      {/* Preview thumbnails (desktop) */}
                      {images.length > 0 && (
                        <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                          {images.slice(0, 2).map((img, i) => (
                            <div key={i} className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img.src} alt="" className="h-full w-full object-cover" loading="lazy" />
                            </div>
                          ))}
                          {images.length > 2 && (
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-500">
                              +{images.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                      <svg className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </summary>
                    <div className="border-t border-gray-100 px-5 sm:px-6 pb-6 pt-4">
                      <p className="mb-5 max-w-3xl leading-relaxed text-gray-600">{svc.desc}</p>
                      {images.length > 0 && (
                        <div>
                          <p className="mb-3 text-sm font-medium text-gray-500">Referenzbilder — klicken zum Vergrössern</p>
                          <ServiceGallery images={images} />
                        </div>
                      )}
                      <a
                        href={href}
                        className="mt-5 inline-flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
                        style={{ color: theme.accentHex }}
                      >
                        Jetzt melden &rarr;
                      </a>
                    </div>
                  </details>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <a
                href={wizardUrl}
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg text-white font-semibold text-lg transition-all hover:brightness-110"
                style={{ backgroundColor: theme.accentHex }}
              >
                Jetzt online melden
              </a>
            </div>
          </div>
        </section>

        {/* ============ 4. NOTFALL CTA ============ */}
        <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: theme.accentHex }}>
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              24h Notdienst
            </h2>
            <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-2xl mx-auto">
              Rohrbruch, Wasserschaden oder Heizungsausfall?
              <br />
              Rufen Sie uns an — wir sind innert 60 Minuten bei Ihnen.
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
                href={wizardUrl}
                className="inline-flex items-center justify-center px-10 py-5 rounded-lg border-2 border-white/30 text-white font-bold text-xl hover:bg-white/10 transition-colors"
              >
                Online melden
              </a>
            </div>
          </div>
        </section>

        {/* ============ 5. GOOGLE BEWERTUNGEN (WOW Section) ============ */}
        <section id="bewertungen" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              {/* Google logo + rating */}
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 mb-6">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-sm font-medium text-white/90">Google Bewertungen</span>
              </div>

              <div className="mb-3 flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} filled={i < 5} />
                ))}
              </div>
              <p className="text-3xl font-bold">4.8 von 5 Sternen</p>
              <p className="mt-2 text-sm text-gray-400">Basierend auf 52 Google-Bewertungen</p>
            </div>

            {/* Review cards */}
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {REVIEWS.slice(0, 3).map((r, i) => (
                <div key={i} className="rounded-2xl border border-gray-700 bg-gray-800/50 p-6">
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <svg key={j} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-200">&ldquo;{r.text}&rdquo;</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span className="font-medium text-white">{r.author}</span>
                    <span>{r.date}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom row (2 more reviews) */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {REVIEWS.slice(3).map((r, i) => (
                <div key={i} className="rounded-2xl border border-gray-700 bg-gray-800/50 p-6">
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <svg key={j} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-200">&ldquo;{r.text}&rdquo;</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span className="font-medium text-white">{r.author}</span>
                    <span>{r.date}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <a
                href="https://www.google.com/maps/place/Thalwil"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Alle Bewertungen auf Google ansehen →
              </a>
            </div>
          </div>
        </section>

        {/* ============ 6. SO FUNKTIONIERT'S ============ */}
        <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: theme.lightBgHex }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-center" style={{ color: theme.primaryHex }}>
              So funktioniert&apos;s
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-16 text-center max-w-2xl mx-auto">
              In drei einfachen Schritten zu Ihrer Lösung.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  step: "1",
                  title: "Problem melden",
                  desc: "Per Telefon, online oder über unseren digitalen Assistenten — rund um die Uhr. Wir erfassen Ihr Anliegen sofort.",
                },
                {
                  step: "2",
                  title: "Termin erhalten",
                  desc: "Wir bewerten Ihr Anliegen und melden uns innert 2 Stunden mit einem konkreten Terminvorschlag.",
                },
                {
                  step: "3",
                  title: "Problem gelöst",
                  desc: "Unser Team kommt zu Ihnen und erledigt den Job — sauber, termingerecht, erledigt.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-6"
                    style={{ backgroundColor: theme.accentHex }}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: theme.primaryHex }}>
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 7. UNSER TEAM ============ */}
        <section id="team" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: theme.primaryHex }}>
                Unser Team
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-14 max-w-2xl mx-auto">
                {theme.teamSize} mit Leidenschaft für Haustechnik.
                Persönlich, kompetent und immer für Sie da.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {TEAM.map((m) => (
                <div key={m.name} className="text-center">
                  <div className="mx-auto h-40 w-40 overflow-hidden rounded-2xl bg-gray-200 mb-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.img} alt={m.name} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <h3 className="text-lg font-semibold">{m.name}</h3>
                  <p className="text-sm font-medium" style={{ color: theme.accentHex }}>{m.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 8. EINZUGSGEBIET ============ */}
        <section id="einzugsgebiet" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="overflow-hidden rounded-2xl bg-white border border-gray-200">
              <div className="grid lg:grid-cols-2">
                <div className="p-8 sm:p-10 lg:p-14">
                  <h2 className="text-3xl lg:text-4xl font-bold mb-3" style={{ color: theme.primaryHex }}>
                    Ihr lokaler Partner
                  </h2>
                  <p className="text-lg mb-6" style={{ color: theme.accentHex }}>
                    {theme.brandName} — {theme.serviceArea}
                  </p>
                  <p className="leading-relaxed text-gray-600 mb-8">
                    Wir betreuen Privathaushalte und Gewerbeobjekte am gesamten linken
                    Zürichseeufer — von Kilchberg bis Wädenswil.
                    Schnelle Anfahrt, persönlicher Service.
                  </p>

                  <p className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-400">
                    Wir sind vor Ort in
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {theme.gemeinden.map((g) => (
                      <span key={g} className="px-3 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-700">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Map embed */}
                <div className="min-h-[350px] bg-gray-100">
                  <iframe
                    src="https://maps.google.com/maps?q=Seestrasse+42,+8800+Thalwil,+Schweiz&t=&z=13&ie=UTF8&iwloc=&output=embed"
                    className="h-full min-h-[350px] w-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Standort Brunner Haustechnik AG"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 9. KARRIERE ============ */}
        <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Karriere bei {theme.brandName}
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed mb-14 max-w-2xl mx-auto">
                Wir suchen Verstärkung. Werde Teil eines motivierten Teams
                mit familiärer Atmosphäre.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-semibold">Sanitärmonteur/in EFZ</h3>
                    <span className="inline-block mt-2 rounded-full bg-white/10 px-3 py-0.5 text-xs font-medium text-white/70">
                      Vollzeit · 100%
                    </span>
                  </div>
                  <a
                    href={`mailto:${theme.email}?subject=Bewerbung: Sanitärmonteur/in EFZ`}
                    className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110"
                    style={{ backgroundColor: theme.accentHex }}
                  >
                    Jetzt bewerben
                  </a>
                </div>
                <p className="text-sm leading-relaxed text-gray-300 mb-5">
                  Zur Verstärkung unseres Teams suchen wir eine/n motivierte/n Sanitärmonteur/in.
                  Du arbeitest selbständig auf Baustellen in der Region und betreust Projekte
                  von der Reparatur bis zur Neubau-Installation.
                </p>
                <p className="mb-3 text-sm font-semibold text-gray-200">Anforderungen:</p>
                <ul className="space-y-1.5">
                  {[
                    "Abgeschlossene Lehre als Sanitärinstallateur/in EFZ",
                    "Mindestens 2 Jahre Berufserfahrung",
                    "Führerschein Kat. B",
                    "Teamfähig, zuverlässig und kundenorientiert",
                    "Gute Deutschkenntnisse",
                  ].map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-white/50">•</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 10. KONTAKT + FOOTER ============ */}
        <section id="kontakt" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            {/* CTA Banner */}
            <div className="mb-14 rounded-2xl p-8 sm:p-10 text-center text-white" style={{ backgroundColor: theme.accentHex }}>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Schaden melden — schnell und unkompliziert
              </h2>
              <p className="mx-auto max-w-xl text-white/80 mb-6">
                Nutzen Sie unseren digitalen Assistenten, um Ihren Schaden direkt zu erfassen.
                Wir melden uns umgehend bei Ihnen.
              </p>
              <a
                href={wizardUrl}
                className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-semibold transition-opacity hover:opacity-90"
                style={{ color: theme.primaryHex }}
              >
                Jetzt Schaden melden →
              </a>
            </div>

            {/* Contact info */}
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold mb-3" style={{ color: theme.primaryHex }}>Kontakt</h2>
                <p className="text-lg text-gray-600 mb-8">Wir freuen uns auf Ihre Anfrage</p>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: theme.accentHex }}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">{theme.brandName}</p>
                      <p className="text-sm text-gray-600">{theme.address}</p>
                      <a href={theme.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm transition-colors hover:underline" style={{ color: theme.accentHex }}>
                        Auf Google Maps anzeigen →
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: theme.accentHex }}>
                      <PhoneIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <a href={theme.phoneHref} className="font-semibold hover:underline" style={{ color: theme.primaryHex }}>{theme.phone}</a>
                      <p className="text-sm text-gray-600">24h Notdienst erreichbar</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: theme.accentHex }}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div>
                      <a href={`mailto:${theme.email}`} className="font-semibold hover:underline" style={{ color: theme.primaryHex }}>{theme.email}</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: theme.accentHex }}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: theme.primaryHex }}>Öffnungszeiten</p>
                      {theme.openingHours.map((h, i) => (
                        <p key={i} className="text-sm text-gray-600">{h}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <iframe
                  src="https://maps.google.com/maps?q=Seestrasse+42,+8800+Thalwil,+Schweiz&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="h-full min-h-[350px] w-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Standort Brunner Haustechnik AG"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: theme.primaryHex }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <p className="text-lg font-bold text-white mb-2">{theme.brandName}</p>
              <p className="text-sm text-white/60">{theme.address}</p>
              <p className="text-sm text-white/60">{theme.phone} · {theme.email}</p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3">
              <div className="flex items-center gap-4">
                <a href="/brunner-haustechnik/impressum" className="text-xs text-white/40 hover:text-white/60 transition-colors">Impressum</a>
                <a href="/brunner-haustechnik/datenschutz" className="text-xs text-white/40 hover:text-white/60 transition-colors">Datenschutz</a>
              </div>
              <p className="text-xs text-white/40">
                &copy; {new Date().getFullYear()} {theme.brandName}. Alle Rechte vorbehalten.
              </p>
              <p className="text-xs text-white/30">
                Website powered by <a href="https://flowsight.ch" className="text-white/40 hover:text-white/60 transition-colors">FlowSight</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Service Icon SVG                                                  */
/* ------------------------------------------------------------------ */
function ServiceIconSvg({ name }: { name: string }) {
  const cls = "h-6 w-6";
  switch (name) {
    case "Sanitär":
      return <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5M3.75 12a2.25 2.25 0 01-2.25-2.25V6a2.25 2.25 0 012.25-2.25h.386c.51 0 .983.273 1.237.718L6.75 6.75M3.75 12v4.5a2.25 2.25 0 002.25 2.25h12a2.25 2.25 0 002.25-2.25V12" /></svg>;
    case "Heizung":
      return <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" /></svg>;
    case "Boiler & Warmwasser":
      return <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47m0 0a3.375 3.375 0 01-4.773 0L5 14.5m6.757 2.47a3.375 3.375 0 01-4.773 0" /></svg>;
    case "Leitungsbau":
      return <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1 5.1a2.121 2.121 0 01-3-3l5.1-5.1m0 0L15.17 4.42A2.121 2.121 0 0118.17 1.42l2.83 2.83a2.121 2.121 0 01-3 3L10.42 14.17z" /></svg>;
    case "Reparaturservice":
      return <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1 5.1a2.121 2.121 0 01-3-3l5.1-5.1" /><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" /></svg>;
    default:
      return <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1 5.1a2.121 2.121 0 01-3-3l5.1-5.1" /></svg>;
  }
}
