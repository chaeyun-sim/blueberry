import { queryOptions } from '@tanstack/react-query';
import { statsKeys } from './queryKeys';
import {
	getCategoryDistribution,
	getMonthlySales,
	getSalesSummary,
	getTopSongs,
	getTopArrangements,
	getTopSongMonthlySales,
	getMonthlyCategoryBreakdown,
	getSalesRows,
	getExcelUploads,
	getSalesRowsByUploadId,
	getSalesYearRange,
	getSeasonalPattern,
	getTrendingSongs,
	getRevenueConcentration,
} from '.';

const PAST_YEAR_STALE = Infinity;
const STATS_STALE = 1000 * 60 * 15; // 15분
const STATS_RETRY = 2;

const isPastYear = (year: number) => year < new Date().getFullYear();

export const statsQueries = {
	getSalesSummary: () =>
		queryOptions({
			queryKey: statsKeys.salesSummary(),
			queryFn: getSalesSummary,
			staleTime: STATS_STALE,
			retry: STATS_RETRY,
		}),
	getMonthlySales: (year: number) =>
		queryOptions({
			queryKey: statsKeys.monthlySales(year),
			queryFn: () => getMonthlySales(year),
			enabled: !!year,
			staleTime: isPastYear(year) ? PAST_YEAR_STALE : STATS_STALE,
			retry: STATS_RETRY,
		}),
	getMonthlyCategoryBreakdown: (year: number) =>
		queryOptions({
			queryKey: statsKeys.monthlyCategoryBreakdown(year),
			queryFn: () => getMonthlyCategoryBreakdown(year),
			enabled: !!year,
			staleTime: isPastYear(year) ? PAST_YEAR_STALE : STATS_STALE,
			retry: STATS_RETRY,
		}),
	getCategoryDistribution: () =>
		queryOptions({
			queryKey: statsKeys.categoryDistribution(),
			queryFn: () => getCategoryDistribution(),
			staleTime: STATS_STALE,
			retry: STATS_RETRY,
		}),
	getTopSongs: () =>
		queryOptions({
			queryKey: statsKeys.topSongs(),
			queryFn: () => getTopSongs(),
			staleTime: STATS_STALE,
			retry: STATS_RETRY,
		}),
	getTopArrangements: () =>
		queryOptions({
			queryKey: statsKeys.topArrangements(),
			queryFn: () => getTopArrangements(),
			staleTime: STATS_STALE,
			retry: STATS_RETRY,
		}),
	getTopSongMonthlySales: (year: number) =>
		queryOptions({
			queryKey: statsKeys.topSongMonthlySales(year),
			queryFn: () => getTopSongMonthlySales(year),
			enabled: !!year,
			staleTime: isPastYear(year) ? PAST_YEAR_STALE : STATS_STALE,
			retry: STATS_RETRY,
		}),
	getSalesRows: (year?: number) =>
		queryOptions({
			queryKey: statsKeys.salesRows(year),
			queryFn: () => getSalesRows(year),
			staleTime: year && isPastYear(year) ? PAST_YEAR_STALE : STATS_STALE,
			retry: STATS_RETRY,
		}),
	getExcelUploads: () =>
		queryOptions({
			queryKey: statsKeys.excelUploads(),
			queryFn: getExcelUploads,
			retry: STATS_RETRY,
		}),
	getSalesRowsByUploadId: (uploadId: string) =>
		queryOptions({
			queryKey: statsKeys.salesRowsByUpload(uploadId),
			queryFn: () => getSalesRowsByUploadId(uploadId),
			enabled: !!uploadId,
			staleTime: PAST_YEAR_STALE,
			retry: STATS_RETRY,
		}),
	getSalesYearRange: () =>
		queryOptions({
			queryKey: statsKeys.salesYearRange(),
			queryFn: getSalesYearRange,
			staleTime: STATS_STALE,
			retry: STATS_RETRY,
		}),
	getSeasonalPattern: () =>
		queryOptions({
			queryKey: statsKeys.seasonalPattern(),
			queryFn: getSeasonalPattern,
			staleTime: STATS_STALE,
			retry: STATS_RETRY,
		}),
	getTrendingSongs: () =>
		queryOptions({
			queryKey: statsKeys.trendingSongs(),
			queryFn: () => getTrendingSongs(),
			staleTime: STATS_STALE,
			retry: STATS_RETRY,
		}),
	getRevenueConcentration: () =>
		queryOptions({
			queryKey: statsKeys.revenueConcentration(),
			queryFn: getRevenueConcentration,
			staleTime: STATS_STALE,
			retry: STATS_RETRY,
		}),
};
