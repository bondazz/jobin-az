module.exports = {
  // Prerender ediləcək route-lar
  include: [
    "/",
    "/vacancies",
    "/aktiv-vakansiya",
    "/categories",
    "/companies",
    "/about",
    "/pricing",
    "/cv-builder",
    "/saved-jobs"
  ],
  
  // Puppeteer ayarları
  puppeteerArgs: [
    "--no-sandbox",
    "--disable-setuid-sandbox"
  ],
  
  // SEO üçün vacib ayarlar
  minifyHtml: {
    collapseWhitespace: true,
    removeComments: true,
    removeAttributeQuotes: false,
    keepClosingSlash: true,
    minifyJS: true,
    minifyCSS: true
  },
  
  // Inline CSS - ilk yüklənmə sürətini artırır
  inlineCss: true,
  
  // Viewport ayarları
  viewport: {
    width: 1920,
    height: 1080
  },
  
  // Crawl strategy
  crawl: true,
  
  // Timeout ayarları
  waitFor: 2000,
  
  // User agent
  userAgent: "ReactSnap",
  
  // Skip third party requests
  skipThirdPartyRequests: true,
  
  // Cache control
  cacheAjaxRequests: false,
  
  // Remove script tags after prerendering (optional)
  removeStyleTags: false,
  removeScriptTags: false,
  
  // Async script tags
  asyncScriptTags: true,
  
  // Preload resources
  preloadResources: true
};
