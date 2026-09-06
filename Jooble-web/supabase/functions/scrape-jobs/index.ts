import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BASE_URL = 'https://classic.jobsearch.az'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[əƏ]/g, 'e')
    .replace(/[öÖ]/g, 'o')
    .replace(/[üÜ]/g, 'u')
    .replace(/[çÇ]/g, 'c')
    .replace(/[şŞ]/g, 's')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '')
}

const SLUG_KEYWORDS = [
  'is-elani', 'is-elanlari', 'vakansiya', 'vakansiyalar', 'tecili-is-elani',
  'aktiv-vakansiya', 'yeni-vakansiya', 'yeni-is-elani', 'aciq-vakansiya',
  'ise-qebul', 'ise-devet', 'is-teklifi', 'karyera', 'bos-is-yeri', 'son-vakansiya',
]

function generateJobSlug(companyName: string, title: string): string {
  const keyword = SLUG_KEYWORDS[Math.floor(Math.random() * SLUG_KEYWORDS.length)]
  const base = slugify(`${companyName}-${title}`)
  const randomNum = Math.floor(1000000 + Math.random() * 9000000)
  return `${keyword}-${base}-${randomNum}`
}

const AZ_MONTHS: Record<string, number> = {
  'yanvar': 0, 'fevral': 1, 'mart': 2, 'aprel': 3, 'may': 4, 'iyun': 5,
  'iyul': 6, 'avqust': 7, 'sentyabr': 8, 'oktyabr': 9, 'noyabr': 10, 'dekabr': 11,
}

