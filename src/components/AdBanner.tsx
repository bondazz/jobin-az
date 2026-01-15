"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Advertisement {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  position: string;
  is_active: boolean;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
  click_count: number;
}

interface AdBannerProps {
  position: string;
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ position, className = "" }) => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Debounce ad loading for better performance
    const timer = setTimeout(() => {
      fetchAdvertisements();
    }, 100);
    return () => clearTimeout(timer);
  }, [position]);

  const fetchAdvertisements = async () => {
    // Override for "İş Elanları Arası" (job_listing) - Static Whatsapp Ad
    if (position === 'job_listing') {
      const staticAd: Advertisement = {
        id: 'whatsapp-static-ad',
        title: 'Vakansiyalar Birbaşa WhatsApp-da!',
        description: null,
        image_url: '/ads/whatsapp-banner.jpg',
        link_url: 'https://whatsapp.com/channel/0029VaeF3TiEFeXnngZS222D',
        position: 'job_listing',
        is_active: true,
        display_order: 1,
        start_date: null,
        end_date: null,
        click_count: 0
      };
      setAdvertisements([staticAd]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('position', position)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setAdvertisements(data || []);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdClick = async (ad: Advertisement) => {
    try {
      // Increment click count - skip for static ads to avoid Supabase errors if disconnected
      if (ad.id !== 'whatsapp-static-ad') {
        await supabase.rpc('increment_ad_clicks', { ad_id: ad.id });
      }

      // Open link if provided
      if (ad.link_url) {
        window.open(ad.link_url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  if (loading || advertisements.length === 0) {
    return null;
  }

  return (
    <div className={`relative z-10 space-y-4 ${className}`}>
      {advertisements.map((ad) => (
        <div key={ad.id} className={`w-full ${position === 'job_listing' ? 'h-[60px]' : ''}`}>
          {ad.link_url ? (
            <button
              onClick={() => handleAdClick(ad)}
              className={`w-full block hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg ${position === 'job_listing' ? 'h-full' : ''}`}
              aria-label={`Reklam: ${ad.title}`}
            >
              <img
                src={ad.image_url}
                alt={ad.title}
                className={`w-full rounded-lg shadow-sm hover:shadow-md transition-shadow ${position === 'job_details' ? 'max-w-[400px] max-h-[400px] mx-auto object-contain' : ''} ${position === 'job_listing' ? 'h-full object-cover' : 'h-auto'}`}
                loading={position === 'header' || position === 'job_details' ? 'eager' : 'lazy'}
                fetchPriority={position === 'header' ? 'high' : 'auto'}
                decoding="async"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                width="600"
                height="300"
              />
            </button>
          ) : (
            <div className={`w-full ${position === 'job_listing' ? 'h-full' : ''}`}>
              <img
                src={ad.image_url}
                alt={ad.title}
                className={`w-full rounded-lg shadow-sm ${position === 'job_details' ? 'max-w-[400px] max-h-[400px] mx-auto object-contain' : ''} ${position === 'job_listing' ? 'h-full object-cover' : 'h-auto'}`}
                loading={position === 'header' || position === 'job_details' ? 'eager' : 'lazy'}
                fetchPriority={position === 'header' ? 'high' : 'auto'}
                decoding="async"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                width="600"
                height="300"
              />
            </div>
          )}

          {ad.description && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {ad.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdBanner;