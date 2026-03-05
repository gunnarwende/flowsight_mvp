"use client";

import { useState } from "react";
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
    whatsOnLabel: "What's On",
    whatsOnTitle: "There's always something happening.",
    evKaraoke: "Karaoke Night",
    evKaraokeD: "Grab the mic and show what you've got. All genres welcome.",
    evQuiz: "Quiz Night",
    evQuizD: "Teams of up to 6. Prizes for the winners. No phones allowed.",
    evMusic: "Live Music",
    evMusicD: "Local and international acts. From acoustic to full bands.",
    evSport: "Live Sport",
    evSportD: "Premier League, Rugby, Champions League — every matchday.",
    evDarts: "Darts",
    evDartsD: "Two boards, open play. Dart league coming autumn 2026.",
    evPrivate: "Private Events",
    evPrivateD: "Birthday, work do, celebration? Talk to Paul about booking.",
    evTerrace: "Terrace",
    evTerraceD: "Open year-round. Perfect for a sunny afternoon pint.",
    evHappy: "Happy Hour",
    evHappyD: "Ask at the bar for today's specials.",
    menuLabel: "Food & Drinks",
    menuTitle: "Proper pub grub & a great pour.",
    pubBites: "Pub Bites",
    pubBitesNote: "Ask at the bar for today's specials",
    fromBar: "From the Bar",
    fromBarNote: "Wide selection on tap and by the bottle",
    onTap: "On Tap",
    bottlesMore: "Bottles & More",
    galleryLabel: "Gallery",
    galleryTitle: "See for yourself.",
    reserveLabel: "Reservations",
    reserveTitle: "Book your table.",
    reserveDesc:
      "Pick a date, time and party size — we'll confirm your reservation by SMS.",
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
    whatsOnLabel: "Programm",
    whatsOnTitle: "Bei uns ist immer etwas los.",
    evKaraoke: "Karaoke Night",
    evKaraokeD: "Schnapp dir das Mikro. Alle Genres willkommen.",
    evQuiz: "Quiz Night",
    evQuizD: "Teams bis 6 Personen. Preise für die Gewinner. Keine Handys.",
    evMusic: "Live-Musik",
    evMusicD: "Lokale und internationale Acts. Von Akustik bis Full Band.",
    evSport: "Live-Sport",
    evSportD: "Premier League, Rugby, Champions League — jeden Spieltag.",
    evDarts: "Darts",
    evDartsD: "Zwei Boards, offenes Spiel. Dart-Liga ab Herbst 2026.",
    evPrivate: "Private Events",
    evPrivateD: "Geburtstag, Firmenfeier? Sprich mit Paul über eine Buchung.",
    evTerrace: "Terrasse",
    evTerraceD: "Ganzjährig offen. Perfekt für ein Nachmittagsbier.",
    evHappy: "Happy Hour",
    evHappyD: "Frag an der Bar nach den heutigen Specials.",
    menuLabel: "Essen & Trinken",
    menuTitle: "Ehrliches Pub Food & ein perfekter Zapf.",
    pubBites: "Pub Bites",
    pubBitesNote: "Frag an der Bar nach den Tagesangeboten",
    fromBar: "Von der Bar",
    fromBarNote: "Grosse Auswahl vom Fass und aus der Flasche",
    onTap: "Vom Fass",
    bottlesMore: "Flaschen & mehr",
    galleryLabel: "Galerie",
    galleryTitle: "Überzeug dich selbst.",
    reserveLabel: "Reservierung",
    reserveTitle: "Reservier deinen Tisch.",
    reserveDesc:
      "Wähle Datum, Uhrzeit und Personenzahl — wir bestätigen per SMS.",
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

