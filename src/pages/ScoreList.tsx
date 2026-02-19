import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search } from "lucide-react";

const mockScores = [
  { id: "s1", title: "Canon in D", arrangement: "현악 3중주", version: "v2.1", createdAt: "2025-11-20" },
  { id: "s2", title: "Canon in D", arrangement: "현악 4중주", version: "v1.0", createdAt: "2025-08-15" },
  { id: "s3", title: "River Flows in You", arrangement: "피아노 솔로", version: "v1.2", createdAt: "2025-12-01" },
  { id: "s4", title: "A Thousand Years", arrangement: "현악 5중주", version: "v1.0", createdAt: "2026-01-10" },
  { id: "s5", title: "Wedding March", arrangement: "브라스 앙상블", version: "v3.0", createdAt: "2024-06-22" },
  { id: "s6", title: "Spring Waltz", arrangement: "플룻 듀엣", version: "v1.0", createdAt: "2026-02-05" },
];

const ScoreList = () => {
  const [search, setSearch] = useState("");

  const filtered = mockScores.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.arrangement.toLowerCase().includes(search.toLowerCase())
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
          placeholder="곡명 또는 편성 검색..."
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
                <TableHead className="text-xs uppercase tracking-wider">곡명</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">편성</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">버전</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">등록일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((score) => (
                <TableRow key={score.id} className="cursor-pointer">
                  <TableCell className="font-medium">{score.title}</TableCell>
                  <TableCell className="text-muted-foreground">{score.arrangement}</TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-1 rounded-md bg-accent/15 text-accent font-medium">
                      {score.version}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{score.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default ScoreList;
