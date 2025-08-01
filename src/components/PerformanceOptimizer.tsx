import { memo } from 'react';

// Performance optimization component to preload critical resources
const PerformanceOptimizer = memo(() => {
  return (
    <>
      {/* DNS prefetch for Google Fonts */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      
      {/* DNS prefetch for external resources */}
      <link rel="dns-prefetch" href="//igrtzfvphltnoiwedbtz.supabase.co" />
      
      {/* Preconnect to critical origins */}
      <link rel="preconnect" href="https://igrtzfvphltnoiwedbtz.supabase.co" />
      
      {/* Resource hints for better loading */}
      <meta httpEquiv="x-dns-prefetch-control" content="on" />
    </>
  );
});

export default PerformanceOptimizer;