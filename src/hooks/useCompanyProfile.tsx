import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updatePageMeta } from '@/utils/seo';
import { Tables } from '@/integrations/supabase/types';

type Company = Tables<'companies'>;

export const useCompanyProfile = (company: Company | null) => {
  const [activeTab, setActiveTab] = useState<'about' | 'jobs'>('about');
  const router = useRouter();

  // Unified function to handle tab changes across all devices
  const handleTabChange = (tab: 'about' | 'jobs') => {
    if (!company) return;

    setActiveTab(tab);

    // Update SEO consistently
    updateSEO(company, tab);
  };

  // Unified SEO update function
  const updateSEO = (companyData: Company, tab: 'about' | 'jobs') => {
    if (!companyData) return;

    if (tab === 'about') {
      updatePageMeta({
        title: companyData.about_seo_title || companyData.seo_title || `${companyData.name} - Haqqında | Şirkət Profili`,
        description: companyData.about_seo_description || companyData.seo_description || `${companyData.name} şirkəti haqqında məlumat və ətraflı təfərrüatlar.`,
        keywords: companyData.seo_keywords?.join(', ') || `${companyData.name}, şirkət, haqqında, Azərbaycan`,
        url: `/companies/${companyData.slug}`
      });
    } else {
      updatePageMeta({
        title: companyData.jobs_seo_title || `${companyData.name} - İş Elanları | Vakansiyalar`,
        description: companyData.jobs_seo_description || `${companyData.name} şirkətində aktiv vakansiyalar və iş elanları.`,
        keywords: companyData.seo_keywords?.join(', ') || `${companyData.name}, şirkət, vakansiya, iş elanları, Azərbaycan`,
        url: `/companies/${companyData.slug}/vacancies`
      });
    }
  };

  // Detect initial tab from URL and initialize SEO immediately
  useEffect(() => {
    if (!company) return;
    if (typeof window === 'undefined') return;

    const currentPath = window.location.pathname;
    const initialTab = currentPath.includes('/vacancies') ? 'jobs' as const : 'about' as const;
    setActiveTab(initialTab);

    // Set SEO immediately when company data is available
    updateSEO(company, initialTab);
  }, [company]);

  // Update SEO when tab changes
  useEffect(() => {
    if (company) {
      updateSEO(company, activeTab);
    }
  }, [activeTab]);

  return {
    activeTab,
    handleTabChange
  };
};