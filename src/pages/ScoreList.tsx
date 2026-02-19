import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, ChevronRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Arrangement {
  id: string;
  name: string;
  version: string;
  createdAt: string;
}

interface Score {
  id: string;
  title: string;
  arrangements: Arrangement[];
  createdAt: string;
}

const mockScores: Score[] = [
  {
    id: "s1",
    title: "Canon in D",
    createdAt: "2025-11-20",
    arrangements: [
      { id: "a1", name: "현악 3중주", version: "v2.1", createdAt: "2025-11-20" },
      { id: "a2", name: "현악 4중주", version: "v1.0", createdAt: "2025-10-15" },
      { id: "a3", name: "피아노 솔로", version: "v1.0", createdAt: "2025-09-01" },
    ],
  },
  {
    id: "s2",
    title: "River Flows in You",
    createdAt: "2025-12-01",
    arrangements: [
      { id: "a4", name: "피아노 솔로", version: "v1.2", createdAt: "2025-12-01" },
    ],
  },
  {
    id: "s3",
    title: "A Thousand Years",
    createdAt: "2026-01-10",
    arrangements: [
      { id: "a5", name: "현악 5중주", version: "v1.0", createdAt: "2026-01-10" },
      { id: "a6", name: "현악 4중주", version: "v1.0", createdAt: "2026-01-05" },
    ],
  },
  {
    id: "s4",
    title: "Wedding March",
    createdAt: "2024-06-22",
    arrangements: [
      { id: "a7", name: "브라스 앙상블", version: "v3.0", createdAt: "2024-06-22" },
    ],
  },
  {
    id: "s5",
    title: "Spring Waltz",
    createdAt: "2026-02-05",
    arrangements: [
      { id: "a8", name: "플룻 듀엣", version: "v1.0", createdAt: "2026-02-05" },
    ],
  },
];

const ScoreList = () => {
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = mockScores.filter(
    (s) => s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <PageHeader title="악보 관리" description="보유 중인 악보와 편성 버전을 관리합니다">
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          악보 추가
        </Button>
      </PageHeader>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="곡명 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase tracking-wider w-10"></TableHead>
                <TableHead className="text-xs uppercase tracking-wider">곡명</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">편성 수</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">등록일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((score) => {
                const isExpanded = expandedIds.has(score.id);
                return (
                  <>
                    <TableRow key={score.id} className="cursor-pointer" onClick={() => toggleExpand(score.id)}>
                      <TableCell className="w-10 pr-0">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{score.title}</TableCell>
                      <TableCell className="text-muted-foreground">{score.arrangements.length}개</TableCell>
                      <TableCell className="text-right text-muted-foreground">{score.createdAt}</TableCell>
                    </TableRow>
                    {isExpanded &&
                      score.arrangements.map((arr) => (
                        <TableRow
                          key={arr.id}
                          className="cursor-pointer hover:bg-muted/50 bg-muted/20"
                          onClick={() => navigate(`/scores/${score.id}/arrangements/${arr.id}`)}
                        >
                          <TableCell></TableCell>
                          <TableCell className="text-muted-foreground pl-8">↳ {arr.name}</TableCell>
                          <TableCell></TableCell>
                          <TableCell className="text-right text-muted-foreground">{arr.createdAt}</TableCell>
                        </TableRow>
                      ))}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default ScoreList;
