import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Component to handle canonical URL redirects
const CanonicalRedirect = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Define canonical redirects to avoid duplicate content
    const redirectMap: { [key: string]: string } = {
      '/vacancies': '/',
      '/bildirisler': '/'
    };

    // If current path needs to be redirected to canonical URL
    if (redirectMap[currentPath]) {
      const canonicalPath = redirectMap[currentPath];
      const searchParams = location.search;
      
      // Preserve query parameters and redirect to canonical URL
      navigate(`${canonicalPath}${searchParams}`, { 
        replace: true 
      });
      return;
    }
  }, [location.pathname, location.search, navigate]);

  return <>{children}</>;
};

export default CanonicalRedirect;