"use client";

import { useState, useEffect, useCallback } from "react";
import { MiniCalendar } from "./MiniCalendar";
import { TimeSlotSelector } from "./TimeSlotSelector";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BusySlot {
  start: string;
  end: string;
}

export interface AppointmentPickerProps {
  /** Pre-selected start (ISO string or null) */
  initialStart: string | null;
  /** Pre-selected end (ISO string or null) */
  initialEnd: string | null;
  brandColor: string;
  /** Comma-separated assignee names — triggers Outlook free/busy fetch */
  assignee?: string;
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

/** Convert a UTC Date to Zurich local components */
function toZurichComponents(utcDate: Date): { date: string; hh: string; mm: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(utcDate);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hh: get("hour").padStart(2, "0"),
    mm: get("minute").padStart(2, "0"),
  };
}

/** Convert busy slots (UTC ISO ranges) into a Set of "HH:MM" Zurich-local time strings for a given date */
function busySlotsToTimeSet(slots: BusySlot[], dateStr: string): Set<string> {
  const set = new Set<string>();
  for (const slot of slots) {
    if (!slot.start || !slot.end) continue;
    const s = new Date(slot.start);
    const e = new Date(slot.end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) continue;

    // Walk in 15-min increments
    const cur = new Date(s);
    while (cur < e) {
      const z = toZurichComponents(cur);
      if (z.date === dateStr) {
        set.add(`${z.hh}:${z.mm}`);
      }
      cur.setMinutes(cur.getMinutes() + 15);
    }
  }
  return set;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppointmentPicker({
  initialStart, initialEnd, brandColor, assignee, onConfirm, onCancel,
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

  // ── Outlook busy slots ──────────────────────────────────────────────
  const [busyTimes, setBusyTimes] = useState<Set<string>>(new Set());
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [loadingBusy, setLoadingBusy] = useState(false);

  const fetchBusySlots = useCallback(async (dateStr: string) => {
    if (!assignee?.trim()) return;
    setLoadingBusy(true);
    try {
      const params = new URLSearchParams({ date: dateStr, staff: assignee });
      const res = await fetch(`/api/ops/calendar/freebusy?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCalendarConnected(data.connected === true);
        // Merge busy slots from all staff members
        const allBusy: BusySlot[] = [];
        for (const s of data.slots ?? []) {
          allBusy.push(...(s.busy ?? []));
        }
        setBusyTimes(busySlotsToTimeSet(allBusy, dateStr));
      }
    } catch {
      // Non-blocking
    } finally {
      setLoadingBusy(false);
    }
  }, [assignee]);

  // Fetch when date is selected
  useEffect(() => {
    if (startDate) {
      fetchBusySlots(startDate);
    } else {
      setBusyTimes(new Set());
    }
  }, [startDate, fetchBusySlots]);

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

  // Count busy slots for legend
  const busyCount = busyTimes.size;

  return (
    <div className="border border-gray-200 rounded-2xl bg-white shadow-md p-5 mt-3">
      {/* Header: Outlook status + legend */}
      {calendarConnected && startDate && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-medium">Outlook verbunden</span>
            {loadingBusy && <span className="text-gray-400">— lade…</span>}
          </div>
          {busyCount > 0 && !loadingBusy && (
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="text-gray-400 line-through">00:00</span>
                <span className="text-gray-400">= belegt</span>
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-5">
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
        <div className="flex gap-2">
          <div className="flex-1" style={{ minWidth: "5rem" }}>
            <TimeSlotSelector
              label="Von"
              value={startTime}
              brandColor={brandColor}
              onChange={handleStartTimeChange}
              busySlots={busyTimes}
            />
          </div>
          <div className="flex-1" style={{ minWidth: "5rem" }}>
            <TimeSlotSelector
              label="Bis"
              value={endTime}
              brandColor={brandColor}
              onChange={handleEndTimeChange}
              minTime={minEndTime}
              busySlots={busyTimes}
            />
          </div>
        </div>
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-red-700 font-medium">{validationError}</p>
        </div>
      )}

      {/* Summary + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-gray-100 gap-3">
        <div className="text-sm text-gray-600 min-w-0">
          {startDate ? (
            <span className="font-semibold text-gray-900 break-words">
              {formatPickerSummary(startDate, endDate, startTime, endTime)}
            </span>
          ) : (
            <span className="text-gray-400 italic">Tag wählen…</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="rounded-lg px-5 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-40 transition-all hover:shadow-md"
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
