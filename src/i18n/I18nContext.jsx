import React, { useEffect, useMemo, useState } from 'react';
import { supportedLanguages, translations } from './translations';
import { I18nContext } from './context';

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}

function interpolate(template, params = {}) {
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    template
  );
}

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return supportedLanguages.includes(saved) ? saved : 'he';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
  }, [language]);

  const value = useMemo(() => {
    const t = (key, params) => {
      const text =
        getNestedValue(translations[language], key) ?? getNestedValue(translations.en, key) ?? key;
      return typeof text === 'string' ? interpolate(text, params) : key;
    };

    return {
      language,
      setLanguage,
      supportedLanguages,
      isRTL: language === 'he',
      t
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
