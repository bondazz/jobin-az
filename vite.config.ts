import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { analyzer } from "vite-bundle-analyzer";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  publicDir: 'public',
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
  plugins: [
    react(),
    (command === 'serve' && mode === 'development') && componentTagger(),
    (command === 'serve' && mode === 'development') && analyzer({
      analyzerMode: 'server',
      openAnalyzer: false
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.jpg', 'favicon.ico'],
      manifest: {
        name: 'Jooble',
        short_name: 'Jooble',
        description: 'İş elanları və vakansiyalar - Jooble.az',
        theme_color: '#1a1a1a',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icons/icon-192x192.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512x512.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,jpg,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/igrtzfvphltnoiwedbtz\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 saat
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    modulePreload: {
      polyfill: true,
      resolveDependencies: (filename, deps) => {
        // Preload critical chunks for faster navigation
        return deps.filter(dep => !dep.includes('admin'));
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'supabase-vendor': ['@supabase/supabase-js'],
          // Admin pages in separate chunk
          'admin': [
            './src/pages/admin/Login',
            './src/pages/admin/Dashboard', 
            './src/pages/admin/Jobs',
            './src/pages/admin/Companies',
            './src/pages/admin/Categories',
            './src/pages/admin/Pricing',
            './src/pages/admin/Advertisements',
            './src/pages/admin/Sitemap',
            './src/pages/admin/Settings'
          ]
        }
      }
    },
    target: 'esnext',
    minify: mode === 'production' ? 'esbuild' : false
  }
}));
