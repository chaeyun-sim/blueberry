import { CheckCircle, LucideIcon } from 'lucide-react';
import Button from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CommissionStatus } from '@/constants/status-config';
import { OverlayProps } from '@/types/overlay';

interface TransitionConfig {
  title: string;
  description: string;
  acceptLabel: string;
  icon: LucideIcon;
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
  toStatus: CommissionStatus;
  onConfirm: () => void;
}

export function ReceiveAndSendDialog({
  isOpen,
  close,
  toStatus,
  onConfirm,
}: ReceiveAndSendDialogProps) {
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