export type SalesSummary = {
  totalRevenue: number;
  totalCount: number;
  lastMonthRevenue: number;
  lastMonthCount: number;
  revenueVsLastYear: number; // % 변화율
  countVsLastYear: number; // % 변화율
  revenueVsLastMonth: number; // % 변화율
  countVsLastMonth: number; // % 변화율
};

export type MonthlySale = {
  month: string;
  revenue: number;
  count: number;
  prevRevenue: number;
  prevCount: number;
};

export type MonthlyCategoryData = {
  month: string;
  CLASSIC: number;
  POP: number;
  'K-POP': number;
  OST: number;
  ANI: number;
  ETC: number;
};

export type TopSong = {
  rank: number;
  title: string;
  category: string;
  sales: number;
  revenue: number;
};

export type TopArrangement = {
  rank: number;
  arrangement: string;
  sales: number;
  revenue: number;
};

export type TopSongMonthlySalesResult = {
  data: Record<string, string | number>[];
  config: Record<string, string>;
};

export type ExcelUpload = {
  id: string;
  name: string;
  row_count: number;
  uploaded_at: string;
};

export type CategoryDistributionItem = {
  name: string;
  value: number;
  count: number;
  countShare: number;
  revenue: number;
};

export type SeasonalPatternItem = {
  monthNum: number;
  month: string;
  avgRevenue: number;
  avgCount: number;
  years: number;
  topSongs: { title: string; avgCount: number }[];
};

export type TrendingSong = {
  title: string;
  recentSales: number;
  prevSales: number;
  growth: number;
};

export type RevenueConcentrationItem = {
  rank: number;
  title: string;
  revenue: number;
  revenueShare: number;
  cumulativeShare: number;
  songShare: number;
};
