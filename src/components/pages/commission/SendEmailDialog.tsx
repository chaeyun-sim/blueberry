import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Label from '@/components/ui/label';
import { Mail, Loader2 } from 'lucide-react';
import { OverlayProps } from '@/types/overlay';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

interface SendEmailDialogProps extends OverlayProps {
  commissionId: string | undefined;
  onDelivered?: () => void;
}

function SendEmailDialog({ isOpen, close, commissionId, onDelivered }: SendEmailDialogProps) {
  const { isGuest } = useAuth();

  const [isSending, setIsSending] = useState(false);
  const [toEmail, setToEmail] = useState('');
  const [progress, setProgress] = useState(0);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasSendingRef = useRef(false);
  const isSendingRef = useRef(false);

  useEffect(() => {
    if (isSending) {
      wasSendingRef.current = true;
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
      if (wasSendingRef.current) {
        wasSendingRef.current = false;
        setProgress(100);
        timeoutRef.current = setTimeout(() => setProgress(0), 600);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isSending]);

  const handleSend = async () => {
    if (isGuest) {
      toast.error('게스트 모드에서는 메일을 발송할 수 없습니다.');
      return;
    }
    if (isSendingRef.current) return;
    if (!commissionId) {
      toast.error('의뢰를 찾을 수 없어 메일을 보낼 수 없어요.');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('로그인이 필요해요.');
      return;
    }

    isSendingRef.current = true;
    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-score-email', {
        body: { commissionId, toEmail: toEmail || undefined },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      toast.success('메일을 발송했어요!');
      onDelivered?.();
      close();
    } catch (e) {
      const message = e instanceof Error ? e.message : '알 수 없는 오류';
      toast.error('메일 발송에 실패했어요', { description: message });
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && close()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 font-display'>
            <Mail className='h-4 w-4' /> 이메일 발송
          </DialogTitle>
          <DialogDescription>
            저장된 악보와 오디오 파일을 ZIP으로 압축해 메일로 발송합니다.
          </DialogDescription>
        </DialogHeader>

        {!isSending && (
          <div className='space-y-1.5'>
            <Label htmlFor='recipient-email'>수신자 이메일</Label>
            <Input
              id='recipient-email'
              type='email'
              placeholder='example@email.com'
              value={toEmail}
              onChange={e => setToEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
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
            <p className='text-xs text-muted-foreground text-center'>
              파일을 ZIP으로 압축하고 메일을 발송하고 있어요...
            </p>
          </div>
        )}

        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={close} disabled={isSending}>
            나중에
          </Button>
          <Button
            onClick={handleSend}
            className='gap-2'
            disabled={isSending || !commissionId}
          >
            {isSending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Mail className='h-4 w-4' />
            )}
            {isSending ? '발송 중...' : '메일 보내기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SendEmailDialog;
