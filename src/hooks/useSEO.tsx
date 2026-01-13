import { useEffect } from "react";
import { updatePageMeta, SEOMetadata, getSiteSettings } from "@/utils/seo";

interface UseSEOProps {
  title: string;
  description: string;
  keywords?: string;
  url?: string;
  type?: "website" | "article" | "product" | "profile";
  image?: string;
  structuredData?: any;
}

export const useSEO = ({ 
  title, 
  description, 
  keywords = "", 
  url,
  type = "website",
  image,
  structuredData
}: UseSEOProps) => {
  useEffect(() => {
    const updateSEO = async () => {
      const settings = await getSiteSettings();
      // Ensure URL is absolute and properly formatted
      let currentUrl = url || window.location.href;
      if (!currentUrl.startsWith('http')) {
        currentUrl = `https://Jobin.az${currentUrl.startsWith('/') ? '' : '/'}${currentUrl}`;
      }

      const metadata: SEOMetadata = {
        title: title || settings.site_title || "Jobin Azərbaycan",
        description: description || settings.site_description || "İş elanları və vakansiyalar",
        keywords: keywords || settings.site_keywords || "iş elanları, vakansiya, Azərbaycan",
        url: currentUrl,
      };

      updatePageMeta(metadata);

      // Update Open Graph type
      const ogType = document.querySelector('meta[property="og:type"]');
      if (ogType) {
        ogType.setAttribute('content', type);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:type');
        meta.setAttribute('content', type);
        document.head.appendChild(meta);
      }

      // Update OG Image
      if (image) {
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) {
          ogImage.setAttribute('content', image);
        } else {
          const meta = document.createElement('meta');
          meta.setAttribute('property', 'og:image');
          meta.setAttribute('content', image);
          document.head.appendChild(meta);
        }
      }

      // Update structured data
      if (structuredData) {
        const existingScript = document.querySelector('script[type="application/ld+json"]');
        if (existingScript) {
          existingScript.textContent = JSON.stringify(structuredData);
        } else {
          const script = document.createElement('script');
          script.type = 'application/ld+json';
          script.textContent = JSON.stringify(structuredData);
          document.head.appendChild(script);
        }
      }

      // Notify bots via console (some crawlers check console)
      console.log('SEO Meta Data:', metadata);
      console.log('Structured Data:', structuredData);
    };

    updateSEO();
  }, [title, description, keywords, url, type, image, structuredData]);
};

const DEFAULT_OG_IMAGE = 'https://Jobin.az/icons/icon-512x512.jpg';

export const useDynamicSEO = (type: "job" | "company" | "category", data: any) => {
  useEffect(() => {
    if (!data) return;

    let metadata: SEOMetadata;
    let structuredData: any;
    let ogType = "website";
    let ogImage = DEFAULT_OG_IMAGE;

    switch (type) {
      case "job":
        // Use company logo or default
        ogImage = data.company?.logo || data.company?.logo_url || DEFAULT_OG_IMAGE;
        metadata = {
          title: data.seo_title || `${data.title} | ${data.company?.name || "İş Elanı"}`,
          description: data.seo_description || `${data.company?.name || "Şirkət"}də ${data.title} vakansiyası`,
          keywords:
            data.seo_keywords?.join(", ") || `${data.title}, ${data.company?.name || ""}, vakansiya, iş elanları`,
          url: `https://Jobin.az/vacancies/${data.slug}`,
        };
        ogType = "article";
        structuredData = {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "title": data.title,
          "description": data.description,
          "datePosted": data.created_at,
          "validThrough": data.expire_at,
          "employmentType": data.employment_type,
          "hiringOrganization": {
            "@type": "Organization",
            "name": data.company?.name || "Şirkət",
            "logo": data.company?.logo || data.company?.logo_url || DEFAULT_OG_IMAGE
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": data.location || "Bakı",
              "addressCountry": "AZ"
            }
          },
          "baseSalary": data.salary ? {
            "@type": "MonetaryAmount",
            "currency": "AZN",
            "value": {
              "@type": "QuantitativeValue",
              "value": data.salary
            }
          } : undefined
        };
        break;

      case "company":
        ogImage = data.logo || data.logo_url || DEFAULT_OG_IMAGE;
        metadata = {
          title: data.seo_title || `${data.name} | Şirkət Profili - Jobin`,
          description:
            data.seo_description ||
            `${data.name} şirkəti haqqında məlumat, iş elanları və vakansiyalar. ${data.description || ""}`,
          keywords: data.seo_keywords?.join(", ") || `${data.name}, şirkət, vakansiya, iş elanları, Azərbaycan`,
          url: `https://Jobin.az/companies/${data.slug}`,
        };
        ogType = "profile";
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": data.name,
          "description": data.description,
          "url": `https://Jobin.az/companies/${data.slug}`,
          "logo": data.logo || data.logo_url || DEFAULT_OG_IMAGE,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "AZ"
          }
        };
        break;

      case "category":
        metadata = {
          title: data.seo_title || `${data.name} Vakansiyaları | İş Elanları - Jobin`,
          description:
            data.seo_description ||
            `${data.name} sahəsində aktiv vakansiyalar və iş elanları. ${data.description || ""}`,
          keywords:
            data.seo_keywords?.join(", ") || `${data.name}, vakansiya, iş elanları, Azərbaycan, ${data.name} işləri`,
          url: `https://Jobin.az/categories/${data.slug}`,
        };
        structuredData = {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `${data.name} Vakansiyaları`,
          "description": metadata.description,
          "url": `https://Jobin.az/categories/${data.slug}`
        };
        break;

      default:
        return;
    }

    updatePageMeta(metadata);

    // Update Open Graph type
    const ogTypeTag = document.querySelector('meta[property="og:type"]');
    if (ogTypeTag) {
      ogTypeTag.setAttribute('content', ogType);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:type');
      meta.setAttribute('content', ogType);
      document.head.appendChild(meta);
    }

    // Update OG Image - always set with fallback to default
    const ogImageTag = document.querySelector('meta[property="og:image"]');
    if (ogImageTag) {
      ogImageTag.setAttribute('content', ogImage);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image');
      meta.setAttribute('content', ogImage);
      document.head.appendChild(meta);
    }

    // Twitter Card meta tags for Twitter, Telegram, and other platforms
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: ogImage },
      { name: 'twitter:title', content: metadata.title },
      { name: 'twitter:description', content: metadata.description }
    ];

    twitterTags.forEach(({ name, content }) => {
      const existingTag = document.querySelector(`meta[name="${name}"]`);
      if (existingTag) {
        existingTag.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    });

    // Update structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.textContent = JSON.stringify(structuredData);
    } else {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [type, data]);
};
