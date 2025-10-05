import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { analyzer } from "vite-bundle-analyzer";

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
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
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
    // Target modern browsers to avoid unnecessary polyfills
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    minify: mode === 'production' ? 'esbuild' : false
  }
}));
