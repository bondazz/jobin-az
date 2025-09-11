import { useEffect } from 'react';

const SitemapIndex = () => {
  useEffect(() => {
    const loadAndRenderXML = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
        if (response.ok) {
          const xmlContent = await response.text();
          
          // Browser pəncərəsini tamamilə XML məzmunu ilə əvəz et
          document.open('text/xml');
          document.write(xmlContent);
          document.close();
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