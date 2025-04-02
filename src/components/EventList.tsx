import React from 'react';
import { CalendarDays, MapPin, ExternalLink, Users } from 'lucide-react';
import type { Event } from '../types/event';

interface EventListProps {
  events: Event[];
}

export function EventList({ events }: EventListProps) {
  // Function to format date in ET
  const formatDateET = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
      timeZoneName: 'short'
    });
  };

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <a
          key={`${event.meetup_id}-${event.title}-${event.datetime}`}
          href={event.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-all duration-200 hover:no-underline hover:transform hover:translate-y-[-2px]"
        >
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 relative">
                {event.logo ? (
                  <div className="h-full">
                    <img
                      src={event.logo}
                      alt={`${event.title} cover`}
                      className="w-full h-full object-cover"
                      style={{ aspectRatio: '16/9' }}
                    />
                  </div>
                ) : (
                  <div className="h-full bg-gray-100 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
                    <Users className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="p-6 md:w-2/3">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 flex-grow pr-2">
                    {event.title}
                  </h3>
                  <ExternalLink className="text-gray-400 flex-shrink-0" size={20} />
                </div>

                <div className="flex flex-col space-y-2 text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={18} />
                    <time dateTime={event.datetime}>
                      {formatDateET(event.datetime)}
                    </time>
                  </div>
                  {event.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin size={18} />
                      <span>{event.venue}</span>
                    </div>
                  )}
                </div>

                {event.description && (
                  <p className="text-gray-600 line-clamp-3">{event.description}</p>
                )}
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
