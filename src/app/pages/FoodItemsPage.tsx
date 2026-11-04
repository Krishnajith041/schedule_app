import { useState, useId } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Check, Lock } from 'lucide-react';
import { useAppContext } from '../state/AppContext';
import { useAuth } from '../state/AuthContext';
import { CategorySection } from '../components/CategorySection';
import { Button3D } from '../components/Button3D';
import { GlassCard } from '../components/GlassCard';
import { pushMenuToCloud } from '../lib/cloudSync';
import type { FoodCategory, FoodItem } from '../types';

function nanoid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function FoodItemsPage() {
  const { state, dispatch, cloudConfig, syncNow } = useAppContext();
  const { user } = useAuth();
  const uid = useId();

  const isAdmin = user?.role === 'admin';

  // New category form state
  const [showCatForm,   setShowCatForm]   = useState(false);
  const [newCatName,    setNewCatName]    = useState('');
  const [catError,      setCatError]      = useState('');

  // Edit category dialog
  const [editingCat,    setEditingCat]    = useState<FoodCategory | null>(null);
  const [editCatName,   setEditCatName]   = useState('');

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'cat' | 'item'; id: string } | null>(null);

  async function syncMenuToCloud(categories: FoodCategory[], foodItems: FoodItem[]) {
    if (cloudConfig.enabled && cloudConfig.firebaseUrl) {
      await pushMenuToCloud(categories, foodItems, cloudConfig, user?.username);
      syncNow();
    }
  }

  function handleAddCategory() {
    if (!isAdmin) return;
    const name = newCatName.trim();
    if (!name) { setCatError('Category name is required'); return; }

    const newCategory: FoodCategory = {
      id: nanoid(),
      name,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
    setNewCatName('');
    setShowCatForm(false);
    setCatError('');

    const updatedCategories = [newCategory, ...state.categories];
    syncMenuToCloud(updatedCategories, state.foodItems);
  }

  function handleEditCategory(cat: FoodCategory) {
    if (!isAdmin) return;
    setEditingCat(cat);
    setEditCatName(cat.name);
  }

  function handleSaveEditCategory() {
    if (!isAdmin || !editingCat) return;
    const name = editCatName.trim();
    if (!name) return;

    const updatedCat = { ...editingCat, name };
    dispatch({ type: 'UPDATE_CATEGORY', payload: updatedCat });
    setEditingCat(null);

    const updatedCategories = state.categories.map(c => c.id === updatedCat.id ? updatedCat : c);
    syncMenuToCloud(updatedCategories, state.foodItems);
  }

  function handleDeleteCategory(id: string) {
    if (!isAdmin) return;
    setConfirmDelete({ type: 'cat', id });
  }

  function handleAddItem(data: Omit<FoodItem, 'id' | 'createdAt'>) {
    if (!isAdmin) return;
    const newItem: FoodItem = {
      id: nanoid(),
      ...data,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_FOOD_ITEM', payload: newItem });
    const updatedItems = [newItem, ...state.foodItems];
    syncMenuToCloud(state.categories, updatedItems);
  }

  function handleEditItem(item: FoodItem) {
    if (!isAdmin) return;
    dispatch({ type: 'UPDATE_FOOD_ITEM', payload: item });
    const updatedItems = state.foodItems.map(fi => fi.id === item.id ? item : fi);
    syncMenuToCloud(state.categories, updatedItems);
  }

  function handleDeleteItem(id: string) {
    if (!isAdmin) return;
    setConfirmDelete({ type: 'item', id });
  }

  function confirmDeleteAction() {
    if (!isAdmin || !confirmDelete) return;

    if (confirmDelete.type === 'cat') {
      const catId = confirmDelete.id;
      dispatch({ type: 'DELETE_CATEGORY', payload: { id: catId } });
      const updatedCategories = state.categories.filter(c => c.id !== catId);
      const updatedItems = state.foodItems.filter(fi => fi.categoryId !== catId);
      syncMenuToCloud(updatedCategories, updatedItems);
    } else {
      const itemId = confirmDelete.id;
      dispatch({ type: 'DELETE_FOOD_ITEM', payload: { id: itemId } });
      const updatedItems = state.foodItems.filter(fi => fi.id !== itemId);
      syncMenuToCloud(state.categories, updatedItems);
    }
    setConfirmDelete(null);
  }

  // Group items by category, sorted: newest category first (state already sorted)
  const categoryItems = (catId: string) =>
    state.foodItems.filter(fi => fi.categoryId === catId);

  return (
    <div className="page-content px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-white">Food Menu</h1>
            {!isAdmin && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/50 border border-white/10 flex items-center gap-1">
                <Lock size={10} /> Read Only
              </span>
            )}
          </div>
          <p className="text-sm text-white/50 mt-0.5">
            {state.foodItems.length} items · {state.categories.length} categories
          </p>
        </div>

        {/* Add category button: only for Admin */}
        {isAdmin && (
          <Button3D
            variant="primary"
            onClick={() => setShowCatForm(true)}
            className="btn-icon"
            aria-label="Add category"
            title="Add new category"
          >
            <Plus size={20} />
          </Button3D>
        )}
      </div>

      {/* Add category form (Admin only) */}
      {isAdmin && showCatForm && (
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
            <p className="text-white/40 text-sm">No categories yet.</p>
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
              readOnly={!isAdmin}
            />
          ))
        )}
      </div>

      {/* Edit category modal (Admin only) */}
      {isAdmin && editingCat && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          role="dialog"
          aria-modal="true"
        >
          <GlassCard className="w-full max-w-sm p-5 animate-fade-in-up border border-white/15 shadow-2xl">
            <h2 className="font-display font-bold text-white mb-4">Edit Category</h2>
            <input
              className="glass-input mb-4"
              value={editCatName}
              onChange={e => setEditCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveEditCategory()}
              autoFocus
            />
            <div className="flex gap-3">
              <Button3D variant="secondary" onClick={() => setEditingCat(null)} className="flex-1 justify-center">
                Cancel
              </Button3D>
              <Button3D variant="primary" onClick={handleSaveEditCategory} className="flex-1 justify-center">
                Save
              </Button3D>
            </div>
          </GlassCard>
        </div>,
        document.body
      )}

      {/* Confirm delete modal (Admin only) */}
      {isAdmin && confirmDelete && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          role="dialog"
          aria-modal="true"
        >
          <GlassCard className="w-full max-w-sm p-5 animate-fade-in-up border border-white/15 shadow-2xl">
            <h2 className="font-display font-bold text-white mb-2">Confirm Delete</h2>
            <p className="text-white/60 text-sm mb-5 leading-relaxed">
              {confirmDelete.type === 'cat'
                ? 'This will delete the category and ALL its food items. This cannot be undone.'
                : 'Delete this food item? This cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <Button3D variant="secondary" onClick={() => setConfirmDelete(null)} className="flex-1 justify-center">
                Cancel
              </Button3D>
              <Button3D variant="danger" onClick={confirmDeleteAction} className="flex-1 justify-center">
                Delete
              </Button3D>
            </div>
          </GlassCard>
        </div>,
        document.body
      )}
    </div>
  );
}
