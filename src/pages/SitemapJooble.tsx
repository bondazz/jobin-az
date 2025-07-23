import { useEffect } from 'react';

const SitemapJooble = () => {
  useEffect(() => {
    // Set the content type to XML
    document.querySelector('html')?.setAttribute('data-content-type', 'application/xml');
    
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
{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Copy-paste sitemap URLs here -->
</urlset>`}
    </pre>
  );
};

export default SitemapJooble;