import { useEffect } from 'react';

const SitemapIndex = () => {
  useEffect(() => {
    const loadAndRenderXML = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
        if (response.ok) {
          const xmlContent = await response.text();
          
          // XML content-i birbaşa browser-a göstər
          document.open();
          document.write(xmlContent);
          document.close();
          
          // Content-Type-ı XML olaraq təyin et
          if (document.contentType !== 'application/xml') {
            const newResponse = new Response(xmlContent, {
              headers: { 'Content-Type': 'application/xml; charset=utf-8' }
            });
          }
        }
      } catch (error) {
        console.error('XML yükləmə xətası:', error);
        // Yönləndirmə et əgər xəta varsa
        window.location.href = 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml';
      }
    };

    // Kiçik gecikmə ilə XML-i yüklə ki, React tam render olsun
    setTimeout(loadAndRenderXML, 100);
  }, []);

  return null;
};

export default SitemapIndex;