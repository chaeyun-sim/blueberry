import { LayoutDashboard, ClipboardList, Music, PlusCircle, BarChart3, CalendarDays, Sun, Moon } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "대시보드", url: "/", icon: LayoutDashboard },
  { title: "의뢰 목록", url: "/commissions", icon: ClipboardList },
  { title: "악보 관리", url: "/scores", icon: Music },
  { title: "캘린더", url: "/calendar", icon: CalendarDays },
  { title: "매출 통계", url: "/stats", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="flex h-14 items-center gap-2 px-4 border-b border-sidebar-border">
        <Music className="h-6 w-6 text-primary shrink-0" />
        {!collapsed && (
          <span className="font-display font-bold text-lg tracking-tight truncate">
            ScoreFlow
          </span>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.url === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.url)
                    }
                    tooltip={item.title}
                  >
                    <NavLink to={item.url} end={item.url === "/"}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="새 의뢰" className="h-12">
              <NavLink to="/new">
                <PlusCircle className="h-4 w-4" />
                <span>새 의뢰</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <div className="my-1" />
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={theme === "dark" ? "라이트 모드" : "다크 모드"}
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span>{theme === "dark" ? "라이트 모드" : "다크 모드"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
