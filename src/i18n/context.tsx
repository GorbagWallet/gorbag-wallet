import React, { createContext, useContext, useState, ReactNode } from "react";
import { i18n, Locale, DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./config";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  availableLocales: Locale[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(i18n.getLocale());

  const setLocale = (newLocale: Locale) => {
    if (SUPPORTED_LOCALES.includes(newLocale)) {
      i18n.setLocale(newLocale);
      setLocaleState(newLocale);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = i18n.t(key);
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
      });
    }
    
    return translation;
  };

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
    availableLocales: SUPPORTED_LOCALES
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}