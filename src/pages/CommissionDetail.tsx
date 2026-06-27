import dayjs from 'dayjs';
import {
  ChevronRight,
  Download,
  ExternalLink,
  Loader2,
  Mail,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import AppHeader from '@/components/layout/AppHeader';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import Button from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { COMMISSION_STATUS_TRANSLATE } from '@/constants/translate';
import { commissionQueries } from '@/features/commission/api';
import {
  CommissionDetailSkeleton,
  CommissionStatusProgress,
} from '@/features/commission/components';
import { useCommissionDetailActions } from '@/features/commission/hooks';
import { COMMISSION_INFO } from '@/features/commission/types';
import { scoreQueries } from '@/features/score/api';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { analyzeMusicMeta, downloadFilledTemplate } from '@/utils/mxl-template';
import NotFound from './NotFound';

const CommissionDetailContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [templateLoading, setTemplateLoading] = useState(false);

  const { data: commission, isLoading } = useQuery(commissionQueries.getCommission(id));
  const { data: song } = useQuery(scoreQueries.getSong(commission?.song_id ?? ''));

  const { imslpUrl, nextStatus, openDialog, openEmailDialog, viewOriginalImage, deleteCommission } =
    useCommissionDetailActions(id!, commission, song);

  const handleTemplateDownload = async () => {
    if (!commission) return;
    setTemplateLoading(true);
    try {
      const linked = song ?? commission.songs;
      // 모음곡: workTitle=컬렉션명, movementTitle=특정 곡(commission.title)
      // 단독 곡: workTitle=commission.title
      const workTitle = linked
        ? (linked.title ?? '')
        : (commission.title ?? '');
      const movementTitle = linked ? (commission.title ?? '') : '';
      const composer = linked?.composer ?? commission.composer ?? '';

      // AI가 원어 정식 명칭(canonicalTitle) + 조성/박자 한 번에 분석
      const meta = await analyzeMusicMeta(workTitle, composer, movementTitle || undefined);

      // 악보 메인 제목 = 특정 곡의 원어 정식 명칭 (예: Volière)
      // 서브타이틀 = 모음곡명. linked song이 있으면 workTitle, 없으면 AI가 감지한 collectionTitle
      const mxlTitle = meta.canonicalTitle || movementTitle || workTitle;
      const mxlSubtitle = movementTitle
        ? workTitle
        : (meta.collectionTitle ?? undefined);

      await downloadFilledTemplate({
        title: mxlTitle,
        subtitle: mxlSubtitle || undefined,
        composer,
        arrangement: commission.arrangement ?? '',
        keyFifths: meta.keyFifths,
        keyMode: meta.keyMode,
        timeBeats: meta.timeBeats,
        timeBeatType: meta.timeBeatType,
      });
    } catch (err) {
      toast.error('템플릿 다운로드 실패', {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setTemplateLoading(false);
    }
  };

  if (!id)
    return (
      <Navigate
        to='/commissions'
        replace
      />
    );

  if (isLoading) return <CommissionDetailSkeleton />;

  if (!commission) return <NotFound />;

  return (
    <AppLayout
      bottomBar={
        <div className='md:border-t md:border-border md:bg-background/95 md:backdrop-blur-sm'>
          <div className='px-4 py-2 md:px-6 md:py-3 flex items-center justify-end'>
            {commission.status !== 'cancelled' &&
              (nextStatus ? (
                <Button
                  onClick={openDialog}
                  className='gap-2 w-full md:w-auto rounded-2xl md:rounded-md py-6 md:py-5 shadow-lg md:shadow-none'
                >
                  <ChevronRight className='h-4 w-4' /> {COMMISSION_STATUS_TRANSLATE[nextStatus]}
                  {nextStatus === 'working' ? '으로' : '로'} 변경
                </Button>
              ) : !commission.is_delivered ? (
                <Button
                  className='gap-2 w-full md:w-auto rounded-2xl md:rounded-md py-6 md:py-5 shadow-lg md:shadow-none'
                  onClick={openEmailDialog}
                >
                  <Mail className='h-4 w-4' /> 이메일 보내기
                </Button>
              ) : null)}
          </div>
        </div>
      }
    >
      <AppHeader>
        <AppHeader.Back />
        <AppHeader.Right>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='hover:bg-foreground/5'
                aria-label='더보기 메뉴'
              >
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='mr-3 p-1.5 shadow-none min-w-fit'
            >
              <DropdownMenuItem
                onClick={() => navigate(`/commissions/${id}/edit`)}
                className='gap-2.5 cursor-pointer px-3 py-1 rounded-lg focus:bg-muted'
              >
                <Pencil className='h-4 w-4 text-muted-foreground shrink-0' />
                <span>수정</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className='my-1.5' />
              <DropdownMenuItem
                onClick={deleteCommission}
                className='gap-2.5 cursor-pointer px-3 py-1 rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive'
              >
                <Trash2 className='h-4 w-4 shrink-0' />
                <span>삭제</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </AppHeader.Right>
      </AppHeader>

      <PageHeader title={song?.title ?? commission.songs?.title ?? commission.title ?? ''} />

      <CommissionStatusProgress status={commission.status} />

      <div className='mb-6'>
        <Card className='border-border/50'>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='font-display font-semibold'>의뢰 정보</h2>
              <button
                className='inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors'
                onClick={viewOriginalImage}
              >
                원본 이미지 보기 <ExternalLink className='h-3 w-3' />
              </button>
            </div>
            <dl className='space-y-3'>
              {Object.keys(COMMISSION_INFO).map(key => {
                const value = () => {
                  if (key === 'version')
                    return commission.version ? `${commission.version} ver.` : '-';
                  if (key === 'created_at')
                    return commission.created_at
                      ? dayjs(commission.created_at).format('YYYY-MM-DD HH:mm')
                      : '-';
                  if (key === 'composer')
                    return commission.songs?.composer ?? commission.composer ?? '-';
                  return commission[key] ?? '-';
                };
                return (
                  <div
                    key={key}
                    className='flex items-center justify-between py-2 border-b border-border/50 last:border-0 gap-10 md:gap-0'
                  >
                    <dt className='text-sm text-muted-foreground shrink-0'>
                      {COMMISSION_INFO[key]}
                    </dt>
                    <dd className='text-sm font-medium truncate'>{value()}</dd>
                  </div>
                );
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

      <Card className='border-border/50 mb-3'>
        <CardContent className='p-5 space-y-3'>
          <a
            href={imslpUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-between w-full rounded-md hover:bg-muted/50 transition-colors'
          >
            <p className='text-sm font-medium'>IMSLP에서 찾기</p>
            <ExternalLink className='h-4 w-4 text-muted-foreground shrink-0' />
          </a>
        </CardContent>
			</Card>
			
      <Card className='border-border/50'>
        <CardContent className='p-5 space-y-3'>
          <button
            type='button'
            onClick={handleTemplateDownload}
            disabled={templateLoading}
            className='flex items-center justify-between w-full rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50'
          >
            <p className='text-sm font-medium'>템플릿 다운받기</p>
            {templateLoading ? (
              <Loader2 className='h-4 w-4 text-muted-foreground animate-spin' />
            ) : (
              <Download className='h-4 w-4 text-muted-foreground shrink-0' />
            )}
          </button>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

const CommissionDetail = () => {
  const { id } = useParams();
  return (
    <ErrorBoundary
      key={id}
      level='page'
    >
      <CommissionDetailContent />
    </ErrorBoundary>
  );
};

export default CommissionDetail;
