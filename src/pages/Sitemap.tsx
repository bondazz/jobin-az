import { useEffect, useState } from 'react';

const Sitemap = () => {
  const [sitemapContent, setSitemapContent] = useState<string>('');

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap');
        const xmlContent = await response.text();
        setSitemapContent(xmlContent);
        
        // Set proper content type for XML
        document.head.appendChild(Object.assign(document.createElement('meta'), {
          httpEquiv: 'Content-Type',
          content: 'application/xml; charset=utf-8'
        }));
      } catch (error) {
        console.error('Error fetching sitemap:', error);
      }
    };

    fetchSitemap();
  }, []);

  // Render raw XML content
  return (
    <div 
      style={{ 
        fontFamily: 'monospace', 
        whiteSpace: 'pre', 
        fontSize: '12px',
        padding: '20px',
        backgroundColor: '#f5f5f5'
      }}
      dangerouslySetInnerHTML={{ __html: sitemapContent }}
    />
  );
};

export default Sitemap;