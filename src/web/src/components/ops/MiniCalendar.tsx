"use client";

import { useMemo } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MiniCalendarProps {
  /** Currently selected start date (YYYY-MM-DD) */
  startDate: string | null;
  /** Currently selected end date (YYYY-MM-DD) */
  endDate: string | null;
  /** Visible month (1-indexed) */
  month: number;
  /** Visible year */
  year: number;
  /** Tenant brand color for accents */
  brandColor: string;
  onDateClick: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayStr(): string {
  return toDateStr(new Date());
}

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MiniCalendar({
  startDate, endDate, month, year, brandColor,
  onDateClick, onPrevMonth, onNextMonth,
}: MiniCalendarProps) {
  const today = todayStr();

  // Build grid: array of { dateStr, dayNum, isCurrentMonth }
  const cells = useMemo(() => {
    const firstOfMonth = new Date(year, month - 1, 1);
    // Monday = 0, Sunday = 6
    const startDow = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month, 0).getDate();

    const result: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthDays = new Date(year, month - 1, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const dt = new Date(year, month - 2, d);
      result.push({ dateStr: toDateStr(dt), dayNum: d, isCurrentMonth: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month - 1, d);
      result.push({ dateStr: toDateStr(dt), dayNum: d, isCurrentMonth: true });
    }

    // Next month padding (fill to 42 = 6 rows, or at least complete the last row)
    const remainder = result.length % 7;
    if (remainder > 0) {
      const fill = 7 - remainder;
      for (let d = 1; d <= fill; d++) {
        const dt = new Date(year, month, d);
        result.push({ dateStr: toDateStr(dt), dayNum: d, isCurrentMonth: false });
      }
    }

    return result;
  }, [year, month]);

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={onPrevMonth}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <button
          type="button"
          onClick={onNextMonth}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(wd => (
          <div key={wd} className="text-center text-[10px] font-medium text-gray-400 uppercase tracking-wide py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map(({ dateStr, dayNum, isCurrentMonth }) => {
          const isToday = dateStr === today;
          const isStart = dateStr === startDate;
          const isEnd = dateStr === endDate;
          const isSelected = isStart || isEnd;
          const inRange =
            startDate && endDate && dateStr > startDate && dateStr < endDate;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => isCurrentMonth && onDateClick(dateStr)}
              disabled={!isCurrentMonth}
              className="relative flex items-center justify-center h-8 text-xs font-medium transition-all duration-150"
              style={{
                color: isSelected
                  ? "#fff"
                  : !isCurrentMonth
                  ? "#d1d5db"
                  : undefined,
                backgroundColor: isSelected
                  ? brandColor
                  : inRange
                  ? `${brandColor}1a`
                  : undefined,
                borderRadius: isSelected ? "9999px" : undefined,
                cursor: !isCurrentMonth ? "default" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (isCurrentMonth && !isSelected) {
                  e.currentTarget.style.backgroundColor = `${brandColor}14`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !inRange) {
                  e.currentTarget.style.backgroundColor = "";
                } else if (inRange && !isSelected) {
                  e.currentTarget.style.backgroundColor = `${brandColor}1a`;
                }
              }}
            >
              <span
                className="relative z-10"
                style={
                  isToday && !isSelected
                    ? {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "28px",
                        height: "28px",
                        borderRadius: "9999px",
                        boxShadow: `inset 0 0 0 2px ${brandColor}`,
                      }
                    : undefined
                }
              >
                {dayNum}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
