import { LayoutDashboard, ClipboardList, Music, PlusCircle, BarChart3, CalendarDays, Sun, Moon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "대시보드", url: "/", icon: LayoutDashboard, exact: true },
  { title: "의뢰 목록", url: "/commissions", icon: ClipboardList },
  { title: "악보 관리", url: "/scores", icon: Music },
  { title: "캘린더", url: "/calendar", icon: CalendarDays },
  { title: "매출 통계", url: "/stats", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? location.pathname === item.url : location.pathname.startsWith(item.url);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-4 border-b border-sidebar-border">
        <Music className="h-6 w-6 text-primary shrink-0" />
        {!collapsed && (
          <span className="font-display font-bold text-lg tracking-tight truncate">
            ScoreFlow
          </span>
        )}
      </div>

      <SidebarContent className="px-3 py-4">
        <div className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <button
              key={item.title}
              onClick={() => navigate(item.url)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                "hover:bg-sidebar-accent",
                isActive(item)
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-sidebar-foreground/70 border border-transparent"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", isActive(item) ? "text-primary" : "")} />
              {!collapsed && <span>{item.title}</span>}
            </button>
          ))}
        </div>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4">
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => navigate("/new")}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <PlusCircle className="h-4 w-4 shrink-0" />
            {!collapsed && <span>새 의뢰</span>}
          </button>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent border border-transparent transition-all duration-150"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            {!collapsed && <span>{theme === "dark" ? "라이트 모드" : "다크 모드"}</span>}
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
