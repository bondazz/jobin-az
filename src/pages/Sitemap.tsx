import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    // Redirect to the sitemap XML endpoint
    window.location.replace('https://jooble.az/sitemap.xml');
  }, []);

  return null;
};

export default Sitemap;