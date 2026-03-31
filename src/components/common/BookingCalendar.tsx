import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DiscountDay {
  date: number;
  month: number;
  year: number;
  label: string; // e.g. "20% Off"
}

interface BookingCalendarProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  filterDate?: (date: Date) => boolean;
  discounts?: DiscountDay[];
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  // Convert: 0=Sunday → Mon=0 ... Sun=6
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export default function BookingCalendar({
  selectedDate,
  onChange,
  minDate,
  maxDate,
  filterDate,
  discounts = [],
}: BookingCalendarProps) {
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Previous month fill
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const days: { date: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: d, month, year, isCurrentMonth: true });
    }

    // Next month leading days to fill remaining cells
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        days.push({ date: d, month: nextMonth, year: nextYear, isCurrentMonth: false });
      }
    }

    return days;
  }, [year, month, firstDay, daysInMonth, daysInPrevMonth, prevMonth, prevYear]);

  const weeks = useMemo(() => {
    const w: typeof calendarDays[] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      w.push(calendarDays.slice(i, i + 7));
    }
    return w;
  }, [calendarDays]);

  const monthLabel = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const canGoPrev = !minDate || new Date(year, month - 1, 1) >= new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const canGoNext = !maxDate || new Date(year, month + 1, 1) <= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  const goToPrevMonth = () => {
    if (!canGoPrev) return;
    setViewDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    if (!canGoNext) return;
    setViewDate(new Date(year, month + 1, 1));
  };

  const isSelected = (d: typeof calendarDays[0]) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === d.date &&
      selectedDate.getMonth() === d.month &&
      selectedDate.getFullYear() === d.year
    );
  };

  const isDisabled = (d: typeof calendarDays[0]) => {
    const date = new Date(d.year, d.month, d.date);
    if (minDate) {
      const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
      if (date < min) return true;
    }
    if (maxDate && date > maxDate) return true;
    if (filterDate && !filterDate(date)) return true;
    return false;
  };

  const getDiscount = (d: typeof calendarDays[0]) => {
    return discounts.find(
      (disc) => disc.date === d.date && disc.month === d.month && disc.year === d.year
    );
  };

  const handleDayClick = (d: typeof calendarDays[0]) => {
    if (!d.isCurrentMonth) return;
    if (isDisabled(d)) return;
    onChange(new Date(d.year, d.month, d.date));
  };

  return (
    <div className="w-full">
      {/* Calendar Card */}
      <div className="bg-white border border-[#E3E3E3] rounded-2xl p-4 w-full overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-2.5">
          <button
            onClick={goToPrevMonth}
            disabled={!canGoPrev}
            className="w-5 h-5 flex items-center justify-center text-[#192215] disabled:opacity-30"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-[#192215]">
            {monthLabel}
          </span>
          <button
            onClick={goToNextMonth}
            disabled={!canGoNext}
            className="w-5 h-5 flex items-center justify-center text-[#192215] disabled:opacity-30"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#E3E3E3] mb-2.5" />

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-1.5">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-sm text-[#8A8A8C] opacity-50 font-normal h-[29px] flex items-center justify-center"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day Grid */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-y-2">
            {week.map((d, di) => {
              const selected = isSelected(d);
              const disabled = isDisabled(d);
              const discount = d.isCurrentMonth ? getDiscount(d) : null;
              const isPrevNextMonth = !d.isCurrentMonth;

              return (
                <div key={di} className="flex flex-col items-center relative min-h-[52px]">
                  <button
                    onClick={() => handleDayClick(d)}
                    disabled={disabled || isPrevNextMonth}
                    className={`
                      w-[44px] h-[44px] flex items-center justify-center text-sm rounded-full transition-colors
                      ${selected
                        ? 'bg-[#3A6B22] text-white font-bold'
                        : isPrevNextMonth
                          ? 'text-[#8A8A8C] opacity-50 cursor-default'
                          : disabled
                            ? 'text-[#D1D5DB] cursor-not-allowed'
                            : 'text-[#292A2E] hover:bg-[#F8F1D7] hover:text-[#3A6B22] cursor-pointer'
                      }
                    `}
                  >
                    {d.date}
                  </button>
                  {/* Discount Badge — overlaps bottom of date button */}
                  {discount && !disabled && (
                    <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 bg-[#F8F1D7] border border-[#FFBD00]  rounded-[3px] p-1.5 h-[13px] flex items-center justify-center z-10">
                      <span className="text-[10px] font-medium text-green leading-none whitespace-nowrap">
                        {discount.label}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
