const STOP_WORDS = new Set(['in', 'of', 'the', 'a', 'an', 'and', 'for', 'with', 'no']);

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[_\-.,;:()[\]]/g, ' ').split(/\s+/).filter(Boolean);
}

function expandTokens(tokens: string[]): Set<string> {
  const result = new Set<string>();
  for (const t of tokens) {
    result.add(t);
    const nums = t.match(/\d+/g);
    if (nums) nums.forEach(n => result.add(n));
  }
  return result;
}

function isNum(s: string): boolean {
  return /^\d+$/.test(s);
}

export function matchesZipTitle(
  zipName: string,
  songTitle: string,
  composer: string,
): boolean {
  const baseName = zipName.replace(/\.zip$/i, '');
  if (baseName.length === 0) return false;

  const zipTokens = expandTokens(tokenize(baseName));

  const composerLastName = composer.trim().split(/\s+/).pop()?.toLowerCase() ?? '';
  if (composerLastName.length > 1 && zipTokens.has(composerLastName)) return true;

  const titleTokens = expandTokens(tokenize(songTitle));
  const significant = [...titleTokens].filter(t => isNum(t) || (t.length > 2 && !STOP_WORDS.has(t)));
  const overlapCount = significant.filter(t => zipTokens.has(t)).length;

  return overlapCount >= 2;
}
