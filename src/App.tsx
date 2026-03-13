import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import ThemeProvider from "@/provider/ThemeProvider";
import AuthProvider from "@/provider/AuthProvider";
import { OverlayProvider } from 'overlay-kit';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { queryClient } from './utils/query-client';
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

function handlePageReset() {
  queryClient.resetQueries();
}

const Index = lazy(() => import("./pages/Index"));
const CommissionList = lazy(() => import("./pages/CommissionList"));
const CommissionRegister = lazy(() => import("./pages/CommissionRegister"));
const CommissionDetail = lazy(() => import("./pages/CommissionDetail"));
const CommissionEdit = lazy(() => import("./pages/CommissionEdit"));
const Files = lazy(() => import("./pages/Files"));
const ScoreDetail = lazy(() => import("./pages/ScoreDetail"));
const ScoreRegister = lazy(() => import("./pages/ScoreRegister"));
const SalesStats = lazy(() => import("./pages/SalesStats"));
const CalendarView = lazy(() => import("./pages/CalendarView"));
const MusicRecommend = lazy(() => import("./pages/MusicRecommend"));
const Login = lazy(() => import("./pages/Login"));
const Settings = lazy(() => import("./pages/Settings"));
const ExcelUploadDetail = lazy(() => import("./pages/ExcelUploadDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

function Protected() {
  return (
    <ProtectedRoute>
      <ErrorBoundary level='page' onReset={handlePageReset}>
        <Outlet />
      </ErrorBoundary>
    </ProtectedRoute>
  );
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
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <OverlayProvider>
                <Suspense>
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
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/files/excel/:uploadId" element={<ExcelUploadDetail />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </Suspense>
              </OverlayProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
