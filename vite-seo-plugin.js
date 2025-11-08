// Vite plugin to inject dynamic meta tags into index.html for different routes
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

export default function viteSeoPlugin() {
  return {
    name: 'vite-seo-plugin',
    
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const userAgent = req.headers['user-agent'] || '';
        const isBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot/i.test(userAgent);
        
        // Only process bot requests
        if (!isBot || !req.url.startsWith('/')) {
          return next();
        }

        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const pathname = req.url.split('?')[0];
          const pathParts = pathname.split('/').filter(Boolean);

          let pageData = null;

          // Fetch page-specific data
          if (pathParts[0] === 'companies' && pathParts[1]) {
            const { data } = await supabase
              .from('companies')
              .select('*')
              .eq('slug', pathParts[1])
              .eq('is_active', true)
              .single();
            
            if (data) {
              pageData = {
                title: data.seo_title || `${data.name} | Şirkət Profili`,
                description: data.seo_description || data.description,
                keywords: data.seo_keywords?.join(', ') || data.name
              };
            }
          } else if (pathParts[0] === 'categories' && pathParts[1]) {
            const { data } = await supabase
              .from('categories')
              .select('*')
              .eq('slug', pathParts[1])
              .eq('is_active', true)
              .single();
            
            if (data) {
              pageData = {
                title: data.seo_title || `${data.name} Vakansiyaları`,
                description: data.seo_description || data.description,
                keywords: data.seo_keywords?.join(', ') || data.name
              };
            }
          } else if (pathParts[0] === 'vacancies' && pathParts[1]) {
            const { data } = await supabase
              .from('jobs')
              .select('*, company:companies(*)')
              .eq('slug', pathParts[1])
              .eq('is_active', true)
              .single();
            
            if (data) {
              pageData = {
                title: data.seo_title || `${data.title} | ${data.company?.name}`,
                description: data.seo_description || data.description,
                keywords: data.seo_keywords?.join(', ') || data.title
              };
            }
          }

          // Inject meta tags if we have page data
          if (pageData) {
            console.log('🤖 Bot detected, injecting SEO for:', pathname);
            
            // Read index.html
            const fs = await import('fs/promises');
            let html = await fs.readFile('./index.html', 'utf-8');
            
            // Replace title and meta tags
            html = html.replace(
              /<title>.*?<\/title>/,
              `<title>${pageData.title}</title>`
            );
            
            html = html.replace(
              /<meta name="description" content=".*?">/,
              `<meta name="description" content="${pageData.description}">`
            );
            
            html = html.replace(
              /<meta name="keywords" content=".*?">/,
              `<meta name="keywords" content="${pageData.keywords}">`
            );
            
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('X-Prerendered', 'true');
            res.end(html);
            return;
          }
        } catch (error) {
          console.error('SEO plugin error:', error);
        }

        next();
      });
    }
  };
}
