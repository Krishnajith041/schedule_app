import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { BarChart2, Plus, CalendarX } from 'lucide-react';
import { useAppContext } from '../state/AppContext';
import { CateringScheduler } from '../components/CateringScheduler';
import { EventCard } from '../components/EventCard';
import { AddEventDialog } from '../components/AddEventDialog';
import { Button3D } from '../components/Button3D';
import { GlassCard } from '../components/GlassCard';
import { todayStr, formatDisplayDate } from '../lib/dates';
import { getOccurrencesOnDate } from '../lib/recurrence';
import type { CateringEvent } from '../types';

function nanoid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function SchedulePage() {
  const { state, dispatch } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [showDialog,   setShowDialog]   = useState(false);
  const [editingEvent, setEditingEvent] = useState<CateringEvent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CateringEvent | null>(null);

  // Events visible on selected date (including recurring occurrences)
  const dayEvents = useMemo(() =>
    state.events.filter(ev => getOccurrencesOnDate(ev, selectedDate)),
    [state.events, selectedDate]
  );

  function handleAddEvent(data: Omit<CateringEvent, 'id' | 'createdAt'>) {
    dispatch({
      type: 'ADD_EVENT',
      payload: { id: nanoid(), ...data, createdAt: new Date().toISOString() },
    });
    setShowDialog(false);
  }

  function handleEditEvent(data: Omit<CateringEvent, 'id' | 'createdAt'>, scope?: 'this' | 'all') {
    if (!editingEvent) return;
    if (scope === 'all') {
      dispatch({ type: 'UPDATE_EVENT_SERIES', payload: { ...editingEvent, ...data } });
    } else {
      dispatch({ type: 'UPDATE_EVENT', payload: { ...editingEvent, ...data } });
    }
    setEditingEvent(null);
  }

  function handleDeleteEvent(scope: 'this' | 'all') {
    if (!deleteConfirm) return;
    if (scope === 'all' || !deleteConfirm.recurrence) {
      dispatch({ type: 'DELETE_EVENT_SERIES', payload: { id: deleteConfirm.id } });
    } else {
      dispatch({ type: 'DELETE_EVENT', payload: { id: deleteConfirm.id } });
    }
    setDeleteConfirm(null);
    setEditingEvent(null);
  }

  return (
    <div className="page-content px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Schedule</h1>
          <p className="text-sm text-white/50 mt-0.5">Your catering calendar</p>
        </div>
        <Link
          to="/analysis"
          aria-label="Open AI Analysis"
          className="btn-3d btn-icon btn-secondary"
        >
          <BarChart2 size={20} />
        </Link>
      </div>

      {/* Calendar */}
      <div className="mb-5">
        <CateringScheduler
          events={state.events}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>

      {/* Selected day header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-white text-base">
          {formatDisplayDate(selectedDate)}
        </h2>
        <Button3D
          variant="primary"
          onClick={() => setShowDialog(true)}
          aria-label="Add event"
        >
          <Plus size={16} /> Add Event
        </Button3D>
      </div>

      {/* Day events */}
      {dayEvents.length === 0 ? (
        <GlassCard className="p-8 text-center animate-fade-in-up">
          <CalendarX size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No events on this day</p>
          <button
            onClick={() => setShowDialog(true)}
            className="text-violet-400 text-sm mt-2 underline underline-offset-2"
          >
            Add one?
          </button>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-3">
          {dayEvents.map(ev => (
            <EventCard
              key={ev.id}
              event={ev}
              occurrenceDate={selectedDate}
              foodItems={state.foodItems}
              onEdit={setEditingEvent}
              onDelete={setDeleteConfirm}
            />
          ))}
        </div>
      )}

      {/* Add event dialog */}
      {showDialog && (
        <AddEventDialog
          initialValues={{ date: selectedDate }}
          categories={state.categories}
          foodItems={state.foodItems}
          onSave={handleAddEvent}
          onClose={() => setShowDialog(false)}
        />
      )}

      {/* Edit event dialog */}
      {editingEvent && (
        <AddEventDialog
          initialValues={editingEvent}
          categories={state.categories}
          foodItems={state.foodItems}
          onSave={handleEditEvent}
          onDelete={handleDeleteEvent}
          onClose={() => setEditingEvent(null)}
          isEditing
        />
      )}

      {/* Delete confirmation (non-recurring) */}
      {deleteConfirm && !editingEvent && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          role="dialog"
          aria-modal="true"
        >
          <GlassCard className="w-full max-w-sm p-5 animate-fade-in-up border border-white/15 shadow-2xl">
            <h2 className="font-display font-bold text-white mb-2">Delete Event</h2>
            <p className="text-white/60 text-sm mb-5 leading-relaxed">
              {deleteConfirm.recurrence
                ? 'This is a recurring event. Delete just this occurrence or the entire series?'
                : `Delete "${deleteConfirm.title}"? This cannot be undone.`}
            </p>
            {deleteConfirm.recurrence ? (
              <div className="flex flex-col gap-2.5">
                <Button3D variant="danger" onClick={() => handleDeleteEvent('this')} className="w-full justify-center">
                  This event only
                </Button3D>
                <Button3D variant="danger" onClick={() => handleDeleteEvent('all')} className="w-full justify-center">
                  All events in series
                </Button3D>
                <Button3D variant="secondary" onClick={() => setDeleteConfirm(null)} className="w-full justify-center">
                  Cancel
                </Button3D>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button3D variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1 justify-center">
                  Cancel
                </Button3D>
                <Button3D variant="danger" onClick={() => handleDeleteEvent('this')} className="flex-1 justify-center">
                  Delete
                </Button3D>
              </div>
            )}
          </GlassCard>
        </div>,
        document.body
      )}
    </div>
  );
}
