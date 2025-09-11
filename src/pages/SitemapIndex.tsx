import { useEffect, useState } from 'react';

const SitemapIndex = () => {
  const [xmlContent, setXmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchXmlContent = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
        if (response.ok) {
          const xmlText = await response.text();
          setXmlContent(xmlText);
        }
      } catch (error) {
        console.error('XML yükləmə xətası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchXmlContent();
  }, []);

  useEffect(() => {
    if (xmlContent) {
      // HTML head-ə XML meta tag əlavə et
      const existingMeta = document.querySelector('meta[http-equiv="Content-Type"]');
      if (existingMeta) {
        existingMeta.remove();
      }
      
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Content-Type');
      meta.setAttribute('content', 'application/xml; charset=UTF-8');
      document.head.appendChild(meta);
    }
  }, [xmlContent]);

  if (loading) {
    return (
      <div style={{ 
        fontFamily: 'monospace', 
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh' 
      }}>
        Sitemap yüklənir...
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: 'monospace', 
      fontSize: '14px',
      padding: '0',
      margin: '0',
      backgroundColor: 'white',
      minHeight: '100vh',
      overflow: 'auto'
    }}>
      <pre style={{ 
        margin: '0', 
        padding: '20px',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        lineHeight: '1.4'
      }}>
        {xmlContent}
      </pre>
    </div>
  );
};

export default SitemapIndex;