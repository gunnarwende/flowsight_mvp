import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function OpsLoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#faf8f5" }}
    >
      <div className="w-full max-w-[380px]">
        {/* ── Signal Dot (brand mark) ───────────────────────── */}
        <div className="flex justify-center mb-5">
          <div
            className="w-10 h-10 rounded-full"
            style={{ backgroundColor: "#c8965a" }}
          />
        </div>

        {/* ── Heading ───────────────────────────────────────── */}
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "#1a2744" }}
          >
            Leitsystem
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "#7b8fb3" }}>
            Sicherer Zugang per E-Mail-Code
          </p>
        </div>

        {/* ── Card ──────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl p-7 shadow-sm"
          style={{ border: "1px solid #c4cfdf" }}
        >
          <Suspense
            fallback={
              <div className="text-sm text-center py-6" style={{ color: "#7b8fb3" }}>
                Laden&hellip;
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        {/* ── Swiss trust footer ────────────────────────────── */}
        <div className="mt-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5">
            {/* Swiss cross */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="shrink-0"
            >
              <rect width="14" height="14" rx="2" fill="#D42B1E" />
              <rect x="3.5" y="5.5" width="7" height="3" rx="0.5" fill="white" />
              <rect x="5.5" y="3.5" width="3" height="7" rx="0.5" fill="white" />
            </svg>
            <span className="text-xs" style={{ color: "#64645f" }}>
              Daten in der Schweiz. Verschlüsselt. DSGVO-konform.
            </span>
          </div>
          <p className="text-xs" style={{ color: "#7b8fb3" }}>
            Nur autorisierte Nutzer. Kein Zugang? Admin kontaktieren.
          </p>
        </div>
      </div>
    </div>
  );
}
