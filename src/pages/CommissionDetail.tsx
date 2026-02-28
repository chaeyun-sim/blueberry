import dayjs from 'dayjs';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, ChevronRight, ExternalLink, LucideIcon, Music2, Package2, Pencil, Trash2, Truck } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { COMMISSION_STATUS_TRANSLATE } from '@/constants/translate';
import { overlay } from 'overlay-kit';
import ReceiveAndSendDialog from '@/components/pages/commission/ReceiveAndSendDialog';
import { CompleteDialog } from '@/components/pages/commission/CompleteDialog';
import CommissionImageDialog from '@/components/pages/commission/CommissionImageDialog';
import { CommissionStatus } from '@/constants/status-config';
import { useMutation } from '@tanstack/react-query';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { commissionQueries } from '@/api/commission/queries';
import { commissionMutations } from '@/api/commission/mutations';
import { commissionKeys } from '@/api/commission/queryKeys';
import { scoreQueries } from '@/api/score/queries';
import DeleteCommissionDialog from '@/components/pages/commission/DeleteCommissionDialog';
import NotFound from './NotFound';
import { Skeleton } from '@/components/ui/skeleton';
import { queryClient } from '@/utils/query-client';
import { COMMISSION_INFO } from '@/types/commission';
import { toast } from 'sonner';

const statusProgress: Record<CommissionStatus, LucideIcon>  = {
  received: Package2,
  working: Music2,
  complete: CheckCircle,
  delivered: Truck,
}

const toastMessages: Partial<Record<CommissionStatus, string>> = {
  working: '작업을 시작합니다.',
  complete: '작업이 완료되었습니다.',
  delivered: '의뢰인에게 전달되었습니다.',
};

