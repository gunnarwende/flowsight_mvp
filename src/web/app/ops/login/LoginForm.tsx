"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getBrowserClient } from "@/src/lib/supabase/browser";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_link: "Ungültiger oder abgelaufener Link. Bitte erneut anfordern.",
  config: "Auth ist nicht konfiguriert. Bitte Admin kontaktieren.",
};

/** Sanitize next param: must be a relative path, no open-redirect vectors. */
function safeNext(raw: string | null): string | null {
  if (!raw) return null;
  let v: string;
  try {
    v = decodeURIComponent(raw.trim());
  } catch {
    return null;
  }
  // Normalize backslashes (IE/legacy edge case for open redirect via \)
  v = v.replace(/\\/g, "/");
  if (!v.startsWith("/") || v.startsWith("//")) return null;
  return v;
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const nextPath = safeNext(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState(
    urlError ? (ERROR_MESSAGES[urlError] ?? "Ein Fehler ist aufgetreten.") : ""
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const supabase = getBrowserClient();
      const confirmUrl = new URL("/auth/confirm", window.location.origin);
      if (nextPath) confirmUrl.searchParams.set("next", nextPath);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: confirmUrl.toString(),
        },
      });

      if (error) {
        setStatus("error");
        setErrorMsg(error.message);
      } else {
        setStatus("sent");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Netzwerkfehler. Bitte erneut versuchen.");
    }
  }

  if (status === "sent") {
    return (
      <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg p-4">
        <p className="text-emerald-300 text-sm font-medium">Link gesendet</p>
        <p className="text-emerald-400/70 text-sm mt-1">
          Prüfen Sie Ihr E-Mail-Postfach und klicken Sie auf den Login-Link.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          E-Mail
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@firma.ch"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {(status === "error" || (urlError && status === "idle")) && (
        <p className="text-red-400 text-sm">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "sending" ? "Sende\u2026" : "Magic Link senden"}
      </button>
    </form>
  );
}
