import { useCallback,useState } from 'react';

import { ExcelRow } from '@/types/excel';
import { parseExcelSheet } from '@/utils/parse-excel';

interface ExcelFileParserState {
	fileName: string;
	preview: ExcelRow[];
	error: string | null;
}

const INITIAL_STATE: ExcelFileParserState = { fileName: '', preview: [], error: null };

export function useExcelFileParser() {
	const [state, setState] = useState<ExcelFileParserState>(INITIAL_STATE);

	const parseFile = useCallback((file: File) => {
		setState(prev => ({ ...prev, error: null }));

		const lowerName = file.name.toLowerCase();
		if (
			!lowerName.endsWith('.xlsx') &&
			!lowerName.endsWith('.xls') &&
			!lowerName.endsWith('.csv')
		) {
			setState(prev => ({ ...prev, error: '엑셀 파일(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.' }));
			return;
		}

		setState(prev => ({ ...prev, fileName: file.name, preview: [] }));

		const reader = new FileReader();
		reader.onload = e => {
			try {
				const data = new Uint8Array(e.target?.result as ArrayBuffer);
				const { rows, error: parseError } = parseExcelSheet(data);
				if (parseError) {
					setState(prev => ({ ...prev, preview: [], error: parseError }));
					return;
				}
				setState(prev => ({ ...prev, preview: rows, error: null }));
			} catch {
				setState(prev => ({ ...prev, preview: [], error: '파일을 파싱하는 중 오류가 발생했습니다.' }));
			}
		};
		reader.readAsArrayBuffer(file);
	}, []);

	const reset = useCallback(() => {
		setState(INITIAL_STATE);
	}, []);

	return { ...state, parseFile, reset };
}
