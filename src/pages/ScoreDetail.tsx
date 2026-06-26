import { Navigate,useParams } from 'react-router-dom';

import { useMutation } from '@tanstack/react-query';
import { Music, Trash2 } from 'lucide-react';
import { overlay } from 'overlay-kit';
import { toast } from 'sonner';

import AppHeader from '@/components/layout/AppHeader';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import Button from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fileTypeConfig } from '@/constants/file-types';
import { INSTRUMENT_ABBREVIATIONS } from '@/constants/instruments';
import { scoreKeys,scoreMutations, scoreQueries } from '@/features/score/api';
import { DeleteArrangementDialog } from '@/features/score/components';
import type { ArrangementFile } from '@/features/score/types';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { queryClient } from '@/utils/query-client';

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

  const buildDownloadFilename = (file: ArrangementFile): string => {
    const sanitize = (s: string) => s.replace(/[/\\:*?"<>|]/g, '_').trim();
    const composer = arrangement.songs?.composer ?? '';
    const arrAbbr = arrangement.arrangement
      .split(',')
      .map(part => {
        const trimmed = part.trim();
        const romanMatch = trimmed.match(/^(.+?)\s+(I{1,3}V?|IV|VI{0,3}|V)$/);
        const base = romanMatch ? romanMatch[1] : trimmed;
        return (INSTRUMENT_ABBREVIATIONS[base] ?? base).toLowerCase();
      })
      .join(',');
    const isPartScore =
      ['score', 'part', 'finale'].includes(file.file_type) && file.label.includes(' - ');
    const partName = isPartScore ? file.label.split(' - ').slice(1).join(' - ') : '';
    const base = [composer, songTitle, arrAbbr].filter(Boolean).map(sanitize).join('_');
    const suffix = partName ? ` - ${partName}` : '';
    const ext = file.url.split('?')[0].split('.').pop() ?? '';
    return `${base}${suffix}${ext ? '.' + ext : ''}`;
  };

  const handleDownload = async (file: ArrangementFile) => {
    try {
      const filename = buildDownloadFilename(file);
      const res = await fetch(file.url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error('파일 다운로드에 실패했습니다.');
    }
  };

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
                      onClick={e => { e.preventDefault(); handleDownload(file); }}
                      className='flex items-center gap-3 flex-1 min-w-0 group cursor-pointer'
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
