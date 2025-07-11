
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import Companies from "./pages/Companies";
import SavedJobs from "./pages/SavedJobs";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="/vakansiyalar" element={<Index />} />
            <Route path="/vakansiyalar/:job" element={<Index />} />
          <Route path="/kateqoriyalar" element={<Categories />} />
          <Route path="/kateqoriyalar/:category" element={<Categories />} />
          <Route path="/kateqoriyalar/:category/vakansiya/:job" element={<Categories />} />
          <Route path="/sirketler" element={<Companies />} />
          <Route path="/sirketler/:company" element={<Companies />} />
          <Route path="/sirketler/:company/vakansiya/:job" element={<Companies />} />
          <Route path="/saxlanilan" element={<SavedJobs />} />
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
