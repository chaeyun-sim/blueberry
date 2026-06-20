import { FileEntry } from '@/types/form';

const COMPRESS_EXTS = new Set(['wav', 'aif', 'aiff', 'aifc']);

function getExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function needsCompression(entry: FileEntry): boolean {
  return COMPRESS_EXTS.has(getExtension(entry.file.name));
}

export function hasCompressibleAudio(entries: FileEntry[]): boolean {
  return entries.some(needsCompression);
}

