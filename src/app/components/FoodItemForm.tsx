import React, { useState, useId } from 'react';
import { X, Info } from 'lucide-react';
import { Button3D } from './Button3D';
import type { FoodItem, FoodCategory } from '../types';

interface FoodItemFormProps {
  initialValues?: Partial<FoodItem>;
  categories: FoodCategory[];
  onSave: (data: Omit<FoodItem, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function FoodItemForm({
  initialValues,
  categories,
  onSave,
  onCancel,
  isEditing = false,
}: FoodItemFormProps) {
  const uid = useId();

  const [name,            setName]            = useState(initialValues?.name            ?? '');
  const [categoryId,      setCategoryId]      = useState(initialValues?.categoryId      ?? categories[0]?.id ?? '');
  const [pricePerUnit,    setPricePerUnit]    = useState(String(initialValues?.pricePerUnit    ?? ''));
  const [defaultQuantity, setDefaultQuantity] = useState(String(initialValues?.defaultQuantity ?? '1'));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim())               e.name = 'Name is required';
    if (!categoryId)                e.categoryId = 'Select a category';
    const price = Number(pricePerUnit);
    if (!pricePerUnit || isNaN(price) || price <= 0)
      e.pricePerUnit = 'Enter a valid price (> 0)';
    const dq = Number(defaultQuantity);
    if (!defaultQuantity || isNaN(dq) || dq < 1 || !Number.isInteger(dq))
      e.defaultQuantity = 'Enter a whole number ≥ 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      name: name.trim(),
      categoryId,
      pricePerUnit: Number(pricePerUnit),
      defaultQuantity: Number(defaultQuantity),
    });
  }

  const isBundle = Number(defaultQuantity) > 1;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Name */}
      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-name`} className="text-sm font-medium text-white/70">
          Item Name *
        </label>
        <input
          id={`${uid}-name`}
          className="glass-input"
          placeholder="e.g. Paneer Tikka"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-cat`} className="text-sm font-medium text-white/70">
          Category *
        </label>
        <select
          id={`${uid}-cat`}
          className="glass-input"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
        >
          <option value="" disabled>Select category…</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.categoryId && <p className="text-red-400 text-xs">{errors.categoryId}</p>}
      </div>

      {/* Price & Default Qty */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-price`} className="text-sm font-medium text-white/70">
            Price (₹) *
          </label>
          <input
            id={`${uid}-price`}
            className="glass-input"
            type="number"
            min="1"
            step="0.01"
            placeholder="e.g. 350"
            value={pricePerUnit}
            onChange={e => setPricePerUnit(e.target.value)}
          />
          {errors.pricePerUnit && <p className="text-red-400 text-xs">{errors.pricePerUnit}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-dq`} className="text-sm font-medium text-white/70">
            Default Qty *
          </label>
          <input
            id={`${uid}-dq`}
            className="glass-input"
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 1"
            value={defaultQuantity}
            onChange={e => setDefaultQuantity(e.target.value)}
          />
          {errors.defaultQuantity && <p className="text-red-400 text-xs">{errors.defaultQuantity}</p>}
        </div>
      </div>

      {/* Bundle pricing hint */}
      <div
        className="flex gap-2 p-3 rounded-xl text-xs"
        style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
      >
        <Info size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="text-white/70 leading-relaxed">
          {isBundle ? (
            <>
              <span className="text-indigo-300 font-semibold">Bundle pricing active.</span>{' '}
              ₹{pricePerUnit || 0} is the <strong>total</strong> price for {defaultQuantity} units.
              Cost will be calculated as{' '}
              <span className="font-mono text-white/90">price × (qty / {defaultQuantity})</span>.
            </>
          ) : (
            <>
              <span className="text-indigo-300 font-semibold">Per-unit pricing.</span>{' '}
              Set Default Qty &gt; 1 to use bundle/tray pricing (e.g. ₹3600 for a tray of 50).
              Cost = price × selected&nbsp;qty.
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Button3D type="button" variant="secondary" onClick={onCancel} className="flex-1">
          <X size={16} /> Cancel
        </Button3D>
        <Button3D type="submit" variant="primary" className="flex-1">
          {isEditing ? 'Save Changes' : 'Add Item'}
        </Button3D>
      </div>
    </form>
  );
}
