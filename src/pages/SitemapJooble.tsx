import { useEffect, useState } from 'react';

const SitemapJooble = () => {
  const [sitemapContent, setSitemapContent] = useState('');

  useEffect(() => {
    // Set the content type to XML and hide default HTML structure
    document.querySelector('html')?.setAttribute('data-content-type', 'application/xml');
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.fontFamily = 'monospace';
    document.body.style.fontSize = '12px';
    document.body.style.backgroundColor = 'white';
    
    // Fetch sitemap content from the edge function
    const fetchSitemap = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
        const xmlText = await response.text();
        setSitemapContent(xmlText);
        
        // Set content type header if possible
        if (response.headers.get('content-type')) {
          document.querySelector('meta[http-equiv="Content-Type"]')?.remove();
          const meta = document.createElement('meta');
          meta.setAttribute('http-equiv', 'Content-Type');
          meta.setAttribute('content', 'application/xml; charset=utf-8');
          document.head.appendChild(meta);
        }
      } catch (error) {
        setSitemapContent('<?xml version="1.0" encoding="UTF-8"?>\n<!-- Error loading sitemap -->');
        console.error('Error fetching sitemap:', error);
      }
    };

    fetchSitemap();
    
    // Return a cleanup function
    return () => {
      document.querySelector('html')?.removeAttribute('data-content-type');
      document.querySelector('meta[http-equiv="Content-Type"]')?.remove();
    };
  }, []);

  // Return raw XML content without any wrapper
  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        whiteSpace: 'pre',
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: '1.2'
      }}
      dangerouslySetInnerHTML={{ __html: sitemapContent }}
    />
  );
};

export default SitemapJooble;