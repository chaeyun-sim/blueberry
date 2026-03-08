import { Card, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Upload, Sheet, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { statsQueries } from '@/api/stats/queries';
import { statsMutations } from '@/api/stats/mutations';
import { statsKeys } from '@/api/stats/queryKeys';
import type { ExcelUpload } from '@/types/stats';
import UploadFolderRow from './UploadFolderRow';
import { queryClient } from '@/utils/query-client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';

function ExcelTab({ onUploadRequest }: { onUploadRequest: () => void }) {
  const { isGuest } = useAuth();
  const navigate = useNavigate();

  const {
    data: uploads = [],
    isLoading,
    isError,
    refetch,
  } = useQuery(statsQueries.getExcelUploads());

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
        toast.success(`"${upload.name}" 업로드가 삭제되었습니다.`);
      },
      onError: e =>
        toast.error('삭제에 실패했습니다.', {
          description: e instanceof Error ? e.message : undefined,
        }),
    });
  };

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
      <Card className='border-border/50'>
        <CardContent className='p-2 md:p-5'>
          <div className='flex flex-col gap-0.5'>
            {uploads.map(upload => (
              <UploadFolderRow
                key={upload.id}
                upload={upload}
                onClick={() => navigate(`/files/excel/${upload.id}`)}
              />
            ))}
          </div>

          {uploads.length === 0 && (
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
        </CardContent>
      </Card>
    </div>
  );
}

export default ExcelTab;
