import { useDeferredValue, useMemo } from 'react';
import { CommissionStatus } from '@/constants/status-config';
import { commissionQueries } from '@/features/commission/api';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { DateRange, getDateRangeBounds } from '../utils/commission-utils';
import { PAGE_SIZE,tabs } from './use-commission-ui';

interface CommissionDataFilters {
	filter: CommissionStatus;
	search: string;
	sortDir: 'asc' | 'desc' | null;
	dateRange: DateRange;
	page: number;
	categoryId: string | null;
}

export function useCommissionData({ filter, search, sortDir, dateRange, page, categoryId }: CommissionDataFilters) {
	const deferredSearch = useDeferredValue(search);

	const commissionsQuery = useQuery(commissionQueries.getCommissions());
	const commissions = useMemo(() => commissionsQuery.data ?? [], [commissionsQuery.data]);

	const currentTabLabel = tabs.find((t) => t.value === filter)?.label ?? '의뢰';

	const counts = useMemo(
		() =>
			tabs.reduce(
				(acc, tab) => {
					acc[tab.value] = commissions.filter((c) => c.status === tab.value).length;
					return acc;
				},
				{} as Record<CommissionStatus, number>,
			),
		[commissions],
	);

	const filtered = useMemo(() => {
		const dateRangeBounds = getDateRangeBounds(dateRange);
		return commissions
			.filter((c) => {
				if (c.status !== filter) return false;
				if (categoryId && c.category_id !== categoryId) return false;
				if (dateRangeBounds && (c.deadline < dateRangeBounds.from || c.deadline > dateRangeBounds.to)) return false;
				if (deferredSearch) {
					const q = deferredSearch.toLowerCase();
					const title = (c.songs?.title ?? c.title ?? '').toLowerCase();
					const composer = (c.songs?.composer ?? c.composer ?? '').toLowerCase();
					const arrangement = (c.arrangement ?? '').toLowerCase();
					if (!title.includes(q) && !composer.includes(q) && !arrangement.includes(q)) return false;
				}
				return true;
			})
			.sort((a, b) => {
				// 완료 탭에서는 이메일 미발송(is_delivered=false) 건을 항상 위로
				if (filter === 'complete' && a.is_delivered !== b.is_delivered) {
					return a.is_delivered ? 1 : -1;
				}
				if (!sortDir) return 0;
				const cmp = a.deadline < b.deadline ? -1 : a.deadline > b.deadline ? 1 : 0;
				return sortDir === 'asc' ? cmp : -cmp;
			});
	}, [commissions, filter, deferredSearch, dateRange, sortDir, categoryId]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

	return {
		commissionsQuery,
		currentTabLabel,
		counts,
		filtered,
		paged,
		totalPages,
		safePage,
	};
}
