import Button from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { commissionMutations } from '@/api/commission/mutations';
import { commissionKeys } from '@/api/commission/queryKeys';
import { queryClient } from '@/utils/query-client';
import { CommissionStatus } from '@/constants/status-config';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { OverlayProps } from '@/types/overlay';

interface CancelCommissionDialogProps extends Partial<OverlayProps> {
	commissionId: string;
	prevStatus: CommissionStatus;
}

export function CancelCommissionDialog({
	isOpen,
	close,
	commissionId,
	prevStatus,
}: CancelCommissionDialogProps) {
	const navigate = useNavigate();
	const { mutate: updateStatus } = useMutation(commissionMutations.updateCommissionStatus());

	const handleConfirm = () => {
		updateStatus(
			{ commissionId, status: 'cancelled', prevStatus },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: commissionKeys.detail(commissionId) });
					queryClient.invalidateQueries({ queryKey: commissionKeys.list() });
					toast.success('의뢰가 취소되었습니다.');
					close();
					navigate(`/commissions/${commissionId}`);
				},
				onError: (e) => {
					toast.error('취소에 실패했습니다.', { description: e.message });
				},
			},
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>의뢰를 취소하시겠습니까?</DialogTitle>
					<DialogDescription>
						취소된 의뢰는 목록의 '취소' 탭에서 확인할 수 있습니다. 취소 후에도 기록은 유지됩니다.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant='outline' onClick={close}>
						닫기
					</Button>
					<Button
						className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
						onClick={handleConfirm}
					>
						취소 처리
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
