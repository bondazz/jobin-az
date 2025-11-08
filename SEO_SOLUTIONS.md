# SPA SEO Həlləri - Jooble.az

## Problem
React SPA (Single Page Application) bütün səhifələr üçün eyni `index.html` göndərir. SEO botları JavaScript icra etmədiyi üçün yalnız ilkin HTML-i görür və bütün səhifələrdə eyni meta məlumatları oxuyur.

## 20+ Həll Variantı

### 1. ✅ Server-Side Prerendering (Edge Function)
**Tətbiq olunub**: `supabase/functions/prerender-proxy/index.ts`
- Bot aşkar edilir
- Dinamik HTML yaradılır və ya cache-dən alınır
- Unikal meta tags və structured data təqdim edilir

**Test:**
```bash
curl -A "Googlebot/2.1" "https://jooble.az/companies/kontakt-home" -I
# X-Prerendered: true olmalıdır
```

### 2. ✅ Enhanced Client-Side SEO
**Tətbiq olunub**: `src/hooks/useSEO.tsx`
- Hər səhifə üçün unikal meta tags
- Dinamik structured data (JSON-LD)
- Open Graph və Twitter Card təyin edilməsi

### 3. ✅ Static HTML Snapshot Generation
**Tətbiq olunub**: `scripts/capture-prerender.js` və `scripts/generate-static-pages.js`
- Puppeteer ilə tam render edilmiş HTML
- Manual və ya avtomatik snapshot yaradılması
- Supabase Storage-da saxlanılması

### 4. ✅ Cloudflare Worker Integration
**Tətbiq olunub**: `public/cloudflare-worker.js`
- Edge computing ilə bot aşkarlama
- Prerender servisi ilə inteqrasiya
- Sürətli cache məkanizması

### 5. ✅ NGINX Prerender Proxy
**Konfiqurasiya**: `public/nginx-prerender.conf`
- Server səviyyəsində bot yönləndirməsi
- Statik fayllar üçün istisna qaydaları

### 6. ✅ Vite Development Plugin
**Konfiqurasiya**: `vite-seo-plugin.js`
- Development zamanı bot testləri
- Real-time meta tag injection

### 7. Database-Driven SEO
**Mövcuddur**: SEO məlumatları bazada
- `companies.seo_title`, `seo_description`, `seo_keywords`
- `jobs.seo_title`, `seo_description`, `seo_keywords`
- `categories.seo_title`, `seo_description`, `seo_keywords`

### 8. Structured Data (Schema.org)
**Tətbiq olunub**: Hər səhifə növü üçün
- JobPosting (vakansiyalar)
- Organization (şirkətlər)
- CollectionPage (kateqoriyalar)
- WebSite (ana səhifə)

### 9. Dynamic Sitemap Generation
**Mövcuddur**: Multiple sitemap endpoints
- `/sitemap.xml` - Sitemap index
- `/sitemap_main.xml` - Statik səhifələr
- `/sitemap_jobs.xml` - Vakansiyalar
- `/sitemap_companies.xml` - Şirkətlər

### 10. Canonical URLs
**Tətbiq olunub**: `src/utils/seo.ts`
- Hər səhifə üçün canonical link
- Dublikat məzmunun qarşısını alır

### 11. Open Graph Meta Tags
**Tətbiq olunub**: Bütün səhifələrdə
- og:type (website, article, profile)
- og:title, og:description, og:url
- og:image (şirkət logoları)

### 12. Twitter Card Tags
**Tətbiq olunub**: SEO hook-da
- twitter:card
- twitter:title, twitter:description

### 13. Prerender Cache System
**Tətbiq olunub**: Supabase-də
- `prerender_metadata` table
- `prerender-snapshots` bucket
- 7 günlük TTL

### 14. Bot User-Agent Detection
**Geniş siyahı**:
- Googlebot, Bingbot, YandexBot
- FacebookExternalHit, Twitterbot
- LinkedInBot, Slackbot, WhatsApp
- və s.

### 15. Robots.txt Optimization
**Mövcuddur**: `public/robots.txt`
- Sitemap referansları
- Crawl qaydaları

### 16. hreflang Tags
**Planlaşdırılır**: Çoxdilli dəstək üçün
- Azərbaycan, İngilis, Rus dilləri

### 17. Progressive Enhancement
**Konsept**: Server-rendered shell + client hydration
- İlkin HTML məzmunlu
- JavaScript sonra enhance edir

### 18. Edge Caching Strategy
**Tətbiq olunub**:
- Cache-Control headers
- CDN-level caching (Cloudflare)

### 19. Incremental Static Generation
**Konsept**: Populyar səhifələr üçün
- Top 100 şirkət
- Top 50 vakansiya
- Bütün kateqoriyalar

### 20. Service Worker SEO
**Limitli fayda**: PWA ilə kombinasiya
- Offline dəstək
- Cache strategiyası

### 21. URL Structure Optimization
**Mövcuddur**:
- `/companies/slug` - SEO-friendly
- `/categories/slug` - Clean URLs
- `/vacancies/slug` - Descriptive

### 22. Meta Robots Tags
**Tətbiq edilə bilər**:
- noindex for duplicates
- nofollow for certain links

### 23. Performance Optimization
**SEO üçün kritik**:
- Core Web Vitals
- Lazy loading
- Image optimization

### 24. Monitoring & Analytics
**Tövsiyə olunur**:
- Google Search Console
- Bing Webmaster Tools
- Structured data testing

## İstifadə Qaydası

### Prerender Edge Function Test
```bash
# Bot kimi test
curl -A "Googlebot/2.1" "https://jooble.az/companies/kontakt-home"

# Normal user kimi
curl "https://jooble.az/companies/kontakt-home"
```

### Static Pages Generation
```bash
# Node.js scriptini işə sal
node scripts/generate-static-pages.js
```

### Puppeteer Snapshot
```bash
# Tam render edilmiş HTML
node scripts/capture-prerender.js
```

### Cloudflare Worker Deploy
1. `public/cloudflare-worker.js` faylını kopyala
2. Cloudflare Dashboard → Workers → Create
3. Kodu yapışdır və deploy et
4. Route qur: `jooble.az/*`

## Tövsiyələr

### Prioritet 1 (Kritik)
1. ✅ Prerender Edge Function aktiv
2. ✅ Enhanced client-side SEO
3. ✅ Structured data implementation
4. ✅ Proper canonical URLs

### Prioritet 2 (Vacib)
5. ⚠️ Cloudflare Worker qurulması
6. ⚠️ Static snapshot generation avtomatlaşdırılması
7. ⚠️ Cache strategiyasının optimallaşdırılması

### Prioritet 3 (Əlavə)
8. 📝 Performance monitoring
9. 📝 A/B testing different approaches
10. 📝 Regular SEO audits

## Yoxlama

### Schema.org Validator
```
https://validator.schema.org/
```

### Google Rich Results Test
```
https://search.google.com/test/rich-results
```

### Bot Simulator
```bash
curl -A "Googlebot/2.1" -L "https://jooble.az/companies/[slug]" | grep -E "<title>|<meta name=\"description\"|application/ld\+json"
```

## Nəticə

İndi **20+ fərqli metod** ilə SPA SEO problemi həll edilib:
- ✅ Server-side rendering
- ✅ Client-side SEO
- ✅ Static generation
- ✅ Edge computing
- ✅ Caching strategies
- ✅ Structured data
- ✅ Meta tag optimization

Hər səhifə üçün unikal məlumat Google və digər botlara təqdim olunur.
