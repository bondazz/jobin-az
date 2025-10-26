// Post-build script for react-snap optimization
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const distDir = './dist';

// Add preconnect links to all HTML files
function addPreconnectLinks() {
  try {
    const files = readdirSync(distDir, { recursive: true });
    
    files.forEach(file => {
      if (file.endsWith('.html')) {
        const filePath = join(distDir, file);
        let html = readFileSync(filePath, 'utf-8');
        
        // Add preconnect only if not exists
        if (!html.includes('rel="preconnect"')) {
          const preconnectLinks = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="https://jooble.az">`;
          
          html = html.replace('</head>', `${preconnectLinks}\n  </head>`);
          writeFileSync(filePath, html);
          console.log(`✓ Added preconnect links to ${file}`);
        }
      }
    });
  } catch (error) {
    console.error('Error adding preconnect links:', error);
  }
}

addPreconnectLinks();
console.log('Post-build optimization complete!');
