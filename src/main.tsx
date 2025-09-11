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
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('Service worker registration failed:', err);
    });
  });
}