const cleanTitle = (title: string) =>
  title
    .replace(/\d+\s*(악장|st|nd|rd|th)(\s*movement)?/gi, '')
    .replace(/\b(allegro|andante|adagio|presto|vivace|moderato|largo|lento|grave|scherzo|finale)\b/gi, '')
    .replace(/[-–—]\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()

const CommissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: commission, isLoading } = useQuery(commissionQueries.getCommission(id))
  const { data: song } = useQuery(scoreQueries.getSong(commission?.song_id ?? ''))
  const { mutate: updateStatus } = useMutation(commissionMutations.updateCommissionStatus())

  const matchedArrangements = song?.arrangements?.filter(
    a => a.arrangement === commission?.arrangement
  ) ?? []

  const rawTitle = song?.english_title ?? commission?.songs?.title ?? commission?.title ?? ''
  const imslpQuery = [cleanTitle(rawTitle), commission?.songs?.composer ?? commission?.composer]
    .filter(Boolean)
    .join(' ')
  const imslpUrl = `https://www.google.com/search?q=${encodeURIComponent(`site:imslp.org ${imslpQuery}`)}`

  const commissionStatuses = Object.keys(COMMISSION_STATUS_TRANSLATE);
  const currentStatusIndex = commissionStatuses.findIndex(status => status === commission?.status);

  const nextStatus =
    currentStatusIndex < commissionStatuses.length - 1
      ? commissionStatuses[currentStatusIndex + 1]
      : null;

  const handleTransitionConfirm = () => {
    if (!nextStatus) return
    updateStatus({ commissionId: id, status: nextStatus as CommissionStatus }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: commissionKeys.detail(id) })
        queryClient.invalidateQueries({ queryKey: commissionKeys.list() })
        toast.success(toastMessages[nextStatus as CommissionStatus] ?? '상태가 변경되었습니다.')
      },
      onError: (e) => {
        toast.error('상태 변경에 실패했습니다.', { description: e.message })
      },
    })
  };

  const handleOpenDialog = () => {
    if (nextStatus === 'working' || nextStatus === 'delivered') {
      overlay.open(
        overlayProps => (
          <ReceiveAndSendDialog
            {...overlayProps}
            fromStatus={commission?.status}
            toStatus={nextStatus as CommissionStatus}
            onConfirm={handleTransitionConfirm}
          />
        ),
        { overlayId: 'receive-and-send-dialog' },
      );
    } else {
       overlay.open(
        overlayProps => (
          <CompleteDialog
            {...overlayProps}
            commission={commission}
            onConfirm={handleTransitionConfirm}
          />
        ),
        { overlayId: 'status-transition-dialog' },
      );
    }
  };

  const handleViewOriginalImage = () => {
    overlay.open(
      overlayProps => (
        <CommissionImageDialog
          {...overlayProps}
          date={commission?.created_at}
          imageUrl={ commission?.image_url }
        />
      ),
      { overlayId: 'original-image-dialog' },
    );
  };


  const handleDelete = () => {
    overlay.open(
      overlayProps => (
        <DeleteCommissionDialog {...overlayProps} commissionId={id}/>
      ),
      { overlayId: 'delete-commission-dialog' },
    );
  };

  if (!id) return <Navigate to='/commissions' replace />;

  if (isLoading) return (
    <AppLayout>
      <div className='mb-6 flex items-center justify-between'>
        <Skeleton className='h-9 w-16' />
        <Skeleton className='h-9 w-16' />
      </div>
      <Skeleton className='h-8 w-48 mb-8' />
      <Card className='mb-8 border-border/50'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between w-full'>
            {[0, 1, 2, 3].map(i => (
              <div key={i} className='flex items-center flex-1'>
                <div className='flex flex-col items-center'>
                  <Skeleton className='w-10 h-10 rounded-full' />
                  <Skeleton className='h-3 w-10 mt-2' />
                </div>
                {i < 3 && <Skeleton className='flex-1 h-0.5 mx-3' />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className='border-border/50'>
        <CardContent className='p-5 space-y-4'>
          <Skeleton className='h-5 w-20' />
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className='flex items-center justify-between py-2 border-b border-border/50 last:border-0'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 w-24' />
            </div>
          ))}
        </CardContent>
      </Card>
    </AppLayout>
  );

  if (!commission) return <NotFound />;

  return (
    <AppLayout
      bottomBar={
        <div className='border-t border-border bg-background/95 backdrop-blur-sm'>
          <div className='px-6 py-3 flex items-center justify-between'>
            <Button variant='outline' className='gap-2 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive hover:border-destructive' onClick={handleDelete}>
              <Trash2 className='h-4 w-4' /> 삭제
            </Button>

            {nextStatus ? (
              <Button
                onClick={handleOpenDialog}
                className='gap-2 px-6 py-5'
              >
                <ChevronRight className='h-4 w-4' /> {COMMISSION_STATUS_TRANSLATE[nextStatus]}
                {nextStatus === 'working' ? '으로' : '로'} 변경
              </Button>
            ) : (
              <p className='text-sm text-muted-foreground py-2'>전달이 완료된 의뢰입니다.</p>
            )}
          </div>
        </div>
      }
    >
      <div className='mb-6 flex items-center justify-between'>
        <Button
          variant='ghost'
          className='gap-2 hover:bg-foreground/5 text-muted-foreground'
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className='h-4 w-4' /> 뒤로
        </Button>
        <Button
          variant='ghost'
          className='gap-2 hover:bg-foreground/5 text-muted-foreground'
          onClick={() => navigate(`/commissions/${id}/edit`)}
        >
          <Pencil className='h-4 w-4' /> 수정
        </Button>
      </div>

      <PageHeader title={song?.title ?? commission.songs?.title ?? commission.title ?? ''} />

      {/* Status Progress */}
      <Card className='mb-8 border-border/50'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between w-full'>
            {Object.entries(COMMISSION_STATUS_TRANSLATE).map(([status, label], i, originArray) => {
              const Icon = statusProgress[status as CommissionStatus];
              return (
                <div
                  key={status}
                  className={cn(
                    'flex items-center',
                    i < originArray.length - 1 ? 'flex-1' : '',
                  )}
                >
                  <div className='flex flex-col items-center'>
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                        i <= currentStatusIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'border-2 border-border text-muted-foreground/40',
                      )}
                    >
                      <Icon className={i <= currentStatusIndex ? 'h-5 w-5' : 'h-4 w-4'} />
                    </div>
                    <span
                      className={cn(
                        'text-xs mt-2',
                        i <= currentStatusIndex ? 'font-medium' : 'text-muted-foreground',
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {i < originArray.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mx-3',
                        i < currentStatusIndex ? 'bg-primary' : 'bg-border',
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className='mb-8'>
        {/* Commission Info */}
        <Card className='border-border/50'>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='font-display font-semibold'>의뢰 정보</h2>
              <button className='inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors' onClick={handleViewOriginalImage}>
                원본 이미지 보기 <ExternalLink className='h-3 w-3' />
              </button>
            </div>
            <dl className='space-y-3'>
              {Object.keys(COMMISSION_INFO).map(key => {
                const value = () => {
                  if (key === 'version') {
                    return commission.version ? `${commission.version} ver.` : '-';
                  }
                  if (key === 'created_at') {
                    return commission.created_at ? dayjs(commission.created_at).format('YYYY-MM-DD HH:mm') : '-';
                  }
                  if (key === 'composer') {
                    return commission.songs?.composer ?? commission.composer ?? '-';
                  }
                  return commission[key] ?? '-';
                }
                return (
                  <div
                  key={key}
                  className='flex items-center justify-between py-2 border-b border-border/50 last:border-0'
                >
                  <dt className='text-sm text-muted-foreground'>{COMMISSION_INFO[key]}</dt>
                  <dd className='text-sm font-medium'>{value()}</dd>
                </div>
                )
              })}
            </dl>
            {commission.notes && (
              <div className='mt-4 p-3 rounded-lg bg-muted/50'>
                <p className='text-sm text-muted-foreground'>{commission.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Linked Scores */}
      <Card className='border-border/50'>
        <CardContent className='p-5'>
          <h2 className='font-display font-semibold mb-4'>연결된 악보</h2>
          <div className='space-y-2'>
            {matchedArrangements.length > 0 ? (
              matchedArrangements.map(arrangement => (
                <button
                  key={arrangement.id}
                  onClick={() => navigate(`/scores/${song?.id}/arrangements/${arrangement.id}`)}
                  className='flex items-center justify-between w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left'
                >
                  <div>
                    <p className='text-sm font-medium'>{arrangement.arrangement}</p>
                    {arrangement.version && (
                      <p className='text-xs text-muted-foreground'>{arrangement.version} ver.</p>
                    )}
                  </div>
                  <ChevronRight className='h-4 w-4 text-muted-foreground shrink-0' />
                </button>
              ))
            ) : (
              <p className='text-sm text-muted-foreground py-2'>같은 편성의 악보가 없습니다</p>
            )}
            <a
              href={imslpUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-between w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors'
            >
              <div>
                <p className='text-sm font-medium'>IMSLP에서 찾기</p>
                <p className='text-xs text-muted-foreground'>
                  {commission.songs?.title ?? commission.title} · {commission.songs?.composer ?? commission.composer}
                </p>
              </div>
              <ExternalLink className='h-4 w-4 text-muted-foreground shrink-0' />
            </a>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default CommissionDetail;
