import { useEffect, useState } from 'react';

const SitemapIndex = () => {
  useEffect(() => {
    const fetchSitemapContent = async () => {
      try {
        // Edge function-dan XML məzmununu tam şəkildə al
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
        
        if (response.ok) {
          const xmlText = await response.text();
          
          // Browser-ın document-ini XML ilə əvəzlə
          document.open();
          document.write(xmlText);
          document.close();
          
          // Content-Type header-i XML-ə dəyiş
          const meta = document.createElement('meta');
          meta.setAttribute('http-equiv', 'Content-Type');
          meta.setAttribute('content', 'application/xml; charset=utf-8');
          document.head.appendChild(meta);
        } else {
          // Error halında redirect et
          window.location.href = 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml';
        }
      } catch (error) {
        console.error('Sitemap yükləmə xətası:', error);
        // Error halında redirect et
        window.location.href = 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml';
      }
    };

    fetchSitemapContent();
  }, []);

  // Loading göstərici
  return (
    <div style={{ 
      fontFamily: 'monospace', 
      padding: '20px',
      background: 'white',
      color: 'black',
      textAlign: 'center'
    }}>
      XML Sitemap yüklənir...
    </div>
  );
};

export default SitemapIndex;