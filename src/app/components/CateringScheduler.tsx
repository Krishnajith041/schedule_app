import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { GlassCard } from './GlassCard';
import {
  MONTH_NAMES, DAY_NAMES, daysInMonth, firstWeekdayOfMonth,
  toDateStr, parseLocalDate,
} from '../lib/dates';
import { getOccurrencesOnDate } from '../lib/recurrence';
import type { CateringEvent } from '../types';

interface CateringSchedulerProps {
  events: CateringEvent[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function CateringScheduler({ events, selectedDate, onSelectDate }: CateringSchedulerProps) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const todayStr = toDateStr(today);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }
  function goToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onSelectDate(todayStr);
  }

  const totalDays   = daysInMonth(viewYear, viewMonth);
  const startOffset = firstWeekdayOfMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  // Pad to complete the last row
  while (cells.length % 7 !== 0) cells.push(null);

  function getEventsForDay(day: number): { hasEvent: boolean; hasRecurring: boolean; count: number } {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let count = 0;
    let hasRecurring = false;
    for (const ev of events) {
      const isOnDay = getOccurrencesOnDate(ev, dateStr);
      if (isOnDay) {
        count++;
        if (ev.recurrence && ev.date !== dateStr) hasRecurring = true;
      }
    }
    return { hasEvent: count > 0, hasRecurring, count };
  }

  return (
    <GlassCard className="p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="btn-3d btn-icon btn-secondary" aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <h2 className="font-display font-bold text-white text-lg">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h2>
        </div>
        <div className="flex gap-2">
          <button onClick={goToday} className="btn-3d btn-icon btn-secondary" aria-label="Go to today">
            <RotateCcw size={16} />
          </button>
          <button onClick={nextMonth} className="btn-3d btn-icon btn-secondary" aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Day name headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-xs font-medium text-white/30 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday    = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const { hasEvent, hasRecurring, count } = getEventsForDay(day);

          return (
            <button
              key={idx}
              onClick={() => onSelectDate(dateStr)}
              className={`cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              aria-label={`${day} ${MONTH_NAMES[viewMonth]} ${viewYear}${hasEvent ? `, ${count} event${count > 1 ? 's' : ''}` : ''}`}
              aria-pressed={isSelected}
            >
              <span className="cal-day-num">{day}</span>
              {hasEvent && (
                <div className="event-dots">
                  {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                    <span
                      key={i}
                      className={`event-dot ${hasRecurring ? 'recurring' : ''}`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
