import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, X, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";

export type ExcelRow = {
  id: number;
  orderDate: string;
  category: string;
  product: string;
  amount: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (data: ExcelRow[], name: string) => void;
};

const defaultUploadName = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const ExcelUploadDialog = ({ open, onOpenChange, onUpload }: Props) => {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<ExcelRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState(defaultUploadName);

  const reset = () => {
    setFileName(null);
    setPreview([]);
    setError(null);
    setUploadName(defaultUploadName());
  };

  const parseFile = useCallback((file: File) => {
    setError(null);
    if (
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls") &&
      !file.name.endsWith(".csv")
    ) {
      setError("엑셀 파일(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: false });

        if (json.length === 0) {
          setError("데이터가 없습니다.");
          return;
        }

        // Get actual header keys from the first row
        const headers = Object.keys(json[0]);

        // Fuzzy column finder
        const findCol = (aliases: string[]): string | null => {
          const normalized = aliases.map((a) => a.toLowerCase().replace(/[\s_]+/g, ""));
          for (const h of headers) {
            const nh = h.toLowerCase().replace(/[\s_]+/g, "");
            if (normalized.includes(nh)) return h;
          }
          for (const h of headers) {
            const nh = h.toLowerCase().replace(/[\s_]+/g, "");
            for (const n of normalized) {
              if (nh.includes(n) || n.includes(nh)) return h;
            }
          }
          return null;
        };

        const dateCol = findCol(["주문일시", "orderDate", "날짜", "주문날짜", "주문 일시", "order date"]);
        const catCol = findCol(["대분류", "category", "카테고리", "분류", "대 분류"]);
        const prodCol = findCol(["주문상품", "product", "상품명", "주문 상품", "상품"]);
        const amtCol = findCol(["상품총액", "amount", "금액", "총액", "상품 총액", "가격"]);

        let parsed: ExcelRow[];

        if (!catCol && !prodCol && !amtCol) {
          // 헤더 없는 파일: 컬럼 내용으로 자동 감지
          const rawRows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false });
          const knownCats = new Set(['CLASSIC', 'POP', 'K-POP', 'OST', 'ANI', 'ETC']);
          const sample = rawRows.slice(0, Math.min(20, rawRows.length));
          const colCount = Math.max(...rawRows.map(r => r.length), 0);

          let catIdx = -1, prodIdx = -1, amtIdx = -1, dateIdx = -1;

          for (let c = 0; c < colCount; c++) {
            const vals = sample.map(r => String(r[c] ?? '')).filter(v => v !== '' && v !== 'null');
            if (vals.length === 0) continue;
            const catScore = vals.filter(v => knownCats.has(v)).length;
            const numScore = vals.filter(v => v !== '' && !isNaN(Number(v.replace(/,/g, '')))).length;
            const prodScore = vals.filter(v => /\s*-/.test(v) && v.length > 5).length;
            const dateScore = vals.filter(v => /\d{4}[-/]\d{2}[-/]\d{2}/.test(v)).length;

            if (dateScore > 0 && dateIdx === -1) dateIdx = c;
            if (catScore > vals.length * 0.5 && catIdx === -1) catIdx = c;
            else if (prodScore > vals.length * 0.5 && prodIdx === -1) prodIdx = c;
            else if (numScore > vals.length * 0.7 && amtIdx === -1) amtIdx = c;
          }

          // 파일명에서 날짜 추출 (예: 202512_... → 2025-12-01)
          const dateFromFile = (() => {
            const m = file.name.match(/(\d{4})(\d{2})/);
            return m ? `${m[1]}-${m[2]}-01 00:00:00` : '';
          })();

          const dataRows = rawRows.filter(r =>
            (catIdx >= 0 && r[catIdx]) || (prodIdx >= 0 && r[prodIdx])
          );

          parsed = dataRows.map((row, i) => ({
            id: i + 1,
            orderDate: dateIdx >= 0 ? String(row[dateIdx] ?? '') : dateFromFile,
            category: catIdx >= 0 ? String(row[catIdx] ?? '') : '',
            product: prodIdx >= 0 ? String(row[prodIdx] ?? '') : '',
            amount: amtIdx >= 0 ? Number(String(row[amtIdx] ?? '0').replace(/,/g, '')) || 0 : 0,
          }));
        } else {
          parsed = json.map((row, i) => ({
            id: i + 1,
            orderDate: String(dateCol ? row[dateCol] ?? "" : ""),
            category: String(catCol ? row[catCol] ?? "" : ""),
            product: String(prodCol ? row[prodCol] ?? "" : ""),
            amount: Number(amtCol ? row[amtCol] ?? 0 : 0) || 0,
          }));
        }

        setPreview(parsed);
      } catch {
        setError("파일을 파싱하는 중 오류가 발생했습니다.");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) parseFile(file);
    },
    [parseFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) parseFile(file);
    },
    [parseFile]
  );

  const handleConfirm = () => {
    if (preview.length > 0 && uploadName.trim()) {
      onUpload(preview, uploadName.trim());
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            엑셀 업로드
          </DialogTitle>
          <DialogDescription>
            매출 데이터가 포함된 엑셀 파일을 업로드하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          <Label htmlFor="upload-name" className="text-sm">업로드 이름</Label>
          <Input
            id="upload-name"
            value={uploadName}
            onChange={e => setUploadName(e.target.value)}
            placeholder="예: 2025-01"
            className="h-9"
          />
          <p className="text-xs text-muted-foreground">이 이름으로 업로드가 폴더처럼 저장됩니다.</p>
        </div>

        {!fileName ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() =>
              document.getElementById("excel-file-input")?.click()
            }
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              파일을 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-xs text-muted-foreground">
              .xlsx, .xls, .csv 지원
            </p>
            <input
              id="excel-file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--status-complete))]" />
                <span className="text-sm font-medium">{fileName}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {preview.length > 0 && (
              <div className="text-sm">
                <p className="text-muted-foreground mb-2">
                  미리보기 ({preview.length}건 감지)
                </p>
                <div className="rounded-md border border-border/50 overflow-auto max-h-48">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="p-2 text-left">주문일시</th>
                        <th className="p-2 text-left">대분류</th>
                        <th className="p-2 text-left">주문상품</th>
                        <th className="p-2 text-right">상품총액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 5).map((row) => (
                        <tr key={row.id} className="border-b last:border-0">
                          <td className="p-2">{row.orderDate}</td>
                          <td className="p-2">{row.category}</td>
                          <td className="p-2 max-w-[150px] truncate">
                            {row.product}
                          </td>
                          <td className="p-2 text-right tabular-nums">
                            ₩{row.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.length > 5 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    외 {preview.length - 5}건...
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            취소
          </Button>
          <Button disabled={preview.length === 0 || !uploadName.trim()} onClick={handleConfirm}>
            <Upload className="h-4 w-4 mr-1.5" />
            {preview.length}건 업로드
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
