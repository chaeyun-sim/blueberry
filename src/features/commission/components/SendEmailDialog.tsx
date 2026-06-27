import { Loader2, Mail, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Label from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { OverlayProps } from '@/types/overlay';

const RECENT_EMAILS_KEY = 'recent-email-recipients';
const MAX_RECENT = 5;

const getRecentEmails = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_EMAILS_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const saveRecentEmail = (email: string) => {
  if (!email) return;
  const recent = getRecentEmails().filter(e => e !== email);
  recent.unshift(email);
  localStorage.setItem(RECENT_EMAILS_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
};

interface SendEmailDialogProps extends OverlayProps {
  commissionId: string | undefined;
  songTitle?: string;
  onDelivered?: () => void;
}

export function SendEmailDialog({ isOpen, close, commissionId, songTitle = '', onDelivered }: SendEmailDialogProps) {
  const defaultSubject = `[신청곡] ${songTitle}`;
  const defaultBody = `안녕하세요!\n${songTitle} 신청곡 보내드립니다.\n이상 있으면 알려주세요!\n감사합니다. :)`;

  const [isSending, setIsSending] = useState(false);
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [progress, setProgress] = useState(0);
  const [recentEmails, setRecentEmails] = useState<string[]>([]);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasSendingRef = useRef(false);
  const isSendingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setToEmail('');
      setSubject(defaultSubject);
      setBody(defaultBody);
      setRecentEmails(getRecentEmails());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
        body: {
          commissionId,
          toEmail: toEmail || undefined,
          subject: subject || defaultSubject,
          emailBody: body || defaultBody,
        },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      saveRecentEmail(toEmail);
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
          <div className='space-y-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='recipient-email'>수신자 이메일</Label>
              <Input
                id='recipient-email'
                type='email'
                placeholder='example@email.com'
                value={toEmail}
                onChange={e => setToEmail(e.target.value)}
              />
              {recentEmails.length > 0 && (
                <div className='flex flex-wrap gap-1.5 pt-0.5'>
                  {recentEmails.map(email => (
                    <button
                      key={email}
                      type='button'
                      onClick={() => setToEmail(email)}
                      className='flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors'
                    >
                      {email}
                      <X
                        className='h-2.5 w-2.5 hover:text-destructive'
                        onClick={e => {
                          e.stopPropagation();
                          const updated = recentEmails.filter(r => r !== email);
                          setRecentEmails(updated);
                          localStorage.setItem(RECENT_EMAILS_KEY, JSON.stringify(updated));
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='email-subject'>제목</Label>
              <Input
                id='email-subject'
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder='이메일 제목'
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='email-body'>내용</Label>
              <Textarea
                id='email-body'
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={5}
                className='resize-none text-sm'
              />
            </div>
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
