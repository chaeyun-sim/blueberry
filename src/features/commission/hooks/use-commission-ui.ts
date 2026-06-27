import { useEffect,useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CommissionStatus } from '@/constants/status-config';
import { DateRange } from '../utils/commission-utils';

export const tabs: { label: string; value: CommissionStatus }[] = [
	{ label: '대기', value: 'received' },
	{ label: '작업중', value: 'working' },
	{ label: '완료', value: 'complete' },
	{ label: '취소', value: 'cancelled' },
];

export const PAGE_SIZE = 15;

export function useCommissionUI() {
	const [searchParams, setSearchParams] = useSearchParams();
	const statusParam = searchParams.get('status');
	const filter = (tabs.some((t) => t.value === statusParam) ? statusParam : 'received') as CommissionStatus;

	const [search, setSearch] = useState('');
	const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);
	const [dateRange, setDateRange] = useState<DateRange>('all');
	const [categoryId, setCategoryId] = useState<string | null>(null);
	const [page, setPage] = useState(1);

	useEffect(() => { setPage(1); }, [filter, search, dateRange, sortDir, categoryId]);

	const toggleSort = () => setSortDir((d) => (d === null ? 'asc' : d === 'asc' ? 'desc' : null));
	const setFilter = (status: CommissionStatus) => setSearchParams({ status });

	return { filter, setFilter, search, setSearch, sortDir, toggleSort, dateRange, setDateRange, categoryId, setCategoryId, page, setPage };
}
