import { useEffect, useState } from 'react';

const Sitemap = () => {
  const [xmlContent, setXmlContent] = useState<string>('');

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xml = await response.text();
        setXmlContent(xml);
        
        // Set document content type to XML
        document.title = 'Sitemap';
      } catch (error) {
        console.error('Error fetching sitemap:', error);
        // Fallback XML sitemap
        const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://jooble.az</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
        setXmlContent(fallbackXml);
      }
    };

    fetchSitemap();
  }, []);

  // Return XML content as plain text
  return (
    <pre
      style={{
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: '1.4',
        margin: 0,
        padding: '10px',
        backgroundColor: '#f8f8f8',
        border: 'none',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word'
      }}
      dangerouslySetInnerHTML={{ __html: xmlContent }}
    />
  );
};

export default Sitemap;