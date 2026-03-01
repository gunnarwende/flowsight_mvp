"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getBrowserClient } from "@/src/lib/supabase/browser";

/**
 * Client-side auth confirmation.
 *
 * WHY client-side instead of a server GET route:
 * Mobile email clients (Gmail, Outlook) pre-fetch links by making GET requests.
 * A server GET handler would consume the one-time token before the user clicks,
 * causing "invalid or expired link" errors on mobile.
 *
 * With a client page + button, prefetch only loads the HTML — the token is
 * verified only when the user actively clicks "Login bestätigen".
 */
export function ConfirmAuth() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"ready" | "verifying" | "success" | "error">("ready");
  const [errorMsg, setErrorMsg] = useState("");

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/ops/cases";

  const hasToken = !!(tokenHash && type) || !!code;

  async function handleConfirm() {
    setStatus("verifying");

    try {
      const supabase = getBrowserClient();
      let success = false;

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "magiclink" | "email",
        });
        success = !error;
        if (error) setErrorMsg(error.message);
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        success = !error;
        if (error) setErrorMsg(error.message);
      }

      if (success) {
        setStatus("success");
        router.push(next);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Netzwerkfehler. Bitte erneut versuchen.");
    }
  }

  if (!hasToken) {
    return (
      <div className="text-center">
        <p className="text-red-400 text-sm mb-4">
          Kein gültiger Login-Link. Bitte erneut anfordern.
        </p>
        <a
          href="/ops/login"
          className="text-blue-400 hover:text-blue-300 text-sm underline"
        >
          Zurück zum Login
        </a>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg p-4 text-center">
        <p className="text-emerald-300 text-sm font-medium">
          Erfolgreich angemeldet
        </p>
        <p className="text-emerald-400/70 text-sm mt-1">
          Sie werden weitergeleitet&hellip;
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {status === "error" && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <p className="text-red-300 text-sm font-medium">Login fehlgeschlagen</p>
          <p className="text-red-400/70 text-sm mt-1">
            {errorMsg || "Der Link ist ungültig oder abgelaufen."}
          </p>
          <a
            href="/ops/login"
            className="text-blue-400 hover:text-blue-300 text-sm underline mt-2 inline-block"
          >
            Neuen Link anfordern
          </a>
        </div>
      )}

      {status !== "error" && (
        <button
          onClick={handleConfirm}
          disabled={status === "verifying"}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === "verifying" ? "Anmeldung läuft\u2026" : "Login bestätigen"}
        </button>
      )}
    </div>
  );
}
