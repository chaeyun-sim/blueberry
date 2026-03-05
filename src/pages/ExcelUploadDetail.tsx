import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import Button from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileSpreadsheet, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { statsQueries } from '@/api/stats/queries';
import { statsMutations } from '@/api/stats/mutations';
import { statsKeys } from '@/api/stats/queryKeys';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/utils/query-client';
import { formatCurrency } from '@/utils/format-currency';
import { splitProduct } from '@/utils/split-product';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import dayjs from 'dayjs';
import AppHeader from '@/components/layout/AppHeader';

export default function ExcelUploadDetail() {
  const { uploadId } = useParams<{ uploadId: string }>();
  const navigate = useNavigate();
  const { isGuest } = useAuth();

  const { data: uploads = [] } = useQuery(statsQueries.getExcelUploads());
  const { data: rows = [], isLoading } = useQuery(
    statsQueries.getSalesRowsByUploadId(uploadId ?? ''),
  );

  const upload = uploads.find(u => u.id === uploadId);

  const { mutate: deleteUpload, isPending: isDeleting } = useMutation(
    statsMutations.deleteExcelUpload(),
  );

  const handleDelete = () => {
    if (isGuest) {
      toast.error('게스트 모드에서는 업로드를 삭제할 수 없습니다.');
      return;
    }
    if (!upload) return;
    if (
      !confirm(
        `"${upload.name}" 업로드를 삭제하시겠습니까?\n연결된 ${upload.row_count}건의 매출 데이터도 함께 삭제됩니다.`,
      )
    )
      return;

    deleteUpload(upload.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: statsKeys.all });
        toast.success(`"${upload.name}" 업로드가 삭제되었습니다.`);
        navigate('/files');
      },
      onError: e =>
        toast.error('삭제에 실패했습니다.', {
          description: e instanceof Error ? e.message : undefined,
        }),
    });
  };

  return (
    <AppLayout>
      <AppHeader>
        <AppHeader.Back />
        {upload && <AppHeader.Delete onClick={handleDelete} disabled={isDeleting} />}
      </AppHeader>
      <div className='mb-6 flex items-center justify-between'>
        <Button
          variant='ghost'
          className='gap-2 pl-0 text-muted-foreground hover:bg-foreground/5'
          onClick={() => navigate('/files')}
        >
          <ArrowLeft className='h-4 w-4' /> 
        </Button>
        {upload && (
          <Button
            variant='ghost'
            size='icon'
            className='text-muted-foreground hover:text-destructive hover:bg-destructive/10'
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label='업로드 삭제'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        )}
      </div>

      <PageHeader
        title={upload?.name ?? '업로드 상세'}
        description={
          upload
            ? `${upload.row_count.toLocaleString()}건 · ${dayjs(upload.uploaded_at).format('YYYY-MM-DD')}`
            : ''
        }
      />

      {isLoading ? (
        <div className='space-y-4 mt-6'>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className='h-12 rounded-lg bg-muted animate-pulse' />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
          <FileSpreadsheet className='h-12 w-12 mb-3 opacity-40' />
          <p className='text-sm'>데이터가 없습니다</p>
        </div>
      ) : (
        <Card className='border-border/50 mt-6'>
          <CardContent className='p-2 md:p-5'>
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
                      <TableCell className='text-sm text-muted-foreground'>{arrangement}</TableCell>
                      <TableCell className='text-right tabular-nums text-sm'>
                        {formatCurrency(row.amount)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
