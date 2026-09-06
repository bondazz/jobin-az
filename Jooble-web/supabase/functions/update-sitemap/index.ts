// Statik sitemap yeniləyici - hər gün avtomatik işləyir
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔄 Starting sitemap update process...')
    
    // Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Upstream sitemap-ı çək
    const upstreamUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-main'
    console.log(`📥 Fetching from: ${upstreamUrl}`)
    
    const response = await fetch(upstreamUrl, {
      headers: {
        'Accept': 'application/xml,text/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; SitemapFetcher/1.0; +https://jooble.az)'
      },
      signal: AbortSignal.timeout(25000) // 25s timeout
    })

    if (!response.ok) {
      throw new Error(`Upstream failed: ${response.status} ${response.statusText}`)
    }

    const xmlContent = await response.text()
    console.log(`✅ Fetched ${xmlContent.length} bytes`)

    // 2. XML validasiyası
    const looksLikeXml = (content: string): boolean => {
      if (!content || content.length === 0) return false
      const trimmed = content.trim()
      if (!trimmed.startsWith('<')) return false
      const header = trimmed.substring(0, Math.min(2048, trimmed.length))
      return header.includes('<urlset') || header.includes('<sitemapindex')
    }

    if (!looksLikeXml(xmlContent)) {
      throw new Error('Invalid XML content received')
    }

    // 3. Storage-a yüklə (atomik əməliyyat)
    const fileName = 'sitemap_new.xml'
    const timestamp = new Date().toISOString()
    
    console.log(`💾 Uploading to storage: sitemaps/${fileName}`)
    
    // Əvvəlki faylı sil (varsa)
    const { error: deleteError } = await supabase.storage
      .from('sitemaps')
      .remove([fileName])
    
    if (deleteError && deleteError.message !== 'Object not found') {
      console.warn('⚠️ Delete warning:', deleteError.message)
    }

// Yeni faylı yüklə (Blob kimi)
    const xmlBlob = new Blob([xmlContent], { type: 'application/xml' });
    const { error: uploadError } = await supabase.storage
      .from('sitemaps')
      .upload(fileName, xmlBlob, {
        contentType: 'application/xml',
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    console.log(`✨ Successfully updated sitemap at ${timestamp}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sitemap updated successfully',
        timestamp,
        size: xmlContent.length,
        file: fileName
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Error:', error.message)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502
      }
    )
  }
})
