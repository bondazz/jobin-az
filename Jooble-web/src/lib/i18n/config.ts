export const i18nConfig = {
  defaultLocale: 'az' as const,
  locales: ['az', 'en', 'ru'] as const,
  localeNames: {
    az: 'Azərbaycan',
    en: 'English',
    ru: 'Русский',
  },
};

export type Locale = (typeof i18nConfig)['locales'][number];

export const isValidLocale = (locale: string): locale is Locale => {
  return i18nConfig.locales.includes(locale as Locale);
};

// Only en and ru have prefixes, az is default with no prefix
export const getLocalePrefix = (locale: Locale): string => {
  return locale === i18nConfig.defaultLocale ? '' : `/${locale}`;
};

// Get locale from pathname
export const getLocaleFromPathname = (pathname: string): Locale => {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  // Check if first segment is a known non-default locale
  if (firstSegment === 'en' || firstSegment === 'ru') {
    return firstSegment;
  }
  
  return i18nConfig.defaultLocale;
};

// Remove locale prefix from pathname
export const removeLocaleFromPathname = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment === 'en' || firstSegment === 'ru') {
    segments.shift();
    return '/' + segments.join('/') || '/';
  }
  
  return pathname;
};

// Add locale prefix to pathname
export const addLocaleToPathname = (pathname: string, locale: Locale): string => {
  const cleanPath = removeLocaleFromPathname(pathname);
  const prefix = getLocalePrefix(locale);
  
  if (!prefix) {
    return cleanPath;
  }
  
  return prefix + (cleanPath === '/' ? '' : cleanPath);
};

// Get alternate language URLs for SEO hreflang tags
export const getAlternateLanguages = (pathname: string): { locale: Locale; url: string }[] => {
  const cleanPath = removeLocaleFromPathname(pathname);
  
  return i18nConfig.locales.map((locale) => ({
    locale,
    url: `https://jooble.az${addLocaleToPathname(cleanPath, locale)}`,
  }));
};
