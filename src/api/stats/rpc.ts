import { supabase } from '@/lib/supabase';
import { MONTH } from '@/constants/month';
import { getUtcYear, pctChange, yearRange, parseNumeric } from '@/utils/stats-helpers';
import {
	CategoryDistributionItem,
	MonthlyCategoryData,
	MonthlySale,
	RevenueConcentrationItem,
	RpcCategoryDistributionRow,
	RpcMonthlyCategoryRow,
	RpcMonthlySaleRow,
	RpcRevenueConcentrationRow,
	RpcSalesSummaryRow,
	RpcSeasonalPatternRow,
	RpcTopArrangementRow,
	RpcTopSongMonthlySaleRow,
	RpcTopSongRow,
	RpcTrendingSongRow,
	SalesSummary,
	SeasonalPatternItem,
	TopArrangement,
	TopSong,
	TopSongMonthlySalesResult,
	TrendingSong,
} from '@/types/stats';

const SALES = 'sales';
const SOLD_AT = 'sold_at';

export async function getSalesSummary(): Promise<SalesSummary> {
	const { data, error } = await supabase.rpc('get_sales_summary');
	if (error) throw error;

	const d = data as RpcSalesSummaryRow;
	return {
		totalRevenue: d.totalRevenue,
		totalCount: d.totalCount,
		thisMonthCount: d.thisMonthCount,
		thisYearCount: d.thisYearCount,
		lastMonthRevenue: d.lastMonthRevenue,
		lastMonthCount: d.lastMonthCount,
		revenueVsLastYear: pctChange(d.thisYearRevenue, d.lastYearRevenue),
		countVsLastYear: pctChange(d.thisYearCount, d.lastYearCount),
		revenueVsLastMonth: pctChange(d.lastMonthRevenue, d.prevPrevRevenue),
		countVsLastMonth: pctChange(d.lastMonthCount, d.prevPrevCount),
	};
}

export async function getMonthlySales(year: number): Promise<MonthlySale[]> {
	const { data, error } = await supabase.rpc('get_monthly_sales', { p_year: year });
	if (error) throw error;

	return (data ?? []).map((row: RpcMonthlySaleRow) => ({
		month: MONTH[row.month_num as keyof typeof MONTH],
		revenue: row.revenue,
		count: row.count,
		prevRevenue: row.prev_revenue,
		prevCount: row.prev_count,
	}));
}

export async function getMonthlyCategoryBreakdown(year: number): Promise<MonthlyCategoryData[]> {
	const { data, error } = await supabase.rpc('get_monthly_category_breakdown', { p_year: year });
	if (error) throw error;

	return (data ?? []).map((row: RpcMonthlyCategoryRow) => ({
		month: MONTH[row.month_num as keyof typeof MONTH],
		CLASSIC: row.CLASSIC,
		POP: row.POP,
		'K-POP': row['K-POP'],
		OST: row.OST,
		ANI: row.ANI,
		ETC: row.ETC,
	}));
}

export async function getCategoryDistribution(year?: number): Promise<CategoryDistributionItem[]> {
	const { data, error } = await supabase.rpc('get_category_distribution', {
		p_year: year ?? null,
	});
	if (error) throw error;

	const rows = (data ?? []) as RpcCategoryDistributionRow[];
	const grandRevenue = rows.reduce((s, r) => s + r.revenue, 0);
	const grandCount = rows.reduce((s, r) => s + r.count, 0);

	if (grandRevenue === 0) return [];

	return rows
		.map(({ name, revenue, count }) => ({
			name,
			value: Math.round((revenue / grandRevenue) * 100),
			count,
			countShare: Math.round((count / grandCount) * 100),
			revenue,
		}))
		.sort((a, b) => b.value - a.value);
}

export async function getTopSongs(topN = 5): Promise<TopSong[]> {
	const { data, error } = await supabase.rpc('get_top_songs', { p_top_n: topN });
	if (error) throw error;

	return (data ?? []).map((row: RpcTopSongRow, i: number) => ({
		rank: i + 1,
		title: row.song_title,
		category: row.category,
		sales: row.sales,
		revenue: row.revenue,
	}));
}

