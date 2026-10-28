import React, { useState, useId } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { useAppContext } from '../state/AppContext';
import { CategorySection } from '../components/CategorySection';
import { Button3D } from '../components/Button3D';
import { GlassCard } from '../components/GlassCard';
import type { FoodCategory, FoodItem } from '../types';

function nanoid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function FoodItemsPage() {
  const { state, dispatch } = useAppContext();
  const uid = useId();

  // New category form state
  const [showCatForm,   setShowCatForm]   = useState(false);
  const [newCatName,    setNewCatName]    = useState('');
  const [catError,      setCatError]      = useState('');

  // Edit category dialog
  const [editingCat,    setEditingCat]    = useState<FoodCategory | null>(null);
  const [editCatName,   setEditCatName]   = useState('');

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'cat' | 'item'; id: string } | null>(null);

  function handleAddCategory() {
    const name = newCatName.trim();
    if (!name) { setCatError('Category name is required'); return; }
    dispatch({
      type: 'ADD_CATEGORY',
      payload: { id: nanoid(), name, createdAt: new Date().toISOString() },
    });
    setNewCatName('');
    setShowCatForm(false);
    setCatError('');
  }

  function handleEditCategory(cat: FoodCategory) {
    setEditingCat(cat);
    setEditCatName(cat.name);
  }

  function handleSaveEditCategory() {
    if (!editingCat) return;
    const name = editCatName.trim();
    if (!name) return;
    dispatch({ type: 'UPDATE_CATEGORY', payload: { ...editingCat, name } });
    setEditingCat(null);
  }

  function handleDeleteCategory(id: string) {
    setConfirmDelete({ type: 'cat', id });
  }

  function handleAddItem(data: Omit<FoodItem, 'id' | 'createdAt'>) {
    dispatch({
      type: 'ADD_FOOD_ITEM',
      payload: { id: nanoid(), ...data, createdAt: new Date().toISOString() },
    });
  }

  function handleEditItem(item: FoodItem) {
    dispatch({ type: 'UPDATE_FOOD_ITEM', payload: item });
  }

  function handleDeleteItem(id: string) {
    setConfirmDelete({ type: 'item', id });
  }

  function confirmDeleteAction() {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'cat') {
      dispatch({ type: 'DELETE_CATEGORY', payload: { id: confirmDelete.id } });
    } else {
      dispatch({ type: 'DELETE_FOOD_ITEM', payload: { id: confirmDelete.id } });
    }
    setConfirmDelete(null);
  }

  // Group items by category, sorted: newest category first (state already sorted)
  const categoryItems = (catId: string) =>
    state.foodItems.filter(fi => fi.categoryId === catId);

  return (
    <div className="page-content px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Food Items</h1>
          <p className="text-sm text-white/50 mt-0.5">
            {state.foodItems.length} items · {state.categories.length} categories
          </p>
        </div>
        <Button3D
          variant="primary"
          onClick={() => setShowCatForm(true)}
          className="btn-icon"
          aria-label="Add category"
        >
          <Plus size={20} />
        </Button3D>
      </div>

      {/* Add category form */}
      {showCatForm && (
        <GlassCard className="p-4 mb-4 animate-fade-in-up">
          <p className="font-display font-semibold text-white mb-3">New Category</p>
          <div className="flex gap-2">
            <input
              id={`${uid}-newcat`}
              className="glass-input flex-1"
              placeholder="Category name…"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
              autoFocus
            />
            <Button3D variant="primary" onClick={handleAddCategory} className="btn-icon flex-shrink-0">
              <Check size={18} />
            </Button3D>
            <Button3D
              variant="secondary"
              onClick={() => { setShowCatForm(false); setNewCatName(''); setCatError(''); }}
              className="btn-icon flex-shrink-0"
            >
              <X size={18} />
            </Button3D>
          </div>
          {catError && <p className="text-red-400 text-xs mt-2">{catError}</p>}
        </GlassCard>
      )}

      {/* Category list */}
      <div className="flex flex-col gap-4">
        {state.categories.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-white/40 text-sm">No categories yet. Add one above!</p>
          </GlassCard>
        ) : (
          state.categories.map(cat => (
            <CategorySection
              key={cat.id}
              category={cat}
              items={categoryItems(cat.id)}
              allCategories={state.categories}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddItem={handleAddItem}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
            />
          ))
        )}
      </div>

      {/* Edit category modal */}
      {editingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <GlassCard className="w-full max-w-sm p-5 animate-fade-in-up">
            <h2 className="font-display font-bold text-white mb-4">Edit Category</h2>
            <input
              className="glass-input mb-4"
              value={editCatName}
              onChange={e => setEditCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveEditCategory()}
              autoFocus
            />
            <div className="flex gap-3">
              <Button3D variant="secondary" onClick={() => setEditingCat(null)} className="flex-1">
                Cancel
              </Button3D>
              <Button3D variant="primary" onClick={handleSaveEditCategory} className="flex-1">
                Save
              </Button3D>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <GlassCard className="w-full max-w-sm p-5 animate-fade-in-up">
            <h2 className="font-display font-bold text-white mb-2">Confirm Delete</h2>
            <p className="text-white/60 text-sm mb-5">
              {confirmDelete.type === 'cat'
                ? 'This will delete the category and ALL its food items. This cannot be undone.'
                : 'Delete this food item? This cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <Button3D variant="secondary" onClick={() => setConfirmDelete(null)} className="flex-1">
                Cancel
              </Button3D>
              <Button3D variant="danger" onClick={confirmDeleteAction} className="flex-1">
                Delete
              </Button3D>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
