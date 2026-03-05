import type { Metadata } from "next";
import Image from "next/image";
import { ReservationForm } from "./ReservationForm";

export const metadata: Metadata = {
  title: "Big Ben Pub — Your Local in Oberrieden",
  description:
    "Traditional British pub in Oberrieden. Best Guinness on the lake, live sports, events, and proper pub food. Book your table online.",
};

/* ── Image paths ──────────────────────────────────────────────────── */
const IMG = (n: string) => `/images/kunden/bigben-pub/${n}`;

/* ── Page ─────────────────────────────────────────────────────────── */
export default function BigBenPubPage() {
  return (
    <div className="bg-[#1a1210] text-[#f5f0e8]">
      {/* ━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <Image
          src={IMG("inside.png")}
          alt="Big Ben Pub — Live music evening"
          fill
          className="object-cover brightness-[0.4]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1210] via-transparent to-transparent" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#c0392b]">
            Est. Oberrieden
          </p>
          <h1 className="mt-3 font-serif text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
            Big Ben Pub
          </h1>
          <p className="mt-4 max-w-lg text-lg text-[#d4c5a9]">
            Your neighbourhood pub on the lake.
            <br />
            Great beer, proper food, live sport & events.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#reserve"
              className="rounded-lg bg-[#c0392b] px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[#a93226] hover:shadow-lg hover:shadow-[#c0392b]/20"
            >
              Book a Table
            </a>
            <a
              href="#menu"
              className="rounded-lg border border-[#d4c5a9]/30 px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-[#d4c5a9] transition-all hover:border-[#d4c5a9]/60 hover:bg-white/5"
            >
              See the Menu
            </a>
          </div>
        </div>
      </section>

      {/* ━━━ ABOUT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c0392b]">
                About Us
              </p>
              <h2 className="mt-3 font-serif text-4xl font-bold leading-tight">
                A proper British pub,
                <br />
                right on the Zürichsee.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[#d4c5a9]/80">
                Big Ben Pub is the heart of Oberrieden&apos;s social life — a cosy,
                no-nonsense pub where locals and visitors gather over a perfectly
                poured Guinness, classic pub food, and the roar of live sport on
                the big screens.
              </p>
              <p className="mt-3 text-base leading-relaxed text-[#d4c5a9]/80">
                Whether it&apos;s Premier League Saturday, Quiz Night, live music
                from talented local acts, or just a quiet midweek pint — there&apos;s
                always a reason to stop by.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-6">
                <Stat value="4.7" label="Google Stars" />
                <Stat value="186" label="Reviews" />
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

      {/* ━━━ WHAT'S ON ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-[#231a15] py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#c0392b]">
            What&apos;s On
          </p>
          <h2 className="mt-3 text-center font-serif text-4xl font-bold">
            There&apos;s always something happening.
          </h2>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <EventCard
              icon="🎤"
              title="Karaoke Night"
              desc="Grab the mic and show what you've got. All genres welcome."
            />
            <EventCard
              icon="🧠"
              title="Quiz Night"
              desc="Teams of up to 6. Prizes for the winners. No phones allowed."
            />
            <EventCard
              icon="🎵"
              title="Live Music"
              desc="Local and international acts. From acoustic to full bands."
            />
            <EventCard
              icon="⚽"
              title="Live Sport"
              desc="Premier League, Rugby, Champions League — every matchday."
            />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <EventCard
              icon="🎯"
              title="Darts"
              desc="Two boards, open play. Dart league coming autumn 2026."
            />
            <EventCard
              icon="🎂"
              title="Private Events"
              desc="Birthday, work do, celebration? Talk to Paul about booking."
            />
            <EventCard
              icon="☀️"
              title="Terrace"
              desc="Open year-round. Perfect for a sunny afternoon pint."
            />
            <EventCard
              icon="🍺"
              title="Happy Hour"
              desc="Ask at the bar for today's specials."
            />
          </div>
        </div>
      </section>

      {/* ━━━ MENU ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="menu" className="scroll-mt-16 py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#c0392b]">
            Food & Drinks
          </p>
          <h2 className="mt-3 text-center font-serif text-4xl font-bold">
            Proper pub grub & a great pour.
          </h2>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Food */}
            <div className="rounded-2xl border border-[#3a2a20] bg-[#231a15] p-8">
              <h3 className="font-serif text-2xl font-bold text-[#c0392b]">Pub Bites</h3>
              <p className="mt-1 text-sm text-[#d4c5a9]/60">Ask at the bar for today&apos;s specials</p>
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
                  <li key={item} className="flex items-center gap-3 text-sm text-[#d4c5a9]/80">
                    <span className="text-[#c0392b]">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Drinks */}
            <div className="rounded-2xl border border-[#3a2a20] bg-[#231a15] p-8">
              <h3 className="font-serif text-2xl font-bold text-[#c0392b]">From the Bar</h3>
              <p className="mt-1 text-sm text-[#d4c5a9]/60">Wide selection on tap and by the bottle</p>
              <div className="mt-6 space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#d4c5a9]/50">On Tap</p>
                  <ul className="mt-2 space-y-2">
                    {["Guinness", "Pale Ale", "Lager", "Cider", "Seasonal Guest Ale"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-[#d4c5a9]/80">
                        <span className="text-[#c0392b]">—</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#d4c5a9]/50">Bottles & More</p>
                  <ul className="mt-2 space-y-2">
                    {["Craft Beers (rotating selection)", "Wines (red, white, rosé)", "Cocktails & Highballs", "Spirits & Whisky", "Soft Drinks & Coffee"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-[#d4c5a9]/80">
                        <span className="text-[#c0392b]">—</span>
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

      {/* ━━━ GALLERY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-[#231a15] py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#c0392b]">
            Gallery
          </p>
          <h2 className="mt-3 text-center font-serif text-4xl font-bold">
            See for yourself.
          </h2>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
              <div key={img.src} className="relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src={IMG(img.src)}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ RESERVE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="reserve" className="scroll-mt-16 py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#c0392b]">
            Reservations
          </p>
          <h2 className="mt-3 text-center font-serif text-4xl font-bold">
            Book your table.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-center text-sm text-[#d4c5a9]/60">
            Pick a date, time and party size — we&apos;ll confirm your reservation by SMS.
          </p>

          <div className="mt-10">
            <ReservationForm />
          </div>
        </div>
      </section>

      {/* ━━━ HOURS & LOCATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-[#231a15] py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Hours */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c0392b]">
                Opening Hours
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold">
                When to find us.
              </h2>
              <div className="mt-8 space-y-3">
                <HoursRow day="Monday" hours="Closed" closed />
                <HoursRow day="Tuesday" hours="16:00 – 23:00" />
                <HoursRow day="Wednesday" hours="16:00 – 23:00" />
                <HoursRow day="Thursday" hours="16:00 – 23:00" />
                <HoursRow day="Friday" hours="16:00 – 00:00" />
                <HoursRow day="Saturday" hours="16:00 – 00:00" />
                <HoursRow day="Sunday" hours="16:00 – 22:00" />
              </div>

              <div className="mt-10 space-y-2 text-sm text-[#d4c5a9]/60">
                <p>Alte Landstrasse 20, 8942 Oberrieden</p>
                <p>044 722 20 62 · hello@big-ben-oberrieden.ch</p>
                <a
                  href="https://www.instagram.com/bigbenpubzh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[#c0392b] hover:underline"
                >
                  @bigbenpubzh
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

      {/* ━━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="border-t border-[#3a2a20] py-8">
        <div className="mx-auto max-w-5xl px-6 text-center text-xs text-[#d4c5a9]/40">
          <p>Big Ben Pub · Alte Landstrasse 20 · 8942 Oberrieden</p>
          <p className="mt-1">
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

/* ── Sub-components ───────────────────────────────────────────────── */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-[#c0392b]">{value}</p>
      <p className="mt-0.5 text-xs text-[#d4c5a9]/50">{label}</p>
    </div>
  );
}

function EventCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-[#3a2a20] bg-[#1a1210] p-5 transition-colors hover:border-[#c0392b]/30">
      <p className="text-2xl">{icon}</p>
      <p className="mt-2 text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs text-[#d4c5a9]/60 leading-relaxed">{desc}</p>
    </div>
  );
}

function HoursRow({ day, hours, closed }: { day: string; hours: string; closed?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-[#3a2a20] pb-3">
      <span className="text-sm font-medium">{day}</span>
      <span className={`text-sm ${closed ? "text-[#d4c5a9]/30" : "text-[#d4c5a9]/70"}`}>
        {hours}
      </span>
    </div>
  );
}
