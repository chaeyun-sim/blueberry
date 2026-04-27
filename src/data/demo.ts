import logo from '@/assets/logo.webp'
import type { Commission } from '@/types/commission'
import type {
  SalesSummary,
  MonthlySale,
  MonthlyCategoryData,
  TopSong,
  TopArrangement,
  TopSongMonthlySalesResult,
  ExcelUpload,
  SeasonalPatternItem,
  TrendingSong,
  RevenueConcentrationItem,
} from '@/types/stats'
import type { Song } from '@/types/score'
import type { ExcelRow } from '@/types/excel'

const thisYear = new Date().getFullYear()

// ─── Commissions ────────────────────────────────────────────────────────────

const demoCommissions: Commission[] = [
  {
    id: 'demo-1',
    song_id: null,
    title: 'Clair de lune',
    composer: 'C. Debussy',
    arrangement: 'Fl, Cl, Pf',
    version: 'easy',
    deadline: `${thisYear}-03-15`,
    status: 'working',
    notes: null,
    image_url: null,
    created_at: `${thisYear}-02-20T09:00:00Z`,
    songs: { title: 'Clair de lune', composer: 'C. Debussy', category: 'CLASSIC' },
  },
  {
    id: 'demo-2',
    song_id: null,
    title: 'Canon in D',
    composer: 'J. Pachelbel',
    arrangement: 'Str Quartet',
    version: null,
    deadline: `${thisYear}-03-01`,
    status: 'complete',
    notes: null,
    image_url: null,
    created_at: `${thisYear}-02-10T09:00:00Z`,
    songs: { title: 'Canon in D', composer: 'J. Pachelbel', category: 'CLASSIC' },
  },
  {
    id: 'demo-3',
    song_id: null,
    title: 'Merry Go Round of Life',
    composer: 'Joe Hisaishi',
    arrangement: 'Pf Solo',
    version: 'hard',
    deadline: `${thisYear}-03-20`,
    status: 'received',
    notes: null,
    image_url: null,
    created_at: `${thisYear}-02-22T09:00:00Z`,
    songs: { title: 'Merry Go Round of Life', composer: 'Joe Hisaishi', category: 'ANI' },
  },
  {
    id: 'demo-4',
    song_id: null,
    title: 'River Flows in You',
    composer: 'Yiruma',
    arrangement: 'Vn, Vc, Pf',
    version: 'easy',
    deadline: `${thisYear}-02-28`,
    status: 'delivered',
    notes: null,
    image_url: null,
    created_at: `${thisYear}-02-05T09:00:00Z`,
    songs: { title: 'River Flows in You', composer: 'Yiruma', category: 'ETC' },
  },
  {
    id: 'demo-5',
    song_id: null,
    title: 'Liebesleid',
    composer: 'F. Kreisler',
    arrangement: 'Vn, Pf',
    version: 'pro',
    deadline: `${thisYear}-04-10`,
    status: 'working',
    notes: null,
    image_url: null,
    created_at: `${thisYear}-02-18T09:00:00Z`,
    songs: { title: 'Liebesleid', composer: 'F. Kreisler', category: 'CLASSIC' },
  },
  {
    id: 'demo-6',
    song_id: null,
    title: 'My Neighbor Totoro',
    composer: 'Joe Hisaishi',
    arrangement: 'Fl, Pf',
    version: 'easy',
    deadline: `${thisYear}-03-25`,
    status: 'received',
    notes: null,
    image_url: null,
    created_at: `${thisYear}-02-24T09:00:00Z`,
    songs: { title: 'My Neighbor Totoro', composer: 'Joe Hisaishi', category: 'ANI' },
  },
]

const demoMonthlyCommissionCounts = Array.from({ length: 12 }, (_, i) => ({
  month: `${i + 1}월`,
  count: i < new Date().getMonth() ? Math.floor(Math.random() * 6) + 2 : 0,
}))

// ─── Sales Summary ──────────────────────────────────────────────────────────

