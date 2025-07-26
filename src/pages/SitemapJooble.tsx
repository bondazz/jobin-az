import { useEffect, useState } from 'react';

const SitemapJooble = () => {
  const [sitemapContent, setSitemapContent] = useState('Loading sitemap...');

  useEffect(() => {
    // Set the content type to XML
    document.querySelector('html')?.setAttribute('data-content-type', 'application/xml');
    
    // Fetch sitemap content from the edge function
    const fetchSitemap = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
        const xmlText = await response.text();
        setSitemapContent(xmlText);
      } catch (error) {
        setSitemapContent('Error loading sitemap');
        console.error('Error fetching sitemap:', error);
      }
    };

    fetchSitemap();
    
    // Return a cleanup function to reset the content type
    return () => {
      document.querySelector('html')?.removeAttribute('data-content-type');
    };
  }, []);

  return (
    <pre style={{
      fontFamily: 'monospace',
      fontSize: '14px',
      whiteSpace: 'pre-wrap',
      margin: 0,
      padding: '20px',
      backgroundColor: '#f5f5f5',
      color: '#333'
    }}>
      {sitemapContent}
    </pre>
  );
};

export default SitemapJooble;