import { useEffect, useRef, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Label from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Pencil, XCircle } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { overlay } from 'overlay-kit';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { COMMISSION_STATUS_TRANSLATE } from '@/constants/translate';
import { commissionQueries } from '@/api/commission/queries';
import { useMutation } from '@tanstack/react-query';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { commissionKeys } from '@/api/commission/queryKeys';
import { commissionMutations } from '@/api/commission/mutations';
import { DifficultyLevelType } from '@/types/commission';
import { queryClient } from '@/utils/query-client';
import { EditFormType } from '@/types/form';
import { CommissionStatus } from '@/constants/status-config';
import { toast } from 'sonner';
import { InstrumentPicker } from '@/components/InstrumentPicker';
import { useAuth } from '@/hooks/use-auth';
import AppHeader from '@/components/layout/AppHeader';

const CommissionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const titleEditRef = useRef<HTMLInputElement>(null);
  const composerEditRef = useRef<HTMLInputElement>(null);
  const { isGuest } = useAuth();

  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [isComposerEditing, setIsComposerEditing] = useState(false);

  const [form, setForm] = useState<EditFormType>({
    title: '',
    instruments: [],
    version: null,
    deadline: '',
    notes: '',
    status: null,
    composer: '',
  });

  const { data: commission, isLoading } = useQuery(commissionQueries.getCommission(id));

  useEffect(() => {
    if (!commission) return;
    setForm({
      title: commission.title ?? '',
      composer: commission.composer ?? '',
      instruments: commission.arrangement ? commission.arrangement.split(', ') : [],
      version: commission.version ?? null,
      deadline: commission.deadline ?? '',
      notes: commission.notes ?? '',
      status: commission.status,
    });
  }, [commission]);

  const commissionStatuses = Object.keys(COMMISSION_STATUS_TRANSLATE);
  const currentStatusIndex = commissionStatuses.findIndex(s => s === commission?.status);
  const prevStatus = currentStatusIndex > 0 ? commissionStatuses[currentStatusIndex - 1] : null;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: updateCommission } = useMutation(commissionMutations.updateCommission());
  const { mutate: updateStatus } = useMutation(commissionMutations.updateCommissionStatus());

  const handleSave = () => {
    if (isGuest) {
      toast.error('게스트 모드에서는 의뢰를 수정할 수 없습니다.');
      return;
    }
    
    if (!id) return;

    setIsSubmitting(true);

    updateCommission(
      {
        commissionId: id,
        input: (({ instruments, ...rest }) => ({ ...rest, arrangement: instruments.join(', ') }))(form),
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: commissionKeys.detail(id) });
          queryClient.invalidateQueries({ queryKey: commissionKeys.list() });
          setIsSubmitting(false);
          toast.success('의뢰가 수정되었습니다.');
          navigate(-1);
        },
        onError: e => {
          setIsSubmitting(false);
          toast.error('의뢰 수정에 실패했습니다.', { description: e.message });
        },
      },
    );
  };

  const handleCancel = () => {
    overlay.open(
      ({ isOpen, close }) => (
        <Dialog open={isOpen} onOpenChange={open => !open && close()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>의뢰를 취소하시겠습니까?</DialogTitle>
              <DialogDescription>
                취소된 의뢰는 목록의 '취소' 탭에서 확인할 수 있습니다. 취소 후에도 기록은 유지됩니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant='outline' onClick={close}>
                닫기
              </Button>
              <Button
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                onClick={() => {
                  if (!id) return;
                  updateStatus(
                    { commissionId: id, status: 'cancelled' },
                    {
                      onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: commissionKeys.detail(id) });
                        queryClient.invalidateQueries({ queryKey: commissionKeys.list() });
                        toast.success('의뢰가 취소되었습니다.');
                        close();
                        navigate(`/commissions/${id}`);
                      },
                      onError: e => {
                        toast.error('취소에 실패했습니다.', { description: e.message });
                      },
                    },
                  );
                }}
              >
                취소 처리
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ),
      { overlayId: 'cancel-commission-dialog' },
    );
  };

  if (!id) return <Navigate to='/commissions' replace />;

  if (isLoading || !commission) return null;

  return (
    <AppLayout
      bottomBar={
        <div className='border-t border-border bg-background/95 backdrop-blur-sm'>
          <div
            className={`px-6 py-3 flex items-center ${prevStatus ? 'justify-between' : 'justify-end'}`}
          >
            <div className='flex gap-2'>
              <Button
                variant='ghost'
                className='text-muted-foreground hover:bg-foreground/5'
                disabled={isSubmitting}
                onClick={() => navigate(-1)}
              >
                수정 취소
              </Button>
              <Button
                onClick={handleSave}
                className='px-6'
                disabled={isSubmitting}
              >
                {isSubmitting ? '수정 중...' : '수정 저장'}
              </Button>
            </div>
          </div>
        </div>
      }
    >
      <AppHeader>
        <AppHeader.Back />
      </AppHeader>

      {/* 인라인 편집 타이틀 */}
      <div className='mb-6'>
        {isTitleEditing ? (
          <input
            ref={titleEditRef}
            value={form.title}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            onBlur={() => setIsTitleEditing(false)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setIsTitleEditing(false); }}
            className='text-2xl font-display font-bold w-full bg-transparent border-b-2 border-primary outline-none pb-0.5 tracking-tight'
            placeholder='곡명을 입력하세요'
          />
        ) : (
          <button
            type='button'
            onClick={() => { setIsTitleEditing(true); setTimeout(() => titleEditRef.current?.focus(), 0); }}
            className='group flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity text-left border-b-2 border-transparent pb-0.5'
            aria-label='곡명 편집'
          >
            <h1 className='text-2xl font-display font-bold tracking-tight'>
              {form.title || <span className='text-muted-foreground font-normal text-xl'>곡명 없음</span>}
            </h1>
            <Pencil className='h-3.5 w-3.5 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity shrink-0' />
          </button>
        )}

        {isComposerEditing ? (
          <input
            ref={composerEditRef}
            value={form.composer}
            onChange={e => setForm(prev => ({ ...prev, composer: e.target.value }))}
            onBlur={() => setIsComposerEditing(false)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setIsComposerEditing(false); }}
            className='mt-1 text-sm text-muted-foreground w-full bg-transparent border-b border-primary outline-none pb-0.5'
            placeholder='작곡가를 입력하세요'
          />
        ) : (
          <button
            type='button'
            onClick={() => { setIsComposerEditing(true); setTimeout(() => composerEditRef.current?.focus(), 0); }}
            className='group flex items-center gap-1.5 mt-1 cursor-pointer hover:opacity-70 transition-opacity text-left border-b border-transparent pb-0.5'
            aria-label='작곡가 편집'
          >
            <p className='text-sm text-muted-foreground'>
              {form.composer || <span className='italic'>작곡가 미입력</span>}
            </p>
            <Pencil className='h-3 w-3 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity shrink-0' />
          </button>
        )}
      </div>

      <Card className='border-border/50 mb-6'>
        <CardContent className='p-5'>
          <h2 className='font-display font-semibold mb-4'>의뢰 정보</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
            {/* 현재 상태 */}
            <div className='space-y-2'>
              <Label>현재 상태</Label>
              <Select
                value={form.status}
                onValueChange={value =>
                  setForm(prev => ({ ...prev, status: value as CommissionStatus }))
                }
                disabled={isSubmitting}
                aria-label='상태 선택'
              >
                <SelectTrigger>
                  <SelectValue placeholder='상태를 선택하세요' />
                </SelectTrigger>
                <SelectContent>
                  {commissionStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {COMMISSION_STATUS_TRANSLATE[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 마감일 */}
            <div className='space-y-2'>
              <Label htmlFor='deadline'>마감일</Label>
              <div className='relative'>
                <Input
                  id='deadline'
                  ref={dateInputRef}
                  type='date'
                  className='pr-9 [&::-webkit-calendar-picker-indicator]:hidden'
                  value={form.deadline}
                  onChange={e => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                  disabled={isSubmitting}
                />
                <button
                  type='button'
                  aria-label='날짜 선택'
                  onClick={() => dateInputRef.current?.showPicker()}
                  className='absolute right-0 top-0 bottom-0 px-3 flex items-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors'
                >
                  <Calendar className='h-4 w-4' />
                </button>
              </div>
            </div>

            {/* 버전 */}
            <div className='space-y-2'>
              <Label>버전</Label>
              <Select
                value={form.version ?? 'normal'}
                onValueChange={value =>
                  setForm(prev => ({
                    ...prev,
                    version: value === 'normal' ? null : (value as DifficultyLevelType),
                  }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder='버전을 선택하세요' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='normal'>-</SelectItem>
                  <SelectItem value='easy'>Easy</SelectItem>
                  <SelectItem value='hard'>Hard</SelectItem>
                  <SelectItem value='pro'>Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 편성 — 전체 너비 */}
            <div className='md:col-span-3'>
              <InstrumentPicker
                instruments={form.instruments}
                onChange={instruments => setForm(prev => ({ ...prev, instruments }))}
                disabled={isSubmitting}
              />
            </div>

            {/* 메모 — 전체 너비 */}
            <div className='space-y-2 md:col-span-3'>
              <Label htmlFor='notes'>메모</Label>
              <Textarea
                id='notes'
                placeholder='추가 요청사항이나 메모...'
                rows={4}
                value={form.notes}
                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {commission.status !== 'cancelled' && (
        <div className='border-t border-border/50 pt-6'>
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>의뢰 취소</p>
              <p className='text-xs text-muted-foreground/70 mt-0.5'>
                취소 후에도 기록은 유지되며 '취소' 탭에서 확인할 수 있습니다.
              </p>
            </div>
            <button
              type='button'
              onClick={handleCancel}
              className='shrink-0 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors cursor-pointer min-h-[44px] px-1'
            >
              <XCircle className='h-4 w-4' />
              취소 처리
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default CommissionEdit;
