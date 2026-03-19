"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_link:
    "Ungültiger oder abgelaufener Link. Bitte erneut anfordern.",
  config: "Auth ist nicht konfiguriert. Bitte Admin kontaktieren.",
};

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

// Brand colors from brand_system.md
const GOLD = "#c8965a";
const GOLD_HOVER = "#d4a96e";
const NAVY = "#1a2744";
const NAVY_800 = "#243352";
const NAVY_700 = "#2e4066";
const NAVY_400 = "#7b8fb3";
const TEXT_SEC = "#64645f";
const STATUS_ERR = "#c45c4a";

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlError = searchParams.get("error");
  const nextPath = safeNext(searchParams.get("next")) ?? "/ops/cases";

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

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (step === "code") {
      setTimeout(() => codeRefs.current[0]?.focus(), 50);
    }
  }, [step]);

  // ── Step 1: Send code ──────────────────────────────────────────────
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

  // ── Step 2: Verify code ────────────────────────────────────────────
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

  // ── Error box ──────────────────────────────────────────────────────
  const errorBox = errorMsg ? (
    <div
      className="flex items-start gap-2.5 rounded-xl px-3.5 py-3"
      style={{ backgroundColor: `${STATUS_ERR}08`, border: `1px solid ${STATUS_ERR}20` }}
    >
      <svg
        className="w-4 h-4 mt-0.5 shrink-0"
        fill="none"
        stroke={STATUS_ERR}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
      <p className="text-sm leading-snug" style={{ color: STATUS_ERR }}>
        {errorMsg}
      </p>
    </div>
  ) : null;

  // ── Success ────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="text-center py-8">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
          style={{ backgroundColor: "#4a9d6e15", border: "1px solid #4a9d6e30" }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="#4a9d6e"
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
        <p className="font-medium" style={{ color: NAVY }}>
          Anmeldung erfolgreich
        </p>
        <p className="text-sm mt-1" style={{ color: NAVY_400 }}>
          Weiterleitung&hellip;
        </p>
      </div>
    );
  }

  // ── Step 2: Code entry ─────────────────────────────────────────────
  if (step === "code") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm" style={{ color: TEXT_SEC }}>
            Code gesendet an
          </p>
          <p className="text-sm font-medium mt-0.5" style={{ color: NAVY }}>
            {email}
          </p>
        </div>

        {/* 6-digit code input */}
        <div className="flex gap-2 sm:gap-3 justify-center">
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
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold rounded-xl transition-all duration-150 focus:outline-none disabled:opacity-40"
              style={{
                color: NAVY,
                backgroundColor: "#f0f3f7",
                border: `2px solid ${
                  status === "error"
                    ? STATUS_ERR + "60"
                    : digit
                      ? GOLD
                      : "#c4cfdf"
                }`,
                ...(digit ? { boxShadow: `0 0 0 1px ${GOLD}30` } : {}),
              }}
            />
          ))}
        </div>

        {status === "error" && errorBox}

        {status === "verifying" && (
          <div className="flex items-center justify-center gap-2.5 py-1">
            <div
              className="w-4 h-4 rounded-full animate-spin"
              style={{ border: `2px solid ${GOLD}40`, borderTopColor: GOLD }}
            />
            <p className="text-sm" style={{ color: NAVY_400 }}>
              Wird geprüft&hellip;
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setStatus("idle");
              setErrorMsg("");
              setCode(["", "", "", "", "", ""]);
            }}
            className="text-xs transition-colors"
            style={{ color: NAVY_400 }}
          >
            &larr; Andere E-Mail
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || status === "sending"}
            className="text-xs disabled:cursor-not-allowed transition-colors"
            style={{ color: cooldown > 0 ? "#c4cfdf" : GOLD }}
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
    <form onSubmit={handleSendCode} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-medium mb-2 uppercase tracking-wider"
          style={{ color: NAVY_400 }}
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
          className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200 focus:outline-none"
          style={{
            color: NAVY,
            backgroundColor: "#f0f3f7",
            border: "2px solid #c4cfdf",
            ...(status === "idle" ? {} : {}),
          }}
          onFocus={(e) => {
            e.target.style.borderColor = GOLD;
            e.target.style.boxShadow = `0 0 0 1px ${GOLD}30`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#c4cfdf";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {(status === "error" || (urlError && status === "idle")) && errorBox}

      <button
        type="submit"
        disabled={status === "sending" || cooldown > 0}
        className="w-full rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        style={{
          backgroundColor: GOLD,
          color: NAVY,
        }}
        onMouseEnter={(e) => {
          if (!(e.target as HTMLButtonElement).disabled) {
            (e.target as HTMLElement).style.backgroundColor = GOLD_HOVER;
          }
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.backgroundColor = GOLD;
        }}
      >
        {status === "sending" ? (
          <span className="inline-flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full animate-spin"
              style={{ border: `2px solid ${NAVY}30`, borderTopColor: NAVY }}
            />
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
