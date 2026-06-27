import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { DragEvent,useState } from 'react';
import { toast } from 'sonner';
import { commissionKeys,commissionMutations } from '@/features/commission/api';
import { CommissionForCalendar } from '@/utils/calendar';
import { queryClient } from '@/utils/query-client';

export function useCalendarDragDrop(commissions: CommissionForCalendar[]) {
	const [draggingId, setDraggingId] = useState<string | null>(null);
	const [dragOverDate, setDragOverDate] = useState<string | null>(null);

	const { mutate: updateDeadline } = useMutation(commissionMutations.updateCommission());

	const handleDragStart = (e: DragEvent<HTMLButtonElement>, id: string) => {
		const commission = commissions.find((c) => c.id === id);
		if (commission?.status === 'complete' || commission?.status === 'cancelled') {
			e.preventDefault();
			return;
		}
		e.dataTransfer.effectAllowed = 'move';
		setDraggingId(id);
	};

	const handleDragOver = (e: DragEvent<HTMLDivElement>, dateStr: string) => {
		if (!draggingId) return;
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		setDragOverDate(dateStr);
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>, dateStr: string) => {
		e.preventDefault();
		if (!draggingId) return;
		const commission = commissions.find((c) => c.id === draggingId);
		if (commission && dayjs(commission.deadline).format('YYYY-MM-DD') !== dateStr) {
			updateDeadline(
				{ commissionId: draggingId, input: { deadline: dateStr } },
				{
					onSuccess: () => {
						queryClient.invalidateQueries({ queryKey: commissionKeys.list() });
						toast.success('마감일이 변경되었습니다.');
					},
					onError: () => toast.error('마감일 변경에 실패했습니다.'),
				},
			);
		}
		setDraggingId(null);
		setDragOverDate(null);
	};

	const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
		if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverDate(null);
	};

	const handleDragEnd = () => {
		setDraggingId(null);
		setDragOverDate(null);
	};

	return {
		draggingId,
		dragOverDate,
		handleDragStart,
		handleDragOver,
		handleDrop,
		handleDragLeave,
		handleDragEnd,
	};
}
