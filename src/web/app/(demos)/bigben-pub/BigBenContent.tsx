"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ReservationForm } from "./ReservationForm";

const IMG = (n: string) => `/images/kunden/bigben-pub/${n}`;

/* ── i18n ────────────────────────────────────────────────────────── */
const t = {
  en: {
    estLine: "Est. Oberrieden",
    heroSub: "Your neighbourhood pub on the lake.",
    heroSub2: "Great beer, proper food, live sport & events.",
    bookTable: "Book a Table",
    seeMenu: "See the Menu",
    aboutLabel: "About Us",
    aboutH1: "A proper British pub,",
    aboutH2: "right on the Zürichsee.",
    aboutP1:
      "Big Ben Pub is the heart of Oberrieden's social life — a cosy, no-nonsense pub where locals and visitors gather over a perfectly poured Guinness, classic pub food, and the roar of live sport on the big screens.",
    aboutP2:
      "Whether it's Premier League Saturday, Quiz Night, live music from talented local acts, or just a quiet midweek pint — there's always a reason to stop by.",
    guinness: "Best Guinness on the Lake",
    guinnessDesc: "Ask anyone in Oberrieden. It's not even close.",
    eventsLabel: "What's On",
    eventsTitle: "There's always something happening.",
    evKaraokeTitle: "Karaoke Night",
    evKaraokeWhen: "Every Friday",
    evKaraokeDesc: "Grab the mic and show what you've got. All genres, all levels — the crowd decides who's the star.",
    evQuizTitle: "Quiz Night",
    evQuizWhen: "Every Wednesday",
    evQuizDesc: "Teams of up to 6. General knowledge, music rounds, picture rounds. Prizes for the winners. No phones!",
    evMusicTitle: "Live Music",
    evMusicWhen: "Every Saturday",
    evMusicDesc: "From Irish folk to rock covers — talented local and international acts on our small but mighty stage.",
    evSportTitle: "Live Sport",
    evSportDesc: "Premier League, Champions League, Rugby — every matchday on the big screens.",
    evDartsTitle: "Darts",
    evDartsDesc: "Two boards, open play. Dart league coming autumn 2026.",
    evPrivateTitle: "Private Events",
    evPrivateDesc: "Birthdays, celebrations — talk to Paul.",
    evTerraceTitle: "Terrace",
    evTerraceDesc: "Open year-round for sunny pints.",
    menuLabel: "Food & Drinks",
    menuTitle: "Proper pub grub & a great pour.",
    pubBites: "Pub Bites",
    pubBitesNote: "Ask at the bar for today's specials",
    fromBar: "From the Bar",
    fromBarNote: "Wide selection on tap and by the bottle",
    onTap: "On Tap",
    bottlesMore: "Bottles & More",
    reviewsLabel: "Reviews",
    reviewsTitle: "What our guests say.",
    reviewsOnGoogle: "on Google",
    galleryLabel: "Gallery",
    galleryTitle: "See for yourself.",
    reserveLabel: "Reservations",
    reserveTitle: "Book your table.",
    reserveDesc: "Pick a date, time and party size — we'll confirm your reservation by SMS.",
    hoursLabel: "Opening Hours",
    hoursTitle: "When to find us.",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    closed: "Closed",
    followUs: "Follow us on Instagram",
  },
  de: {
    estLine: "Est. Oberrieden",
    heroSub: "Euer Quartier-Pub am Zürichsee.",
    heroSub2: "Gutes Bier, ehrliches Essen, Live-Sport & Events.",
    bookTable: "Tisch reservieren",
    seeMenu: "Zur Karte",
    aboutLabel: "Über uns",
    aboutH1: "Ein echter British Pub,",
    aboutH2: "direkt am Zürichsee.",
    aboutP1:
      "Das Big Ben Pub ist das Herz des gesellschaftlichen Lebens in Oberrieden — ein gemütlicher, unkomplizierter Pub, in dem Einheimische und Besucher bei einem perfekt gezapften Guinness, klassischem Pub Food und Live-Sport zusammenkommen.",
    aboutP2:
      "Ob Premier League am Samstag, Quiz Night, Live-Musik von talentierten lokalen Acts oder einfach ein ruhiges Feierabendbier — es gibt immer einen Grund vorbeizuschauen.",
    guinness: "Bestes Guinness der Region",
    guinnessDesc: "Fragt jeden in Oberrieden. Ohne Konkurrenz.",
    eventsLabel: "Programm",
    eventsTitle: "Bei uns ist immer etwas los.",
    evKaraokeTitle: "Karaoke Night",
    evKaraokeWhen: "Jeden Freitag",
    evKaraokeDesc: "Schnapp dir das Mikro und zeig was du drauf hast. Alle Genres, alle Levels — das Publikum entscheidet.",
    evQuizTitle: "Quiz Night",
    evQuizWhen: "Jeden Mittwoch",
    evQuizDesc: "Teams bis 6 Personen. Allgemeinwissen, Musik- und Bilderrunden. Preise für die Gewinner. Keine Handys!",
    evMusicTitle: "Live-Musik",
    evMusicWhen: "Jeden Samstag",
    evMusicDesc: "Von Irish Folk bis Rock-Covers — talentierte lokale und internationale Acts auf unserer kleinen, aber feinen Bühne.",
    evSportTitle: "Live-Sport",
    evSportDesc: "Premier League, Champions League, Rugby — jeden Spieltag auf den grossen Screens.",
    evDartsTitle: "Darts",
    evDartsDesc: "Zwei Boards, offenes Spiel. Dart-Liga ab Herbst 2026.",
    evPrivateTitle: "Private Events",
    evPrivateDesc: "Geburtstag, Firmenfeier — sprich mit Paul.",
    evTerraceTitle: "Terrasse",
    evTerraceDesc: "Ganzjährig offen für sonnige Biere.",
    menuLabel: "Essen & Trinken",
    menuTitle: "Ehrliches Pub Food & ein perfekter Zapf.",
    pubBites: "Pub Bites",
    pubBitesNote: "Frag an der Bar nach den Tagesangeboten",
    fromBar: "Von der Bar",
    fromBarNote: "Grosse Auswahl vom Fass und aus der Flasche",
    onTap: "Vom Fass",
    bottlesMore: "Flaschen & mehr",
    reviewsLabel: "Bewertungen",
    reviewsTitle: "Was unsere Gäste sagen.",
    reviewsOnGoogle: "auf Google",
    galleryLabel: "Galerie",
    galleryTitle: "Überzeug dich selbst.",
    reserveLabel: "Reservierung",
    reserveTitle: "Reservier deinen Tisch.",
    reserveDesc: "Wähle Datum, Uhrzeit und Personenzahl — wir bestätigen per SMS.",
    hoursLabel: "Öffnungszeiten",
    hoursTitle: "Wann du uns findest.",
    monday: "Montag",
    tuesday: "Dienstag",
    wednesday: "Mittwoch",
    thursday: "Donnerstag",
    friday: "Freitag",
    saturday: "Samstag",
    sunday: "Sonntag",
    closed: "Geschlossen",
    followUs: "Folge uns auf Instagram",
  },
} as const;

