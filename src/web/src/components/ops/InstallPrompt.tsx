"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * PWA Install Prompt — cross-platform.
 *
 * Android/Desktop Chrome: intercepts beforeinstallprompt → custom banner.
 * iOS Safari: detects UA → shows manual instructions.
 * Already installed: hidden (display-mode: standalone check).
 * Dismissed: hidden for 7 days (localStorage).
 */

// Extend window for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DAYS = 7;

function isDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const val = localStorage.getItem(DISMISS_KEY);
  if (!val) return false;
  const expiry = parseInt(val, 10);
  if (Date.now() > expiry) {
    localStorage.removeItem(DISMISS_KEY);
    return false;
  }
  return true;
}

function setDismissed() {
  localStorage.setItem(
    DISMISS_KEY,
    String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000)
  );
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari standalone mode
    ("standalone" in window.navigator &&
      (window.navigator as unknown as { standalone: boolean }).standalone)
  );
}

function getDevice(): "ios" | "android" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  // Initialize device from SSR-safe default, updated via lazy initializer
  const [device] = useState<"ios" | "android" | "desktop">(() => getDevice());
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  useEffect(() => {
    // Don't show if already installed or recently dismissed
    if (isStandalone() || isDismissed()) return;

    // Android/Desktop: capture the install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // iOS: no beforeinstallprompt event, show our own prompt
    const d = getDevice();
    if (d === "ios") {
      // Small delay so the page loads first
      const timer = setTimeout(() => setShow(true), 2000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setDismissed();
    setShow(false);
  }, []);

  if (!show) return null;

  // ── iOS: manual instructions ──────────────────────────────────────────
  if (device === "ios") {
    return (
      <div className="mx-4 mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Als App installieren
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Leitsystem auf den Homescreen legen — 1 Tipp und du bist drin.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5"
            aria-label="Schliessen"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {!showIOSSteps ? (
          <button
            onClick={() => setShowIOSSteps(true)}
            className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            Anleitung anzeigen
          </button>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Teilen-Button antippen
                </p>
                <p className="text-xs text-gray-500">
                  Das Quadrat mit dem Pfeil nach oben{" "}
                  <span className="inline-block text-blue-600 font-bold">
                    ↗
                  </span>{" "}
                  — unten in der Safari-Leiste.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  &quot;Zum Home-Bildschirm&quot;
                </p>
                <p className="text-xs text-gray-500">
                  Im Menü nach unten scrollen und antippen.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  &quot;Hinzufügen&quot; antippen
                </p>
                <p className="text-xs text-gray-500">
                  Oben rechts bestätigen — fertig. Das Icon liegt auf deinem
                  Homescreen.
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Verstanden, nicht mehr anzeigen
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Android / Desktop: native install prompt ───────────────────────────
  return (
    <div className="mx-4 mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            Als App installieren
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            Leitsystem auf den Homescreen legen — Vollbild, kein Browser, ein
            Tipp und du bist drin.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5"
          aria-label="Schliessen"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleInstall}
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          Installieren
        </button>
        <button
          onClick={handleDismiss}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Später
        </button>
      </div>
    </div>
  );
}
