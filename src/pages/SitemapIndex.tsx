import { useEffect } from 'react';

const SitemapIndex = () => {
  useEffect(() => {
    const loadXMLContent = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
        if (response.ok) {
          const xmlText = await response.text();
          
          // Document-i tamamilə XML məzmunu ilə əvəz et
          document.open();
          document.write(xmlText);
          document.close();
          
          // Content-Type-ı XML olaraq təyin et
          const metaElement = document.querySelector('meta[http-equiv="Content-Type"]');
          if (metaElement) {
            metaElement.remove();
          }
          
          const newMeta = document.createElement('meta');
          newMeta.setAttribute('http-equiv', 'Content-Type');
          newMeta.setAttribute('content', 'application/xml; charset=UTF-8');
          document.head.appendChild(newMeta);
        }
      } catch (error) {
        console.error('XML yükləmə xətası:', error);
      }
    };

    loadXMLContent();
  }, []);

  // Yükləmə zamanı boş səhifə göstər
  return null;
};

export default SitemapIndex;