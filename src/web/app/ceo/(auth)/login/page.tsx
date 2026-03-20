"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CeoLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSendCode() {
    if (!email.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/ops/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Fehler beim Senden");
      }
      setStep("code");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Fehler beim Senden");
    }
    setSending(false);
  }

  async function handleVerifyCode() {
    if (!code.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/ops/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Code ungültig");
      }
      router.push("/ceo/pulse");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Code ungültig");
    }
    setSending(false);
  }

  return (
    <div className="w-full max-w-sm">
      {/* Brand header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-navy-900 border border-white/10 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <div className="w-5 h-5 rounded-full bg-gold-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">FlowSight CEO</h1>
        <p className="text-sm text-gray-400 mt-1">Business Management</p>
      </div>

      {/* Form card */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl">
        {step === "email" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                placeholder="name@flowsight.ch"
                autoFocus
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 transition"
              />
            </div>
            <button
              onClick={handleSendCode}
              disabled={!email.trim() || sending}
              className="w-full rounded-xl bg-gold-500 px-4 py-3 text-sm font-semibold text-white hover:bg-gold-400 disabled:opacity-40 transition-colors min-h-[48px]"
            >
              {sending ? "Wird gesendet..." : "Code senden"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              Code gesendet an <span className="text-white font-medium">{email}</span>
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">6-stelliger Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
                autoFocus
                placeholder="000000"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white text-center tracking-[0.3em] font-mono placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 transition"
              />
            </div>
            <button
              onClick={handleVerifyCode}
              disabled={code.length < 6 || sending}
              className="w-full rounded-xl bg-gold-500 px-4 py-3 text-sm font-semibold text-white hover:bg-gold-400 disabled:opacity-40 transition-colors min-h-[48px]"
            >
              {sending ? "Wird geprüft..." : "Anmelden"}
            </button>
            <button
              onClick={() => { setStep("email"); setCode(""); setError(""); }}
              className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Andere E-Mail verwenden
            </button>
          </div>
        )}
        {error && (
          <p className="mt-3 text-xs text-red-400 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
