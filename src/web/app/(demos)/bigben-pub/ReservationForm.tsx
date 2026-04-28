"use client";

import { useState, type FormEvent } from "react";

const TIME_SLOTS = [
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
];

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20];

const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_LONG_EN = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
const MONTH_NAMES_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface DayOption {
  value: string;          // ISO date YYYY-MM-DD (Zurich-aware)
  label: string;          // "Tomorrow · Wed 29 Apr"
  short: string;          // "Wed 29 Apr"
  fullLabel: string;      // "Wednesday, 29 April"
  isClosed: boolean;      // pub is closed on Mondays
}

/** Compute the next 21 days as date options in Zurich time. */
function buildDayOptions(): DayOption[] {
  const out: DayOption[] = [];
  // Anchor on Zurich today by formatting and re-parsing
  const todayIso = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Zurich" });
  const [ty, tm, td] = todayIso.split("-").map(Number);
  for (let i = 1; i <= 21; i++) {
    const d = new Date(Date.UTC(ty, tm - 1, td + i, 12, 0));
    const iso = d.toISOString().split("T")[0];
    const dow = d.getUTCDay();
    const dayShort = DAY_NAMES_EN[dow];
    const dayLong = DAY_NAMES_LONG_EN[dow];
    const dayNum = d.getUTCDate();
    const monthShort = MONTH_NAMES_EN[d.getUTCMonth()];
    const monthLong = new Date(d).toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" });
    const short = `${dayShort} ${dayNum} ${monthShort}`;
    let prefix = "";
    if (i === 1) prefix = "Tomorrow · ";
    else if (i <= 6) prefix = `This ${dayLong} · `;
    out.push({
      value: iso,
      label: prefix + short,
      short,
      fullLabel: `${dayLong}, ${dayNum} ${monthLong}`,
      isClosed: dow === 1, // Monday closed
    });
  }
  return out;
}

