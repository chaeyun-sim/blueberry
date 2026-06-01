/**
 * ZIP extraction Web Worker
 * Runs JSZip decompression off the main thread to prevent UI blocking.
 *
 * Protocol:
 *   main → worker : { buffer: ArrayBuffer }          (buffer is transferred)
 *   worker → main : { ok: true,  files: WorkerFile[] } (buffers are transferred)
 *   worker → main : { ok: false, message: string, isZipError: boolean }
 */

import JSZip from 'jszip';

// ─── Inlined constants (avoid importing React-dependent modules) ──────────────
const MUSICXML_EXTENSIONS = ['xml', 'musicxml', 'mxl'];
const FINALE_EXTENSIONS   = ['musx'];
const AUDIO_EXTENSIONS    = ['wav', 'aif', 'aiff', 'aifc', 'mp3', 'mid', 'midi'];
const ALLOWED_EXTENSIONS  = [...MUSICXML_EXTENSIONS, ...FINALE_EXTENSIONS, ...AUDIO_EXTENSIONS, 'pdf'];

const MAX_DECOMPRESSED = 500 * 1024 * 1024; // 500 MB
const MAX_FILE_COUNT   = 100;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '');
}

function isHiddenOrSystem(path: string, fileName: string): boolean {
  return fileName.startsWith('.') || path.startsWith('__MACOSX');
}

function detectFileType(fileName: string): string {
  const ext = getExtension(fileName);
  if (MUSICXML_EXTENSIONS.includes(ext)) return 'musicxml';
  if (FINALE_EXTENSIONS.includes(ext))   return 'finale';
  if (ext === 'pdf')                      return 'pdf';
  if (AUDIO_EXTENSIONS.includes(ext))    return 'audio';
  const base = stripExtension(fileName);
  if (base.includes(' - '))              return 'part';
  return 'score';
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface WorkerFile {
  buffer:   ArrayBuffer;
  name:     string;
  label:    string;
  fileType: string;
}

// ─── Entry point ─────────────────────────────────────────────────────────────
self.onmessage = async (e: MessageEvent<{ buffer: ArrayBuffer }>) => {
  const { buffer } = e.data;

  try {
    const zip      = await JSZip.loadAsync(buffer);
    const results: WorkerFile[] = [];
    let   totalSize  = 0;
    let   fileCount  = 0;

    for (const [path, entry] of Object.entries(zip.files)) {
      if (entry.dir) continue;

      const fileName = path.split('/').pop() ?? path;
      if (isHiddenOrSystem(path, fileName))            continue;
      if (!ALLOWED_EXTENSIONS.includes(getExtension(fileName))) continue;

      fileCount++;
      if (fileCount > MAX_FILE_COUNT) {
        self.postMessage({ ok: false, message: 'ZIP 내 파일이 100개를 초과합니다.', isZipError: true });
        return;
      }

      const blob = await entry.async('blob');
      totalSize += blob.size;
      if (totalSize > MAX_DECOMPRESSED) {
        self.postMessage({ ok: false, message: '압축 해제 크기가 500MB를 초과합니다.', isZipError: true });
        return;
      }

      const fileBuffer = await blob.arrayBuffer();
      results.push({
        buffer:   fileBuffer,
        name:     fileName,
        label:    stripExtension(fileName),
        fileType: detectFileType(fileName),
      });
    }

    // Transfer all ArrayBuffers (zero-copy) back to the main thread
    const transferList = results.map(r => r.buffer);
    self.postMessage({ ok: true, files: results }, { transfer: transferList });
  } catch (err) {
    self.postMessage({
      ok:         false,
      message:    'ZIP 파일을 읽을 수 없습니다.',
      isZipError: false,
    });
  }
};
