"use client";

import { useState, type FormEvent } from "react";

export function DemoForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          company: form.get("company"),
          phone: form.get("phone"),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.");
        setLoading(false);
        return;
      }
    } catch {
      alert("Verbindungsfehler. Bitte versuchen Sie es erneut.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-gold-400/20 bg-navy-800/50 p-8 text-center sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/15">
          <svg
            className="h-7 w-7 text-gold-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>
        <h3 className="mt-5 text-xl font-semibold text-white">
          Vielen Dank!
        </h3>
        <p className="mt-2 text-base text-navy-200">
          Wir melden uns innerhalb von 24 Stunden bei Ihnen.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-navy-700/50 bg-navy-800/50 p-8 backdrop-blur-sm sm:p-10"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="demo-name"
            className="mb-1.5 block text-sm font-medium text-navy-200"
          >
            Name
          </label>
          <input
            id="demo-name"
            name="name"
            type="text"
            required
            placeholder="Max Muster"
            className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-4 py-3 text-sm text-white placeholder:text-navy-400 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
          />
        </div>
        <div>
          <label
            htmlFor="demo-company"
            className="mb-1.5 block text-sm font-medium text-navy-200"
          >
            Firma
          </label>
          <input
            id="demo-company"
            name="company"
            type="text"
            required
            placeholder="Muster Sanitär AG"
            className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-4 py-3 text-sm text-white placeholder:text-navy-400 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
          />
        </div>
        <div>
          <label
            htmlFor="demo-phone"
            className="mb-1.5 block text-sm font-medium text-navy-200"
          >
            Telefon
          </label>
          <input
            id="demo-phone"
            name="phone"
            type="tel"
            required
            placeholder="+41 79 ..."
            className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-4 py-3 text-sm text-white placeholder:text-navy-400 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-lg bg-gold-500 py-3.5 text-base font-semibold text-navy-950 transition-all hover:bg-gold-400 disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {loading ? "Wird gesendet…" : "Demo vereinbaren"}
      </button>

      <p className="mt-4 text-xs text-navy-400">
        Wir rufen Sie an — kein Spam, kein Newsletter. Ihre Daten werden
        ausschliesslich zur Kontaktaufnahme verwendet.
      </p>
    </form>
  );
}
