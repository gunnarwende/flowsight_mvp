"use client";

import { useState, type FormEvent } from "react";

const TIME_SLOTS = [
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
];

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8];

export function ReservationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/bigben-pub/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          date: form.get("date"),
          time: form.get("time"),
          guests: form.get("guests"),
          note: form.get("note"),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
    } catch {
      alert("Connection error. Please try again.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
  }

  // Min date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[#e8e0d5] bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="mt-5 font-serif text-2xl font-bold text-[#1a1a1a]">Table reserved!</h3>
        <p className="mt-2 text-sm text-[#888]">
          You&apos;ll receive an SMS confirmation shortly.
          <br />
          We look forward to seeing you!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#e8e0d5] bg-white p-8 shadow-sm">
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Name */}
        <div className="sm:col-span-2">
          <label htmlFor="res-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#999]">
            Name
          </label>
          <input
            id="res-name"
            name="name"
            type="text"
            required
            placeholder="John Smith"
            className="w-full rounded-lg border border-[#e0d9d0] bg-[#faf7f2] px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#ccc] focus:border-[#c0392b] focus:outline-none focus:ring-1 focus:ring-[#c0392b]"
          />
        </div>

        {/* Phone */}
        <div className="sm:col-span-2">
          <label htmlFor="res-phone" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#999]">
            Phone (for SMS confirmation)
          </label>
          <input
            id="res-phone"
            name="phone"
            type="tel"
            required
            placeholder="+41 79 ..."
            className="w-full rounded-lg border border-[#e0d9d0] bg-[#faf7f2] px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#ccc] focus:border-[#c0392b] focus:outline-none focus:ring-1 focus:ring-[#c0392b]"
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="res-date" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#999]">
            Date
          </label>
          <input
            id="res-date"
            name="date"
            type="date"
            required
            min={minDate}
            className="w-full rounded-lg border border-[#e0d9d0] bg-[#faf7f2] px-4 py-3 text-sm text-[#1a1a1a] focus:border-[#c0392b] focus:outline-none focus:ring-1 focus:ring-[#c0392b]"
          />
        </div>

        {/* Time */}
        <div>
          <label htmlFor="res-time" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#999]">
            Time
          </label>
          <select
            id="res-time"
            name="time"
            required
            className="w-full rounded-lg border border-[#e0d9d0] bg-[#faf7f2] px-4 py-3 text-sm text-[#1a1a1a] focus:border-[#c0392b] focus:outline-none focus:ring-1 focus:ring-[#c0392b]"
          >
            <option value="">Select a time</option>
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Guests */}
        <div>
          <label htmlFor="res-guests" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#999]">
            Guests
          </label>
          <select
            id="res-guests"
            name="guests"
            required
            className="w-full rounded-lg border border-[#e0d9d0] bg-[#faf7f2] px-4 py-3 text-sm text-[#1a1a1a] focus:border-[#c0392b] focus:outline-none focus:ring-1 focus:ring-[#c0392b]"
          >
            <option value="">How many?</option>
            {PARTY_SIZES.map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
            ))}
            <option value="9+">9+ (call us)</option>
          </select>
        </div>

        {/* Note */}
        <div>
          <label htmlFor="res-note" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#999]">
            Special requests
          </label>
          <input
            id="res-note"
            name="note"
            type="text"
            placeholder="e.g. birthday, outdoor seating"
            className="w-full rounded-lg border border-[#e0d9d0] bg-[#faf7f2] px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#ccc] focus:border-[#c0392b] focus:outline-none focus:ring-1 focus:ring-[#c0392b]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-lg bg-[#c0392b] py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[#e74c3c] hover:shadow-lg disabled:opacity-50"
      >
        {loading ? "Reserving..." : "Reserve Table"}
      </button>

      <p className="mt-3 text-center text-xs text-[#ccc]">
        You&apos;ll receive an SMS confirmation. No spam, no newsletter.
      </p>
    </form>
  );
}
