import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Use the production domain
    const baseUrl = 'https://jooble.az'

    // Fetch all active data including custom pages
    const [jobsResult, categoriesResult, companiesResult, customPagesResult] = await Promise.all([
      supabaseClient.from('jobs').select('slug, updated_at, category_id').eq('is_active', true),
      supabaseClient.from('categories').select('id, slug, updated_at').eq('is_active', true),
      supabaseClient.from('companies').select('slug, updated_at').eq('is_active', true),
      supabaseClient.from('custom_pages').select('slug, updated_at').eq('is_active', true)
    ])

    if (jobsResult.error || categoriesResult.error || companiesResult.error || customPagesResult.error) {
      throw new Error('Database query failed')
    }

    const jobs = jobsResult.data || []
    const categories = categoriesResult.data || []
    const companies = companiesResult.data || []
    const customPages = customPagesResult.data || []

    console.log(`Found ${customPages.length} active custom pages for sitemap`)

    // Create category lookup
    const categoryLookup = new Map()
    categories.forEach(cat => {
      categoryLookup.set(cat.id, cat.slug)
    })

    // Generate sitemap according to Google Sitemap Standard
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/categories</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/companies</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/pricing</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/saved-jobs</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`

    // Add individual job pages
    jobs.forEach(job => {
      const lastmod = new Date(job.updated_at).toISOString().split('T')[0]
      sitemap += `
  <url>
    <loc>${baseUrl}/vacancies/${job.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    })

    // Add category pages
    categories.forEach(category => {
      const lastmod = new Date(category.updated_at).toISOString().split('T')[0]
      sitemap += `
  <url>
    <loc>${baseUrl}/categories/${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`

      // Add jobs within categories
      const categoryJobs = jobs.filter(job => {
        const catSlug = categoryLookup.get(job.category_id)
        return catSlug === category.slug
      })

      categoryJobs.forEach(job => {
        const jobLastmod = new Date(job.updated_at).toISOString().split('T')[0]
        sitemap += `
  <url>
    <loc>${baseUrl}/categories/${category.slug}/vacancy/${job.slug}</loc>
    <lastmod>${jobLastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
      })
    })

    // Add company pages
    companies.forEach(company => {
      const lastmod = new Date(company.updated_at).toISOString().split('T')[0]
      sitemap += `
  <url>
    <loc>${baseUrl}/companies/${company.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/companies/${company.slug}/vacancies</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    })

    // Add favorites for each job
    jobs.forEach(job => {
      sitemap += `
  <url>
    <loc>${baseUrl}/favorites/${job.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`
    })

    // Add custom SEO pages (only active ones - deleted pages won't appear)
    customPages.forEach(page => {
      const lastmod = new Date(page.updated_at).toISOString().split('T')[0]
      // Clean slug - remove leading slash if present
      const cleanSlug = page.slug.startsWith('/') ? page.slug.slice(1) : page.slug
      sitemap += `
  <url>
    <loc>${baseUrl}/${cleanSlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    })

    sitemap += `
</urlset>`

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
      status: 200,
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response('Error generating sitemap', {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
      status: 500,
    })
  }
})