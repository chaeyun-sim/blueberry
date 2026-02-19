import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusCircle, Search, Folder, FileMusic,
  LayoutGrid, List, Music, Calendar, Layers,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

// ── Breadcrumb ──

function Breadcrumb({
  path,
  onNavigate,
}: {
  path: { label: string; id: string | null }[];
  onNavigate: (id: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm mb-5 mt-1">
      {path.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-muted-foreground/40">/</span>}
          <button
            onClick={() => onNavigate(item.id)}
            className={cn(
              "hover:text-primary transition-colors",
              i === path.length - 1
                ? "font-semibold text-foreground"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </button>
        </span>
      ))}
    </div>
  );
}

// ── Grid Item: Folder ──

function FolderCard({ score, onClick }: { score: Score; onClick: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <div
        onClick={onClick}
        className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-transparent hover:border-border hover:bg-muted/30 cursor-pointer transition-all duration-150"
      >
        <div className="relative">
          <Folder className="h-14 w-14 text-primary/70 group-hover:text-primary transition-colors" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="font-medium text-sm truncate max-w-[140px]">{score.title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{score.arrangements.length}개 편성</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Grid Item: File ──

function FileCard({
  arrangement,
  scoreId,
  onClick,
}: {
  arrangement: Arrangement;
  scoreId: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <div
        onClick={onClick}
        className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-transparent hover:border-border hover:bg-muted/30 cursor-pointer transition-all duration-150"
      >
        <FileMusic className="h-12 w-12 text-muted-foreground/60 group-hover:text-foreground/70 transition-colors" strokeWidth={1.5} />
        <div className="text-center">
          <p className="font-medium text-sm truncate max-w-[140px]">{arrangement.name}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{arrangement.version}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── List Row: Folder ──

function FolderRow({ score, onClick }: { score: Score; onClick: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
    >
      <div
        onClick={onClick}
        className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted/30 cursor-pointer transition-colors group"
      >
        <Folder className="h-5 w-5 text-primary/70 group-hover:text-primary shrink-0 transition-colors" />
        <span className="font-medium text-sm flex-1 truncate">{score.title}</span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Layers className="h-3 w-3" />
          {score.arrangements.length}
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {score.createdAt}
        </span>
      </div>
    </motion.div>
  );
}

// ── List Row: File ──

function FileRow({
  arrangement,
  scoreId,
  onClick,
}: {
  arrangement: Arrangement;
  scoreId: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
    >
      <div
        onClick={onClick}
        className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted/30 cursor-pointer transition-colors group"
      >
        <FileMusic className="h-5 w-5 text-muted-foreground/60 group-hover:text-foreground/70 shrink-0 transition-colors" />
        <span className="font-medium text-sm flex-1 truncate">{arrangement.name}</span>
        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md font-medium">
          {arrangement.version}
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {arrangement.createdAt}
        </span>
      </div>
    </motion.div>
  );
}

// ── Main Component ──

const ScoreList = () => {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const navigate = useNavigate();

  const filtered = mockScores.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const openFolder = openFolderId
    ? mockScores.find((s) => s.id === openFolderId)
    : null;

  const breadcrumb: { label: string; id: string | null }[] = [
    { label: "전체 악보", id: null },
  ];
  if (openFolder) {
    breadcrumb.push({ label: openFolder.title, id: openFolder.id });
  }

  return (
    <AppLayout>
      <PageHeader title="악보 관리" description="보유 중인 악보와 편성 버전을 관리합니다">
        <Button className="gap-2" onClick={() => navigate("/scores/new")}>
          <PlusCircle className="h-4 w-4" />
          악보 추가
        </Button>
      </PageHeader>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="곡명 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 transition-colors",
              viewMode === "grid"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 transition-colors",
              viewMode === "list"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb path={breadcrumb} onNavigate={(id) => setOpenFolderId(id)} />

      {/* Content */}
      <Card className="border-border/50">
        <CardContent className="p-5">
          <AnimatePresence mode="wait">
            {!openFolder ? (
              /* ── Root: Folders ── */
              viewMode === "grid" ? (
                <motion.div
                  key="grid-folders"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2"
                >
                  {filtered.map((score) => (
                    <FolderCard
                      key={score.id}
                      score={score}
                      onClick={() => setOpenFolderId(score.id)}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list-folders"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-0.5"
                >
                  {filtered.map((score) => (
                    <FolderRow
                      key={score.id}
                      score={score}
                      onClick={() => setOpenFolderId(score.id)}
                    />
                  ))}
                </motion.div>
              )
            ) : (
              /* ── Inside folder: Table ── */
              <motion.div
                key="table-files"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs uppercase tracking-wider">편성명</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-right">등록일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openFolder.arrangements.map((arr) => (
                      <TableRow
                        key={arr.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          navigate(`/scores/${openFolder.id}/arrangements/${arr.id}`)
                        }
                      >
                        <TableCell className="font-medium flex items-center gap-2">
                          <FileMusic className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                          {arr.name}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{arr.createdAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!openFolder && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Music className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm">검색 결과가 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default ScoreList;
