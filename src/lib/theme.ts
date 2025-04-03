export type Theme = 'light' | 'dark' | 'system';

// Get the initial theme from localStorage or default to 'system'
export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  
  const savedTheme = localStorage.getItem('theme') as Theme;
  if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
    return savedTheme;
  }

  return 'system';
}

// Apply theme to document
export function applyTheme(theme: Theme) {
  const isDark = theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('theme', theme);
}
