import { useState } from "react";
import dayjs from "dayjs";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAppQuery as useQuery } from "@/hooks/use-app-query";
import { commissionQueries } from "@/api/commission/queries";
import { WEEK_KOR } from '@/constants/week';

const getDateColorClass = (deadline: string) => {
  const today = dayjs().startOf('day');
  const deadlineDate = dayjs(deadline);
  if (deadlineDate.isBefore(today)) {
    // Past: purple
    return "bg-[hsl(var(--status-delivered)/0.12)] text-[hsl(var(--status-delivered))] border-[hsl(var(--status-delivered)/0.25)]";
  }
  // Today or future: orange
  return "bg-[hsl(var(--warning)/0.12)] text-[hsl(var(--warning))] border-[hsl(var(--warning)/0.25)]";
};

export default function CalendarView() {
  const navigate = useNavigate();
  const today = dayjs();

  const [currentDate, setCurrentDate] = useState(dayjs().startOf('month'));

  const { data: commissions = [] } = useQuery(commissionQueries.getCommissions());

  const year = currentDate.year();
  const month = currentDate.month();

  const firstDay = dayjs().year(year).month(month).date(1).day();
  const daysInMonth = dayjs().year(year).month(month).daysInMonth();
  const prevMonthDays = dayjs().year(year).month(month - 1).daysInMonth();

  const goTo = (offset: number) =>
    setCurrentDate(currentDate.add(offset, 'month').startOf('month'));

  const getCommissionsForDate = (dateStr: string) =>
    commissions.filter((c) => dayjs(c.deadline).format('YYYY-MM-DD') === dateStr);

  const formatDate = (d: number) => {
    const m = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${year}-${m}-${dd}`;
  };

  const isToday = (d: number) => {
    return year === today.year() && month === today.month() && d === today.date();
  };

  const cells: { day: number; currentMonth: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, currentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, currentMonth: false });
    }
  }

  // Stats
  const monthCommissions = commissions?.filter((c) => {
    const d = dayjs(c.deadline);
    return d.year() === year && d.month() === month;
  });

  return (
    <AppLayout>
      <PageHeader title="캘린더" description="마감일 기준으로 의뢰를 한눈에 확인하세요" />

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="hover:bg-foreground/5" onClick={() => goTo(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-display font-bold text-xl tabular-nums">
          {year}년 {month + 1}월
        </h2>
        <Button variant="ghost" size="icon" className="hover:bg-foreground/5" onClick={() => goTo(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        </div>
        <Button variant="ghost" size="sm" className="hover:bg-foreground/5" onClick={() => setCurrentDate(dayjs().startOf('month'))}>
          오늘
        </Button>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-muted/40">
        <span className="text-sm text-muted-foreground">이번 달 마감</span>
        <span className="text-sm font-display font-bold">{monthCommissions.length}건</span>
      </div>

      {/* Calendar Grid */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-0">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {WEEK_KOR.map((w, i) => (
              <div
                key={w}
                className={cn(
                  "py-2 text-center text-xs font-display font-semibold uppercase tracking-wider",
                  i === 0 && "text-destructive",
                  i === 6 && "text-[hsl(var(--warning))]"
                )}
              >
                {w}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7">
            {cells.map((cell, idx) => {
              const dateStr = cell.currentMonth ? formatDate(cell.day) : "";
              const commissions = cell.currentMonth ? getCommissionsForDate(dateStr) : [];
              const dayOfWeek = idx % 7;

              return (
                <div
                  key={idx}
                  className={cn(
                    "min-h-[150px] p-1.5 border-b border-r border-border/50 transition-colors",
                    !cell.currentMonth && "bg-muted/30",
                    cell.currentMonth && "hover:bg-muted/20"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-7 h-7 text-xs rounded-full mb-1",
                      !cell.currentMonth && "text-muted-foreground/40",
                      cell.currentMonth && dayOfWeek === 0 && "text-destructive",
                      cell.currentMonth && dayOfWeek === 6 && "text-[hsl(var(--warning))]",
                      isToday(cell.day) && cell.currentMonth && "bg-foreground text-background font-bold ring-2 ring-foreground/20 ring-offset-2 ring-offset-background"
                    )}
                  >
                    {cell.day}
                  </span>
                  {isToday(cell.day) && cell.currentMonth && (
                    <div className="flex items-center gap-0.5 mb-1">
                      <Star className="h-2.5 w-2.5 text-[hsl(var(--warning))] fill-[hsl(var(--warning))]" />
                      <span className="text-[9px] font-bold text-foreground">오늘</span>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {commissions.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className={cn(
                          "text-xs leading-tight px-1.5 py-0.5 rounded border cursor-pointer truncate font-medium transition-opacity hover:opacity-80",
                          getDateColorClass(c.deadline)
                        )}
                        onClick={() => navigate(`/commissions/${c.id}`)}
                        title={`${c.songs?.title ?? c.title} — ${c.arrangement}`}
                      >
                        {c.songs?.title ?? c.title}
                      </div>
                    ))}
                    {commissions.length > 3 && (
                      <span className="text-[10px] text-muted-foreground pl-1">
                        +{commissions.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
