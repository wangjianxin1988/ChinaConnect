// Language Switcher Component
import type { Language } from '@/i18n/translations';
import './LanguageSwitcher.css';

interface Props {
  currentLang: Language;
  onToggle: () => void;
}

export function LanguageSwitcher({ currentLang, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      class="language-switcher"
      aria-label={`Switch to ${currentLang === 'en' ? 'Chinese' : 'English'}`}
      title={`Switch to ${currentLang === 'en' ? '中文' : 'English'}`}
    >
      <span class="lang-flag">{currentLang === 'en' ? 'EN' : '中'}</span>
      <span class="lang-label">{currentLang === 'en' ? '中文' : 'EN'}</span>
    </button>
  );
}