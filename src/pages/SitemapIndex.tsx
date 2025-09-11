import { useEffect, useState } from 'react';

const SitemapIndex = () => {
  const [xmlContent, setXmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSitemapContent = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
        
        if (response.ok) {
          const xmlText = await response.text();
          setXmlContent(xmlText);
          
          // Document-i XML kimi göstər
          document.open();
          document.write(xmlText);
          document.close();
        } else {
          throw new Error('XML yüklənə bilmədi');
        }
      } catch (error) {
        console.error('XML yükləmə xətası:', error);
        setXmlContent('<?xml version="1.0" encoding="UTF-8"?><error>XML sitemap yüklənə bilmədi</error>');
      } finally {
        setLoading(false);
      }
    };

    fetchSitemapContent();
  }, []);

  // XML məzmunu yüklənərkən
  if (loading) {
    return null; // Yükləmə zamanı heç nə göstərmə
  }

  return null; // XML document.write ilə göstərilir
};

export default SitemapIndex;