import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Music, Trash2 } from 'lucide-react';
import { useParams, Navigate } from 'react-router-dom';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { scoreQueries } from '@/api/score/queries';
import { scoreMutations } from '@/api/score/mutations';
import { scoreKeys } from '@/api/score/queryKeys';
import { fileTypeConfig } from '@/constants/file-types';
import { overlay } from 'overlay-kit';
import DeleteArrangementDialog from '@/components/pages/score/DeleteArrangementDialog';
import AppHeader from '@/components/layout/AppHeader';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/utils/query-client';
import { toast } from 'sonner';
import type { ArrangementFile } from '@/types/score';

const getFileDisplayLabel = (file: ArrangementFile): string => {
  if (file.file_type === 'audio') return '오디오';
  if (file.file_type === 'musicxml') return 'Music XML';

  // score / part / finale: " - 악기명" 있으면 Part, 없으면 Score
  if (['score', 'part', 'finale'].includes(file.file_type)) {
    if (!file.label.includes(' - ')) return 'Score';
    return `Part - ${file.label.split(' - ').pop()!}`;
  }

  return fileTypeConfig[file.file_type]?.label ?? file.label;
};

const ScoreDetail = () => {
  const { scoreId, arrangementId } = useParams();

  const { data: arrangement, isLoading } = useQuery(scoreQueries.getArrangement(arrangementId));
  const { data: song } = useQuery(scoreQueries.getSong(scoreId ?? ''));
  const { mutate: deleteFile, isPending: isDeletingFile } = useMutation(scoreMutations.deleteArrangementFile());

  const handleDeleteFile = (fileId: string) => {
    deleteFile(
      { id: fileId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: scoreKeys.arrangement(arrangementId!) });
          toast.success('파일이 삭제되었습니다.');
        },
        onError: (e) => {
          toast.error('파일 삭제에 실패했습니다.', { description: e.message });
        },
      },
    );
  };

  const handleDelete = () => {
    overlay.open(
      overlayProps => (
        <DeleteArrangementDialog
          {...overlayProps}
          arrangementId={arrangementId!}
          songTitle={arrangement?.songs?.title ?? song?.title ?? '알 수 없는 곡'}
          arrangement={arrangement?.arrangement ?? ''}
        />
      ),
      { overlayId: 'delete-arrangement-dialog' },
    );
  };

  if (!arrangementId) return <Navigate to='/scores' replace />;

  if (isLoading) {
    return (
      <AppLayout>
        <div className='mb-6'>
          <Skeleton className='h-9 w-20' />
        </div>
        <Skeleton className='h-8 w-60 mb-2' />
        <Skeleton className='h-4 w-40 mb-6' />
        <Card className='border-border/50'>
          <CardContent className='p-5'>
            <div className='divide-y divide-border/50'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='flex items-center gap-3 py-3'>
                  <Skeleton className='h-5 w-5 rounded shrink-0' />
                  <Skeleton className='h-4 flex-1' />
                  <Skeleton className='h-8 w-8 rounded' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  if (!arrangement) {
    return (
      <AppLayout>
        <div className='text-center py-20 text-muted-foreground'>악보를 찾을 수 없습니다</div>
      </AppLayout>
    );
  }

  const songTitle = arrangement.songs?.title ?? song?.title ?? '알 수 없는 곡';
  const files = arrangement.arrangement_files ?? [];

  return (
    <AppLayout>
      <AppHeader>
        <AppHeader.Back />
        <AppHeader.Right>
          <Button
            variant='ghost'
            size='sm'
            className='gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
            onClick={handleDelete}
          >
            <Trash2 className='h-4 w-4' />
            악보 삭제
          </Button>
        </AppHeader.Right>
      </AppHeader>

      <PageHeader title={songTitle} description={arrangement.arrangement} />

      <Card className='border-border/50'>
        <CardContent className='p-5'>
          {files.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
              <Music className='h-12 w-12 mb-3 opacity-40' />
              <p className='text-sm'>등록된 파일이 없습니다</p>
            </div>
          ) : (
            <div className='divide-y divide-border/50'>
              {files.map(file => {
                const config = fileTypeConfig[file.file_type] ?? fileTypeConfig.score;
                const Icon = config.icon;
                const displayLabel = getFileDisplayLabel(file);
                return (
                  <div key={file.id} className='flex items-center gap-3 py-3 first:pt-0 last:pb-0'>
                    <a
                      href={file.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-3 flex-1 min-w-0 group'
                    >
                      <Icon className={`h-5 w-5 shrink-0 ${config.color}`} />
                      <span className='text-sm font-medium truncate group-hover:underline'>
                        {displayLabel}
                      </span>
                    </a>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                      disabled={isDeletingFile}
                      onClick={() => handleDeleteFile(file.id)}
                      aria-label='파일 삭제'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default ScoreDetail;
