import React from 'react';
import { MapPin, Calendar, ExternalLink } from 'lucide-react';
import type { Event } from '../types/event';

interface EventListProps {
  events: Event[];
}

export function EventList({ events }: EventListProps) {
  // Function to format date in ET timezone
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      timeZone: 'America/Toronto',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/4 aspect-video md:aspect-square relative bg-gray-100 dark:bg-gray-700">
              {event.logo ? (
                <img
                  src={event.logo}
                  alt={`${event.title} logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Calendar className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-gray-400 dark:text-gray-500" />
              )}
            </div>
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {event.title}
                  </h3>
                  <div className="space-y-2 text-gray-600 dark:text-gray-300">
                    <p className="flex items-center gap-2">
                      <Calendar size={18} />
                      {formatDate(event.datetime)}
                    </p>
                    {event.venue && (
                      <p className="flex items-center gap-2">
                        <MapPin size={18} />
                        {event.venue}
                      </p>
                    )}
                  </div>
                  {event.description && (
                    <p className="mt-4 text-gray-600 dark:text-gray-300 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
                {event.link && (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <ExternalLink size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
