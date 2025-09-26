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
        // Generate location-based keywords
        const locationKeywords = data.location ? [
          `${data.location}da iş`,
          `${data.location} vakansiya`,
          `${data.location} iş elanları`
        ].join(', ') : '';
        
        // Generate salary-based keywords
        const salaryKeywords = data.salary && data.salary !== 'Müzakirə' ? [
          `${data.salary} maaş`,
          `yüksək maaşlı iş`,
          `maaşlı vakansiya`
        ].join(', ') : 'müzakirə maaş, iş imkanı';
        
        // Enhanced title with location and category
        const enhancedTitle = data.seo_title || 
          `${data.title} ${data.location ? `- ${data.location}` : ''} | ${data.company?.name || 'İş Elanı'} | ${data.category?.name || ''} Vakansiyası`;
        
        // Enhanced description with more details
        const enhancedDescription = data.seo_description || 
          `${data.company?.name || 'Şirkət'}də ${data.title} vakansiyası ${data.location ? `${data.location}da` : 'Azərbaycanda'}. ${data.category?.name || ''} sahəsində ${data.salary || 'müzakirə maaşı ilə'} iş imkanı. İndi müraciət edin!`;
        
        // Comprehensive keywords
        const comprehensiveKeywords = data.seo_keywords?.join(', ') || [
          data.title,
          data.company?.name || '',
          data.category?.name || '',
          locationKeywords,
          salaryKeywords,
          'iş elanları Azərbaycan',
          'vakansiya',
          'iş axtarışı',
          'karyera imkanları',
          'iş tap',
          'müraciət et'
        ].filter(Boolean).join(', ');

        metadata = {
          title: enhancedTitle,
          description: enhancedDescription,
          keywords: comprehensiveKeywords,
          url: `/vacancies/${data.slug}`
        };
        break;
        
      case 'company':
        metadata = {
          title: data.seo_title || `${data.name} | Şirkət Profili - Jooble`,
          description: data.seo_description || `${data.name} şirkəti haqqında məlumat və aktiv vakansiyalar. ${data.description || ''}`,
          keywords: data.seo_keywords?.join(', ') || `${data.name}, şirkət, vakansiya, iş elanları, Azərbaycan`,
          url: `/companies/${data.slug}`
        };
        break;
        
      case 'category':
        metadata = {
          title: data.seo_title || `${data.name} Vakansiyaları | İş Elanları - Jooble`,
          description: data.seo_description || `${data.name} sahəsində aktiv vakansiyalar və iş elanları. ${data.description || ''}`,
          keywords: data.seo_keywords?.join(', ') || `${data.name}, vakansiya, iş elanları, Azərbaycan, ${data.name} işləri`,
          url: `/categories/${data.slug}`
        };
        break;
        
      default:
        return;
    }

    updatePageMeta(metadata);
  }, [type, data]);
};