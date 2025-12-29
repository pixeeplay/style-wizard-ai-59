import { useCallback, useEffect, useMemo, useState } from 'react';
import { translations } from '@/lib/translations';
import { translationsFr } from '@/lib/translations-fr';

export type Language = 'en' | 'fr';

const LANGUAGE_KEY = 'smartstyle.language';

function getStoredLanguage(): Language {
  const stored = localStorage.getItem(LANGUAGE_KEY) as Language | null;
  if (stored === 'en' || stored === 'fr') return stored;
  // Default to browser language or 'en'
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'fr' ? 'fr' : 'en';
}

export function useTranslation() {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useMemo(() => (language === 'fr' ? translationsFr : translations), [language]);

  return { t, language, setLanguage };
}
