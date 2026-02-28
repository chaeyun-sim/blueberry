import { OverlayProps } from '@/types/overlay';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { scoreMutations } from '@/api/score/mutations';
import { scoreKeys } from '@/api/score/queryKeys';
import { queryClient } from '@/utils/query-client';

interface DeleteArrangementDialogProps extends OverlayProps {
  arrangementId: string;
  songTitle: string;
  arrangement: string;
}

function DeleteArrangementDialog({
  isOpen,
  close,
  arrangementId,
  songTitle,
  arrangement,
}: DeleteArrangementDialogProps) {
  const navigate = useNavigate();

  const { mutate: deleteArrangement, isPending } = useMutation(scoreMutations.deleteArrangement());

  const handleDelete = () => {
    deleteArrangement({ id: arrangementId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: scoreKeys.list() });
        queryClient.invalidateQueries({ queryKey: scoreKeys.arrangement(arrangementId) });
        toast.success('편성이 삭제되었습니다.');
        close();
        navigate('/files', { replace: true });
      },
      onError: (e) => {
        toast.error('삭제에 실패했습니다.', { description: e.message });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) close(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이 편성을 삭제할까요?</DialogTitle>
          <DialogDescription>
            <span className='font-medium text-foreground'>{songTitle} — {arrangement}</span>
            {' '}편성과 모든 파일이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={close} disabled={isPending}>취소</Button>
          <Button
            onClick={handleDelete}
            disabled={isPending}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteArrangementDialog;
