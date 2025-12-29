import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    // Fetch dynamic counts from database
    const [jobsResult, companiesResult, categoriesResult] = await Promise.all([
      supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('companies').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('categories').select('id', { count: 'exact', head: true }).eq('is_active', true),
    ]);

    const jobCount = jobsResult.count || 0;
    const companyCount = companiesResult.count || 0;
    const categoryCount = categoriesResult.count || 0;

    const content = `# Jooble.az - İş Elanları və Vakansiyalar Platforması

> Azərbaycanın ən böyük iş elanları və vakansiyalar platforması

## Haqqında

Jooble.az Azərbaycanda iş axtaranlar və işəgötürənlər üçün ən etibarlı platformadır. Platformamızda minlərlə aktiv iş elanı, müxtəlif sahələr üzrə vakansiyalar və peşəkar CV builder xidməti mövcuddur.

## Əsas Xüsusiyyətlər

- **İş Elanları**: Gündəlik yenilənən minlərlə iş elanı
- **Vakansiyalar**: Müxtəlif sahələr üzrə (IT, maliyyə, satış, təhsil və s.)
- **Şirkət Profilleri**: Təsdiqlənmiş şirkətlərin tam məlumatları
- **CV Builder**: Peşəkar CV hazırlama aləti
- **Kateqoriyalar**: ${categoryCount}+ peşə sahəsi üzrə təsnifat
- **Filtrləmə**: Şəhər, maaş, iş növü üzrə axtarış
- **Referral Sistemi**: İş elanı paylaşaraq qazanc əldə edin
- **Push Bildirişlər**: Yeni vakansiyalar haqqında dərhal məlumat

## Statistika

- ${jobCount.toLocaleString()}+ aktiv iş elanı
- ${companyCount.toLocaleString()}+ qeydiyyatlı şirkət
- ${categoryCount}+ peşə kateqoriyası

## Əsas Səhifələr

### Ana Səhifə
- URL: https://jooble.az/
- Təsvir: İş elanları siyahısı, filtrləmə, axtarış funksiyaları

### Vakansiyalar
- URL: https://jooble.az/vacancies
- Təsvir: Bütün aktiv iş elanları, kateqoriya və şəhər üzrə filtrləmə

### Şirkətlər
- URL: https://jooble.az/companies
- Təsvir: Təsdiqlənmiş şirkətlərin profilleri və vakansiyaları

### Kateqoriyalar
- URL: https://jooble.az/categories
- Təsvir: Peşə sahələri üzrə təsnifat və statistika

### Regionlar
- URL: https://jooble.az/regions
- Təsvir: Azərbaycan regionları üzrə iş elanları

### CV Builder
- URL: https://jooble.az/cv-builder
- Təsvir: Peşəkar CV hazırlama aləti

### Xidmətlər və Qiymətlər
- URL: https://jooble.az/services
- Təsvir: İşəgötürənlər üçün xidmət paketləri

### Referral Proqramı
- URL: https://jooble.az/referral
- Təsvir: Referral sistemi və qazanc imkanları

### Elan Yerləşdir
- URL: https://jooble.az/add_job
- Təsvir: Yeni iş elanı yerləşdirmə formu

### Abunəlik
- URL: https://jooble.az/subscribe
- Təsvir: Push bildirişlərə abunə olma

### Seçilmiş Elanlar
- URL: https://jooble.az/favorites
- Təsvir: İstifadəçinin saxladığı iş elanları

### Haqqımızda
- URL: https://jooble.az/about
- Təsvir: Platform haqqında məlumat

## Məlumat Strukturu

### İş Elanı
- Başlıq
- Şirkət adı və logosu
- Yer (şəhər)
- İş növü (full-time, part-time, remote, contract)
- Maaş aralığı
- Tələblər və vəzifə təsviri
- Müraciət linki
- Etiketlər (premium, yeni, təcili, remote)

### Şirkət Profili
- Şirkət adı
- Logo və banner
- Haqqında məlumat
- Əlaqə məlumatları
- Website
- Aktiv vakansiyalar
- Təsdiq statusu

### Kateqoriya
- Kateqoriya adı
- Slug
- İkon
- Aktiv elanlar sayı
- Təsvir

## İstifadəçi Funksiyaları

- İş elanlarına baxış
- Filtrləmə və axtarış
- Seçilmiş elanlara əlavə etmə
- CV hazırlama və yükləmə
- Müraciət göndərmə
- Bildirişlərə abunə olma
- Referral linkləri yaratma

## İşəgötürən Funksiyaları

- İş elanı yerləşdirmə
- Şirkət profili yaratma
- Namizədləri idarə etmə
- Statistika və analitika
- Premium elan paketləri
- Reklam yerləşdirmə

## Texnologiyalar

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **SEO**: Dinamik metadata, sitemap, robots.txt
- **PWA**: Progressive Web App dəstəyi

## SEO Optimallaşdırma

- Canonical URL-lər
- Open Graph meta teqləri
- Dinamik title və description
- Structured data (JobPosting schema)
- XML sitemap
- Robots.txt
- Image optimization
- Mobile-first design

## Mobil Optimallaşdırma

- Responsive dizayn
- Touch-friendly interfeys
- Mobil menyu
- Sürətli yükləmə
- PWA dəstəyi
- Offline funksionallıq

## API Endpoints

Platformamız RESTful API təqdim edir:

- \`GET /sitemap.xml\` - XML Sitemap
- \`GET /sitemap_jobs.xml\` - İş elanları sitemap
- \`GET /sitemap_companies.xml\` - Şirkətlər sitemap
- \`GET /sitemap_categories.xml\` - Kateqoriyalar sitemap
- \`GET /robots.txt\` - Robots.txt
- \`GET /llms.txt\` - LLM üçün məlumat faylı

## Əlaqə

- **Website**: https://jooble.az
- **Vakansiyalar**: https://jooble.az/vacancies
- **Şirkətlər**: https://jooble.az/companies
- **Kateqoriyalar**: https://jooble.az/categories

---

Bu fayl LLM-lər (Large Language Models) üçün hazırlanmışdır və platformamız haqqında strukturlaşdırılmış məlumat təqdim edir.

Son yenilənmə: ${new Date().toISOString().split('T')[0]}
`;

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Error generating llms.txt:', error);
    
    // Return static fallback content
    const fallbackContent = `# Jooble.az - İş Elanları və Vakansiyalar Platforması

> Azərbaycanın ən böyük iş elanları və vakansiyalar platforması

## Əsas Səhifələr

- Ana Səhifə: https://jooble.az/
- Vakansiyalar: https://jooble.az/vacancies
- Şirkətlər: https://jooble.az/companies
- Kateqoriyalar: https://jooble.az/categories
- Regionlar: https://jooble.az/regions
- CV Builder: https://jooble.az/cv-builder
- Xidmətlər: https://jooble.az/services
- Referral: https://jooble.az/referral

## Əlaqə

Website: https://jooble.az
`;

    return new NextResponse(fallbackContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}
