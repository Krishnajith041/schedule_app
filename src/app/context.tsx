import { createContext, useContext, useState, useEffect } from "react";

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  rate?: number;
  notes?: string;
}

export interface FoodItemTemplate {
  id: string;
  name: string;
  category: string;
  defaultQuantity: number;
  defaultPrice?: number;
  description?: string;
}

export interface CateringEvent {
  id: string;
  date: Date;
  eventName: string;
  personName: string;
  time: string;
  foodItems: FoodItem[];
}

interface CateringContextType {
  events: CateringEvent[];
  customCategories: string[];
  foodTemplates: FoodItemTemplate[];
  isLoading: boolean;
  onAddEvent: (event: CateringEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onUpdateEvent: (event: CateringEvent) => void;
  onAddCustomCategory: (category: string) => void;
  onUpdateCustomCategory: (oldCat: string, newCat: string) => void;
  onDeleteCustomCategory: (category: string) => void;
  onAddTemplate: (template: FoodItemTemplate) => void;
  onUpdateTemplate: (template: FoodItemTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
}

const CateringContext = createContext<CateringContextType | undefined>(undefined);

export function useCatering() {
  const context = useContext(CateringContext);
  if (!context) {
    throw new Error("useCatering must be used within a CateringProvider");
  }
  return context;
}

const STORAGE_KEY = 'catering_app_data';

export function CateringProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<CateringEvent[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [foodTemplates, setFoodTemplates] = useState<FoodItemTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          
          // Strict three-month data retention policy
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

          const loadedEvents = (parsed.events || [])
            .map((e: any) => ({ ...e, date: new Date(e.date) }))
            .filter((e: CateringEvent) => e.date >= threeMonthsAgo);

          setEvents(loadedEvents);
          setCustomCategories(parsed.customCategories || []);
          setFoodTemplates(parsed.foodTemplates || []);
        }
      } catch (error) {
        console.error("Failed to parse local data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoading) return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        events,
        customCategories,
        foodTemplates
      }));
    } catch (error) {
      console.error("Failed to save to local storage", error);
    }
  }, [events, customCategories, foodTemplates, isLoading]);

  const onAddEvent = (event: CateringEvent) => setEvents(prev => [...prev, event]);
  const onDeleteEvent = (eventId: string) => setEvents(prev => prev.filter(e => e.id !== eventId));
  const onUpdateEvent = (updatedEvent: CateringEvent) => setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));

  const onAddTemplate = (template: FoodItemTemplate) => setFoodTemplates(prev => [template, ...prev]);
  const onUpdateTemplate = (updatedTemplate: FoodItemTemplate) => setFoodTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
  const onDeleteTemplate = (templateId: string) => setFoodTemplates(prev => prev.filter(t => t.id !== templateId));

  const onAddCustomCategory = (category: string) => setCustomCategories(prev => [category, ...prev]);
  const onUpdateCustomCategory = (oldCategory: string, newCategory: string) => setCustomCategories(prev => prev.map(c => c === oldCategory ? newCategory : c));
  const onDeleteCustomCategory = (category: string) => setCustomCategories(prev => prev.filter(c => c !== category));

  return (
    <CateringContext.Provider value={{
      events, customCategories, foodTemplates, isLoading,
      onAddEvent, onDeleteEvent, onUpdateEvent,
      onAddCustomCategory, onUpdateCustomCategory, onDeleteCustomCategory,
      onAddTemplate, onUpdateTemplate, onDeleteTemplate
    }}>
      {children}
    </CateringContext.Provider>
  );
}
