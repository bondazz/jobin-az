import { useEffect } from "react";
import { updatePageMeta, SEOMetadata, getSiteSettings } from "@/utils/seo";

interface UseSEOProps {
  title: string;
  description: string;
  keywords?: string;
  url?: string;
}

export const useSEO = ({ title, description, keywords = "", url }: UseSEOProps) => {
  useEffect(() => {
    // Avoid client-side meta overrides on SSR-managed dynamic routes
    const isManagedRoute = typeof window !== 'undefined' && /^(\/vacancies|\/companies)\//.test(window.location.pathname);
    if (isManagedRoute) return;

    const updateSEO = async () => {
      const settings = await getSiteSettings();

      const metadata: SEOMetadata = {
        title: title || settings.site_title || "Jooble Azərbaycan",
        description: description || settings.site_description || "İş elanları və vakansiyalar",
        keywords: keywords || settings.site_keywords || "iş elanları, vakansiya, Azərbaycan",
        url: url || window.location.pathname,
      };

      updatePageMeta(metadata);
    };

    updateSEO();
  }, [title, description, keywords, url]);
};

export const useDynamicSEO = (type: "job" | "company" | "category", data: any) => {
  useEffect(() => {
    if (!data) return;

    // Avoid client-side meta overrides on SSR-managed dynamic routes
    const isManagedRoute = typeof window !== 'undefined' && /^(\/vacancies|\/companies)\//.test(window.location.pathname);
    if (isManagedRoute) return;

    let metadata: SEOMetadata;

    switch (type) {
      case "job":
        metadata = {
          title: data.seo_title || `${data.title} | ${data.company?.name || "İş Elanı"}`,
          description: data.seo_description || `${data.company?.name || "Şirkət"}də ${data.title} vakansiyası`,
          keywords:
            data.seo_keywords?.join(", ") || `${data.title}, ${data.company?.name || ""}, vakansiya, iş elanları`,
          url: `/vacancies/${data.slug}`,
        };
        break;

      case "company":
        metadata = {
          title: data.seo_title || `${data.name} | Şirkət Profili - Jooble`,
          description:
            data.seo_description ||
            `${data.name} şirkəti haqqında məlumat, iş elanları və vakansiyalar. ${data.description || ""}`,
          keywords: data.seo_keywords?.join(", ") || `${data.name}, şirkət, vakansiya, iş elanları, Azərbaycan`,
          url: `/companies/${data.slug}`,
        };
        break;

      case "category":
        metadata = {
          title: data.seo_title || `${data.name} Vakansiyaları | İş Elanları - Jooble`,
          description:
            data.seo_description ||
            `${data.name} sahəsində aktiv vakansiyalar və iş elanları. ${data.description || ""}`,
          keywords:
            data.seo_keywords?.join(", ") || `${data.name}, vakansiya, iş elanları, Azərbaycan, ${data.name} işləri`,
          url: `/categories/${data.slug}`,
        };
        break;

      default:
        return;
    }

    updatePageMeta(metadata);
  }, [type, data]);
};
