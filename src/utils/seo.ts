import { supabase } from '@/integrations/supabase/client';

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
  url: string;
}

// Cache for site settings
let siteSettingsCache: { [key: string]: string } | null = null;

export const getSiteSettings = async () => {
  if (siteSettingsCache) {
    return siteSettingsCache;
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value');

    if (error) {
      console.error('Error fetching site settings:', error);
      return {};
    }

    const settings: { [key: string]: string } = {};
    data?.forEach((setting) => {
      if (setting.value) {
        settings[setting.key] = typeof setting.value === 'string' ? setting.value : String(setting.value);
      }
    });

    siteSettingsCache = settings;
    return settings;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
};

export const generateJobSEO = (jobTitle: string, company: string, category: string): SEOMetadata => {
  return {
    title: `${jobTitle} - ${company} | İş Elanları`,
    description: `${company} şirkətində ${jobTitle} vakansiyası. ${category} sahəsində iş imkanları və tələblər.`,
    keywords: `${jobTitle}, ${company}, ${category}, iş elanları, vakansiya, Azərbaycan`,
    url: `/vakansiyalar/${jobTitle.toLowerCase().replace(/\s+/g, '-')}`
  };
};

export const generateCategorySEO = (categoryName: string, jobCount: number): SEOMetadata => {
  return {
    title: `${categoryName} Vakansiyaları | İş Elanları`,
    description: `${categoryName} sahəsində ${jobCount} aktiv vakansiya. Azərbaycanda ${categoryName} işləri və iş imkanları.`,
    keywords: `${categoryName}, vakansiya, iş elanları, Azərbaycan, ${categoryName} işləri`,
    url: `/kateqoriyalar/${categoryName.toLowerCase().replace(/\s+/g, '-')}`
  };
};

export const generateCompanySEO = (companyName: string, jobCount: number): SEOMetadata => {
  return {
    title: `${companyName} Şirkəti | İş Elanları`,
    description: `${companyName} şirkətində ${jobCount} aktiv vakansiya. ${companyName} haqqında məlumat və iş imkanları.`,
    keywords: `${companyName}, şirkət, vakansiya, iş elanları, Azərbaycan, ${companyName} işləri`,
    url: `/sirketler/${companyName.toLowerCase().replace(/\s+/g, '-')}`
  };
};

export const generatePageSEO = async (page: string, additionalInfo?: string): Promise<SEOMetadata> => {
  const settings = await getSiteSettings();
  
  const defaultSeoData: Record<string, SEOMetadata> = {
    home: {
      title: settings.site_title || 'İş Elanları | Jooble Azərbaycan - Ən Yaxşı İş İmkanları',
      description: settings.site_description || 'Azərbaycanda ən yaxşı iş elanları və vakansiyalar. Minlərlə şirkət və iş imkanı bir yerdə. İndi qeydiyyatdan keçin və arzuladığınız işi tapın.',
      keywords: settings.site_keywords || 'iş elanları, vakansiya, Azərbaycan, iş axtarışı, karyera, şirkət, maaş',
      url: '/'
    },
    vacancies: {
      title: 'Vakansiyalar | İş Elanları Azərbaycan',
      description: 'Azərbaycanda aktiv vakansiyalar və iş elanları. Müxtəlif sahələrdə iş imkanları, maaş məlumatları və şirkət təfərrüatları.',
      keywords: 'vakansiyalar, iş elanları, Azərbaycan işləri, aktiv elanlar',
      url: '/vacancies'
    },
    categories: {
      title: 'İş Kateqoriyaları | Sahələr üzrə Vakansiyalar',
      description: 'Müxtəlif sahələrdə iş kateqoriyaları və vakansiyalar. IT, maliyyə, tibb, mühəndislik və digər sahələrdə iş imkanları.',
      keywords: 'iş kateqoriyaları, sahələr, IT işləri, maliyyə vakansiyaları, mühəndislik işləri',
      url: '/categories'
    },
    companies: {
      title: 'Şirkətlər | İşəgötürən Şirkətlər Azərbaycan',
      description: 'Azərbaycanda aktiv işəgötürən şirkətlər və onların vakansiyaları. Şirkət haqqında məlumat, kültür və iş imkanları.',
      keywords: 'şirkətlər, işəgötürənlər, Azərbaycan şirkətləri, işəgötürən şirkətlər',
      url: '/companies'
    },
    favorites: {
      title: 'Seçilmiş Elanlar | Saxlanılmış Vakansiyalar',
      description: 'Saxladığınız və bəyəndiyiniz iş elanları. Seçilmiş vakansiyalar və müraciət etmək istədiyiniz işlər.',
      keywords: 'seçilmiş elanlar, saxlanılmış işlər, bəyənilən vakansiyalar',
      url: '/favorites'
    },
    services: {
      title: 'Qiymət Planları | Premium Xidmətlər',
      description: 'Jooble premium xidmətləri və qiymət planları. Premium elanlar, prioritet dəstək və əlavə imkanlar.',
      keywords: 'qiymət planları, premium xidmətlər, premium elanlar, ödənişli xidmətlər',
      url: '/services'
    },
    about: {
      title: 'Haqqımızda | Jooble Azərbaycan',
      description: 'Jooble haqqında məlumat. Missiyamız, dəyərlərimiz və Azərbaycanda iş axtarış platformasının təcrübəsi.',
      keywords: 'Jooble haqqında, missiya, Azərbaycan iş platforması, şirkət məlumatları',
      url: '/about'
    }
  };

  const baseSEO = defaultSeoData[page] || defaultSeoData.home;
  
  if (additionalInfo) {
    return {
      ...baseSEO,
      title: `${additionalInfo} | ${baseSEO.title}`,
      description: `${additionalInfo} - ${baseSEO.description}`,
      keywords: `${additionalInfo}, ${baseSEO.keywords}`
    };
  }
  
  return baseSEO;
};

export const updatePageMeta = (metadata: SEOMetadata) => {
  // Update document title
  document.title = metadata.title;
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', metadata.description);
  } else {
    const newMetaDescription = document.createElement('meta');
    newMetaDescription.name = 'description';
    newMetaDescription.content = metadata.description;
    document.head.appendChild(newMetaDescription);
  }
  
  // Update meta keywords
  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) {
    metaKeywords.setAttribute('content', metadata.keywords);
  } else {
    const newMetaKeywords = document.createElement('meta');
    newMetaKeywords.name = 'keywords';
    newMetaKeywords.content = metadata.keywords;
    document.head.appendChild(newMetaKeywords);
  }
  
  // Update canonical URL
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.setAttribute('href', `${window.location.origin}${metadata.url}`);
  } else {
    const newCanonicalLink = document.createElement('link');
    newCanonicalLink.rel = 'canonical';
    newCanonicalLink.href = `${window.location.origin}${metadata.url}`;
    document.head.appendChild(newCanonicalLink);
  }

  // Update Open Graph tags
  const updateOGTag = (property: string, content: string) => {
    let ogTag = document.querySelector(`meta[property="${property}"]`);
    if (ogTag) {
      ogTag.setAttribute('content', content);
    } else {
      ogTag = document.createElement('meta');
      ogTag.setAttribute('property', property);
      ogTag.setAttribute('content', content);
      document.head.appendChild(ogTag);
    }
  };

  updateOGTag('og:title', metadata.title);
  updateOGTag('og:description', metadata.description);
  updateOGTag('og:url', `${window.location.origin}${metadata.url}`);
  updateOGTag('og:type', 'website');
  updateOGTag('og:site_name', 'Jooble Azərbaycan');
};