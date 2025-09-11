import { useEffect, useState } from 'react';

const SitemapJooble = () => {
  const [sitemapContent, setSitemapContent] = useState('');

  useEffect(() => {
    // Completely remove all default styling and structure
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.background = 'white';
    document.body.style.fontFamily = 'monospace';
    document.body.style.fontSize = '11px';
    document.body.style.lineHeight = '1.2';
    
    // Remove any existing content type meta tags
    const existingMeta = document.querySelector('meta[http-equiv="Content-Type"]');
    if (existingMeta) existingMeta.remove();
    
    // Add XML content type
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', 'Content-Type');
    meta.setAttribute('content', 'application/xml; charset=utf-8');
    document.head.appendChild(meta);
    
    // Fetch sitemap content from the edge function - exact mirror
    const fetchSitemap = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
        const xmlText = await response.text();
        setSitemapContent(xmlText);
      } catch (error) {
        setSitemapContent('<?xml version="1.0" encoding="UTF-8"?>\n<!-- Error loading sitemap -->');
        console.error('Error fetching sitemap:', error);
      }
    };

    fetchSitemap();
    
    // Cleanup function
    return () => {
      document.querySelector('meta[http-equiv="Content-Type"]')?.remove();
    };
  }, []);

  // Render pure XML without any HTML wrapper - complete mirror effect
  if (!sitemapContent) {
    return null;
  }

  // Replace the entire page content with raw XML
  useEffect(() => {
    if (sitemapContent && sitemapContent.trim()) {
      // Clear everything and write pure XML
      document.open();
      document.write(sitemapContent);
      document.close();
    }
  }, [sitemapContent]);

  return null;
};

export default SitemapJooble;