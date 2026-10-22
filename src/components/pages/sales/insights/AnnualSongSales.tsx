import { useQueries } from '@tanstack/react-query';
import { ArrowDownUp, BarChart3 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { statsQueries } from '@/api/stats/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { cn } from '@/lib/utils';
import { normalizeSalesTitle } from '@/utils/normalize-sales-title';
import { splitProduct } from '@/utils/split-product';

function AnnualSongSales() {
	const { data: yearRange } = useQuery(statsQueries.getSalesYearRange());
	const { data: aggregatedSales = [], isError: aggregationFailed } = useQuery(
		statsQueries.getYearlySongSales(),
	);
	const useRawFallback = aggregationFailed || (!!yearRange && aggregatedSales.length === 0);

	const years = useMemo(() => {
		if (!yearRange) return [];
		return Array.from(
			{ length: yearRange.max - yearRange.min + 1 },
			(_, index) => yearRange.max - index,
		);
	}, [yearRange]);

	// 연도별 RPC가 아직 배포되지 않은 환경에서도 전체 보기와 같은 원본 데이터로 표시한다.
	const rawSalesQueries = useQueries({
		queries: years.map((year) => ({
			...statsQueries.getSalesRows(year),
			enabled: useRawFallback,
		})),
	});
	const rawSales = useRawFallback
		? rawSalesQueries.flatMap((query, index) =>
				(query.data ?? []).flatMap((row) => {
					const { song } = splitProduct(row.product);
					if (!song) return [];
					return song ? [{ year: years[index], title: song, variant: '', sales: 1 }] : [];
				}),
			)
		: aggregatedSales;
	// RPC가 분리해 준 버전·이조 표기를 다시 붙여 원본 상품명과 같은 기준으로 정규화한다.
	const sales = rawSales.map((row) => ({
		...row,
		title: normalizeSalesTitle(row.variant ? `${row.title} ${row.variant}` : row.title),
	}));

	const [sortBy, setSortBy] = useState<number | 'total' | 'title'>('total');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

	const toggleSort = (nextSortBy: number | 'total' | 'title') => {
		if (sortBy === nextSortBy) {
			setSortDirection((direction) => (direction === 'desc' ? 'asc' : 'desc'));
			return;
		}
		setSortBy(nextSortBy);
		setSortDirection('desc');
	};

	const songs = useMemo(() => {
		const totals = new Map<string, number>();
		for (const row of sales) totals.set(row.title, (totals.get(row.title) ?? 0) + row.sales);
		return [...totals.entries()].sort(([, a], [, b]) => b - a).map(([title]) => title);
	}, [sales]);

	const salesByYearAndSong = useMemo(() => {
		const result = new Map<string, number>();
		for (const row of sales) {
			const key = `${row.year}-${row.title}`;
			result.set(key, (result.get(key) ?? 0) + row.sales);
		}
		return result;
	}, [sales]);

	const sortedSongs = useMemo(
		() => [...songs].sort((a, b) => {
			if (sortBy === 'title') {
				return a.localeCompare(b, 'ko') * (sortDirection === 'desc' ? -1 : 1);
			}
			const aValue = sortBy === 'total'
				? years.reduce((sum, year) => sum + (salesByYearAndSong.get(`${year}-${a}`) ?? 0), 0)
				: salesByYearAndSong.get(`${sortBy}-${a}`) ?? 0;
			const bValue = sortBy === 'total'
				? years.reduce((sum, year) => sum + (salesByYearAndSong.get(`${year}-${b}`) ?? 0), 0)
				: salesByYearAndSong.get(`${sortBy}-${b}`) ?? 0;
			return (bValue - aValue) * (sortDirection === 'desc' ? 1 : -1) || a.localeCompare(b);
		}),
		[songs, sortBy, sortDirection, years, salesByYearAndSong],
	);

	return (
		<Card className='border-border/50 overflow-hidden'>
			<CardHeader className='pb-2'>
				<CardTitle className='text-base font-display flex items-center gap-2'>
					<BarChart3 className='h-4 w-4' />
					연도별 작품 판매 수
				</CardTitle>
				<p className='text-xs text-muted-foreground'>연도별로 작품이 몇 건 판매됐는지 확인할 수 있어요</p>
			</CardHeader>
			<CardContent>
				{songs.length === 0 ? (
					<p className='text-sm text-muted-foreground py-6 text-center'>
						데이터가 없습니다. 매출 데이터를 업로드하면 작품별 판매 수를 확인할 수 있어요.
					</p>
				) : (
					<div className='overflow-x-auto rounded-lg border border-border/50'>
						<table className='w-full min-w-[620px] text-sm'>
							<thead className='bg-muted/30 text-xs text-muted-foreground'>
				<tr>
									<th className='sticky left-0 z-10 bg-muted/30 px-4 py-3 text-left font-medium'>
										<button type='button' className='inline-flex items-center gap-1 hover:text-foreground' onClick={() => toggleSort('title')}>
											작품 <ArrowDownUp className='h-3 w-3' />
										</button>
									</th>
									{years.map((year) => (
										<th key={year} className='px-4 py-3 text-right whitespace-nowrap'>
											<button type='button' className='inline-flex items-center gap-1 font-medium hover:text-foreground' onClick={() => toggleSort(year)}>
												{year}년 <ArrowDownUp className='h-3 w-3' />
											</button>
										</th>
									))}
									<th className='px-4 py-3 text-right whitespace-nowrap'>
										<button type='button' className='inline-flex items-center gap-1 font-semibold hover:text-foreground' onClick={() => toggleSort('total')}>
											전체 <ArrowDownUp className='h-3 w-3' />
										</button>
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-border/40'>
								{sortedSongs.map((song, index) => {
									const total = years.reduce((sum, year) => sum + (salesByYearAndSong.get(`${year}-${song}`) ?? 0), 0);
									return (
										<tr key={song} className='hover:bg-muted/20'>
											<td className={cn('sticky left-0 z-10 px-4 py-3 bg-card font-medium', index === 0 && 'font-semibold')}>
												<span className='mr-2 text-xs text-muted-foreground'>{index + 1}</span>{song}
											</td>
											{years.map((year) => <td key={year} className='px-4 py-3 text-right tabular-nums'>{salesByYearAndSong.get(`${year}-${song}`) ?? 0}건</td>)}
											<td className='px-4 py-3 text-right font-semibold tabular-nums'>{total}건</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export default AnnualSongSales;
