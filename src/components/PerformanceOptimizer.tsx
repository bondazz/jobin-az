import { memo } from 'react';

// Performance optimization component to preload critical resources
const PerformanceOptimizer = memo(() => {
  return (
    <>
      {/* Preload critical fonts */}
      <link 
        rel="preload" 
        href="/fonts/saira-v2-latin-300.woff2" 
        as="font" 
        type="font/woff2" 
        crossOrigin="" 
      />
      
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