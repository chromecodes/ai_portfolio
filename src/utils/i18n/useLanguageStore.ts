'use client';

import { create } from 'zustand';
import en from './en.json';
import es from './es.json';

export type Lang = 'en' | 'es' ;

const translations = { en, es,};

interface LanguageStore {
  language: Lang;
  strings: typeof en;
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
