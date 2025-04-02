import React from 'react';
import { Users, Github, CalendarDays, Menu } from 'lucide-react';
import { MeetupGrid } from './components/MeetupGrid';
import { Events } from './pages/Events';
import type { MeetupGroup } from './types/meetup';
import { supabase } from './lib/supabase';

function App() {
  const [view, setView] = React.useState<'meetups' | 'events'>('meetups');
  const [groupedMeetups, setGroupedMeetups] = React.useState<MeetupGroup[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  React.useEffect(() => {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="text-blue-600" size={32} />
                <h1 className="text-2xl font-bold text-gray-900">
                  GTA Tech Meetups
                </h1>
              </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden"
              >
                <Menu size={24} className="text-gray-600" />
              </button>
            </div>

            <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 ${isMenuOpen ? 'block' : 'hidden sm:flex'}`}>
              <nav className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  onClick={() => {
                    setView('meetups');
                    setIsMenuOpen(false);
                  }}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    view === 'meetups'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Users size={20} className="inline-block mr-2" />
                  Meetups
                </button>
                <button
                  onClick={() => {
                    setView('events');
                    setIsMenuOpen(false);
                  }}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    view === 'events'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <CalendarDays size={20} className="inline-block mr-2" />
                  Events
                </button>
              </nav>
              <a
                href="https://github.com/Sean0628/gta-dev-web/issues"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors w-full sm:w-auto justify-center"
              >
                <Github size={20} />
                <span>Open Issue</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {view === 'meetups' ? (
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
      ) : (
        <Events />
      )}

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
