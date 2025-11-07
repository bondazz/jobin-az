/**
 * Local script to capture prerendered HTML using Puppeteer
 * 
 * Install: npm install puppeteer
 * Run: node scripts/capture-prerender.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  url: 'https://jooble.az/companies/kontakt-home',
  outputFile: 'kontakt-home-prerender.html',
  waitUntil: 'networkidle0', // Wait until network is idle
  timeout: 30000,
};

async function capturePrerender() {
  console.log(`🚀 Starting prerender capture for: ${CONFIG.url}`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set user agent to simulate Googlebot
    await page.setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
    
    console.log('📄 Loading page...');
    await page.goto(CONFIG.url, {
      waitUntil: CONFIG.waitUntil,
      timeout: CONFIG.timeout
    });
    
    // Wait a bit more for any final JS rendering
    await page.waitForTimeout(2000);
    
    console.log('✅ Page loaded, extracting HTML...');
    
    // Get the full rendered HTML
    const html = await page.content();
    
    // Save to file
    const outputPath = path.join(__dirname, '..', 'public', CONFIG.outputFile);
    fs.writeFileSync(outputPath, html, 'utf-8');
    
    console.log(`💾 Saved to: ${outputPath}`);
    console.log(`📊 File size: ${(html.length / 1024).toFixed(2)} KB`);
    
    // Extract key SEO elements
    const title = await page.title();
    const metaDescription = await page.$eval('meta[name="description"]', el => el.content).catch(() => 'N/A');
    const canonical = await page.$eval('link[rel="canonical"]', el => el.href).catch(() => 'N/A');
    const jsonLd = await page.$$eval('script[type="application/ld+json"]', scripts => 
      scripts.map(s => s.textContent)
    ).catch(() => []);
    
    console.log('\n📋 SEO Elements:');
    console.log(`   Title: ${title}`);
    console.log(`   Description: ${metaDescription}`);
    console.log(`   Canonical: ${canonical}`);
    console.log(`   JSON-LD schemas: ${jsonLd.length}`);
    
    // Upload to Supabase (optional)
    console.log('\n📤 To upload to Supabase, run:');
    console.log(`curl -X POST "https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/store-prerender-snapshot" \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \\`);
    console.log(`  -d '{"path": "/companies/kontakt-home", "html": "..."}'`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
    console.log('\n✨ Done!');
  }
}

// Run
capturePrerender().catch(console.error);
