
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";

// Lazy load all components for better performance
import { lazy, Suspense } from "react";

// Main pages - critical for SEO, load immediately
import Index from "./pages/Index";

// Non-critical pages - lazy load
const Categories = lazy(() => import("./pages/Categories"));
const Companies = lazy(() => import("./pages/Companies"));
const About = lazy(() => import("./pages/About"));
const Pricing = lazy(() => import("./pages/Pricing"));
const CVBuilder = lazy(() => import("./pages/CVBuilder"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SavedJobs = lazy(() => import("./pages/SavedJobs"));
const Referral = lazy(() => import("./pages/Referral"));

// XML/SEO pages - can be lazy loaded
const Sitemap = lazy(() => import("./pages/Sitemap"));
const SitemapJooble = lazy(() => import("./pages/SitemapJooble"));
const RobotsTxt = lazy(() => import("./pages/RobotsTxt"));

// Admin components - definitely lazy load
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminJobs = lazy(() => import("./pages/admin/Jobs"));
const AdminCompanies = lazy(() => import("./pages/admin/Companies"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminPricing = lazy(() => import("./pages/admin/Pricing"));
const AdminAdvertisements = lazy(() => import("./pages/admin/Advertisements"));
const AdminSitemap = lazy(() => import("./pages/admin/Sitemap"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));

const queryClient = new QueryClient();

// Common loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="/vacancies" element={<Index />} />
            <Route path="/vacancies/:jobSlug" element={<Index />} />
            <Route path="/categories" element={
              <Suspense fallback={<LoadingFallback />}>
                <Categories />
              </Suspense>
            } />
            <Route path="/categories/:category" element={
              <Suspense fallback={<LoadingFallback />}>
                <Categories />
              </Suspense>
            } />
            <Route path="/categories/:category/vacancy/:jobSlug" element={
              <Suspense fallback={<LoadingFallback />}>
                <Categories />
              </Suspense>
            } />
            <Route path="/companies" element={
              <Suspense fallback={<LoadingFallback />}>
                <Companies />
              </Suspense>
            } />
            <Route path="/companies/:company" element={
              <Suspense fallback={<LoadingFallback />}>
                <Companies />
              </Suspense>
            } />
            <Route path="/companies/:company/vacancies" element={
              <Suspense fallback={<LoadingFallback />}>
                <Companies />
              </Suspense>
            } />
            <Route path="/companies/:company/vacancy/:jobSlug" element={
              <Suspense fallback={<LoadingFallback />}>
                <Companies />
              </Suspense>
            } />
            <Route path="/favorites" element={
              <Suspense fallback={<LoadingFallback />}>
                <SavedJobs />
              </Suspense>
            } />
            <Route path="/favorites/:jobId" element={
              <Suspense fallback={<LoadingFallback />}>
                <SavedJobs />
              </Suspense>
            } />
            <Route path="/bildirisler" element={<Index />} />
            <Route path="/cv-builder" element={
              <Suspense fallback={<LoadingFallback />}>
                <CVBuilder />
              </Suspense>
            } />
            <Route path="/services" element={
              <Suspense fallback={<LoadingFallback />}>
                <Pricing />
              </Suspense>
            } />
            <Route path="/referral" element={
              <Suspense fallback={<LoadingFallback />}>
                <Referral />
              </Suspense>
            } />
            <Route path="/about" element={
              <Suspense fallback={<LoadingFallback />}>
                <About />
              </Suspense>
            } />
          </Route>
          {/* Sitemap routes - outside Layout */}
          <Route path="/sitemap.xml" element={
            <Suspense fallback={<LoadingFallback />}>
              <Sitemap />
            </Suspense>
          } />
          <Route path="/sitemapjooble.xml" element={
            <Suspense fallback={<LoadingFallback />}>
              <SitemapJooble />
            </Suspense>
          } />
          <Route path="/robots.txt" element={
            <Suspense fallback={<LoadingFallback />}>
              <RobotsTxt />
            </Suspense>
          } />
          {/* Admin routes - outside Layout */}
          <Route path="/admin/login" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminLogin />
            </Suspense>
          } />
          <Route path="/admin/dashboard" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminDashboard />
            </Suspense>
          } />
          <Route path="/admin/jobs" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminJobs />
            </Suspense>
          } />
          <Route path="/admin/companies" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminCompanies />
            </Suspense>
          } />
          <Route path="/admin/categories" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminCategories />
            </Suspense>
          } />
          <Route path="/admin/pricing" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminPricing />
            </Suspense>
          } />
          <Route path="/admin/advertisements" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminAdvertisements />
            </Suspense>
          } />
          <Route path="/admin/sitemap" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminSitemap />
            </Suspense>
          } />
          <Route path="/admin/settings" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminSettings />
            </Suspense>
          } />
          <Route path="*" element={
            <Suspense fallback={<LoadingFallback />}>
              <NotFound />
            </Suspense>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
