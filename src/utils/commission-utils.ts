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

export type DateRange = 'all' | 'week' | 'month';

export function getDateRangeBounds(range: DateRange): { from: string; to: string } | null {
	if (range === 'all') return null;
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	if (range === 'week') {
		const mon = new Date(today);
		mon.setDate(today.getDate() - ((today.getDay() + 6) % 7));
		const sun = new Date(mon);
		sun.setDate(mon.getDate() + 6);
		return { from: mon.toISOString().slice(0, 10), to: sun.toISOString().slice(0, 10) };
	}
	const from = new Date(today.getFullYear(), today.getMonth(), 1);
	const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
	return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export function getPaginationPages(current: number, total: number): (number | '...')[] {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
	if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
	if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
	return [1, '...', current - 1, current, current + 1, '...', total];
}