export function ReservationForm() {
  const [days] = useState(buildDayOptions);
  const firstOpen = days.find((d) => !d.isClosed) ?? days[0];
  const [date, setDate] = useState(firstOpen.value);
  const [time, setTime] = useState("19:00");
  const [guests, setGuests] = useState("2");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = days.find((d) => d.value === date) ?? firstOpen;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (selected.isClosed) {
      setError("We're closed on Mondays — please pick another day.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bigben-pub/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, date, time, guests, note }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[#e8e0d5] bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fdf6e7]">
          <svg className="h-8 w-8 text-[#c0392b]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
          </svg>
        </div>
        <h3 className="mt-5 font-serif text-2xl font-bold text-[#1a1a1a]">Thanks, {name.split(" ")[0]}!</h3>
        <p className="mt-3 text-sm leading-relaxed text-[#666]">
          Your request for <strong className="text-[#1a1a1a]">{selected.fullLabel}</strong> at{" "}
          <strong className="text-[#1a1a1a]">{time}</strong> for{" "}
          <strong className="text-[#1a1a1a]">{guests} {Number(guests) === 1 ? "guest" : "guests"}</strong> is in.
        </p>
        <p className="mt-3 text-sm text-[#888]">
          Paul will confirm by SMS shortly. We&apos;re looking forward to seeing you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#e8e0d5] bg-white p-6 sm:p-9 shadow-sm">
      {/* Date — horizontal pill scroller (English locale, controlled) */}
      <div className="mb-6">
        <div className="mb-2.5 flex items-baseline justify-between">
          <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#888]">Date</label>
          <span className="text-xs text-[#999]">{selected.fullLabel}</span>
        </div>
        <div
          className="-mx-1 flex gap-2 overflow-x-auto pb-1 px-1"
          style={{ scrollbarWidth: "thin" }}
        >
          {days.map((d) => {
            const active = d.value === date;
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => !d.isClosed && setDate(d.value)}
                disabled={d.isClosed}
                title={d.isClosed ? "Closed on Mondays" : d.fullLabel}
                className={`flex-shrink-0 rounded-xl border px-3.5 py-2.5 text-center transition-all ${
                  active
                    ? "border-[#c0392b] bg-[#c0392b] text-white shadow-md"
                    : d.isClosed
                    ? "border-[#f0e8dc] bg-[#faf7f2] text-[#bbb] cursor-not-allowed"
                    : "border-[#e8e0d5] bg-white text-[#1a1a1a] hover:border-[#c0392b]/60 hover:bg-[#fdf6e7]"
                }`}
              >
                <div className={`text-[10px] font-semibold uppercase tracking-wider ${active ? "text-white/90" : "text-[#999]"}`}>
                  {DAY_NAMES_EN[new Date(d.value + "T12:00:00Z").getUTCDay()]}
                </div>
                <div className="text-base font-bold leading-tight mt-0.5">
                  {new Date(d.value + "T12:00:00Z").getUTCDate()}
                </div>
                <div className={`text-[10px] mt-0.5 ${active ? "text-white/90" : "text-[#999]"}`}>
                  {MONTH_NAMES_EN[new Date(d.value + "T12:00:00Z").getUTCMonth()]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time + Guests */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="res-time" className="mb-2.5 block text-xs font-bold uppercase tracking-[0.18em] text-[#888]">
            Time
          </label>
          <select
            id="res-time"
            name="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="w-full rounded-xl border border-[#e0d9d0] bg-[#faf7f2] px-4 py-3.5 text-[15px] font-medium text-[#1a1a1a] focus:border-[#c0392b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20 transition-all"
          >
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="res-guests" className="mb-2.5 block text-xs font-bold uppercase tracking-[0.18em] text-[#888]">
            Guests
          </label>
          <select
            id="res-guests"
            name="guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            required
            className="w-full rounded-xl border border-[#e0d9d0] bg-[#faf7f2] px-4 py-3.5 text-[15px] font-medium text-[#1a1a1a] focus:border-[#c0392b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20 transition-all"
          >
            {PARTY_SIZES.map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label htmlFor="res-name" className="mb-2.5 block text-xs font-bold uppercase tracking-[0.18em] text-[#888]">
          Your name
        </label>
        <input
          id="res-name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="John Smith"
          className="w-full rounded-xl border border-[#e0d9d0] bg-[#faf7f2] px-4 py-3.5 text-[15px] text-[#1a1a1a] placeholder:text-[#bbb] focus:border-[#c0392b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20 transition-all"
        />
      </div>

      {/* Phone */}
      <div className="mb-4">
        <label htmlFor="res-phone" className="mb-2.5 block text-xs font-bold uppercase tracking-[0.18em] text-[#888]">
          Phone <span className="font-normal normal-case tracking-normal text-[#bbb]">— for SMS confirmation</span>
        </label>
        <input
          id="res-phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="+41 79 ..."
          className="w-full rounded-xl border border-[#e0d9d0] bg-[#faf7f2] px-4 py-3.5 text-[15px] text-[#1a1a1a] placeholder:text-[#bbb] focus:border-[#c0392b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20 transition-all"
        />
      </div>

      {/* Note */}
      <div className="mb-6">
        <label htmlFor="res-note" className="mb-2.5 block text-xs font-bold uppercase tracking-[0.18em] text-[#888]">
          Special requests <span className="font-normal normal-case tracking-normal text-[#bbb]">— optional</span>
        </label>
        <input
          id="res-note"
          name="note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Birthday, outdoor seating, ..."
          className="w-full rounded-xl border border-[#e0d9d0] bg-[#faf7f2] px-4 py-3.5 text-[15px] text-[#1a1a1a] placeholder:text-[#bbb] focus:border-[#c0392b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20 transition-all"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#c0392b] py-4 text-[13px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-[#a83020] hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending request..." : "Request a Table"}
      </button>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-[#999]">
        Paul will confirm your reservation by SMS shortly after he sees the request.
        <br />
        No spam, no newsletter, no auto-replies.
      </p>
    </form>
  );
}
