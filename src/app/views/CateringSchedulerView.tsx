import { CateringScheduler } from "../components/CateringScheduler";
import { useCatering } from "../context";
import { Loader2 } from "lucide-react";

export function CateringSchedulerView() {
  const { events, foodTemplates, onAddEvent, onDeleteEvent, onUpdateEvent, isLoading } = useCatering();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <CateringScheduler
        events={events}
        foodTemplates={foodTemplates}
        onAddEvent={onAddEvent}
        onDeleteEvent={onDeleteEvent}
        onUpdateEvent={onUpdateEvent}
      />
    </div>
  );
}
