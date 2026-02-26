import { supabase } from '@/lib/supabase';
import { MONTH } from '@/constants/month';
import { ExcelRow } from '@/types/excel';
import {
  CategoryDistributionItem,
  ExcelUpload,
  MonthlyCategoryData,
  MonthlySale,
  SalesSummary,
  TopArrangement,
  TopSong,
  TopSongMonthlySalesResult,
} from '@/types/stats';
import { splitProduct } from '@/utils/split-product';

const SALES = 'sales';
const EXCEL_UPLOADS = 'excel_uploads';
const SELECT_AMOUNT = 'amount';
const SOLD_AT = 'sold_at';
const MONTHLY_SALES_SELECT = 'sold_at, amount';
const SALES_ROW_SELECT = 'id, sold_at, amount, category, product';
const EXCEL_UPLOADS_SELECT = 'id, name, row_count, uploaded_at';
const SONGS = 'songs';
const ARRANGEMENTS = 'arrangements';

// Supabase 기본 반환 한도(1,000행) 우회 — 집계 쿼리 전체에 적용
const MAX_ROWS = 100_000;

const CATEGORIES = new Set(['CLASSIC', 'POP', 'K-POP', 'OST', 'ANI', 'ETC']);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getUtcMonth = (iso: string) => new Date(iso).getUTCMonth() + 1;
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

function aggregateByMonth(rows: { sold_at: string; amount: number }[]) {
  const map = new Map<number, { revenue: number; count: number }>();
  for (let m = 1; m <= 12; m++) map.set(m, { revenue: 0, count: 0 });
  for (const row of rows) {
    const m = getUtcMonth(row.sold_at);
    const agg = map.get(m)!;
    agg.revenue += row.amount;
    agg.count += 1;
  }
  return map;
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
  const now = new Date();
  const thisYear = getUtcYear(now.toISOString());
  const thisMonth = getUtcMonth(now.toISOString());
  const prevMonth = thisMonth === 1 ? 12 : thisMonth - 1;
  const prevMonthYear = thisMonth === 1 ? thisYear - 1 : thisYear;
  const prevPrevMonth = prevMonth === 1 ? 12 : prevMonth - 1;
  const prevPrevMonthYear = prevMonth === 1 ? prevMonthYear - 1 : prevMonthYear;

  const thisYearRange = dateRange(thisYear);
  const lastYearRange = dateRange(thisYear - 1);
  const prevMonthRange = dateRange(prevMonthYear, prevMonth);
  const prevPrevMonthRange = dateRange(prevPrevMonthYear, prevPrevMonth);

  const [
    { data: allRows, error: e0 },
    { data: thisYearRows, error: e1 },
    { data: lastYearRows, error: e2 },
    { data: prevMonthRows, error: e3 },
    { data: prevPrevMonthRows, error: e4 },
  ] = await Promise.all([
    supabase.from(SALES).select(SELECT_AMOUNT).limit(MAX_ROWS),
    supabase
      .from(SALES)
      .select(SELECT_AMOUNT)
      .gte(SOLD_AT, thisYearRange.gte)
      .lt(SOLD_AT, thisYearRange.lt!)
      .limit(MAX_ROWS),
    supabase
      .from(SALES)
      .select(SELECT_AMOUNT)
      .gte(SOLD_AT, lastYearRange.gte)
      .lt(SOLD_AT, lastYearRange.lt!)
      .limit(MAX_ROWS),
    supabase
      .from(SALES)
      .select(SELECT_AMOUNT)
      .gte(SOLD_AT, prevMonthRange.gte)
      .lt(SOLD_AT, prevMonthRange.lt!)
      .limit(MAX_ROWS),
    supabase
      .from(SALES)
      .select(SELECT_AMOUNT)
      .gte(SOLD_AT, prevPrevMonthRange.gte)
      .lt(SOLD_AT, prevPrevMonthRange.lt!)
      .limit(MAX_ROWS),
  ]);

  if (e0) throw e0;
  if (e1) throw e1;
  if (e2) throw e2;
  if (e3) throw e3;
  if (e4) throw e4;

  const totalRevenue = (allRows ?? []).reduce((s, r) => s + r.amount, 0);
  const totalCount = (allRows ?? []).length;
  const thisYearRevenue = (thisYearRows ?? []).reduce((s, r) => s + r.amount, 0);
  const thisYearCount = (thisYearRows ?? []).length;
  const lastYearRevenue = (lastYearRows ?? []).reduce((s, r) => s + r.amount, 0);
  const lastYearCount = (lastYearRows ?? []).length;
  const lastMonthRevenue = (prevMonthRows ?? []).reduce((s, r) => s + r.amount, 0);
  const lastMonthCount = (prevMonthRows ?? []).length;
  const prevPrevRevenue = (prevPrevMonthRows ?? []).reduce((s, r) => s + r.amount, 0);
  const prevPrevCount = (prevPrevMonthRows ?? []).length;

  return {
    totalRevenue,
    totalCount,
    lastMonthRevenue,
    lastMonthCount,
    revenueVsLastYear: pctChange(thisYearRevenue, lastYearRevenue),
    countVsLastYear: pctChange(thisYearCount, lastYearCount),
    revenueVsLastMonth: pctChange(lastMonthRevenue, prevPrevRevenue),
    countVsLastMonth: pctChange(lastMonthCount, prevPrevCount),
  };
}

