import { supabase } from "@/integrations/supabase/client";

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
    const { data, error } = await supabase.from("site_settings").select("key, value");

    if (error) {
      console.error("Error fetching site settings:", error);
      return {};
    }

    const settings: { [key: string]: string } = {};
    data?.forEach((setting) => {
      if (setting.value) {
        settings[setting.key] = typeof setting.value === "string" ? setting.value : String(setting.value);
      }
    });

    siteSettingsCache = settings;
    return settings;
  } catch (error) {
    console.error("Error:", error);
    return {};
  }
};

export const generateJobSEO = (jobTitle: string, company: string, category: string): SEOMetadata => {
  return {
    title: `${jobTitle} - ${company} | İş Elanları və Vakansiyalar`,
    description: `${company} şirkətində ${jobTitle} vakansiyası. ${category} sahəsində iş elanları və vakansiyalar.`,
    keywords: `${jobTitle}, ${company}, ${category}, iş elanları, vakansiya, is elanlari, vakansiyalar,`,
    url: `/vacancies/${jobTitle.toLowerCase().replace(/\s+/g, "-")}`,
  };
};

export const generateCategorySEO = (categoryName: string, jobCount: number): SEOMetadata => {
  return {
    title: `${categoryName} Vakansiyaları | İş Elanları və vakansiyalar`,
    description: `${categoryName} sahəsində ${jobCount} aktiv vakansiya. Azərbaycanda ${categoryName} iş elanları və vakansiyalar.`,
    keywords: `${categoryName}, vakansiya, iş elanları, is elanlari, vakansiyalar, ${categoryName} iş elanları`,
    url: `/categories/${categoryName.toLowerCase().replace(/\s+/g, "-")}`,
  };
};

export const generateCompanySEO = (companyName: string, jobCount: number): SEOMetadata => {
  return {
    title: `${companyName} Şirkəti | İş Elanları`,
    description: `${companyName} şirkətində ${jobCount} aktiv vakansiya. ${companyName} haqqında məlumat və iş elanları.`,
    keywords: `${companyName}, şirkət, vakansiya, iş elanları, is elanlari, vakansiyalar, ${companyName} iş elanları`,
    url: `/companies/${companyName.toLowerCase().replace(/\s+/g, "-")}`,
  };
};

export const generatePageSEO = async (page: string, additionalInfo?: string): Promise<SEOMetadata> => {
  const settings = await getSiteSettings();

  const defaultSeoData: Record<string, SEOMetadata> = {
    home: {
      title: settings.site_title || "İş Elanları | Jooble Azərbaycan - Ən Yaxşı İş Elanları",
      description:
        settings.site_description ||
        "Azərbaycanda ən yaxşı iš elanları və vakansiyalar. Minlərlə şirkət və iş imkanı bir yerdə. İndi qeydiyyatdan keçin və arzuladığınız işi tapın.",
      keywords:
        settings.site_keywords ||
        "iş elanları, vakansiya, Azərbaycan, iş axtarışı, karyera, şirkət, maaş, iş elanları, is elanlari, vakansiyalar",
      url: "/",
    },
    vacancies: {
      title: "İş elanları və Vakansiyalar | Is elanlari Azerbaycan",
      description:
        "Azərbaycanda aktiv vakansiyalar və iş elanları. Müxtəlif sahələrdə iş imkanları, maaş məlumatları və şirkət təfərrüatları.",
      keywords:
        "vakansiyalar, iş elanları, Azərbaycan iş elanları, aktiv elanlar, iş elanları, is elanlari, vakansiyalar",
      url: "/vacancies",
    },
    "aktiv-vakansiya": {
      title: "Aktiv Vakansiyalar | İş Elanları Azərbaycan",
      description:
        "Azərbaycanda aktiv vakansiyalar və iş elanları. Müxtəlif sahələrdə güncel iş imkanları, maaş məlumatları və şirkət təfərrüatları.",
      keywords:
        "aktiv vakansiyalar, iş elanları, Azərbaycan iş elanları, güncel elanlar, iş elanları, is elanlari, vakansiyalar",
      url: "/aktiv-vakansiya",
    },
    categories: {
      title: "İş Elanları Kateqoriyaları | Sahələr üzrə Vakansiyalar",
      description:
        "Müxtəlif sahələrdə iş kateqoriyaları və vakansiyalar. IT, maliyyə, tibb, mühəndislik və digər sahələrdə iş imkanları.",
      keywords: "iş kateqoriyaları, sahələr, IT işləri, maliyyə vakansiyaları, mühəndislik işləri",
      url: "/categories",
    },
    companies: {
      title: "Şirkətlər | Şirkətlər iş elanları",
      description:
        "Azərbaycanda aktiv işəgötürən şirkətlər və onların vakansiyaları. Şirkət haqqında məlumat, kültür və iş imkanları.",
      keywords: "şirkətlər, işəgötürənlər, Azərbaycan şirkətləri, işəgötürən şirkətlər",
      url: "/companies",
    },
    favorites: {
      title: "Seçilmiş İş Elanları | Saxlanılmış Vakansiyalar",
      description:
        "Saxladığınız və bəyəndiyiniz iş elanları. Seçilmiş vakansiyalar və müraciət etmək istədiyiniz işlər.",
      keywords: "seçilmiş elanlar, saxlanılmış işlər, bəyənilən vakansiyalar",
      url: "/favorites",
    },
    services: {
      title: "İş elanları qiymətləri | Premium Xidmətlər",
      description: "Jooble premium xidmətləri və qiymət planları. Premium elanlar, prioritet dəstək və əlavə imkanlar.",
      keywords: "qiymət planları, premium xidmətlər, premium elanlar, ödənişli xidmətlər",
      url: "/services",
    },
    about: {
      title: "Haqqımızda | Jooble Azərbaycan",
      description:
        "Jooble haqqında məlumat. Missiyamız, dəyərlərimiz və Azərbaycanda iş axtarış platformasının təcrübəsi.",
      keywords: "Jooble haqqında, missiya, Azərbaycan iş elanları, şirkət məlumatları",
      url: "/about",
    },
  };

  const baseSEO = defaultSeoData[page] || defaultSeoData.home;

  if (additionalInfo) {
    return {
      ...baseSEO,
      title: `${additionalInfo} | ${baseSEO.title}`,
      description: `${additionalInfo} - ${baseSEO.description}`,
      keywords: `${additionalInfo}, ${baseSEO.keywords}`,
    };
  }

  return baseSEO;
};

