"use client";

import { useEffect, useState } from "react";

function to12h(hhmm: string): string {
  if (!hhmm) return "12:00 AM";
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

function to24h(time12: string): string {
  const [time, period] = time12.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (period === "AM" && h === 12) h = 0;
  else if (period === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function dateToYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ymdToDate(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  onStartDateChange?: (ymd: string) => void;
  onEndDateChange?: (ymd: string) => void;
  onStartTimeChange?: (hhmm24: string) => void;
  onEndTimeChange?: (hhmm24: string) => void;
  className?: string;
}

export default function DateRangePicker({
  startDate: initialStartDate = "",
  endDate: initialEndDate = "",
  startTime: initialStartTime = "",
  endTime: initialEndTime = "",
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
  className = "",
}: DateRangePickerProps) {
  const initSD = ymdToDate(initialStartDate);
  const initED = ymdToDate(initialEndDate);

  const [currentMonth, setCurrentMonth] = useState(
    initSD ? initSD.getMonth() : new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    initSD ? initSD.getFullYear() : new Date().getFullYear()
  );
  const [startDateState, setStartDateState] = useState<Date | null>(initSD);
  const [endDateState, setEndDateState] = useState<Date | null>(initED);
  const [startTime12, setStartTime12] = useState(to12h(initialStartTime));
  const [endTime12, setEndTime12] = useState(to12h(initialEndTime));

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const monthNamesFull = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (month: number, year: number) =>
    new Date(year, month, 1).getDay();

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) days.push(i);

    return days;
  };

  const handleDayClick = (day: number | null, index: number) => {
    if (day === null) return;

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    if (index >= daysInMonth + firstDay) return;

    const clickedDate = new Date(currentYear, currentMonth, day);

    if (!startDateState || (startDateState && endDateState)) {
      setStartDateState(clickedDate);
      setEndDateState(null);
      onStartDateChange?.(dateToYMD(clickedDate));
      onEndDateChange?.("");
    } else if (startDateState && !endDateState) {
      if (clickedDate < startDateState) {
        setEndDateState(startDateState);
        setStartDateState(clickedDate);
        onStartDateChange?.(dateToYMD(clickedDate));
        onEndDateChange?.(dateToYMD(startDateState));
      } else {
        setEndDateState(clickedDate);
        onEndDateChange?.(dateToYMD(clickedDate));
      }
    }
  };

  const classifyDay = (day: number | null, index: number) => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const isGrayedOut = index >= daysInMonth + firstDay;

    if (day === null || isGrayedOut || !startDateState) {
      return { isStart: false, isEnd: false, inRange: false, isGrayedOut: isGrayedOut || day === null };
    }

    const cellDate = new Date(currentYear, currentMonth, day);
    const isStart = sameDay(cellDate, startDateState);
    const isEnd = endDateState ? sameDay(cellDate, endDateState) : false;
    const inRange = endDateState
      ? cellDate >= startDateState && cellDate <= endDateState
      : false;

    return { isStart, isEnd, inRange, isGrayedOut: false };
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const navigateToDate = (date: Date | null) => {
    if (!date) return;
    setCurrentMonth(date.getMonth());
    setCurrentYear(date.getFullYear());
  };

  const handleTimeChange = (
    type: "start" | "end",
    field: "hour" | "minute" | "period",
    value: string
  ) => {
    const timeString = type === "start" ? startTime12 : endTime12;
    const [time, period] = timeString.split(" ");
    let [hour, minute] = time.split(":");

    if (field === "hour") hour = value;
    if (field === "minute") minute = value;
    const newPeriod = field === "period" ? value : period;

    const newTime12 = `${hour}:${minute} ${newPeriod}`;

    if (type === "start") {
      setStartTime12(newTime12);
      onStartTimeChange?.(to24h(newTime12));
    } else {
      setEndTime12(newTime12);
      onEndTimeChange?.(to24h(newTime12));
    }
  };

  const formatDateLabel = (date: Date | null) => {
    if (!date) return "";
    return `${monthNamesFull[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const calendarDays = generateCalendarDays();

  const singleDayRange =
    startDateState && endDateState && sameDay(startDateState, endDateState);

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg p-6 w-[320px] font-sans ${className}`}
    >
      {/* Month/year nav */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 12L6 8L10 4" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="appearance-none bg-gray-100 rounded-lg px-3 py-1.5 pr-8 font-medium text-gray-900 cursor-pointer hover:bg-gray-200 transition-colors outline-none"
            >
              {monthNames.map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 5L6 8L9 5" />
            </svg>
          </div>

          <div className="relative">
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="appearance-none bg-gray-100 rounded-lg px-3 py-1.5 pr-8 font-medium text-gray-900 cursor-pointer hover:bg-gray-200 transition-colors outline-none"
            >
              {Array.from({ length: 20 }, (_, i) => currentYear - 10 + i).map(
                (year) => (
                  <option key={year} value={year}>{year}</option>
                )
              )}
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 5L6 8L9 5" />
            </svg>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 4L10 8L6 12" />
          </svg>
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 mb-1">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid -- no gap so range band is continuous */}
      <div className="grid grid-cols-7 mb-4">
        {calendarDays.map((day, index) => {
          const { isStart, isEnd, inRange, isGrayedOut } = classifyDay(day, index);
          const col = index % 7;

          // Background strip behind the cell for the continuous range band
          let bgClass = "";
          if (inRange && !singleDayRange) {
            if (isStart && isEnd) {
              bgClass = "";
            } else if (isStart) {
              bgClass = "bg-gradient-to-r from-transparent to-bcp-blue/15";
            } else if (isEnd) {
              bgClass = "bg-gradient-to-l from-transparent to-bcp-blue/15";
            } else {
              bgClass = "bg-bcp-blue/15";
            }
          }

          // Round the range strip at row edges so it doesn't bleed
          let bgRound = "";
          if (inRange && !isStart && !isEnd && !singleDayRange) {
            if (col === 0) bgRound = "rounded-l-full";
            if (col === 6) bgRound = "rounded-r-full";
          }

          return (
            <div key={index} className={`relative h-9 ${bgClass} ${bgRound}`}>
              <button
                type="button"
                onClick={() => handleDayClick(day, index)}
                disabled={day === null || isGrayedOut}
                className={`
                  relative z-10 w-full h-full flex items-center justify-center text-sm font-medium transition-colors
                  ${day === null ? "invisible" : ""}
                  ${isGrayedOut ? "text-gray-300 cursor-default" : ""}
                  ${!isGrayedOut && !isStart && !isEnd ? "text-gray-900 hover:bg-gray-100 rounded-full" : ""}
                  ${(isStart || isEnd) ? "text-white" : ""}
                `}
              >
                {(isStart || isEnd) && (
                  <span className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-bcp-blue" />
                )}
                <span className="relative z-10">{day}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Start / end rows with clickable date labels */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">Start</span>
            <button
              type="button"
              onClick={() => navigateToDate(startDateState)}
              className="text-sm font-medium text-gray-800 hover:text-bcp-blue transition-colors text-left"
            >
              {formatDateLabel(startDateState) || "Select start date"}
            </button>
          </div>
          <TimeInput
            value={startTime12}
            onChange={(field, value) => handleTimeChange("start", field, value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">End</span>
            <button
              type="button"
              onClick={() => navigateToDate(endDateState)}
              className="text-sm font-medium text-gray-800 hover:text-bcp-blue transition-colors text-left"
            >
              {formatDateLabel(endDateState) || "Select end date"}
            </button>
          </div>
          <TimeInput
            value={endTime12}
            onChange={(field, value) => handleTimeChange("end", field, value)}
          />
        </div>
      </div>
    </div>
  );
}

interface TimeInputProps {
  value: string;
  onChange: (field: "hour" | "minute" | "period", value: string) => void;
}

function TimeInput({ value, onChange }: TimeInputProps) {
  const [time, period] = value.split(" ");
  const [propHour, propMinute] = time.split(":");

  const [hourDraft, setHourDraft] = useState(propHour);
  const [minuteDraft, setMinuteDraft] = useState(propMinute);

  useEffect(() => {
    setHourDraft(propHour);
  }, [propHour]);

  useEffect(() => {
    setMinuteDraft(propMinute);
  }, [propMinute]);

  const commitHour = (raw: string) => {
    if (raw === "") {
      setHourDraft(propHour);
      return;
    }
    let n = Number(raw);
    if (Number.isNaN(n)) {
      setHourDraft(propHour);
      return;
    }
    if (n < 1) n = 1;
    if (n > 12) n = 12;
    const padded = String(n).padStart(2, "0");
    setHourDraft(padded);
    onChange("hour", padded);
  };

  const commitMinute = (raw: string) => {
    if (raw === "") {
      setMinuteDraft(propMinute);
      return;
    }
    let n = Number(raw);
    if (Number.isNaN(n)) {
      setMinuteDraft(propMinute);
      return;
    }
    if (n < 0) n = 0;
    if (n > 59) n = 59;
    const padded = String(n).padStart(2, "0");
    setMinuteDraft(padded);
    onChange("minute", padded);
  };

  return (
    <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
      <input
        type="text"
        inputMode="numeric"
        value={hourDraft}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "").slice(0, 2);
          setHourDraft(val);
        }}
        onBlur={(e) => commitHour(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitHour(e.currentTarget.value);
            e.currentTarget.blur();
          }
        }}
        className="w-6 bg-transparent text-center text-sm font-medium outline-none"
        maxLength={2}
      />
      <span className="text-sm font-medium">:</span>
      <input
        type="text"
        inputMode="numeric"
        value={minuteDraft}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "").slice(0, 2);
          setMinuteDraft(val);
        }}
        onBlur={(e) => commitMinute(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitMinute(e.currentTarget.value);
            e.currentTarget.blur();
          }
        }}
        className="w-6 bg-transparent text-center text-sm font-medium outline-none"
        maxLength={2}
      />
      <button
        type="button"
        onClick={() => onChange("period", period === "AM" ? "PM" : "AM")}
        className="ml-1 text-sm font-medium hover:bg-gray-200 px-1.5 py-0.5 rounded transition-colors"
      >
        {period}
      </button>
    </div>
  );
}
