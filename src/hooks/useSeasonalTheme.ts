import { useCallback, useEffect, useMemo, useState } from 'react';
import { SEASONAL_THEME_STORAGE_KEY, SeasonalThemeKey } from '@/lib/seasonal-themes';

function applyThemeClass(theme: SeasonalThemeKey) {
  const root = document.documentElement;

  // Remove existing theme-* classes
  root.classList.forEach((c) => {
    if (c.startsWith('theme-')) root.classList.remove(c);
  });

  if (theme !== 'default') root.classList.add(`theme-${theme}`);
}

export function useSeasonalTheme() {
  const [theme, setTheme] = useState<SeasonalThemeKey>(() => {
    const stored = localStorage.getItem(SEASONAL_THEME_STORAGE_KEY) as SeasonalThemeKey | null;
    return stored || 'default';
  });

  useEffect(() => {
    applyThemeClass(theme);
    localStorage.setItem(SEASONAL_THEME_STORAGE_KEY, theme);
  }, [theme]);

  const set = useCallback((next: SeasonalThemeKey) => setTheme(next), []);

  return useMemo(() => ({ theme, setTheme: set }), [theme, set]);
}
