"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getBrowserClient } from "@/src/lib/supabase/browser";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_link:
    "Ung\u00fcltiger oder abgelaufener Link. Bitte erneut anfordern.",
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

  // ── Step 1: Send OTP code ──────────────────────────────────────────
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const supabase = getBrowserClient();

      // No emailRedirectTo → Supabase sends 6-digit OTP code, not a magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        setStatus("error");
        const msg = error.message?.toLowerCase() ?? "";
        // Rate limit check FIRST — Supabase says "For security purposes,
        // you can only request this once every X seconds"
        if (
          msg.includes("security purposes") ||
          msg.includes("rate limit") ||
          msg.includes("too many")
        ) {
          // Parse wait seconds from Supabase message if possible
          const match = error.message?.match(/every\s+(\d+)\s+seconds/i);
          const wait = match ? Math.max(parseInt(match[1], 10), 60) : 60;
          setErrorMsg(
            `Bitte ${wait} Sekunden warten und erneut versuchen.`
          );
          setCooldown(wait);
        } else if (
          msg.includes("user not found") ||
          msg.includes("signups not allowed")
        ) {
          setErrorMsg(
            "Kein Konto mit dieser E-Mail-Adresse. Bitte Admin kontaktieren."
          );
        } else {
          setErrorMsg(error.message);
        }
      } else {
        setStatus("idle");
        setStep("code");
        setCode(["", "", "", "", "", ""]);
        setCooldown(60);
      }
    } catch {
      setStatus("error");
      setErrorMsg("Netzwerkfehler. Bitte erneut versuchen.");
    }
  }

  // ── Step 2: Verify OTP code ────────────────────────────────────────
  const handleVerify = useCallback(
    async (fullCode: string) => {
      setStatus("verifying");
      setErrorMsg("");

      try {
        const supabase = getBrowserClient();
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: fullCode,
          type: "email",
        });

        if (error) {
          setStatus("error");
          if (
            error.message?.toLowerCase().includes("expired") ||
            error.message?.toLowerCase().includes("invalid")
          ) {
            setErrorMsg(
              "Code ung\u00fcltig oder abgelaufen. Bitte neuen Code anfordern."
            );
          } else {
            setErrorMsg(error.message);
          }
        } else {
          setStatus("success");
          router.push(nextPath);
        }
      } catch {
        setStatus("error");
        setErrorMsg("Netzwerkfehler. Bitte erneut versuchen.");
      }
    },
    [email, nextPath, router]
  );

  // ── Code input handlers ────────────────────────────────────────────
  function handleCodeChange(index: number, value: string) {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    // Clear error on input
    if (status === "error") setStatus("idle");

    // Auto-advance to next field
    if (digit && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
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
      const supabase = getBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });

      if (error) {
        setStatus("error");
        setErrorMsg(error.message);
      } else {
        setStatus("idle");
        setCode(["", "", "", "", "", ""]);
        setCooldown(60);
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
      <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg p-4 text-center">
        <p className="text-emerald-300 text-sm font-medium">
          Anmeldung erfolgreich
        </p>
        <p className="text-emerald-400/70 text-sm mt-1">
          Sie werden weitergeleitet&hellip;
        </p>
      </div>
    );
  }

  // ── Step 2: Code entry ─────────────────────────────────────────────
  if (step === "code") {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-slate-300 text-sm">
            Wir haben einen 6-stelligen Code an
          </p>
          <p className="text-white text-sm font-medium mt-0.5">{email}</p>
          <p className="text-slate-400 text-xs mt-1">
            gesendet. Bitte pr\u00fcfen Sie Ihr Postfach.
          </p>
        </div>

        {/* 6-digit code input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Code eingeben
          </label>
          <div className="flex gap-2 justify-center">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { codeRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(i, e)}
                onPaste={i === 0 ? handleCodePaste : undefined}
                disabled={status === "verifying"}
                className={`w-11 h-12 text-center text-lg font-bold rounded-lg border bg-slate-900 text-white focus:outline-none focus:ring-2 transition-colors ${
                  status === "error"
                    ? "border-red-500 focus:ring-red-500/30"
                    : "border-slate-700 focus:border-blue-500 focus:ring-blue-500/30"
                } disabled:opacity-50`}
              />
            ))}
          </div>
        </div>

        {/* Error */}
        {status === "error" && errorMsg && (
          <p className="text-red-400 text-sm text-center">{errorMsg}</p>
        )}

        {/* Verifying indicator */}
        {status === "verifying" && (
          <p className="text-slate-400 text-sm text-center">
            Wird gepr\u00fcft&hellip;
          </p>
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
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            &larr; Andere E-Mail
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || status === "sending"}
            className="text-xs text-blue-400 hover:text-blue-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
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
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          E-Mail
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
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {(status === "error" || (urlError && status === "idle")) && (
        <p className="text-red-400 text-sm">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending" || cooldown > 0}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === "sending"
          ? "Code wird gesendet\u2026"
          : cooldown > 0
            ? `Neuer Versuch in ${cooldown}s`
            : "Code senden"}
      </button>
    </form>
  );
}
