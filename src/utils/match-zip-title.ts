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
  const isKorean = (t: string) => /[\uAC00-\uD7A3]{2,}/.test(t);
  const significant = [...titleTokens].filter(t => isNum(t) || isKorean(t) || (t.length > 2 && !STOP_WORDS.has(t)));
  const overlapTokens = significant.filter(t => zipTokens.has(t));
  const overlapCount = overlapTokens.length;

  const hasKoreanOverlap = overlapTokens.some(isKorean);
  return hasKoreanOverlap ? overlapCount >= 1 : overlapCount >= 2;
}
