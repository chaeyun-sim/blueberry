export type SalesSummary = {
  totalRevenue: number;
  totalCount: number;
  thisMonthCount: number;
  thisYearCount: number;
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

// ─── RPC Response Row Types ───────────────────────────────────────────────────
// Raw shapes returned by Supabase RPC functions, used for type-safe mapping.

export type RpcSalesSummaryRow = {
  totalRevenue: number;
  totalCount: number;
  thisYearRevenue: number;
  thisYearCount: number;
  lastYearRevenue: number;
  lastYearCount: number;
  thisMonthCount: number;
  lastMonthRevenue: number;
  lastMonthCount: number;
  prevPrevRevenue: number;
  prevPrevCount: number;
};

export type RpcMonthlySaleRow = {
  month_num: number;
  revenue: number;
  count: number;
  prev_revenue: number;
  prev_count: number;
};

export type RpcMonthlyCategoryRow = {
  month_num: number;
  CLASSIC: number;
  POP: number;
  'K-POP': number;
  OST: number;
  ANI: number;
  ETC: number;
};

export type RpcCategoryDistributionRow = {
  name: string;
  revenue: number;
  count: number;
};

export type RpcTopSongRow = {
  song_title: string;
  category: string;
  sales: number;
  revenue: number;
};

export type RpcTopArrangementRow = {
  arrangement: string;
  sales: number;
  revenue: number;
};

export type RpcTopSongMonthlySaleRow = {
  month_num: number;
  song_title: string;
  count: number;
  song_rank: number;
};

export type RpcSeasonalPatternRow = {
  month_num: number;
  avg_revenue: number;
  avg_count: number;
  years: number;
  top_songs: { title: string; avgCount: number }[];
};

export type RpcTrendingSongRow = {
  title: string;
  recent_sales: number;
  prev_sales: number;
  growth: number;
};

export type RpcRevenueConcentrationRow = {
  rank: number;
  title: string;
  revenue: number;
  revenue_share: number;
  cumulative_share: number;
  song_share: number;
};
