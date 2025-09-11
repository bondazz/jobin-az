import { useEffect, useState } from 'react';

const SitemapJooble = () => {
  const [xmlContent, setXmlContent] = useState<string>('');

  useEffect(() => {
    const fetchAndDisplayXml = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml', {
          method: 'GET',
          headers: {
            'Accept': 'application/xml',
          }
        });

        if (response.ok) {
          const xmlText = await response.text();
          setXmlContent(xmlText);
          
          // XML content-i birbaşa browser-a göstər
          document.open();
          document.write(xmlText);
          document.close();
          
          // Content-Type-ı XML olaraq təyin et
          if (document.contentType !== 'application/xml') {
            const newResponse = new Response(xmlText, {
              headers: { 'Content-Type': 'application/xml; charset=utf-8' }
            });
          }
        }
      } catch (error) {
        console.error('XML fetch error:', error);
        // Error halında redirect et
        window.location.href = 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml';
      }
    };

    fetchAndDisplayXml();
  }, []);

  return null;
};

export default SitemapJooble;