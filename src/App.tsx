
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import Companies from "./pages/Companies";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

// Admin components
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminJobs from "./pages/admin/Jobs";
import AdminCompanies from "./pages/admin/Companies";
import AdminCategories from "./pages/admin/Categories";
import AdminPricing from "./pages/admin/Pricing";
import AdminSettings from "./pages/admin/Settings";

// Lazy load SavedJobs to avoid circular dependency issues
import { lazy, Suspense } from "react";
const SavedJobs = lazy(() => import("./pages/SavedJobs"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="/vacancies" element={<Index />} />
            <Route path="/vacancies/:jobSlug" element={<Index />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:category" element={<Categories />} />
          <Route path="/categories/:category/vacancy/:jobSlug" element={<Categories />} />
           <Route path="/companies" element={<Companies />} />
           <Route path="/companies/:company" element={<Companies />} />
           <Route path="/companies/:company/vacancies" element={<Companies />} />
           <Route path="/companies/:company/vacancy/:jobSlug" element={<Companies />} />
            <Route path="/favorites" element={
              <Suspense fallback={<div>Yüklənir...</div>}>
                <SavedJobs />
              </Suspense>
            } />
            <Route path="/favorites/:jobId" element={
              <Suspense fallback={<div>Yüklənir...</div>}>
                <SavedJobs />
              </Suspense>
            } />
            <Route path="/bildirisler" element={<Index />} />
            <Route path="/services" element={<Pricing />} />
            <Route path="/about" element={<About />} />
          </Route>
          {/* Admin routes - outside Layout */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/companies" element={<AdminCompanies />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/pricing" element={<AdminPricing />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
