import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Label from '@/components/ui/label';
import { Upload, FileSpreadsheet, X, CheckCircle2 } from 'lucide-react';
import { splitProduct } from '@/utils/split-product';
import { ExcelRow } from '@/types/excel';
import { parseExcelSheet } from '@/utils/parse-excel';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ExcelUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (data: ExcelRow[], name: string) => void;
}

export const ExcelUploadDialog = ({ open, onOpenChange, onUpload }: ExcelUploadDialogProps) => {
  const { isGuest } = useAuth();

  const defaultUploadName = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const [form, setForm] = useState({
    fileName: '',
    preview: [] as ExcelRow[],
    uploadName: defaultUploadName(),
  });

  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setForm(prev => ({ ...prev, fileName: '', preview: [], uploadName: defaultUploadName() }));
    setError(null);
  };

  const parseFile = useCallback((file: File) => {
    setError(null);

    const lowerName = file.name.toLowerCase();
    if (
      !lowerName.endsWith('.xlsx') &&
      !lowerName.endsWith('.xls') &&
      !lowerName.endsWith('.csv')
    ) {
      setError('엑셀 파일(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.');
      return;
    }

    setForm(prev => ({ ...prev, fileName: file.name }));

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const { rows, error: parseError } = parseExcelSheet(data);
        if (parseError) {
          setError(parseError);
          return;
        }
        setForm(prev => ({ ...prev, preview: rows }));
      } catch {
        setError('파일을 파싱하는 중 오류가 발생했습니다.');
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
    [parseFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) parseFile(file);
      e.currentTarget.value = '';
    },
    [parseFile],
  );

  const handleConfirm = () => {
    if (isGuest) {
      toast.error('게스트 모드에서는 엑셀 업로드를 할 수 없습니다.');
      return;
    }

    if (form.preview.length > 0 && form.uploadName.trim()) {
      onUpload(form.preview, form.uploadName.trim());
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FileSpreadsheet className='h-5 w-5' />
            엑셀 업로드
          </DialogTitle>
          <DialogDescription>매출 데이터가 포함된 엑셀 파일을 업로드하세요.</DialogDescription>
        </DialogHeader>

        <div className='space-y-1'>
          <Label
            htmlFor='upload-name'
            className='text-sm'
          >
            업로드 이름
          </Label>
          <Input
            id='upload-name'
            value={form.uploadName}
            onChange={e => setForm(prev => ({ ...prev, uploadName: e.target.value }))}
            placeholder='예: 2025-01'
            className='h-9'
          />
          <p className='text-xs text-muted-foreground'>이 이름으로 업로드가 폴더처럼 저장됩니다.</p>
        </div>

        {!form.fileName ? (
          <>
            <button
              type='button'
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
                dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
              )}
              onDragOver={e => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('excel-file-input')?.click()}
            >
              <Upload className='h-10 w-10 mx-auto mb-3 text-muted-foreground' />
              <p className='text-sm font-medium mb-1'>파일을 드래그하거나 클릭하여 업로드</p>
              <p className='text-xs text-muted-foreground'>.xlsx, .xls, .csv 지원</p>
            </button>
            <input
              id='excel-file-input'
              type='file'
              accept='.xlsx,.xls,.csv'
              className='hidden'
              onChange={handleFileInput}
            />
          </>
        ) : (
          <div className='space-y-4'>
            <div className='flex items-center justify-between p-3 rounded-lg bg-muted/50'>
              <div className='flex items-center gap-2'>
                <CheckCircle2 className='h-4 w-4 text-[hsl(var(--status-complete))]' />
                <span className='text-sm font-medium'>{form.fileName}</span>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={reset}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>

            {form.preview.length > 0 && (
              <div className='text-sm'>
                <p className='text-muted-foreground mb-2'>
                  미리보기 ({form.preview.length}건 감지)
                </p>
                <div className='rounded-md border border-border/50 overflow-auto max-h-48'>
                  <table className='w-full text-xs'>
                    <thead>
                      <tr className='border-b bg-muted/30'>
                        <th className='p-2 text-left'>대분류</th>
                        <th className='p-2 text-left'>곡명</th>
                        <th className='p-2 text-left'>편성명</th>
                        <th className='p-2 text-right'>상품총액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.preview.slice(0, 5).map(row => {
                        const { song, arrangement } = splitProduct(row.product);
                        return (
                          <tr
                            key={row.id}
                            className='border-b last:border-0'
                          >
                            <td className='p-2'>{row.category}</td>
                            <td className='p-2 max-w-[120px] truncate'>{song}</td>
                            <td className='p-2 max-w-[100px] truncate'>{arrangement}</td>
                            <td className='p-2 text-right tabular-nums'>
                              ₩{row.amount.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {form.preview.length > 5 && (
                  <p className='text-xs text-muted-foreground mt-1'>
                    외 {form.preview.length - 5}건...
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {error && <p className='text-sm text-destructive'>{error}</p>}

        <div className='flex justify-end gap-2 pt-2'>
          <Button
            variant='outline'
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            취소
          </Button>
          <Button
            disabled={form.preview.length === 0 || !form.uploadName.trim()}
            onClick={handleConfirm}
          >
            <Upload className='h-4 w-4 mr-1.5' />
            {form.preview.length}건 업로드
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
