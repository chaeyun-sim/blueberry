import { useMutation } from '@tanstack/react-query';
import { overlay } from 'overlay-kit';
import { toast } from 'sonner';
import { CommissionStatus } from '@/constants/status-config';
import { CommissionImageDialog, CompleteDialog, DeleteCommissionDialog,ReceiveAndSendDialog, SendEmailDialog } from '@/features/commission';
import { commissionKeys,commissionMutations } from '@/features/commission/api';
import { Commission } from '@/features/commission/types';
import { cleanTitle } from '@/features/commission/utils';
import { queryClient } from '@/utils/query-client';

const NEXT_STATUS: Partial<Record<CommissionStatus, CommissionStatus>> = {
	received: 'working',
	working: 'complete',
};

const toastMessages: Partial<Record<CommissionStatus, string>> = {
	working: '작업을 시작합니다.',
	complete: '작업이 완료되었습니다.',
};

interface Song {
	english_title?: string | null;
	title?: string | null;
}

const invalidateCommission = (id: string) => {
	queryClient.invalidateQueries({ queryKey: commissionKeys.detail(id) });
	queryClient.invalidateQueries({ queryKey: commissionKeys.list() });
};

export function useCommissionDetailActions(
	id: string,
	commission: Commission | undefined,
	song?: Song | null,
) {
	const { mutate: updateStatus } = useMutation(commissionMutations.updateCommissionStatus());
	const { mutate: updateCommission } = useMutation(commissionMutations.updateCommission());

	const rawTitle = song?.english_title ?? commission?.songs?.title ?? commission?.title ?? '';
	const imslpQuery = [cleanTitle(rawTitle), commission?.songs?.composer ?? commission?.composer]
		.filter(Boolean)
		.join(' ');
	const imslpUrl = `https://www.google.com/search?q=${encodeURIComponent(`site:imslp.org ${imslpQuery}`)}`;

	const nextStatus = commission ? (NEXT_STATUS[commission.status] ?? null) : null;
	const canAdvance = nextStatus !== null;

	const markDelivered = () => {
		updateCommission(
			{ commissionId: id, input: { is_delivered: true } },
			{
				onSuccess: () => invalidateCommission(id),
				onError: (e) => {
					toast.error('납품 처리에 실패했습니다.', { description: e.message });
				},
			},
		);
	};

	const handleTransitionConfirm = () => {
		if (!nextStatus || !commission) return;
		updateStatus(
			{ commissionId: id, status: nextStatus, prevStatus: commission.status },
			{
				onSuccess: () => {
					invalidateCommission(id);
					toast.success(toastMessages[nextStatus] ?? '상태가 변경되었습니다.');
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
		overlay.open(
			(overlayProps) => (
				<DeleteCommissionDialog {...overlayProps} commissionId={id} />
			),
			{ overlayId: 'delete-commission-dialog' },
		);
	};

	return {
		imslpUrl,
		canAdvance,
		nextStatus,
		openDialog: handleOpenDialog,
		openEmailDialog,
		viewOriginalImage: handleViewOriginalImage,
		deleteCommission: handleDelete,
	};
}
