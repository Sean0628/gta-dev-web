import React, { useEffect, useState } from 'react';
import { Users, Github } from 'lucide-react';
import { MeetupGrid } from './components/MeetupGrid';
import type { MeetupGroup } from './types/meetup';
import { supabase } from './lib/supabase';

function App() {
  const [groupedMeetups, setGroupedMeetups] = useState<MeetupGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMeetups() {
      try {
        const { data, error } = await supabase
          .from('meetups')
          .select('*')
          .order('name');

        if (error) throw error;

        const grouped = data.reduce<MeetupGroup[]>((acc, meetup) => {
          const group = acc.find((g) => g.type === meetup.type);
          if (group) {
            group.items.push(meetup);
          } else {
            acc.push({ type: meetup.type, items: [meetup] });
          }
          return acc;
        }, []);

        setGroupedMeetups(grouped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch meetups');
      } finally {
        setLoading(false);
      }
    }

    fetchMeetups();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={32} />
              <h1 className="text-3xl font-bold text-gray-900">
                GTA Tech Meetups
              </h1>
            </div>
            <a
              href="https://github.com/Sean0628/gta-dev-web/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              <Github size={20} />
              <span>Open Issue</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Loading meetups...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : (
          <div className="space-y-12">
            {groupedMeetups.map((group) => (
              <MeetupGrid key={group.type} group={group} />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} GTA Tech Meetups. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
