export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
  url: string;
}

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
};