const demoSalesSummary: SalesSummary = {
  totalRevenue: 48500000,
  totalCount: 312,
  lastMonthRevenue: 5200000,
  lastMonthCount: 35,
  revenueVsLastYear: 18.7,
  countVsLastYear: 12.4,
  revenueVsLastMonth: 6.2,
  countVsLastMonth: 8.5,
}

// ─── Monthly Sales ──────────────────────────────────────────────────────────

const demoMonthlySales: MonthlySale[] = [
  { month: '1월', revenue: 420000, count: 28, prevRevenue: 350000, prevCount: 22 },
  { month: '2월', revenue: 380000, count: 25, prevRevenue: 320000, prevCount: 20 },
  { month: '3월', revenue: 510000, count: 34, prevRevenue: 400000, prevCount: 26 },
  { month: '4월', revenue: 450000, count: 30, prevRevenue: 380000, prevCount: 24 },
  { month: '5월', revenue: 620000, count: 42, prevRevenue: 450000, prevCount: 30 },
  { month: '6월', revenue: 480000, count: 32, prevRevenue: 420000, prevCount: 28 },
  { month: '7월', revenue: 550000, count: 37, prevRevenue: 470000, prevCount: 31 },
  { month: '8월', revenue: 390000, count: 26, prevRevenue: 340000, prevCount: 22 },
  { month: '9월', revenue: 470000, count: 31, prevRevenue: 410000, prevCount: 27 },
  { month: '10월', revenue: 530000, count: 35, prevRevenue: 460000, prevCount: 30 },
  { month: '11월', revenue: 580000, count: 38, prevRevenue: 490000, prevCount: 32 },
  { month: '12월', revenue: 520000, count: 34, prevRevenue: 440000, prevCount: 29 },
]

// ─── Monthly Category Breakdown ─────────────────────────────────────────────

export const demoMonthlyCategoryBreakdown: MonthlyCategoryData[] = [
  { month: '1월', CLASSIC: 200000, POP: 0, 'K-POP': 0, OST: 120000, ANI: 60000, ETC: 40000 },
  { month: '2월', CLASSIC: 180000, POP: 0, 'K-POP': 0, OST: 100000, ANI: 55000, ETC: 45000 },
  { month: '3월', CLASSIC: 250000, POP: 0, 'K-POP': 0, OST: 140000, ANI: 70000, ETC: 50000 },
  { month: '4월', CLASSIC: 220000, POP: 0, 'K-POP': 0, OST: 120000, ANI: 65000, ETC: 45000 },
  { month: '5월', CLASSIC: 300000, POP: 0, 'K-POP': 0, OST: 170000, ANI: 90000, ETC: 60000 },
  { month: '6월', CLASSIC: 230000, POP: 0, 'K-POP': 0, OST: 130000, ANI: 70000, ETC: 50000 },
  { month: '7월', CLASSIC: 270000, POP: 0, 'K-POP': 0, OST: 150000, ANI: 80000, ETC: 50000 },
  { month: '8월', CLASSIC: 190000, POP: 0, 'K-POP': 0, OST: 100000, ANI: 55000, ETC: 45000 },
  { month: '9월', CLASSIC: 230000, POP: 0, 'K-POP': 0, OST: 130000, ANI: 65000, ETC: 45000 },
  { month: '10월', CLASSIC: 260000, POP: 0, 'K-POP': 0, OST: 140000, ANI: 80000, ETC: 50000 },
  { month: '11월', CLASSIC: 280000, POP: 0, 'K-POP': 0, OST: 160000, ANI: 85000, ETC: 55000 },
  { month: '12월', CLASSIC: 250000, POP: 0, 'K-POP': 0, OST: 140000, ANI: 80000, ETC: 50000 },
]

// ─── Category Distribution ──────────────────────────────────────────────────

