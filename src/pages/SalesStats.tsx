import { useState, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { ExcelUploadDialog, type ExcelRow } from "@/components/ExcelUploadDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload,
  TrendingUp,
  Music,
  DollarSign,
  BarChart3,
  FileSpreadsheet,
  CalendarDays,
  Layers,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  List,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";

// Mock data
const monthlySalesData = [
  { month: "1월", revenue: 1250000, count: 102 },
  { month: "2월", revenue: 980000, count: 87 },
  { month: "3월", revenue: 1540000, count: 118 },
  { month: "4월", revenue: 1120000, count: 95 },
  { month: "5월", revenue: 1780000, count: 134 },
  { month: "6월", revenue: 1340000, count: 108 },
  { month: "7월", revenue: 1650000, count: 125 },
  { month: "8월", revenue: 1420000, count: 110 },
  { month: "9월", revenue: 1890000, count: 142 },
  { month: "10월", revenue: 2100000, count: 156 },
  { month: "11월", revenue: 1760000, count: 98 },
  { month: "12월", revenue: 2340000, count: 109 },
];

const categoryData = [
  { name: "CLASSIC", value: 45, fill: "hsl(var(--primary))" },
  { name: "OST", value: 25, fill: "hsl(var(--accent))" },
  { name: "ANI", value: 18, fill: "hsl(var(--status-received))" },
  { name: "ETC", value: 12, fill: "hsl(var(--status-complete))" },
];

const topSongs = [
  { rank: 1, title: "Canon in D", category: "CLASSIC", sales: 156, revenue: 2340000 },
  { rank: 2, title: "River Flows in You", category: "CLASSIC", sales: 132, revenue: 1980000 },
  { rank: 3, title: "Kiss the Rain", category: "CLASSIC", sales: 98, revenue: 1470000 },
  { rank: 4, title: "君をのせて (천공의 성 라퓨타)", category: "ANI", sales: 87, revenue: 1305000 },
  { rank: 5, title: "Merry Go Round of Life", category: "ANI", sales: 76, revenue: 1140000 },
];

const topArrangements = [
  { rank: 1, arrangement: "QUARTET (Vn, Vn, Va, Vc)", sales: 234, revenue: 3510000 },
  { rank: 2, arrangement: "SOLO (Piano)", sales: 189, revenue: 1890000 },
  { rank: 3, arrangement: "DUET (Fl, Pf)", sales: 145, revenue: 2175000 },
  { rank: 4, arrangement: "TRIO (Vn, Va, Vc)", sales: 112, revenue: 1680000 },
  { rank: 5, arrangement: "QUINTET (Str)", sales: 78, revenue: 1560000 },
];

// Mock raw Excel data
const rawExcelData = [
  { id: 1, orderDate: "2026-01-03 14:23", category: "CLASSIC", product: "Canon in D - QUARTET(Vn, Vn, Va, Vc)", amount: 15000 },
  { id: 2, orderDate: "2026-01-04 09:11", category: "ANI", product: "君をのせて - DUET(Fl, Pf)", amount: 12000 },
  { id: 3, orderDate: "2026-01-05 18:45", category: "CLASSIC", product: "River Flows in You - SOLO(Piano)", amount: 10000 },
  { id: 4, orderDate: "2026-01-06 11:30", category: "OST", product: "Kiss the Rain - TRIO(Vn, Va, Vc)", amount: 15000 },
  { id: 5, orderDate: "2026-01-07 16:02", category: "CLASSIC", product: "Canon in D - QUARTET(Vn, Vn, Va, Vc)", amount: 15000 },
  { id: 6, orderDate: "2026-01-08 10:15", category: "ETC", product: "Wedding March - QUINTET(Brass)", amount: 20000 },
  { id: 7, orderDate: "2026-01-09 13:40", category: "ANI", product: "Merry Go Round of Life - DUET(Vn, Pf)", amount: 12000 },
  { id: 8, orderDate: "2026-01-10 08:55", category: "CLASSIC", product: "Spring Waltz - QUARTET(Vn, Vn, Va, Vc)", amount: 15000 },
  { id: 9, orderDate: "2026-01-11 15:20", category: "OST", product: "A Thousand Years - QUINTET(Str)", amount: 20000 },
  { id: 10, orderDate: "2026-01-12 12:00", category: "CLASSIC", product: "Canon in D - SOLO(Piano)", amount: 10000 },
  { id: 11, orderDate: "2026-01-13 17:30", category: "ANI", product: "君をのせて - QUARTET(Vn, Vn, Va, Vc)", amount: 15000 },
  { id: 12, orderDate: "2026-01-14 09:45", category: "CLASSIC", product: "River Flows in You - DUET(Fl, Pf)", amount: 12000 },
  { id: 13, orderDate: "2026-01-15 14:10", category: "OST", product: "Butterfly - TRIO(Cl, Cl, Pf)", amount: 15000 },
  { id: 14, orderDate: "2026-01-16 11:25", category: "CLASSIC", product: "Canon in D - QUARTET(Vn, Vn, Va, Vc)", amount: 15000 },
  { id: 15, orderDate: "2026-01-17 16:50", category: "ETC", product: "Happy Birthday - SOLO(Piano)", amount: 8000 },
];

const barChartConfig: ChartConfig = {
  revenue: { label: "매출", color: "hsl(var(--primary))" },
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(value);

type SortKey = "orderDate" | "category" | "product" | "amount";
type SortDir = "asc" | "desc";

const ALL_CATEGORIES = ["ALL", ...Array.from(new Set(rawExcelData.map((r) => r.category)))];

const SalesStats = () => {
  const [sortKey, setSortKey] = useState<SortKey>("category");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [excelData, setExcelData] = useState(rawExcelData);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (category: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const handleExcelUpload = useCallback((data: ExcelRow[]) => {
    setExcelData(data);
  }, []);

  const categories = useMemo(
    () => ["ALL", ...Array.from(new Set(excelData.map((r) => r.category)))],
    [excelData]
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedData = useMemo(() => {
    let data = [...excelData];
    if (filterCategory !== "ALL") {
      data = data.filter((r) => r.category === filterCategory);
    }
    data.sort((a, b) => {
      // Primary: category alphabetical when grouping
      if (groupByCategory && sortKey !== "category") {
        const catCmp = a.category.localeCompare(b.category, "ko");
        if (catCmp !== 0) return catCmp;
      }
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = typeof aVal === "number" ? aVal - (bVal as number) : String(aVal).localeCompare(String(bVal), "ko");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return data;
  }, [sortKey, sortDir, filterCategory, groupByCategory, excelData]);

  const groupedData = useMemo(() => {
    if (!groupByCategory) return null;
    const groups: Record<string, typeof excelData> = {};
    sortedData.forEach((row) => {
      if (!groups[row.category]) groups[row.category] = [];
      groups[row.category].push(row);
    });
    return groups;
  }, [sortedData, groupByCategory]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  return (
    <AppLayout>
      <PageHeader title="매출 통계" description="엑셀 데이터 기반 매출 분석">
        <Button variant="outline" className="gap-2" onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4" />
          엑셀 업로드
        </Button>
      </PageHeader>
      <ExcelUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onUpload={handleExcelUpload} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">총 매출</span>
            </div>
            <p className="text-2xl font-display font-bold">{formatCurrency(19170000)}</p>
            <p className="text-xs text-[hsl(var(--status-complete))] mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +12.5% vs 작년
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">총 판매건</span>
            </div>
            <p className="text-2xl font-display font-bold">1,284</p>
            <p className="text-xs text-[hsl(var(--status-complete))] mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +8.3% vs 작년
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">지난달 매출</span>
            </div>
            <p className="text-2xl font-display font-bold">{formatCurrency(1760000)}</p>
            <p className="text-xs text-[hsl(var(--status-complete))] mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +5.2% vs 전월
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">지난달 판매건</span>
            </div>
            <p className="text-2xl font-display font-bold">98</p>
            <p className="text-xs text-[hsl(var(--status-complete))] mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +3.1% vs 전월
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            전체 분석
          </TabsTrigger>
          <TabsTrigger value="yearly" className="gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            연별 분석
          </TabsTrigger>
          <TabsTrigger value="raw" className="gap-1.5">
            <List className="h-3.5 w-3.5" />
            전체 보기
          </TabsTrigger>
        </TabsList>

        {/* 전체 분석 */}
        <TabsContent value="all" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display">카테고리별 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="mx-auto aspect-square max-h-[250px]">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      strokeWidth={2}
                      stroke="hsl(var(--background))"
                    >
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {categoryData.map((c) => (
                    <div key={c.name} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.fill }} />
                      {c.name} ({c.value}%)
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  가장 많이 팔린 곡 TOP 5
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs uppercase w-12">#</TableHead>
                      <TableHead className="text-xs uppercase">곡명</TableHead>
                      <TableHead className="text-xs uppercase">분류</TableHead>
                      <TableHead className="text-xs uppercase text-right">판매수</TableHead>
                      <TableHead className="text-xs uppercase text-right">매출</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topSongs.map((song) => (
                      <TableRow key={song.rank}>
                        <TableCell className="font-display font-bold text-primary">{song.rank}</TableCell>
                        <TableCell className="font-medium">{song.title}</TableCell>
                        <TableCell>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground">
                            {song.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{song.sales}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(song.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Layers className="h-4 w-4" />
                가장 많이 팔린 편성 TOP 5
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs uppercase w-12">#</TableHead>
                    <TableHead className="text-xs uppercase">편성</TableHead>
                    <TableHead className="text-xs uppercase text-right">판매수</TableHead>
                    <TableHead className="text-xs uppercase text-right">매출</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topArrangements.map((arr) => (
                    <TableRow key={arr.rank}>
                      <TableCell className="font-display font-bold text-primary">{arr.rank}</TableCell>
                      <TableCell className="font-medium">{arr.arrangement}</TableCell>
                      <TableCell className="text-right tabular-nums">{arr.sales}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(arr.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 연별 분석 */}
        <TabsContent value="yearly" className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Select defaultValue="2026">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026년</SelectItem>
                <SelectItem value="2025">2025년</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">월별 매출 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={barChartConfig} className="aspect-[2/1] w-full max-h-[300px]">
                <BarChart data={monthlySalesData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, item) => (
                          <div className="flex flex-col">
                            <span>{formatCurrency(value as number)}</span>
                            <span className="text-muted-foreground">{(item.payload as { count: number }).count}건</span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display">연간 베스트셀러 곡</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topSongs.slice(0, 3).map((song) => (
                    <div key={song.rank} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <span className="text-lg font-display font-bold text-primary w-8">{song.rank}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{song.title}</p>
                        <p className="text-xs text-muted-foreground">{song.category} · {song.sales}건</p>
                      </div>
                      <span className="text-sm font-medium tabular-nums">{formatCurrency(song.revenue)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display">연간 인기 편성</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topArrangements.slice(0, 3).map((arr) => (
                    <div key={arr.rank} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <span className="text-lg font-display font-bold text-primary w-8">{arr.rank}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{arr.arrangement}</p>
                        <p className="text-xs text-muted-foreground">{arr.sales}건</p>
                      </div>
                      <span className="text-sm font-medium tabular-nums">{formatCurrency(arr.revenue)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 전체 보기 (Raw Excel Data) */}
        <TabsContent value="raw" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  엑셀 데이터 전체 보기
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat === "ALL" ? "전체 대분류" : cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant={groupByCategory ? "default" : "outline"}
                    size="sm"
                    className="gap-1.5 h-8 text-xs"
                    onClick={() => setGroupByCategory((v) => !v)}
                  >
                    <Layers className="h-3 w-3" />
                    그룹핑
                  </Button>
                  <span className="text-xs text-muted-foreground">{sortedData.length}건</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border/50 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs uppercase w-12">#</TableHead>
                      <TableHead
                        className="text-xs uppercase cursor-pointer select-none hover:text-foreground transition-colors"
                        onClick={() => toggleSort("orderDate")}
                      >
                        <span className="inline-flex items-center">
                          주문일시
                          <SortIcon col="orderDate" />
                        </span>
                      </TableHead>
                      {!groupByCategory && (
                        <TableHead
                          className="text-xs uppercase cursor-pointer select-none hover:text-foreground transition-colors"
                          onClick={() => toggleSort("category")}
                        >
                          <span className="inline-flex items-center">
                            대분류
                            <SortIcon col="category" />
                          </span>
                        </TableHead>
                      )}
                      <TableHead
                        className="text-xs uppercase cursor-pointer select-none hover:text-foreground transition-colors"
                        onClick={() => toggleSort("product")}
                      >
                        <span className="inline-flex items-center">
                          주문상품
                          <SortIcon col="product" />
                        </span>
                      </TableHead>
                      <TableHead
                        className="text-xs uppercase text-right cursor-pointer select-none hover:text-foreground transition-colors"
                        onClick={() => toggleSort("amount")}
                      >
                        <span className="inline-flex items-center justify-end">
                          상품총액
                          <SortIcon col="amount" />
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupByCategory && groupedData
                      ? Object.entries(groupedData).map(([category, rows]) => (
                          <>
                            <TableRow
                              key={`group-${category}`}
                              className="bg-muted/40 hover:bg-muted/60 cursor-pointer select-none"
                              onClick={() => filterCategory === "ALL" && toggleGroup(category)}
                            >
                              <TableCell colSpan={4} className="py-2">
                                <span className="inline-flex items-center gap-2 text-sm font-display font-bold">
                                  {filterCategory === "ALL" && (
                                    collapsedGroups.has(category)
                                      ? <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                      : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className="px-2 py-0.5 rounded-full text-xs bg-primary text-primary-foreground">
                                    {category}
                                  </span>
                                  <span className="text-muted-foreground font-normal text-xs">{rows.length}건</span>
                                </span>
                              </TableCell>
                            </TableRow>
                            {!collapsedGroups.has(category) && rows.map((row, i) => (
                              <TableRow key={row.id}>
                                <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                                <TableCell className="text-sm tabular-nums">{row.orderDate}</TableCell>
                                <TableCell className="font-medium text-sm">{row.product}</TableCell>
                                <TableCell className="text-right tabular-nums text-sm">{formatCurrency(row.amount)}</TableCell>
                              </TableRow>
                            ))}
                          </>
                        ))
                      : sortedData.map((row, i) => (
                          <TableRow key={row.id}>
                            <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                            <TableCell className="text-sm tabular-nums">{row.orderDate}</TableCell>
                            <TableCell>
                              <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground">
                                {row.category}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium text-sm">{row.product}</TableCell>
                            <TableCell className="text-right tabular-nums text-sm">{formatCurrency(row.amount)}</TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default SalesStats;
