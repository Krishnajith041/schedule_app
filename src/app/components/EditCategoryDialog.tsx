import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Save, X, Trash2 } from 'lucide-react';
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

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onSave: (oldName: string, newName: string) => void;
  onDelete: (categoryName: string) => void;
  itemCount: number;
}

export function EditCategoryDialog({ open, onOpenChange, currentName, onSave, onDelete, itemCount }: EditCategoryDialogProps) {
  const [newName, setNewName] = useState(currentName);

  useEffect(() => {
    setNewName(currentName);
  }, [currentName]);

  const handleSubmit = () => {
    if (!newName.trim() || newName.trim() === currentName) {
      onOpenChange(false);
      return;
    }
    onSave(currentName, newName.trim());
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete(currentName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Edit Category Name</DialogTitle>
          <DialogDescription className="text-sm">
            All items in "{currentName}" will be updated with the new category name
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <Label htmlFor="categoryName" className="text-sm">Category Name</Label>
            <Input
              id="categoryName"
              placeholder="Enter category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="text-sm sm:text-base"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit} 
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              disabled={!newName.trim() || newName.trim() === currentName}
            >
              <Save className="size-4 mr-2" />
              Save Changes
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="shrink-0">
                  <Trash2 className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Category</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the category "{currentName}"? 
                    {itemCount > 0 && ` This will also delete ${itemCount} item${itemCount > 1 ? 's' : ''} in this category.`}
                    {itemCount === 0 && ' This category has no items.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Category
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={() => onOpenChange(false)} variant="outline" size="icon" className="shrink-0">
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}