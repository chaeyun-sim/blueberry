import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge, CommissionStatus } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ClipboardList, Clock, Truck, CheckCircle2, AlertTriangle, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusCards: { status: CommissionStatus; icon: typeof ClipboardList; count: number; label: string }[] = [
  { status: "received", icon: ClipboardList, count: 3, label: "대기" },
  { status: "working", icon: Clock, count: 5, label: "작업중" },
  { status: "complete", icon: CheckCircle2, count: 12, label: "완료" },
  { status: "delivered", icon: Truck, count: 2, label: "납품" },
];

const urgentCommissions = [
  { id: "1", title: "Canon in D", arrangement: "현악 4중주", deadline: "2026-02-21", daysLeft: 2 },
  { id: "2", title: "River Flows in You", arrangement: "피아노 솔로", deadline: "2026-02-23", daysLeft: 4 },
];

const recentActivity = [
  { id: "1", title: "Spring Waltz", arrangement: "플룻 듀엣", status: "received" as CommissionStatus, date: "2026-02-19" },
  { id: "2", title: "A Thousand Years", arrangement: "현악 5중주", status: "working" as CommissionStatus, date: "2026-02-18" },
  { id: "3", title: "Canon in D", arrangement: "현악 4중주", status: "working" as CommissionStatus, date: "2026-02-17" },
  { id: "4", title: "Butterfly", arrangement: "클라리넷 트리오", status: "complete" as CommissionStatus, date: "2026-02-16" },
  { id: "5", title: "Wedding March", arrangement: "브라스 앙상블", status: "complete" as CommissionStatus, date: "2026-02-15" },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <PageHeader title="대시보드" description="의뢰 현황을 한눈에 확인하세요">
        <Button onClick={() => navigate("/commissions/new")} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          새 의뢰
        </Button>
      </PageHeader>

      {/* Status Count Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statusCards.map((item) => (
          <Card key={item.status} className="hover-lift cursor-pointer border-border/50" onClick={() => navigate("/commissions")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <StatusBadge status={item.status} />
              </div>
              <p className="text-3xl font-display font-bold animate-count-up">{item.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Urgent Deadlines */}
      {urgentCommissions.length > 0 && (
        <Card className="mb-8 border-destructive/30 bg-destructive/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="font-display font-semibold text-lg">마감 임박</h2>
            </div>
            <div className="space-y-3">
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
                    <p className="text-sm font-medium text-destructive">D-{c.daysLeft}</p>
                    <p className="text-xs text-muted-foreground">{c.deadline}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="border-border/50">
        <CardContent className="p-5">
          <h2 className="font-display font-semibold text-lg mb-4">최근 활동</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase tracking-wider">곡명</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">편성</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">상태</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">날짜</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/commissions/${item.id}`)}
                >
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-muted-foreground">{item.arrangement}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Dashboard;