type Lang = keyof typeof t;

/* ── Reviews data ────────────────────────────────────────────────── */
const REVIEWS = [
  {
    name: "Alexandra Keusch",
    text: "Always love coming to Big Ben pub! We often end up here on a Sunday afternoon for a Guinness and the live Irish music. Highly recommend!",
    initial: "A",
    color: "bg-[#a2774b]",
  },
  {
    name: "Victor Lupu",
    badge: "Local Guide",
    text: "Everything about this pub is fantastic, cozy atmosphere, great food and amazing service. The bartender was very polite and friendly. Definitely a 10/10!",
    initial: "V",
    color: "bg-emerald-600",
  },
  {
    name: "Nina Vuckovic",
    text: "Great atmosphere with proper live Irish Music. The beer is great too. Super friendly owner. Can recommend 10/10!",
    initial: "N",
    color: "bg-amber-600",
  },
  {
    name: "David H",
    text: "If you want to catch up with friends, and meet some new ones, swap life stories, then good place to be and have a great pint.",
    initial: "D",
    color: "bg-blue-600",
  },
  {
    name: "Nicola Sidler",
    text: "Best Pub around! Great staff and friendly customers — highly recommendable!",
    initial: "N",
    color: "bg-purple-600",
  },
  {
    name: "Jason Schupp",
    badge: "Local Guide",
    text: "Big Ben Pub offers up a warm and familiar atmosphere. Awesome spicy homemade chicken wings. Enjoyed it so much we came back a second night. Great place to unwind.",
    initial: "J",
    color: "bg-orange-600",
  },
];

