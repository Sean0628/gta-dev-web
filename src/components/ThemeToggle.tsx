import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import type { Theme } from '../lib/theme';
import { applyTheme } from '../lib/theme';

interface ThemeToggleProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export function ThemeToggle({ theme, setTheme }: ThemeToggleProps) {
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        onClick={() => handleThemeChange('light')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'light'
            ? 'bg-white dark:bg-gray-700 text-yellow-500 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
        }`}
        aria-label="Light mode"
      >
        <Sun size={18} />
      </button>
      <button
        onClick={() => handleThemeChange('dark')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'dark'
            ? 'bg-white dark:bg-gray-700 text-blue-500 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
        }`}
        aria-label="Dark mode"
      >
        <Moon size={18} />
      </button>
      <button
        onClick={() => handleThemeChange('system')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'system'
            ? 'bg-white dark:bg-gray-700 text-purple-500 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
        }`}
        aria-label="System theme"
      >
        <Monitor size={18} />
      </button>
    </div>
  );
}
