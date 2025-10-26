module.exports = {
  // Prerender ediləcək route-lar - sadə statik səhifələr
  include: [
    "/",
    "/about",
    "/cv-builder",
    "/services"
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
  
  // Timeout ayarları - artırılıb
  waitFor: 5000,
  
  // User agent
  userAgent: "ReactSnap",
  
  // Skip third party requests - Supabase və s.
  skipThirdPartyRequests: true,
  
  // Cache control
  cacheAjaxRequests: false,
  
  // Remove script tags after prerendering (optional)
  removeStyleTags: false,
  removeScriptTags: false,
  
  // Async script tags
  asyncScriptTags: true,
  
  // Preload resources
  preloadResources: true,
  
  // Ignore errors during prerendering
  ignoreForPrerender: [
    'service-worker.js',
    'sw.js'
  ],
  
  // Prevent crashes
  publicPath: "/",
  
  // Handle errors gracefully
  puppeteerExecutablePath: undefined,
  
  // Don't fail on errors
  failOnError: false
};
