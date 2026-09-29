import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Booking, VenueSettings } from '../../types';
import { formatCurrency, formatDate, formatTime, getStatusBadgeConfig } from '../../utils/formatters';

interface CalendarViewProps {
  bookings: Booking[];
  settings: VenueSettings;
  onSelectBooking: (booking: Booking) => void;
  onNewBookingWithDate: (date: string) => void;
}

type CalendarMode = 'month' | 'week' | 'list';

export const CalendarView: React.FC<CalendarViewProps> = ({
  bookings,
  settings,
  onSelectBooking,
  onNewBookingWithDate,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 27)); // September 2026
  const [viewMode, setViewMode] = useState<CalendarMode>('month');
  const [selectedSpaceFilter, setSelectedSpaceFilter] = useState<string>('all');

  const filteredBookings = bookings.filter((b) => {
    if (selectedSpaceFilter !== 'all' && b.venueSpaceId !== selectedSpaceFilter) {
      return false;
    }
    return true;
  });

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const setToday = () => {
    setCurrentDate(new Date(2026, 8, 27));
  };

  // Build Month Grid Days
  const calendarDays = [];

  // Previous month padding days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const d = new Date(year, month - 1, dayNum);
    const dateStr = d.toISOString().split('T')[0];
    calendarDays.push({
      dayNumber: dayNum,
      dateString: dateStr,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    // Format YYYY-MM-DD
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      dayNumber: d,
      dateString: dateStr,
      isCurrentMonth: true,
    });
  }

  // Trailing next month padding days to complete 35 or 42 grid cells
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      dayNumber: d,
      dateString: dateStr,
      isCurrentMonth: false,
    });
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Calendar Top Controls Header */}
      <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0D2440]">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center border border-[#7BA4D0]/30 rounded-xl bg-[#E7F0FA]/40 overflow-hidden">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-[#7BA4D0]/20 text-[#0D2440] transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={setToday}
              className="px-2.5 py-1 text-xs font-semibold text-[#2E5E99] hover:bg-[#7BA4D0]/20 border-x border-[#7BA4D0]/30 transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-[#7BA4D0]/20 text-[#0D2440] transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters & View Modes */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Space Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-600" />
            <select
              value={selectedSpaceFilter}
              onChange={(e) => setSelectedSpaceFilter(e.target.value)}
              className="bg-transparent font-medium text-[#0D2440] focus:outline-none cursor-pointer"
            >
              <option value="all">All Venue Spaces</option>
              {settings.spaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-[#E7F0FA] rounded-xl border border-[#7BA4D0]/30 text-xs font-semibold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'month'
                  ? 'bg-[#2E5E99] text-white shadow-xs'
                  : 'text-[#0D2440] hover:text-[#2E5E99]'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#2E5E99] text-white shadow-xs'
                  : 'text-[#0D2440] hover:text-[#2E5E99]'
              }`}
            >
              List Agenda
            </button>
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="bg-white/80 rounded-xl px-4 py-2.5 border border-[#7BA4D0]/20 flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="font-semibold text-slate-700">Status Key:</span>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="text-slate-700">Confirmed (Deposit & Contract)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-700">Deposit Paid (Contract Pending)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-700">Pending Deposit</span>
          </div>
        </div>
      </div>

      {/* Calendar View Area */}
      {viewMode === 'month' ? (
        <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 shadow-xs overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-[#E7F0FA]/40 text-center text-xs font-bold text-[#0D2440] py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {calendarDays.map((day, idx) => {
              const dayBookings = filteredBookings.filter((b) => b.eventDate === day.dateString);
              const isToday = day.dateString === '2026-09-27';

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (dayBookings.length > 0) {
                      onSelectBooking(dayBookings[0]);
                    } else {
                      onNewBookingWithDate(day.dateString);
                    }
                  }}
                  title={
                    dayBookings.length > 0
                      ? `${day.dateString}: ${dayBookings.map((b) => `${b.clientName} (${formatTime(b.startTime)})`).join(', ')}`
                      : `Click to book event on ${day.dateString}`
                  }
                  className={`group relative h-14 sm:h-16 flex flex-col items-center justify-center transition-colors duration-150 cursor-pointer ${
                    day.isCurrentMonth
                      ? isToday
                        ? 'bg-[#E7F0FA]/70 hover:bg-[#2E5E99]'
                        : 'bg-white hover:bg-[#2E5E99]'
                      : 'bg-slate-50/60 hover:bg-[#2E5E99]'
                  }`}
                >
                  <span
                    className={`text-xs sm:text-sm font-semibold tabular-nums transition-colors duration-150 flex items-center justify-center ${
                      isToday
                        ? 'w-7 h-7 rounded-full bg-[#2E5E99] text-white font-bold group-hover:bg-transparent group-hover:text-white'
                        : day.isCurrentMonth
                        ? 'text-[#0D2440] group-hover:text-white'
                        : 'text-slate-400 group-hover:text-white'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {/* Booking indicator dots if events exist on this date */}
                  {dayBookings.length > 0 && (
                    <div className="absolute bottom-1.5 flex items-center justify-center gap-1 pointer-events-none">
                      {dayBookings.map((b) => {
                        const badge = getStatusBadgeConfig(b.status);
                        return (
                          <span
                            key={b.id}
                            className={`w-1.5 h-1.5 rounded-full ${badge.dotColor} group-hover:bg-white transition-colors`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List Agenda View */
        <div className="bg-white rounded-2xl border border-[#7BA4D0]/20 shadow-xs divide-y divide-slate-100">
          {filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-slate-700">
              <CalendarIcon className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-[#0D2440]">No events found for this filter</p>
              <p className="text-xs text-slate-700 mt-1">Try switching venue space or view another date.</p>
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const badge = getStatusBadgeConfig(booking.status);
              return (
                <div
                  key={booking.id}
                  onClick={() => onSelectBooking(booking)}
                  className="p-4 hover:bg-[#E7F0FA]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#0D2440]">{booking.clientName}</span>
                      <span className="text-xs text-slate-700 font-mono font-medium">{booking.bookingRef}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge.bgColor}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-700 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-[#0D2440]">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        {formatDate(booking.eventDate)} ({formatTime(booking.startTime)} - {formatTime(booking.endTime)})
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-600" />
                        {booking.venueSpaceName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-slate-700">Total / Deposit</div>
                      <div className="text-sm font-bold text-[#0D2440] tabular-nums">
                        {formatCurrency(booking.totalAmount)}
                        <span className="text-xs font-normal text-slate-700 ml-1">
                          ({formatCurrency(booking.depositAmount)} dep)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
