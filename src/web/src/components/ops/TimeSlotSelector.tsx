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
  /** Minimum selectable time slot (inclusive). Slots before this are greyed out and disabled. */
  minTime?: string;
  /** Set of "HH:MM" time strings that are busy in Outlook */
  busySlots?: Set<string>;
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

// Full-hour slots for condensed display
const isFullHour = (slot: string) => slot.endsWith(":00");

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TimeSlotSelector({ label, value, brandColor, onChange, minTime, busySlots }: TimeSlotSelectorProps) {
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

  const hasBusy = busySlots && busySlots.size > 0;

  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1.5 px-1">
        {label}
      </span>
      <div
        ref={containerRef}
        className="max-h-[260px] md:max-h-[260px] overflow-y-auto border border-gray-200 rounded-xl shadow-sm bg-white scrollbar-thin"
      >
        {SLOTS.map(slot => {
          const isSelected = slot === value;
          const isDisabled = !!minTime && slot < minTime;
          const isBusy = busySlots?.has(slot) ?? false;
          const fullHour = isFullHour(slot);

          return (
            <button
              key={slot}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              disabled={isDisabled}
              onClick={() => { if (!isDisabled) onChange(slot); }}
              className={`
                w-full text-left transition-all duration-100 flex items-center
                ${fullHour ? "pt-1.5 pb-1 px-2.5" : "py-0.5 px-2.5"}
                ${isSelected ? "rounded-lg my-0.5 shadow-sm" : ""}
              `}
              style={{
                backgroundColor: isSelected
                  ? brandColor
                  : undefined,
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.35 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSelected && !isDisabled) {
                  e.currentTarget.style.backgroundColor = isBusy ? "#fee2e2" : `${brandColor}0d`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !isDisabled) {
                  e.currentTarget.style.backgroundColor = "";
                }
              }}
            >
              {/* Time label */}
              <span
                className={`
                  font-mono tabular-nums
                  ${fullHour ? "text-xs font-semibold" : "text-[10px] font-normal"}
                  ${isSelected ? "text-white" : isDisabled ? "text-gray-300" : isBusy ? "text-red-400" : "text-gray-700"}
                `}
                style={{ minWidth: "2.5rem" }}
              >
                {slot}
              </span>

              {/* Availability bar */}
              {hasBusy && !isDisabled && (
                <span className="flex-1 ml-2 flex items-center">
                  <span
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: "100%",
                      backgroundColor: isSelected
                        ? "rgba(255,255,255,0.3)"
                        : isBusy
                          ? "#fca5a5"
                          : "#d1fae5",
                    }}
                  />
                </span>
              )}

              {/* Busy badge */}
              {isBusy && !isSelected && !isDisabled && fullHour && (
                <span className="ml-1.5 text-[8px] font-bold text-red-400 uppercase tracking-widest shrink-0">
                  belegt
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
