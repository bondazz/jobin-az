import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    const fetchAndDisplaySitemap = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlContent = await response.text();
        
        // Replace the entire document with raw XML
        document.open();
        document.write(xmlContent);
        document.close();
      } catch (error) {
        console.error('Error fetching sitemap:', error);
        document.open();
        document.write(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://jooble.az</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
        document.close();
      }
    };

    fetchAndDisplaySitemap();
  }, []);

  // Return null since we're replacing the entire document
  return null;
};

export default Sitemap;