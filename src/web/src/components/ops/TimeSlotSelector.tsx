"use client";

import { useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TimeSlotSelectorProps {
  label: string; // "Von" or "Bis"
  value: string; // "15:00"
  brandColor: string;
  onChange: (time: string) => void;
}

// ---------------------------------------------------------------------------
// Generate 15-min slots 06:00..20:00
// ---------------------------------------------------------------------------

const SLOTS: string[] = [];
for (let h = 6; h <= 20; h++) {
  for (let m = 0; m < 60; m += 15) {
    SLOTS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TimeSlotSelector({ label, value, brandColor, onChange }: TimeSlotSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to selected slot on mount / value change
  useEffect(() => {
    if (selectedRef.current && containerRef.current) {
      const container = containerRef.current;
      const el = selectedRef.current;
      const top = el.offsetTop - container.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
      container.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  }, [value]);

  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1.5 px-1">
        {label}
      </span>
      <div
        ref={containerRef}
        className="max-h-[200px] md:max-h-[200px] overflow-y-auto border border-gray-200 rounded-lg shadow-sm bg-white"
      >
        {SLOTS.map(slot => {
          const isSelected = slot === value;
          return (
            <button
              key={slot}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              onClick={() => onChange(slot)}
              className="w-full px-3 py-1.5 text-xs font-medium text-left transition-colors"
              style={{
                backgroundColor: isSelected ? brandColor : undefined,
                color: isSelected ? "#fff" : "#374151",
                borderRadius: isSelected ? "0.5rem" : undefined,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = `${brandColor}14`;
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = "";
              }}
            >
              {slot}
            </button>
          );
        })}
      </div>
    </div>
  );
}
