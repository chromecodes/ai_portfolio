'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import en from './en.json';
import es from './es.json';
import ar from './ar.json';

export type Lang = 'en' | 'es' | 'ar';

type TranslationStrings = typeof en | typeof es | typeof ar;

const translations: Record<Lang, TranslationStrings> = { en, es, ar };

const updateDocumentDir = (lang: Lang) => {
  if (typeof document !== 'undefined') {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }
};

interface LanguageStore {
  language: Lang;
  strings: TranslationStrings;
  setLanguage: (lang: Lang) => void;
}

const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'en',
      strings: en,

      setLanguage: (lang: Lang) => {
        updateDocumentDir(lang);
        set({
          language: lang,
          strings: translations[lang] || en,
        });
      },
    }),
    {
      name: 'portfolio_language',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const lang = state.language || 'en';
          updateDocumentDir(lang);
          state.strings = translations[lang] || en;
        }
      },
    }
  )
);

export default useLanguageStore;
