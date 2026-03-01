import { useState, useEffect, useRef } from 'react';
import { CommissionStatus } from '@/constants/status-config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { OverlayProps } from '@/types/overlay';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface TransitionConfig {
  title: string;
  description: string;
  acceptLabel: string;
  icon: typeof Image;
}

const transitionConfigs: Record<string, TransitionConfig> = {
  working: {
    title: '의뢰 승낙',
    description: '의뢰를 승낙할지 거부할지 결정해주세요.',
    acceptLabel: '작업 시작',
    icon: CheckCircle,
  },
  delivered: {
    title: '작업물을 전달하시겠습니까?',
    description: '저장된 악보와 오디오 파일을 담당자 메일로 발송합니다.',
    acceptLabel: '메일 보내기',
    icon: Mail,
  },
};

interface ReceiveAndSendDialogProps extends OverlayProps {
  commissionId: string | undefined;
  toStatus: CommissionStatus;
  onConfirm: () => void;
}

function ReceiveAndSendDialog({
  isOpen,
  close,
  commissionId,
  toStatus,
  onConfirm,
}: ReceiveAndSendDialogProps) {
  const [isSending, setIsSending] = useState(false);
  const [toEmail, setToEmail] = useState('');
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isSending) {
      setProgress(0);
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 85) {
            clearInterval(intervalRef.current!);
            return 85;
          }
          return p + Math.random() * 8;
        });
      }, 400);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progress > 0) {
        setProgress(100);
        setTimeout(() => setProgress(0), 600);
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isSending]);

  const config = transitionConfigs[toStatus];
  if (!config) return null;

  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
    close();
  };

  const handleEmailConfirm = async () => {
    if (!commissionId) return;

    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke('send-score-email', {
        body: { commissionId, toEmail: toEmail || undefined },
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });
      if (error) throw error;

      toast.success('메일을 발송했어요!');
      onConfirm();
      close();
    } catch (e) {
      const message = e instanceof Error ? e.message : '알 수 없는 오류';
      toast.error('메일 발송에 실패했어요', { description: message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 font-display'>
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        {toStatus === 'delivered' && !isSending && (
          <div className='space-y-1.5'>
            <Label htmlFor='recipient-email'>수신자 이메일</Label>
            <Input
              id='recipient-email'
              type='email'
              placeholder='example@email.com'
              value={toEmail}
              onChange={e => setToEmail(e.target.value)}
              disabled={isSending}
            />
          </div>
        )}

        {isSending && (
          <div className='space-y-1.5'>
            <div className='h-1.5 w-full rounded-full bg-muted overflow-hidden'>
              <div
                className='h-full bg-primary rounded-full transition-all duration-500 ease-out'
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className='text-xs text-muted-foreground text-center'>파일을 ZIP으로 압축하고 메일을 발송하고 있어요...</p>
          </div>
        )}

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button
            onClick={toStatus === 'delivered' ? handleEmailConfirm : handleConfirm}
            className='gap-2'
            disabled={isSending}
          >
            {isSending ? <Loader2 className='h-4 w-4 animate-spin' /> : Icon && <Icon className='h-4 w-4' />}
            {isSending ? '발송 중...' : config.acceptLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReceiveAndSendDialog;
