# Namecheap Shared Hosting-ə Static Export

## ⚠️ XƏBƏRDARLIQ
Namecheap shared hosting Next.js server-side funksiyalarını dəstəkləmir.
Bu metod yalnız **static saytlar** üçün işləyir.

## İşləməyəcək Funksiyalar:
- Server-side rendering (SSR)
- API routes (`/api/*`)
- Dynamic routes (real-time data)
- Supabase server-side əməliyyatları

## İşləyəcək Funksiyalar:
- Client-side Supabase (browser-da)
- Static səhifələr
- Client-side routing

---

## Addım 1: next.config.js Yeniləyin

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static export aktivləşdir
  images: {
    unoptimized: true,  // Image optimization söndür
  },
  trailingSlash: true,  // URL-lərə / əlavə et
}

module.exports = nextConfig
```

## Addım 2: Build Edin

```bash
npm run build
```

Bu `out/` qovluğu yaradacaq (static HTML faylları).

## Addım 3: Namecheap-ə Yükləyin

### FTP ilə:
1. Namecheap cPanel → File Manager
2. `public_html` qovluğunu açın
3. `out/` qovluğundakı BÜTÜN faylları yükləyin
4. `.htaccess` faylı yaradın:

```apache
# .htaccess
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /$1.html [L]

# HTTPS redirect
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Addım 4: Environment Variables

Static export-da `.env` faylları işləməz. Bunun yerinə:

1. `next.config.js`-də hardcode edin (təhlükəsiz deyil):
```javascript
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://your-project.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your-anon-key',
  },
}
```

2. Və ya build zamanı inject edin:
```bash
NEXT_PUBLIC_SUPABASE_URL=xxx npm run build
```

## Addım 5: Test Edin

1. `https://jooble.az` açın
2. Yoxlayın:
   - ✅ Səhifələr açılır
   - ✅ Supabase login işləyir (client-side)
   - ❌ API routes işləmir
   - ❌ Server-side data fetching işləmir

---

## 🚨 Problem: Bu metod sizin layihə üçün UYĞUN DEYİL

Səbəb:
- Sizin layihədə çoxlu server-side funksiyalar var
- Dynamic routing var
- Real-time data fetching var

**Tövsiyə: Vercel və ya VPS istifadə edin.**
