import { overlay } from 'overlay-kit';
import { useMutation } from '@tanstack/react-query';
import { commissionMutations } from '@/api/commission/mutations';
import { commissionKeys } from '@/api/commission/queryKeys';
import { queryClient } from '@/utils/query-client';
import { CommissionStatus } from '@/constants/status-config';
import { COMMISSION_STATUS_TRANSLATE } from '@/constants/translate';
import { Commission } from '@/types/commission';
import { cleanTitle } from '@/utils/commission-utils';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import ReceiveAndSendDialog from '@/components/pages/commission/ReceiveAndSendDialog';
import { CompleteDialog } from '@/components/pages/commission/CompleteDialog';
import SendEmailDialog from '@/components/pages/commission/SendEmailDialog';
import CommissionImageDialog from '@/components/pages/commission/CommissionImageDialog';
import DeleteCommissionDialog from '@/components/pages/commission/DeleteCommissionDialog';

const toastMessages: Partial<Record<CommissionStatus, string>> = {
	working: '작업을 시작합니다.',
	complete: '작업이 완료되었습니다.',
};

const commissionStatuses = Object.keys(COMMISSION_STATUS_TRANSLATE);

interface Song {
	english_title?: string | null;
	title?: string | null;
}

export function useCommissionDetailActions(
	id: string,
	commission: Commission | undefined,
	song?: Song | null,
) {
	const { isGuest } = useAuth();

	const { mutate: updateStatus } = useMutation(commissionMutations.updateCommissionStatus());
	const { mutate: updateCommission } = useMutation(commissionMutations.updateCommission());

	const rawTitle = song?.english_title ?? commission?.songs?.title ?? commission?.title ?? '';
	const imslpQuery = [cleanTitle(rawTitle), commission?.songs?.composer ?? commission?.composer]
		.filter(Boolean)
		.join(' ');
	const imslpUrl = `https://www.google.com/search?q=${encodeURIComponent(`site:imslp.org ${imslpQuery}`)}`;

	const currentStatusIndex = commissionStatuses.findIndex((s) => s === commission?.status);
	const nextStatus =
		!commission || commission.status === 'cancelled' || currentStatusIndex < 0
			? null
			: currentStatusIndex < commissionStatuses.length - 1
				? commissionStatuses[currentStatusIndex + 1]
				: null;

	const markDelivered = () => {
		updateCommission(
			{ commissionId: id, input: { is_delivered: true } },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: commissionKeys.detail(id) });
					queryClient.invalidateQueries({ queryKey: commissionKeys.list() });
				},
			},
		);
	};

	const handleTransitionConfirm = () => {
		if (!nextStatus || !commission) return;
		updateStatus(
			{ commissionId: id, status: nextStatus as CommissionStatus, prevStatus: commission.status },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: commissionKeys.detail(id) });
					queryClient.invalidateQueries({ queryKey: commissionKeys.list() });
					toast.success(toastMessages[nextStatus as CommissionStatus] ?? '상태가 변경되었습니다.');
				},
				onError: (e) => {
					toast.error('상태 변경에 실패했습니다.', { description: e.message });
				},
			},
		);
	};

	const openEmailDialog = () => {
		overlay.open(
			(overlayProps) => (
				<SendEmailDialog {...overlayProps} commissionId={id} onDelivered={markDelivered} />
			),
			{ overlayId: 'send-email-dialog' },
		);
	};

	const handleOpenDialog = () => {
		if (!commission) return;
		if (nextStatus === 'working') {
			overlay.open((overlayProps) => (
				<ReceiveAndSendDialog
					{...overlayProps}
					commissionId={id}
					toStatus='working'
					onConfirm={handleTransitionConfirm}
				/>
			));
		} else {
			overlay.open((overlayProps) => (
				<CompleteDialog
					{...overlayProps}
					commission={commission}
					onConfirm={() => {
						handleTransitionConfirm();
						openEmailDialog();
					}}
				/>
			));
		}
	};

	const handleViewOriginalImage = () => {
		if (!commission) return;
		overlay.open(
			(overlayProps) => (
				<CommissionImageDialog
					{...overlayProps}
					date={commission.created_at}
					imageUrl={commission.image_url}
				/>
			),
			{ overlayId: 'original-image-dialog' },
		);
	};

	const handleDelete = () => {
		if (isGuest) {
			toast.error('게스트 모드에서는 의뢰를 삭제할 수 없습니다.');
			return;
		}
		overlay.open(
			(overlayProps) => (
				<DeleteCommissionDialog {...overlayProps} commissionId={id} />
			),
			{ overlayId: 'delete-commission-dialog' },
		);
	};

	return {
		imslpUrl,
		currentStatusIndex,
		nextStatus,
		handleOpenDialog,
		openEmailDialog,
		handleViewOriginalImage,
		handleDelete,
	};
}
