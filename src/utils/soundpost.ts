export function makeSoundpostUrl(searchStr: string, isComposer = false) {
  const params = new URLSearchParams({ fld_artist: 'Y', search_str: searchStr, x: '0', y: '0' });
  if (isComposer) params.set('composer_search', 'Y');
  return `/api/soundpost/shop/search_result.php?${params}`;
}

export function makeSoundpostExternalUrl(searchStr: string, isComposer = false) {
  const params = new URLSearchParams({ fld_artist: 'Y', search_str: searchStr, x: '0', y: '0' });
  if (isComposer) params.set('composer_search', 'Y');
  return `https://www.soundpost.co.kr/shop/search_result.php?${params}`;
}

export async function fetchHasResults(proxyUrl: string): Promise<boolean> {
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error('network error');
  const html = await res.text();
  const noResult = html.includes('해당 분류에 등록된 상품이 없습니다.');
  return !noResult && html.length > 800;
}
