// @MX:NOTE: [AUTO] Spawns a short-lived Web Worker per ZIP upload for off-main-thread extraction.
// @MX:REASON: Worker is terminated after each job; the buffer is zero-copy transferred to avoid
//             duplicating potentially large ZIP data. Import.meta.url binds the correct module
//             URL even after Vite bundling.

import { WorkerFile } from '@/workers/zip-worker';
import { FileEntry } from '@/types/form';

/**
 * Extracts a ZIP file in a dedicated Web Worker and returns FileEntry[].
 * The `buffer` is transferred (zero-copy) to the worker and must not be
 * accessed after this call.
 */
export function extractZipInWorker(buffer: ArrayBuffer): Promise<FileEntry[]> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('@/workers/zip-worker.ts', import.meta.url),
      { type: 'module' },
    );

    worker.onmessage = (e: MessageEvent<
      | { ok: true;  files: WorkerFile[] }
      | { ok: false; message: string; isZipError: boolean }
    >) => {
      worker.terminate();
      const data = e.data;
      if (!data.ok) {
        reject(new Error(data.message));
        return;
      }
      const entries: FileEntry[] = data.files.map(f => ({
        file:     new File([f.buffer], f.name),
        label:    f.label,
        fileType: f.fileType,
      }));
      resolve(entries);
    };

    worker.onerror = () => {
      worker.terminate();
      reject(new Error('ZIP 파일을 읽을 수 없습니다.'));
    };

    worker.postMessage({ buffer }, { transfer: [buffer] });
  });
}
