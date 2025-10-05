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

// Register Service Worker for sitemap handling only (non-blocking)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { 
      updateViaCache: 'none',
      scope: '/' 
    })
      .then((registration) => {
        console.log('Service Worker registered successfully');
        
        // Handle updates silently without forcing reload
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated' && !navigator.serviceWorker.controller) {
                // Only claim clients, don't force reload
                console.log('New Service Worker activated');
              }
            });
          }
        });
      })
      .catch((err) => {
        console.error('Service worker registration failed:', err);
      });
  });
}
