import * as XLSX from 'xlsx';
import { ExcelRow } from '@/types/excel';

const KNOWN_CATS = new Set(['CLASSIC', 'POP', 'K-POP', 'OST', 'ANI', 'ETC']);

function findCol(headers: string[], aliases: string[]): string | null {
  const normalized = aliases.map((a) => a.toLowerCase().replace(/[\s_]+/g, ''));
  for (const h of headers) {
    if (normalized.includes(h.toLowerCase().replace(/[\s_]+/g, ''))) return h;
  }
  for (const h of headers) {
    const nh = h.toLowerCase().replace(/[\s_]+/g, '');
    for (const n of normalized) {
      if (nh.includes(n) || n.includes(nh)) return h;
    }
  }
  return null;
}

function detectColsByContent(sheet: XLSX.WorkSheet): {
  catIdx: number;
  prodIdx: number;
  amtIdx: number;
} {
  const rawRows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false });
  const sample = rawRows.slice(0, Math.min(20, rawRows.length));
  const colCount = Math.max(...rawRows.map((r) => r.length), 0);

  let catIdx = -1, prodIdx = -1, amtIdx = -1;

  for (let c = 0; c < colCount; c++) {
    const vals = sample.map((r) => String(r[c] ?? '')).filter((v) => v !== '' && v !== 'null');
    if (vals.length === 0) continue;
    const catScore = vals.filter((v) => KNOWN_CATS.has(v)).length;
    const numScore = vals.filter((v) => !isNaN(Number(v.replace(/,/g, '')))).length;
    const prodScore = vals.filter((v) => /\s*-/.test(v) && v.length > 5).length;

    if (catScore > vals.length * 0.5 && catIdx === -1) catIdx = c;
    else if (prodScore > vals.length * 0.5 && prodIdx === -1) prodIdx = c;
    else if (numScore > vals.length * 0.7 && amtIdx === -1) amtIdx = c;
  }

  return { catIdx, prodIdx, amtIdx };
}

export function parseExcelSheet(data: Uint8Array): { rows: ExcelRow[]; error: string | null } {
  const workbook = XLSX.read(data, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: false });

  if (json.length === 0) return { rows: [], error: '데이터가 없습니다.' };

  const headers = Object.keys(json[0]);
  const catCol = findCol(headers, ['대분류', 'category', '카테고리', '분류', '대 분류']);
  const prodCol = findCol(headers, ['주문상품', 'product', '상품명', '주문 상품', '상품']);
  const amtCol = findCol(headers, ['상품총액', 'amount', '금액', '총액', '상품 총액', '가격']);

  if (!catCol && !prodCol && !amtCol) {
    const { catIdx, prodIdx, amtIdx } = detectColsByContent(sheet);

    if (prodIdx === -1 && amtIdx === -1) {
      return {
        rows: [],
        error: '필수 컬럼(상품명 또는 금액)을 자동으로 감지하지 못했습니다. 헤더가 있는 파일로 다시 시도해 주세요.',
      };
    }

    const rawRows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false });
    // row 0 is the (unrecognized) header — skip it to avoid including header text as data
    const dataRows = rawRows.slice(1).filter(
      (r) => (catIdx >= 0 && r[catIdx]) || (prodIdx >= 0 && r[prodIdx]),
    );

    return {
      rows: dataRows.map((row, i) => ({
        id: i + 1,
        category: catIdx >= 0 ? String(row[catIdx] ?? '') : '',
        product: prodIdx >= 0 ? String(row[prodIdx] ?? '') : '',
        amount: amtIdx >= 0 ? Number(String(row[amtIdx] ?? '0').replace(/,/g, '')) || 0 : 0,
      })),
      error: null,
    };
  }

  return {
    rows: json.map((row, i) => ({
      id: i + 1,
      category: String(catCol ? (row[catCol] ?? '') : ''),
      product: String(prodCol ? (row[prodCol] ?? '') : ''),
      amount: Number(amtCol ? String(row[amtCol] ?? '0').replace(/,/g, '') : '0') || 0,
    })),
    error: null,
  };
}
