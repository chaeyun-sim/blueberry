import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
  bottomBar?: React.ReactNode;
}

export function AppLayout({ children, bottomBar }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {isMobile && (
            <header className="flex items-center h-12 px-4 border-b border-border">
              <SidebarTrigger className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="사이드바 열기">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
            </header>
          )}
          <main className="flex-1 overflow-y-auto md:h-screen md:overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="p-6 md:h-full md:overflow-auto"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
          {bottomBar}
        </div>
      </div>
    </SidebarProvider>
  );
}
