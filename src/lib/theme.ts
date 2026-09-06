import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export const LIGHT_LOGO = '/es2link/a-minimalist-abstract-vector-logo-icon-for-a-techn.png';
export const DARK_LOGO = '/es2link/a-minimalist-abstract-vector-logo-icon-for-a-techn.png';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('es2link-theme') as Theme | null;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('es2link-theme', theme);
  }, [theme]);

  return {
    theme,
    toggle: () =>
      setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
  };
}
