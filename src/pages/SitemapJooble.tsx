import { useEffect, useState } from 'react';

const SitemapJooble = () => {
  const [sitemapContent, setSitemapContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set document to XML mode
    document.documentElement.setAttribute('data-xml-content', 'true');
    
    const fetchSitemap = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
        const xmlText = await response.text();
        setSitemapContent(xmlText);
        setIsLoading(false);
        
        // Set proper content-type
        const meta = document.createElement('meta');
        meta.setAttribute('http-equiv', 'Content-Type');
        meta.setAttribute('content', 'application/xml; charset=utf-8');
        document.head.appendChild(meta);
        
      } catch (error) {
        console.error('Error fetching sitemap:', error);
        setSitemapContent('<?xml version="1.0" encoding="UTF-8"?>\n<error>Failed to load sitemap</error>');
        setIsLoading(false);
      }
    };

    fetchSitemap();
    
    return () => {
      document.documentElement.removeAttribute('data-xml-content');
      document.querySelector('meta[http-equiv="Content-Type"]')?.remove();
    };
  }, []);

  // Show loading or raw XML content
  if (isLoading) {
    return <div style={{ fontFamily: 'monospace', padding: '20px' }}>Loading sitemap...</div>;
  }

  // Return the exact XML content as the edge function would
  return (
    <pre style={{
      margin: 0,
      padding: 0,
      fontFamily: 'monospace',
      fontSize: '12px',
      lineHeight: '1.4',
      whiteSpace: 'pre',
      backgroundColor: 'white',
      color: 'black',
      border: 'none',
      outline: 'none',
      width: '100%',
      height: '100vh',
      overflow: 'auto'
    }}>
      {sitemapContent}
    </pre>
  );
};

export default SitemapJooble;