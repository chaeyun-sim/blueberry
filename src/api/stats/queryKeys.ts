export const statsKeys = {
  all: ['stats'] as const,
  salesSummary: () => [...statsKeys.all, 'salesSummary'] as const,
  monthlySales: (year: number) => [...statsKeys.all, 'monthlySales', year] as const,
  monthlyCategoryBreakdown: (year: number) => [...statsKeys.all, 'monthlyCategoryBreakdown', year] as const,
  categoryDistribution: () => [...statsKeys.all, 'categoryDistribution'] as const,
  topSongs: () => [...statsKeys.all, 'topSongs'] as const,
  topArrangements: () => [...statsKeys.all, 'topArrangements'] as const,
  topSongMonthlySales: (year: number) => [...statsKeys.all, 'topSongMonthlySales', year] as const,
  salesRows: (year?: number) => [...statsKeys.all, 'salesRows', year] as const,
  excelUploads: () => [...statsKeys.all, 'excelUploads'] as const,
  salesRowsByUpload: (uploadId: string) => [...statsKeys.all, 'salesRowsByUpload', uploadId] as const,
  salesYearRange: () => [...statsKeys.all, 'salesYearRange'] as const,
}