function normalizeAzLower(s: string): string {
  return s
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function parseAzDate(dateStr: string): string | null {
  const match = dateStr.trim().match(/^(\d{1,2})\s+(\S+)$/)
  if (!match) return null
  const day = parseInt(match[1])
  const monthName = normalizeAzLower(match[2])
  // AZ_MONTHS keys are already lowercase ascii-ish; normalize them too for safety
  let monthNum: number | undefined
  for (const [k, v] of Object.entries(AZ_MONTHS)) {
    if (normalizeAzLower(k) === monthName) { monthNum = v; break }
  }
  if (monthNum === undefined) return null
  const year = new Date().getFullYear()
  return new Date(year, monthNum, day).toISOString()
}

interface ListJob {
  url: string
  title: string
  companyName: string
  companyLogo: string | null
  postedDate: string | null
  expirationDate: string | null
  tag: string | null
}

function parseListPage(html: string): ListJob[] {
  const jobs: ListJob[] = []
  const itemMarker = 'class="vacancies__item"'
  let pos = 0

  while (true) {
    const itemIdx = html.indexOf(itemMarker, pos)
    if (itemIdx === -1) break

    const ulStart = html.lastIndexOf('<ul', itemIdx)
    if (ulStart === -1) { pos = itemIdx + 30; continue }

    const ulEnd = html.indexOf('</ul>', itemIdx)
    if (ulEnd === -1) { pos = itemIdx + 30; continue }

    const block = html.slice(ulStart, ulEnd + 5)

    const titleMatch = block.match(/<h2[^>]*class="vacancies__title[^"]*"[^>]*data-title="([^"]*)"[^>]*>\s*<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/i)
    if (!titleMatch) { pos = ulEnd + 5; continue }

    const tag = titleMatch[1].toLowerCase()
    const url = titleMatch[2].trim()
    const title = titleMatch[3].trim()

    let companyName = ''
    let companyLogo: string | null = null
    const companyMatch = block.match(/<a[^>]*class="vacancies__provided[^"]*"[^>]*>([\s\S]*?)<\/a>/i)
    if (companyMatch) {
      const companyBlock = companyMatch[1]
      const nameMatch = companyBlock.match(/<span>([^<]+)<\/span>/)
      if (nameMatch) companyName = nameMatch[1].trim()
      const logoMatch = companyBlock.match(/<img\s+src="([^"]+)"/i)
      if (logoMatch) companyLogo = logoMatch[1].trim()
    }
    if (!companyName) { pos = ulEnd + 5; continue }

    const dateMatches = [...block.matchAll(/<li\s+class="d-none d-lg-block">([^<]+)<\/li>/gi)]
    const postedDate = dateMatches[0] ? parseAzDate(dateMatches[0][1]) : null
    const expirationDate = dateMatches[1] ? parseAzDate(dateMatches[1][1]) : null

    let jobTag: string | null = null
    if (tag === 'premium') jobTag = 'premium'
    else if (tag === 'yeni') jobTag = 'new'

    jobs.push({ url, title, companyName, companyLogo, postedDate, expirationDate, tag: jobTag })
    pos = ulEnd + 5
  }

  const seen = new Set<string>()
  return jobs.filter(j => {
    if (seen.has(j.url)) return false
    seen.add(j.url)
    return true
  })
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function parseDetailPage(html: string) {
  let categoryName: string | null = null
  let description = ''
  let detailLogo: string | null = null
  let applicationUrl: string | null = null
  let applicationType: 'website' | 'email' = 'website'
  let applicationEmail: string | null = null
  let deadlineDate: string | null = null
  let companyNameFromDetail: string | null = null

  // Company name from the first company__title h2 in vacancy header
  const companyTitleMatch = html.match(/class="company__title"[\s\S]{0,600}?<h2>\s*([^<]+?)\s*<\/h2>/i)
  if (companyTitleMatch) {
    const candidate = decodeHtmlEntities(companyTitleMatch[1])
    if (candidate && !['şirkət', 'company'].includes(candidate.toLowerCase())) {
      companyNameFromDetail = candidate
    }
  }

  // Category from vacancy__title div
  const titleDivIdx = html.indexOf('class="vacancy__title"')
  if (titleDivIdx !== -1) {
    const titleArea = html.slice(titleDivIdx, titleDivIdx + 2000)
    const catMatch = titleArea.match(/<a\s+class="vacancy__category"[^>]*>([^<]+)<\/a>/i)
    if (catMatch) {
      categoryName = decodeHtmlEntities(catMatch[1])
    }
  }

  // Logo from company__logo
  const logoIdx = html.indexOf('class="company__logo')
  if (logoIdx !== -1) {
    const logoArea = html.slice(logoIdx, logoIdx + 500)
    const logoMatch = logoArea.match(/<img\s+[^>]*src="([^"]+)"/i)
    if (logoMatch) detailLogo = logoMatch[1].trim()
  }

  // Description from vacancy__description
  const descIdx = html.indexOf('class="vacancy__description')
  if (descIdx !== -1) {
    const contentIdx = html.indexOf('class="content"', descIdx)
    if (contentIdx !== -1) {
      const openTag = html.indexOf('>', contentIdx)
      if (openTag !== -1) {
        let depth = 1
        let p = openTag + 1
        while (depth > 0 && p < html.length) {
          const nextOpen = html.indexOf('<div', p)
          const nextClose = html.indexOf('</div>', p)
          if (nextClose === -1) break
          if (nextOpen !== -1 && nextOpen < nextClose) {
            depth++
            p = nextOpen + 4
          } else {
            depth--
            if (depth === 0) {
              description = html.slice(openTag + 1, nextClose).trim()
            }
            p = nextClose + 6
          }
        }
      }
    }
  }

  // Deadline
  const deadlineMatch = html.match(/Deadline\s+(\d{1,2})\s+(\w+)\s+(\d{4})/i)
  if (deadlineMatch) {
    const day = parseInt(deadlineMatch[1])
    const monthName = normalizeAzLower(deadlineMatch[2])
    const year = parseInt(deadlineMatch[3])
    let monthNum: number | undefined
    for (const [k, v] of Object.entries(AZ_MONTHS)) {
      if (normalizeAzLower(k) === monthName) { monthNum = v; break }
    }
    if (monthNum !== undefined) {
      deadlineDate = new Date(year, monthNum, day).toISOString()
    }
  }

  // Apply slug for contact API
  const applySlugMatch = html.match(/class="[^"]*\bapply_vacancy\b[^"]*"[^>]*data-slug="([^"]+)"/i)
    || html.match(/data-slug="([^"]+)"[^>]*class="[^"]*\bapply_vacancy\b[^"]*"/i)
  const applySlug = applySlugMatch?.[1]?.trim() || null

  // Application type detection
  // 1) Direct external apply link = website
  const applyBtnMatch = html.match(/<a[^>]*class="[^"]*\bapply_vacancy\b[^"]*"[^>]*href="([^"]+)"/i)
  if (applyBtnMatch) {
    const applyHref = applyBtnMatch[1].trim()
    if (applyHref && !applyHref.includes('#') && !applyHref.includes('classic.jobsearch.az')) {
      applicationType = 'website'
      applicationUrl = applyHref
    }
  }

  // 2) Email indicator on page
  const hasEmailIndicator = html.includes('Müraciət üçün aşağıdakı email ünvanı köçürmək lazımdır')

  // 3) Sometimes email is already rendered
  const emailMatch = html.match(/class="[^"]*email_placeholder[^"]*"[^>]*>\s*([^<]*?)\s*</i)
  if (emailMatch && emailMatch[1].trim() && emailMatch[1].trim().includes('@')) {
    applicationType = 'email'
    applicationEmail = emailMatch[1].trim()
  } else if (hasEmailIndicator && !applicationUrl) {
    applicationType = 'email'
  }

  return {
    categoryName,
    description,
    detailLogo,
    deadlineDate,
    applicationType,
    applicationEmail,
    applicationUrl,
    companyNameFromDetail,
    applySlug,
    hasEmailIndicator,
  }
}

