import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  bottomBar?: React.ReactNode;
}

export function AppLayout({ children, bottomBar }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-6 animate-fade-in">
            {children}
          </main>
          {bottomBar}
        </div>
      </div>
    </SidebarProvider>
  );
}
