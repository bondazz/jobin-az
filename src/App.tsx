
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Layout from "./components/Layout";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

// Lazy load all components for better performance
import { lazy, Suspense } from "react";

// Main pages - critical for SEO and performance, load immediately
import Index from "./pages/Index";
import Companies from "./pages/Companies";

// Non-critical pages - lazy load
const Categories = lazy(() => import("./pages/Categories"));
const About = lazy(() => import("./pages/About"));
const Pricing = lazy(() => import("./pages/Pricing"));
const CVBuilder = lazy(() => import("./pages/CVBuilder"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SavedJobs = lazy(() => import("./pages/SavedJobs"));
const Referral = lazy(() => import("./pages/Referral"));
const ReferralJobSubmission = lazy(() => import("./pages/ReferralJobSubmission"));

// XML/SEO pages - can be lazy loaded
const Sitemap = lazy(() => import("./pages/Sitemap"));
const SitemapJooble = lazy(() => import("./pages/SitemapJooble"));
const SitemapIndex = lazy(() => import("./pages/SitemapIndex"));
const SitemapMain = lazy(() => import("./pages/SitemapMain"));
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
const AdminReferrals = lazy(() => import("./pages/admin/Referrals"));
const AdminWithdrawals = lazy(() => import("./pages/admin/Withdrawals"));
const AdminReferralJobSubmissions = lazy(() => import("./pages/admin/ReferralJobSubmissions"));
const AdminGoogleIndexing = lazy(() => import("./pages/admin/GoogleIndexing"));

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
      <Toaster />
      <Sonner />
      <PWAInstallPrompt />
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
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:company" element={<Companies />} />
            <Route path="/companies/:company/vacancies" element={<Companies />} />
            <Route path="/companies/:company/vacancy/:jobSlug" element={<Companies />} />
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
            <Route path="/aktiv-vakansiya" element={<Index />} />
            <Route path="/aktiv-vakansiya/:jobSlug" element={<Index />} />
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
            <Route path="/add_job" element={
              <Suspense fallback={<LoadingFallback />}>
                <ReferralJobSubmission />
              </Suspense>
            } />
          <Route path="/about" element={
            <Suspense fallback={<LoadingFallback />}>
              <About />
            </Suspense>
          } />
        </Route>
        {/* XML/SEO routes - outside Layout for direct XML rendering */}
        <Route path="/sitemap_jooble.xml" element={
          <Suspense fallback={<LoadingFallback />}>
            <SitemapJooble />
          </Suspense>
        } />
        <Route path="/sitemap.xml" element={
          <Suspense fallback={<LoadingFallback />}>
            <Sitemap />
          </Suspense>
        } />
        <Route path="/sitemap_index.xml" element={
          <Suspense fallback={<LoadingFallback />}>
            <SitemapIndex />
          </Suspense>
        } />
        <Route path="/sitemap_main.xml" element={
          <Suspense fallback={<LoadingFallback />}>
            <SitemapMain />
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
          <Route path="/admin/referrals" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminReferrals />
            </Suspense>
          } />
          <Route path="/admin/withdrawals" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminWithdrawals />
            </Suspense>
          } />
          <Route path="/admin/referral-jobs" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminReferralJobSubmissions />
            </Suspense>
          } />
          <Route path="/admin/settings" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminSettings />
            </Suspense>
          } />
          <Route path="/admin/google-indexing" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminGoogleIndexing />
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
