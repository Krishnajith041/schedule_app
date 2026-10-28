import React, { useMemo } from 'react';
import { CalendarX } from 'lucide-react';
import { useAppContext } from '../state/AppContext';
import { GlassCard } from '../components/GlassCard';
import { EventCard } from '../components/EventCard';
import { formatINR } from '../lib/currency';
import { calcLineCost } from '../lib/cost';
import { formatDisplayDate } from '../lib/dates';
import { getFutureOccurrences } from '../lib/recurrence';
import type { CateringEvent } from '../types';

export function UpcomingEventsPage() {
  const { state } = useAppContext();

  // Expand all events (including recurrences) into a flat list of { date, event }
  const allOccurrences = useMemo(() => {
    const list: { date: string; event: CateringEvent }[] = [];
    for (const ev of state.events) {
      const occs = getFutureOccurrences(ev);
      list.push(...occs);
    }
    // Sort by date asc
    list.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
    return list;
  }, [state.events]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, { date: string; event: CateringEvent }[]>();
    for (const occ of allOccurrences) {
      if (!map.has(occ.date)) map.set(occ.date, []);
      map.get(occ.date)!.push(occ);
    }
    return Array.from(map.entries());
  }, [allOccurrences]);

  // Compute total cost for a set of events on a date
  const foodMap = useMemo(
    () => new Map(state.foodItems.map(fi => [fi.id, fi])),
    [state.foodItems]
  );

  function dayTotal(events: { event: CateringEvent }[]): number {
    return events.reduce((sum, { event }) =>
      sum + event.items.reduce((s, ei) => {
        const fi = foodMap.get(ei.foodItemId);
        if (!fi) return s;
        return s + calcLineCost(fi.pricePerUnit, fi.defaultQuantity, ei.quantity);
      }, 0)
    , 0);
  }

  return (
    <div className="page-content px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Upcoming</h1>
          <p className="text-sm text-white/50 mt-0.5">
            {allOccurrences.length} event{allOccurrences.length !== 1 ? 's' : ''} ahead
          </p>
        </div>
      </div>

      {grouped.length === 0 ? (
        <GlassCard className="p-10 text-center animate-fade-in-up">
          <CalendarX size={36} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No upcoming events</p>
          <p className="text-white/25 text-xs mt-1">Add events on the Schedule tab</p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(([date, occs]) => {
            const total = dayTotal(occs);
            return (
              <div key={date} className="animate-fade-in-up">
                {/* Date header */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <h2 className="font-display font-bold text-white/80 text-sm">
                    {formatDisplayDate(date)}
                  </h2>
                  {total > 0 && (
                    <span className="text-xs font-semibold text-violet-300">
                      {formatINR(total)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {occs.map(({ event }, i) => (
                    <EventCard
                      key={`${event.id}-${date}-${i}`}
                      event={event}
                      occurrenceDate={date}
                      foodItems={state.foodItems}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
