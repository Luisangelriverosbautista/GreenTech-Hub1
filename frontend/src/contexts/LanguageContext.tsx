import { createContext } from 'react';

export type AppLanguage = 'es' | 'en';

export interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
  t: (spanishText: string, englishText: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);