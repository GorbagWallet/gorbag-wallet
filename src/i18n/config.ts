import { en } from "./locales/en"
import { da } from "./locales/da"  // Danish
import { fr } from "./locales/fr"  // French
import { es } from "./locales/es"  // Spanish (or another daughter's language)
import { de } from "./locales/de"  // German
import { ja } from "./locales/ja"  // Japanese
import { ko } from "./locales/ko"  // Korean
import { ptBR } from "./locales/pt-BR"  // Portuguese (Brazil)
import { ru } from "./locales/ru"  // Russian
import { th } from "./locales/th"  // Thai
import { vi } from "./locales/vi"  // Vietnamese
import { zhCN } from "./locales/zh-CN"  // Chinese (Simplified)

// Supported languages
export const SUPPORTED_LOCALES = ["en", "da", "fr", "es", "de", "ja", "ko", "pt-BR", "ru", "th", "vi", "zh-CN"] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

// Default language
export const DEFAULT_LOCALE: Locale = "en";

// All translations
export const translations = {
  en,
  da,
  fr,
  es,
  de,
  ja,
  ko,
  "pt-BR": ptBR,
  ru,
  th,
  vi,
  "zh-CN": zhCN
};

// Initialize i18n
export const i18n = {
  locale: DEFAULT_LOCALE,
  translations,
  
  setLocale(locale: Locale) {
    if (SUPPORTED_LOCALES.includes(locale)) {
      this.locale = locale;
      localStorage.setItem("gorbag_locale", locale);
    }
  },
  
  getLocale(): Locale {
    const stored = localStorage.getItem("gorbag_locale");
    return (stored as Locale) || DEFAULT_LOCALE;
  },
  
  t(key: string): string {
    const keys = key.split('.');
    let translation: any = this.translations[this.locale];
    
    for (const k of keys) {
      if (translation && typeof translation === 'object') {
        translation = translation[k];
      } else {
        return key; // Return the key if translation is not found
      }
    }
    
    return typeof translation === 'string' ? translation : key;
  }
};

// Initialize with stored locale
i18n.locale = i18n.getLocale();