import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge, CommissionStatus } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, LayoutGrid, List } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

type VersionType = "hard" | "easy" | "professional" | "normal";

const tabs: { label: string; value: CommissionStatus | "all" }[] = [
  { label: "전체", value: "all" },
  { label: "대기", value: "received" },
  { label: "작업중", value: "working" },
  { label: "완료", value: "complete" },
  { label: "전달", value: "delivered" },
];

const mockData = [
  { id: "1", title: "Canon in D", arrangement: "현악 4중주", deadline: "2026-02-21", status: "working" as CommissionStatus, version: "hard" as VersionType },
  { id: "2", title: "River Flows in You", arrangement: "피아노 솔로", deadline: "2026-02-23", status: "working" as CommissionStatus, version: "easy" as VersionType },
  { id: "3", title: "Spring Waltz", arrangement: "플룻 듀엣", deadline: "2026-03-01", status: "received" as CommissionStatus, version: "normal" as VersionType },
  { id: "4", title: "A Thousand Years", arrangement: "현악 5중주", deadline: "2026-02-28", status: "working" as CommissionStatus, version: "professional" as VersionType },
  { id: "5", title: "Butterfly", arrangement: "클라리넷 트리오", deadline: "2026-02-16", status: "complete" as CommissionStatus, version: "normal" as VersionType },
  { id: "6", title: "Wedding March", arrangement: "브라스 앙상블", deadline: "2026-02-10", status: "complete" as CommissionStatus, version: "hard" as VersionType },
];

const versionLabel = (v: VersionType) => {
  if (v === "normal") return "-";
  return v;
};

const CommissionList = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") as CommissionStatus | null;
  const [filter, setFilter] = useState<CommissionStatus | "all">(initialStatus || "all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const navigate = useNavigate();

  const filtered = mockData.filter((c) => {
    const matchesFilter = filter === "all" || c.status === filter;
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AppLayout>
      <PageHeader title="의뢰 목록" description="모든 악보 의뢰를 관리합니다" />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="곡명 검색..."
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
                  <TableHead className="text-xs uppercase tracking-wider">편성</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">버전</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">마감일</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id} className="cursor-pointer" onClick={() => navigate(`/commissions/${item.id}`)}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="text-muted-foreground">{item.arrangement}</TableCell>
                    <TableCell>
                      {item.version !== "normal" ? (
                        <span className="text-xs px-2 py-1 rounded-md bg-accent/15 text-accent font-medium capitalize">
                          {versionLabel(item.version)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
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
                  <span className="text-muted-foreground">{item.deadline}</span>
                  {item.version !== "normal" ? (
                    <span className="text-xs px-2 py-1 rounded-md bg-accent/15 text-accent font-medium capitalize">
                      {versionLabel(item.version)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
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
