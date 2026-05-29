import { supabase } from '@/lib/supabase';
import { MONTH } from '@/constants/month';
import { ExcelRow } from '@/types/excel';
import {
	CategoryDistributionItem,
	ExcelUpload,
	MonthlyCategoryData,
	MonthlySale,
	RevenueConcentrationItem,
	SalesSummary,
	SeasonalPatternItem,
	TopArrangement,
	TopSong,
	TopSongMonthlySalesResult,
	TrendingSong,
} from '@/types/stats';
import { splitProduct } from '@/utils/split-product';

const SALES = 'sales';
const EXCEL_UPLOADS = 'excel_uploads';
const SOLD_AT = 'sold_at';
const SALES_ROW_SELECT = 'id, sold_at, amount, category, product';
const EXCEL_UPLOADS_SELECT = 'id, name, row_count, uploaded_at';
const SONGS = 'songs';
const ARRANGEMENTS = 'arrangements';

const CATEGORIES = new Set(['CLASSIC', 'POP', 'K-POP', 'OST', 'ANI', 'ETC']);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getUtcYear = (iso: string) => new Date(iso).getUTCFullYear();

function pctChange(current: number, prev: number): number {
	if (prev === 0) return 0;
	return parseFloat((((current - prev) / prev) * 100).toFixed(1));
}

function dateRange(year: number, month?: number) {
	if (month !== undefined) {
		const nextMonth = month === 12 ? 1 : month + 1;
		const nextMonthYear = month === 12 ? year + 1 : year;
		const mm = String(month).padStart(2, '0');
		const nmm = String(nextMonth).padStart(2, '0');
		return { gte: `${year}-${mm}-01`, lt: `${nextMonthYear}-${nmm}-01` };
	}
	return { gte: `${year}-01-01`, lt: `${year + 1}-01-01` };
}

const norm = (s: string) =>
	s
		.toLowerCase()
		.replace(/\s*([(),])\s*/g, '$1')
		.trim();

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * 요약 통계 조회 (SalesSummaryCard 4개용)
 * - 올해 총 매출 / 총 판매건 (vs 작년 비교)
 * - 지난달 매출 / 판매건 (vs 전월 비교)
 */
