import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CommissionList from "./pages/CommissionList";
import CommissionRegister from "./pages/CommissionRegister";
import CommissionDetail from "./pages/CommissionDetail";
import ScoreList from "./pages/ScoreList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/commissions" element={<CommissionList />} />
          <Route path="/commissions/new" element={<CommissionRegister />} />
          <Route path="/commissions/:id" element={<CommissionDetail />} />
          <Route path="/scores" element={<ScoreList />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
