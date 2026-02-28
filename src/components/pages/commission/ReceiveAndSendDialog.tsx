import { useState } from 'react';
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
import { Image, Mail, CheckCircle } from 'lucide-react';
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
      const { error } = await supabase.functions.invoke('send-score-email', {
        body: { commissionId },
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

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button
            onClick={toStatus === 'delivered' ? handleEmailConfirm : handleConfirm}
            className='gap-2'
            disabled={isSending}
          >
            {Icon && <Icon className='h-4 w-4' />}
            {isSending ? '발송 중...' : config.acceptLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReceiveAndSendDialog;
