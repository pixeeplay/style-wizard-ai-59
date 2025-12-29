import { useCallback, useEffect, useMemo, useState } from 'react';
import { SEASONAL_THEME_STORAGE_KEY, SeasonalThemeKey } from '@/lib/seasonal-themes';

const AUTO_THEME_KEY = 'smartstyle.autoTheme';

function applyThemeClass(theme: SeasonalThemeKey) {
  const root = document.documentElement;

  // Remove existing theme-* classes
  root.classList.forEach((c) => {
    if (c.startsWith('theme-')) root.classList.remove(c);
  });

  if (theme !== 'default') root.classList.add(`theme-${theme}`);
}

/**
 * Returns the recommended theme based on current date
 */
export function getAutoTheme(): SeasonalThemeKey {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();

  // Christmas: Dec 1 - Dec 31
  if (month === 11) return 'noel';

  // Halloween: Oct 15 - Oct 31
  if (month === 9 && day >= 15) return 'halloween';

  // Valentine: Feb 1 - Feb 14
  if (month === 1 && day <= 14) return 'valentine';

  // Summer: Jun 21 - Aug 31
  if ((month === 5 && day >= 21) || month === 6 || month === 7) return 'summer';

  // Back to school: Sep 1 - Sep 30
  if (month === 8) return 'backtoschool';

  return 'default';
}

export function useSeasonalTheme() {
  const [autoTheme, setAutoThemeState] = useState<boolean>(() => {
    const stored = localStorage.getItem(AUTO_THEME_KEY);
    return stored === 'true';
  });

  const [manualTheme, setManualTheme] = useState<SeasonalThemeKey>(() => {
    const stored = localStorage.getItem(SEASONAL_THEME_STORAGE_KEY) as SeasonalThemeKey | null;
    return stored || 'default';
  });

  // The effective theme: auto-calculated or manual
  const suggestedTheme = useMemo(() => getAutoTheme(), []);
  const theme: SeasonalThemeKey = autoTheme ? suggestedTheme : manualTheme;

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(AUTO_THEME_KEY, String(autoTheme));
  }, [autoTheme]);

  useEffect(() => {
    localStorage.setItem(SEASONAL_THEME_STORAGE_KEY, manualTheme);
  }, [manualTheme]);

  const setTheme = useCallback((next: SeasonalThemeKey) => {
    setManualTheme(next);
    // When user manually sets a theme, disable auto
    setAutoThemeState(false);
  }, []);

  const setAutoTheme = useCallback((enabled: boolean) => {
    setAutoThemeState(enabled);
  }, []);

  return useMemo(
    () => ({ theme, manualTheme, autoTheme, suggestedTheme, setTheme, setAutoTheme }),
    [theme, manualTheme, autoTheme, suggestedTheme, setTheme, setAutoTheme]
  );
}
