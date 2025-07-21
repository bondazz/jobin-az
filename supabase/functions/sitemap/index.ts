import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Use the production domain
    const baseUrl = 'https://jooble.az'

    // Fetch all active data
    const [jobsResult, categoriesResult, companiesResult] = await Promise.all([
      supabaseClient.from('jobs').select('slug, updated_at, category_id').eq('is_active', true),
      supabaseClient.from('categories').select('id, slug, updated_at').eq('is_active', true),
      supabaseClient.from('companies').select('slug, updated_at').eq('is_active', true)
    ])

    if (jobsResult.error || categoriesResult.error || companiesResult.error) {
      throw new Error('Database query failed')
    }

    const jobs = jobsResult.data || []
    const categories = categoriesResult.data || []
    const companies = companiesResult.data || []

    // Create category lookup
    const categoryLookup = new Map()
    categories.forEach(cat => {
      categoryLookup.set(cat.id, cat.slug)
    })

    // Sitemap XML with proper namespaces
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Pages -->
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/services</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/favorites</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Vacancies main page -->
  <url>
    <loc>${baseUrl}/vacancies</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Categories main page -->
  <url>
    <loc>${baseUrl}/categories</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Companies main page -->
  <url>
    <loc>${baseUrl}/companies</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`

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

    sitemap += `
</urlset>`

    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response('Error generating sitemap', {
      headers: { 'Content-Type': 'text/plain' },
      status: 500,
    })
  }
})