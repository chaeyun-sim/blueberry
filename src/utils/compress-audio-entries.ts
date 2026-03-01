import { FileEntry } from '@/types/form';
import { compressAudioToMp3 } from '@/utils/compress-wav';

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

export async function compressAudioEntries(entries: FileEntry[]): Promise<FileEntry[]> {
  const result: FileEntry[] = [];

  for (const entry of entries) {
    if (needsCompression(entry)) {
      const mp3 = await compressAudioToMp3(entry.file);
      result.push({ file: mp3, label: entry.label, fileType: 'audio' });
    } else {
      result.push(entry);
    }
  }

  return result;
}
