import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
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

function Protected() {
  return <ProtectedRoute><Outlet /></ProtectedRoute>;
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
                  <Route element={<Protected />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/commissions" element={<CommissionList />} />
                    <Route path="/new" element={<CommissionRegister />} />
                    <Route path="/commissions/:id" element={<CommissionDetail />} />
                    <Route path="/commissions/:id/edit" element={<CommissionEdit />} />
                    <Route path="/files" element={<Files />} />
                    <Route path="/scores/:scoreId/arrangements/:arrangementId" element={<ScoreDetail />} />
                    <Route path="/scores/new" element={<ScoreRegister />} />
                    <Route path="/stats" element={<SalesStats />} />
                    <Route path="/calendar" element={<CalendarView />} />
                    <Route path="/recommend" element={<MusicRecommend />} />
                  </Route>
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
