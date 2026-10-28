import { useState, useMemo, useId } from 'react';
import { X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Button3D } from './Button3D';
import { RecurrenceFields } from './RecurrenceFields';
import { formatINR } from '../lib/currency';
import { calcLineCost } from '../lib/cost';
import { todayStr } from '../lib/dates';
import type { CateringEvent, FoodCategory, FoodItem, RecurrenceRule, EventFoodItem } from '../types';

interface AddEventDialogProps {
  initialValues?: Partial<CateringEvent>;
  categories: FoodCategory[];
  foodItems: FoodItem[];
  onSave:   (data: Omit<CateringEvent, 'id' | 'createdAt'>, editMode?: 'this' | 'all') => void;
  onDelete?: (editMode: 'this' | 'all') => void;
  onClose:  () => void;
  isEditing?: boolean;
}

const DEFAULT_RULE: RecurrenceRule = { frequency: 'weekly', interval: 1, daysOfWeek: [] };

export function AddEventDialog({
  initialValues,
  categories,
  foodItems,
  onSave,
  onDelete,
  onClose,
  isEditing = false,
}: AddEventDialogProps) {
  const uid = useId();

  // Form fields
  const [title,       setTitle]       = useState(initialValues?.title       ?? '');
  const [clientName,  setClientName]  = useState(initialValues?.clientName  ?? '');
  const [date,        setDate]        = useState(initialValues?.date        ?? todayStr());
  const [startTime,   setStartTime]   = useState(initialValues?.startTime   ?? '');
  const [endTime,     setEndTime]     = useState(initialValues?.endTime     ?? '');
  const [venue,       setVenue]       = useState(initialValues?.venue       ?? '');
  const [guestCount,  setGuestCount]  = useState(String(initialValues?.guestCount ?? ''));
  const [notes,       setNotes]       = useState(initialValues?.notes       ?? '');

  // Food items selection
  const [selectedItems, setSelectedItems] = useState<EventFoodItem[]>(initialValues?.items ?? []);

  // Recurrence
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(!!initialValues?.recurrence);
  const [recurrenceRule,    setRecurrenceRule]     = useState<RecurrenceRule>(
    initialValues?.recurrence ?? { ...DEFAULT_RULE }
  );

  // Series edit/delete modal
  const [seriesAction, setSeriesAction] = useState<'save' | 'delete' | null>(null);

  // Food search/filter
  const [foodSearch,       setFoodSearch]       = useState('');
  const [expandedCats,     setExpandedCats]     = useState<Set<string>>(new Set(categories.map(c => c.id)));

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!title.trim())  e.title = 'Title is required';
    if (!date)          e.date  = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function buildPayload(): Omit<CateringEvent, 'id' | 'createdAt'> {
    return {
      title: title.trim(),
      clientName: clientName.trim(),
      date,
      startTime,
      endTime,
      venue: venue.trim(),
      guestCount: Number(guestCount) || 0,
      notes: notes.trim(),
      items: selectedItems,
      recurrence: recurrenceEnabled ? recurrenceRule : undefined,
    };
  }

  function handleSave() {
    if (!validate()) return;
    if (isEditing && initialValues?.recurrence) {
      setSeriesAction('save');
      return;
    }
    onSave(buildPayload());
  }

  function handleDelete() {
    if (!onDelete) return;
    if (initialValues?.recurrence) {
      setSeriesAction('delete');
      return;
    }
    onDelete('this');
  }

  function confirmSeriesAction(scope: 'this' | 'all') {
    if (seriesAction === 'save') {
      onSave(buildPayload(), scope);
    } else if (seriesAction === 'delete') {
      onDelete?.(scope);
    }
    setSeriesAction(null);
  }

  // Food item helpers
  function getQty(foodItemId: string): number {
    return selectedItems.find(i => i.foodItemId === foodItemId)?.quantity ?? 0;
  }

  function setQty(foodItemId: string, qty: number) {
    if (qty <= 0) {
      setSelectedItems(prev => prev.filter(i => i.foodItemId !== foodItemId));
    } else {
      setSelectedItems(prev => {
        const existing = prev.find(i => i.foodItemId === foodItemId);
        if (existing) return prev.map(i => i.foodItemId === foodItemId ? { ...i, quantity: qty } : i);
        return [...prev, { foodItemId, quantity: qty }];
      });
    }
  }

  const filteredFoodItems = useMemo(() => {
    if (!foodSearch) return foodItems;
    const q = foodSearch.toLowerCase();
    return foodItems.filter(fi => fi.name.toLowerCase().includes(q));
  }, [foodItems, foodSearch]);

  const foodItemsByCategory = useMemo(() => {
    const map = new Map<string, FoodItem[]>();
    for (const cat of categories) map.set(cat.id, []);
    for (const fi of filteredFoodItems) {
      if (map.has(fi.categoryId)) map.get(fi.categoryId)!.push(fi);
    }
    return map;
  }, [filteredFoodItems, categories]);

  const total = useMemo(() => {
    const foodMap = new Map(foodItems.map(fi => [fi.id, fi]));
    return selectedItems.reduce((sum, ei) => {
      const fi = foodMap.get(ei.foodItemId);
      if (!fi) return sum;
      return sum + calcLineCost(fi.pricePerUnit, fi.defaultQuantity, ei.quantity);
    }, 0);
  }, [selectedItems, foodItems]);

  function toggleCat(catId: string) {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }

  return (
    <>
      <div className="bottom-sheet animate-fade-in">
        {/* Overlay */}
        <div className="bottom-sheet-overlay" onClick={onClose} />

        {/* Panel */}
        <div className="bottom-sheet-panel">
          <div className="bottom-sheet-handle" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-white/8">
            <h2 className="font-display font-bold text-white text-lg">
              {isEditing ? 'Edit Event' : 'Add Event'}
            </h2>
            <button onClick={onClose} className="btn-3d btn-icon btn-secondary" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="bottom-sheet-body">
            <div className="flex flex-col gap-4 pt-3">

              {/* Title */}
              <div className="flex flex-col gap-1">
                <label htmlFor={`${uid}-title`} className="text-sm font-medium text-white/70">
                  Event Title *
                </label>
                <input
                  id={`${uid}-title`}
                  className="glass-input"
                  placeholder="e.g. Wedding Reception"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                {errors.title && <p className="text-red-400 text-xs">{errors.title}</p>}
              </div>

              {/* Client */}
              <div className="flex flex-col gap-1">
                <label htmlFor={`${uid}-client`} className="text-sm font-medium text-white/70">
                  Client Name
                </label>
                <input
                  id={`${uid}-client`}
                  className="glass-input"
                  placeholder="e.g. Sharma Family"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                />
              </div>

              {/* Date + Times */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor={`${uid}-date`} className="text-sm font-medium text-white/70">Date *</label>
                  <input
                    id={`${uid}-date`}
                    type="date"
                    className="glass-input"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                  {errors.date && <p className="text-red-400 text-xs">{errors.date}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor={`${uid}-start`} className="text-sm font-medium text-white/70">Start Time</label>
                  <input
                    id={`${uid}-start`}
                    type="time"
                    className="glass-input"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor={`${uid}-end`} className="text-sm font-medium text-white/70">End Time</label>
                  <input
                    id={`${uid}-end`}
                    type="time"
                    className="glass-input"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Venue + Guests */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor={`${uid}-venue`} className="text-sm font-medium text-white/70">Venue</label>
                  <input
                    id={`${uid}-venue`}
                    className="glass-input"
                    placeholder="e.g. Taj Hotel"
                    value={venue}
                    onChange={e => setVenue(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor={`${uid}-guests`} className="text-sm font-medium text-white/70">Guests</label>
                  <input
                    id={`${uid}-guests`}
                    type="number"
                    min={0}
                    className="glass-input"
                    placeholder="e.g. 150"
                    value={guestCount}
                    onChange={e => setGuestCount(e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1">
                <label htmlFor={`${uid}-notes`} className="text-sm font-medium text-white/70">Notes</label>
                <textarea
                  id={`${uid}-notes`}
                  className="glass-input"
                  rows={2}
                  placeholder="Any special instructions…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              {/* Recurrence */}
              <div
                className="p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <RecurrenceFields
                  enabled={recurrenceEnabled}
                  onToggle={setRecurrenceEnabled}
                  rule={recurrenceRule}
                  onChange={setRecurrenceRule}
                />
              </div>

              {/* Food picker */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-white text-sm">Food Items</h3>
                  {selectedItems.length > 0 && (
                    <span className="text-xs text-violet-300 font-semibold">{selectedItems.length} selected</span>
                  )}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  <input
                    className="glass-input pl-8"
                    placeholder="Search food items…"
                    value={foodSearch}
                    onChange={e => setFoodSearch(e.target.value)}
                  />
                </div>

                {/* Grouped items */}
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {categories.map(cat => {
                    const items = foodItemsByCategory.get(cat.id) ?? [];
                    if (items.length === 0) return null;
                    const isOpen = expandedCats.has(cat.id);
                    return (
                      <div key={cat.id} className="border-b border-white/5 last:border-0">
                        <button
                          type="button"
                          onClick={() => toggleCat(cat.id)}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-left"
                        >
                          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                            {cat.name}
                          </span>
                          {isOpen
                            ? <ChevronUp size={14} className="text-white/30 flex-shrink-0" />
                            : <ChevronDown size={14} className="text-white/30 flex-shrink-0" />
                          }
                        </button>
                        {isOpen && items.map(fi => {
                          const qty = getQty(fi.id);
                          const lineCost = qty > 0 ? calcLineCost(fi.pricePerUnit, fi.defaultQuantity, qty) : 0;
                          return (
                            <div
                              key={fi.id}
                              className="flex items-center gap-3 px-4 py-2.5 border-t border-white/5"
                              style={qty > 0 ? { background: 'rgba(139,92,246,0.07)' } : {}}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white/85 truncate">{fi.name}</p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span className="text-xs text-white/40">
                                    {formatINR(fi.pricePerUnit)}
                                    {fi.defaultQuantity > 1 ? ` / ${fi.defaultQuantity}` : ''}
                                  </span>
                                  {qty > 0 && (
                                    <span className="text-xs text-violet-300 font-semibold">
                                      = {formatINR(lineCost)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {/* Quantity stepper */}
                              <div className="qty-stepper flex-shrink-0">
                                <button
                                  type="button"
                                  className="qty-btn"
                                  onClick={() => setQty(fi.id, qty - (fi.defaultQuantity > 1 ? fi.defaultQuantity : 1))}
                                  disabled={qty === 0}
                                  aria-label={`Decrease ${fi.name}`}
                                >
                                  −
                                </button>
                                <span className="qty-num">{qty}</span>
                                <button
                                  type="button"
                                  className="qty-btn"
                                  onClick={() => setQty(fi.id, qty + (fi.defaultQuantity > 1 ? fi.defaultQuantity : 1))}
                                  aria-label={`Increase ${fi.name}`}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                  {filteredFoodItems.length === 0 && (
                    <p className="text-white/30 text-sm text-center py-6">No items found</p>
                  )}
                </div>

                {/* Live total */}
                {selectedItems.length > 0 && (
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}
                  >
                    <span className="text-sm text-white/70 font-medium">Estimated Total</span>
                    <span className="font-display font-bold text-xl text-violet-200">{formatINR(total)}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {isEditing && onDelete && (
                  <Button3D variant="danger" onClick={handleDelete} className="flex-shrink-0">
                    Delete
                  </Button3D>
                )}
                <Button3D variant="secondary" onClick={onClose} className="flex-1">
                  Cancel
                </Button3D>
                <Button3D variant="primary" onClick={handleSave} className="flex-1">
                  {isEditing ? 'Save Changes' : 'Add Event'}
                </Button3D>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Series scope modal */}
      {seriesAction && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        >
          <div className="glass-card w-full max-w-sm p-5 animate-fade-in-up">
            <h2 className="font-display font-bold text-white mb-2">
              {seriesAction === 'save' ? 'Save recurring event' : 'Delete recurring event'}
            </h2>
            <p className="text-white/60 text-sm mb-5">
              {seriesAction === 'save'
                ? 'Do you want to save changes to just this occurrence, or to all events in the series?'
                : 'Do you want to delete just this occurrence, or all events in the series?'}
            </p>
            <div className="flex flex-col gap-2">
              <Button3D
                variant={seriesAction === 'delete' ? 'danger' : 'primary'}
                onClick={() => confirmSeriesAction('this')}
                className="w-full"
              >
                This event only
              </Button3D>
              <Button3D
                variant={seriesAction === 'delete' ? 'danger' : 'secondary'}
                onClick={() => confirmSeriesAction('all')}
                className="w-full"
              >
                All events in series
              </Button3D>
              <Button3D variant="secondary" onClick={() => setSeriesAction(null)} className="w-full">
                Cancel
              </Button3D>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
