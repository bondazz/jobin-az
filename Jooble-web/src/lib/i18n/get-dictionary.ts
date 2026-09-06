import { Locale, i18nConfig } from './config';

// Dictionary types
export interface Dictionary {
  dates: {
    today: string;
    yesterday: string;
    daysAgo: string;
    weeksAgo: string;
    monthsAgo: string;
  };
  common: {
    home: string;
    vacancies: string;
    categories: string;
    regions: string;
    companies: string;
    favorites: string;
    savedJobs: string;
    subscribe: string;
    blog: string;
    prices: string;
    referral: string;
    addJob: string;
    about: string;
    services: string;
    notifications: string;
    navigation: string;
    mainSections: string;
    settings: string;
    language: string;
    theme: string;
    menu: string;
    search: string;
    all: string;
    viewAll: string;
    readMore: string;
    apply: string;
    save: string;
    saved: string;
    share: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    loading: string;
    noResults: string;
    error: string;
    retry: string;
    daily: string;
    monthly: string;
    searchJobs: string;
    city: string;
    searchCategories: string;
    searchRegions: string;
    searchCompanies: string;
    noJobsFound: string;
    noJobsDescription: string;
    clearFilters: string;
    searchArticles: string;
    discussion: string;
    email: string;
    website: string;
    address: string;
    noAddress: string;
    telegramChannel: string;
    footerText: string;
    noArticlesFound: string;
    noArticlesDescription: string;
    loadMore: string;
    min: string;
    salaryNotSpecified: string;
    expired: string;
  };
  header: {
    postJob: string;
    logoAlt: string;
  };
  footer: {
    allRightsReserved: string;
    sitemap: string;
    privacy: string;
  };
  jobs: {
    title: string;
    newJobs: string;
    popularJobs: string;
    jobDetails: string;
    location: string;
    salary: string;
    type: string;
    fullTime: string;
    partTime: string;
    remote: string;
    applyNow: string;
    applyVia: string;
    jobDescription: string;
    requirements: string;
    responsibilities: string;
    postedAt: string;
    expiresAt: string;
    views: string;
    similarJobs: string;
  };
  categories: {
    title: string;
    allCategories: string;
    popularCategories: string;
    jobsCount: string;
  };
  regions: {
    title: string;
    allRegions: string;
    jobsByRegion: string;
  };
  companies: {
    title: string;
    allCompanies: string;
    companyProfile: string;
    openPositions: string;
    aboutCompany: string;
    contactInfo: string;
    verified: string;
    jobListings: string;
  };
  favorites: {
    title: string;
    savedJobs: string;
    noSavedJobs: string;
    startSaving: string;
  };
  subscribe: {
    title: string;
    subtitle: string;
    selectCategories: string;
    emailPlaceholder: string;
    subscribeButton: string;
    successMessage: string;
  };
  blog: {
    title: string;
    latestPosts: string;
    readingTime: string;
    relatedPosts: string;
    tableOfContents: string;
  };
  services: {
    title: string;
    pricing: string;
    choosePlan: string;
    features: string;
    popular: string;
    perMonth: string;
    contactUs: string;
  };
  referral: {
    title: string;
    earnMoney: string;
    yourCode: string;
    copyLink: string;
    totalEarnings: string;
    clicks: string;
    confirmations: string;
  };
  about: {
    title: string;
    mission: string;
    ourStory: string;
    contactUs: string;
  };
  addJob: {
    title: string;
    companyName: string;
    jobTitle: string;
    description: string;
    submit: string;
  };
  seo: {
    homeTitle: string;
    homeDescription: string;
    vacanciesTitle: string;
    vacanciesDescription: string;
    categoriesTitle: string;
    categoriesDescription: string;
    regionsTitle: string;
    regionsDescription: string;
    companiesTitle: string;
    companiesDescription: string;
  };
}

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  az: () => import('@/dictionaries/az.json').then((module) => module.default),
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  ru: () => import('@/dictionaries/ru.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  const dictionaryLoader = dictionaries[locale] || dictionaries[i18nConfig.defaultLocale];
  return dictionaryLoader();
};

// For client-side usage - synchronous version with cached dictionaries
let cachedDictionaries: Record<Locale, Dictionary | null> = {
  az: null,
  en: null,
  ru: null,
};

export const preloadDictionary = async (locale: Locale): Promise<Dictionary> => {
  if (cachedDictionaries[locale]) {
    return cachedDictionaries[locale]!;
  }
  
  const dictionary = await getDictionary(locale);
  cachedDictionaries[locale] = dictionary;
  return dictionary;
};

export const getCachedDictionary = (locale: Locale): Dictionary | null => {
  return cachedDictionaries[locale];
};
