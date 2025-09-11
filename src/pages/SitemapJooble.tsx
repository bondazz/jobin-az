import { useEffect, useState } from 'react';

const SitemapJooble = () => {
  const [sitemapContent, setSitemapContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchFullSitemap = async () => {
      try {
        console.log('Starting full sitemap fetch...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 saniye timeout
        
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml', {
          method: 'GET',
          headers: {
            'Accept': 'application/xml, text/xml, */*',
            'Cache-Control': 'no-cache'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const xmlText = await response.text();
        console.log(`Sitemap loaded: ${xmlText.length} characters`);
        
        if (isMounted) {
          setSitemapContent(xmlText);
          setLoading(false);
          
          // Browser-ı XML kimi tanıt
          document.documentElement.innerHTML = `<head><meta http-equiv="Content-Type" content="application/xml; charset=utf-8" /></head><body><pre>${xmlText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body>`;
        }
        
      } catch (error) {
        console.error('Sitemap fetch error:', error);
        if (isMounted) {
          // Error halında da birbaşa yönləndir
          window.location.href = 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml';
        }
      }
    };

    fetchFullSitemap();
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ 
        fontFamily: 'monospace', 
        padding: '20px',
        background: 'white',
        color: 'black'
      }}>
        Sitemap yüklənir... (Bu 30 saniye çəkə bilər)
      </div>
    );
  }

  return null; // Content document.documentElement.innerHTML ilə əvəz edilir
};

export default SitemapJooble;