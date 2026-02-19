import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  onUpload: (data: ExcelRow[]) => void;
};

export const ExcelUploadDialog = ({ open, onOpenChange, onUpload }: Props) => {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<ExcelRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFileName(null);
    setPreview([]);
    setError(null);
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
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        const parsed: ExcelRow[] = json.map((row, i) => {
          const orderDate =
            (row["주문일시"] as string) ||
            (row["orderDate"] as string) ||
            (row["날짜"] as string) ||
            "";
          const category =
            (row["대분류"] as string) ||
            (row["category"] as string) ||
            (row["카테고리"] as string) ||
            "";
          const product =
            (row["주문상품"] as string) ||
            (row["product"] as string) ||
            (row["상품명"] as string) ||
            "";
          const amount =
            Number(row["상품총액"] || row["amount"] || row["금액"] || 0);

          return { id: i + 1, orderDate, category, product, amount };
        });

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
    if (preview.length > 0) {
      onUpload(preview);
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
          <Button disabled={preview.length === 0} onClick={handleConfirm}>
            <Upload className="h-4 w-4 mr-1.5" />
            {preview.length}건 업로드
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
