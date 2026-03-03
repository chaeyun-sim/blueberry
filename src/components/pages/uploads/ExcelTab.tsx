import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, AlertCircle, Sheet } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { statsQueries } from '@/api/stats/queries';
import { statsMutations } from '@/api/stats/mutations';
import { statsKeys } from '@/api/stats/queryKeys';
import { formatCurrency } from '@/utils/format-currency';
import { splitProduct } from '@/utils/split-product';
import type { ExcelUpload } from '@/types/stats';
import UploadFolderRow from './UploadFolderRow';
import { queryClient } from '@/utils/query-client';
import { toast } from 'sonner';
import { useAuth } from '@/provider/AuthProvider';

function ExcelTab({ onUploadRequest }: { onUploadRequest: () => void }) {
  const { isGuest } = useAuth();

  const [openUploadId, setOpenUploadId] = useState<string | null>(null);

  const {
    data: uploads = [],
    isLoading,
    isError,
    refetch,
  } = useQuery(statsQueries.getExcelUploads());

  const { data: rows = [] } = useQuery({
    ...statsQueries.getSalesRowsByUploadId(openUploadId ?? ''),
    enabled: !!openUploadId,
  });

  const { mutate: deleteUpload, isPending: isDeleting } = useMutation(
    statsMutations.deleteExcelUpload(),
  );

  const handleDelete = (upload: ExcelUpload) => {
    if (isGuest) {
      toast.error('게스트 모드에서는 업로드를 삭제할 수 없습니다.');
      return;
    }

    if (
      !confirm(
        `"${upload.name}" 업로드를 삭제하시겠습니까?\n연결된 ${upload.row_count}건의 매출 데이터도 함께 삭제됩니다.`,
      )
    )
      return;

    deleteUpload(upload.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: statsKeys.all });
        if (openUploadId === upload.id) setOpenUploadId(null);
        toast.success(`"${upload.name}" 업로드가 삭제되었습니다.`);
      },
      onError: e =>
        toast.error('삭제에 실패했습니다.', {
          description: e instanceof Error ? e.message : undefined,
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
          <div
            key={i}
            className='h-12 rounded-lg bg-muted animate-pulse'
          />
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
          <span
            key={i}
            className='flex items-center gap-1.5'
          >
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
                    onDelete={e => {
                      e.stopPropagation();
                      handleDelete(upload);
                    }}
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
                {rows.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='text-xs uppercase w-10'>#</TableHead>
                        <TableHead className='text-xs uppercase'>대분류</TableHead>
                        <TableHead className='text-xs uppercase'>곡명</TableHead>
                        <TableHead className='text-xs uppercase'>편성명</TableHead>
                        <TableHead className='text-xs uppercase text-right'>상품총액</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row, i) => {
                        const { song, arrangement } = splitProduct(row.product);
                        return (
                          <TableRow key={i}>
                            <TableCell className='text-muted-foreground text-xs'>{i + 1}</TableCell>
                            <TableCell>
                              <span className='px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground'>
                                {row.category}
                              </span>
                            </TableCell>
                            <TableCell className='font-medium text-sm'>{song}</TableCell>
                            <TableCell className='text-sm text-muted-foreground'>
                              {arrangement}
                            </TableCell>
                            <TableCell className='text-right tabular-nums text-sm'>
                              {formatCurrency(row.amount)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!openUpload && uploads.length === 0 && (
            <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
              <Sheet className='h-12 w-12 mb-3 opacity-40' />
              <p className='text-sm'>아직 업로드된 엑셀 파일이 없습니다</p>
              <Button
                variant='outline'
                className='mt-4 gap-2'
                onClick={onUploadRequest}
              >
                <Upload className='h-4 w-4' />첫 번째 업로드
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
