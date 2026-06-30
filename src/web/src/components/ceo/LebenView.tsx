"use client";

import { useState } from "react";
import { RunningView } from "./RunningView";

type Tab = "running" | "ernaehrung" | "kraft" | "coach";

const TABS: { key: Tab; label: string; soon?: boolean }[] = [
  { key: "running", label: "Running" },
  { key: "kraft", label: "Kraftsport", soon: true },
  { key: "ernaehrung", label: "Ernährung", soon: true },
  { key: "coach", label: "Coach", soon: true },
];

export function LebenView() {
  const [tab, setTab] = useState<Tab>("running");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-gray-900">Leben</h1>
        <p className="text-xs text-gray-500 mt-0.5">Gesundheit, Sport & Energie – dein persönlicher Bereich</p>
      </div>

      {/* Tab-Bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => !t.soon && setTab(t.key)}
              disabled={t.soon}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-navy-800 text-white shadow-sm"
                  : t.soon
                    ? "text-gray-400 bg-gray-50 cursor-default"
                    : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t.label}
              {t.soon && <span className="ml-1.5 text-[9px] text-gray-400">Bald</span>}
            </button>
          );
        })}
      </div>

      {/* Inhalt */}
      {tab === "running" && <RunningView />}
    </div>
  );
}
