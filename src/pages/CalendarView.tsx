import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CommissionStatus } from "@/components/StatusBadge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CalendarCommission {
  id: string;
  title: string;
  arrangement: string;
  deadline: string;
  status: CommissionStatus;
}

const mockCommissions: CalendarCommission[] = [
  { id: "1", title: "Canon in D", arrangement: "현악 4중주", deadline: "2026-02-21", status: "working" },
  { id: "2", title: "River Flows in You", arrangement: "피아노 솔로", deadline: "2026-02-23", status: "working" },
  { id: "3", title: "Spring Waltz", arrangement: "플룻 듀엣", deadline: "2026-02-19", status: "received" },
  { id: "4", title: "A Thousand Years", arrangement: "현악 5중주", deadline: "2026-02-28", status: "working" },
  { id: "5", title: "Butterfly", arrangement: "클라리넷 트리오", deadline: "2026-03-05", status: "received" },
  { id: "6", title: "Wedding March", arrangement: "브라스 앙상블", deadline: "2026-03-12", status: "complete" },
  { id: "7", title: "Moonlight Sonata", arrangement: "피아노 솔로", deadline: "2026-02-25", status: "received" },
  { id: "8", title: "Ave Maria", arrangement: "소프라노 + 현악", deadline: "2026-02-21", status: "delivered" },
];

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const statusColorClass: Record<CommissionStatus, string> = {
  received: "bg-status-received/20 text-status-received border-status-received/30",
  working: "bg-status-working/20 text-status-working border-status-working/30",
  complete: "bg-status-complete/20 text-status-complete border-status-complete/30",
  delivered: "bg-status-delivered/20 text-status-delivered border-status-delivered/30",
};

export default function CalendarView() {
  const navigate = useNavigate();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const goTo = (offset: number) =>
    setCurrentDate(new Date(year, month + offset, 1));

  const getCommissionsForDate = (dateStr: string) =>
    mockCommissions.filter((c) => c.deadline === dateStr);

  const formatDate = (d: number) => {
    const m = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${year}-${m}-${dd}`;
  };

  const isToday = (d: number) => {
    return year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
  };

  // Build calendar grid
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
  const monthCommissions = mockCommissions.filter((c) => {
    const d = new Date(c.deadline);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  return (
    <AppLayout>
      <PageHeader title="캘린더" description="마감일 기준으로 의뢰를 한눈에 확인하세요" />

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => goTo(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-display font-bold text-xl tabular-nums">
            {year}년 {month + 1}월
          </h2>
          <Button variant="outline" size="icon" onClick={() => goTo(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))}>
          오늘
        </Button>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-card border border-border/50">
        <span className="text-sm text-muted-foreground">이번 달 마감</span>
        <span className="text-sm font-display font-bold">{monthCommissions.length}건</span>
      </div>

      {/* Calendar Grid */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-0">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {WEEKDAYS.map((w, i) => (
              <div
                key={w}
                className={cn(
                  "py-2 text-center text-xs font-display font-semibold uppercase tracking-wider",
                  i === 0 && "text-destructive",
                  i === 6 && "text-status-received"
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
                    "min-h-[100px] p-1.5 border-b border-r border-border/50 transition-colors",
                    !cell.currentMonth && "bg-muted/30",
                    cell.currentMonth && "hover:bg-muted/20"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-7 h-7 text-xs rounded-full mb-1",
                      !cell.currentMonth && "text-muted-foreground/40",
                      cell.currentMonth && dayOfWeek === 0 && "text-destructive",
                      cell.currentMonth && dayOfWeek === 6 && "text-status-received",
                      isToday(cell.day) && cell.currentMonth && "bg-primary text-primary-foreground font-bold"
                    )}
                  >
                    {cell.day}
                  </span>
                  <div className="space-y-0.5">
                    {commissions.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className="text-[10px] leading-tight px-1.5 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary cursor-pointer truncate font-medium transition-opacity hover:opacity-80"
                        onClick={() => navigate(`/commissions/${c.id}`)}
                        title={`${c.title} — ${c.arrangement}`}
                      >
                        {c.title}
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
