import { UpcomingEvents } from "../components/UpcomingEvents";
import { useCatering } from "../context";
import { Loader2 } from "lucide-react";

export function UpcomingEventsView() {
  const { events, isLoading } = useCatering();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <UpcomingEvents events={events} />
    </div>
  );
}
