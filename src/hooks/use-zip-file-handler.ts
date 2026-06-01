import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { MAX_ZIP_SIZE } from '@/constants/file-size';
import { extractZipEntries, ZipExtractionError } from '@/utils/extract-zip-entries';
import { hasCompressibleAudio, compressAudioEntries } from '@/utils/compress-audio-entries';
import { FileEntry } from '@/types/form';

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
			const res = await compressAudioEntries(rawEntries);
			setState((prev) => ({ ...prev, files: res as FileEntry[] }));
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
