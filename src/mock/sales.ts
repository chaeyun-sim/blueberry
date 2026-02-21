import { MONTH } from '@/constants/month';

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

export const mockTopArrangements = [
  { rank: 1, arrangement: "QUARTET (Vn, Vn, Va, Vc)", sales: 234, revenue: 3510000 },
  { rank: 2, arrangement: "SOLO (Piano)", sales: 189, revenue: 1890000 },
  { rank: 3, arrangement: "DUET (Fl, Pf)", sales: 145, revenue: 2175000 },
  { rank: 4, arrangement: "TRIO (Vn, Va, Vc)", sales: 112, revenue: 1680000 },
  { rank: 5, arrangement: "QUINTET (Str)", sales: 78, revenue: 1560000 },
];