/* ── SVG Icons ───────────────────────────────────────────────────── */
function IcMic() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0v-6a3 3 0 0 0-3-3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5a7.5 7.5 0 0 1-15 0M12 18v4.5m-3 0h6" />
    </svg>
  );
}
function IcBrain() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3a3.75 3.75 0 0 0-3 6 3.75 3.75 0 0 0 .75 7.5H9m5.25-13.5a3.75 3.75 0 0 1 3 6 3.75 3.75 0 0 1-.75 7.5H15M9 16.5v4.5m6-4.5v4.5m-6 0h6" />
    </svg>
  );
}
function IcMusic() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 19.5 3-1.5 3 1.5v-15l-3 1.5-3-1.5v15Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5 3 7.5v12l6-3M15 4.5l6 3v12l-6-3" />
    </svg>
  );
}
function IcSport() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path strokeLinecap="round" d="M12 4v16M7 9l5 3-5 3" />
    </svg>
  );
}
function IcDarts() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <path strokeLinecap="round" d="M12 2v4m0 12v4M2 12h4m12 0h4" />
    </svg>
  );
}
function IcParty() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-3m0 0L9 2.25m3 3 3-3M4.5 19.5h15M6 15.75l-1.5 3.75h15L18 15.75M6 15.75h12M6 15.75a6 6 0 0 1 12 0" />
    </svg>
  );
}
function IcSun() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
    </svg>
  );
}
function IcBeer() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h10v14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V3ZM15 7h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" />
      <path strokeLinecap="round" d="M8 7v5m3-5v5" />
    </svg>
  );
}
function IcInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
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
    <div className="bg-[#111] text-[#f0ede6]">
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div className="fixed top-0 z-50 flex w-full items-center justify-between bg-[#111]/90 px-5 py-3 backdrop-blur-md">
        <a
          href="https://www.instagram.com/bigbenpubzh/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-[#f0ede6]/70 transition-colors hover:text-[#c0392b]"
        >
          <IcInstagram />
          <span className="hidden sm:inline">@bigbenpubzh</span>
        </a>
        <span className="font-serif text-sm font-bold tracking-wider">BIG BEN PUB</span>
        <button
          onClick={() => setLang(lang === "en" ? "de" : "en")}
          className="rounded-full border border-[#333] px-3 py-1 text-xs font-bold tracking-wider transition-colors hover:border-[#c0392b] hover:text-[#c0392b]"
        >
          {lang === "en" ? "DE" : "EN"}
        </button>
      </div>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden">
        <Image
          src={IMG("inside.png")}
          alt="Big Ben Pub — Live music evening"
          fill
          className="object-cover brightness-[0.35]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/20 to-transparent" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#c0392b]">
            {s.estLine}
          </p>
          <h1 className="mt-4 font-serif text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
            Big Ben Pub
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#f0ede6]/70">
            {s.heroSub}
            <br />
            {s.heroSub2}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#reserve"
              className="rounded bg-[#c0392b] px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[#e74c3c] hover:shadow-lg hover:shadow-[#c0392b]/25"
            >
              {s.bookTable}
            </a>
            <a
              href="#menu"
              className="rounded border border-white/20 px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white/80 transition-all hover:border-white/40 hover:text-white"
            >
              {s.seeMenu}
            </a>
          </div>
        </div>
      </section>

      {/* ── GUINNESS BANNER ─────────────────────────────────────── */}
      <section className="border-y border-[#222] bg-[#0d0d0d] py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-2 px-6 sm:flex-row sm:gap-6">
          <IcBeer />
          <p className="text-center font-serif text-xl font-bold tracking-wide sm:text-2xl">
            {s.guinness}
          </p>
          <span className="hidden text-[#f0ede6]/30 sm:inline">|</span>
          <p className="text-center text-sm text-[#f0ede6]/50">{s.guinnessDesc}</p>
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c0392b]">
                {s.aboutLabel}
              </p>
              <h2 className="mt-3 font-serif text-4xl font-bold leading-tight">
                {s.aboutH1}
                <br />
                {s.aboutH2}
              </h2>
              <p className="mt-6 text-base leading-relaxed text-[#f0ede6]/60">
                {s.aboutP1}
              </p>
              <p className="mt-4 text-base leading-relaxed text-[#f0ede6]/60">
                {s.aboutP2}
              </p>
              <div className="mt-10 grid grid-cols-3 gap-6">
                <Stat value="4.7" label="Google Stars" />
                <Stat value="186+" label="Reviews" />
                <Stat value="40+" label="Seats" />
              </div>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
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

      {/* ── WHAT'S ON ───────────────────────────────────────────── */}
      <section className="bg-[#161616] py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#c0392b]">
            {s.whatsOnLabel}
          </p>
          <h2 className="mt-3 text-center font-serif text-4xl font-bold">
            {s.whatsOnTitle}
          </h2>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <EventCard icon={<IcMic />} title={s.evKaraoke} desc={s.evKaraokeD} />
            <EventCard icon={<IcBrain />} title={s.evQuiz} desc={s.evQuizD} />
            <EventCard icon={<IcMusic />} title={s.evMusic} desc={s.evMusicD} />
            <EventCard icon={<IcSport />} title={s.evSport} desc={s.evSportD} />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <EventCard icon={<IcDarts />} title={s.evDarts} desc={s.evDartsD} />
            <EventCard icon={<IcParty />} title={s.evPrivate} desc={s.evPrivateD} />
            <EventCard icon={<IcSun />} title={s.evTerrace} desc={s.evTerraceD} />
            <EventCard icon={<IcBeer />} title={s.evHappy} desc={s.evHappyD} />
          </div>
        </div>
      </section>

      {/* ── MENU ────────────────────────────────────────────────── */}
      <section id="menu" className="scroll-mt-16 py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#c0392b]">
            {s.menuLabel}
          </p>
          <h2 className="mt-3 text-center font-serif text-4xl font-bold">
            {s.menuTitle}
          </h2>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {/* Food */}
            <div className="rounded-2xl border border-[#222] bg-[#161616] p-8">
              <h3 className="font-serif text-2xl font-bold text-[#c0392b]">{s.pubBites}</h3>
              <p className="mt-1 text-sm text-[#f0ede6]/40">{s.pubBitesNote}</p>
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
                  <li key={item} className="flex items-center gap-3 text-sm text-[#f0ede6]/70">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-[#c0392b]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Drinks */}
            <div className="rounded-2xl border border-[#222] bg-[#161616] p-8">
              <h3 className="font-serif text-2xl font-bold text-[#c0392b]">{s.fromBar}</h3>
              <p className="mt-1 text-sm text-[#f0ede6]/40">{s.fromBarNote}</p>
              <div className="mt-6 space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#f0ede6]/40">
                    {s.onTap}
                  </p>
                  <ul className="mt-2 space-y-2">
                    {["Guinness", "Pale Ale", "Lager", "Cider", "Seasonal Guest Ale"].map(
                      (item) => (
                        <li key={item} className="flex items-center gap-3 text-sm text-[#f0ede6]/70">
                          <span className="h-1 w-1 shrink-0 rounded-full bg-[#c0392b]" />
                          {item}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#f0ede6]/40">
                    {s.bottlesMore}
                  </p>
                  <ul className="mt-2 space-y-2">
                    {[
                      "Craft Beers (rotating selection)",
                      "Wines (red, white, ros\u00e9)",
                      "Cocktails & Highballs",
                      "Spirits & Whisky",
                      "Soft Drinks & Coffee",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-[#f0ede6]/70">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-[#c0392b]" />
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

      {/* ── GALLERY ─────────────────────────────────────────────── */}
      <section className="bg-[#161616] py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#c0392b]">
            {s.galleryLabel}
          </p>
          <h2 className="mt-3 text-center font-serif text-4xl font-bold">
            {s.galleryTitle}
          </h2>

          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { src: "outside.png", alt: "Big Ben Pub entrance at night" },
              { src: "outside2.png", alt: "Terrace seating" },
              { src: "inside.png", alt: "Live music evening" },
              { src: "bar.png", alt: "The bar" },
              { src: "guinness.png", alt: "Perfect Guinness pour" },
              { src: "guinness2.png", alt: "Guinness at the bar" },
              { src: "foot.png", alt: "Chicken Wings & Nachos" },
              { src: "food_nachos.png", alt: "Loaded Nachos on the terrace" },
              { src: "drinks.png", alt: "Craft beer selection" },
              { src: "drinks2.png", alt: "Cocktails at the bar" },
            ].map((img) => (
              <div key={img.src} className="group relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src={IMG(img.src)}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESERVE ─────────────────────────────────────────────── */}
      <section id="reserve" className="scroll-mt-16 py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#c0392b]">
            {s.reserveLabel}
          </p>
          <h2 className="mt-3 text-center font-serif text-4xl font-bold">
            {s.reserveTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-center text-sm text-[#f0ede6]/50">
            {s.reserveDesc}
          </p>

          <div className="mt-10">
            <ReservationForm />
          </div>
        </div>
      </section>

      {/* ── HOURS & LOCATION ────────────────────────────────────── */}
      <section className="bg-[#161616] py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-2">
            {/* Hours */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c0392b]">
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

              <div className="mt-10 space-y-2 text-sm text-[#f0ede6]/50">
                <p>Alte Landstrasse 20, 8942 Oberrieden</p>
                <p>044 722 20 62</p>
                <a
                  href="https://www.instagram.com/bigbenpubzh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#c0392b] transition-colors hover:text-[#e74c3c]"
                >
                  <IcInstagram />
                  {s.followUs}
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="overflow-hidden rounded-2xl">
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
      <footer className="border-t border-[#222] py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 text-center text-xs text-[#f0ede6]/30">
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/bigbenpubzh/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#c0392b]"
            >
              <IcInstagram />
            </a>
          </div>
          <p>Big Ben Pub &middot; Alte Landstrasse 20 &middot; 8942 Oberrieden</p>
          <p>
            Website by{" "}
            <a href="https://flowsight.ch" className="text-[#c0392b] hover:underline">
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
      <p className="text-3xl font-bold text-[#c0392b]">{value}</p>
      <p className="mt-1 text-xs text-[#f0ede6]/40">{label}</p>
    </div>
  );
}

function EventCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group rounded-xl border border-[#222] bg-[#111] p-6 transition-all duration-300 hover:border-[#c0392b]/40 hover:bg-[#1a1a1a]">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c0392b]/10 text-[#c0392b] transition-colors group-hover:bg-[#c0392b]/20">
        {icon}
      </div>
      <p className="mt-4 text-sm font-bold">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-[#f0ede6]/50">{desc}</p>
    </div>
  );
}

function HoursRow({ day, hours, closed }: { day: string; hours: string; closed?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-[#222] pb-3">
      <span className="text-sm font-medium">{day}</span>
      <span className={`text-sm ${closed ? "text-[#f0ede6]/25" : "text-[#f0ede6]/60"}`}>
        {hours}
      </span>
    </div>
  );
}