// Parse company profile page for address, phone, website, description
function parseCompanyPage(html: string) {
  let address: string | null = null
  let phone: string | null = null
  let website: string | null = null
  let companyDescription: string | null = null

  const addressMatch = html.match(/<li>\s*<span>Address<\/span>\s*([\s\S]*?)<\/li>/i)
  if (addressMatch) {
    address = decodeHtmlEntities(addressMatch[1].replace(/<[^>]+>/g, ''))
    if (address.length > 500) address = address.substring(0, 500)
  }

  const phoneMatch = html.match(/<li>\s*<span>Phone number<\/span>\s*<a[^>]*>([^<]+)<\/a>/i)
  if (phoneMatch) {
    phone = decodeHtmlEntities(phoneMatch[1])
  }

  const websiteMatch = html.match(/<li>\s*<span>Website<\/span>\s*<a[^>]*href="([^"]+)"[^>]*>/i)
  if (websiteMatch) {
    website = websiteMatch[1].trim()
  }

  const companyDescMatch = html.match(/<div class="company__desc">[\s\S]*?<div class="content">([\s\S]*?)<\/div>/i)
  if (companyDescMatch) {
    // Strip "About company" heading (h5/h4/h3 tags) from the description
    companyDescription = companyDescMatch[1]
      .replace(/<h[1-6][^>]*>\s*About\s+company\s*<\/h[1-6]>/gi, '')
      .trim()
  }

  return { address, phone, website, companyDescription }
}

// Extract company slug from company links if present in vacancy page
function extractCompanySlug(html: string): string | null {
  const match = html.match(/href="https?:\/\/classic\.jobsearch\.az\/companies\/([^"\/]+)"/i)
  if (match) return match[1]
  return null
}

async function fetchCompanyInfoBySlugCandidates(companySlugs: Array<string | null>) {
  const tried = new Set<string>()

  for (const rawSlug of companySlugs) {
    const slug = (rawSlug || '').trim().toLowerCase()
    if (!slug || tried.has(slug)) continue
    tried.add(slug)

    try {
      const compPageResp = await fetch(`${BASE_URL}/companies/${slug}`, { headers: { 'User-Agent': UA } })
      if (!compPageResp.ok) continue

      const compPageHtml = await compPageResp.text()
      const compInfo = parseCompanyPage(compPageHtml)
      if (compInfo.address || compInfo.phone || compInfo.website || compInfo.companyDescription) {
        console.log(`  Fetched company profile (${slug}): addr=${compInfo.address}, phone=${compInfo.phone}, web=${compInfo.website}`)
        return compInfo
      }
    } catch (e: any) {
      console.error(`  Failed to fetch company page (${slug}): ${e.message}`)
    }
  }

  return null
}

/**
 * ScrapingBee ilə "Müraciət et" düyməsini basıb açılan modaldan
 * əlaqə məlumatını (email / xarici link / telefon) çıxarır.
 */
type ApplyContact = {
  kind: 'email' | 'website' | 'phone' | 'jobsearch' | 'none'
  email?: string
  url?: string
  phone?: string
}

/**
 * Rewrites external apply URL: any ?source=JobSearch (or Jobsearch/jobsearch)
 * query param is replaced with source=Jooble.
 */
