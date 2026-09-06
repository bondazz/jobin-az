'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Locale, i18nConfig, getLocaleFromPathname, addLocaleToPathname, removeLocaleFromPathname } from '@/lib/i18n/config';
import { Dictionary, preloadDictionary, getCachedDictionary } from '@/lib/i18n/get-dictionary';

interface I18nContextType {
  locale: Locale;
  dictionary: Dictionary | null;
  isLoading: boolean;
  changeLocale: (newLocale: Locale) => void;
  t: (key: string) => string;
  getLocalizedPath: (path: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Default dictionary for SSR - Azerbaijani (full)
const azDictionary: Dictionary = {
  dates: {
    today: "Bu gün",
    yesterday: "Dünən",
    daysAgo: "{n} gün əvvəl",
    weeksAgo: "{n} həftə əvvəl",
    monthsAgo: "{n} ay əvvəl"
  },
  common: {
    home: "Ana Səhifə",
    vacancies: "Vakansiyalar",
    categories: "Kateqoriyalar",
    regions: "Regionlar",
    companies: "Şirkətlər",
    favorites: "Seçilmiş elanlar",
    savedJobs: "Saxlanılan İşlər",
    subscribe: "Abunə ol",
    blog: "Bloq",
    prices: "Qiymətlər",
    referral: "Referral",
    addJob: "Elan yerləşdir",
    about: "Haqqında",
    services: "Xidmətlər",
    notifications: "İş Bildirişləri",
    navigation: "Naviqasiya",
    mainSections: "Əsas Bölümlər",
    settings: "Tənzimləmələr",
    language: "Dil",
    theme: "Mövzu",
    menu: "Menyu",
    search: "Axtarış",
    all: "Hamısı",
    viewAll: "Hamısına bax",
    readMore: "Ətraflı",
    apply: "Müraciət et",
    save: "Saxla",
    saved: "Saxlanıldı",
    share: "Paylaş",
    close: "Bağla",
    back: "Geri",
    next: "Növbəti",
    previous: "Əvvəlki",
    loading: "Yüklənir...",
    noResults: "Nəticə tapılmadı",
    error: "Xəta baş verdi",
    retry: "Yenidən cəhd et",
    daily: "Günlük",
    monthly: "Aylıq",
    searchJobs: "İş axtarın",
    city: "Şəhər",
    searchCategories: "Kateqoriyalar axtarın",
    searchRegions: "Region axtarın",
    searchCompanies: "Şirkətlər axtarın",
    noJobsFound: "Heç bir iş tapılmadı",
    noJobsDescription: "Axtarış kriteriyalarınızı dəyişdirin və ya fərqli kateqoriyaları araşdırın",
    clearFilters: "Süzgəcləri təmizlə",
    searchArticles: "Məqalə axtarın",
    discussion: "Müzakirə",
    email: "E-mail",
    website: "Veb Sayt",
    address: "Ünvan",
    noAddress: "Ünvan yoxdur",
    telegramChannel: "Vakansiyalar barədə məlumatı ən tez bizim Telegram kanalında izləyə bilərsiniz.",
    footerText: "© 2024-2026 Jooble.az. İş elanları və vakansiyalar",
    noArticlesFound: "Məqalə tapılmadı",
    noArticlesDescription: "Axtarış kriteriyalarınıza uyğun məqalə yoxdur.",
    loadMore: "Daha çox yüklə",
    min: "dəq",
    salaryNotSpecified: "Maaş göstərilməyib",
    expired: "Müddəti bitib"
  },
  header: { postJob: "Elan yerləşdir", logoAlt: "Jooble" },
  footer: { allRightsReserved: "Bütün hüquqlar qorunur", sitemap: "Sayt xəritəsi", privacy: "Məxfilik" },
  jobs: {
    title: "İş Elanları",
    newJobs: "Yeni Vakansiyalar",
    popularJobs: "Populyar Vakansiyalar",
    jobDetails: "Vakansiya Haqqında",
    location: "Yer",
    salary: "Maaş",
    type: "Növ",
    fullTime: "Tam iş günü",
    partTime: "Yarım iş günü",
    remote: "Uzaqdan iş",
    applyNow: "İndi müraciət et",
    applyVia: "Müraciət forması",
    jobDescription: "İş təsviri",
    requirements: "Tələblər",
    responsibilities: "Vəzifələr",
    postedAt: "Yerləşdirilmə tarixi",
    expiresAt: "Bitmə tarixi",
    views: "Baxış sayı",
    similarJobs: "Oxşar Vakansiyalar"
  },
  categories: {
    title: "Kateqoriyalar",
    allCategories: "Bütün Kateqoriyalar",
    popularCategories: "Populyar Kateqoriyalar",
    jobsCount: "iş elanı"
  },
  regions: {
    title: "Regionlar",
    allRegions: "Bütün Regionlar",
    jobsByRegion: "Regionlara görə işlər"
  },
  companies: {
    title: "Şirkətlər",
    allCompanies: "Bütün Şirkətlər",
    companyProfile: "Şirkət Profili",
    openPositions: "Açıq Vakansiyalar",
    aboutCompany: "Şirkət Haqqında",
    contactInfo: "Əlaqə Məlumatları",
    verified: "Təsdiqlənmiş",
    jobListings: "İş Elanları"
  },
  favorites: {
    title: "Seçilmiş Elanlar",
    savedJobs: "Yadda Saxlanmış Vakansiyalar",
    noSavedJobs: "Saxlanılmış iş elanı yoxdur",
    startSaving: "İş elanlarını ürək ikonuna klikləyərək saxlayın"
  },
  subscribe: {
    title: "Abunə ol",
    subtitle: "Yeni vakansiyalardan xəbərdar olun",
    selectCategories: "Kateqoriyalar seçin",
    emailPlaceholder: "Email ünvanınız",
    subscribeButton: "Abunə ol",
    successMessage: "Uğurla abunə oldunuz!"
  },
  blog: {
    title: "Bloq",
    latestPosts: "Son Məqalələr",
    readingTime: "dəq oxu",
    relatedPosts: "Oxşar Məqalələr",
    tableOfContents: "Mündəricat"
  },
  services: {
    title: "Xidmətlər",
    pricing: "Qiymətlər",
    choosePlan: "Plan seçin",
    features: "Xüsusiyyətlər",
    popular: "Populyar",
    perMonth: "aylıq",
    contactUs: "Bizimlə əlaqə"
  },
  referral: {
    title: "Referral Proqramı",
    earnMoney: "Qazanc əldə edin",
    yourCode: "Sizin kodunuz",
    copyLink: "Linki kopyala",
    totalEarnings: "Ümumi qazanc",
    clicks: "Kliklər",
    confirmations: "Təsdiqlər"
  },
  about: {
    title: "Haqqımızda",
    mission: "Missiyamız",
    ourStory: "Hekayəmiz",
    contactUs: "Bizimlə əlaqə"
  },
  addJob: {
    title: "İş Elanı Yerləşdir",
    companyName: "Şirkət adı",
    jobTitle: "Vakansiya adı",
    description: "Təsvir",
    submit: "Göndər"
  },
  seo: {
    homeTitle: "Jooble - İş elanları və vakansiyalar",
    homeDescription: "Azərbaycanda ən son iş elanları və vakansiyalar. Yeni iş imkanları tapın.",
    vacanciesTitle: "Vakansiyalar | Jooble.az",
    vacanciesDescription: "Bütün aktiv iş elanları və vakansiyalar",
    categoriesTitle: "Kateqoriyalar | Jooble.az",
    categoriesDescription: "Kateqoriyalara görə iş elanları",
    regionsTitle: "Regionlar | Jooble.az",
    regionsDescription: "Regionlara görə iş elanları",
    companiesTitle: "Şirkətlər | Jooble.az",
    companiesDescription: "Şirkət profilləri və vakansiyaları"
  }
};

// English dictionary (full)
const enDictionary: Dictionary = {
  dates: { today: "Today", yesterday: "Yesterday", daysAgo: "{n} days ago", weeksAgo: "{n} weeks ago", monthsAgo: "{n} months ago" },
  common: {
    home: "Home", vacancies: "Vacancies", categories: "Categories", regions: "Regions", companies: "Companies",
    favorites: "Saved Jobs", savedJobs: "Saved Jobs", subscribe: "Subscribe", blog: "Blog", prices: "Pricing",
    referral: "Referral", addJob: "Post a Job", about: "About", services: "Services", notifications: "Job Alerts",
    navigation: "Navigation", mainSections: "Main Sections", settings: "Settings", language: "Language", theme: "Theme",
    menu: "Menu", search: "Search", all: "All", viewAll: "View All", readMore: "Read More", apply: "Apply",
    save: "Save", saved: "Saved", share: "Share", close: "Close", back: "Back", next: "Next", previous: "Previous",
    loading: "Loading...", noResults: "No results found", error: "An error occurred", retry: "Retry",
    daily: "Daily", monthly: "Monthly", searchJobs: "Search jobs", city: "City", searchCategories: "Search categories",
    searchRegions: "Search regions", searchCompanies: "Search companies", noJobsFound: "No jobs found",
    noJobsDescription: "Change your search criteria or explore different categories", clearFilters: "Clear filters",
    searchArticles: "Search articles", discussion: "Discussion", email: "Email", website: "Website", address: "Address",
    noAddress: "No address",
    telegramChannel: "Follow our Telegram channel for the latest job updates.",
    footerText: "© 2024-2026 Jooble.az. Job listings and vacancies",
    noArticlesFound: "No articles found", noArticlesDescription: "No articles match your search criteria.",
    loadMore: "Load more", min: "min", salaryNotSpecified: "Salary not specified", expired: "Expired"
  },
  header: { postJob: "Post a Job", logoAlt: "Jooble" },
  footer: { allRightsReserved: "All rights reserved", sitemap: "Sitemap", privacy: "Privacy" },
  jobs: {
    title: "Job Listings", newJobs: "New Vacancies", popularJobs: "Popular Jobs", jobDetails: "Job Details",
    location: "Location", salary: "Salary", type: "Type", fullTime: "Full-time", partTime: "Part-time",
    remote: "Remote", applyNow: "Apply Now", applyVia: "Apply via", jobDescription: "Job Description",
    requirements: "Requirements", responsibilities: "Responsibilities", postedAt: "Posted on", expiresAt: "Expires on",
    views: "Views", similarJobs: "Similar Jobs"
  },
  categories: { title: "Categories", allCategories: "All Categories", popularCategories: "Popular Categories", jobsCount: "jobs" },
  regions: { title: "Regions", allRegions: "All Regions", jobsByRegion: "Jobs by Region" },
  companies: {
    title: "Companies", allCompanies: "All Companies", companyProfile: "Company Profile", openPositions: "Open Positions",
    aboutCompany: "About Company", contactInfo: "Contact Information", verified: "Verified", jobListings: "Job Listings"
  },
  favorites: { title: "Saved Jobs", savedJobs: "Saved Vacancies", noSavedJobs: "No saved jobs", startSaving: "Click the heart icon to save jobs" },
  subscribe: { title: "Subscribe", subtitle: "Get notified about new jobs", selectCategories: "Select categories", emailPlaceholder: "Your email address", subscribeButton: "Subscribe", successMessage: "Successfully subscribed!" },
  blog: { title: "Blog", latestPosts: "Latest Posts", readingTime: "min read", relatedPosts: "Related Posts", tableOfContents: "Table of Contents" },
  services: { title: "Services", pricing: "Pricing", choosePlan: "Choose a Plan", features: "Features", popular: "Popular", perMonth: "per month", contactUs: "Contact Us" },
  referral: { title: "Referral Program", earnMoney: "Earn Money", yourCode: "Your code", copyLink: "Copy link", totalEarnings: "Total earnings", clicks: "Clicks", confirmations: "Confirmations" },
  about: { title: "About Us", mission: "Our Mission", ourStory: "Our Story", contactUs: "Contact Us" },
  addJob: { title: "Post a Job", companyName: "Company name", jobTitle: "Job title", description: "Description", submit: "Submit" },
  seo: { homeTitle: "Jooble - Job Listings and Vacancies in Azerbaijan", homeDescription: "Find the latest job listings and vacancies in Azerbaijan.", vacanciesTitle: "Vacancies | Jooble.az", vacanciesDescription: "All active job listings and vacancies", categoriesTitle: "Categories | Jooble.az", categoriesDescription: "Job listings by category", regionsTitle: "Regions | Jooble.az", regionsDescription: "Job listings by region", companiesTitle: "Companies | Jooble.az", companiesDescription: "Company profiles and vacancies" }
};

// Russian dictionary (full)
const ruDictionary: Dictionary = {
  dates: { today: "Сегодня", yesterday: "Вчера", daysAgo: "{n} дней назад", weeksAgo: "{n} недель назад", monthsAgo: "{n} месяцев назад" },
  common: {
    home: "Главная", vacancies: "Вакансии", categories: "Категории", regions: "Регионы", companies: "Компании",
    favorites: "Избранное", savedJobs: "Сохранённые", subscribe: "Подписаться", blog: "Блог", prices: "Цены",
    referral: "Реферал", addJob: "Разместить", about: "О нас", services: "Услуги", notifications: "Уведомления",
    navigation: "Навигация", mainSections: "Основные разделы", settings: "Настройки", language: "Язык", theme: "Тема",
    menu: "Меню", search: "Поиск", all: "Все", viewAll: "Смотреть все", readMore: "Подробнее", apply: "Откликнуться",
    save: "Сохранить", saved: "Сохранено", share: "Поделиться", close: "Закрыть", back: "Назад", next: "Далее", previous: "Назад",
    loading: "Загрузка...", noResults: "Ничего не найдено", error: "Произошла ошибка", retry: "Повторить",
    daily: "За день", monthly: "За месяц", searchJobs: "Поиск вакансий", city: "Город", searchCategories: "Поиск категорий",
    searchRegions: "Поиск регионов", searchCompanies: "Поиск компаний", noJobsFound: "Вакансии не найдены",
    noJobsDescription: "Измените критерии поиска или изучите другие категории", clearFilters: "Сбросить фильтры",
    searchArticles: "Поиск статей", discussion: "Обсуждение", email: "Эл. почта", website: "Веб-сайт", address: "Адрес",
    noAddress: "Адрес не указан",
    telegramChannel: "Следите за последними вакансиями в нашем Telegram канале.",
    footerText: "© 2024-2026 Jooble.az. Вакансии и объявления о работе",
    noArticlesFound: "Статьи не найдены", noArticlesDescription: "Нет статей, соответствующих вашему запросу.",
    loadMore: "Загрузить ещё", min: "мин", salaryNotSpecified: "Зарплата не указана", expired: "Истёк"
  },
  header: { postJob: "Разместить вакансию", logoAlt: "Jooble" },
  footer: { allRightsReserved: "Все права защищены", sitemap: "Карта сайта", privacy: "Конфиденциальность" },
  jobs: {
    title: "Вакансии", newJobs: "Новые вакансии", popularJobs: "Популярные вакансии", jobDetails: "О вакансии",
    location: "Место", salary: "Зарплата", type: "Тип", fullTime: "Полный день", partTime: "Частичная занятость",
    remote: "Удалённая работа", applyNow: "Откликнуться", applyVia: "Способ отклика", jobDescription: "Описание",
    requirements: "Требования", responsibilities: "Обязанности", postedAt: "Дата публикации", expiresAt: "Срок действия",
    views: "Просмотры", similarJobs: "Похожие вакансии"
  },
  categories: { title: "Категории", allCategories: "Все категории", popularCategories: "Популярные категории", jobsCount: "вакансий" },
  regions: { title: "Регионы", allRegions: "Все регионы", jobsByRegion: "Вакансии по регионам" },
  companies: {
    title: "Компании", allCompanies: "Все компании", companyProfile: "Профиль компании", openPositions: "Открытые вакансии",
    aboutCompany: "О компании", contactInfo: "Контактная информация", verified: "Проверено", jobListings: "Вакансии"
  },
  favorites: { title: "Избранное", savedJobs: "Сохранённые вакансии", noSavedJobs: "Нет сохранённых вакансий", startSaving: "Нажмите на сердечко, чтобы сохранить вакансию" },
  subscribe: { title: "Подписаться", subtitle: "Получайте уведомления о новых вакансиях", selectCategories: "Выберите категории", emailPlaceholder: "Ваш email", subscribeButton: "Подписаться", successMessage: "Вы успешно подписались!" },
  blog: { title: "Блог", latestPosts: "Последние статьи", readingTime: "мин чтения", relatedPosts: "Похожие статьи", tableOfContents: "Содержание" },
  services: { title: "Услуги", pricing: "Цены", choosePlan: "Выберите план", features: "Возможности", popular: "Популярный", perMonth: "в месяц", contactUs: "Связаться с нами" },
  referral: { title: "Реферальная программа", earnMoney: "Зарабатывайте", yourCode: "Ваш код", copyLink: "Копировать ссылку", totalEarnings: "Общий заработок", clicks: "Клики", confirmations: "Подтверждения" },
  about: { title: "О нас", mission: "Наша миссия", ourStory: "Наша история", contactUs: "Связаться с нами" },
  addJob: { title: "Разместить вакансию", companyName: "Название компании", jobTitle: "Название вакансии", description: "Описание", submit: "Отправить" },
  seo: { homeTitle: "Jooble - Вакансии и объявления о работе в Азербайджане", homeDescription: "Найдите последние вакансии в Азербайджане.", vacanciesTitle: "Вакансии | Jooble.az", vacanciesDescription: "Все активные вакансии", categoriesTitle: "Категории | Jooble.az", categoriesDescription: "Вакансии по категориям", regionsTitle: "Регионы | Jooble.az", regionsDescription: "Вакансии по регионам", companiesTitle: "Компании | Jooble.az", companiesDescription: "Профили компаний и вакансии" }
};

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Determine locale from URL first, then fallback to initialLocale
  const urlLocale = getLocaleFromPathname(pathname);
  
  const [locale, setLocale] = useState<Locale>(() => {
    // URL path takes precedence
    return urlLocale || initialLocale || i18nConfig.defaultLocale;
  });
  
  // Get the correct default dictionary based on initial locale
  const getDefaultDict = (loc: Locale): Dictionary => {
    if (loc === 'en') return enDictionary;
    if (loc === 'ru') return ruDictionary;
    return azDictionary;
  };
  
  const [dictionary, setDictionary] = useState<Dictionary | null>(() => {
    const targetLocale = urlLocale || initialLocale || i18nConfig.defaultLocale;
    return getCachedDictionary(targetLocale) || getDefaultDict(targetLocale);
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Load dictionary on mount and locale change
  useEffect(() => {
    const loadDictionary = async () => {
      const cached = getCachedDictionary(locale);
      if (cached) {
        setDictionary(cached);
        return;
      }
      
      setIsLoading(true);
      try {
        const dict = await preloadDictionary(locale);
        setDictionary(dict);
      } catch (error) {
        console.error('Failed to load dictionary:', error);
        setDictionary(getDefaultDict(locale));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDictionary();
  }, [locale]);

  // Detect locale from URL
  useEffect(() => {
    const currentUrlLocale = getLocaleFromPathname(pathname);
    if (currentUrlLocale !== locale) {
      setLocale(currentUrlLocale);
    }
  }, [pathname, locale]);

  // Auto-detect browser language on first visit
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedLocale = localStorage.getItem('preferred-locale') as Locale | null;
    if (savedLocale && i18nConfig.locales.includes(savedLocale)) {
      return; // User has a preference, don't auto-detect
    }
    
    // Only auto-detect on the default locale (AZ) pages
    const urlLocale = getLocaleFromPathname(pathname);
    if (urlLocale !== i18nConfig.defaultLocale) {
      return; // Already on a specific language page
    }
    
    // Detect browser language
    const browserLang = navigator.language.toLowerCase().split('-')[0];
    
    if (browserLang === 'ru' || browserLang === 'en') {
      // Suggest language change but don't auto-redirect
      // This could be used to show a language suggestion banner
    }
  }, []);

  const changeLocale = useCallback((newLocale: Locale) => {
    if (newLocale === locale) return;
    
    // Save preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-locale', newLocale);
      localStorage.setItem('language', newLocale); // For backwards compatibility
    }
    
    // Navigate to new locale
    const newPath = addLocaleToPathname(pathname, newLocale);
    router.push(newPath);
    
    setLocale(newLocale);
  }, [locale, pathname, router]);

  const t = useCallback((key: string): string => {
    if (!dictionary) return key;
    
    const keys = key.split('.');
    let value: unknown = dictionary;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // Key not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  }, [dictionary]);

  const getLocalizedPath = useCallback((path: string): string => {
    return addLocaleToPathname(path, locale);
  }, [locale]);

  return (
    <I18nContext.Provider
      value={{
        locale,
        dictionary,
        isLoading,
        changeLocale,
        t,
        getLocalizedPath,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Helper hook for translation
export function useTranslation() {
  const { t, locale, dictionary, isLoading } = useI18n();
  return { t, locale, dictionary, isLoading };
}
