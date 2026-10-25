import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Edit2, Trash2, Plus, Save, X } from 'lucide-react';
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

interface ManageCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  getCategoryCount: (category: string) => number;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (categoryName: string) => void;
  onAdd: (categoryName: string) => void;
}

export function ManageCategoriesDialog({ 
  open, 
  onOpenChange, 
  categories, 
  getCategoryCount,
  onRename, 
  onDelete,
  onAdd 
}: ManageCategoriesDialogProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleStartEdit = (category: string) => {
    setEditingCategory(category);
    setEditValue(category);
    setIsAdding(false);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue.trim() !== editingCategory && editingCategory) {
      onRename(editingCategory, editValue.trim());
    }
    setEditingCategory(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditValue('');
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingCategory(null);
    setNewCategoryName('');
  };

  const handleSaveAdd = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      onAdd(newCategoryName.trim());
      setIsAdding(false);
      setNewCategoryName('');
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewCategoryName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Manage Categories</DialogTitle>
          <DialogDescription className="text-sm">
            Edit, delete, or add new categories for your food items
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3">
          {/* Add New Category */}
          {isAdding ? (
            <Card className="p-3 sm:p-4 bg-orange-50/50 border-orange-300">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="New category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 text-sm sm:text-base"
                  autoFocus
                />
                <Button
                  size="icon"
                  onClick={handleSaveAdd}
                  disabled={!newCategoryName.trim() || categories.includes(newCategoryName.trim())}
                  className="bg-orange-500 hover:bg-orange-600 shrink-0"
                >
                  <Save className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCancelAdd}
                  className="shrink-0"
                >
                  <X className="size-4" />
                </Button>
              </div>
              {newCategoryName.trim() && categories.includes(newCategoryName.trim()) && (
                <p className="text-xs text-red-600 mt-2">This category already exists</p>
              )}
            </Card>
          ) : (
            <Button 
              onClick={handleStartAdd} 
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={editingCategory !== null}
            >
              <Plus className="size-4 mr-2" />
              Add New Category
            </Button>
          )}

          {/* Categories List */}
          <div className="space-y-2 max-h-96 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => {
              const count = getCategoryCount(category);
              const isEditing = editingCategory === category;

              return (
                <Card key={category} className={`p-3 sm:p-4 ${isEditing ? 'ring-2 ring-orange-500' : ''}`}>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 text-sm sm:text-base"
                        autoFocus
                      />
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 shrink-0">
                        {count} items
                      </Badge>
                      <Button
                        size="icon"
                        onClick={handleSaveEdit}
                        disabled={!editValue.trim() || editValue.trim() === category}
                        className="bg-orange-500 hover:bg-orange-600 shrink-0 h-8 w-8"
                      >
                        <Save className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="shrink-0 h-8 w-8"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm sm:text-base truncate">{category}</span>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs shrink-0">
                          {count} items
                        </Badge>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleStartEdit(category)}
                          disabled={editingCategory !== null || isAdding}
                          className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              disabled={editingCategory !== null || isAdding}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the category "{category}"?
                                {count > 0 && ` All ${count} item${count > 1 ? 's' : ''} in this category will be moved to "Uncategorized".`}
                                {count === 0 && ' This category has no items.'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(category)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Category
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}