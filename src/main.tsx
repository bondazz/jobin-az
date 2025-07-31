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
