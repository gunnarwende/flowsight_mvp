import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function OpsLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle radial glow behind card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[360px] relative z-10">
        {/* ── Logo mark ─────────────────────────────────────── */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-amber-400"
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
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Leitsystem
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Anmeldung per E-Mail-Code
          </p>
        </div>

        {/* ── Card ──────────────────────────────────────────── */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-7 shadow-2xl shadow-black/40 backdrop-blur-sm">
          <Suspense
            fallback={
              <div className="text-slate-500 text-sm text-center py-6">
                Laden&hellip;
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        {/* ── Footer ────────────────────────────────────────── */}
        <p className="text-slate-600 text-xs mt-8 text-center">
          Nur autorisierte Nutzer. Kein Zugang? Admin kontaktieren.
        </p>
      </div>
    </div>
  );
}
