import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, Trash2, FolderOpen, AlertCircle, Sheet } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { statsQueries } from '@/api/stats/queries';
import { statsMutations } from '@/api/stats/mutations';
import { statsKeys } from '@/api/stats/queryKeys';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/format-currency';
import dayjs from 'dayjs';
import type { ExcelUpload } from '@/types/stats';

function UploadFolderRow({
  upload,
  onClick,
  onDelete,
  isDeleting,
}: {
  upload: ExcelUpload;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isDeleting: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
    >
      <div className='w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted/30 transition-colors group'>
        <button type='button' onClick={onClick} className='flex items-center gap-4 flex-1 min-w-0 text-left cursor-pointer'>
          <FolderOpen className='h-5 w-5 text-primary/70 group-hover:text-primary shrink-0 transition-colors' />
          <span className='font-medium text-sm flex-1 truncate'>{upload.name}</span>
          <span className='text-xs text-muted-foreground tabular-nums'>{upload.row_count.toLocaleString()}건</span>
          <span className='text-xs text-muted-foreground tabular-nums'>{dayjs(upload.uploaded_at).format('YYYY-MM-DD')}</span>
        </button>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0'
          onClick={onDelete}
          disabled={isDeleting}
        >
          <Trash2 className='h-3.5 w-3.5' />
        </Button>
      </div>
    </motion.div>
  );
}

function ExcelTab({ onUploadRequest }: { onUploadRequest: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openUploadId, setOpenUploadId] = useState<string | null>(null);

  const { data: uploads = [], isLoading, isError, refetch } = useQuery(statsQueries.getExcelUploads());

  const { data: rows = [] } = useQuery({
    ...statsQueries.getSalesRowsByUploadId(openUploadId ?? ''),
    enabled: !!openUploadId,
  });

  const { mutate: deleteUpload, isPending: isDeleting } = useMutation(statsMutations.deleteExcelUpload());

  const handleDelete = (upload: ExcelUpload) => {
    if (!confirm(`"${upload.name}" 업로드를 삭제하시겠습니까?\n연결된 ${upload.row_count}건의 매출 데이터도 함께 삭제됩니다.`)) return;
    deleteUpload(upload.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: statsKeys.all });
        if (openUploadId === upload.id) setOpenUploadId(null);
        toast({ title: `"${upload.name}" 업로드가 삭제되었습니다.` });
      },
      onError: e =>
        toast({
          title: '삭제에 실패했습니다.',
          description: e instanceof Error ? e.message : undefined,
          variant: 'destructive',
        }),
    });
  };

  const openUpload = openUploadId ? uploads.find(u => u.id === openUploadId) : null;
  const breadcrumb: { label: string; id: string | null }[] = [{ label: '전체 업로드', id: null }];
  if (openUpload) breadcrumb.push({ label: openUpload.name, id: openUpload.id });

  if (isLoading && !uploads.length) {
    return (
      <div className='space-y-4'>
        {[0, 1, 2].map(i => (
          <div key={i} className='h-12 rounded-lg bg-muted animate-pulse' />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className='border-destructive/50'>
        <CardContent className='p-6'>
          <div className='flex items-center gap-4'>
            <AlertCircle className='h-8 w-8 text-destructive flex-shrink-0' />
            <div className='flex-1'>
              <p className='font-medium text-destructive'>업로드 목록을 불러올 수 없습니다</p>
              <p className='text-sm text-muted-foreground mt-1'>잠시 후 다시 시도해주세요.</p>
            </div>
            <Button onClick={() => refetch()}>다시 시도</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Breadcrumb */}
      <div className='flex items-center gap-1.5 text-sm'>
        {breadcrumb.map((item, i) => (
          <span key={i} className='flex items-center gap-1.5'>
            {i > 0 && <span className='text-muted-foreground/40'>/</span>}
            <button
              type='button'
              onClick={() => setOpenUploadId(item.id)}
              className={
                i === breadcrumb.length - 1
                  ? 'font-semibold text-foreground'
                  : 'text-muted-foreground hover:text-primary transition-colors'
              }
            >
              {item.label}
            </button>
          </span>
        ))}
      </div>

      <Card className='border-border/50'>
        <CardContent className='p-5'>
          <AnimatePresence mode='wait'>
            {!openUpload ? (
              <motion.div
                key='upload-list'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='flex flex-col gap-0.5'
              >
                {uploads.map(upload => (
                  <UploadFolderRow
                    key={upload.id}
                    upload={upload}
                    onClick={() => setOpenUploadId(upload.id)}
                    onDelete={e => { e.stopPropagation(); handleDelete(upload); }}
                    isDeleting={isDeleting}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key='upload-detail'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='text-xs uppercase w-10'>#</TableHead>
                      <TableHead className='text-xs uppercase'>주문일시</TableHead>
                      <TableHead className='text-xs uppercase'>대분류</TableHead>
                      <TableHead className='text-xs uppercase'>주문상품</TableHead>
                      <TableHead className='text-xs uppercase text-right'>상품총액</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className='text-muted-foreground text-xs'>{i + 1}</TableCell>
                        <TableCell className='text-sm tabular-nums'>{row.orderDate}</TableCell>
                        <TableCell>
                          <span className='px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground'>
                            {row.category}
                          </span>
                        </TableCell>
                        <TableCell className='font-medium text-sm'>{row.product}</TableCell>
                        <TableCell className='text-right tabular-nums text-sm'>
                          {formatCurrency(row.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            )}
          </AnimatePresence>

          {!openUpload && uploads.length === 0 && (
            <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
              <Sheet className='h-12 w-12 mb-3 opacity-40' />
              <p className='text-sm'>아직 업로드된 엑셀 파일이 없습니다</p>
              <Button variant='outline' className='mt-4 gap-2' onClick={onUploadRequest}>
                <Upload className='h-4 w-4' />
                첫 번째 업로드
              </Button>
            </div>
          )}

          {openUpload && rows.length === 0 && (
            <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
              <FileSpreadsheet className='h-12 w-12 mb-3 opacity-40' />
              <p className='text-sm'>데이터가 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ExcelTab;
