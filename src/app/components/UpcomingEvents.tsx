import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Clock, User, UtensilsCrossed } from 'lucide-react';
import type { CateringEvent } from '../App';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface UpcomingEventsProps {
  events: CateringEvent[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const [selectedDateRange, setSelectedDateRange] = useState('next7Days');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const oneMonthFromNow = new Date(today);
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today && eventDate <= oneMonthFromNow;
    })
    .sort((a, b) => {
      const dateCompare = a.date.getTime() - b.date.getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

  const filteredEvents = upcomingEvents.filter(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    if (selectedDateRange === 'today') {
      return eventDate.toDateString() === today.toDateString();
    } else if (selectedDateRange === 'tomorrow') {
      return eventDate.toDateString() === new Date(today.getTime() + 86400000).toDateString();
    } else if (selectedDateRange === 'next7Days') {
      const oneWeekFromNow = new Date(today);
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      return eventDate <= oneWeekFromNow;
    }
    return true; // 'next30Days' shows all upcoming events within the next month
  });

  const getTitle = () => {
    switch (selectedDateRange) {
      case 'today': return 'Upcoming Events (Today)';
      case 'tomorrow': return 'Upcoming Events (Tomorrow)';
      case 'next7Days': return 'Upcoming Events (Next 7 Days)';
      case 'next30Days': return 'Upcoming Events (Next 30 Days)';
      default: return 'Upcoming Events';
    }
  };

  const getEmptyMessage = () => {
    switch (selectedDateRange) {
      case 'today': return 'No events scheduled for today';
      case 'tomorrow': return 'No events scheduled for tomorrow';
      case 'next7Days': return 'No events scheduled for the next week';
      case 'next30Days': return 'No events scheduled for the next month';
      default: return 'No upcoming events';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
        <CardTitle className="text-base sm:text-lg">{getTitle()}</CardTitle>
        <CardDescription className="text-sm">
          {filteredEvents.length === 0 
            ? getEmptyMessage()
            : `${filteredEvents.length} event${filteredEvents.length > 1 ? 's' : ''} coming up`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="mb-4">
          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="next30Days">Next 30 Days</SelectItem>
              <SelectItem value="next7Days">Next 7 Days</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {filteredEvents.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <UtensilsCrossed className="size-10 sm:size-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm sm:text-base">{getEmptyMessage()}</p>
          </div>
        ) : (
          <div className="max-h-[240px] overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => {
                const eventDate = new Date(event.date);
                const isToday = eventDate.toDateString() === today.toDateString();
                const isTomorrow = eventDate.toDateString() === new Date(today.getTime() + 86400000).toDateString();
                
                let dateLabel = eventDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                });
                
                if (isToday) dateLabel = 'Today';
                if (isTomorrow) dateLabel = 'Tomorrow';

                return (
                  <Card key={event.id} className="border-l-4 border-l-orange-500 bg-gradient-to-br from-white to-orange-50/30">
                    <CardContent className="p-3 sm:p-4">
                      <div className="space-y-2">
                        <div>
                          <h3 className="text-orange-900 mb-1 text-sm font-medium truncate">{event.eventName}</h3>
                          <div className="flex flex-wrap gap-1">
                            {isToday && (
                              <Badge className="bg-orange-500 text-white text-xs">Today</Badge>
                            )}
                            {isTomorrow && (
                              <Badge className="bg-orange-400 text-white text-xs">Tomorrow</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-xs text-orange-700">
                          <div className="flex items-center gap-1.5">
                            <User className="size-3 shrink-0" />
                            <span className="truncate">{event.personName}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-3 shrink-0" />
                            <span>{dateLabel}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3 shrink-0" />
                            <span>{event.time}</span>
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-orange-200">
                          <p className="text-xs text-orange-600 mb-1">
                            {event.foodItems.length} item{event.foodItems.length > 1 ? 's' : ''}:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {event.foodItems.slice(0, 2).map((item) => (
                              <Badge key={item.id} variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                                {item.name} (×{item.quantity})
                              </Badge>
                            ))}
                            {event.foodItems.length > 2 && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                                +{event.foodItems.length - 2} more
                              </Badge>
                            )}
                          </div>
                          {event.foodItems.some(item => (item.rate || 0) > 0) && (
                            <div className="mt-2 pt-1.5 border-t border-orange-200">
                              <p className="text-xs text-orange-900">
                                Total: ₹{event.foodItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.rate || 0), 0).toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}