export async function getTopArrangements(topN = 5): Promise<TopArrangement[]> {
	const { data, error } = await supabase.rpc('get_top_arrangements', { p_top_n: topN });
	if (error) throw error;

	return (data ?? []).map((row: RpcTopArrangementRow, i: number) => ({
		rank: i + 1,
		arrangement: row.arrangement,
		sales: row.sales,
		revenue: row.revenue,
	}));
}

export async function getTopSongMonthlySales(
	year: number,
	topN = 5,
): Promise<TopSongMonthlySalesResult> {
	const { data, error } = await supabase.rpc('get_top_song_monthly_sales', {
		p_year: year,
		p_top_n: topN,
	});
	if (error) throw error;

	const rows = (data ?? []) as RpcTopSongMonthlySaleRow[];

	const config: Record<string, string> = {};
	const keyMap = new Map<string, string>();

	for (const row of rows) {
		const key = `song${row.song_rank}`;
		if (!config[key]) {
			config[key] = row.song_title;
			keyMap.set(row.song_title, key);
		}
	}

	const monthMap = new Map<number, Record<string, number>>();
	for (let m = 1; m <= 12; m++) {
		const entry: Record<string, number> = {};
		for (const key of Object.keys(config)) entry[key] = 0;
		monthMap.set(m, entry);
	}
	for (const row of rows) {
		const key = keyMap.get(row.song_title);
		if (!key) continue;
		monthMap.get(row.month_num)![key] = row.count;
	}

	const chartData = Array.from({ length: 12 }, (_, i) => {
		const m = i + 1;
		return { month: MONTH[m as keyof typeof MONTH], ...monthMap.get(m)! };
	});

	return { data: chartData, config };
}

export async function getSalesYearRange(): Promise<{ min: number; max: number } | null> {
	const [{ data: minRow, error: minError }, { data: maxRow, error: maxError }] =
		await Promise.all([
			supabase.from(SALES).select(SOLD_AT).order(SOLD_AT, { ascending: true }).limit(1).maybeSingle(),
			supabase.from(SALES).select(SOLD_AT).order(SOLD_AT, { ascending: false }).limit(1).maybeSingle(),
		]);

	if (minError) throw minError;
	if (maxError) throw maxError;
	if (!minRow || !maxRow) return null;
	return { min: getUtcYear(minRow.sold_at), max: getUtcYear(maxRow.sold_at) };
}

export async function getSeasonalPattern(): Promise<SeasonalPatternItem[]> {
	const { data, error } = await supabase.rpc('get_seasonal_pattern');
	if (error) throw error;

	return (data ?? []).map((row: RpcSeasonalPatternRow) => ({
		monthNum: row.month_num,
		month: MONTH[row.month_num as keyof typeof MONTH],
		avgRevenue: row.avg_revenue,
		avgCount: row.avg_count,
		years: row.years,
		topSongs: row.top_songs ?? [],
	}));
}

export async function getTrendingSongs(): Promise<TrendingSong[]> {
	const { data, error } = await supabase.rpc('get_trending_songs');
	if (error) throw error;

	return (data ?? []).map((row: RpcTrendingSongRow) => ({
		title: row.title,
		recentSales: row.recent_sales,
		prevSales: row.prev_sales,
		growth: parseNumeric(row.growth),
	}));
}

export async function getRevenueConcentration(): Promise<RevenueConcentrationItem[]> {
	const { data, error } = await supabase.rpc('get_revenue_concentration');
	if (error) throw error;

	return (data ?? []).map((row: RpcRevenueConcentrationRow) => ({
		rank: row.rank,
		title: row.title,
		revenue: row.revenue,
		revenueShare: parseNumeric(row.revenue_share),
		cumulativeShare: parseNumeric(row.cumulative_share),
		songShare: parseNumeric(row.song_share),
	}));
}
