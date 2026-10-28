import { useId } from 'react';
import type { RecurrenceRule } from '../types';

const DAY_CHIPS = [
  { label: 'Su', value: 0 },
  { label: 'Mo', value: 1 },
  { label: 'Tu', value: 2 },
  { label: 'We', value: 3 },
  { label: 'Th', value: 4 },
  { label: 'Fr', value: 5 },
  { label: 'Sa', value: 6 },
];

interface RecurrenceFieldsProps {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  rule: RecurrenceRule;
  onChange: (rule: RecurrenceRule) => void;
}

export function RecurrenceFields({ enabled, onToggle, rule, onChange }: RecurrenceFieldsProps) {
  const uid = useId();

  function update(patch: Partial<RecurrenceRule>) {
    onChange({ ...rule, ...patch });
  }

  function toggleDay(dow: number) {
    const days = rule.daysOfWeek ?? [];
    const next = days.includes(dow) ? days.filter(d => d !== dow) : [...days, dow].sort();
    update({ daysOfWeek: next });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div className="relative flex-shrink-0">
          <input
            type="checkbox"
            id={`${uid}-repeat`}
            className="sr-only peer"
            checked={enabled}
            onChange={e => onToggle(e.target.checked)}
          />
          <div className="w-11 h-6 rounded-full bg-white/10 peer-checked:bg-violet-600 transition-colors border border-white/15 peer-checked:border-violet-500" />
          <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
        </div>
        <span className="text-sm font-medium text-white/80">Repeat</span>
      </label>

      {enabled && (
        <div
          className="flex flex-col gap-3 p-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Frequency */}
          <div className="flex flex-col gap-1">
            <label htmlFor={`${uid}-freq`} className="text-xs font-medium text-white/60">
              Frequency
            </label>
            <select
              id={`${uid}-freq`}
              className="glass-input"
              value={rule.frequency}
              onChange={e => update({ frequency: e.target.value as RecurrenceRule['frequency'], daysOfWeek: [] })}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Interval */}
          <div className="flex items-center gap-3">
            <label htmlFor={`${uid}-interval`} className="text-xs text-white/60 flex-shrink-0">
              Every
            </label>
            <input
              id={`${uid}-interval`}
              type="number"
              min={1}
              max={99}
              className="glass-input w-20 flex-shrink-0"
              value={rule.interval}
              onChange={e => update({ interval: Math.max(1, Number(e.target.value)) })}
            />
            <span className="text-xs text-white/60 flex-shrink-0">
              {rule.frequency === 'daily' ? 'day(s)' : rule.frequency === 'weekly' ? 'week(s)' : 'month(s)'}
            </span>
          </div>

          {/* Day chips (weekly only) */}
          {rule.frequency === 'weekly' && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-white/60">On days</span>
              <div className="flex flex-wrap gap-1.5">
                {DAY_CHIPS.map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleDay(value)}
                    className={`chip ${(rule.daysOfWeek ?? []).includes(value) ? 'active' : ''}`}
                    style={{ minWidth: 40, minHeight: 36 }}
                    aria-pressed={(rule.daysOfWeek ?? []).includes(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* End condition */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-white/60">Ends</span>
            <div className="flex flex-col gap-2">
              {/* Never */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`${uid}-end`}
                  checked={!rule.endDate && !rule.occurrences}
                  onChange={() => update({ endDate: undefined, occurrences: undefined })}
                  className="accent-violet-500"
                />
                <span className="text-sm text-white/70">Never</span>
              </label>

              {/* On date */}
              <label className="flex items-center gap-2 cursor-pointer flex-wrap">
                <input
                  type="radio"
                  name={`${uid}-end`}
                  checked={!!rule.endDate && !rule.occurrences}
                  onChange={() => update({ endDate: new Date().toISOString().slice(0,10), occurrences: undefined })}
                  className="accent-violet-500"
                />
                <span className="text-sm text-white/70 flex-shrink-0">On date</span>
                {!!rule.endDate && !rule.occurrences && (
                  <input
                    type="date"
                    className="glass-input w-auto flex-1"
                    value={rule.endDate}
                    onChange={e => update({ endDate: e.target.value })}
                  />
                )}
              </label>

              {/* After N occurrences */}
              <label className="flex items-center gap-2 cursor-pointer flex-wrap">
                <input
                  type="radio"
                  name={`${uid}-end`}
                  checked={!!rule.occurrences && !rule.endDate}
                  onChange={() => update({ occurrences: 10, endDate: undefined })}
                  className="accent-violet-500"
                />
                <span className="text-sm text-white/70 flex-shrink-0">After</span>
                {!!rule.occurrences && !rule.endDate && (
                  <input
                    type="number"
                    min={1}
                    max={500}
                    className="glass-input w-20 flex-shrink-0"
                    value={rule.occurrences}
                    onChange={e => update({ occurrences: Math.max(1, Number(e.target.value)) })}
                  />
                )}
                <span className="text-sm text-white/70 flex-shrink-0">occurrences</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
