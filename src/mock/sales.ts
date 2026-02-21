import { ChartConfig } from '@/components/ui/chart';
import { MONTH } from '@/constants/month';

// 월별 카테고리 비율 (12월엔 크리스마스 곡으로 CLASSIC↑, 여름엔 ANI↑)
const categoryRatios = [
  { CLASSIC: 0.50, OST: 0.22, ANI: 0.18, ETC: 0.10 }, // 1월
  { CLASSIC: 0.42, OST: 0.28, ANI: 0.20, ETC: 0.10 }, // 2월
  { CLASSIC: 0.45, OST: 0.25, ANI: 0.20, ETC: 0.10 }, // 3월
  { CLASSIC: 0.40, OST: 0.30, ANI: 0.22, ETC: 0.08 }, // 4월
  { CLASSIC: 0.43, OST: 0.27, ANI: 0.22, ETC: 0.08 }, // 5월
  { CLASSIC: 0.45, OST: 0.25, ANI: 0.20, ETC: 0.10 }, // 6월
  { CLASSIC: 0.38, OST: 0.23, ANI: 0.29, ETC: 0.10 }, // 7월 (여름 ANI↑)
  { CLASSIC: 0.36, OST: 0.22, ANI: 0.32, ETC: 0.10 }, // 8월 (여름 ANI↑)
  { CLASSIC: 0.45, OST: 0.25, ANI: 0.20, ETC: 0.10 }, // 9월
  { CLASSIC: 0.47, OST: 0.24, ANI: 0.18, ETC: 0.11 }, // 10월
  { CLASSIC: 0.48, OST: 0.24, ANI: 0.17, ETC: 0.11 }, // 11월
  { CLASSIC: 0.58, OST: 0.20, ANI: 0.13, ETC: 0.09 }, // 12월 (크리스마스 CLASSIC↑)
];

export const monthlySalesData = [
  { revenue: 1250000, count: 102, prevRevenue: 1100000, prevCount: 90 },
  { revenue: 980000, count: 87, prevRevenue: 1050000, prevCount: 92 },
  { revenue: 1540000, count: 118, prevRevenue: 1320000, prevCount: 105 },
  { revenue: 1120000, count: 95, prevRevenue: 1080000, prevCount: 88 },
  { revenue: 1780000, count: 134, prevRevenue: 1500000, prevCount: 120 },
  { revenue: 1340000, count: 108, prevRevenue: 1200000, prevCount: 96 },
  { revenue: 1650000, count: 125, prevRevenue: 1400000, prevCount: 110 },
  { revenue: 1420000, count: 110, prevRevenue: 1350000, prevCount: 102 },
  { revenue: 1890000, count: 142, prevRevenue: 1600000, prevCount: 125 },
  { revenue: 2100000, count: 156, prevRevenue: 1850000, prevCount: 140 },
  { revenue: 1760000, count: 98, prevRevenue: 1700000, prevCount: 130 },
  { revenue: 2340000, count: 109, prevRevenue: 2000000, prevCount: 150 },
].map((item, i) => ({ month: MONTH[i + 1 as keyof typeof MONTH], ...item }));

export const monthlyCategoryData = monthlySalesData.map((d, i) => {
  const r = categoryRatios[i];
  return {
    month: d.month,
    CLASSIC: Math.round(d.revenue * r.CLASSIC),
    OST: Math.round(d.revenue * r.OST),
    ANI: Math.round(d.revenue * r.ANI),
    ETC: Math.round(d.revenue * r.ETC),
  };
});

// 2025 data derived from prevRevenue/prevCount; 2024 prev values approximated at ~92% of 2025
const monthlySalesData2025 = monthlySalesData.map(d => ({
  month: d.month,
  revenue: d.prevRevenue,
  count: d.prevCount,
  prevRevenue: Math.round(d.prevRevenue * 0.92),
  prevCount: Math.round(d.prevCount * 0.92),
}));

