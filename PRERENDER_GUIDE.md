# Prerender Snapshot Guide for Kontakt Home

## Overview
This guide explains how to manually prerender and store a static HTML snapshot for SEO optimization.

## Requirements Met
✅ Fully render the page (execute JS, wait until networkidle)  
✅ Save final HTML snapshot with all meta tags and structured data  
✅ UTF-8 encoded HTML file  
✅ 7-day TTL with manual refresh requirement  
✅ Proper HTTP headers for crawler serving  
✅ Bot user-agent recommendations  
✅ Verification guide  

---

## 1. Capture the Prerendered HTML

### Option A: Use the Local Script (Recommended)

```bash
# Install dependencies
npm install puppeteer

# Run the capture script
node scripts/capture-prerender.js
```

This will:
- Open the page in headless Chrome
- Wait for JavaScript execution and network idle
- Extract the fully rendered HTML
- Save to `public/kontakt-home-prerender.html`
- Show SEO elements (title, meta, JSON-LD)

### Option B: Manual Browser Capture

1. Open Chrome DevTools (F12)
2. Navigate to: https://jooble.az/companies/kontakt-home
3. Wait for page to fully load
4. In Console, run:
```javascript
copy(document.documentElement.outerHTML)
```
5. Paste into `public/kontakt-home-prerender.html`

---

## 2. Store in Supabase (Optional)

First, create the storage bucket and table:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('prerender-snapshots', 'prerender-snapshots', true);

-- Create metadata table
CREATE TABLE prerender_metadata (
  id BIGSERIAL PRIMARY KEY,
  path TEXT UNIQUE NOT NULL,
  snapshot_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  ttl_days INTEGER DEFAULT 7,
  manual BOOLEAN DEFAULT true
);
```

Upload the snapshot:

```bash
curl -X POST "https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/store-prerender-snapshot" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "path": "/companies/kontakt-home",
    "html": "<!DOCTYPE html>..."
  }'
```

---

## 3. Serve to Crawlers

### Recommended HTTP Headers

```
Content-Type: text/html; charset=utf-8
Cache-Control: public, max-age=604800
X-Prerender-Snapshot: true
X-Snapshot-Date: 2025-11-07T11:30:00Z
```

### Bot User-Agents to Serve Snapshot

Serve the prerendered snapshot to these bots:
- **Googlebot** - `Googlebot/2.1`
- **Bingbot** - `bingbot`
- **YandexBot** - `YandexBot`
- **FacebookExternalHit** - `facebookexternalhit`
- **Twitterbot** - `Twitterbot`
- **LinkedInBot** - `LinkedInBot`

### Cloudflare Worker Implementation

Update your worker to serve the snapshot:

```javascript
// In your Cloudflare Worker
const BOT_USER_AGENTS = [
  'googlebot', 'bingbot', 'yandexbot', 
  'facebookexternalhit', 'twitterbot', 'linkedinbot'
];

function isBot(userAgent) {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  if (isBot(userAgent) && url.pathname === '/companies/kontakt-home') {
    // Fetch from Supabase or serve static file
    const snapshot = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/store-prerender-snapshot/companies/kontakt-home');
    
    return new Response(await snapshot.text(), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=604800',
        'X-Prerender-Snapshot': 'true',
      }
    });
  }
  
  // Normal request
  return fetch(request);
}
```

---

## 4. Verification Guide

### Test with Googlebot User-Agent

```bash
# Test the prerendered snapshot
curl -A "Googlebot/2.1 (+http://www.google.com/bot.html)" \
  -L "https://jooble.az/companies/kontakt-home" \
  -I
```

**Expected headers:**
```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: public, max-age=604800
X-Prerender-Snapshot: true
```

### Fetch and Verify Content

```bash
# Get full HTML content
curl -A "Googlebot/2.1" \
  "https://jooble.az/companies/kontakt-home" \
  > test-output.html

# Verify SEO elements
grep -E '<title>|<meta name="description"|<script type="application/ld\+json"' test-output.html
```

### Test from Supabase Storage

```bash
# If uploaded to Supabase
curl "https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/store-prerender-snapshot/companies/kontakt-home" -I
```

---

## 5. Snapshot Maintenance

### TTL: 7 Days
- **Created:** 2025-11-07
- **Expires:** 2025-11-14
- **Manual refresh required**

### When to Refresh
Regenerate snapshot when:
- Company information changes
- New jobs are posted
- Design/layout updates
- 7-day TTL expires

### Refresh Command
```bash
node scripts/capture-prerender.js
```

---

## 6. Dynamic Content Notes

**Elements requiring frequent updates:**
- ✅ Job listings (refresh weekly)
- ✅ Company description
- ✅ Contact information
- ✅ Company logo/images

**Recommendation:**
- Core company page: 7-day snapshot ✅
- Job listings: Consider separate dynamic rendering or shorter TTL (1-2 days)
- Homepage: Daily snapshot recommended

---

## 7. Monitoring

### Check Snapshot Health

```bash
# Check if snapshot exists
curl -I "https://jooble.az/companies/kontakt-home"

# View snapshot metadata
curl "https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/store-prerender-snapshot/companies/kontakt-home" \
  -H "Authorization: Bearer YOUR_KEY"
```

### Google Search Console
Monitor how Google sees the page:
1. Go to Google Search Console
2. Use URL Inspection tool
3. Request indexing after snapshot updates

---

## Quick Reference

| Action | Command |
|--------|---------|
| Capture snapshot | `node scripts/capture-prerender.js` |
| Test as Googlebot | `curl -A "Googlebot/2.1" https://jooble.az/companies/kontakt-home -I` |
| Upload to Supabase | See section 2 |
| Verify headers | `curl -I https://jooble.az/companies/kontakt-home` |

---

## Deliverables Checklist

- ✅ `public/kontakt-home-prerender.html` - Static HTML file
- ✅ `scripts/capture-prerender.js` - Automated capture script
- ✅ `supabase/functions/store-prerender-snapshot/` - Edge function for storage
- ✅ HTTP header recommendations documented
- ✅ Bot user-agent list provided
- ✅ Verification commands included
- ✅ 7-day TTL configured
- ✅ Dynamic content notes added
