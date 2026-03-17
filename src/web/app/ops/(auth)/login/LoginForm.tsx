"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_link:
    "Ungültiger oder abgelaufener Link. Bitte erneut anfordern.",
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
  v = v.replace(/\\/g, "/");
  if (!v.startsWith("/") || v.startsWith("//")) return null;
  return v;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlError = searchParams.get("error");
  const nextPath = safeNext(searchParams.get("next")) ?? "/ops/cases";

  // Step 1: email, Step 2: code entry
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<
    "idle" | "sending" | "verifying" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState(
    urlError ? (ERROR_MESSAGES[urlError] ?? "Ein Fehler ist aufgetreten.") : ""
  );
  const [cooldown, setCooldown] = useState(0);

  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Focus first code input when switching to code step
  useEffect(() => {
    if (step === "code") {
      setTimeout(() => codeRefs.current[0]?.focus(), 50);
    }
  }, [step]);

  // ── Step 1: Send OTP code via our own API (bypasses Supabase rate limit) ──
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/ops/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        if (data.error === "not_found") {
          setErrorMsg(
            "Kein Konto mit dieser E-Mail-Adresse. Bitte Admin kontaktieren."
          );
        } else if (data.error === "rate_limit") {
          const wait = data.wait ?? 30;
          setErrorMsg(`Bitte ${wait} Sekunden warten und erneut versuchen.`);
          setCooldown(wait);
        } else if (data.error === "email_failed") {
          setErrorMsg("E-Mail konnte nicht gesendet werden. Bitte erneut versuchen.");
        } else {
          setErrorMsg("Ein Fehler ist aufgetreten. Bitte erneut versuchen.");
          setCooldown(30);
        }
      } else {
        setStatus("idle");
        setStep("code");
        setCode(["", "", "", "", "", ""]);
        setCooldown(30);
      }
    } catch {
      setStatus("error");
      setErrorMsg("Netzwerkfehler. Bitte erneut versuchen.");
    }
  }

  // ── Step 2: Verify OTP code via our own API + create Supabase session ──
  const handleVerify = useCallback(
    async (fullCode: string) => {
      setStatus("verifying");
      setErrorMsg("");

      try {
        const res = await fetch("/api/ops/auth/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: fullCode }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          if (data.error === "invalid_code") {
            setErrorMsg("Code ungültig oder bereits verwendet.");
          } else if (data.error === "expired_code") {
            setErrorMsg("Code abgelaufen. Bitte neuen Code anfordern.");
          } else {
            setErrorMsg("Anmeldung fehlgeschlagen. Bitte neuen Code anfordern.");
          }
          return;
        }

        // Session cookies are set server-side by verify-code route.
        // Just redirect to the dashboard.
        setStatus("success");
        router.push(nextPath);
      } catch {
        setStatus("error");
        setErrorMsg("Netzwerkfehler. Bitte erneut versuchen.");
      }
    },
    [email, nextPath, router]
  );

  // ── Code input handlers ────────────────────────────────────────────
  function handleCodeChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (status === "error") setStatus("idle");

    if (digit && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }

    if (digit && index === 5) {
      const fullCode = next.join("");
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setCode(next);

    if (pasted.length === 6) {
      handleVerify(pasted);
    } else {
      codeRefs.current[pasted.length]?.focus();
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/ops/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        if (data.error === "rate_limit") {
          setErrorMsg(`Bitte ${data.wait ?? 30} Sekunden warten.`);
          setCooldown(data.wait ?? 30);
        } else {
          setErrorMsg("Code konnte nicht gesendet werden.");
        }
      } else {
        setStatus("idle");
        setCode(["", "", "", "", "", ""]);
        setCooldown(30);
        codeRefs.current[0]?.focus();
      }
    } catch {
      setStatus("error");
      setErrorMsg("Netzwerkfehler. Bitte erneut versuchen.");
    }
  }

  // ── Success state ──────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
          <svg
            className="w-5 h-5 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <p className="text-white text-sm font-medium">Anmeldung erfolgreich</p>
        <p className="text-slate-500 text-xs mt-1">
          Weiterleitung&hellip;
        </p>
      </div>
    );
  }

  // ── Step 2: Code entry ─────────────────────────────────────────────
  if (step === "code") {
    return (
      <div className="space-y-5">
        {/* Email confirmation */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 border border-slate-700 mb-3">
            <svg
              className="w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">Code gesendet an</p>
          <p className="text-white text-sm font-medium mt-0.5">{email}</p>
        </div>

        {/* 6-digit code input */}
        <div>
          <div className="flex gap-2.5 justify-center">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  codeRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(i, e)}
                onPaste={i === 0 ? handleCodePaste : undefined}
                disabled={status === "verifying"}
                className={`w-11 h-13 text-center text-lg font-semibold rounded-xl border-2 bg-slate-950 text-white transition-all duration-150 focus:outline-none focus:ring-0 ${
                  status === "error"
                    ? "border-red-500/60"
                    : digit
                      ? "border-slate-600"
                      : "border-slate-800 focus:border-slate-500"
                } disabled:opacity-40`}
              />
            ))}
          </div>
        </div>

        {/* Error */}
        {status === "error" && errorMsg && (
          <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2.5">
            <svg
              className="w-4 h-4 text-red-400 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <p className="text-red-400 text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Verifying indicator */}
        {status === "verifying" && (
          <div className="flex items-center justify-center gap-2 py-1">
            <div className="w-3.5 h-3.5 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Wird geprüft&hellip;</p>
          </div>
        )}

        {/* Resend + back */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setStatus("idle");
              setErrorMsg("");
              setCode(["", "", "", "", "", ""]);
            }}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            &larr; Andere E-Mail
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || status === "sending"}
            className="text-xs text-slate-400 hover:text-white disabled:text-slate-700 disabled:cursor-not-allowed transition-colors"
          >
            {status === "sending"
              ? "Sende\u2026"
              : cooldown > 0
                ? `Neuer Code in ${cooldown}s`
                : "Neuen Code senden"}
          </button>
        </div>
      </div>
    );
  }

  // ── Step 1: Email entry ────────────────────────────────────────────
  return (
    <form onSubmit={handleSendCode} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider"
        >
          E-Mail-Adresse
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="name@firma.ch"
          className="w-full rounded-xl border-2 border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white text-sm placeholder:text-slate-600 focus:border-slate-600 focus:outline-none focus:ring-0 transition-colors"
        />
      </div>

      {(status === "error" || (urlError && status === "idle")) && errorMsg && (
        <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2.5">
          <svg
            className="w-4 h-4 text-red-400 mt-0.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <p className="text-red-400 text-sm">{errorMsg}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending" || cooldown > 0}
        className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
      >
        {status === "sending" ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
            Code wird gesendet
          </span>
        ) : cooldown > 0 ? (
          `Neuer Versuch in ${cooldown}s`
        ) : (
          "Anmeldecode senden"
        )}
      </button>
    </form>
  );
}
