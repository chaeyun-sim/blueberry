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
