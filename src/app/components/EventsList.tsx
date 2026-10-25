import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trash2, UtensilsCrossed, User, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import type { CateringEvent } from '../App';
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

interface EventsListProps {
  events: CateringEvent[];
  onDelete: (eventId: string) => void;
  onUpdate: (event: CateringEvent) => void;
}

export function EventsList({ events, onDelete }: EventsListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500">
        <UtensilsCrossed className="size-10 sm:size-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm sm:text-base">No events scheduled for this date</p>
        <p className="text-xs sm:text-sm">Click "Add Event" to schedule catering</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {events.map((event) => (
        <Card key={event.id} className="border-l-4 border-l-orange-500">
          <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-orange-900 text-sm sm:text-base truncate">{event.eventName}</CardTitle>
                <div className="space-y-1 mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="size-3 shrink-0" />
                    <span className="truncate">{event.personName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-3 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                    <Trash2 className="size-3.5 sm:size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Event</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{event.eventName}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(event.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="space-y-2 sm:space-y-3">
              {event.foodItems.map((item) => {
                const itemTotal = (item.quantity || 0) * (item.rate || 0);
                
                return (
                  <div key={item.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-black/20 border border-white/5 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="text-orange-200 text-sm sm:text-base">{item.name}</span>
                        <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs">
                          Qty: {item.quantity}
                        </Badge>
                        {item.rate && item.rate > 0 && (
                          <>
                            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs">
                              ₹{item.rate}
                            </Badge>
                            <Badge variant="secondary" className="bg-orange-500/30 text-orange-200 border border-orange-500/40 text-xs font-bold">
                              Total: ₹{itemTotal.toFixed(2)}
                            </Badge>
                          </>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">{item.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Event Grand Total */}
            {event.foodItems.some(item => (item.rate || 0) > 0) && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex justify-between items-center px-2">
                  <span className="text-orange-200">Event Total:</span>
                  <span className="text-orange-200 font-bold">
                    ₹{event.foodItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.rate || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}