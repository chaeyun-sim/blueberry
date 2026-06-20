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
import Button from '@/components/ui/button';
import { Image, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { OverlayProps } from '@/types/overlay';

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

  const config = transitionConfigs[toStatus];
  if (!config) return null;

  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
    close();
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
          <Button onClick={handleConfirm} className='gap-2'>
            {Icon && <Icon className='h-4 w-4' />}
            {config.acceptLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReceiveAndSendDialog;
