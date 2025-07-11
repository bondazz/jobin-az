import { useEffect } from 'react';
import { updatePageMeta, SEOMetadata } from '@/utils/seo';

interface UseSEOProps {
  title: string;
  description: string;
  keywords?: string;
  url?: string;
}

export const useSEO = ({ title, description, keywords = '', url }: UseSEOProps) => {
  useEffect(() => {
    const metadata: SEOMetadata = {
      title,
      description,
      keywords,
      url: url || window.location.pathname
    };
    
    updatePageMeta(metadata);
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