function rewriteApplySource(url: string): string {
  try {
    const u = new URL(url)
    // Case-insensitive source replacement
    for (const key of Array.from(u.searchParams.keys())) {
      if (key.toLowerCase() === 'source') {
        u.searchParams.set(key, 'Jooble')
      }
    }
    return u.toString()
  } catch {
    return url.replace(/([?&])source=[^&#]*/gi, '$1source=Jooble')
  }
}

/**
 * Custom scraper API fallback that extracts email from JS-rendered
 * jobsearch.az apply modal. Waits internally (5-10s) for JS to render.
 * Expected response: {"success":true,"data":"email@example.com"}
 */
async function fetchEmailViaCustomApi(jobUrl: string): Promise<string | null> {
  const apiUrl = `http://176.118.167.14/api/scrape?url=${encodeURIComponent(jobUrl)}`
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)
    const resp = await fetch(apiUrl, { signal: controller.signal })
    clearTimeout(timeoutId)
    if (!resp.ok) {
      console.error(`  Custom API error ${resp.status}`)
      return null
    }
    const json = await resp.json().catch(() => null) as { success?: boolean; data?: string } | null
    if (json && json.success && typeof json.data === 'string' && json.data.includes('@')) {
      return json.data.trim()
    }
    return null
  } catch (e: any) {
    console.error(`  Custom API fetch failed: ${e.message}`)
    return null
  }
}

