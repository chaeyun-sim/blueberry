import { type MusicRecommendation } from '@/mock/recommendations';
import { makeSoundpostExternalUrl } from '@/utils/soundpost';

export function useSoundpostCheck(rec: MusicRecommendation) {
  const isLatinTitle = /^[a-zA-Z0-9\s.,!?'"()\-#/.]+$/.test(rec.title);
  const titleSearchStr = (isLatinTitle ? rec.title : rec.englishTitle)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .trim();
  const composerSearchStr = rec.composer.split(' ').filter(Boolean).at(-1) ?? rec.composer;

  return {
    titleUrl: makeSoundpostExternalUrl(titleSearchStr),
    composerUrl: makeSoundpostExternalUrl(composerSearchStr, true),
  };
}
