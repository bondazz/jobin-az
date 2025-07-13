import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePageMeta } from '@/utils/seo';
import { Tables } from '@/integrations/supabase/types';

type Company = Tables<'companies'>;

export const useCompanyProfile = (company: Company) => {
  const [activeTab, setActiveTab] = useState<'about' | 'jobs'>('about');
  const navigate = useNavigate();

  // Unified function to handle tab changes across all devices
  const handleTabChange = (tab: 'about' | 'jobs') => {
    setActiveTab(tab);
    
    // Update URL consistently across all devices
    const newUrl = tab === 'about' 
      ? `/companies/${company.slug}` 
      : `/companies/${company.slug}/vacancies`;
    
    // Use navigate for proper routing
    navigate(newUrl, { replace: true });
    
    // Update SEO consistently
    updateSEO(tab);
  };

  // Unified SEO update function
  const updateSEO = (tab: 'about' | 'jobs') => {
    if (tab === 'about') {
      updatePageMeta({
        title: company.seo_title || `${company.name} - Haqqında | Şirkət Profili`,
        description: company.seo_description || `${company.name} şirkəti haqqında məlumat və ətraflı təfərrüatlar.`,
        keywords: company.seo_keywords?.join(', ') || `${company.name}, şirkət, haqqında, Azərbaycan`,
        url: `/companies/${company.slug}`
      });
    } else {
      updatePageMeta({
        title: company.seo_title || `${company.name} - İş Elanları | Vakansiyalar`,
        description: company.seo_description || `${company.name} şirkətində aktiv vakansiyalar və iş elanları.`,
        keywords: company.seo_keywords?.join(', ') || `${company.name}, şirkət, vakansiya, iş elanları, Azərbaycan`,
        url: `/companies/${company.slug}/vacancies`
      });
    }
  };

  // Initialize SEO on mount and when activeTab changes
  useEffect(() => {
    updateSEO(activeTab);
  }, [activeTab, company]);

  // Detect initial tab from URL
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/vacancies')) {
      setActiveTab('jobs' as const);
    } else {
      setActiveTab('about' as const);
    }
  }, []);

  return {
    activeTab,
    handleTabChange
  };
};