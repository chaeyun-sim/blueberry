import { MUSICXML_EXTENSIONS, FINALE_EXTENSIONS, AUDIO_EXTENSIONS } from '@/constants/file-types';

export function detectFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (MUSICXML_EXTENSIONS.includes(ext)) return 'musicxml';
  if (FINALE_EXTENSIONS.includes(ext)) return 'finale';
  if (ext === 'pdf') return 'pdf';
  if (AUDIO_EXTENSIONS.includes(ext)) return 'audio';
  const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
  if (nameWithoutExt.includes(' - ')) return 'part';
  return 'score';
}