import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Plus, Trash2, Search } from 'lucide-react';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import type { CateringEvent, FoodItem, FoodItemTemplate } from '../App';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvent: (event: CateringEvent) => void;
  initialDate?: Date;
  foodTemplates: FoodItemTemplate[];
}

export function AddEventDialog({ open, onOpenChange, onAddEvent, initialDate, foodTemplates }: AddEventDialogProps) {
  const [eventName, setEventName] = useState('');
  const [personName, setPersonName] = useState('');
  const [time, setTime] = useState('12:00');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setEventName('');
      setPersonName('');
      setTime('12:00');
      setSelectedDate(initialDate);
      setFoodItems([{ id: crypto.randomUUID(), name: '', quantity: 1, rate: 0, notes: '' }]); // Reset to single empty item
      setShowTemplates(false);
      setSelectedCategory('all');
    }
  }, [open, initialDate]);

  const handleAddFoodItem = () => {
    setFoodItems([{ 
      id: crypto.randomUUID(), 
      name: '', 
      quantity: 1, 
      rate: 0, 
      notes: '' 
    }, ...foodItems]);
  };

  const handleRemoveFoodItem = (id: string) => {
    setFoodItems(foodItems.filter(item => item.id !== id));
  };

  const handleFoodItemChange = (id: string, field: keyof FoodItem, value: string | number) => {
    setFoodItems(foodItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = () => {
    if (!eventName.trim() || !personName.trim() || !selectedDate || !time) return;
    
    const validFoodItems = foodItems.filter(item => item.name.trim());
    if (validFoodItems.length === 0) return;

    const newEvent: CateringEvent = {
      id: crypto.randomUUID(),
      date: selectedDate,
      eventName: eventName.trim(),
      personName: personName.trim(),
      time: time,
      foodItems: validFoodItems,
    };

    onAddEvent(newEvent);
    
    // Reset form
    setEventName('');
    setPersonName('');
    setTime('12:00');
    setSelectedDate(initialDate);
    setFoodItems([]);
    setShowTemplates(false);
    onOpenChange(false);
  };

  const handleSelectTemplate = (template: FoodItemTemplate) => {
    const quantity = template.defaultQuantity || 1;
    const totalPrice = template.defaultPrice || 0;
    const ratePerUnit = totalPrice / quantity;
    
    setFoodItems([{ 
      id: crypto.randomUUID(), 
      name: template.name, 
      quantity: quantity, 
      rate: ratePerUnit, 
      notes: template.description || '' 
    }, ...foodItems]);
  };

  const categories = ['all', ...new Set(foodTemplates.map(template => template.category))];
  const filteredTemplates = foodTemplates.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  );

  const handleSelectAllTemplates = () => {
    const newItems = filteredTemplates.map(template => {
      const quantity = template.defaultQuantity || 1;
      const totalPrice = template.defaultPrice || 0;
      const ratePerUnit = totalPrice / quantity;
      
      return {
        id: crypto.randomUUID(), 
        name: template.name, 
        quantity: quantity, 
        rate: ratePerUnit, 
        notes: template.description || '' 
      };
    });
    
    setFoodItems(prev => [...newItems, ...prev]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Schedule Catering Event</DialogTitle>
          <DialogDescription className="text-sm">Add a new catering event with food items</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="eventName" className="text-sm">Event Name</Label>
            <Input
              id="eventName"
              placeholder="e.g., Corporate Lunch, Birthday Party"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="text-sm sm:text-base"
            />
          </div>

          {/* Person Name */}
          <div className="space-y-2">
            <Label htmlFor="personName" className="text-sm">Contact Person</Label>
            <Input
              id="personName"
              placeholder="e.g., John Smith"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="text-sm sm:text-base"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-sm sm:text-base">
                    <CalendarIcon className="mr-2 size-4" />
                    {selectedDate ? selectedDate.toLocaleDateString() : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Grand Total */}
          {foodItems.some(item => (item.rate || 0) > 0) && (
            <Card className="p-4 bg-orange-100/50 border-orange-300">
              <div className="flex justify-between items-center">
                <span className="text-orange-900">Grand Total:</span>
                <span className="text-orange-900">
                  ₹{foodItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.rate || 0), 0).toFixed(2)}
                </span>
              </div>
            </Card>
          )}

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            className="w-full bg-orange-500 hover:bg-orange-600 text-sm sm:text-base"
            disabled={!eventName.trim() || !personName.trim() || !selectedDate || !time || foodItems.every(item => !item.name.trim())}
          >
            Schedule Event
          </Button>

          {/* Food Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Food Items</Label>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowTemplates(!showTemplates)} 
                  size="sm" 
                  variant="outline"
                  className="text-orange-600 border-orange-600 hover:bg-orange-50 text-xs sm:text-sm"
                  type="button"
                >
                  <Search className="size-3 sm:size-4 mr-1 sm:mr-2" />
                  Browse Items
                </Button>
                <Button 
                  onClick={handleAddFoodItem} 
                  size="sm" 
                  variant="outline"
                  className="text-orange-600 border-orange-600 hover:bg-orange-50 text-xs sm:text-sm"
                  type="button"
                >
                  <Plus className="size-3 sm:size-4 mr-1 sm:mr-2" />
                  Add Custom
                </Button>
              </div>
            </div>

            {/* Template Browser */}
            {showTemplates && foodTemplates.length > 0 && (
              <Card className="p-3 sm:p-4 bg-orange-50/50 border-orange-200">
                <div className="space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2 flex-1 w-full">
                      <Label className="text-sm whitespace-nowrap">Category:</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-8 text-xs sm:text-sm w-full min-w-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat === 'all' ? 'All Categories' : cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSelectAllTemplates}
                      disabled={filteredTemplates.length === 0}
                      className="h-8 text-xs sm:text-sm whitespace-nowrap border-orange-200 hover:bg-orange-50 text-orange-700 w-full sm:w-auto"
                    >
                      Select All ({filteredTemplates.length})
                    </Button>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {filteredTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className="w-full text-left p-2 sm:p-3 bg-white hover:bg-orange-50 border border-orange-200 rounded-lg transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-sm font-medium text-orange-900 truncate">{template.name}</span>
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs shrink-0">
                                {template.category}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <Badge variant="outline" className="bg-white border-orange-300 text-orange-800 text-xs">
                                Qty: {template.defaultQuantity}
                              </Badge>
                              {template.defaultPrice && template.defaultPrice > 0 && (
                                <Badge variant="outline" className="bg-white border-orange-300 text-orange-800 text-xs">
                                  ₹{template.defaultPrice}
                                </Badge>
                              )}
                            </div>
                            {template.description && (
                              <p className="text-xs text-gray-600 line-clamp-1">{template.description}</p>
                            )}
                          </div>
                          <Plus className="size-4 text-orange-600 shrink-0" />
                        </div>
                      </button>
                    ))}
                    {filteredTemplates.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No items in this category</p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {foodItems.length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-sm">No food items added yet</p>
                <p className="text-xs mt-1">Browse items or add custom items to get started</p>
              </div>
            )}

            <div className="space-y-3">
              {foodItems.map((item, index) => {
                const itemTotal = (item.quantity || 0) * (item.rate || 0);
                
                return (
                  <Card key={item.id} className="p-3 sm:p-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          <Label htmlFor={`food-name-${item.id}`} className="text-sm">Item Name</Label>
                          <Input
                            id={`food-name-${item.id}`}
                            placeholder="e.g., Chicken Tikka Masala"
                            value={item.name}
                            onChange={(e) => handleFoodItemChange(item.id, 'name', e.target.value)}
                            className="text-sm sm:text-base"
                          />
                        </div>
                        <div className="w-16 sm:w-20 space-y-2">
                          <Label htmlFor={`quantity-${item.id}`} className="text-sm">Qty</Label>
                          <Input
                            id={`quantity-${item.id}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleFoodItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="text-sm sm:text-base"
                          />
                        </div>
                        <div className="w-20 sm:w-24 space-y-2">
                          <Label htmlFor={`rate-${item.id}`} className="text-sm">Rate (₹)</Label>
                          <Input
                            id={`rate-${item.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate || ''}
                            onChange={(e) => handleFoodItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="text-sm sm:text-base"
                          />
                        </div>
                        {foodItems.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFoodItem(item.id)}
                            className="mt-6 sm:mt-8 text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                          >
                            <Trash2 className="size-3.5 sm:size-4" />
                          </Button>
                        )}
                      </div>
                      {itemTotal > 0 && (
                        <div className="flex justify-end">
                          <div className="bg-orange-50 px-3 py-1 rounded-md border border-orange-200">
                            <span className="text-xs text-orange-700">Total: </span>
                            <span className="text-sm text-orange-900">₹{itemTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor={`notes-${item.id}`} className="text-sm">Notes (optional)</Label>
                        <Textarea
                          id={`notes-${item.id}`}
                          placeholder="Special instructions, dietary restrictions, etc."
                          value={item.notes}
                          onChange={(e) => handleFoodItemChange(item.id, 'notes', e.target.value)}
                          rows={2}
                          className="text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}