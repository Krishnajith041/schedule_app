import { useState } from 'react';
import { Calendar } from './ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { AddEventDialog } from './AddEventDialog';
import { EventsList } from './EventsList';
import type { CateringEvent, FoodItemTemplate } from '../App';

interface CateringSchedulerProps {
  events: CateringEvent[];
  foodTemplates: FoodItemTemplate[];
  onAddEvent: (event: CateringEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onUpdateEvent: (event: CateringEvent) => void;
}

export function CateringScheduler({ 
  events,
  foodTemplates,
  onAddEvent, 
  onDeleteEvent,
  onUpdateEvent 
}: CateringSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const eventsOnSelectedDate = selectedDate 
    ? events.filter(e => 
        e.date.toDateString() === selectedDate.toDateString()
      )
    : [];

  const getDatesWithEvents = () => {
    return events.map(e => e.date);
  };

  const handleAddClick = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Add Event Button Above Upcoming Events */}
      <div className="flex justify-end">
        <Button onClick={handleAddClick} size="sm" className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
          <Plus className="size-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Events Section */}
        <Card>
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base sm:text-lg truncate">
                  {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Select a date'}
                </CardTitle>
                <CardDescription className="text-sm">
                  {eventsOnSelectedDate.length === 0 
                    ? 'No events scheduled'
                    : `${eventsOnSelectedDate.length} event${eventsOnSelectedDate.length > 1 ? 's' : ''} scheduled`
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <EventsList
              events={eventsOnSelectedDate}
              onDelete={onDeleteEvent}
              onUpdate={onUpdateEvent}
            />
          </CardContent>
        </Card>

        {/* Calendar Section */}
        <Card>
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-base sm:text-lg">Select Date</CardTitle>
            <CardDescription className="text-sm">Choose a date to schedule or view catering events</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center px-2 sm:px-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasEvent: getDatesWithEvents(),
              }}
              modifiersClassNames={{
                hasEvent: 'bg-orange-500/20 font-bold text-orange-400',
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Add Event Dialog */}
      <AddEventDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddEvent={onAddEvent}
        initialDate={selectedDate}
        foodTemplates={foodTemplates}
      />
    </div>
  );
}