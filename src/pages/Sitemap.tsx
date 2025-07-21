import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    const loadSitemap = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap', {
          headers: {
            'Accept': 'application/xml',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlContent = await response.text();
        
        // Set document to XML mode
        document.open();
        document.write(xmlContent);
        document.close();
        
      } catch (error) {
        console.error('Error loading sitemap:', error);
        
        // Fallback XML content
        const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://jooble.az</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://jooble.az/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jooble.az/categories</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jooble.az/companies</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jooble.az/pricing</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
        
        document.open();
        document.write(fallbackXml);
        document.close();
      }
    };

    loadSitemap();
  }, []);

  return null;
};

export default Sitemap;