import { useMemo, useState } from 'react';
import { ExcelRow } from '@/types/excel';
import { MOBILE_BREAKPOINT } from '@/constants/breakpoints';

export type SortKey = 'category' | 'product' | 'amount';
export type SortDir = 'asc' | 'desc';

export function useSalesTableData(originData: ExcelRow[]) {
	const [sortKey, setSortKey] = useState<SortKey>('category');
	const [sortDir, setSortDir] = useState<SortDir>('asc');
	const [filterCategory, setFilterCategory] = useState('ALL');
	const [groupByCategory, setGroupByCategory] = useState(true);
	const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

	const toggleGroup = (category: string) => {
		setCollapsedGroups((prev) => {
			const next = new Set(prev);
			if (next.has(category)) next.delete(category);
			else next.add(category);
			return next;
		});
	};

	const toggleSort = (key: SortKey) => {
		if (sortKey === key) {
			setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortKey(key);
			setSortDir('asc');
		}
	};

	const categories = useMemo(
		() => ['ALL', ...Array.from(new Set(originData.map((r) => r.category).filter(Boolean)))],
		[originData],
	);

	const sortedData = useMemo(() => {
		let data = [...originData];
		if (filterCategory !== 'ALL') {
			data = data.filter((r) => r.category === filterCategory);
		}
		data.sort((a, b) => {
			if (groupByCategory && sortKey !== 'category') {
				const catCmp = a.category.localeCompare(b.category, 'ko');
				if (catCmp !== 0) return catCmp;
			}
			const aVal = a[sortKey];
			const bVal = b[sortKey];
			const cmp =
				typeof aVal === 'number'
					? aVal - (bVal as number)
					: String(aVal).localeCompare(String(bVal), 'ko');
			return sortDir === 'asc' ? cmp : -cmp;
		});
		return data;
	}, [sortKey, sortDir, filterCategory, groupByCategory, originData]);

	const isMobile = typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
	const displayData = isMobile ? sortedData.slice(0, 6) : sortedData;

	const groupedData = useMemo(() => {
		if (!groupByCategory) return null;
		const groups: Record<string, typeof originData> = {};
		displayData.forEach((row) => {
			if (!groups[row.category]) groups[row.category] = [];
			groups[row.category].push(row);
		});
		return groups;
	}, [displayData, groupByCategory]);

	return {
		sortKey,
		sortDir,
		filterCategory,
		setFilterCategory,
		groupByCategory,
		setGroupByCategory,
		collapsedGroups,
		toggleGroup,
		toggleSort,
		categories,
		sortedData,
		displayData,
		groupedData,
	};
}
