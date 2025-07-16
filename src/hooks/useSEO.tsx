import { useEffect } from 'react';
import { updatePageMeta, SEOMetadata, getSiteSettings } from '@/utils/seo';

interface UseSEOProps {
  title: string;
  description: string;
  keywords?: string;
  url?: string;
}

export const useSEO = ({ title, description, keywords = '', url }: UseSEOProps) => {
  useEffect(() => {
    const updateSEO = async () => {
      const settings = await getSiteSettings();
      
      const metadata: SEOMetadata = {
        title: title || settings.site_title || 'Jooble Azərbaycan',
        description: description || settings.site_description || 'İş elanları və vakansiyalar',
        keywords: keywords || settings.site_keywords || 'iş elanları, vakansiya, Azərbaycan',
        url: url || window.location.pathname
      };
      
      updatePageMeta(metadata);
    };
    
    updateSEO();
  }, [title, description, keywords, url]);
};

export const useDynamicSEO = (
  type: 'job' | 'company' | 'category',
  data: any
) => {
  useEffect(() => {
    if (!data) return;

    let metadata: SEOMetadata;

    switch (type) {
      case 'job':
        metadata = {
          title: data.seo_title || `${data.title} - ${data.company?.name || 'İş Elanı'} | Jooble`,
          description: data.seo_description || `${data.company?.name || 'Şirkət'}də ${data.title} vakansiyası. ${data.location} yerində iş imkanı.`,
          keywords: data.seo_keywords?.join(', ') || `${data.title}, ${data.company?.name || ''}, ${data.category?.name || ''}, iş elanları, vakansiya, Azərbaycan`,
          url: `/vakansiyalar/${data.slug}`
        };
        break;
        
      case 'company':
        metadata = {
          title: data.seo_title || `${data.name} | Şirkət Profili - Jooble`,
          description: data.seo_description || `${data.name} şirkəti haqqında məlumat və aktiv vakansiyalar. ${data.description || ''}`,
          keywords: data.seo_keywords?.join(', ') || `${data.name}, şirkət, vakansiya, iş elanları, Azərbaycan`,
          url: `/sirketler/${data.slug}`
        };
        break;
        
      case 'category':
        metadata = {
          title: data.seo_title || `${data.name} Vakansiyaları | İş Elanları - Jooble`,
          description: data.seo_description || `${data.name} sahəsində aktiv vakansiyalar və iş elanları. ${data.description || ''}`,
          keywords: data.seo_keywords?.join(', ') || `${data.name}, vakansiya, iş elanları, Azərbaycan, ${data.name} işləri`,
          url: `/kateqoriyalar/${data.slug}`
        };
        break;
        
      default:
        return;
    }

    updatePageMeta(metadata);
  }, [type, data]);
};