const monthlyCategoryData2025 = monthlySalesData2025.map((d, i) => {
  const r = categoryRatios[i];
  return {
    month: d.month,
    CLASSIC: Math.round(d.revenue * r.CLASSIC),
    OST: Math.round(d.revenue * r.OST),
    ANI: Math.round(d.revenue * r.ANI),
    ETC: Math.round(d.revenue * r.ETC),
  };
});

export const monthlySalesByYear: Record<string, typeof monthlySalesData> = {
  '2026': monthlySalesData,
  '2025': monthlySalesData2025,
};

export const monthlyCategoryByYear: Record<string, typeof monthlyCategoryData> = {
  '2026': monthlyCategoryData,
  '2025': monthlyCategoryData2025,
};

export const mockExcelData = [
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


export const mockTopSongs = [
  { rank: 1, title: "Canon in D", category: "CLASSIC", sales: 156, revenue: 2340000 },
  { rank: 2, title: "River Flows in You", category: "CLASSIC", sales: 132, revenue: 1980000 },
  { rank: 3, title: "Kiss the Rain", category: "CLASSIC", sales: 98, revenue: 1470000 },
  { rank: 4, title: "君をのせて (천공의 성 라퓨타)", category: "ANI", sales: 87, revenue: 1305000 },
  { rank: 5, title: "Merry Go Round of Life", category: "ANI", sales: 76, revenue: 1140000 },
];

export const mockMonthlyBestSellers = [
  { rank: 1, title: "Canon in D", month: "12월", sales: 42, category: "CLASSIC" },
  { rank: 2, title: "River Flows in You", month: "10월", sales: 38, category: "CLASSIC" },
  { rank: 3, title: "Merry Go Round of Life", month: "5월", sales: 31, category: "ANI" },
  { rank: 4, title: "A Thousand Years", month: "2월", sales: 28, category: "OST" },
  { rank: 5, title: "君をのせて", month: "9월", sales: 25, category: "ANI" },
];

// 인기곡 TOP5 월별 판매 건수 (Canon in D, River Flows in You, Kiss the Rain, 君をのせて, Merry Go Round)
const topProductMonthlyRaw = [
  [10, 8, 6, 5, 4],   // 1월
  [9,  7, 5, 4, 3],   // 2월
  [14, 12, 9, 7, 6],  // 3월
  [12, 10, 8, 7, 7],  // 4월
  [16, 14, 11, 9, 12],// 5월
  [13, 11, 9, 8, 8],  // 6월
  [15, 13, 10, 12, 10],// 7월 (ANI↑)
  [14, 12, 9, 13, 10],// 8월 (ANI↑)
  [17, 15, 11, 8, 6], // 9월
  [20, 17, 12, 7, 5], // 10월
  [10, 8,  5, 4, 3],  // 11월
  [6,  5,  3, 3, 2],  // 12월
];

export const mockTopProductMonthlySales = topProductMonthlyRaw.map((v, i) => ({
  month: MONTH[i + 1 as keyof typeof MONTH],
  canonInD:     v[0],
  riverFlows:   v[1],
  kissTheRain:  v[2],
  kimitachi:    v[3],
  merryGoRound: v[4],
}));

export const mockTopArrangements = [
  { rank: 1, arrangement: "QUARTET (Vn, Vn, Va, Vc)", sales: 234, revenue: 3510000 },
  { rank: 2, arrangement: "SOLO (Piano)", sales: 189, revenue: 1890000 },
  { rank: 3, arrangement: "DUET (Fl, Pf)", sales: 145, revenue: 2175000 },
  { rank: 4, arrangement: "TRIO (Vn, Va, Vc)", sales: 112, revenue: 1680000 },
  { rank: 5, arrangement: "QUINTET (Str)", sales: 78, revenue: 1560000 },
];

export const mockTopProductConfig = {
  canonInD: 'Canon in D',
  riverFlows: 'River Flows in You',
  kissTheRain: 'Kiss the Rain',
  kimitachi: '君をのせて',
  merryGoRound: 'Merry Go Round of Life',
};