/**
 * 월별 매출 추이 조회 (YearlyStats 월별 매출 추이 / 성장률 차트용)
 */
export async function getMonthlySales(year: number): Promise<MonthlySale[]> {
  const [{ data: thisYearData, error: e1 }, { data: lastYearData, error: e2 }] = await Promise.all([
    supabase
      .from(SALES)
      .select(MONTHLY_SALES_SELECT)
      .gte(SOLD_AT, dateRange(year).gte)
      .lt(SOLD_AT, dateRange(year).lt)
      .limit(MAX_ROWS),
    supabase
      .from(SALES)
      .select(MONTHLY_SALES_SELECT)
      .gte(SOLD_AT, dateRange(year - 1).gte)
      .lt(SOLD_AT, dateRange(year - 1).lt)
      .limit(MAX_ROWS),
  ]);

  if (e1) throw e1;
  if (e2) throw e2;

  const thisYearMap = aggregateByMonth(thisYearData ?? []);
  const lastYearMap = aggregateByMonth(lastYearData ?? []);

  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const ty = thisYearMap.get(m)!;
    const ly = lastYearMap.get(m)!;
    return {
      month: MONTH[m as keyof typeof MONTH],
      revenue: ty.revenue,
      count: ty.count,
      prevRevenue: ly.revenue,
      prevCount: ly.count,
    };
  });
}

/**
 * 월별 카테고리 매출 분포 조회 (YearlyStats 카테고리 비중 차트용)
 */
export async function getMonthlyCategoryBreakdown(year: number): Promise<MonthlyCategoryData[]> {
  const { data, error } = await supabase
    .from(SALES)
    .select(`${MONTHLY_SALES_SELECT}, category`)
    .gte(SOLD_AT, dateRange(year).gte)
    .lt(SOLD_AT, dateRange(year).lt)
    .limit(MAX_ROWS);

  if (error) throw error;

  const map = new Map<number, Record<string, number>>();
  for (let m = 1; m <= 12; m++) {
    map.set(m, { CLASSIC: 0, POP: 0, 'K-POP': 0, OST: 0, ANI: 0, ETC: 0 });
  }
  for (const row of data ?? []) {
    const categoryName = row.category && CATEGORIES.has(row.category) ? row.category : 'ETC';
    const m = getUtcMonth(row.sold_at);
    const entry = map.get(m)!;
    entry[categoryName] = (entry[categoryName] ?? 0) + row.amount;
  }

  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const entry = map.get(m)!;
    return {
      month: MONTH[m as keyof typeof MONTH],
      CLASSIC: entry.CLASSIC,
      POP: entry.POP,
      'K-POP': entry['K-POP'],
      OST: entry.OST,
      ANI: entry.ANI,
      ETC: entry.ETC,
    };
  });
}

/**
 * 카테고리별 매출 비율 조회 (Stats 파이차트용)
 * - value: 매출액 기준 퍼센테이지
 * - count: 판매 건수
 * - countShare: 건수 기준 퍼센테이지
 * - revenue: 실제 매출액
 */
