import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import {
	PieChart,
	Pie,
	Cell,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	LineChart,
	Line,
} from 'recharts';
import { ChartTooltip } from '@/components/ui/chart';
import { Layers, Trophy, Activity } from 'lucide-react';
import { formatCurrency } from '@/utils/format-currency';
import TopSongBar from './TopSongBar';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { statsQueries } from '@/api/stats/queries';
import { categoryColors, topProductColors } from '@/constants/status-config';
import { MONEY_RATIO } from '@/constants/money-ratio';
import { cn } from '@/lib/utils';

function Stats() {
	const { data: categoryDistribution } = useQuery(
		statsQueries.getCategoryDistribution(),
	);
	const { data: topSongs } = useQuery(statsQueries.getTopSongs());
	const { data: yearRange } = useQuery(statsQueries.getSalesYearRange());

	const [monthlySalesYear, setMonthlySalesYear] = useState<number | null>(null);

	const selectedYear =
		monthlySalesYear ?? yearRange?.max ?? new Date().getFullYear();
	const yearOptions = yearRange
		? Array.from(
				{ length: yearRange.max - yearRange.min + 1 },
				(_, i) => yearRange.max - i,
			)
		: [selectedYear];

	const { data: topSongMonthlySales } = useQuery(
		statsQueries.getTopSongMonthlySales(selectedYear),
	);

	const songConfig = topSongMonthlySales?.config ?? {};
	const songKeys = Object.keys(songConfig);
	const topProductConfig: ChartConfig = Object.fromEntries(
		songKeys.map((key, i) => [
			key,
			{
				label: songConfig[key],
				color: topProductColors[i % topProductColors.length],
			},
		]),
	);

	const songKeysData = [...(topSongs ?? [])].sort((a, b) => a.rank - b.rank);
	const maxSales = Math.max(...songKeysData.map((s) => s.sales), 1);
	const salesStep = Math.ceil(maxSales / 5);
	const salesTicks = Array.from({ length: 6 }, (_, i) => i * salesStep);

	return (
		<div className='space-y-6'>
			<div className='grid lg:grid-cols-3 gap-6 min-w-0'>
				{/* 카테고리별 분포 */}
				<Card className='border-border/50 min-w-0 flex flex-col'>
					<CardHeader className='pb-2'>
						<CardTitle className='text-base font-display flex items-center gap-2'>
							<Layers className='h-4 w-4' />
							카테고리별 분포
						</CardTitle>
						<p className='text-xs text-muted-foreground'>전체 판매 건수 기준</p>
					</CardHeader>
					<CardContent className='flex flex-col flex-1 justify-between gap-4'>
						<ChartContainer config={{}} className='mx-auto h-[180px]'>
							<PieChart>
								<Pie
									data={categoryDistribution}
									dataKey='countShare'
									nameKey='name'
									cx='50%'
									cy='50%'
									innerRadius={48}
									outerRadius={78}
									strokeWidth={2}
									stroke='hsl(var(--background))'
								>
									{categoryDistribution?.map((entry, i) => (
										<Cell
											key={i}
											fill={categoryColors[entry.name] ?? `hsl(${i * 55} 60% 55%)`}
										/>
									))}
								</Pie>
							</PieChart>
						</ChartContainer>

						<div className='border-t border-border/40 pt-[24px] pb-[16px]'>
							<div className='grid grid-cols-2 gap-2'>
								{categoryDistribution?.map((c, i) => (
									<div
										key={c.name}
										className='rounded-[14px] px-3 py-2 space-y-2 bg-muted/40'
									>
										<div className='flex items-center gap-1.5'>
											<span
												className='w-2 h-2 rounded-full shrink-0'
												style={{ backgroundColor: categoryColors[c.name] }}
											/>
											<span className='text-xs font-semibold'>{c.name}</span>
										</div>
										<p className='text-xs text-muted-foreground tabular-nums'>
											{c.countShare}% · {c.count.toLocaleString()}건
										</p>
									</div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* 가장 많이 팔린 곡 TOP 5 */}
				<Card className='border-border/50 lg:col-span-2 min-w-0'>
					<CardHeader className='pb-2'>
						<CardTitle className='text-base font-display flex items-center gap-2'>
							<Trophy className='h-4 w-4' />
							가장 많이 팔린 곡 TOP 5
						</CardTitle>
						<p className='text-xs text-muted-foreground'>전체 기간 누적 판매 기준</p>
					</CardHeader>
					<CardContent className='space-y-4'>
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
								<CartesianGrid
									vertical={true}
									horizontal={false}
									strokeDasharray='3 3'
								/>
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
										<p className='text-xs font-mono text-muted-foreground'>
											{song.rank}위
										</p>
										<p
											className={cn(
												'text-xs truncate',
												i === 0 ? 'font-semibold' : 'font-medium',
											)}
										>
											{song.title}
										</p>
										<p className='text-xs text-muted-foreground tabular-nums'>
											{formatCurrency(song.revenue * MONEY_RATIO)}
										</p>
									</div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* 인기곡 월별 판매 추이 */}
			<Card className='border-border/50'>
				<CardHeader className='pb-2'>
					<div className='flex items-center justify-between'>
						<div>
							<CardTitle className='text-base font-display flex items-center gap-2'>
								<Activity className='h-4 w-4' />
								인기곡 월별 판매 추이
							</CardTitle>
							<p className='text-xs text-muted-foreground mt-0.5'>
								TOP 5 곡의 월별 판매 건수
							</p>
						</div>
						<Select
							value={String(selectedYear)}
							onValueChange={(v) => setMonthlySalesYear(Number(v))}
						>
							<SelectTrigger
								className='w-24 h-7 text-xs'
								aria-label='월별 판매 추이 연도 선택'
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{yearOptions.map((y) => (
									<SelectItem key={y} value={String(y)}>
										{y}년
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent className='space-y-4'>
					<ChartContainer config={topProductConfig} className='w-full h-[240px]'>
						<LineChart
							data={topSongMonthlySales?.data ?? []}
							margin={{ left: 8, right: 8, top: 4, bottom: 4 }}
						>
							<CartesianGrid
								horizontal={true}
								vertical={false}
								strokeDasharray='3 3'
							/>
							<XAxis dataKey='month' tickLine={false} axisLine={false} fontSize={12} />
							<YAxis hide />
							<ChartTooltip
								content={({ active, payload }) => {
									if (!active || !payload?.length) return null;
									const d = payload[0].payload;
									return (
										<div className='rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-md space-y-1'>
											<p className='font-semibold mb-1'>{d.month}</p>
											{songKeys.map((key) => (
												<div key={key} className='flex items-center justify-between gap-4'>
													<span className='flex items-center gap-1.5 min-w-0'>
														<span
															className='w-2 h-2 rounded-full shrink-0'
															style={{ backgroundColor: topProductConfig[key].color }}
														/>
														<span className='truncate'>{topProductConfig[key].label}</span>
													</span>
													<span className='tabular-nums text-muted-foreground shrink-0'>
														{d[key]}건
													</span>
												</div>
											))}
										</div>
									);
								}}
							/>
							{songKeys.map((key) => (
								<Line
									key={key}
									dataKey={key}
									type='monotone'
									stroke={topProductConfig[key].color}
									strokeWidth={2}
									dot={false}
								/>
							))}
						</LineChart>
					</ChartContainer>

					<div className='border-t border-border/40 pt-3'>
						<div className='flex flex-wrap gap-2'>
							{songKeys.map((key) => (
								<span
									key={key}
									className='flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 text-xs text-muted-foreground'
								>
									<span
										className='w-2 h-2 rounded-full shrink-0'
										style={{ backgroundColor: topProductConfig[key].color }}
									/>
									{topProductConfig[key].label}
								</span>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default Stats;
