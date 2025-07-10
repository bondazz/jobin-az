
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="/vakansiyalar" element={<Index />} />
            <Route path="/vakansiyalar/:slug" element={<Index />} />
            <Route path="/kateqoriyalar" element={<Categories />} />
            <Route path="/kateqoriyalar/:category" element={<Index />} />
            <Route path="/sirketler" element={<Companies />} />
            <Route path="/sirketler/:company" element={<Companies />} />
            <Route path="/saxlanilan" element={<Index />} />
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
