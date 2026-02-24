import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import CommissionList from "./pages/CommissionList";
import CommissionRegister from "./pages/CommissionRegister";
import CommissionDetail from "./pages/CommissionDetail";
import CommissionEdit from "./pages/CommissionEdit";
import Files from "./pages/Files";
import ScoreDetail from "./pages/ScoreDetail";
import ScoreRegister from "./pages/ScoreRegister";
import SalesStats from "./pages/SalesStats";
import CalendarView from "./pages/CalendarView";
import MusicRecommend from "./pages/MusicRecommend";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { OverlayProvider } from 'overlay-kit';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { queryClient } from './utils/query-client';

function Protected({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

const App = () => (
  <ErrorBoundary
    level="global"
    onError={(error, info) => {
      console.error('Global Error:', error, info);
    }}
  >
    <QueryClientProvider client={queryClient}>
      <Analytics />
      <SpeedInsights />
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <OverlayProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Protected><Index /></Protected>} />
                  <Route path="/commissions" element={<Protected><CommissionList /></Protected>} />
                  <Route path="/new" element={<Protected><CommissionRegister /></Protected>} />
                  <Route path="/commissions/:id" element={<Protected><CommissionDetail /></Protected>} />
                  <Route path="/commissions/:id/edit" element={<Protected><CommissionEdit /></Protected>} />
                  <Route path="/files" element={<Protected><Files /></Protected>} />
                  <Route path="/scores/:scoreId/arrangements/:arrangementId" element={<Protected><ScoreDetail /></Protected>} />
                  <Route path="/scores/new" element={<Protected><ScoreRegister /></Protected>} />
                  <Route path="/stats" element={<Protected><SalesStats /></Protected>} />
                  <Route path="/calendar" element={<Protected><CalendarView /></Protected>} />
                  <Route path="/recommend" element={<Protected><MusicRecommend /></Protected>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </OverlayProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
