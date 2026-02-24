import { INSTRUMENT_ABBREVIATIONS } from '@/constants/instruments';

export const ABBR_TO_INSTRUMENT = Object.fromEntries(
  Object.entries(INSTRUMENT_ABBREVIATIONS).map(([full, abbr]) => [abbr.toLowerCase(), full]),
);


export function parseInstrumentsFromZipName(fileName: string): string[] {
  const name = fileName.replace(/\.zip$/i, '');
  const lastSep = Math.max(name.lastIndexOf('-'), name.lastIndexOf('_'));
  if (lastSep === -1) return [];

  const result: string[] = [];
  for (const part of name.slice(lastSep + 1).split(',')) {
    const trimmed = part.trim().toLowerCase();
    const match = trimmed.match(/^(\d+)(.+)$/);
    if (match) {
      const instrument = ABBR_TO_INSTRUMENT[match[2]];
      if (instrument) {
        const count = parseInt(match[1]);
        for (let i = 0; i < count; i++) result.push(instrument);
      }
    } else {
      const instrument = ABBR_TO_INSTRUMENT[trimmed];
      if (instrument) result.push(instrument);
    }
  }
  return result;
}