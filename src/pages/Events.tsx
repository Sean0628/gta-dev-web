import React from 'react';
import { EventList } from '../components/EventList';
import { EventListSkeleton } from '../components/Skeleton';
import { supabase } from '../lib/supabase';
import { getCached, isFresh, setCache } from '../lib/cache';
import type { Event } from '../types/event';

export function Events() {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const CACHE_KEY = 'events';

    // Show cached data immediately if available (filter out past events)
    const cached = getCached<Event[]>(CACHE_KEY);
    if (cached) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      setEvents(cached.filter(e => new Date(e.datetime) >= now));
      setLoading(false);
    }

    // Skip fetch if cache is still fresh
    if (isFresh(CACHE_KEY)) return;

    async function fetchEvents() {
      try {
        // Get current date at start of day in ET
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            meetups (
              logo
            )
          `)
          .gte('datetime', now.toISOString())
          .order('datetime', { ascending: true });

        if (error) throw error;

        // Transform the data to include meetup logo as fallback
        const eventsWithLogos = (data || []).map(event => ({
          ...event,
          logo: event.logo || event.meetups?.logo,
          meetups: undefined // Remove the meetups object as we don't need it anymore
        }));

        setCache(CACHE_KEY, eventsWithLogos);
        setEvents(eventsWithLogos);
      } catch (err) {
        if (!cached) {
          setError(err instanceof Error ? err.message : 'Failed to fetch events');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" role="status" aria-label="Loading events">
        <div className="h-8 w-80 animate-pulse bg-gray-200 dark:bg-gray-700 rounded mb-8" />
        <EventListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No upcoming events</h2>
          <p className="text-gray-600 dark:text-gray-300">Check back later for new tech events in Toronto!</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Upcoming Tech Events in Toronto</h1>
      <EventList events={events} />
    </main>
  );
}