export async function getCategoryDistribution(
  year?: number,
): Promise<CategoryDistributionItem[]> {
  let query = supabase.from(SALES).select(`${SELECT_AMOUNT}, category`).limit(MAX_ROWS);
  if (year) {
    query = query.gte(SOLD_AT, dateRange(year).gte).lt(SOLD_AT, dateRange(year).lt);
  }

  const { data, error } = await query;
  if (error) throw error;

  const totals: Record<string, { revenue: number; count: number }> = {};
  let grandRevenue = 0;
  let grandCount = 0;

  for (const row of data ?? []) {
    const name = row.category && CATEGORIES.has(row.category) ? row.category : 'ETC';
    if (!totals[name]) totals[name] = { revenue: 0, count: 0 };
    totals[name].revenue += row.amount;
    totals[name].count += 1;
    grandRevenue += row.amount;
    grandCount += 1;
  }

  if (grandRevenue === 0) return [];

  return Object.entries(totals)
    .map(([name, { revenue, count }]) => ({
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
  const { data, error } = await supabase
    .from(SALES)
    .select(`${SELECT_AMOUNT}, category, product`)
    .limit(MAX_ROWS);

  if (error) throw error;

  const songMap = new Map<
    string,
    { title: string; category: string; sales: number; revenue: number }
  >();
  for (const row of data ?? []) {
    const title = row.product ? splitProduct(row.product).song : undefined;
    const category = row.category && CATEGORIES.has(row.category) ? row.category : 'ETC';
    if (!title) continue;
    const existing = songMap.get(title);
    if (existing) {
      existing.sales += 1;
      existing.revenue += row.amount;
    } else {
      songMap.set(title, { title, category, sales: 1, revenue: row.amount });
    }
  }

  return [...songMap.values()]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, topN)
    .map((s, i) => ({ rank: i + 1, ...s }));
}

/**
 * 인기 편성 TOP N 조회 (Stats 레이더 차트용)
 */
export async function getTopArrangements(topN = 5): Promise<TopArrangement[]> {
  const { data, error } = await supabase
    .from(SALES)
    .select(`${SELECT_AMOUNT}, product`)
    .limit(MAX_ROWS);

  if (error) throw error;

  const arrMap = new Map<string, { arrangement: string; sales: number; revenue: number }>();
  for (const row of data ?? []) {
    const arrangement = row.product
      ? splitProduct(row.product).arrangement || undefined
      : undefined;
    if (!arrangement) continue;
    const existing = arrMap.get(arrangement);
    if (existing) {
      existing.sales += 1;
      existing.revenue += row.amount;
    } else {
      arrMap.set(arrangement, { arrangement, sales: 1, revenue: row.amount });
    }
  }

  return [...arrMap.values()]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, topN)
    .map((a, i) => ({ rank: i + 1, ...a }));
}

/**
 * 인기곡 TOP N 월별 판매 추이 조회 (Stats 라인차트용)
 */
export async function getTopSongMonthlySales(
  year: number,
  topN = 5,
): Promise<TopSongMonthlySalesResult> {
  const { data, error } = await supabase
    .from(SALES)
    .select(`${SOLD_AT}, product`)
    .gte(SOLD_AT, dateRange(year).gte)
    .lt(SOLD_AT, dateRange(year).lt)
    .limit(MAX_ROWS);

  if (error) throw error;

  const titleCount = new Map<string, number>();
  for (const row of data ?? []) {
    const title = row.product ? splitProduct(row.product).song : undefined;
    if (!title) continue;
    titleCount.set(title, (titleCount.get(title) ?? 0) + 1);
  }

  const topTitles = [...titleCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([t]) => t);

  const config: Record<string, string> = {};
  const keyMap = new Map<string, string>();
  topTitles.forEach((title, i) => {
    const key = `song${i + 1}`;
    keyMap.set(title, key);
    config[key] = title;
  });

  const monthMap = new Map<number, Record<string, number>>();
  for (let m = 1; m <= 12; m++) {
    const entry: Record<string, number> = {};
    for (const key of Object.keys(config)) entry[key] = 0;
    monthMap.set(m, entry);
  }
  for (const row of data ?? []) {
    const title = row.product ? splitProduct(row.product).song : undefined;
    const key = title ? keyMap.get(title) : undefined;
    if (!key) continue;
    const m = new Date(row.sold_at).getMonth() + 1;
    monthMap.get(m)![key] += 1;
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
export async function getSalesYearRange(): Promise<{ min: number; max: number } | null> {
  const [{ data: minRow, error: minError }, { data: maxRow, error: maxError }] = await Promise.all([
    supabase.from(SALES).select(SOLD_AT).order(SOLD_AT, { ascending: true }).limit(1).maybeSingle(),
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

// ─── Excel Upload Management ──────────────────────────────────────────────────

/**
 * 업로드 목록 조회
 */
export async function getExcelUploads(): Promise<ExcelUpload[]> {
  const { data, error } = await supabase
    .from(EXCEL_UPLOADS)
    .select(EXCEL_UPLOADS_SELECT)
    .order('uploaded_at', { ascending: false });

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
export async function getSalesRowsByUploadId(uploadId: string): Promise<ExcelRow[]> {
  const { data, error } = await supabase
    .from(SALES)
    .select(SALES_ROW_SELECT)
    .eq('upload_id', uploadId)
    .order(SOLD_AT, { ascending: false })
    .limit(MAX_ROWS);

  if (error) throw error;

  return (data ?? []).map(row => ({
    id: row.id,
    category: row.category && CATEGORIES.has(row.category) ? row.category : 'ETC',
    product: row.product ?? '',
    amount: row.amount,
  }));
}

/**
 * 엑셀 데이터 저장 (ExcelRow[] → sales 테이블)
 * - uploadName: 업로드 이름 (예: "2025-01"), excel_uploads 레코드로 저장
 * - ExcelRow.product = "곡명 - 편성" 형태로 songs / arrangements 테이블에서 ID 조회
 * - 매핑 실패해도 저장됨 (song_id / arrangement_id는 nullable)
 */
export async function saveSalesRows(rows: ExcelRow[], uploadName: string): Promise<void> {
  if (rows.length === 0) return;

  // 업로드 이름에서 sold_at 유도 (예: "2025-12" 또는 "202512" → "2025-12-01 00:00:00")
  const uploadDate = (() => {
    const m1 = uploadName.match(/(\d{4})[^\d](\d{2})/);
    if (m1) return `${m1[1]}-${m1[2]}-01 00:00:00`;
    const m2 = uploadName.match(/(\d{4})(\d{2})/);
    if (m2) return `${m2[1]}-${m2[2]}-01 00:00:00`;
    return new Date().toISOString().slice(0, 10) + ' 00:00:00';
  })();

  // excel_uploads 레코드 생성
  const { data: uploadRecord, error: uploadError } = await supabase
    .from(EXCEL_UPLOADS)
    .insert({ name: uploadName, row_count: rows.length })
    .select('id')
    .single();

  if (uploadError) throw uploadError;

  const uploadId = uploadRecord.id;

  // 룩업 테이블 병렬 조회
  const [{ data: songs, error: se }, { data: arrangements, error: ae }] = await Promise.all([
    supabase.from(SONGS).select('id, title').is('deleted_at', null),
    supabase.from(ARRANGEMENTS).select('id, song_id, arrangement').is('deleted_at', null),
  ]);

  if (se) throw se;
  if (ae) throw ae;

  const songMap = new Map((songs ?? []).map(s => [norm(s.title), s.id]));
  const arrangementMap = new Map(
    (arrangements ?? []).map(a => [`${a.song_id}:${norm(a.arrangement)}`, a.id]),
  );

  const inserts = rows.map(row => {
    const { song: songTitle, arrangement: arrangementStr } = splitProduct(row.product);

    const song_id = songMap.get(norm(songTitle)) ?? null;
    const arrangement_id =
      (song_id ? arrangementMap.get(`${song_id}:${norm(arrangementStr)}`) : undefined) ?? null;

    return {
      song_id,
      arrangement_id,
      upload_id: uploadId,
      category: row.category && CATEGORIES.has(row.category) ? row.category : 'ETC',
      product: row.product,
      amount: row.amount,
      sold_at: uploadDate,
    };
  });

  // 500행 단위로 청크 insert (페이로드 크기 제한 대응)
  const CHUNK_SIZE = 500;
  try {
    for (let i = 0; i < inserts.length; i += CHUNK_SIZE) {
      const { error } = await supabase.from(SALES).insert(inserts.slice(i, i + CHUNK_SIZE));
      if (error) throw error;
    }
  } catch (err) {
    // sales insert 실패 시 고아 upload 레코드 제거
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
    .order(SOLD_AT, { ascending: false })
    .limit(MAX_ROWS);

  if (year) {
    query = query.gte(SOLD_AT, dateRange(year).gte).lt(SOLD_AT, dateRange(year).lt);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map(row => ({
    id: row.id,
    category: row.category && CATEGORIES.has(row.category) ? row.category : 'ETC',
    product: row.product ?? '',
    amount: row.amount,
  }));
}