async function fetchApplyContactViaScrapingBee(jobUrl: string): Promise<ApplyContact> {
  const apiKey = Deno.env.get('SCRAPINGBEE_API_KEY')
  if (!apiKey) {
    console.error('  SCRAPINGBEE_API_KEY not configured — falling back to custom API for email')
    const email = await fetchEmailViaCustomApi(jobUrl)
    if (email) return { kind: 'email', email }
    return { kind: 'none' }
  }

  const jsScenario = {
    instructions: [
      { wait: 1500 },
      { click: '.apply_vacancy' },
      { wait: 2500 },
    ],
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    url: jobUrl,
    render_js: 'true',
    js_scenario: JSON.stringify(jsScenario),
    premium_proxy: 'false',
    country_code: 'az',
  })

  try {
    const resp = await fetch(`https://app.scrapingbee.com/api/v1/?${params.toString()}`)
    const html = await resp.text()

    if (!resp.ok) {
      console.error(`  ScrapingBee error ${resp.status}: ${html.slice(0, 200)}`)
      // Fallback to custom email API
      const email = await fetchEmailViaCustomApi(jobUrl)
      if (email) return { kind: 'email', email }
      return { kind: 'none' }
    }

    // 1) External apply button (real href, not # and not jobsearch itself)
    const applyHrefMatch = html.match(/<a[^>]*class="[^"]*\bapply_vacancy\b[^"]*"[^>]*href="([^"]+)"/i)
      || html.match(/href="([^"]+)"[^>]*class="[^"]*\bapply_vacancy\b[^"]*"/i)
    if (applyHrefMatch) {
      const href = applyHrefMatch[1].trim()
      if (href && href !== '#' && !href.startsWith('javascript')) {
        if (/^mailto:/i.test(href)) {
          const email = href.replace(/^mailto:/i, '').split('?')[0].trim()
          if (email.includes('@')) return { kind: 'email', email }
        }
        if (/^tel:/i.test(href)) {
          return { kind: 'phone', phone: href.replace(/^tel:/i, '').trim() }
        }
        // Any external website (including jobsearch-internal redirects like jobs.glorri.az?source=JobSearch)
        if (/^https?:\/\//i.test(href) && !/classic\.jobsearch\.az/i.test(href)) {
          return { kind: 'website', url: rewriteApplySource(href) }
        }
        if (/jobsearch\.az/i.test(href)) {
          return { kind: 'jobsearch' }
        }
        return { kind: 'website', url: rewriteApplySource(href) }
      }
    }

    // No external website apply link found → use custom API to extract email
    const email = await fetchEmailViaCustomApi(jobUrl)
    if (email) return { kind: 'email', email }

    // Phone-only detection (skip these)
    const telMatch = html.match(/href="tel:([^"]+)"/i)
      || html.match(/(\+994[\s\-]?\d{2}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2})/)
    if (telMatch) {
      return { kind: 'phone', phone: telMatch[1].trim() }
    }

    return { kind: 'none' }
  } catch (e: any) {
    console.error(`  ScrapingBee fetch failed: ${e.message}`)
    const email = await fetchEmailViaCustomApi(jobUrl)
    if (email) return { kind: 'email', email }
    return { kind: 'none' }
  }
}


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })
    const { data: claims, error: claimsError } = await authClient.auth.getUser()
    if (claimsError || !claims.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', claims.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const body = await req.json()
    const maxJobs = body.maxJobs || 3
    const targetDateStr = body.targetDate || null // format: "YYYY-MM-DD"

    // Determine target date
    const targetDate = new Date()
    if (targetDateStr) {
      const [y, m, d] = targetDateStr.split('-').map(Number)
      targetDate.setFullYear(y, m - 1, d)
    }
    targetDate.setHours(0, 0, 0, 0)

    const dateLabel = targetDate.toISOString().split('T')[0]
    console.log(`Starting scrape from classic.jobsearch.az with maxJobs=${maxJobs}, targetDate=${dateLabel}`)

    // Paginate to find jobs matching targetDate
    let allMatchingJobs: ListJob[] = []
    const maxPages = 10
    let foundAny = false
    let passedTarget = false

    for (let page = 1; page <= maxPages; page++) {
      const url = page === 1 ? `${BASE_URL}/vacancies` : `${BASE_URL}/vacancies?page=${page}`
      console.log(`Fetching page ${page}: ${url}`)
      const listResponse = await fetch(url, { headers: { 'User-Agent': UA } })
      const listHtml = await listResponse.text()

      const pageJobs = parseListPage(listHtml)
      console.log(`Page ${page}: parsed ${pageJobs.length} jobs`)
      if (pageJobs.length === 0) break

      let pageHasMatch = false
      let pageHasOlder = false

      for (const j of pageJobs) {
        if (!j.postedDate) continue
        const posted = new Date(j.postedDate)
        posted.setHours(0, 0, 0, 0)

        if (posted.getTime() === targetDate.getTime()) {
          allMatchingJobs.push(j)
          pageHasMatch = true
          foundAny = true
        } else if (posted.getTime() < targetDate.getTime()) {
          pageHasOlder = true
        }
      }

      // If we found matches and this page has older dates, no need to continue
      if (foundAny && pageHasOlder) break
      // If all jobs on page are older than target, stop
      if (!pageHasMatch && pageHasOlder) {
        passedTarget = true
        break
      }
    }

    // Deduplicate
    const seen = new Set<string>()
    const todayJobs = allMatchingJobs.filter(j => {
      if (seen.has(j.url)) return false
      seen.add(j.url)
      return true
    })
    console.log(`Target date (${dateLabel}) jobs: ${todayJobs.length}`)

    const urls = todayJobs.map(j => j.url)
    const { data: existingScraped } = await supabase
      .from('scraped_jobs')
      .select('source_url')
      .in('source_url', urls)

    const existingUrls = new Set((existingScraped || []).map((s: any) => s.source_url))
    const newJobs = todayJobs.filter(j => !existingUrls.has(j.url))
    console.log(`${newJobs.length} new jobs to scrape (max ${maxJobs})`)

    const toProcess = newJobs.slice(0, maxJobs)
    const results: any[] = []

    const currentYear = new Date().getFullYear()
    for (const job of toProcess) {
      try {
        console.log(`Processing: ${job.title} - ${job.companyName} (${job.url})`)

        // Fetch detail page
        const detailResponse = await fetch(job.url, { headers: { 'User-Agent': UA } })
        const detailHtml = await detailResponse.text()

        const detail = parseDetailPage(detailHtml)
        // Use company name from detail page (company__title h2) if available, fallback to list
        const finalCompanyName = detail.companyNameFromDetail || job.companyName
        console.log(`Detail: company=${finalCompanyName}, cat=${detail.categoryName}, desc=${detail.description.length}chars`)

        // Always resolve real apply target via ScrapingBee (renders JS, clicks button)
        const applyContact = await fetchApplyContactViaScrapingBee(job.url)
        console.log(`  Apply contact: ${applyContact.kind}${applyContact.email ? ' ' + applyContact.email : ''}${applyContact.url ? ' ' + applyContact.url : ''}${applyContact.phone ? ' ' + applyContact.phone : ''}`)

        // SKIP jobs whose only apply method is phone or an internal jobsearch link
        if (applyContact.kind === 'phone' || applyContact.kind === 'jobsearch') {
          console.log(`  ⏭️  Skipping (${applyContact.kind}-only apply): ${job.title}`)
          await supabase.from('scraped_jobs').insert({
            source_url: job.url,
            source_site: 'jobsearch.az',
            status: 'skipped',
            error_message: `apply=${applyContact.kind}`,
          })
          results.push({ title: job.title, company: job.companyName, status: 'skipped', error: `apply=${applyContact.kind}` })
          await new Promise(resolve => setTimeout(resolve, 500))
          continue
        }

        let resolvedApplicationEmail: string | null = applyContact.kind === 'email' ? (applyContact.email || null) : null
        let resolvedApplicationUrlFromApply: string | null = applyContact.kind === 'website' ? (applyContact.url || null) : null

        const finalApplicationType: 'email' | 'website' = resolvedApplicationEmail ? 'email' : 'website'
        const externalLogoUrl = detail.detailLogo || job.companyLogo
        const finalDescription = detail.description || `<p>${job.title} - ${finalCompanyName} şirkətində vakansiya.</p>`
        const finalExpiration = detail.deadlineDate || job.expirationDate
        const finalApplicationUrl = resolvedApplicationUrlFromApply || detail.applicationUrl || job.url

        // Upload logo to Supabase storage
        let uploadedLogoUrl: string | null = null
        if (externalLogoUrl) {
          try {
            const logoResponse = await fetch(externalLogoUrl, { headers: { 'User-Agent': UA } })
            if (logoResponse.ok) {
              const logoBuffer = await logoResponse.arrayBuffer()
              const contentType = logoResponse.headers.get('content-type') || 'image/png'
              let ext = 'png'
              if (contentType.includes('svg')) ext = 'svg'
              else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg'
              else if (contentType.includes('webp')) ext = 'webp'
              
              const fileName = `company-logos/${slugify(finalCompanyName)}-${Date.now()}.${ext}`
              
              const { data: uploadData, error: uploadErr } = await supabase.storage
                .from('images')
                .upload(fileName, logoBuffer, { contentType, upsert: true })
              
              if (uploadData && !uploadErr) {
                const { data: publicUrl } = supabase.storage.from('images').getPublicUrl(fileName)
                uploadedLogoUrl = publicUrl.publicUrl
                console.log(`  Uploaded logo: ${uploadedLogoUrl}`)
              } else {
                console.error(`  Logo upload failed: ${uploadErr?.message}`)
                uploadedLogoUrl = externalLogoUrl
              }
            }
          } catch (logoErr: any) {
            console.error(`  Logo download failed: ${logoErr.message}`)
            uploadedLogoUrl = externalLogoUrl
          }
        }

        const finalLogo = uploadedLogoUrl || externalLogoUrl

        // Find or create company
        let companyId: string | null = null
        const companySlugStr = slugify(finalCompanyName)
        
        // First try by name (ilike)
        const { data: existingCompanies } = await supabase
          .from('companies')
          .select('id, name, logo, description, address, phone, website')
          .ilike('name', finalCompanyName)
          .limit(1)

        // If not found by name, try by slug (handles slight name variations)
        let matchedCompany = existingCompanies && existingCompanies.length > 0 ? existingCompanies[0] : null
        if (!matchedCompany) {
          const { data: slugCompanies } = await supabase
            .from('companies')
            .select('id, name, logo, description, address, phone, website')
            .eq('slug', companySlugStr)
            .limit(1)
          if (slugCompanies && slugCompanies.length > 0) {
            matchedCompany = slugCompanies[0]
            console.log(`  Found company by slug: ${matchedCompany.name} (slug: ${companySlugStr})`)
          }
        }

        const companySlugCandidates = [extractCompanySlug(detailHtml), companySlugStr]

        if (matchedCompany) {
          companyId = matchedCompany.id

          // Update logo if missing
          if (finalLogo && !matchedCompany.logo) {
            await supabase.from('companies').update({ logo: finalLogo }).eq('id', companyId)
          }

          // Fill any missing company details from company profile page
          const hasMissingDetails = !matchedCompany.description || !matchedCompany.address || !matchedCompany.phone || !matchedCompany.website
          if (hasMissingDetails) {
            const compInfo = await fetchCompanyInfoBySlugCandidates(companySlugCandidates)
            if (compInfo) {
              const updateData: any = {}
              if (compInfo.address && !matchedCompany.address) updateData.address = compInfo.address
              if (compInfo.phone && !matchedCompany.phone) updateData.phone = compInfo.phone
              if (compInfo.website && !matchedCompany.website) updateData.website = compInfo.website
              if (compInfo.companyDescription && !matchedCompany.description) updateData.description = compInfo.companyDescription

              if (Object.keys(updateData).length > 0) {
                await supabase.from('companies').update(updateData).eq('id', companyId)
                console.log(`  Updated company details for ${finalCompanyName}`)
              }
            }
          }
        } else {
          // New company - fetch details from company profile page
          const companyDetails = await fetchCompanyInfoBySlugCandidates(companySlugCandidates) || {}

          // Generate SEO fields for new company
          const companySeoTitle = `${finalCompanyName} - Şirkət haqqında, vakansiyalar və iş elanları | Jooble.az`
          const companySeoDesc = `${finalCompanyName} şirkətinin vakansiyaları, iş elanları və şirkət haqqında məlumat. ${finalCompanyName} şirkətində karyera imkanları.`
          const companyAboutSeoTitle = `${finalCompanyName} haqqında - Şirkət məlumatları | Jooble.az`
          const companyAboutSeoDesc = `${finalCompanyName} şirkəti haqqında ətraflı məlumat, ünvan, əlaqə və fəaliyyət sahəsi.`
          const companyJobsSeoTitle = `${finalCompanyName} vakansiyaları - İş elanları ${currentYear} | Jooble.az`
          const companyJobsSeoDesc = `${finalCompanyName} şirkətinin ən son vakansiyaları və iş elanları. ${currentYear}-ci il üçün aktual iş imkanları.`

          const { data: newCompany, error: compErr } = await supabase
            .from('companies')
            .insert({
              name: finalCompanyName,
              slug: companySlugStr,
              logo: finalLogo,
              is_active: true,
              is_verified: false,
              address: companyDetails.address || null,
              phone: companyDetails.phone || null,
              website: companyDetails.website || null,
              description: companyDetails.companyDescription || null,
              seo_title: companySeoTitle.substring(0, 160),
              seo_description: companySeoDesc.substring(0, 300),
              about_seo_title: companyAboutSeoTitle.substring(0, 160),
              about_seo_description: companyAboutSeoDesc.substring(0, 300),
              jobs_seo_title: companyJobsSeoTitle.substring(0, 160),
              jobs_seo_description: companyJobsSeoDesc.substring(0, 300),
            })
            .select('id')
            .single()

          if (newCompany) {
            companyId = newCompany.id
            console.log(`Created company: ${finalCompanyName} (${companyId})`)
          } else {
            console.error(`Failed to create company: ${compErr?.message}`)
            // Final fallback: if insert failed due to duplicate, try slug lookup again
            if (compErr?.message?.includes('duplicate')) {
              const { data: fallbackCompany } = await supabase
                .from('companies')
                .select('id')
                .eq('slug', companySlugStr)
                .single()
              if (fallbackCompany) {
                companyId = fallbackCompany.id
                console.log(`  Fallback: found existing company by slug (${companyId})`)
              }
            }
          }
        }

        // Find or create category
        let categoryId: string | null = null
        if (detail.categoryName) {
          const { data: existingCats } = await supabase
            .from('categories')
            .select('id')
            .ilike('name', detail.categoryName)
            .limit(1)

          if (existingCats && existingCats.length > 0) {
            categoryId = existingCats[0].id
          } else {
            const { data: newCat } = await supabase
              .from('categories')
              .insert({ name: detail.categoryName, slug: slugify(detail.categoryName), is_active: true })
              .select('id')
              .single()
            if (newCat) {
              categoryId = newCat.id
              console.log(`Created category: ${detail.categoryName}`)
            }
          }
        }

        // Create job
        const jobSlug = generateJobSlug(finalCompanyName, job.title)
        const tags: string[] = []
        if (job.tag === 'premium') tags.push('premium')
        tags.push('new')

        
        const seoTitle = `${job.title} vakansiyası – ${finalCompanyName}. ${currentYear} iş elanları və vakansiyalar | Jooble.az`
        const seoDescription = `${finalCompanyName} şirkəti ${job.title} vakansiyası üzrə işçi axtarır! Ən yeni iş elanları, vakansiyalar, yüksək maaşlı is elanlari və vakansiyalar.`

        const jobInsert: any = {
          title: job.title,
          company_id: companyId,
          category_id: categoryId,
          description: finalDescription,
          location: 'Bakı',
          type: 'full-time',
          slug: jobSlug,
          application_url: finalApplicationUrl,
          application_type: finalApplicationType,
          tags,
          is_active: true,
          seo_title: seoTitle.substring(0, 160),
          seo_description: seoDescription.substring(0, 250),
          expiration_date: finalExpiration,
        }

        // Set created_at to targetDate with a unique random time in Baku timezone (09:00-23:59 Baku = 05:00-19:59 UTC)
        {
          const now = new Date()
          const baseDate = targetDateStr ? targetDate : now
          const isToday = baseDate.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)
          
          // Baku time range: 09:00 - 23:59
          // But if scraping today, cap max to current Baku hour - 1 to avoid future timestamps
          const currentBakuHour = now.getUTCHours() + 4
          const maxBakuHour = isToday ? Math.max(9, Math.min(currentBakuHour - 1, 23)) : 23
          const minBakuHour = 9
          
          if (maxBakuHour < minBakuHour) {
            // Too early in the day (before 10:00 Baku), just use a safe past time
            const ts = new Date(baseDate)
            ts.setUTCHours(5, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), Math.floor(Math.random() * 1000))
            jobInsert.created_at = ts.toISOString()
          } else {
            const randomBakuHour = minBakuHour + Math.floor(Math.random() * (maxBakuHour - minBakuHour + 1))
            const randomUtcHour = randomBakuHour - 4
            const randomMin = Math.floor(Math.random() * 60)
            const randomSec = Math.floor(Math.random() * 60)
            const randomMs = Math.floor(Math.random() * 1000)
            const ts = new Date(baseDate)
            ts.setUTCHours(randomUtcHour, randomMin, randomSec, randomMs)
            jobInsert.created_at = ts.toISOString()
          }
        }
        // Fallback: if application type is email but no email was extracted, try company email from DB
        if (!resolvedApplicationEmail && finalApplicationType === 'email' && matchedCompany) {
          // Check if existing company has an email in the database
          const { data: companyWithEmail } = await supabase
            .from('companies')
            .select('email')
            .eq('id', matchedCompany.id)
            .single()
          if (companyWithEmail?.email) {
            resolvedApplicationEmail = companyWithEmail.email
            console.log(`  Using company email as fallback: ${resolvedApplicationEmail}`)
          }
        }

        if (resolvedApplicationEmail) {
          jobInsert.application_email = resolvedApplicationEmail
        }

        const { data: newJob, error: jobErr } = await supabase
          .from('jobs')
          .insert(jobInsert)
          .select('id')
          .single()

        if (newJob) {
          await supabase.from('scraped_jobs').insert({
            source_url: job.url,
            job_id: newJob.id,
            source_site: 'jobsearch.az',
            status: 'success',
          })

          results.push({
            title: job.title,
            company: finalCompanyName,
            category: detail.categoryName,
            applicationType: finalApplicationType,
            status: 'success',
            jobId: newJob.id,
          })
          console.log(`✅ Created: ${job.title} | cat: ${detail.categoryName} | app: ${finalApplicationType}`)
        } else {
          console.error(`Failed to create job: ${jobErr?.message}`)
          await supabase.from('scraped_jobs').insert({
            source_url: job.url,
            status: 'error',
            error_message: jobErr?.message,
          })
          results.push({ title: job.title, company: finalCompanyName, status: 'error', error: jobErr?.message })
        }

        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (err: any) {
        console.error(`Error processing ${job.url}: ${err.message}`)
        results.push({ title: job.title, company: job.companyName, status: 'error', error: err.message })
      }
    }

    return new Response(JSON.stringify({
      success: true,
      totalFound: todayJobs.length,
      alreadyScraped: existingUrls.size,
      newAvailable: newJobs.length,
      processed: results.length,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    console.error('Scrape error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
