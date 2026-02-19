import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge, CommissionStatus } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Clock, Truck, CheckCircle2, AlertTriangle, PlusCircle, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const statusCards: { status: CommissionStatus; icon: typeof ClipboardList; count: number; label: string }[] = [
  { status: "received", icon: ClipboardList, count: 3, label: "대기" },
  { status: "working", icon: Clock, count: 5, label: "작업중" },
  { status: "complete", icon: CheckCircle2, count: 12, label: "완료" },
  { status: "delivered", icon: Truck, count: 2, label: "전달" },
];

const urgentCommissions = [
  { id: "1", title: "Canon in D", arrangement: "현악 4중주", deadline: "2026-02-21", daysLeft: 2 },
  { id: "2", title: "River Flows in You", arrangement: "피아노 솔로", deadline: "2026-02-23", daysLeft: 4 },
  { id: "3", title: "Spring Waltz", arrangement: "플룻 듀엣", deadline: "2026-02-25", daysLeft: 6 },
];

const monthlyData = [
  { month: "9월", count: 8 },
  { month: "10월", count: 14 },
  { month: "11월", count: 11 },
  { month: "12월", count: 18 },
  { month: "1월", count: 15 },
  { month: "2월", count: 10 },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <PageHeader title="대시보드" description="의뢰 현황을 한눈에 확인하세요">
        <Button onClick={() => navigate("/new")} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          새 의뢰
        </Button>
      </PageHeader>

      {/* Status Count Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statusCards.map((item) => (
          <Card key={item.status} className="hover-lift cursor-pointer border-border/50" onClick={() => navigate(`/commissions?status=${item.status}`)}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <StatusBadge status={item.status} />
              </div>
              <p className="text-3xl font-display font-bold">{item.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 1+2 Layout: Urgent (left) + Chart & Sales (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: 마감 임박 (3col) */}
        <Card className="lg:col-span-3 border-destructive/30 bg-destructive/5">
          <CardContent className="p-5 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="font-display font-semibold text-lg">마감 임박</h2>
            </div>
            <div className="space-y-3 flex-1">
              {urgentCommissions.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/80 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/commissions/${c.id}`)}
                >
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-sm text-muted-foreground">{c.arrangement}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-sm font-bold ${
                      c.daysLeft <= 3 ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"
                    }`}>
                      D-{c.daysLeft}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{c.deadline}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Chart + Sales (2col, stacked) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* 미니 차트 */}
          <Card className="border-border/50 flex-1">
            <CardContent className="p-5 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-display font-semibold text-sm">월별 의뢰 추이</h3>
              </div>
              <div className="flex-1 min-h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} barSize={20}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 이번달 매출 */}
          <Card className="border-border/50 hover-lift cursor-pointer" onClick={() => navigate("/stats")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs font-medium">이번 달 매출</span>
                </div>
                <span className="text-xs text-muted-foreground">자세히 →</span>
              </div>
              <p className="text-2xl font-display font-bold mb-1">₩2,340,000</p>
              <p className="text-xs text-[hsl(var(--status-complete))] flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> 전월 대비 +15.2%
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
