import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function OpsLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* ── Logo / Brand Mark ─────────────────────────────── */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-700/50 flex items-center justify-center shadow-lg shadow-slate-900/50">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
        </div>

        {/* ── Heading ───────────────────────────────────────── */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Leitsystem
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Anmeldung per E-Mail-Code
          </p>
        </div>

        {/* ── Card ──────────────────────────────────────────── */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
          <Suspense
            fallback={
              <div className="text-slate-500 text-sm text-center py-4">
                Laden&hellip;
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        {/* ── Footer ────────────────────────────────────────── */}
        <p className="text-slate-700 text-xs mt-6 text-center">
          Nur autorisierte Nutzer. Kein Zugang? Admin kontaktieren.
        </p>
      </div>
    </div>
  );
}
