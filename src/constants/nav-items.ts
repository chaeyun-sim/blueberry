import { LayoutDashboard, CalendarDays, ClipboardList, BarChart3, Archive, Sparkles } from 'lucide-react';

export const navItems = [
  { title: "대시보드", url: "/", icon: LayoutDashboard, exact: true },
  { title: "캘린더", url: "/calendar", icon: CalendarDays },
  { title: "의뢰 목록", url: "/commissions", icon: ClipboardList },
  { title: "매출 통계", url: "/stats", icon: BarChart3 },
  { title: "파일 관리", url: "/files", icon: Archive },
  { title: "음악 추천", url: "/recommend", icon: Sparkles },
];