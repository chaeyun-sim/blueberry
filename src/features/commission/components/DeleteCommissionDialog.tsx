import { useNavigate } from 'react-router-dom';

import { useMutation } from '@tanstack/react-query';
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
import { commissionKeys,commissionMutations } from '@/features/commission/api';
import { OverlayProps } from '@/types/overlay';
import { queryClient } from '@/utils/query-client';

interface DeleteCommissionDialogProps extends OverlayProps {
  commissionId: string;
}

export function DeleteCommissionDialog({ isOpen, close, commissionId }: DeleteCommissionDialogProps) {
	const navigate = useNavigate();
	
	const { mutate: deleteCommission } = useMutation(commissionMutations.deleteCommission())

  const handleDelete = () => {
		deleteCommission({ commissionId }, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: commissionKeys.list() });
				toast.success('의뢰가 삭제되었습니다.');
				close();
				navigate('/commissions');
			},
			onError: (e) => {
				toast.error('의뢰 삭제에 실패했습니다.', {
					description: e.message
				});
			}
		});
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) close();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>의뢰를 삭제하시겠습니까?</DialogTitle>
          <DialogDescription>삭제된 의뢰는 복구할 수 없습니다.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={close}>취소</Button>
          <Button
            onClick={handleDelete}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
