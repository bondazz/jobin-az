import { useEffect } from 'react';

const SitemapIndex = () => {
  useEffect(() => {
    const loadXMLContent = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
        if (response.ok) {
          const xmlText = await response.text();
          
          // Bütün HTML məzmununu təmizləyib XML ilə əvəz et
          document.open('application/xml', 'replace');
          document.write(xmlText);
          document.close();
          
        } else {
          // Xəta halında fallback
          const errorXml = '<?xml version="1.0" encoding="UTF-8"?>\n<error>Sitemap yüklənə bilmədi</error>';
          document.open('application/xml', 'replace');
          document.write(errorXml);
          document.close();
        }
      } catch (error) {
        console.error('XML yükləmə xətası:', error);
        const errorXml = '<?xml version="1.0" encoding="UTF-8"?>\n<error>Sitemap yüklənə bilmədi</error>';
        document.open('application/xml', 'replace');
        document.write(errorXml);
        document.close();
      }
    };

    loadXMLContent();
  }, []);

  // Yükləmə zamanı boş return
  return null;
};

export default SitemapIndex;