import { useRef,useState } from 'react';
import { toast } from 'sonner';
import { MAX_ZIP_SIZE } from '@/constants/file-size';
import { FileEntry } from '@/types/form';
import { hasCompressibleAudio } from '@/utils/compress-audio-entries';
import { extractZipEntries, ZipExtractionError } from '@/utils/extract-zip-entries';
import type { WorkerEntry } from '@/workers/audio-compress.worker';

function compressWithWorker(entries: FileEntry[]): Promise<FileEntry[]> {
	return new Promise((resolve, reject) => {
		const worker = new Worker(
			new URL('../workers/audio-compress.worker.ts', import.meta.url),
			{ type: 'module' },
		);

		worker.onmessage = async (e: MessageEvent<{ ok: true; entries: WorkerEntry[] } | { ok: false; message: string }>) => {
			worker.terminate();
			if (!e.data.ok) {
				reject(new Error((e.data as { ok: false; message: string }).message));
				return;
			}
			const result: FileEntry[] = e.data.entries.map(w => ({
				file: new File([w.buffer], w.name, { type: w.fileType === 'audio' ? 'audio/mpeg' : '' }),
				label: w.label,
				fileType: w.fileType,
			}));
			resolve(result);
		};

		worker.onerror = (err) => {
			worker.terminate();
			reject(new Error(err.message));
		};

		const workerEntries: WorkerEntry[] = entries.map(e => ({
			buffer: new ArrayBuffer(0),
			name: e.file.name,
			label: e.label,
			fileType: e.fileType,
		}));

		// 파일을 ArrayBuffer로 변환 후 전송 (zero-copy transfer)
		Promise.all(entries.map(e => e.file.arrayBuffer())).then(buffers => {
			buffers.forEach((buf, i) => { workerEntries[i].buffer = buf; });
			const transferList = workerEntries.map(w => w.buffer);
			worker.postMessage({ entries: workerEntries }, { transfer: transferList });
		}).catch(reject);
	});
}

interface ZipState {
	zipName: string | null;
	zipSize: number | null;
	files: FileEntry[];
}

const EMPTY_STATE: ZipState = { zipName: null, zipSize: null, files: [] };

export function useZipFileHandler() {
	const zipInputRef = useRef<HTMLInputElement>(null);
	const [state, setState] = useState<ZipState>(EMPTY_STATE);
	const [isExtracting, setIsExtracting] = useState(false);
	const [isCompressing, setIsCompressing] = useState(false);

	const reset = () => {
		setState(EMPTY_STATE);
		if (zipInputRef.current) zipInputRef.current.value = '';
	};

	const handleZipFile = async (file: File) => {
		if (!file.name.toLowerCase().endsWith('.zip')) {
			toast.error('ZIP 파일만 업로드할 수 있습니다.');
			if (zipInputRef.current) zipInputRef.current.value = '';
			return;
		}
		if (file.size > MAX_ZIP_SIZE) {
			toast.error('ZIP 파일 크기는 200MB 이하여야 합니다.');
			if (zipInputRef.current) zipInputRef.current.value = '';
			return;
		}

		setState((prev) => ({ ...prev, zipName: file.name, zipSize: file.size, files: [] }));
		setIsExtracting(true);

		let rawEntries: FileEntry[];
		try {
			const buffer = await file.arrayBuffer();
			rawEntries = await extractZipEntries(buffer);
		} catch (e) {
			const msg = e instanceof ZipExtractionError ? e.message : 'ZIP 파일을 읽을 수 없습니다.';
			toast.error(
				msg,
				e instanceof ZipExtractionError ? undefined : { description: (e as Error).message },
			);
			reset();
			return;
		} finally {
			setIsExtracting(false);
		}

		if (!hasCompressibleAudio(rawEntries)) {
			setState((prev) => ({ ...prev, files: rawEntries }));
			return;
		}

		setIsCompressing(true);
		try {
			const res = await compressWithWorker(rawEntries);
			setState((prev) => ({ ...prev, files: res }));
		} catch (e) {
			toast.error('오디오 변환에 실패했습니다.', { description: (e as Error).message });
			reset();
		} finally {
			setIsCompressing(false);
		}
	};

	return {
		zipInputRef,
		zipName: state.zipName,
		zipSize: state.zipSize,
		files: state.files,
		isExtracting,
		isCompressing,
		reset,
		handleZipFile,
	};
}
