import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

const supabase = createClient(supabaseUrl, supabaseKey);

function generateHTML(page) {
  const { title, description, keywords, url, type, structuredData } = page;
  
  return `<!DOCTYPE html>
<html lang="az">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${keywords}">
  <link rel="canonical" href="${url}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="${type || 'website'}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="Jooble Azərbaycan">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  
  <!-- Prevent indexing of static files, let React app handle SEO -->
  <meta name="robots" content="noindex, follow">
  
  ${structuredData ? `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>` : ''}
  
  <!-- Redirect to React app -->
  <meta http-equiv="refresh" content="0;url=${url}">
  <script>window.location.href = "${url}";</script>
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <p>Redirecting to <a href="${url}">${url}</a>...</p>
</body>
</html>`;
}

async function generatePages() {
  console.log('🚀 Starting static page generation...');
  
  const publicDir = path.join(process.cwd(), 'public');
  const pagesDir = path.join(publicDir, 'static-pages');
  
  // Create directories
  await fs.mkdir(pagesDir, { recursive: true });
  await fs.mkdir(path.join(pagesDir, 'companies'), { recursive: true });
  await fs.mkdir(path.join(pagesDir, 'categories'), { recursive: true });
  await fs.mkdir(path.join(pagesDir, 'vacancies'), { recursive: true });

  // Fetch site settings
  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value');
  
  const settingsObj = {};
  settings?.forEach(s => {
    settingsObj[s.key] = s.value;
  });

  // Generate home page
  const homePage = {
    title: settingsObj.site_title || 'Jooble Azərbaycan',
    description: settingsObj.site_description || 'İş elanları və vakansiyalar',
    keywords: settingsObj.site_keywords || 'iş elanları, vakansiya',
    url: 'https://jooble.az/',
    type: 'website',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Jooble Azərbaycan",
      "url": "https://jooble.az",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://jooble.az/?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  };
  
  await fs.writeFile(
    path.join(publicDir, 'index-static.html'),
    generateHTML(homePage)
  );
  console.log('✅ Generated home page');

  // Generate company pages
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('is_active', true)
    .limit(100);

  for (const company of companies || []) {
    const page = {
      title: company.seo_title || `${company.name} | Şirkət Profili - Jooble`,
      description: company.seo_description || `${company.name} şirkəti haqqında məlumat və vakansiyalar`,
      keywords: company.seo_keywords?.join(', ') || `${company.name}, vakansiya`,
      url: `https://jooble.az/companies/${company.slug}`,
      type: 'profile',
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": company.name,
        "description": company.description,
        "url": `https://jooble.az/companies/${company.slug}`,
        "logo": company.logo_url
      }
    };
    
    await fs.writeFile(
      path.join(pagesDir, 'companies', `${company.slug}.html`),
      generateHTML(page)
    );
  }
  console.log(`✅ Generated ${companies?.length || 0} company pages`);

  // Generate category pages
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true);

  for (const category of categories || []) {
    const page = {
      title: category.seo_title || `${category.name} Vakansiyaları - Jooble`,
      description: category.seo_description || `${category.name} sahəsində aktiv vakansiyalar`,
      keywords: category.seo_keywords?.join(', ') || `${category.name}, vakansiya`,
      url: `https://jooble.az/categories/${category.slug}`,
      type: 'website',
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${category.name} Vakansiyaları`,
        "url": `https://jooble.az/categories/${category.slug}`
      }
    };
    
    await fs.writeFile(
      path.join(pagesDir, 'categories', `${category.slug}.html`),
      generateHTML(page)
    );
  }
  console.log(`✅ Generated ${categories?.length || 0} category pages`);

  // Generate top job pages
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, company:companies(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(50);

  for (const job of jobs || []) {
    const page = {
      title: job.seo_title || `${job.title} | ${job.company?.name || 'İş Elanı'}`,
      description: job.seo_description || `${job.company?.name}də ${job.title} vakansiyası`,
      keywords: job.seo_keywords?.join(', ') || `${job.title}, vakansiya`,
      url: `https://jooble.az/vacancies/${job.slug}`,
      type: 'article',
      structuredData: {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": job.title,
        "description": job.description,
        "datePosted": job.created_at,
        "validThrough": job.expire_at,
        "hiringOrganization": {
          "@type": "Organization",
          "name": job.company?.name,
          "logo": job.company?.logo_url
        }
      }
    };
    
    await fs.writeFile(
      path.join(pagesDir, 'vacancies', `${job.slug}.html`),
      generateHTML(page)
    );
  }
  console.log(`✅ Generated ${jobs?.length || 0} job pages`);

  console.log('🎉 Static page generation complete!');
}

generatePages().catch(console.error);