export async function getSalesSummary(): Promise<SalesSummary> {
	const { data, error } = await supabase.rpc('get_sales_summary');
	if (error) throw error;

	const d = data as {
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

/**
 * 월별 매출 추이 조회 (YearlyStats 월별 매출 추이 / 성장률 차트용)
 */
export async function getMonthlySales(year: number): Promise<MonthlySale[]> {
	const { data, error } = await supabase.rpc('get_monthly_sales', { p_year: year });
	if (error) throw error;

	return (data ?? []).map((row: { month_num: number; revenue: number; count: number; prev_revenue: number; prev_count: number }) => ({
		month: MONTH[row.month_num as keyof typeof MONTH],
		revenue: row.revenue,
		count: row.count,
		prevRevenue: row.prev_revenue,
		prevCount: row.prev_count,
	}));
}

/**
 * 월별 카테고리 매출 분포 조회 (YearlyStats 카테고리 비중 차트용)
 */
export async function getMonthlyCategoryBreakdown(
	year: number,
): Promise<MonthlyCategoryData[]> {
	const { data, error } = await supabase.rpc('get_monthly_category_breakdown', { p_year: year });
	if (error) throw error;

	return (data ?? []).map((row: {
		month_num: number;
		CLASSIC: number;
		POP: number;
		'K-POP': number;
		OST: number;
		ANI: number;
		ETC: number;
	}) => ({
		month: MONTH[row.month_num as keyof typeof MONTH],
		CLASSIC: row.CLASSIC,
		POP: row.POP,
		'K-POP': row['K-POP'],
		OST: row.OST,
		ANI: row.ANI,
		ETC: row.ETC,
	}));
}

/**
 * 카테고리별 매출 비율 조회 (Stats 파이차트용)
 */
export async function getCategoryDistribution(
	year?: number,
): Promise<CategoryDistributionItem[]> {
	const { data, error } = await supabase.rpc('get_category_distribution', {
		p_year: year ?? null,
	});
	if (error) throw error;

	const rows = (data ?? []) as { name: string; revenue: number; count: number }[];
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

/**
 * 인기곡 TOP N 조회 (Stats 가로 막대 차트용)
 */
export async function getTopSongs(topN = 5): Promise<TopSong[]> {
	const { data, error } = await supabase.rpc('get_top_songs', { p_top_n: topN });
	if (error) throw error;

	return (data ?? []).map((row: { song_title: string; category: string; sales: number; revenue: number }, i: number) => ({
		rank: i + 1,
		title: row.song_title,
		category: row.category,
		sales: row.sales,
		revenue: row.revenue,
	}));
}

/**
 * 인기 편성 TOP N 조회 (Stats 레이더 차트용)
 */
export async function getTopArrangements(topN = 5): Promise<TopArrangement[]> {
	const { data, error } = await supabase.rpc('get_top_arrangements', { p_top_n: topN });
	if (error) throw error;

	return (data ?? []).map((row: { arrangement: string; sales: number; revenue: number }, i: number) => ({
		rank: i + 1,
		arrangement: row.arrangement,
		sales: row.sales,
		revenue: row.revenue,
	}));
}

/**
 * 인기곡 TOP N 월별 판매 추이 조회 (Stats 라인차트용)
 */
export async function getTopSongMonthlySales(
	year: number,
	topN = 5,
): Promise<TopSongMonthlySalesResult> {
	const { data, error } = await supabase.rpc('get_top_song_monthly_sales', {
		p_year: year,
		p_top_n: topN,
	});
	if (error) throw error;

	const rows = (data ?? []) as {
		month_num: number;
		song_title: string;
		count: number;
		song_rank: number;
	}[];

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

/**
 * 판매 데이터의 연도 범위 조회 (드롭다운 옵션용)
 */
export async function getSalesYearRange(): Promise<{
	min: number;
	max: number;
} | null> {
	const [{ data: minRow, error: minError }, { data: maxRow, error: maxError }] =
		await Promise.all([
			supabase
				.from(SALES)
				.select(SOLD_AT)
				.order(SOLD_AT, { ascending: true })
				.limit(1)
				.maybeSingle(),
			supabase
				.from(SALES)
				.select(SOLD_AT)
				.order(SOLD_AT, { ascending: false })
				.limit(1)
				.maybeSingle(),
		]);

	if (minError) throw minError;
	if (maxError) throw maxError;
	if (!minRow || !maxRow) return null;
	return {
		min: getUtcYear(minRow.sold_at),
		max: getUtcYear(maxRow.sold_at),
	};
}

/**
 * 월별 계절성 패턴 조회 (전체 12개월, 과거 연도 평균 + 상위 곡)
 */
export async function getSeasonalPattern(): Promise<SeasonalPatternItem[]> {
	const { data, error } = await supabase.rpc('get_seasonal_pattern');
	if (error) throw error;

	return (data ?? []).map((row: {
		month_num: number;
		avg_revenue: number;
		avg_count: number;
		years: number;
		top_songs: { title: string; avgCount: number }[];
	}) => ({
		monthNum: row.month_num,
		month: MONTH[row.month_num as keyof typeof MONTH],
		avgRevenue: row.avg_revenue,
		avgCount: row.avg_count,
		years: row.years,
		topSongs: row.top_songs ?? [],
	}));
}

/**
 * 최근 3개월 vs 직전 3개월 판매 상승 곡 조회
 */
export async function getTrendingSongs(): Promise<TrendingSong[]> {
	const { data, error } = await supabase.rpc('get_trending_songs');
	if (error) throw error;

	return (data ?? []).map((row: {
		title: string;
		recent_sales: number;
		prev_sales: number;
		growth: number;
	}) => ({
		title: row.title,
		recentSales: row.recent_sales,
		prevSales: row.prev_sales,
		growth: parseFloat(String(row.growth)),
	}));
}

/**
 * 매출 집중도 조회 (파레토 분석용)
 */
export async function getRevenueConcentration(): Promise<
	RevenueConcentrationItem[]
> {
	const { data, error } = await supabase.rpc('get_revenue_concentration');
	if (error) throw error;

	return (data ?? []).map((row: {
		rank: number;
		title: string;
		revenue: number;
		revenue_share: number;
		cumulative_share: number;
		song_share: number;
	}) => ({
		rank: row.rank,
		title: row.title,
		revenue: row.revenue,
		revenueShare: parseFloat(String(row.revenue_share)),
		cumulativeShare: parseFloat(String(row.cumulative_share)),
		songShare: parseFloat(String(row.song_share)),
	}));
}

// ─── Excel Upload Management ──────────────────────────────────────────────────

/**
 * 업로드 목록 조회
 */
export async function getExcelUploads(): Promise<ExcelUpload[]> {
	const { data, error } = await supabase
		.from(EXCEL_UPLOADS)
		.select(EXCEL_UPLOADS_SELECT)
		.order('name', { ascending: false });

	if (error) throw error;
	return data ?? [];
}

/**
 * 업로드 삭제 (CASCADE로 연결된 sales 행도 삭제됨)
 */
export async function deleteExcelUpload(id: string): Promise<void> {
	const { error } = await supabase.from(EXCEL_UPLOADS).delete().eq('id', id);
	if (error) throw error;
}

/**
 * 특정 업로드의 판매 행 조회
 */
export async function getSalesRowsByUploadId(
	uploadId: string,
): Promise<ExcelRow[]> {
	const { data, error } = await supabase
		.from(SALES)
		.select(SALES_ROW_SELECT)
		.eq('upload_id', uploadId)
		.order('category', { ascending: true })
		.order('product', { ascending: true })
		.order('amount', { ascending: false });

	if (error) throw error;

	return (data ?? []).map((row) => ({
		id: row.id,
		category: row.category && CATEGORIES.has(row.category) ? row.category : 'ETC',
		product: row.product ?? '',
		amount: row.amount,
	}));
}

/**
 * 엑셀 데이터 저장 (ExcelRow[] → sales 테이블)
 */
export async function saveSalesRows(
	rows: ExcelRow[],
	uploadName: string,
): Promise<void> {
	if (rows.length === 0) return;

	const uploadDate = (() => {
		const m1 = uploadName.match(/(\d{4})[^\d](\d{2})/);
		if (m1) return `${m1[1]}-${m1[2]}-01 00:00:00`;
		const m2 = uploadName.match(/(\d{4})(\d{2})/);
		if (m2) return `${m2[1]}-${m2[2]}-01 00:00:00`;
		return new Date().toISOString().slice(0, 10) + ' 00:00:00';
	})();

	const { data: uploadRecord, error: uploadError } = await supabase
		.from(EXCEL_UPLOADS)
		.insert({ name: uploadName, row_count: rows.length })
		.select('id')
		.single();

	if (uploadError) throw uploadError;

	const uploadId = uploadRecord.id;

	const [{ data: songs, error: se }, { data: arrangements, error: ae }] =
		await Promise.all([
			supabase.from(SONGS).select('id, title').is('deleted_at', null),
			supabase
				.from(ARRANGEMENTS)
				.select('id, song_id, arrangement')
				.is('deleted_at', null),
		]);

	if (se) throw se;
	if (ae) throw ae;

	const songMap = new Map((songs ?? []).map((s) => [norm(s.title), s.id]));
	const arrangementMap = new Map(
		(arrangements ?? []).map((a) => [
			`${a.song_id}:${norm(a.arrangement)}`,
			a.id,
		]),
	);

	const inserts = rows.map((row) => {
		const { song: songTitle, arrangement: arrangementStr } = splitProduct(
			row.product,
		);

		const song_id = songMap.get(norm(songTitle)) ?? null;
		const arrangement_id =
			(song_id
				? arrangementMap.get(`${song_id}:${norm(arrangementStr)}`)
				: undefined) ?? null;

		return {
			song_id,
			arrangement_id,
			upload_id: uploadId,
			category:
				row.category && CATEGORIES.has(row.category) ? row.category : 'ETC',
			product: row.product,
			amount: row.amount,
			sold_at: uploadDate,
		};
	});

	const CHUNK_SIZE = 500;
	try {
		for (let i = 0; i < inserts.length; i += CHUNK_SIZE) {
			const { error } = await supabase
				.from(SALES)
				.insert(inserts.slice(i, i + CHUNK_SIZE));
			if (error) throw error;
		}
	} catch (err) {
		await supabase.from(EXCEL_UPLOADS).delete().eq('id', uploadId);
		throw err;
	}
}

/**
 * 전체 판매 목록 조회 (SalesAll 테이블용, ExcelRow 형태)
 */
export async function getSalesRows(year?: number): Promise<ExcelRow[]> {
	let query = supabase
		.from(SALES)
		.select(SALES_ROW_SELECT)
		.order(SOLD_AT, { ascending: false });

	if (year) {
		query = query
			.gte(SOLD_AT, dateRange(year).gte)
			.lt(SOLD_AT, dateRange(year).lt);
	}

	const { data, error } = await query;
	if (error) throw error;

	return (data ?? []).map((row) => ({
		id: row.id,
		category: row.category && CATEGORIES.has(row.category) ? row.category : 'ETC',
		product: row.product ?? '',
		amount: row.amount,
	}));
}
