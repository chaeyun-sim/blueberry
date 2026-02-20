import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { OverlayProps } from '@/types/overlay';
import logoImg from '@/assets/logo.png';

interface CommissionImageDialogProps extends OverlayProps {
	date: string;
}

function CommissionImageDialog({
  isOpen,
	close,
	date,
}: CommissionImageDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) close();
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 font-display'>
            의뢰 캡쳐 이미지
          </DialogTitle>
          <DialogDescription>
						{date}
          </DialogDescription>
        </DialogHeader>

        <div className='h-full w-full rounded-lg border border-border aspect-square'>
          <img
            src={logoImg}
            alt='commission image'
            className='w-full h-full object-cover'
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CommissionImageDialog;