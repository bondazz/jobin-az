import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  site_title?: string;
  site_description?: string;
  site_keywords?: string;
  logo_url?: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('key, value');

        if (error) {
          console.error('Error fetching site settings:', error);
          return;
        }

        const settingsObj: SiteSettings = {};
        data?.forEach((setting) => {
          if (setting.value) {
            settingsObj[setting.key as keyof SiteSettings] = 
              typeof setting.value === 'string' ? setting.value : String(setting.value);
          }
        });

        setSettings(settingsObj);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading };
};