
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
            <Route path="/vacancies/:job" element={<Index />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:category" element={<Categories />} />
          <Route path="/categories/:category/vacancy/:job" element={<Categories />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:company" element={<Companies />} />
          <Route path="/companies/:company/vacancy/:job" element={<Companies />} />
           <Route path="/favorites" element={
             <Suspense fallback={<div>Loading...</div>}>
               <SavedJobs />
             </Suspense>
           } />
            <Route path="/bildirisler" element={<Index />} />
            <Route path="/qiymetler" element={<Pricing />} />
            <Route path="/haqqinda" element={<About />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