// Normalize URL for canonical purposes - point all variants to main domain
const normalizeUrl = (url: string): string => {
  // Remove trailing slash except for root
  const normalized = url === "/" ? "/" : url.replace(/\/$/, "");

  // Handle duplicate routes - always use canonical root path
  const canonicalRoutes: { [key: string]: string } = {
    "/vacancies": "/", // /vacancies should canonically point to /
    "/aktiv-vakansiya": "/", // /aktiv-vakansiya should canonically point to /
  };

  return canonicalRoutes[normalized] || normalized;
};

export const updatePageMeta = (metadata: SEOMetadata) => {
  // Update document title
  document.title = metadata.title;

  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", metadata.description);
  } else {
    const newMetaDescription = document.createElement("meta");
    newMetaDescription.name = "description";
    newMetaDescription.content = metadata.description;
    document.head.appendChild(newMetaDescription);
  }

  // Update meta keywords
  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) {
    metaKeywords.setAttribute("content", metadata.keywords);
  } else {
    const newMetaKeywords = document.createElement("meta");
    newMetaKeywords.name = "keywords";
    newMetaKeywords.content = metadata.keywords;
    document.head.appendChild(newMetaKeywords);
  }

  // Get canonical URL - normalize to prevent duplicate content issues
  const canonicalUrl = normalizeUrl(metadata.url);
  const fullCanonicalUrl = `https://jooble.az${canonicalUrl}`;

  // Update canonical URL
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.setAttribute("href", fullCanonicalUrl);
  } else {
    const newCanonicalLink = document.createElement("link");
    newCanonicalLink.rel = "canonical";
    newCanonicalLink.href = fullCanonicalUrl;
    document.head.appendChild(newCanonicalLink);
  }

  // Update Open Graph tags
  const updateOGTag = (property: string, content: string) => {
    let ogTag = document.querySelector(`meta[property="${property}"]`);
    if (ogTag) {
      ogTag.setAttribute("content", content);
    } else {
      ogTag = document.createElement("meta");
      ogTag.setAttribute("property", property);
      ogTag.setAttribute("content", content);
      document.head.appendChild(ogTag);
    }
  };

  updateOGTag("og:title", metadata.title);
  updateOGTag("og:description", metadata.description);
  updateOGTag("og:url", fullCanonicalUrl);
  updateOGTag("og:type", "website");
  updateOGTag("og:site_name", "Jooble Azərbaycan");

  // Add hreflang for multi-language support
  const hreflangLink = document.querySelector('link[rel="alternate"][hreflang="az"]');
  if (hreflangLink) {
    hreflangLink.setAttribute("href", fullCanonicalUrl);
  } else {
    const newHreflangLink = document.createElement("link");
    newHreflangLink.rel = "alternate";
    newHreflangLink.hreflang = "az";
    newHreflangLink.href = fullCanonicalUrl;
    document.head.appendChild(newHreflangLink);
  }
};
