# Vercel-ə Deploy Etmək

## Addım 1: Vercel Hesabı Yaradın
1. [vercel.com](https://vercel.com) saytına daxil olun
2. GitHub hesabınızla qeydiyyatdan keçin (pulsuz)

## Addım 2: Layihəni GitHub-a Yükləyin
```bash
# Git repository yaradın (əgər yoxdursa)
git init
git add .
git commit -m "Initial commit"

# GitHub-da yeni repository yaradın və push edin
git remote add origin https://github.com/USERNAME/jooble-az.git
git branch -M main
git push -u origin main
```

## Addım 3: Vercel-də Import Edin
1. Vercel dashboard-da "Add New Project" klikləyin
2. GitHub repository-ni seçin
3. Framework: **Next.js** (avtomatik detect olunacaq)
4. Root Directory: `./` (default)

## Addım 4: Environment Variables Əlavə Edin
Vercel-də "Environment Variables" bölməsinə keçin və əlavə edin:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Supabase məlumatlarını tapmaq:**
1. [supabase.com](https://supabase.com) → Project Settings
2. API → Project URL və anon/public key

## Addım 5: Deploy
1. "Deploy" düyməsinə klikləyin
2. 2-3 dəqiqə gözləyin
3. Hazır! URL: `https://your-project.vercel.app`

## Addım 6: Custom Domain (Namecheap)
1. Vercel-də: Settings → Domains → Add Domain
2. Domain daxil edin: `jooble.az`
3. Namecheap-də DNS tənzimləmələri:
   - A Record: `76.76.21.21` (Vercel IP)
   - CNAME: `www` → `cname.vercel-dns.com`
4. 24 saat gözləyin (DNS propagation)

## Addım 7: Supabase URL Yeniləyin
Vercel-də deploy olduqdan sonra:
1. Supabase → Authentication → URL Configuration
2. Site URL: `https://jooble.az`
3. Redirect URLs: `https://jooble.az/**`

✅ **Hazır! Saytınız işləyir.**
