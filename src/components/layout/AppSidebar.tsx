import { PlusCircle, Sun, Moon, LogIn, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from '@/hooks/use-theme';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo.webp";
import { useAuth } from '@/hooks/use-auth';
import { navItems } from '@/constants/nav-items';

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { session, loading: authLoading, isGuest, exitGuestMode } = useAuth();

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? location.pathname === item.url : location.pathname.startsWith(item.url);

  if (authLoading) return null;

  function renderAuthButton() {
    if (session) {
      return (
        <button
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-sidebar-border bg-sidebar-foreground/8 hover:bg-sidebar-foreground/12 transition-colors"
          onClick={() => navigate('/settings')}
        >
          <img src={logoImg} alt="로고" className="h-3.5 w-3.5 shrink-0 object-contain" />
          <p className="flex-1 min-w-0 text-left text-sm md:text-xs text-sidebar-foreground truncate">{session?.user?.email}</p>
        </button>
      );
    }
    if (isGuest) {
      return (
        <button
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-sidebar-border bg-sidebar-foreground/8 hover:bg-sidebar-foreground/12 transition-colors"
          onClick={() => { exitGuestMode(); navigate('/login'); }}
        >
          <div className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
            <LogOut className="h-3.5 w-3.5" />
          </div>
          <p className="flex-1 min-w-0 text-left text-sm md:text-xs text-sidebar-foreground truncate">게스트</p>
        </button>
      );
    }
    return (
      <button
        onClick={() => navigate("/login")}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-foreground/5 border border-transparent transition-all duration-150"
      >
        <LogIn className="h-4 w-4 shrink-0" />
        <span>로그인</span>
      </button>
    );
  }

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-4 border-b border-sidebar-border" style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(3.5rem + env(safe-area-inset-top))' }}>
        <img src={logoImg} alt="로고" className="shrink-0 object-contain" style={{ width: 28, height: 28 }} />
        <span className="font-display font-bold text-lg tracking-tight truncate">
          BlueBerry
        </span>
      </div>

      <SidebarContent className="px-3 py-4">
        <div className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <button
              key={item.title}
              onClick={() => navigate(item.url)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all duration-150",
                "hover:bg-sidebar-foreground/10",
                isActive(item)
                  ? "bg-sidebar-foreground/12 text-sidebar-primary font-semibold"
                  : "text-sidebar-foreground"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 shrink-0",
                isActive(item) ? "text-sidebar-primary" : ""
              )} />
              <span>{item.title}</span>
            </button>
          ))}
        </div>

        {!isGuest && (
          <button
            onClick={() => navigate("/new")}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity mt-3"
          >
            <PlusCircle className="h-4 w-4 shrink-0" />
            <span>새 의뢰</span>
          </button>
        )}
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4">
        <div className="flex flex-col gap-1.5">
          {/* 다크/라이트 모드 */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-foreground/10 border border-transparent transition-all duration-150"
            aria-label="테마 변경"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            <span>{theme === "dark" ? "라이트 모드" : "다크 모드"}</span>
          </button>

          {renderAuthButton()}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}