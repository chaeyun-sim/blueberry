import type { FileEntry } from '@/types/form';

export interface ZipFileValidation {
  valid: boolean;
  missing: string[];
  instrumentCount: number;
  counts: { score: number; part: number; audio: number; musicxml: number };
}

export function validateZipFiles(files: FileEntry[], arrangement: string): ZipFileValidation {
  const instrumentCount = arrangement
    .split(',')
    .map(s => s.trim())
    .filter(Boolean).length;

  const counts = {
    score:    files.filter(f => f.fileType === 'score' || f.fileType === 'finale').length,
    part:     files.filter(f => f.fileType === 'part').length,
    audio:    files.filter(f => f.fileType === 'audio').length,
    musicxml: files.filter(f => f.fileType === 'musicxml').length,
  };

  const missing: string[] = [];

  if (counts.score === 0) missing.push('총보');

  // 악기가 2개 이상인 경우에만 파트보 검사
  if (instrumentCount >= 2) {
    const partDiff = instrumentCount - counts.part;
    if (partDiff > 0) missing.push(`파트보 ${partDiff}개`);
  }

  if (counts.musicxml === 0) missing.push('MusicXML');
  if (counts.audio === 0) missing.push('오디오');

  return { valid: missing.length === 0, missing, instrumentCount, counts };
}
