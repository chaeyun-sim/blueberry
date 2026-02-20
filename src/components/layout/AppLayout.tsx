import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  bottomBar?: React.ReactNode;
}

export function AppLayout({ children, bottomBar }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {isMobile && (
            <header className="flex items-center h-12 px-4 border-b border-border">
              <SidebarTrigger className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
            </header>
          )}
          <main className="flex-1 p-6 animate-fade-in overflow-hidden">
            {children}
          </main>
          {bottomBar}
        </div>
      </div>
    </SidebarProvider>
  );
}