const demoCategoryDistribution = [
  { name: 'CLASSIC', value: 48.2, count: 150, countShare: 48.1, revenue: 2340000 },
  { name: 'OST', value: 28.5, count: 89, countShare: 28.5, revenue: 1380000 },
  { name: 'ANI', value: 15.1, count: 47, countShare: 15.1, revenue: 730000 },
  { name: 'ETC', value: 8.2, count: 26, countShare: 8.3, revenue: 400000 },
]

// ─── Top Songs / Arrangements ───────────────────────────────────────────────

const demoTopSongs: TopSong[] = [
  { rank: 1, title: 'Clair de lune', category: 'CLASSIC', sales: 28, revenue: 420000 },
  { rank: 2, title: 'Merry Go Round', category: 'ANI', sales: 24, revenue: 360000 },
  { rank: 3, title: 'Canon in D', category: 'CLASSIC', sales: 22, revenue: 330000 },
  { rank: 4, title: 'River Flows in You', category: 'ETC', sales: 19, revenue: 285000 },
  { rank: 5, title: 'Liebesleid', category: 'CLASSIC', sales: 17, revenue: 255000 },
  { rank: 6, title: 'Summer', category: 'ANI', sales: 15, revenue: 225000 },
  { rank: 7, title: 'Kiss the Rain', category: 'ETC', sales: 13, revenue: 195000 },
  { rank: 8, title: 'Gymnopédie No.1', category: 'CLASSIC', sales: 12, revenue: 180000 },
  { rank: 9, title: 'A Town with an Ocean View', category: 'ANI', sales: 11, revenue: 165000 },
  { rank: 10, title: 'Spring Waltz', category: 'OST', sales: 10, revenue: 150000 },
]

const demoTopArrangements: TopArrangement[] = [
  { rank: 1, arrangement: 'Pf Solo', sales: 85, revenue: 1275000 },
  { rank: 2, arrangement: 'Vn, Pf', sales: 52, revenue: 780000 },
  { rank: 3, arrangement: 'Fl, Pf', sales: 38, revenue: 570000 },
  { rank: 4, arrangement: 'Str Quartet', sales: 30, revenue: 450000 },
  { rank: 5, arrangement: 'Fl, Cl, Pf', sales: 24, revenue: 360000 },
]

// ─── Top Song Monthly Sales ─────────────────────────────────────────────────

