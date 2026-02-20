import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, ChevronRight, ExternalLink, LucideProps, Music2, Package2, Truck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { COMMISSION_STATUS_TRANSLATE } from '@/constants/translate';
import { mockCommissionDetail, mockCommissions } from '@/mock/commission';
import { overlay } from 'overlay-kit';
import ReceiveAndSendDialog from '@/components/pages/commission/ReceiveAndSendDialog';
import { CompleteDialog } from '@/components/pages/commission/CompleteDialog';
import { toast } from '@/hooks/use-toast';
import CommissionImageDialog from '@/components/pages/commission/CommissionImageDialog';
import { CommissionStatus } from '@/components/StatusBadge';

const commissionInfo = {
  arrangement: '편성',
  version: '버전',
  createdAt: '등록일',
  deadline: '마감일',
};

const statusProgress: Record<CommissionStatus, React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>> = {
  received: Package2,
  working: Music2,
  complete: CheckCircle,
  delivered: Truck,
}

const CommissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const commission = mockCommissions.find(commission => commission.id === id);
  const commissionDetail = {...mockCommissionDetail, id, ...commission};

  const [detail, setDetail] = useState(commissionDetail);

  const commissionStatuses = Object.keys(COMMISSION_STATUS_TRANSLATE);
  const currentStatusIndex = commissionStatuses.findIndex(status => status === detail.status);

  const nextStatus =
    currentStatusIndex < commissionStatuses.length - 1
      ? commissionStatuses[currentStatusIndex + 1]
      : null;

  const toastMessages: Partial<Record<CommissionStatus, string>> = {
    working: '작업을 시작합니다.',
    complete: '작업이 완료되었습니다.',
    delivered: '의뢰인에게 전달되었습니다.',
  };

  const handleTransitionConfirm = (file?: File) => {
    // TODO: 실제 상태 전환 API 연동
    setDetail(prev => ({ ...prev, status: nextStatus as CommissionStatus }));
    toast({ title: toastMessages[nextStatus as CommissionStatus] ?? '상태가 변경되었습니다.' });
  };

  const handleReject = () => {
    // TODO: 작업 거부 로직 구현
    toast({ title: '작업 거부되었습니다.' })
  };

  const handleOpenDialog = () => {
    if (nextStatus === 'working' || nextStatus === 'delivered') {
      overlay.open(
        overlayProps => (
          <ReceiveAndSendDialog
            {...overlayProps}
            fromStatus={detail.status}
            toStatus={nextStatus as CommissionStatus}
            onReject={handleReject}
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
          date={detail.createdAt}
        />
      ),
      { overlayId: 'original-image-dialog' },
    );
  };

  return (
    <AppLayout
      bottomBar={
        <div className='border-t border-border bg-background/95 backdrop-blur-sm'>
          <div className='px-6 py-3 flex justify-end'>
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
      <div className='mb-6'>
        <Button
          variant='ghost'
          className='gap-2 hover:bg-foreground/5 text-muted-foreground'
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className='h-4 w-4' /> 뒤로
        </Button>
      </div>

      <PageHeader title={detail.title} />

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
                    i < Object.keys(originArray).length - 1 ? 'flex-1' : '',
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
              {Object.keys(commissionInfo).map(key => (
                <div
                  key={key}
                  className='flex items-center justify-between py-2 border-b border-border/50 last:border-0'
                >
                  <dt className='text-sm text-muted-foreground'>{commissionInfo[key]}</dt>
                  <dd className='text-sm font-medium'>{(key === 'version' ? `${detail[key]} ver.` : detail[key]) || '-'}</dd>
                </div>
              ))}
            </dl>
            {detail.notes && (
              <div className='mt-4 p-3 rounded-lg bg-muted/50'>
                <p className='text-sm text-muted-foreground'>{detail.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Linked Scores */}
      <Card className='border-border/50'>
        <CardContent className='p-5'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='font-display font-semibold'>연결된 악보</h2>
          </div>
          {detail.linkedScores.length > 0 ? (
            <div className='space-y-3'>
              {detail.linkedScores.map(score => (
                <div
                  key={score.id}
                  className='flex flex-col p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer'
                >
                  <p className='font-medium'>{score.arrangement}</p>
                  {score.version && <p className='text-sm text-muted-foreground'>{score.version} ver.</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground text-center py-8'>연결된 악보가 없습니다</p>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default CommissionDetail;
