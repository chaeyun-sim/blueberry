import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge, CommissionStatus } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, LayoutGrid, List } from "lucide-react";
import { useNavigate } from "react-router-dom";

const tabs: { label: string; value: CommissionStatus | "all" }[] = [
  { label: "전체", value: "all" },
  { label: "접수", value: "received" },
  { label: "작업중", value: "working" },
  { label: "납품", value: "delivered" },
  { label: "완료", value: "complete" },
];

const mockData = [
  { id: "1", title: "Canon in D", client: "김OO", arrangement: "현악 4중주", deadline: "2026-02-21", status: "working" as CommissionStatus },
  { id: "2", title: "River Flows in You", client: "이OO", arrangement: "피아노 솔로", deadline: "2026-02-23", status: "working" as CommissionStatus },
  { id: "3", title: "Spring Waltz", client: "박OO", arrangement: "플룻 듀엣", deadline: "2026-03-01", status: "received" as CommissionStatus },
  { id: "4", title: "A Thousand Years", client: "최OO", arrangement: "현악 5중주", deadline: "2026-02-28", status: "working" as CommissionStatus },
  { id: "5", title: "Butterfly", client: "정OO", arrangement: "클라리넷 트리오", deadline: "2026-02-16", status: "delivered" as CommissionStatus },
  { id: "6", title: "Wedding March", client: "강OO", arrangement: "브라스 앙상블", deadline: "2026-02-10", status: "complete" as CommissionStatus },
];

const CommissionList = () => {
  const [filter, setFilter] = useState<CommissionStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const navigate = useNavigate();

  const filtered = mockData.filter((c) => {
    const matchesFilter = filter === "all" || c.status === filter;
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.client.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AppLayout>
      <PageHeader title="의뢰 목록" description="모든 악보 의뢰를 관리합니다">
        <Button onClick={() => navigate("/commissions/new")} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          새 의뢰
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="곡명 또는 의뢰인 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === tab.value
                  ? "bg-background shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("table")}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "card" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("card")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" ? (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wider">곡명</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">의뢰인</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">편성</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">마감일</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id} className="cursor-pointer" onClick={() => navigate(`/commissions/${item.id}`)}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="text-muted-foreground">{item.client}</TableCell>
                    <TableCell className="text-muted-foreground">{item.arrangement}</TableCell>
                    <TableCell className="text-muted-foreground">{item.deadline}</TableCell>
                    <TableCell><StatusBadge status={item.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="hover-lift cursor-pointer border-border/50" onClick={() => navigate(`/commissions/${item.id}`)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display font-semibold">{item.title}</h3>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-sm text-muted-foreground">{item.arrangement}</p>
                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="text-muted-foreground">{item.client}</span>
                  <span className="text-muted-foreground">{item.deadline}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default CommissionList;
