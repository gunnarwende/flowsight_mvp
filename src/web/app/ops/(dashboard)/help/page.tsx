"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "How do I add a new event?",
    a: 'Go to Dashboard \u2192 Sports or Events card \u2192 click "+ New Match" or "+ New Event".',
  },
  {
    q: "How do I confirm a reservation?",
    a: "Go to Dashboard \u2192 tap the pending reservation alert \u2192 Confirm or Decline.",
  },
  {
    q: "A guest didn\u2019t show up \u2014 what do I do?",
    a: 'Go to Reservations \u2192 find the past reservation \u2192 tap "No Show". The system tracks repeat offenders with yellow and red cards.',
  },
  {
    q: "How do I add a walk-in?",
    a: 'Go to Reservations \u2192 tap "+ Add Reservation" \u2192 fill in name and party size. Date and time are pre-filled for you.',
  },
  {
    q: "Something isn\u2019t working!",
    a: "Don\u2019t worry \u2014 call or text Gunnar. He\u2019ll fix it.",
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Need Help?</h1>

      {/* Contact card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Your direct contact</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-600">
            GW
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Gunnar Wende</p>
            <p className="text-xs text-gray-500 mt-0.5">FlowSight</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <a
            href="tel:+41764458942"
            className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white flex-shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Call or text Gunnar</p>
              <p className="text-xs text-gray-500">+41 76 445 89 42</p>
            </div>
          </a>

          <a
            href="mailto:gunnar.wende@flowsight.ch"
            className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white flex-shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Email</p>
              <p className="text-xs text-gray-500">gunnar.wende@flowsight.ch</p>
            </div>
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm divide-y divide-gray-100">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Frequently Asked Questions</h2>
        </div>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              <span className="text-sm text-gray-700 font-medium pr-4">{item.q}</span>
              <svg
                className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {openFaq === i && (
              <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
