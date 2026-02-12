import React from 'react';
import { Users, Github, CalendarDays, Menu } from 'lucide-react';
import { MeetupGrid } from './components/MeetupGrid';
import { Events } from './pages/Events';
import { ThemeToggle } from './components/ThemeToggle';
import type { MeetupGroup } from './types/meetup';
import type { Theme } from './lib/theme';
import { supabase } from './lib/supabase';
import { getInitialTheme, applyTheme } from './lib/theme';
import { getCached, isFresh, setCache } from './lib/cache';

function App() {
  const [view, setView] = React.useState<'meetups' | 'events'>('meetups');
  const [groupedMeetups, setGroupedMeetups] = React.useState<MeetupGroup[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<Theme>(getInitialTheme);

  // Initialize theme
  React.useEffect(() => {
    // Apply initial theme
    applyTheme(theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  React.useEffect(() => {
    const CACHE_KEY = 'meetups';

    function groupMeetups(data: any[]): MeetupGroup[] {
      return data.reduce<MeetupGroup[]>((acc, meetup) => {
        const group = acc.find((g) => g.type === meetup.type);
        if (group) {
          group.items.push(meetup);
        } else {
          acc.push({ type: meetup.type, items: [meetup] });
        }
        return acc;
      }, []);
    }

    // Show cached data immediately if available
    const cached = getCached<any[]>(CACHE_KEY);
    if (cached) {
      setGroupedMeetups(groupMeetups(cached));
      setLoading(false);
    }

    // Skip fetch if cache is still fresh
    if (isFresh(CACHE_KEY)) return;

    async function fetchMeetups() {
      try {
        const { data, error } = await supabase
          .from('meetups')
          .select('*')
          .order('name');

        if (error) throw error;

        setCache(CACHE_KEY, data);
        setGroupedMeetups(groupMeetups(data));
      } catch (err) {
        if (!cached) {
          setError(err instanceof Error ? err.message : 'Failed to fetch meetups');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchMeetups();
  }, []);

  // Update document title based on view
  React.useEffect(() => {
    document.title = view === 'meetups'
      ? 'Toronto Tech Meetups & Groups | GTA Tech Community'
      : 'Upcoming Tech Events in Toronto | GTA Tech Community';
  }, [view]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="text-blue-600 dark:text-blue-400" size={32} aria-hidden="true" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  GTA Tech Meetups
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle theme={theme} setTheme={setTheme} />
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="sm:hidden"
                  aria-label="Toggle menu"
                  aria-expanded={isMenuOpen}
                >
                  <Menu size={24} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>

            <div
              className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 ${isMenuOpen ? 'block' : 'hidden sm:flex'}`}
              role="navigation"
              aria-label="Main navigation"
            >
              <nav className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  onClick={() => {
                    setView('meetups');
                    setIsMenuOpen(false);
                  }}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    view === 'meetups'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-current={view === 'meetups' ? 'page' : undefined}
                >
                  <Users size={20} className="inline-block mr-2" aria-hidden="true" />
                  Tech Meetups
                </button>
                <button
                  onClick={() => {
                    setView('events');
                    setIsMenuOpen(false);
                  }}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    view === 'events'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-current={view === 'events' ? 'page' : undefined}
                >
                  <CalendarDays size={20} className="inline-block mr-2" aria-hidden="true" />
                  Tech Events
                </button>
              </nav>
              <a
                href="https://github.com/Sean0628/gta-dev-web/issues"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-md transition-colors w-full sm:w-auto justify-center"
                aria-label="Open GitHub issue"
              >
                <Github size={20} aria-hidden="true" />
                <span>Open Issue</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {view === 'meetups' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="sr-only">Toronto Tech Meetups and Communities</h2>
          {loading ? (
            <div className="flex items-center justify-center h-64" role="status">
              <div className="text-gray-600 dark:text-gray-300">Loading meetups...</div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300" role="alert">
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

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} GTA Tech Meetups. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
