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

// Force Service Worker Update
if ('serviceWorker' in navigator) {
  // Unregister existing service workers first
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach(registration => registration.unregister());
  }).then(() => {
    // Register new service worker
    navigator.serviceWorker.register('/sw.js?v=2', { 
      updateViaCache: 'none',
      scope: '/' 
    })
      .then((registration) => {
        console.log('Service Worker registered successfully');
        
        // Force immediate activation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                console.log('New Service Worker activated');
                // Force refresh to use new service worker
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
  });
}
