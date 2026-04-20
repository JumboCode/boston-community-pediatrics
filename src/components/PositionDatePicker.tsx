"use client";

import { useState, useRef } from "react";

interface PositionDatePickerProps {
  date?: string; // "yyyy-mm-dd"
  startTime?: string; // "hh:mm" 24h
  endTime?: string; // "hh:mm" 24h
  onDateChange?: (ymd: string) => void;
  onStartTimeChange?: (hhmm: string) => void;
  onEndTimeChange?: (hhmm: string) => void;
  className?: string;
}

function parseYmd(ymd: string): Date | null {
  if (!ymd) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parse24hTo12h(hhmm: string): {
  hour: string;
  minute: string;
  period: "AM" | "PM";
} {
  if (!hhmm) return { hour: "12", minute: "00", period: "AM" };
  const [hStr, mStr] = hhmm.split(":");
  const h = parseInt(hStr ?? "0", 10);
  const m = parseInt(mStr ?? "0", 10);
  const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return {
    hour: String(hour12).padStart(2, "0"),
    minute: String(m).padStart(2, "0"),
    period,
  };
}

function to24h(hour: string, minute: string, period: "AM" | "PM"): string {
  let h = parseInt(hour, 10) || 0;
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatDateDisplay(ymd: string): string {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-");
  return `${m}/${d}/${y}`;
}

export default function PositionDatePicker({
  date: initialDate = "",
  startTime: initialStartTime = "",
  endTime: initialEndTime = "",
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  className = "",
}: PositionDatePickerProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  const [viewMonth, setViewMonth] = useState(
    initialDate
      ? (parseYmd(initialDate)?.getMonth() ?? currentMonth)
      : currentMonth
  );
  const [viewYear, setViewYear] = useState(
    initialDate
      ? (parseYmd(initialDate)?.getFullYear() ?? currentYear)
      : currentYear
  );

  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [startTime, setStartTime] = useState<string>(
    initialStartTime || "09:00"
  );
  const [endTime, setEndTime] = useState<string>(initialEndTime || "17:00");

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const isPastDate = (year: number, month: number, day: number) =>
    new Date(year, month, day) <
    new Date(currentYear, currentMonth, currentDay);

  const isTooFarInFuture = (year: number, month: number, day: number) =>
    new Date(year, month, day) >
    new Date(currentYear + 5, currentMonth, currentDay);

  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) =>
    new Date(year, month, 1).getDay();

  const generateCalendarDays = (): (number | null)[] => {
    const daysInMonth = getDaysInMonth(viewMonth, viewYear);
    const firstDay = getFirstDayOfMonth(viewMonth, viewYear);
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    let nextDay = 1;
    while (days.length < 42) {
      days.push(nextDay++);
    }
    return days;
  };

  const handleDayClick = (
    day: number | null,
    isPast: boolean,
    isTooFar: boolean
  ) => {
    if (day === null || isPast || isTooFar) return;
    const ymd = toYmd(new Date(viewYear, viewMonth, day));
    setSelectedDate(ymd);
    onDateChange?.(ymd);
  };

  const isSelected = (day: number | null, isTrailing: boolean) => {
    if (day === null || isTrailing || !selectedDate) return false;
    const sel = parseYmd(selectedDate);
    return (
      !!sel && new Date(viewYear, viewMonth, day).getTime() === sel.getTime()
    );
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else setViewMonth(viewMonth - 1);
  };
  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else setViewMonth(viewMonth + 1);
  };

  const handleTimeCommit = (
    type: "start" | "end",
    hour: string,
    minute: string,
    period: "AM" | "PM"
  ) => {
    const hhmm = to24h(hour, minute, period);
    if (type === "start") {
      setStartTime(hhmm);
      onStartTimeChange?.(hhmm);
    } else {
      setEndTime(hhmm);
      onEndTimeChange?.(hhmm);
    }
  };

  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear + i);
  const getAvailableMonths = () =>
    monthNames.map((name, index) => ({
      name,
      index,
      disabled: viewYear === currentYear && index < currentMonth,
    }));

  const calendarDays = generateCalendarDays();
  const startParsed = parse24hTo12h(startTime);
  const endParsed = parse24hTo12h(endTime);

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg w-[300px] font-sans overflow-hidden ${className}`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            disabled={viewYear === currentYear && viewMonth === currentMonth}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="appearance-none bg-gray-100 rounded-lg px-3 py-1.5 pr-8 font-medium text-gray-900 cursor-pointer hover:bg-gray-200 transition-colors outline-none"
              >
                {getAvailableMonths().map((month) => (
                  <option
                    key={month.index}
                    value={month.index}
                    disabled={month.disabled}
                  >
                    {month.name}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                width="12"
                height="12"
              >
                <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            <div className="relative">
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="appearance-none bg-gray-100 rounded-lg px-3 py-1.5 pr-8 font-medium text-gray-900 cursor-pointer hover:bg-gray-200 transition-colors outline-none"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                width="12"
                height="12"
              >
                <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>

          <button
            onClick={handleNextMonth}
            disabled={viewYear === currentYear + 5 && viewMonth === 11}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {calendarDays.map((day, index) => {
            const isTrailing =
              day !== null &&
              index >=
                getDaysInMonth(viewMonth, viewYear) +
                  getFirstDayOfMonth(viewMonth, viewYear);

            const sel = isSelected(day, isTrailing);

            const isPast = day !== null && isPastDate(viewYear, viewMonth, day);
            const isTooFar =
              day !== null && isTooFarInFuture(viewYear, viewMonth, day);
            const isDisabled = isPast || isTooFar || isTrailing;

            return (
              <button
                key={index}
                onClick={() =>
                  handleDayClick(day, isPast || isTrailing, isTooFar)
                }
                disabled={day === null || isDisabled}
                className={`
                h-10 flex items-center justify-center text-base font-medium rounded-xl transition-all
                ${day === null ? "invisible" : ""}
                ${isTrailing || isDisabled ? "text-gray-300 cursor-not-allowed" : "text-gray-700"}
                ${!isTrailing && !isDisabled && !sel ? "hover:bg-gray-100" : ""}
                ${sel ? "bg-bcp-blue text-white" : ""}
              `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date & Time footer */}
      <div className="border-t border-gray-200 px-4 py-3 space-y-3">
        {/* Date display */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Date
          </p>
          <p className="text-xs font-semibold text-gray-800">
            {selectedDate ? formatDateDisplay(selectedDate) : "—"}
          </p>
        </div>

        {/* Start time | End time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wide text-gray-400">
              Start
            </span>
            <TimeInput
              hour={startParsed.hour}
              minute={startParsed.minute}
              period={startParsed.period}
              onCommit={(h, m, p) => handleTimeCommit("start", h, m, p)}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wide text-gray-400">
              End
            </span>
            <TimeInput
              hour={endParsed.hour}
              minute={endParsed.minute}
              period={endParsed.period}
              onCommit={(h, m, p) => handleTimeCommit("end", h, m, p)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TimeInput ─────────────────────────────────────────────────────────────

interface TimeInputProps {
  hour: string;
  minute: string;
  period: "AM" | "PM";
  onCommit: (hour: string, minute: string, period: "AM" | "PM") => void;
}

function TimeInput({ hour, minute, period, onCommit }: TimeInputProps) {
  const [localHour, setLocalHour] = useState(hour);
  const [localMinute, setLocalMinute] = useState(minute);
  const [localPeriod, setLocalPeriod] = useState<"AM" | "PM">(period);

  const prevHour = useRef(hour);
  const prevMinute = useRef(minute);
  const prevPeriod = useRef(period);
  if (prevHour.current !== hour) {
    prevHour.current = hour;
    setLocalHour(hour);
  }
  if (prevMinute.current !== minute) {
    prevMinute.current = minute;
    setLocalMinute(minute);
  }
  if (prevPeriod.current !== period) {
    prevPeriod.current = period;
    setLocalPeriod(period);
  }

  const clampHour = (val: string) => {
    const n = parseInt(val, 10);
    if (isNaN(n) || val === "") return "12";
    return String(Math.min(12, Math.max(1, n))).padStart(2, "0");
  };
  const clampMinute = (val: string) => {
    const n = parseInt(val, 10);
    if (isNaN(n) || val === "") return "00";
    return String(Math.min(59, Math.max(0, n))).padStart(2, "0");
  };

  const handleHourBlur = () => {
    const clamped = clampHour(localHour);
    setLocalHour(clamped);
    onCommit(clamped, localMinute, localPeriod);
  };

  const handleMinuteBlur = () => {
    const clamped = clampMinute(localMinute);
    setLocalMinute(clamped);
    onCommit(localHour, clamped, localPeriod);
  };

  const togglePeriod = () => {
    const next: "AM" | "PM" = localPeriod === "AM" ? "PM" : "AM";
    setLocalPeriod(next);
    onCommit(localHour, localMinute, next);
  };

  return (
    <div className="flex items-center bg-gray-100 rounded-md px-1.5 py-1">
      <input
        type="text"
        inputMode="numeric"
        value={localHour}
        onChange={(e) => setLocalHour(e.target.value.replace(/\D/g, ""))}
        onFocus={(e) => e.target.select()}
        onBlur={handleHourBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="w-6 bg-transparent text-center text-xs font-semibold text-gray-800 outline-none"
        maxLength={2}
      />
      <span className="text-xs font-semibold text-gray-500 mx-0.5">:</span>
      <input
        type="text"
        inputMode="numeric"
        value={localMinute}
        onChange={(e) => setLocalMinute(e.target.value.replace(/\D/g, ""))}
        onFocus={(e) => e.target.select()}
        onBlur={handleMinuteBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="w-6 bg-transparent text-center text-xs font-semibold text-gray-800 outline-none"
        maxLength={2}
      />
      <button
        type="button"
        onClick={togglePeriod}
        className="ml-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 px-1 py-0.5 rounded transition-colors"
      >
        {localPeriod}
      </button>
    </div>
  );
}
