import { useEffect } from 'react';

const SitemapIndex = () => {
  useEffect(() => {
    const fetchSitemapContent = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
        
        if (response.ok) {
          const xmlText = await response.text();
          
          // Document-i tamamilə XML ilə əvəz et və düzgün content type təyin et
          document.open();
          document.write(xmlText);
          document.close();
          
          // Content type-ı XML olaraq təyin et
          const meta = document.createElement('meta');
          meta.httpEquiv = 'Content-Type';
          meta.content = 'application/xml; charset=UTF-8';
          document.head.appendChild(meta);
          
        } else {
          // Xəta halında fallback XML
          const errorXml = '<?xml version="1.0" encoding="UTF-8"?><error>XML sitemap yüklənə bilmədi</error>';
          document.open();
          document.write(errorXml);
          document.close();
        }
      } catch (error) {
        console.error('XML yükləmə xətası:', error);
        const errorXml = '<?xml version="1.0" encoding="UTF-8"?><error>XML sitemap yüklənə bilmədi</error>';
        document.open();
        document.write(errorXml);
        document.close();
      }
    };

    fetchSitemapContent();
  }, []);

  return null;
};

export default SitemapIndex;