import { useState, useDeferredValue, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { commissionQueries } from '@/api/commission/queries';
import { CommissionStatus } from '@/constants/status-config';
import { DateRange, getDateRangeBounds, getPaginationPages } from '@/utils/commission-utils';

const tabs: { label: string; value: CommissionStatus }[] = [
	{ label: '대기', value: 'received' },
	{ label: '작업중', value: 'working' },
	{ label: '완료', value: 'complete' },
	{ label: '취소', value: 'cancelled' },
];

const PAGE_SIZE = 15;

export { tabs, PAGE_SIZE };

export function useCommissionListFilters() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const statusParam = searchParams.get('status');
	const filter = (tabs.some((t) => t.value === statusParam) ? statusParam : 'received') as CommissionStatus;

	const [search, setSearch] = useState('');
	const deferredSearch = useDeferredValue(search);
	const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);
	const [dateRange, setDateRange] = useState<DateRange>('all');
	const [page, setPage] = useState(1);

	useEffect(() => { setPage(1); }, [filter, deferredSearch, dateRange, sortDir]);

	const { data: commissions = [], isLoading, isFetching, isError, refetch } =
		useQuery(commissionQueries.getCommissions());

	const currentTabLabel = tabs.find((t) => t.value === filter)?.label ?? '의뢰';

	const counts = tabs.reduce((acc, tab) => {
		acc[tab.value] = commissions.filter((c) => c.status === tab.value).length;
		return acc;
	}, {} as Record<CommissionStatus, number>);

	const dateRangeBounds = getDateRangeBounds(dateRange);

	const filtered = commissions
		.filter((c) => {
			if (c.status !== filter) return false;
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
			if (!sortDir) return 0;
			const cmp = a.deadline < b.deadline ? -1 : a.deadline > b.deadline ? 1 : 0;
			return sortDir === 'asc' ? cmp : -cmp;
		});

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

	const toggleSort = () => setSortDir((d) => (d === null ? 'asc' : d === 'asc' ? 'desc' : null));

	return {
		navigate,
		filter,
		setSearchParams,
		search,
		setSearch,
		deferredSearch,
		sortDir,
		toggleSort,
		dateRange,
		setDateRange,
		page,
		setPage,
		commissions,
		isLoading,
		isFetching,
		isError,
		refetch,
		currentTabLabel,
		counts,
		filtered,
		paged,
		totalPages,
		safePage,
		getPaginationPages,
	};
}
