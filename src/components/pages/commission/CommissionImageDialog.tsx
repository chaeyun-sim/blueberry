import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { OverlayProps } from '@/types/overlay';
import logo from '@/assets/logo.png';
import dayjs from 'dayjs';

interface CommissionImageDialogProps extends OverlayProps {
  date: string;
  imageUrl: string | null | undefined;
}

function CommissionImageDialog({
  isOpen,
	close,
	date,
  imageUrl,
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
						{date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'}
          </DialogDescription>
        </DialogHeader>

        <div className='h-full w-full rounded-md border border-border overflow-hidden'>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt='commission kakao talk'
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='flex flex-col items-center justify-center gap-3 py-10 bg-muted/30'>
              <img src={logo} alt='blueberry logo' className='w-20 h-20 opacity-60' />
              <p className='text-xs text-muted-foreground'>이미지가 없습니다 🫐</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CommissionImageDialog;