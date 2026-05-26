// Language store - persists language preference to localStorage
import { writable } from 'svelte/store';
import type { Language } from '@/i18n/translations';

const STORAGE_KEY = 'chinaconnect_language';

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'zh') return stored;
  // Could also detect from browser preference
  return 'en';
}

function createLanguageStore() {
  const { subscribe, set, update } = writable<Language>('en');

  return {
    subscribe,
    set: (lang: Language) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, lang);
      }
      set(lang);
    },
    toggle: () => {
      update(current => {
        const next = current === 'en' ? 'zh' : 'en';
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, next);
        }
        return next;
      });
    },
    init: () => {
      if (typeof window !== 'undefined') {
        set(getInitialLanguage());
      }
    },
  };
}

export const currentLanguage = createLanguageStore();