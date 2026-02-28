import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Music, Trash2 } from 'lucide-react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { scoreQueries } from '@/api/score/queries';
import { fileTypeConfig } from '@/constants/file-types';
import { overlay } from 'overlay-kit';
import DeleteArrangementDialog from '@/components/pages/score/DeleteArrangementDialog';

const ScoreDetail = () => {
  const { scoreId, arrangementId } = useParams();
  const navigate = useNavigate();

  const { data: arrangement, isLoading } = useQuery(scoreQueries.getArrangement(arrangementId));
  const { data: song } = useQuery(scoreQueries.getSong(scoreId ?? ''));

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
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className='aspect-[3/4] rounded-lg' />
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
      <div className='flex items-center justify-between mb-6'>
        <Button
          variant='ghost'
          className='gap-2 text-muted-foreground hover:bg-foreground/5'
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className='h-4 w-4' /> 뒤로
        </Button>

        <Button
          variant='ghost'
          size='sm'
          className='gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
          onClick={handleDelete}
        >
          <Trash2 className='h-4 w-4' />
          악보 삭제
        </Button>
      </div>

      <PageHeader title={songTitle} description={arrangement.arrangement} />

      <Card className='border-border/50'>
        <CardContent className='p-5'>
          {files.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
              <Music className='h-12 w-12 mb-3 opacity-40' />
              <p className='text-sm'>등록된 파일이 없습니다</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {files.map(file => {
                const config = fileTypeConfig[file.file_type] ?? fileTypeConfig.score;
                const Icon = config.icon;
                const partName = file.file_type === 'part'
                  ? (file.label.includes(' - ') ? file.label.split(' - ').pop() : file.label)
                  : null;
                return (
                  <div key={file.id} className='flex flex-col gap-2'>
                    <a
                      href={file.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='aspect-[3/4] border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-3 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group'
                    >
                      <Icon className={`h-12 w-12 ${config.color} group-hover:scale-105 transition-transform`} />
                      <div className='text-center px-3'>
                        {partName && (
                          <p className='text-sm font-medium truncate max-w-full'>{partName}</p>
                        )}
                        <span className='text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium mt-1 inline-block'>
                          {config.label}
                        </span>
                      </div>
                    </a>
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
