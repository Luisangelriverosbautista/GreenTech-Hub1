import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { LanguageContext, type AppLanguage } from './LanguageContext';

const LANGUAGE_STORAGE_KEY = 'appLanguage';

interface LanguageProviderProps {
  children: ReactNode;
}

const getInitialLanguage = (): AppLanguage => {
  const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return storedLanguage === 'en' ? 'en' : 'es';
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<AppLanguage>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
  };

  const toggleLanguage = () => {
    setLanguageState((currentLanguage) => (currentLanguage === 'es' ? 'en' : 'es'));
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage,
    t: (spanishText: string, englishText: string) => (language === 'es' ? spanishText : englishText),
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};