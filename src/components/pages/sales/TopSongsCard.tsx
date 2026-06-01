import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format-currency';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { statsQueries } from '@/api/stats/queries';
import { getNetAmount } from '@/utils/getNetAmount';
import TopSongBar from './TopSongBar';

const emptyState = (
	<p className='text-sm text-muted-foreground py-8 text-center'>
		데이터가 없습니다. 매출 데이터를 업로드하면 확인할 수 있어요.
	</p>
);

export function TopSongsCard() {
	const { data: topSongs } = useQuery(statsQueries.getTopSongs());
	const hasData = (topSongs?.length ?? 0) > 0;

	const songKeysData = [...(topSongs ?? [])].sort((a, b) => a.rank - b.rank);
	const maxSales = Math.max(...songKeysData.map((s) => s.sales), 1);
	const salesStep = Math.ceil(maxSales / 5);
	const salesTicks = Array.from({ length: 6 }, (_, i) => i * salesStep);

	return (
		<Card className='border-border/50 lg:col-span-2 min-w-0'>
			<CardHeader className='pb-2'>
				<CardTitle className='text-base font-display flex items-center gap-2'>
					<Trophy className='h-4 w-4' />
					가장 많이 팔린 곡 TOP 5
				</CardTitle>
				<p className='text-xs text-muted-foreground'>전체 기간 누적 판매 기준</p>
			</CardHeader>
			<CardContent className='space-y-4'>
				{!hasData ? (
					emptyState
				) : (
					<>
						<ChartContainer
							config={{ sales: { label: '판매수', color: 'hsl(var(--primary))' } }}
							className='w-full h-[240px]'
						>
							<BarChart
								data={songKeysData.slice(0, 5)}
								layout='vertical'
								barSize={18}
								barCategoryGap={28}
								margin={{ left: 8, right: 16, top: 20, bottom: 4 }}
							>
								<YAxis dataKey='title' type='category' hide />
								<XAxis
									type='number'
									tickLine={false}
									axisLine={false}
									fontSize={11}
									ticks={salesTicks}
									domain={[0, salesStep * 5]}
								/>
								<CartesianGrid vertical={true} horizontal={false} strokeDasharray='3 3' />
								<Bar
									dataKey='sales'
									shape={(args: {
										index: number;
										x: number;
										y: number;
										width: number;
										height: number;
									}) => <TopSongBar {...args} song={songKeysData[args.index]} />}
								/>
							</BarChart>
						</ChartContainer>

						<div className='border-t border-border/40 pt-4'>
							<div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
								{songKeysData.slice(0, 5).map((song, i) => (
									<div
										key={song.title}
										className='rounded-[14px] px-3 py-2 space-y-0.5 bg-muted/40'
									>
										<p className='text-xs font-mono text-muted-foreground'>{song.rank}위</p>
										<p className={cn('text-xs truncate', i === 0 ? 'font-semibold' : 'font-medium')}>
											{song.title}
										</p>
										<p className='text-xs text-muted-foreground tabular-nums'>
											{formatCurrency(getNetAmount(song.revenue))}
										</p>
									</div>
								))}
							</div>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
