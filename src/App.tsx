import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import CommissionList from "./pages/CommissionList";
import CommissionRegister from "./pages/CommissionRegister";
import CommissionDetail from "./pages/CommissionDetail";
import ScoreList from "./pages/ScoreList";
import ScoreDetail from "./pages/ScoreDetail";
import ScoreRegister from "./pages/ScoreRegister";
import SalesStats from "./pages/SalesStats";
import CalendarView from "./pages/CalendarView";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { OverlayProvider } from 'overlay-kit';

const queryClient = new QueryClient();

// App root
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OverlayProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/commissions" element={<CommissionList />} />
              <Route path="/new" element={<CommissionRegister />} />
              <Route path="/commissions/:id" element={<CommissionDetail />} />
              <Route path="/scores" element={<ScoreList />} />
              <Route path="/scores/:scoreId/arrangements/:arrangementId" element={<ScoreDetail />} />
              <Route path="/scores/new" element={<ScoreRegister />} />
              <Route path="/stats" element={<SalesStats />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </OverlayProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
