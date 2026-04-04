"use client";

import { useState, useRef, useEffect } from "react";

interface DateRangePickerProps {
  startDate?: Date | null;
  endDate?: Date | null;
  onStartDateChange?: (date: Date | null) => void;
  onEndDateChange?: (date: Date | null) => void;
  onStartTimeChange?: (time: string) => void;
  onEndTimeChange?: (time: string) => void;
  className?: string;
}

export default function DateRangePicker({
  startDate: initialStartDate = null,
  endDate: initialEndDate = null,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
  className = "",
}: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate);
  const [startTime, setStartTime] = useState("00:00 AM");
  const [endTime, setEndTime] = useState("00:00 AM");

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

  // Generate calendar days
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    // Add empty cells to complete the grid (to make 6 rows if needed)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push(i);
    }

    return days;
  };

  const handleDayClick = (day: number | null) => {
    if (day === null) return;

    const clickedDate = new Date(currentYear, currentMonth, day);

    // If no start date or both dates are set, start a new selection
    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
      onStartDateChange?.(clickedDate);
      onEndDateChange?.(null);
    }
    // If start date is set but no end date
    else if (startDate && !endDate) {
      if (clickedDate < startDate) {
        // If clicked date is before start date, swap them
        setEndDate(startDate);
        setStartDate(clickedDate);
        onStartDateChange?.(clickedDate);
        onEndDateChange?.(startDate);
      } else {
        setEndDate(clickedDate);
        onEndDateChange?.(clickedDate);
      }
    }
  };

  const isDateInRange = (day: number | null) => {
    if (day === null || !startDate) return false;

    const currentDate = new Date(currentYear, currentMonth, day);

    if (endDate) {
      return currentDate >= startDate && currentDate <= endDate;
    }

    return false;
  };

  const isStartDate = (day: number | null) => {
    if (day === null || !startDate) return false;
    const currentDate = new Date(currentYear, currentMonth, day);
    return (
      currentDate.getDate() === startDate.getDate() &&
      currentDate.getMonth() === startDate.getMonth() &&
      currentDate.getFullYear() === startDate.getFullYear()
    );
  };

  const isEndDate = (day: number | null) => {
    if (day === null || !endDate) return false;
    const currentDate = new Date(currentYear, currentMonth, day);
    return (
      currentDate.getDate() === endDate.getDate() &&
      currentDate.getMonth() === endDate.getMonth() &&
      currentDate.getFullYear() === endDate.getFullYear()
    );
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

  const handleTimeChange = (
    type: "start" | "end",
    field: "hour" | "minute" | "period",
    value: string
  ) => {
    const timeString = type === "start" ? startTime : endTime;
    const [time, period] = timeString.split(" ");
    let [hour, minute] = time.split(":");

    if (field === "hour") hour = value;
    if (field === "minute") minute = value;
    const newPeriod = field === "period" ? value : period;

    const newTime = `${hour}:${minute} ${newPeriod}`;

    if (type === "start") {
      setStartTime(newTime);
      onStartTimeChange?.(newTime);
    } else {
      setEndTime(newTime);
      onEndTimeChange?.(newTime);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return `${monthNames[date.getMonth()]} ${date.getDate()}`;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg p-6 w-[320px] font-sans ${className}`}
    >
      {/* Header with month/year selectors and navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10 12L6 8L10 4" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          {/* Month selector */}
          <div className="relative">
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="appearance-none bg-gray-100 rounded-lg px-3 py-1.5 pr-8 font-medium text-gray-900 cursor-pointer hover:bg-gray-200 transition-colors outline-none"
            >
              {monthNames.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 5L6 8L9 5" />
            </svg>
          </div>

          {/* Year selector */}
          <div className="relative">
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="appearance-none bg-gray-100 rounded-lg px-3 py-1.5 pr-8 font-medium text-gray-900 cursor-pointer hover:bg-gray-200 transition-colors outline-none"
            >
              {Array.from({ length: 20 }, (_, i) => currentYear - 10 + i).map(
                (year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              )}
            </select>
            <svg
              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 5L6 8L9 5" />
            </svg>
          </div>
        </div>

        <button
          onClick={handleNextMonth}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 4L10 8L6 12" />
          </svg>
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {calendarDays.map((day, index) => {
          const isInRange = isDateInRange(day);
          const isStart = isStartDate(day);
          const isEnd = isEndDate(day);
          const isGrayedOut =
            index >=
            getDaysInMonth(currentMonth, currentYear) +
              getFirstDayOfMonth(currentMonth, currentYear);

          return (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              disabled={day === null}
              className={`
                h-8 flex items-center justify-center text-sm font-medium rounded-lg transition-all
                ${day === null ? "invisible" : ""}
                ${isGrayedOut ? "text-gray-300 cursor-default" : "text-gray-900"}
                ${!isGrayedOut && !isStart && !isEnd ? "hover:bg-gray-100" : ""}
                ${isInRange && !isStart && !isEnd ? "bg-really-light-gray" : ""}
                ${isStart || isEnd ? "bg-bcp-blue text-white hover:bg-light-bcp-blue" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Time pickers */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        {/* Start time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {formatDate(startDate) || "Start date"}
            </span>
            <span className="text-xs text-gray-500">Start time</span>
          </div>
          <TimeInput
            value={startTime}
            onChange={(field, value) => handleTimeChange("start", field, value)}
          />
        </div>

        {/* End time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {formatDate(endDate) || "End date"}
            </span>
            <span className="text-xs text-gray-500">End time</span>
          </div>
          <TimeInput
            value={endTime}
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
  const [hour, minute] = time.split(":");

  return (
    <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
      <input
        type="text"
        value={hour}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "");
          if (val === "" || (Number(val) >= 1 && Number(val) <= 12)) {
            onChange("hour", val.padStart(2, "0"));
          }
        }}
        className="w-6 bg-transparent text-center text-sm font-medium outline-none"
        maxLength={2}
      />
      <span className="text-sm font-medium">:</span>
      <input
        type="text"
        value={minute}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "");
          if (val === "" || (Number(val) >= 0 && Number(val) <= 59)) {
            onChange("minute", val.padStart(2, "0"));
          }
        }}
        className="w-6 bg-transparent text-center text-sm font-medium outline-none"
        maxLength={2}
      />
      <button
        onClick={() => onChange("period", period === "AM" ? "PM" : "AM")}
        className="ml-1 text-sm font-medium hover:bg-gray-200 px-1.5 py-0.5 rounded transition-colors"
      >
        {period}
      </button>
    </div>
  );
}
