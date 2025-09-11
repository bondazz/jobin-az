import { useEffect } from 'react';

const SitemapJooble = () => {
  useEffect(() => {
    const loadAndRenderXML = async () => {
      try {
        // First try to use fetch (will be intercepted by SW if active)
        const response = await fetch('/sitemapjooble.xml', {
          headers: { 'Accept': 'application/xml' }
        });
        
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
        } else {
          // Fallback to direct edge function call
          const fallbackResponse = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
          if (fallbackResponse.ok) {
            const xmlContent = await fallbackResponse.text();
            document.open();
            document.write(xmlContent);
            document.close();
          }
        }
      } catch (error) {
        console.error('XML yükləmə xətası:', error);
        // Yönləndirmə et əgər xəta varsa
        window.location.href = 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml';
      }
    };

    // Immediate load
    loadAndRenderXML();
  }, []);

  return null;
};

export default SitemapJooble;