import { Suspense } from "react";
import { ConfirmAuth } from "./ConfirmAuth";

export default function AuthConfirmPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-2">FlowSight Ops</h1>
        <p className="text-slate-400 text-sm mb-8">
          Login bestätigen
        </p>

        <Suspense
          fallback={
            <div className="text-slate-500 text-sm">Laden&hellip;</div>
          }
        >
          <ConfirmAuth />
        </Suspense>

        <p className="text-slate-600 text-xs mt-8 text-center">
          Nur autorisierte Benutzer. Kein Konto? Admin kontaktieren.
        </p>
      </div>
    </div>
  );
}
