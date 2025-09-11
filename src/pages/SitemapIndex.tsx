import { useEffect, useState } from 'react';

const SitemapIndex = () => {
  const [xmlContent, setXmlContent] = useState<string>('');

  useEffect(() => {
    const loadSitemap = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
        if (response.ok) {
          const xml = await response.text();
          setXmlContent(xml);
          
          // Document type-ını XML olaraq təyin et
          const htmlElement = document.documentElement;
          const head = document.head;
          const body = document.body;
          
          // Bütün HTML-i təmizlə və XML məzmunu yaz
          htmlElement.innerHTML = '';
          document.open();
          document.write(xml);
          document.close();
        }
      } catch (error) {
        console.error('Sitemap yüklənə bilmədi:', error);
        const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://jooble.az/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
        
        document.open();
        document.write(fallbackXml);
        document.close();
      }
    };

    loadSitemap();
  }, []);

  // XML yükləmə prosesi zamanı heçnə göstərmə
  return null;
};

export default SitemapIndex;