export type SalesSummary = {
  totalRevenue: number
  totalCount: number
  lastMonthRevenue: number
  lastMonthCount: number
  revenueVsLastYear: number   // % 변화율
  countVsLastYear: number     // % 변화율
  revenueVsLastMonth: number  // % 변화율
  countVsLastMonth: number    // % 변화율
}

export type MonthlySale = {
  month: string
  revenue: number
  count: number
  prevRevenue: number
  prevCount: number
}

export type MonthlyCategoryData = {
  month: string
  CLASSIC: number
  POP: number
  'K-POP': number
  OST: number
  ANI: number
  ETC: number
}

export type TopSong = {
  rank: number
  title: string
  category: string
  sales: number
  revenue: number
}

export type TopArrangement = {
  rank: number
  arrangement: string
  sales: number
  revenue: number
}

export type TopSongMonthlySalesResult = {
  data: Record<string, string | number>[]
  config: Record<string, string>
}

export type ExcelUpload = {
  id: string
  name: string
  row_count: number
  uploaded_at: string
}