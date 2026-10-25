import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import type { FoodItemTemplate } from '../App';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface FoodItemsManagerProps {
  templates: FoodItemTemplate[];
  customCategories: string[];
  onAddCustomCategory: (category: string) => void;
  onUpdateCustomCategory: (oldCategory: string, newCategory: string) => void;
  onDeleteCustomCategory: (category: string) => void;
  onAddTemplate: (template: FoodItemTemplate) => void;
  onUpdateTemplate: (template: FoodItemTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export function FoodItemsManager({ templates, customCategories, onAddCustomCategory, onUpdateCustomCategory, onDeleteCustomCategory, onAddTemplate, onUpdateTemplate, onDeleteTemplate }: FoodItemsManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    defaultQuantity: 1,
    defaultPrice: 0,
    description: '',
  });

  const categories = [...new Set([...customCategories, ...templates.map(t => t.category)])];
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const groupedTemplates = categories.reduce((acc, cat) => {
    if (selectedCategory === 'all' || selectedCategory === cat) {
      acc[cat] = [];
    }
    return acc;
  }, {} as Record<string, FoodItemTemplate[]>);

  filteredTemplates.forEach(template => {
    if (groupedTemplates[template.category]) {
      groupedTemplates[template.category].push(template);
    }
  });

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.category.trim()) return;

    if (editingId) {
      onUpdateTemplate({
        id: editingId,
        ...formData,
        name: formData.name.trim(),
      });
      setEditingId(null);
    } else {
      onAddTemplate({
        id: crypto.randomUUID(),
        ...formData,
        name: formData.name.trim(),
      });
      setIsAdding(false);
    }

    setFormData({
      name: '',
      category: '',
      defaultQuantity: 1,
      defaultPrice: 0,
      description: '',
    });
  };

  const handleEdit = (template: FoodItemTemplate) => {
    setFormData({
      name: template.name,
      category: template.category,
      defaultQuantity: template.defaultQuantity,
      defaultPrice: template.defaultPrice || 0,
      description: template.description || '',
    });
    setEditingId(template.id);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: '',
      category: '',
      defaultQuantity: 1,
      defaultPrice: 0,
      description: '',
    });
  };

  const getCategoryCount = (category: string) => {
    return templates.filter(t => t.category === category).length;
  };

  const handleEditCategory = (category: string) => {
    setEditingCategory(category);
    setEditedCategoryName(category);
  };

  const handleSaveCategory = () => {
    if (editingCategory && editedCategoryName.trim()) {
      const newCategory = editedCategoryName.trim();
      const templatesToUpdate = templates.filter(t => t.category === editingCategory);
      
      onUpdateCustomCategory(editingCategory, newCategory);
      
      templatesToUpdate.forEach(template => {
        onUpdateTemplate({ ...template, category: newCategory });
      });
      
      setEditingCategory(null);
      setEditedCategoryName('');
      if (selectedCategory === editingCategory) setSelectedCategory(newCategory);
    }
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategory(null);
    setEditedCategoryName('');
  };

  const handleDeleteCategory = (category: string) => {
    setCategoryToDelete(category);
  };

  const handleConfirmDeleteCategory = () => {
    if (categoryToDelete) {
      const templatesToDelete = templates.filter(t => t.category === categoryToDelete);
      onDeleteCustomCategory(categoryToDelete);
      templatesToDelete.forEach(template => onDeleteTemplate(template.id));
      setCategoryToDelete(null);
      if (selectedCategory === categoryToDelete) setSelectedCategory('all');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header and Add Button */}
      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg">Food Items Library</CardTitle>
              <CardDescription className="text-sm">Manage your menu items and categories</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsAdding(true)} 
                className="flex-1 sm:flex-initial bg-orange-500 hover:bg-orange-600"
                disabled={isAdding || editingId !== null || isAddingCategory}
              >
                <Plus className="size-4 mr-2" />
                Add Item
              </Button>
              <Button 
                onClick={() => setIsAddingCategory(true)} 
                variant="outline"
                className="flex-1 sm:flex-initial border-orange-500 text-orange-600 hover:bg-orange-50"
                disabled={isAdding || editingId !== null || isAddingCategory}
              >
                <Plus className="size-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-white/10 bg-black/20">
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName" className="text-sm">Item Name</Label>
                  <Input
                    id="itemName"
                    placeholder="e.g., Chicken Tikka Masala"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm">Category</Label>
                  {categories.length > 0 ? (
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger id="category" className="text-sm sm:text-base">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="category"
                      placeholder="Enter category name"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="text-sm sm:text-base"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultQuantity" className="text-sm">Default Quantity</Label>
                  <Input
                    id="defaultQuantity"
                    type="number"
                    min="1"
                    value={formData.defaultQuantity}
                    onChange={(e) => setFormData({ ...formData, defaultQuantity: parseInt(e.target.value) || 1 })}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultPrice" className="text-sm">
                    Default Price (₹)
                    <span className="text-xs text-gray-500 ml-1">
                      {formData.defaultQuantity > 1 
                        ? `(for ${formData.defaultQuantity} items)` 
                        : '(per item)'}
                    </span>
                  </Label>
                  <Input
                    id="defaultPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.defaultPrice || ''}
                    onChange={(e) => setFormData({ ...formData, defaultPrice: parseFloat(e.target.value) || 0 })}
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add details about this item..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmit} 
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={!formData.name.trim() || !formData.category.trim()}
                >
                  <Save className="size-4 mr-2" />
                  {editingId ? 'Update' : 'Add'} Item
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="size-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}

        {/* Add Category Form */}
        {isAddingCategory && (
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-white/10 bg-black/20">
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="newCategory" className="text-sm">Category Name</Label>
                <Input
                  id="newCategory"
                  placeholder="e.g., Main Course, Appetizer, Dessert"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  className="text-sm sm:text-base"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    if (newCategoryInput.trim()) {
                      onAddCustomCategory(newCategoryInput.trim());
                      setNewCategoryInput('');
                      setIsAddingCategory(false);
                    }
                  }} 
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={!newCategoryInput.trim()}
                >
                  <Save className="size-4 mr-2" />
                  Add Category
                </Button>
                <Button 
                  onClick={() => {
                    setNewCategoryInput('');
                    setIsAddingCategory(false);
                  }} 
                  variant="outline"
                >
                  <X className="size-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <Button
          size="sm"
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
          className={selectedCategory === 'all' ? 'bg-orange-500 hover:bg-orange-600' : ''}
        >
          All ({templates.length})
        </Button>
        {categories.map((category) => {
          const count = templates.filter(t => t.category === category).length;
          return (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              {category} ({count})
            </Button>
          );
        })}
      </div>

      {/* Items List */}
      {Object.keys(groupedTemplates).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p className="text-sm sm:text-base">No food items yet. Add your first item to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {Object.entries(groupedTemplates)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, items]) => (
              <Card key={category}>
                <CardHeader className="px-4 sm:px-6 py-3 sm:py-4 bg-black/20">
                  {editingCategory === category ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedCategoryName}
                        onChange={(e) => setEditedCategoryName(e.target.value)}
                        className="text-sm sm:text-base"
                        placeholder="Category name"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        onClick={handleSaveCategory}
                        className="h-8 w-8 shrink-0 bg-orange-500 hover:bg-orange-600"
                      >
                        <Save className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleCancelCategoryEdit}
                        className="h-8 w-8 shrink-0"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base sm:text-lg text-orange-400">{category}</CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCategory(category)}
                          className="h-7 w-7 text-orange-400 hover:text-orange-300 hover:bg-white/10"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category)}
                          className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="px-4 sm:px-6 py-4">
                  {items.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">No items in this category.</p>
                  ) : (
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                      {items.map((template) => (
                        <Card 
                          key={template.id} 
                          className={`border-l-4 border-l-orange-500 ${editingId === template.id ? 'ring-2 ring-orange-500' : ''}`}
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-orange-200 mb-1 text-sm sm:text-base truncate">{template.name}</h4>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs">
                                    Qty: {template.defaultQuantity}
                                  </Badge>
                                  {template.defaultPrice && template.defaultPrice > 0 && (
                                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs">
                                      {template.defaultQuantity > 1 
                                        ? `₹${template.defaultPrice} (₹${(template.defaultPrice / template.defaultQuantity).toFixed(2)}/item)` 
                                        : `₹${template.defaultPrice}`}
                                    </Badge>
                                  )}
                                </div>
                                {template.description && (
                                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{template.description}</p>
                                )}
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(template)}
                                  className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                >
                                  <Edit2 className="size-3.5" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Item</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{template.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => onDeleteTemplate(template.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Delete Category Confirmation Dialog */}
      <AlertDialog open={categoryToDelete !== null} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category "{categoryToDelete}"? All items in this category will also be deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteCategory}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}