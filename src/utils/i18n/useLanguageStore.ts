'use client';

import { create } from 'zustand';
import en from './en.json';
import es from './es.json';

export type Lang = 'en' | 'es';

type TranslationStrings = typeof en | typeof es;

const translations: Record<Lang, TranslationStrings> = { en, es };

interface LanguageStore {
  language: Lang;
  strings: TranslationStrings;
  setLanguage: (lang: Lang) => void;
}

const useLanguageStore = create<LanguageStore>((set) => ({
  language: 'en',
  strings: en,

  setLanguage: (lang) =>
  set({
    language: lang,
    strings: translations[lang] || en, // fallback to English
  }),
}));

export default useLanguageStore;
