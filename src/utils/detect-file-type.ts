import { AUDIO_EXTENSIONS,FINALE_EXTENSIONS, MUSICXML_EXTENSIONS } from '@/constants/file-types';

export function detectFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const base = fileName.replace(/\.[^.]+$/, '');
  const isPart = base.includes(' - ');

  if (MUSICXML_EXTENSIONS.includes(ext)) return 'musicxml';
  if (ext === 'pdf') return isPart ? 'part' : 'score';
  if (AUDIO_EXTENSIONS.includes(ext)) return 'audio';
  if (FINALE_EXTENSIONS.includes(ext)) return isPart ? 'part' : 'finale';
  return isPart ? 'part' : 'score';
}