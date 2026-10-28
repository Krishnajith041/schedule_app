import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2, Plus } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button3D } from './Button3D';
import { FoodItemForm } from './FoodItemForm';
import { formatINR } from '../lib/currency';
import type { FoodCategory, FoodItem } from '../types';

interface CategorySectionProps {
  category: FoodCategory;
  items: FoodItem[];
  allCategories: FoodCategory[];
  onEditCategory:  (cat: FoodCategory) => void;
  onDeleteCategory:(id: string) => void;
  onAddItem:       (data: Omit<FoodItem, 'id' | 'createdAt'>) => void;
  onEditItem:      (item: FoodItem) => void;
  onDeleteItem:    (id: string) => void;
}

export function CategorySection({
  category,
  items,
  allCategories,
  onEditCategory,
  onDeleteCategory,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: CategorySectionProps) {
  const [expanded, setExpanded]         = useState(true);
  const [showAddForm, setShowAddForm]   = useState(false);
  const [editingItem, setEditingItem]   = useState<FoodItem | null>(null);

  function handleAddItem(data: Omit<FoodItem, 'id' | 'createdAt'>) {
    onAddItem(data);
    setShowAddForm(false);
  }

  function handleEditItem(data: Omit<FoodItem, 'id' | 'createdAt'>) {
    if (!editingItem) return;
    onEditItem({ ...editingItem, ...data });
    setEditingItem(null);
  }

  return (
    <GlassCard className="overflow-hidden animate-fade-in-up">
      {/* Category header */}
      <div className="flex items-center gap-2 p-4">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-2 flex-1 min-w-0"
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${category.name}`}
        >
          <span className="font-display font-semibold text-white truncate">{category.name}</span>
          <span className="text-xs text-white/40 flex-shrink-0">({items.length})</span>
          {expanded
            ? <ChevronUp size={16} className="text-white/40 flex-shrink-0 ml-auto" />
            : <ChevronDown size={16} className="text-white/40 flex-shrink-0 ml-auto" />
          }
        </button>

        {/* Category actions */}
        <button
          onClick={() => onEditCategory(category)}
          className="btn-3d btn-icon btn-secondary"
          aria-label={`Edit ${category.name}`}
          style={{ minWidth: 36, minHeight: 36, padding: '6px' }}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDeleteCategory(category.id)}
          className="btn-3d btn-icon btn-danger"
          aria-label={`Delete ${category.name}`}
          style={{ minWidth: 36, minHeight: 36, padding: '6px' }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-white/8">
          {/* Items list */}
          {items.length === 0 && !showAddForm && (
            <p className="text-white/30 text-sm text-center py-4">No items yet</p>
          )}

          {items.map(item => (
            <div key={item.id}>
              {editingItem?.id === item.id ? (
                <div className="p-4 border-b border-white/8">
                  <FoodItemForm
                    initialValues={item}
                    categories={allCategories}
                    onSave={handleEditItem}
                    onCancel={() => setEditingItem(null)}
                    isEditing
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-violet-300 font-semibold">
                        {formatINR(item.pricePerUnit)}
                      </span>
                      {item.defaultQuantity > 1 && (
                        <span className="text-xs text-white/40">
                          for {item.defaultQuantity} units
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingItem(item)}
                    className="btn-3d btn-icon btn-secondary flex-shrink-0"
                    aria-label={`Edit ${item.name}`}
                    style={{ minWidth: 34, minHeight: 34, padding: '6px' }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="btn-3d btn-icon btn-danger flex-shrink-0"
                    aria-label={`Delete ${item.name}`}
                    style={{ minWidth: 34, minHeight: 34, padding: '6px' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add item form or button */}
          {showAddForm ? (
            <div className="p-4 border-t border-white/8">
              <FoodItemForm
                initialValues={{ categoryId: category.id }}
                categories={allCategories}
                onSave={handleAddItem}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          ) : (
            <div className="p-3 border-t border-white/5">
              <Button3D
                variant="secondary"
                onClick={() => setShowAddForm(true)}
                className="w-full text-xs"
                style={{ minHeight: 38 }}
              >
                <Plus size={14} /> Add Item to {category.name}
              </Button3D>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
