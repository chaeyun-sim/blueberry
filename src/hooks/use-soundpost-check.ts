import { useState, useEffect } from 'react';
import { type MusicRecommendation } from '@/mock/recommendations';
import { SoundpostStatus } from '@/types/recommend';
import {
  makeSoundpostUrl,
  makeSoundpostExternalUrl,
  fetchHasResults,
} from '@/utils/soundpost';

export function useSoundpostCheck(rec: MusicRecommendation) {
  const [status, setStatus] = useState<SoundpostStatus>('loading');

  const isLatinTitle = /^[a-zA-Z0-9\s.,!?'"()\-#/.]+$/.test(rec.title);
  const titleSearchStr = (isLatinTitle ? rec.title : rec.englishTitle)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .trim();
  const composerSearchStr = rec.composer.split(' ').filter(Boolean).at(-1) ?? rec.composer;

  useEffect(() => {
    setStatus('loading');
    let cancelled = false;

    (async () => {
      try {
        const titleHas = await fetchHasResults(makeSoundpostUrl(titleSearchStr));
        if (cancelled) return;
        if (titleHas) {
          setStatus('arranged');
          return;
        }

        const composerHas = await fetchHasResults(makeSoundpostUrl(composerSearchStr, true));
        if (cancelled) return;
        setStatus(composerHas ? 'arranged' : 'not-arranged');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rec.id, titleSearchStr, composerSearchStr]);

  return {
    status,
    titleUrl: makeSoundpostExternalUrl(titleSearchStr),
    composerUrl: makeSoundpostExternalUrl(composerSearchStr, true),
  };
}