/* ── Stars ────────────────────────────────────────────────────────── */
function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 text-amber-400" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ── Instagram icon ──────────────────────────────────────────────── */
function IcInstagram({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */
export function BigBenContent() {
  const [lang, setLang] = useState<Lang>("en");
  const s = t[lang];

  return (
    <div className="bg-[#1e1611] text-[#f0e8dc]">
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div className="fixed top-0 z-50 flex w-full items-center justify-between bg-[#1e1611]/95 px-4 py-2.5 shadow-sm backdrop-blur-md">
        <a
          href="https://www.instagram.com/bigbenpubzh/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-2.5 py-1 text-xs font-semibold text-white transition-transform hover:scale-105"
        >
          <IcInstagram className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">@bigbenpubzh</span>
        </a>
        <span className="font-serif text-xs font-bold tracking-wider text-[#f0e8dc]">
          BIG BEN
          <br />
          PUB
        </span>
        <button
          onClick={() => setLang(lang === "en" ? "de" : "en")}
          className="flex items-center gap-1.5 rounded-full border border-[#3a2e26] bg-[#2a1f1a] px-2.5 py-1 text-[10px] font-bold tracking-wider transition-all hover:border-[#c0392b] hover:shadow-sm"
        >
          <span className="inline-flex h-4 w-5 items-center justify-center overflow-hidden rounded-[2px] shadow-sm">
            {lang === "en" ? (
              /* DE flag */
              <svg viewBox="0 0 5 3" className="h-full w-full">
                <rect width="5" height="1" fill="#000" />
                <rect y="1" width="5" height="1" fill="#D00" />
                <rect y="2" width="5" height="1" fill="#FFCE00" />
              </svg>
            ) : (
              /* GB flag simplified */
              <svg viewBox="0 0 60 30" className="h-full w-full">
                <rect width="60" height="30" fill="#012169" />
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="3" />
                <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
                <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
              </svg>
            )}
          </span>
          {lang === "en" ? "Deutsch" : "English"}
        </button>
      </div>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <Image
          src={IMG("inside.png")}
          alt="Big Ben Pub — Live music evening"
          fill
          className="object-cover brightness-[0.4]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1210]/80 via-transparent to-transparent" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#a2774b]">
            {s.estLine}
          </p>
          <h1 className="mt-4 font-serif text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
            Big Ben Pub
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/80">
            {s.heroSub}
            <br />
            {s.heroSub2}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#reserve"
              className="rounded-lg bg-[#a2774b] px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[#e74c3c] hover:shadow-lg hover:shadow-[#c0392b]/25"
            >
              {s.bookTable}
            </a>
            <a
              href="#menu"
              className="rounded-lg border border-white/30 px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:border-white/60 hover:bg-[#2a1f1a]/10"
            >
              {s.seeMenu}
            </a>
          </div>
        </div>
      </section>

      {/* ── GUINNESS BANNER ─────────────────────────────────────── */}
      <section className="border-b border-[#3a2e26] bg-gradient-to-r from-[#1a1210] via-[#2c1e14] to-[#1a1210] py-5">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-2 px-6 sm:flex-row sm:gap-4">
          <span className="text-3xl">🍺</span>
          <p className="text-center font-serif text-xl font-bold text-amber-100 sm:text-2xl">
            {s.guinness}
          </p>
          <span className="hidden text-amber-100/30 sm:inline">—</span>
          <p className="text-center text-sm text-amber-100/70">{s.guinnessDesc}</p>
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a2774b]">
                {s.aboutLabel}
              </p>
              <h2 className="mt-3 font-serif text-4xl font-bold leading-tight text-[#f0e8dc]">
                {s.aboutH1}
                <br />
                {s.aboutH2}
              </h2>
              <p className="mt-6 text-base leading-relaxed text-[#555]">
                {s.aboutP1}
              </p>
              <p className="mt-4 text-base leading-relaxed text-[#555]">
                {s.aboutP2}
              </p>
              <div className="mt-10 grid grid-cols-3 gap-6">
                <Stat value="4.7" label="Google Stars" />
                <Stat value="186+" label="Reviews" />
                <Stat value="40+" label="Seats" />
              </div>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-xl">
              <Image
                src={IMG("bar.png")}
                alt="The Big Ben Pub bar"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── EVENTS (dynamic from DB) ──────────────────────────── */}
      <DynamicEvents lang={lang} />

      {/* ── PERMANENT FEATURES ────────────────────────────────── */}
      <section className="bg-[#261b15] py-12">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MiniFeature emoji="🎯" title={s.evDartsTitle} desc={s.evDartsDesc} />
            <MiniFeature emoji="🎂" title={s.evPrivateTitle} desc={s.evPrivateDesc} />
            <MiniFeature emoji="☀️" title={s.evTerraceTitle} desc={s.evTerraceDesc} />
            <MiniFeature emoji="🍺" title={s.guinness} desc={s.guinnessDesc} />
          </div>
        </div>
      </section>

      {/* ── MENU ────────────────────────────────────────────────── */}
      <section id="menu" className="scroll-mt-16 py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#a2774b]">
            {s.menuLabel}
          </p>
          <h2 className="mt-3 text-center font-serif text-4xl font-bold">
            {s.menuTitle}
          </h2>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {/* Food */}
            <div className="rounded-2xl border border-[#3a2e26] bg-[#2a1f1a] p-8 shadow-sm">
              <h3 className="font-serif text-2xl font-bold text-[#a2774b]">{s.pubBites}</h3>
              <p className="mt-1 text-sm text-[#7a6b58]">{s.pubBitesNote}</p>
              <ul className="mt-6 space-y-3">
                {[
                  "Chicken Wings (classic & spicy)",
                  "Loaded Nachos with guacamole & sour cream",
                  "Club Sandwich",
                  "Beef Burger with chips",
                  "Fish & Chips",
                  "Sausage & Mash",
                  "Toasted Sandwiches",
                  "Chips & Dips",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-[#c8b99a]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#a2774b]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Drinks */}
            <div className="rounded-2xl border border-[#3a2e26] bg-[#2a1f1a] p-8 shadow-sm">
              <h3 className="font-serif text-2xl font-bold text-[#a2774b]">{s.fromBar}</h3>
              <p className="mt-1 text-sm text-[#7a6b58]">{s.fromBarNote}</p>
              <div className="mt-6 space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#7a6b58]">{s.onTap}</p>
                  <ul className="mt-2 space-y-2">
                    {["Guinness", "Pale Ale", "Lager", "Cider", "Seasonal Guest Ale"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-[#c8b99a]">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#a2774b]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#7a6b58]">{s.bottlesMore}</p>
                  <ul className="mt-2 space-y-2">
                    {[
                      "Craft Beers (rotating selection)",
                      "Wines (red, white, ros\u00e9)",
                      "Cocktails & Highballs",
                      "Spirits & Whisky",
                      "Soft Drinks & Coffee",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-[#c8b99a]">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#a2774b]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ─────────────────────────────────────────────── */}
      <section className="bg-[#261b15] py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#a2774b]">
            {s.reviewsLabel}
          </p>
          <h2 className="mt-3 text-center font-serif text-4xl font-bold">
            {s.reviewsTitle}
          </h2>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Stars />
            <span className="text-sm font-semibold text-[#f0e8dc]">4.7</span>
            <span className="text-sm text-[#8a7a66]">— 186+ Reviews {s.reviewsOnGoogle}</span>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {REVIEWS.map((r) => (
              <div
                key={r.name}
                className="rounded-2xl border border-[#3a2e26] bg-[#2a1f1a] p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <Stars />
                <p className="mt-4 text-sm leading-relaxed text-[#c8b99a]">
                  &ldquo;{r.text}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${r.color}`}
                  >
                    {r.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{r.name}</p>
                    {r.badge && (
                      <p className="text-xs text-[#7a6b58]">{r.badge}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ─────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#a2774b]">
            {s.galleryLabel}
          </p>
          <h2 className="mt-3 text-center font-serif text-4xl font-bold">
            {s.galleryTitle}
          </h2>

          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { src: "outside2.png", alt: "Terrace seating" },
              { src: "inside.png", alt: "Live music evening" },
              { src: "bar.png", alt: "The bar" },
              { src: "guinness2.png", alt: "Guinness at the bar" },
              { src: "foot.png", alt: "Chicken Wings & Nachos" },
              { src: "food_nachos.png", alt: "Loaded Nachos on the terrace" },
              { src: "drinks2.png", alt: "Cocktails at the bar" },
              { src: "darts.jpg", alt: "Darts at Big Ben Pub" },
            ].map((img) => (
              <div key={img.src} className="group relative aspect-square overflow-hidden rounded-xl shadow-sm">
                <Image
                  src={IMG(img.src)}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESERVE ─────────────────────────────────────────────── */}
      <section id="reserve" className="scroll-mt-16 bg-[#261b15] py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#a2774b]">
            {s.reserveLabel}
          </p>
          <h2 className="mt-3 text-center font-serif text-4xl font-bold">
            {s.reserveTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-center text-sm text-[#8a7a66]">
            {s.reserveDesc}
          </p>

          <div className="mt-10">
            <ReservationForm />
          </div>
        </div>
      </section>

      {/* ── HOURS & LOCATION ────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-2">
            {/* Hours */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a2774b]">
                {s.hoursLabel}
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold">{s.hoursTitle}</h2>
              <div className="mt-8 space-y-3">
                <HoursRow day={s.monday} hours={s.closed} closed />
                <HoursRow day={s.tuesday} hours="16:00 – 23:00" />
                <HoursRow day={s.wednesday} hours="16:00 – 23:00" />
                <HoursRow day={s.thursday} hours="16:00 – 23:00" />
                <HoursRow day={s.friday} hours="16:00 – 00:00" />
                <HoursRow day={s.saturday} hours="16:00 – 00:00" />
                <HoursRow day={s.sunday} hours="16:00 – 22:00" />
              </div>

              <div className="mt-10 space-y-2 text-sm text-[#8a7a66]">
                <p className="font-medium text-[#f0e8dc]">Alte Landstrasse 20, 8942 Oberrieden</p>
                <p>044 722 20 62</p>
                <a
                  href="https://www.instagram.com/bigbenpubzh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-medium text-[#a2774b] transition-colors hover:text-[#e74c3c]"
                >
                  <IcInstagram />
                  {s.followUs}
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <iframe
                title="Big Ben Pub Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2706.8!2d8.5835!3d47.2727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479aa9a6e3e3e3e3%3A0x0!2sBig+Ben+Pub+Oberrieden!5e0!3m2!1sde!2sch!4v1"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-[#3a2e26] bg-[#261b15] py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 text-center text-xs text-[#7a6b58]">
          <a
            href="https://www.instagram.com/bigbenpubzh/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#a2774b] transition-colors hover:text-[#e74c3c]"
          >
            <IcInstagram />
            <span className="text-sm font-medium">@bigbenpubzh</span>
          </a>
          <p>Big Ben Pub &middot; Alte Landstrasse 20 &middot; 8942 Oberrieden</p>
          <p>
            Website by{" "}
            <a href="https://flowsight.ch" className="font-medium text-[#a2774b] hover:underline">
              FlowSight
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-bold text-[#a2774b]">{value}</p>
      <p className="mt-1 text-xs font-medium text-[#7a6b58]">{label}</p>
    </div>
  );
}

function BigEventCard({
  emoji,
  title,
  when,
  desc,
  accent,
}: {
  emoji: string;
  title: string;
  when: string;
  desc: string;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#3a2e26] bg-[#2a1f1a] p-7 shadow-sm transition-all hover:shadow-lg">
      <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${accent}`} />
      <div className="text-4xl">{emoji}</div>
      <h3 className="mt-4 font-serif text-xl font-bold">{title}</h3>
      <p className={`mt-1 inline-block rounded-full bg-gradient-to-r ${accent} px-3 py-0.5 text-xs font-bold text-white`}>
        {when}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-[#a89478]">{desc}</p>
    </div>
  );
}

function MiniFeature({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-[#3a2e26] bg-[#2a1f1a] p-5 shadow-sm">
      <span className="text-2xl">{emoji}</span>
      <p className="mt-2 text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-[#8a7a66]">{desc}</p>
    </div>
  );
}

// ── Dynamic Events from DB ────────────────────────────────────────
interface PubEvent {
  id: string;
  category: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
}

function DynamicEvents({ lang }: { lang: Lang }) {
  const [events, setEvents] = useState<PubEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Fetch events on mount
  useEffect(() => {
    fetch("/api/bigben-pub/events?days=21")
      .then((r) => r.json())
      .then((d) => { setEvents(d.events ?? []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded) return null;

  const sport = events.filter((e) => e.category === "sport");
  const pubEvents = events.filter((e) => e.category === "event");

  function fmtDate(iso: string) {
    const d = new Date(iso + "T12:00:00");
    const day = d.toLocaleDateString(lang === "en" ? "en-GB" : "de-CH", { weekday: "short" }).replace(/\.$/, "");
    const date = d.toLocaleDateString(lang === "en" ? "en-GB" : "de-CH", { day: "2-digit", month: "2-digit" });
    return `${day} ${date}`;
  }

  function fmtTime(time: string | null) {
    return time ? time.substring(0, 5) : "";
  }

  const sectionTitle = lang === "en" ? "What's On" : "Programm";
  const sportLabel = lang === "en" ? "Live Sport" : "Live-Sport";
  const eventsLabel = lang === "en" ? "Events" : "Events";

  return (
    <section id="events" className="scroll-mt-16 bg-[#261b15] py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#a2774b]">
          {sectionTitle}
        </p>
        <h2 className="mt-3 text-center font-serif text-4xl font-bold">
          {lang === "en" ? "There's always something happening." : "Bei uns ist immer etwas los."}
        </h2>

        {/* 2 columns: Sport | Events (desktop). Stacked on mobile. */}
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* Sport column */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#a2774b]">
              <span>⚽</span> {sportLabel}
            </h3>
            {sport.length === 0 && (
              <p className="text-sm text-[#7a6b58]">{lang === "en" ? "No matches scheduled." : "Keine Spiele geplant."}</p>
            )}
            <div className="space-y-3">
              {sport.map((e) => (
                <div key={e.id} className="rounded-xl border border-[#3a2e26] bg-[#2a1f1a] p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-xs text-[#7a6b58]">
                    <span className="font-semibold text-[#a89478]">{fmtDate(e.event_date)}</span>
                    {e.event_time && <span>{fmtTime(e.event_time)}</span>}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-[#333]">{e.title}</p>
                  {e.description && <p className="mt-1 text-xs text-[#8a7a66]">{e.description}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Events column */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#a2774b]">
              <span>🎵</span> {eventsLabel}
            </h3>
            {pubEvents.length === 0 && (
              <p className="text-sm text-[#7a6b58]">{lang === "en" ? "No events scheduled." : "Keine Events geplant."}</p>
            )}
            <div className="space-y-3">
              {pubEvents.map((e) => (
                <div key={e.id} className="rounded-xl border border-[#3a2e26] bg-[#2a1f1a] p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-xs text-[#7a6b58]">
                    <span className="font-semibold text-[#a89478]">{fmtDate(e.event_date)}</span>
                    {e.event_time && <span>{fmtTime(e.event_time)}</span>}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-[#333]">{e.title}</p>
                  {e.description && <p className="mt-1 text-xs text-[#8a7a66]">{e.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HoursRow({ day, hours, closed }: { day: string; hours: string; closed?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-[#3a2e26] pb-3">
      <span className="text-sm font-medium">{day}</span>
      <span className={`text-sm ${closed ? "text-[#5a4d40]" : "text-[#a89478]"}`}>
        {hours}
      </span>
    </div>
  );
}
