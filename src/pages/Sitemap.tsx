import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    const fetchAndDisplaySitemap = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap');
        const xmlContent = await response.text();
        
        // Replace the entire document with raw XML
        document.open();
        document.write(xmlContent);
        document.close();
      } catch (error) {
        console.error('Error fetching sitemap:', error);
        document.open();
        document.write(`<?xml version="1.0" encoding="UTF-8"?><error>Sitemap could not be loaded</error>`);
        document.close();
      }
    };

    fetchAndDisplaySitemap();
  }, []);

  // Return null since we're replacing the entire document
  return null;
};

export default Sitemap;