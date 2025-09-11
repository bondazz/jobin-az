import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import PerformanceOptimizer from './components/PerformanceOptimizer'

createRoot(document.getElementById("root")!).render(
  <>
    <PerformanceOptimizer />
    <App />
  </>
);

// Register Service Worker to mirror sitemap XML without redirect
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
    .then((registration) => {
      // Force update if there's already a service worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker installed, reload to activate
              window.location.reload();
            }
          });
        }
      });

      // Check for immediate activation
      if (registration.active && !navigator.serviceWorker.controller) {
        window.location.reload();
      }
    })
    .catch((err) => {
      console.error('Service worker registration failed:', err);
    });
}
