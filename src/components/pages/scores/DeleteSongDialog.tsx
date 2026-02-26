import { OverlayProps } from '@/types/overlay';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteSongDialogProps extends OverlayProps {
  songTitle: string;
  arrangementCount: number;
  onConfirm: () => void;
}

function DeleteSongDialog({ isOpen, close, songTitle, arrangementCount, onConfirm }: DeleteSongDialogProps) {
  const handleDelete = () => {
    onConfirm();
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) close(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>악보를 삭제하시겠습니까?</DialogTitle>
          <DialogDescription>
            <strong>{songTitle}</strong>을(를) 삭제하면 연결된 편성 {arrangementCount}개도 함께 접근할 수 없게 됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={close}>취소</Button>
          <Button
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteSongDialog;