const demoTopSongMonthlySales: TopSongMonthlySalesResult = {
  data: Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}월`,
    'Clair de lune': Math.floor(Math.random() * 4) + 1,
    'Merry Go Round': Math.floor(Math.random() * 3) + 1,
    'Canon in D': Math.floor(Math.random() * 3) + 1,
  })),
  config: {
    'Clair de lune': 'hsl(var(--primary))',
    'Merry Go Round': 'hsl(var(--status-complete))',
    'Canon in D': 'hsl(var(--warning))',
  },
}

// ─── Scores ─────────────────────────────────────────────────────────────────

const demoSongs: Song[] = [
  {
    id: 'demo-song-1',
    title: 'Clair de lune',
    english_title: 'Clair de lune',
    composer: 'C. Debussy',
    category: 'CLASSIC',
    created_at: `${thisYear}-01-15T09:00:00Z`,
    arrangements: [
      { id: 'demo-arr-1', song_id: 'demo-song-1', arrangement: 'Fl, Cl, Pf', version: 'easy', commission_id: null, created_at: `${thisYear}-01-15T09:00:00Z` },
      { id: 'demo-arr-2', song_id: 'demo-song-1', arrangement: 'Pf Solo', version: 'hard', commission_id: null, created_at: `${thisYear}-01-20T09:00:00Z` },
    ],
  },
  {
    id: 'demo-song-2',
    title: 'Canon in D',
    english_title: 'Canon in D',
    composer: 'J. Pachelbel',
    category: 'CLASSIC',
    created_at: `${thisYear}-01-10T09:00:00Z`,
    arrangements: [
      { id: 'demo-arr-3', song_id: 'demo-song-2', arrangement: 'Str Quartet', version: null, commission_id: null, created_at: `${thisYear}-01-10T09:00:00Z` },
    ],
  },
  {
    id: 'demo-song-3',
    title: 'Merry Go Round of Life',
    english_title: 'Merry Go Round of Life',
    composer: 'Joe Hisaishi',
    category: 'ANI',
    created_at: `${thisYear}-02-01T09:00:00Z`,
    arrangements: [
      { id: 'demo-arr-4', song_id: 'demo-song-3', arrangement: 'Pf Solo', version: 'easy', commission_id: null, created_at: `${thisYear}-02-01T09:00:00Z` },
    ],
  },
  {
    id: 'demo-song-4',
    title: 'River Flows in You',
    english_title: 'River Flows in You',
    composer: 'Yiruma',
    category: 'ETC',
    created_at: `${thisYear}-01-05T09:00:00Z`,
    arrangements: [
      { id: 'demo-arr-5', song_id: 'demo-song-4', arrangement: 'Vn, Vc, Pf', version: 'easy', commission_id: null, created_at: `${thisYear}-01-05T09:00:00Z` },
    ],
  },
]

// ─── Excel Uploads ──────────────────────────────────────────────────────────

const demoExcelUploads: ExcelUpload[] = [
  { id: 'demo-upload-1', name: '2026년 1월 매출.xlsx', row_count: 28, uploaded_at: `${thisYear}-02-01T09:00:00Z` },
  { id: 'demo-upload-2', name: '2026년 2월 매출.xlsx', row_count: 25, uploaded_at: `${thisYear}-03-01T09:00:00Z` },
]

// ─── Sales Rows ─────────────────────────────────────────────────────────────

const demoSalesRows: ExcelRow[] = [
  { id: 'demo-row-1', amount: 15000, product: 'Clair de lune (Fl, Cl, Pf)', category: 'CLASSIC' },
  { id: 'demo-row-2', amount: 15000, product: 'Merry Go Round (Pf Solo)', category: 'ANI' },
  { id: 'demo-row-3', amount: 15000, product: 'Canon in D (Str Quartet)', category: 'CLASSIC' },
  { id: 'demo-row-4', amount: 15000, product: 'River Flows in You (Vn, Vc, Pf)', category: 'ETC' },
  { id: 'demo-row-5', amount: 15000, product: 'Liebesleid (Vn, Pf)', category: 'CLASSIC' },
]

// ─── Year Range ─────────────────────────────────────────────────────────────

const demoSalesYearRange = { min: thisYear - 1, max: thisYear }

// ─── Seasonal Pattern ───────────────────────────────────────────────────────

const monthLabels = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
const demoAvgRevenues = [420000,380000,510000,450000,620000,480000,550000,390000,470000,530000,580000,520000]
const demoMonthTopSongs = [
  ['Clair de lune','Canon in D','Liebesleid'],
  ['Canon in D','Clair de lune','Gymnopédie No.1'],
  ['Clair de lune','Merry Go Round','Spring Waltz'],
  ['Spring Waltz','Clair de lune','River Flows in You'],
  ['Merry Go Round','Clair de lune','Summer'],
  ['Summer','Kiss the Rain','River Flows in You'],
  ['Summer','Merry Go Round','Clair de lune'],
  ['River Flows in You','Kiss the Rain','Canon in D'],
  ['Canon in D','Clair de lune','Liebesleid'],
  ['Liebesleid','Canon in D','Gymnopédie No.1'],
  ['Clair de lune','Canon in D','Liebesleid'],
  ['Clair de lune','Merry Go Round','Canon in D'],
]

const demoSeasonalPattern: SeasonalPatternItem[] = Array.from({ length: 12 }, (_, i) => ({
  monthNum: i + 1,
  month: monthLabels[i],
  avgRevenue: demoAvgRevenues[i],
  avgCount: Math.round(demoAvgRevenues[i] / 15000),
  years: 2,
  topSongs: demoMonthTopSongs[i].map((title, j) => ({ title, avgCount: (8 - j * 2) * 2 })),
}))

// ─── Trending Songs ─────────────────────────────────────────────────────────

const demoTrendingSongs: TrendingSong[] = [
  { title: 'Clair de lune', recentSales: 12, prevSales: 7, growth: 71.4 },
  { title: 'Merry Go Round', recentSales: 9, prevSales: 6, growth: 50.0 },
  { title: 'River Flows in You', recentSales: 8, prevSales: 6, growth: 33.3 },
  { title: 'Liebesleid', recentSales: 5, prevSales: 4, growth: 25.0 },
  { title: 'Canon in D', recentSales: 7, prevSales: 6, growth: 16.7 },
  { title: 'Summer', recentSales: 4, prevSales: 4, growth: 0 },
]

// ─── Revenue Concentration ──────────────────────────────────────────────────

const demoRevenueConcentration: RevenueConcentrationItem[] = Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1,
  title: demoTopSongs[i]?.title ?? `Song ${i + 1}`,
  revenue: Math.max(420000 - i * 35000, 30000),
  revenueShare: parseFloat((14 - i * 1.2).toFixed(2)),
  cumulativeShare: parseFloat(Math.min((i + 1) * 12.5, 100).toFixed(2)),
  songShare: parseFloat(((i + 1) * 10).toFixed(1)),
}))

// ─── Registry ───────────────────────────────────────────────────────────────

const demoDataMap: Record<string, unknown> = {
  'commissions:list': demoCommissions,
  'commissions:monthlyCounts': demoMonthlyCommissionCounts,
  'stats:salesSummary': demoSalesSummary,
  'stats:monthlySales': demoMonthlySales,
  'stats:monthlyCategoryBreakdown': demoMonthlyCategoryBreakdown,
  'stats:categoryDistribution': demoCategoryDistribution,
  'stats:topSongs': demoTopSongs,
  'stats:topArrangements': demoTopArrangements,
  'stats:topSongMonthlySales': demoTopSongMonthlySales,
  'stats:salesRows': demoSalesRows,
  'stats:excelUploads': demoExcelUploads,
  'stats:salesRowsByUpload': demoSalesRows,
  'stats:salesYearRange': demoSalesYearRange,
  'stats:seasonalPattern': demoSeasonalPattern,
  'stats:trendingSongs': demoTrendingSongs,
  'stats:revenueConcentration': demoRevenueConcentration,
  'scores:list': demoSongs,
}

export function getDemoData(queryKey: readonly unknown[]): unknown {
  const [domain, type, id] = queryKey as [string, string, string?]
  const key = `${domain}:${type}`

  if (id) {
    if (key === 'commissions:detail') {
      return demoCommissions.find(c => c.id === id) ?? demoCommissions[0]
    }
    if (key === 'scores:detail') {
      return demoSongs.find(s => s.id === id) ?? demoSongs[0]
    }
    if (key === 'scores:arrangement') {
      const demoFiles = [
        { id: 'demo-file-score', arrangement_id: id, label: 'Score', file_type: 'score', url: logo, created_at: '' },
        { id: 'demo-file-part1', arrangement_id: id, label: 'Part 1', file_type: 'part', url: logo, created_at: '' },
        { id: 'demo-file-part2', arrangement_id: id, label: 'Part 2', file_type: 'part', url: logo, created_at: '' },
      ]
      for (const song of demoSongs) {
        const arr = song.arrangements.find(a => a.id === id)
        if (arr) {
          return {
            ...arr,
            songs: { title: song.title, composer: song.composer, english_title: song.english_title },
            arrangement_files: demoFiles,
          }
        }
      }
      const fallback = demoSongs[0]
      return {
        ...fallback.arrangements[0],
        songs: { title: fallback.title, composer: fallback.composer, english_title: fallback.english_title },
        arrangement_files: demoFiles,
      }
    }
  }

  return demoDataMap[key] ?? []
}
