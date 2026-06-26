import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { commissionKeys,commissionMutations } from '@/features/commission/api';
import { Commission } from '@/features/commission/types';
import { EditFormType } from '@/types/form';
import { queryClient } from '@/utils/query-client';

export function useCommissionEditForm(commission: Commission | undefined) {
	const navigate = useNavigate();

	const [form, setForm] = useState<EditFormType>({
		title: '',
		composer: '',
		instruments: [],
		version: null,
		deadline: '',
		notes: '',
		status: null,
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { mutate: updateCommission } = useMutation(commissionMutations.updateCommission());

	useEffect(() => {
		if (!commission) return;
		setForm({
			title: commission.title ?? '',
			composer: commission.composer ?? '',
			instruments: commission.arrangement ? commission.arrangement.split(', ') : [],
			version: commission.version ?? null,
			deadline: commission.deadline ?? '',
			notes: commission.notes ?? '',
			status: commission.status,
		});
	}, [commission]);

	const handleSave = (id: string) => {
		setIsSubmitting(true);
		updateCommission(
			{
				commissionId: id,
				input: (({ instruments, ...rest }) => ({
					...rest,
					arrangement: instruments.join(', '),
				}))(form),
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: commissionKeys.detail(id) });
					queryClient.invalidateQueries({ queryKey: commissionKeys.list() });
					setIsSubmitting(false);
					toast.success('의뢰가 수정되었습니다.');
					navigate(-1);
				},
				onError: (e) => {
					setIsSubmitting(false);
					toast.error('의뢰 수정에 실패했습니다.', { description: e.message });
				},
			},
		);
	};

	return { form, setForm, isSubmitting, handleSave };
}
