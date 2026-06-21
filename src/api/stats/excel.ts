import { supabase } from '@/lib/supabase';
import { ExcelRow } from '@/types/excel';
import { ExcelUpload } from '@/types/stats';
import { norm, normalizeCategory, yearRange } from '@/utils/stats-helpers';
import { splitProduct } from '@/utils/split-product';
import dayjs from 'dayjs';

const SALES = 'sales';
const EXCEL_UPLOADS = 'excel_uploads';
const SOLD_AT = 'sold_at';
const SALES_ROW_SELECT = 'id, sold_at, amount, category, product';
const EXCEL_UPLOADS_SELECT = 'id, name, row_count, uploaded_at';
const SONGS = 'songs';
const ARRANGEMENTS = 'arrangements';

export async function getExcelUploads(): Promise<ExcelUpload[]> {
	const { data, error } = await supabase
		.from(EXCEL_UPLOADS)
		.select(EXCEL_UPLOADS_SELECT)
		.order('name', { ascending: false });

	if (error) throw error;
	return data ?? [];
}

export async function deleteExcelUpload(id: string): Promise<void> {
	const { error } = await supabase.from(EXCEL_UPLOADS).delete().eq('id', id);
	if (error) throw error;
}

export async function getSalesRowsByUploadId(uploadId: string): Promise<ExcelRow[]> {
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
		category: normalizeCategory(row.category),
		product: row.product ?? '',
		amount: row.amount,
	}));
}

function parseUploadDate(uploadName: string): string {
	const m1 = uploadName.match(/(\d{4})[^\d](\d{2})/);
	if (m1) return `${m1[1]}-${m1[2]}-01 00:00:00`;
	const m2 = uploadName.match(/(\d{4})(\d{2})/);
	if (m2) return `${m2[1]}-${m2[2]}-01 00:00:00`;
	return dayjs().format('YYYY-MM-DD') + ' 00:00:00';
}

export async function saveSalesRows(rows: ExcelRow[], uploadName: string): Promise<void> {
	if (rows.length === 0) return;

	const uploadDate = parseUploadDate(uploadName);

	const { data: uploadRecord, error: uploadError } = await supabase
		.from(EXCEL_UPLOADS)
		.insert({ name: uploadName, row_count: rows.length })
		.select('id')
		.single();

	if (uploadError) throw uploadError;

	const uploadId = uploadRecord.id;

	const [{ data: songs, error: se }, { data: arrangements, error: ae }] = await Promise.all([
		supabase.from(SONGS).select('id, title').is('deleted_at', null),
		supabase.from(ARRANGEMENTS).select('id, song_id, arrangement').is('deleted_at', null),
	]);

	if (se) throw se;
	if (ae) throw ae;

	const songMap = new Map((songs ?? []).map((s) => [norm(s.title), s.id]));
	const arrangementMap = new Map(
		(arrangements ?? []).map((a) => [`${a.song_id}:${norm(a.arrangement)}`, a.id]),
	);

	const inserts = rows.map((row) => {
		const { song: songTitle, arrangement: arrangementStr } = splitProduct(row.product);
		const song_id = songMap.get(norm(songTitle)) ?? null;
		const arrangement_id =
			(song_id ? arrangementMap.get(`${song_id}:${norm(arrangementStr)}`) : undefined) ?? null;

		return {
			song_id,
			arrangement_id,
			upload_id: uploadId,
			category: normalizeCategory(row.category),
			product: row.product,
			amount: row.amount,
			sold_at: uploadDate,
		};
	});

	const CHUNK_SIZE = 500;
	try {
		for (let i = 0; i < inserts.length; i += CHUNK_SIZE) {
			const { error } = await supabase.from(SALES).insert(inserts.slice(i, i + CHUNK_SIZE));
			if (error) throw error;
		}
	} catch (err) {
		await supabase.from(EXCEL_UPLOADS).delete().eq('id', uploadId);
		throw err;
	}
}

export async function getSalesRows(year?: number): Promise<ExcelRow[]> {
	let query = supabase
		.from(SALES)
		.select(SALES_ROW_SELECT)
		.order(SOLD_AT, { ascending: false });

	if (year) {
		query = query.gte(SOLD_AT, yearRange(year).gte).lt(SOLD_AT, yearRange(year).lt);
	}

	const { data, error } = await query;
	if (error) throw error;

	return (data ?? []).map((row) => ({
		id: row.id,
		category: normalizeCategory(row.category),
		product: row.product ?? '',
		amount: row.amount,
	}));
}
