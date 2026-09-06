# 🚀 Ən Asan Yol: Vercel (5 dəqiqə)

## Niyə Vercel?
✅ **Pulsuz** (unlimited bandwidth)
✅ **Avtomatik HTTPS**
✅ **CDN** (dünya üzrə sürətli)
✅ **Next.js üçün optimal**
✅ **Supabase ilə mükəmməl işləyir**
✅ **Custom domain dəstəyi** (jooble.az)
✅ **Heç bir server idarəçiliyi lazım deyil**

---

## 📝 ADDIM-ADDIM (5 dəqiqə)

### 1️⃣ Vercel Hesabı (30 saniyə)
1. [vercel.com/signup](https://vercel.com/signup) açın
2. "Continue with GitHub" klikləyin
3. GitHub hesabınızla daxil olun

### 2️⃣ Layihəni GitHub-a Yükləyin (2 dəqiqə)

Terminalda:
```bash
# Əgər git yoxdursa
git init
git add .
git commit -m "Deploy to Vercel"

# GitHub-da yeni repo yaradın: https://github.com/new
# Sonra:
git remote add origin https://github.com/USERNAME/jooble-az.git
git branch -M main
git push -u origin main
```

### 3️⃣ Vercel-də Import (1 dəqiqə)
1. Vercel dashboard: [vercel.com/new](https://vercel.com/new)
2. "Import Git Repository" → GitHub-dan repo seçin
3. **Framework Preset**: Next.js (avtomatik)
4. **Root Directory**: `./` (default)
5. "Deploy" klikləyin

### 4️⃣ Environment Variables (30 saniyə)
Deploy zamanı və ya sonra:
1. Project Settings → Environment Variables
2. Əlavə edin:
```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
```

**Supabase məlumatlarını tapmaq:**
- [supabase.com](https://supabase.com) → Project → Settings → API

### 5️⃣ Custom Domain (jooble.az) (1 dəqiqə)
1. Vercel: Settings → Domains → Add
2. `jooble.az` yazın
3. Namecheap-də DNS:
   - **A Record**: `@` → `76.76.21.21`
   - **CNAME**: `www` → `cname.vercel-dns.com`
4. 24 saat gözləyin (DNS propagation)

### 6️⃣ Supabase URL Yeniləyin (30 saniyə)
1. Supabase → Authentication → URL Configuration
2. **Site URL**: `https://jooble.az`
3. **Redirect URLs**: `https://jooble.az/**`

---

## ✅ HAZIR!

Saytınız işləyir: `https://jooble.az`

## 🔄 Gələcək Yeniləmələr

Hər dəfə GitHub-a push etdikdə avtomatik deploy olacaq:
```bash
git add .
git commit -m "Update"
git push
```

Vercel avtomatik build və deploy edəcək (2-3 dəqiqə).

---

## 📊 Namecheap vs Vercel

| Xüsusiyyət | Namecheap Shared | Vercel |
|------------|------------------|--------|
| Next.js dəstəyi | ❌ Yox | ✅ Tam |
| Qiymət | $2-5/ay | ✅ $0 (pulsuz) |
| SSL | Manual | ✅ Avtomatik |
| CDN | Yox | ✅ Qlobal |
| Deploy | Manual FTP | ✅ Git push |
| Supabase | ⚠️ Məhdud | ✅ Tam |

## 🎯 Nəticə

**Vercel istifadə edin** - ən asan, ən sürətli, ən etibarlı və pulsuz!

Namecheap-i yalnız domain üçün istifadə edin (DNS tənzimləmələri).
