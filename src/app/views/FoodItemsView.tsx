import { FoodItemsManager } from "../components/FoodItemsManager";
import { useCatering } from "../context";
import { Loader2 } from "lucide-react";

export function FoodItemsView() {
  const { 
    foodTemplates, 
    customCategories, 
    onAddCustomCategory, 
    onUpdateCustomCategory, 
    onDeleteCustomCategory, 
    onAddTemplate, 
    onUpdateTemplate, 
    onDeleteTemplate,
    isLoading 
  } = useCatering();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <FoodItemsManager
        templates={foodTemplates}
        customCategories={customCategories}
        onAddCustomCategory={onAddCustomCategory}
        onUpdateCustomCategory={onUpdateCustomCategory}
        onDeleteCustomCategory={onDeleteCustomCategory}
        onAddTemplate={onAddTemplate}
        onUpdateTemplate={onUpdateTemplate}
        onDeleteTemplate={onDeleteTemplate}
      />
    </div>
  );
}
