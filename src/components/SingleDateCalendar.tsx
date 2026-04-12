"use client";

import { useState, useEffect } from "react";

interface DatePickerProps {
  selectedDate?: Date | null;
  onDateChange?: (date: Date) => void;
  className?: string;
}

export default function DatePicker({
  selectedDate: initialDate = null,
  onDateChange,
  className = "",
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(
    initialDate ? initialDate.getMonth() : new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    initialDate ? initialDate.getFullYear() : new Date().getFullYear()
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);

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

  // Update internal state when prop changes
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
      setCurrentMonth(initialDate.getMonth());
      setCurrentYear(initialDate.getFullYear());
    }
  }, [initialDate]);

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

    // Add days from next month to complete the grid
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push(i);
    }

    return days;
  };

  const handleDayClick = (day: number | null, isGrayedOut: boolean) => {
    if (day === null || isGrayedOut) return;

    const clickedDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(clickedDate);
    onDateChange?.(clickedDate);
  };

  const isSelectedDate = (day: number | null) => {
    if (day === null || !selectedDate) return false;
    const currentDate = new Date(currentYear, currentMonth, day);
    return (
      currentDate.getDate() === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
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
          type="button"
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
              {Array.from({ length: 100 }, (_, i) => currentYear - 50 + i).map(
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
          type="button"
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
            className="text-center text-sm font-medium text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isSelected = isSelectedDate(day);
          const isGrayedOut =
            index >=
            getDaysInMonth(currentMonth, currentYear) +
              getFirstDayOfMonth(currentMonth, currentYear);

          return (
            <button
              key={index}
              onClick={() => handleDayClick(day, isGrayedOut)}
              disabled={day === null}
              type="button"
              className={`
                h-10 flex items-center justify-center text-base font-medium rounded-xl transition-all
                ${day === null ? "invisible" : ""}
                ${isGrayedOut ? "text-gray-300 cursor-default" : "text-gray-700"}
                ${!isGrayedOut && !isSelected ? "hover:bg-gray-100" : ""}
                ${isSelected ? "bg-bcp-blue text-white" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
