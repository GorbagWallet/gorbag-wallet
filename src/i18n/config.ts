import { en } from "./locales/en"
import { da } from "./locales/da"  // Danish
import { fr } from "./locales/fr"  // French
import { es } from "./locales/es"  // Spanish (or another daughter's language)

// Supported languages
export const SUPPORTED_LOCALES = ["en", "da", "fr", "es"] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

// Default language
export const DEFAULT_LOCALE: Locale = "en";

// All translations
export const translations = {
  en,
  da,
  fr,
  es
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