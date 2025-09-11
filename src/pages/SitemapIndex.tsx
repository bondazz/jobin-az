const SitemapIndex = () => {
  // Component yüklənən kimi XML məzmununu əldə et və document-i əvəz et
  fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml')
    .then(response => response.text())
    .then(xmlContent => {
      // Bütün HTML strukturunu təmizləyib XML ilə əvəz et
      document.documentElement.innerHTML = '';
      
      // XML content type təyin et
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');
      
      // Document-i tamamilə XML ilə əvəz et
      document.open('text/xml');
      document.write(xmlContent);
      document.close();
    })
    .catch(error => {
      console.error('XML yükləmə xətası:', error);
      document.open('text/xml');
      document.write('<?xml version="1.0" encoding="UTF-8"?><error>Sitemap yüklənmədi</error>');
      document.close();
    });

  return null;
};

export default SitemapIndex;