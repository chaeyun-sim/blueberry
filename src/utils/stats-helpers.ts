import { CATEGORIES } from '@/constants/categories';

export const getUtcYear = (iso: string) => new Date(iso).getUTCFullYear();

export function pctChange(current: number, prev: number): number {
	if (prev === 0) return 0;
	return parseFloat((((current - prev) / prev) * 100).toFixed(1));
}

export const yearRange = (year: number) =>
	({ gte: `${year}-01-01`, lt: `${year + 1}-01-01` });

export const norm = (s: string) =>
	s
		.toLowerCase()
		.replace(/\s*([(),])\s*/g, '$1')
		.trim();

// PostgREST returns NUMERIC columns as strings; coerce to JS number.
export const parseNumeric = (v: unknown) => parseFloat(String(v));

// Coerce unrecognised or null categories to the catch-all bucket.
export const normalizeCategory = (cat: string | null | undefined) =>
	cat && CATEGORIES.has(cat) ? cat : 'ETC';
