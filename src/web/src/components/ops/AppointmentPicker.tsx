"use client";

import { useState } from "react";
import { MiniCalendar } from "./MiniCalendar";
import { TimeSlotSelector } from "./TimeSlotSelector";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AppointmentPickerProps {
  /** Pre-selected start (ISO string or null) */
  initialStart: string | null;
  /** Pre-selected end (ISO string or null) */
  initialEnd: string | null;
  brandColor: string;
  onConfirm: (startIso: string, endIso: string) => void;
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isoToDateStr(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoToTime(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  // Snap to nearest 15
  const snapped = Math.round(parseInt(min) / 15) * 15;
  const sm = snapped === 60 ? "00" : String(snapped).padStart(2, "0");
  const sh = snapped === 60 ? String(parseInt(h) + 1).padStart(2, "0") : h;
  return `${sh}:${sm}`;
}

function bumpTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.min(20, Math.floor(total / 60));
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm - (nm % 15)).padStart(2, "0")}`;
}

function toIso(dateStr: string, time: string): string {
  return new Date(`${dateStr}T${time}:00`).toISOString();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppointmentPicker({
  initialStart, initialEnd, brandColor, onConfirm, onCancel,
}: AppointmentPickerProps) {
  // Derive initial values
  const now = new Date();
  const initStartDate = initialStart ? isoToDateStr(initialStart) : null;
  const initEndDate = initialEnd ? isoToDateStr(initialEnd) : null;
  const initStartTime = initialStart ? isoToTime(initialStart) : "08:00";
  const initEndTime = initialEnd ? isoToTime(initialEnd) : "09:00";

  const [startDate, setStartDate] = useState<string | null>(initStartDate);
  const [endDate, setEndDate] = useState<string | null>(initEndDate);
  const [startTime, setStartTime] = useState(initStartTime);
  const [endTime, setEndTime] = useState(initEndTime);

  // Calendar navigation
  const initMonth = initialStart ? new Date(initialStart).getMonth() + 1 : now.getMonth() + 1;
  const initYear = initialStart ? new Date(initialStart).getFullYear() : now.getFullYear();
  const [calMonth, setCalMonth] = useState(initMonth);
  const [calYear, setCalYear] = useState(initYear);

  function prevMonth() {
    setCalMonth(m => m === 1 ? 12 : m - 1);
    if (calMonth === 1) setCalYear(y => y - 1);
  }

  function nextMonth() {
    setCalMonth(m => m === 12 ? 1 : m + 1);
    if (calMonth === 12) setCalYear(y => y + 1);
  }

  // Date click state machine
  function handleDateClick(dateStr: string) {
    setValidationError(null);
    if (!startDate) {
      setStartDate(dateStr);
      setEndDate(null);
      // Same day: ensure endTime >= startTime + 15
      const minEnd = bumpTime(startTime, 15);
      if (endTime < minEnd) setEndTime(minEnd);
    } else if (!endDate) {
      if (dateStr === startDate) {
        setStartDate(null);
      } else if (dateStr > startDate) {
        setEndDate(dateStr);
      } else {
        setEndDate(startDate);
        setStartDate(dateStr);
      }
    } else {
      setStartDate(dateStr);
      setEndDate(null);
      // Reset to same-day: ensure endTime >= startTime + 15
      const minEnd = bumpTime(startTime, 15);
      if (endTime < minEnd) setEndTime(minEnd);
    }
  }

  // Validation error message
  const [validationError, setValidationError] = useState<string | null>(null);

  // Compute minimum "Bis" time: Von + 15 min on the same day
  const minEndTime = (() => {
    if (!startDate) return undefined;
    const effEndDate = endDate ?? startDate;
    // Only constrain when same day
    if (effEndDate === startDate) {
      return bumpTime(startTime, 15);
    }
    return undefined;
  })();

  // Time validation: single day → endTime must be >= startTime + 15min
  function handleStartTimeChange(t: string) {
    setStartTime(t);
    setValidationError(null);
    const effEndDate = endDate ?? startDate;
    // Auto-adjust "Bis" if it would be before Von + 15min
    if (startDate && effEndDate === startDate) {
      const minEnd = bumpTime(t, 15);
      if (endTime < minEnd) {
        setEndTime(minEnd);
      }
    }
  }

  function handleEndTimeChange(t: string) {
    setValidationError(null);
    const effEndDate = endDate ?? startDate;
    if (startDate && effEndDate === startDate) {
      const minEnd = bumpTime(startTime, 15);
      if (t < minEnd) {
        // Auto-correct to minimum
        setEndTime(minEnd);
        return;
      }
    }
    setEndTime(t);
  }

  // Confirm
  const canConfirm = !!startDate;
  const handleConfirm = () => {
    if (!startDate) return;
    const effEndDate = endDate ?? startDate;
    const startIso = toIso(startDate, startTime);
    const endIso = toIso(effEndDate, endTime);
    // Final validation: end must be > start + 15min
    const startMs = new Date(startIso).getTime();
    const endMs = new Date(endIso).getTime();
    if (endMs - startMs < 15 * 60 * 1000) {
      setValidationError("Bis-Zeitpunkt muss nach Von + 15 Min. liegen");
      return;
    }
    setValidationError(null);
    onConfirm(startIso, endIso);
  };

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-4 mt-3">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Calendar */}
        <div className="flex-1 min-w-[240px]">
          <MiniCalendar
            startDate={startDate}
            endDate={endDate}
            month={calMonth}
            year={calYear}
            brandColor={brandColor}
            onDateClick={handleDateClick}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
        </div>

        {/* Time columns */}
        <div className="flex gap-3 md:gap-2">
          <div className="flex-1 md:w-20">
            <TimeSlotSelector
              label="Von"
              value={startTime}
              brandColor={brandColor}
              onChange={handleStartTimeChange}
            />
          </div>
          <div className="flex-1 md:w-20">
            <TimeSlotSelector
              label="Bis"
              value={endTime}
              brandColor={brandColor}
              onChange={handleEndTimeChange}
              minTime={minEndTime}
            />
          </div>
        </div>
      </div>

      {/* Validation error */}
      {validationError && (
        <p className="mt-2 text-xs text-red-600 font-medium">{validationError}</p>
      )}

      {/* Summary + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-3 border-t border-gray-100 gap-2">
        <div className="text-sm text-gray-600 min-w-0">
          {startDate ? (
            <span className="font-medium text-gray-800 break-words">
              {formatPickerSummary(startDate, endDate, startTime, endTime)}
            </span>
          ) : (
            <span className="text-gray-400">Tag wählen</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="rounded-lg px-4 py-1.5 text-xs font-semibold text-white shadow-sm disabled:opacity-40 transition-colors"
            style={{ backgroundColor: brandColor }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = canConfirm ? "1" : "0.4"; }}
          >
            Übernehmen
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary formatter
// ---------------------------------------------------------------------------

function formatPickerSummary(
  startDate: string, endDate: string | null,
  startTime: string, endTime: string,
): string {
  const sd = new Date(startDate + "T12:00:00");
  const dayFmt: Intl.DateTimeFormatOptions = {
    weekday: "short", day: "2-digit", month: "2-digit",
    timeZone: "Europe/Zurich",
  };

  if (!endDate || endDate === startDate) {
    // Same day
    return `${sd.toLocaleDateString("de-CH", dayFmt)} · ${startTime}–${endTime}`;
  }

  const ed = new Date(endDate + "T12:00:00");
  return `${sd.toLocaleDateString("de-CH", dayFmt)} ${startTime} – ${ed.toLocaleDateString("de-CH", dayFmt)} ${endTime}`;
}
