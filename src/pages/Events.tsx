import React from 'react';
import { EventList } from '../components/EventList';
import { supabase } from '../lib/supabase';
import type { Event } from '../types/event';

export function Events() {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchEvents() {
      try {
        // Get current date at start of day in ET
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
          .from('events')
          .select('*')
          .gte('datetime', now.toISOString())
          .order('datetime', { ascending: true });

        if (error) throw error;

        setEvents(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading events...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No upcoming events</h2>
          <p className="text-gray-500">Check back later for new events!</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Upcoming Events</h1>
      <EventList events={events} />
    </main>
  );
}
