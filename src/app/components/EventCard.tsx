import React from 'react';
import { Clock, MapPin, Users, Repeat, Pencil, Trash2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { formatINR } from '../lib/currency';
import { calcLineCost } from '../lib/cost';
import type { CateringEvent, FoodItem } from '../types';

interface EventCardProps {
  event: CateringEvent;
  occurrenceDate?: string; // for recurring — the displayed date
  foodItems: FoodItem[];
  onEdit:   (event: CateringEvent) => void;
  onDelete: (event: CateringEvent) => void;
}

export function EventCard({ event, occurrenceDate, foodItems, onEdit, onDelete }: EventCardProps) {
  const foodMap = new Map(foodItems.map(fi => [fi.id, fi]));

  const total = event.items.reduce((sum, ei) => {
    const fi = foodMap.get(ei.foodItemId);
    if (!fi) return sum;
    return sum + calcLineCost(fi.pricePerUnit, fi.defaultQuantity, ei.quantity);
  }, 0);

  const isRecurringOccurrence = event.recurrence && occurrenceDate && occurrenceDate !== event.date;

  return (
    <GlassCard className="p-4 animate-fade-in-up">
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-white text-base truncate">
              {event.title}
            </h3>
            {event.recurrence && (
              <span
                className="flex items-center gap-1 text-xs text-pink-400 bg-pink-400/10 border border-pink-400/20 rounded-full px-2 py-0.5 flex-shrink-0"
                title={isRecurringOccurrence ? 'Recurring occurrence' : 'Recurring event'}
              >
                <Repeat size={10} />
                {isRecurringOccurrence ? 'occurrence' : 'recurring'}
              </span>
            )}
          </div>
          {event.clientName && (
            <p className="text-sm text-white/50 truncate mt-0.5">{event.clientName}</p>
          )}
        </div>

        <div className="flex gap-1.5 flex-shrink-0">
          {!isRecurringOccurrence && (
            <button
              onClick={() => onEdit(event)}
              className="btn-3d btn-icon btn-secondary"
              aria-label={`Edit ${event.title}`}
              style={{ minWidth: 34, minHeight: 34, padding: '6px' }}
            >
              <Pencil size={14} />
            </button>
          )}
          <button
            onClick={() => onDelete(event)}
            className="btn-3d btn-icon btn-danger"
            aria-label={`Delete ${event.title}`}
            style={{ minWidth: 34, minHeight: 34, padding: '6px' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/50 mb-3">
        {(event.startTime || event.endTime) && (
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="flex-shrink-0" />
            {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
          </span>
        )}
        {event.venue && (
          <span className="flex items-center gap-1.5 min-w-0">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </span>
        )}
        {event.guestCount > 0 && (
          <span className="flex items-center gap-1.5">
            <Users size={12} className="flex-shrink-0" />
            {event.guestCount} guests
          </span>
        )}
      </div>

      {/* Food items summary */}
      {event.items.length > 0 && (
        <div className="border-t border-white/8 pt-3">
          <div className="flex flex-col gap-1.5 mb-2">
            {event.items.map(ei => {
              const fi = foodMap.get(ei.foodItemId);
              if (!fi) return null;
              const lineCost = calcLineCost(fi.pricePerUnit, fi.defaultQuantity, ei.quantity);
              return (
                <div key={ei.foodItemId} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-white/60 truncate">{fi.name} ×{ei.quantity}</span>
                  <span className="text-violet-300 flex-shrink-0 font-medium">{formatINR(lineCost)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-white/8 pt-2">
            <span className="text-xs text-white/40 font-medium">Total</span>
            <span className="font-display font-bold text-white">{formatINR(total)}</span>
          </div>
        </div>
      )}

      {/* Notes */}
      {event.notes && (
        <p className="text-xs text-white/40 mt-2 border-t border-white/5 pt-2 break-words">
          {event.notes}
        </p>
      )}
    </GlassCard>
  );
}
