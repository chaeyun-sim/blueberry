const OST_SUFFIX = /\s+\([^()]*OST[^()]*\)\s*$/i;
const VARIANT_SUFFIX = /\s+(\(?(?:in\s+[A-G](?:#|b|♯|♭)?(?:\s+(?:major|minor))?|(?:easy|hard|pro)\s+(?:version|ver\.?))\)?)$/i;

export function splitSongVariant(title: string): { title: string; variant: string } {
	const withoutOst = title.replace(OST_SUFFIX, '').trim();
	const match = withoutOst.match(VARIANT_SUFFIX);
	if (!match) return { title: withoutOst, variant: '' };
	return {
		title: withoutOst.slice(0, match.index).trim(),
		variant: match[1].trim(),
	};
}
