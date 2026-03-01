import JSZip from 'jszip';
import { detectFileType } from '@/utils/detect-file-type';
import { ALLOWED_EXTENSIONS } from '@/constants/file-types';
import { MAX_DECOMPRESSED, MAX_FILE_COUNT } from '@/constants/file-size';
import { FileEntry } from '@/types/form';

function isHiddenOrSystem(path: string, fileName: string): boolean {
  return fileName.startsWith('.') || path.startsWith('__MACOSX');
}

function getExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '');
}

export class ZipExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ZipExtractionError';
  }
}

export async function extractZipEntries(buffer: ArrayBuffer): Promise<FileEntry[]> {
  const zip = await JSZip.loadAsync(buffer);
  const entries: FileEntry[] = [];
  let totalSize = 0;
  let fileCount = 0;

  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;

    const fileName = path.split('/').pop() ?? path;
    if (isHiddenOrSystem(path, fileName)) continue;
    if (!ALLOWED_EXTENSIONS.includes(getExtension(fileName))) continue;

    fileCount++;
    if (fileCount > MAX_FILE_COUNT) {
      throw new ZipExtractionError('ZIP 내 파일이 100개를 초과합니다.');
    }

    const blob = await entry.async('blob');
    totalSize += blob.size;
    if (totalSize > MAX_DECOMPRESSED) {
      throw new ZipExtractionError('압축 해제 크기가 500MB를 초과합니다.');
    }

    entries.push({
      file: new File([blob], fileName),
      label: stripExtension(fileName),
      fileType: detectFileType(fileName),
    });
  }

  return entries;
}
