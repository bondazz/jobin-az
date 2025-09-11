import { useEffect, useState } from 'react';

const SitemapJooble = () => {
  const [sitemapContent, setSitemapContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ urls: 0, jobs: 0, categories: 0, companies: 0 });

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        console.log('Fetching sitemap from edge function...');
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlText = await response.text();
        console.log('Received XML length:', xmlText.length);
        
        // Count URLs for verification
        const urlMatches = xmlText.match(/<url>/g);
        const urlCount = urlMatches ? urlMatches.length : 0;
        
        // Count different types of URLs
        const jobMatches = xmlText.match(/\/vacancies\//g);
        const categoryMatches = xmlText.match(/\/categories\//g);
        const companyMatches = xmlText.match(/\/companies\//g);
        
        setStats({
          urls: urlCount,
          jobs: jobMatches ? jobMatches.length : 0,
          categories: categoryMatches ? categoryMatches.length : 0,
          companies: companyMatches ? companyMatches.length : 0
        });
        
        console.log('URL stats:', {
          total: urlCount,
          jobs: jobMatches ? jobMatches.length : 0,
          categories: categoryMatches ? categoryMatches.length : 0,
          companies: companyMatches ? companyMatches.length : 0
        });
        
        setSitemapContent(xmlText);
        setIsLoading(false);
        
      } catch (error) {
        console.error('Error fetching sitemap:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchSitemap();
  }, []);

  if (isLoading) {
    return (
      <div style={{ fontFamily: 'monospace', padding: '20px' }}>
        Loading sitemap from edge function...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ fontFamily: 'monospace', padding: '20px', color: 'red' }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      {/* Debug info - remove this after verification */}
      <div style={{ 
        fontFamily: 'monospace', 
        background: '#f0f0f0', 
        padding: '10px', 
        borderBottom: '1px solid #ccc',
        fontSize: '12px'
      }}>
        Stats: {stats.urls} total URLs | {stats.jobs} job URLs | {stats.categories} category URLs | {stats.companies} company URLs
      </div>
      
      <pre style={{
        margin: 0,
        padding: 0,
        fontFamily: 'monospace',
        fontSize: '11px',
        lineHeight: '1.3',
        whiteSpace: 'pre',
        backgroundColor: 'white',
        color: 'black',
        width: '100%',
        overflow: 'auto'
      }}>
        {sitemapContent}
      </pre>
    </div>
  );
};

export default SitemapJooble;