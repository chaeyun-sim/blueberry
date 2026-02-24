import { queryOptions } from '@tanstack/react-query';
import { statsKeys } from './queryKeys';
import { getCategoryDistribution, getMonthlySales, getSalesSummary, getTopSongs, getTopArrangements, getTopSongMonthlySales, getMonthlyCategoryBreakdown, getSalesRows, getExcelUploads, getSalesRowsByUploadId, getSalesYearRange } from '.';

export const statsQueries = {
  getSalesSummary: () => queryOptions({
    queryKey: statsKeys.salesSummary(),
    queryFn: getSalesSummary,
  }),
  getMonthlySales: (year: number) => queryOptions({
    queryKey: statsKeys.monthlySales(year),
		queryFn: () => getMonthlySales(year),
		enabled: !!year,
  }),
  getMonthlyCategoryBreakdown: (year: number) => queryOptions({
    queryKey: statsKeys.monthlyCategoryBreakdown(year),
    queryFn: () => getMonthlyCategoryBreakdown(year),
    enabled: !!year,
  }),
  getCategoryDistribution: () => queryOptions({
		queryKey: statsKeys.categoryDistribution(),
		queryFn: () => getCategoryDistribution(),
	}),
  getTopSongs: () => queryOptions({
    queryKey: statsKeys.topSongs(),
    queryFn: () => getTopSongs(),
  }),
  getTopArrangements: () => queryOptions({
    queryKey: statsKeys.topArrangements(),
    queryFn: () => getTopArrangements(),
  }),
  getTopSongMonthlySales: (year: number) => queryOptions({
    queryKey: statsKeys.topSongMonthlySales(year),
    queryFn: () => getTopSongMonthlySales(year),
    enabled: !!year,
  }),
  getSalesRows: (year?: number) => queryOptions({
    queryKey: statsKeys.salesRows(year),
    queryFn: () => getSalesRows(year),
  }),
  getExcelUploads: () => queryOptions({
    queryKey: statsKeys.excelUploads(),
    queryFn: getExcelUploads,
  }),
  getSalesRowsByUploadId: (uploadId: string) => queryOptions({
    queryKey: statsKeys.salesRowsByUpload(uploadId),
    queryFn: () => getSalesRowsByUploadId(uploadId),
    enabled: !!uploadId,
  }),
  getSalesYearRange: () => queryOptions({
    queryKey: statsKeys.salesYearRange(),
    queryFn: getSalesYearRange,
  }),
}