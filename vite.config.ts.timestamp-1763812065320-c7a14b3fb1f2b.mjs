// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
import { analyzer } from "file:///home/project/node_modules/vite-bundle-analyzer/dist/index.mjs";
import { VitePWA } from "file:///home/project/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ command, mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  publicDir: "public",
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg"],
  plugins: [
    react(),
    command === "serve" && mode === "development" && componentTagger(),
    command === "serve" && mode === "development" && analyzer({
      analyzerMode: "server",
      openAnalyzer: false
    }),
    VitePWA({
      // We already have a custom service worker at /sw.js; avoid conflicts
      injectRegister: false,
      filename: "pwa-sw.js",
      registerType: "autoUpdate",
      includeAssets: ["icons/*.jpg", "favicon.ico"],
      manifest: {
        name: "Jooble",
        short_name: "Jooble",
        description: "\u0130\u015F elanlar\u0131 v\u0259 vakansiyalar - Jooble.az",
        theme_color: "#1a1a1a",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait-primary",
        icons: [
          {
            src: "/icons/icon-192x192.jpg",
            sizes: "192x192",
            type: "image/jpeg",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-512x512.jpg",
            sizes: "512x512",
            type: "image/jpeg",
            purpose: "any maskable"
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    modulePreload: {
      polyfill: true,
      resolveDependencies: (filename, deps) => {
        return deps.filter((dep) => !dep.includes("admin"));
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          "react-vendor": ["react", "react-dom"],
          "router-vendor": ["react-router-dom"],
          "query-vendor": ["@tanstack/react-query"],
          "ui-vendor": ["lucide-react", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          "supabase-vendor": ["@supabase/supabase-js"],
          // Admin pages in separate chunk
          "admin": [
            "./src/pages/admin/Login",
            "./src/pages/admin/Dashboard",
            "./src/pages/admin/Jobs",
            "./src/pages/admin/Companies",
            "./src/pages/admin/Categories",
            "./src/pages/admin/Pricing",
            "./src/pages/admin/Advertisements",
            "./src/pages/admin/Sitemap",
            "./src/pages/admin/Settings"
          ]
        }
      }
    },
    target: "esnext",
    minify: mode === "production" ? "esbuild" : false
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcbmltcG9ydCB7IGFuYWx5emVyIH0gZnJvbSBcInZpdGUtYnVuZGxlLWFuYWx5emVyXCI7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSBcInZpdGUtcGx1Z2luLXB3YVwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfSkgPT4gKHtcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHBvcnQ6IDgwODAsXG4gIH0sXG4gIHB1YmxpY0RpcjogJ3B1YmxpYycsXG4gIGFzc2V0c0luY2x1ZGU6IFsnKiovKi5wbmcnLCAnKiovKi5qcGcnLCAnKiovKi5qcGVnJywgJyoqLyouZ2lmJywgJyoqLyouc3ZnJ10sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIChjb21tYW5kID09PSAnc2VydmUnICYmIG1vZGUgPT09ICdkZXZlbG9wbWVudCcpICYmIGNvbXBvbmVudFRhZ2dlcigpLFxuICAgIChjb21tYW5kID09PSAnc2VydmUnICYmIG1vZGUgPT09ICdkZXZlbG9wbWVudCcpICYmIGFuYWx5emVyKHtcbiAgICAgIGFuYWx5emVyTW9kZTogJ3NlcnZlcicsXG4gICAgICBvcGVuQW5hbHl6ZXI6IGZhbHNlXG4gICAgfSksXG4gICAgVml0ZVBXQSh7XG4gICAgICAvLyBXZSBhbHJlYWR5IGhhdmUgYSBjdXN0b20gc2VydmljZSB3b3JrZXIgYXQgL3N3LmpzOyBhdm9pZCBjb25mbGljdHNcbiAgICAgIGluamVjdFJlZ2lzdGVyOiBmYWxzZSxcbiAgICAgIGZpbGVuYW1lOiAncHdhLXN3LmpzJyxcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxuICAgICAgaW5jbHVkZUFzc2V0czogWydpY29ucy8qLmpwZycsICdmYXZpY29uLmljbyddLFxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgbmFtZTogJ0pvb2JsZScsXG4gICAgICAgIHNob3J0X25hbWU6ICdKb29ibGUnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1x1MDEzMFx1MDE1RiBlbGFubGFyXHUwMTMxIHZcdTAyNTkgdmFrYW5zaXlhbGFyIC0gSm9vYmxlLmF6JyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjMWExYTFhJyxcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNmZmZmZmYnLFxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICAgIHNjb3BlOiAnLycsXG4gICAgICAgIHN0YXJ0X3VybDogJy8nLFxuICAgICAgICBvcmllbnRhdGlvbjogJ3BvcnRyYWl0LXByaW1hcnknLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJy9pY29ucy9pY29uLTE5MngxOTIuanBnJyxcbiAgICAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvanBlZycsXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnL2ljb25zL2ljb24tNTEyeDUxMi5qcGcnLFxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9qcGVnJyxcbiAgICAgICAgICAgIHB1cnBvc2U6ICdhbnkgbWFza2FibGUnXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSlcbiAgXS5maWx0ZXIoQm9vbGVhbiksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBtb2R1bGVQcmVsb2FkOiB7XG4gICAgICBwb2x5ZmlsbDogdHJ1ZSxcbiAgICAgIHJlc29sdmVEZXBlbmRlbmNpZXM6IChmaWxlbmFtZSwgZGVwcykgPT4ge1xuICAgICAgICAvLyBQcmVsb2FkIGNyaXRpY2FsIGNodW5rcyBmb3IgZmFzdGVyIG5hdmlnYXRpb25cbiAgICAgICAgcmV0dXJuIGRlcHMuZmlsdGVyKGRlcCA9PiAhZGVwLmluY2x1ZGVzKCdhZG1pbicpKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAvLyBTcGxpdCB2ZW5kb3IgY2h1bmtzXG4gICAgICAgICAgJ3JlYWN0LXZlbmRvcic6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXG4gICAgICAgICAgJ3JvdXRlci12ZW5kb3InOiBbJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAncXVlcnktdmVuZG9yJzogWydAdGFuc3RhY2svcmVhY3QtcXVlcnknXSxcbiAgICAgICAgICAndWktdmVuZG9yJzogWydsdWNpZGUtcmVhY3QnLCAnQHJhZGl4LXVpL3JlYWN0LWRpYWxvZycsICdAcmFkaXgtdWkvcmVhY3QtZHJvcGRvd24tbWVudSddLFxuICAgICAgICAgICdzdXBhYmFzZS12ZW5kb3InOiBbJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyddLFxuICAgICAgICAgIC8vIEFkbWluIHBhZ2VzIGluIHNlcGFyYXRlIGNodW5rXG4gICAgICAgICAgJ2FkbWluJzogW1xuICAgICAgICAgICAgJy4vc3JjL3BhZ2VzL2FkbWluL0xvZ2luJyxcbiAgICAgICAgICAgICcuL3NyYy9wYWdlcy9hZG1pbi9EYXNoYm9hcmQnLCBcbiAgICAgICAgICAgICcuL3NyYy9wYWdlcy9hZG1pbi9Kb2JzJyxcbiAgICAgICAgICAgICcuL3NyYy9wYWdlcy9hZG1pbi9Db21wYW5pZXMnLFxuICAgICAgICAgICAgJy4vc3JjL3BhZ2VzL2FkbWluL0NhdGVnb3JpZXMnLFxuICAgICAgICAgICAgJy4vc3JjL3BhZ2VzL2FkbWluL1ByaWNpbmcnLFxuICAgICAgICAgICAgJy4vc3JjL3BhZ2VzL2FkbWluL0FkdmVydGlzZW1lbnRzJyxcbiAgICAgICAgICAgICcuL3NyYy9wYWdlcy9hZG1pbi9TaXRlbWFwJyxcbiAgICAgICAgICAgICcuL3NyYy9wYWdlcy9hZG1pbi9TZXR0aW5ncydcbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgbWluaWZ5OiBtb2RlID09PSAncHJvZHVjdGlvbicgPyAnZXNidWlsZCcgOiBmYWxzZVxuICB9XG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFDaEMsU0FBUyxnQkFBZ0I7QUFDekIsU0FBUyxlQUFlO0FBTHhCLElBQU0sbUNBQW1DO0FBUXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsU0FBUyxLQUFLLE9BQU87QUFBQSxFQUNsRCxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsV0FBVztBQUFBLEVBQ1gsZUFBZSxDQUFDLFlBQVksWUFBWSxhQUFhLFlBQVksVUFBVTtBQUFBLEVBQzNFLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNMLFlBQVksV0FBVyxTQUFTLGlCQUFrQixnQkFBZ0I7QUFBQSxJQUNsRSxZQUFZLFdBQVcsU0FBUyxpQkFBa0IsU0FBUztBQUFBLE1BQzFELGNBQWM7QUFBQSxNQUNkLGNBQWM7QUFBQSxJQUNoQixDQUFDO0FBQUEsSUFDRCxRQUFRO0FBQUE7QUFBQSxNQUVOLGdCQUFnQjtBQUFBLE1BQ2hCLFVBQVU7QUFBQSxNQUNWLGNBQWM7QUFBQSxNQUNkLGVBQWUsQ0FBQyxlQUFlLGFBQWE7QUFBQSxNQUM1QyxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxPQUFPO0FBQUEsUUFDUCxXQUFXO0FBQUEsUUFDWCxhQUFhO0FBQUEsUUFDYixPQUFPO0FBQUEsVUFDTDtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSCxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLFVBQVU7QUFBQSxNQUNWLHFCQUFxQixDQUFDLFVBQVUsU0FBUztBQUV2QyxlQUFPLEtBQUssT0FBTyxTQUFPLENBQUMsSUFBSSxTQUFTLE9BQU8sQ0FBQztBQUFBLE1BQ2xEO0FBQUEsSUFDRjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBO0FBQUEsVUFFWixnQkFBZ0IsQ0FBQyxTQUFTLFdBQVc7QUFBQSxVQUNyQyxpQkFBaUIsQ0FBQyxrQkFBa0I7QUFBQSxVQUNwQyxnQkFBZ0IsQ0FBQyx1QkFBdUI7QUFBQSxVQUN4QyxhQUFhLENBQUMsZ0JBQWdCLDBCQUEwQiwrQkFBK0I7QUFBQSxVQUN2RixtQkFBbUIsQ0FBQyx1QkFBdUI7QUFBQTtBQUFBLFVBRTNDLFNBQVM7QUFBQSxZQUNQO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsSUFDUixRQUFRLFNBQVMsZUFBZSxZQUFZO0FBQUEsRUFDOUM7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
