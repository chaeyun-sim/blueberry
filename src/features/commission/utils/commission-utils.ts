/**
 * Strips movement markers and tempo marks from a classical title
 * so IMSLP search queries return the main work, not a specific movement.
 */
export const cleanTitle = (title: string): string =>
	title
		.replace(/\d+\s*(악장|st|nd|rd|th)(\s*movement)?/gi, '')
		.replace(
			/\b(allegro|andante|adagio|presto|vivace|moderato|largo|lento|grave|scherzo|finale)\b/gi,
			'',
		)
		.replace(/[-–—]\s*$/, '')
		.replace(/\s+/g, ' ')
		.trim();

import dayjs from 'dayjs';

export type DateRange = 'all' | 'week' | 'month';

export function getDateRangeBounds(range: DateRange): { from: string; to: string } | null {
	if (range === 'all') return null;
	const today = dayjs().startOf('day');
	if (range === 'week') {
		const mon = today.subtract((today.day() + 6) % 7, 'day');
		const sun = mon.add(6, 'day');
		return { from: mon.format('YYYY-MM-DD'), to: sun.format('YYYY-MM-DD') };
	}
	return {
		from: today.startOf('month').format('YYYY-MM-DD'),
		to: today.endOf('month').format('YYYY-MM-DD'),
	};
}

export function getPaginationPages(current: number, total: number): (number | '...')[] {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
	if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
	if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
	return [1, '...', current - 1, current, current + 1, '...', total];
}
