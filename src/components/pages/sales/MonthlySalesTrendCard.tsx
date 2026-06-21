import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';
import dayjs from 'dayjs';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { statsQueries } from '@/api/stats/queries';
import { topProductColors } from '@/constants/status-config';

const emptyState = (
	<p className='text-sm text-muted-foreground py-8 text-center'>
		데이터가 없습니다. 매출 데이터를 업로드하면 확인할 수 있어요.
	</p>
);

export function MonthlySalesTrendCard() {
	const { data: yearRange } = useQuery(statsQueries.getSalesYearRange());
	const [monthlySalesYear, setMonthlySalesYear] = useState<number | null>(null);

	const selectedYear = monthlySalesYear ?? yearRange?.max ?? dayjs().year();
	const yearOptions = yearRange
		? Array.from({ length: yearRange.max - yearRange.min + 1 }, (_, i) => yearRange.max - i)
		: [selectedYear];

	const { data: topSongMonthlySales } = useQuery(
		statsQueries.getTopSongMonthlySales(selectedYear),
	);
	const { data: categoryDistribution } = useQuery(statsQueries.getCategoryDistribution());
	const hasData = (categoryDistribution?.length ?? 0) > 0;

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

	return (
		<Card className='border-border/50'>
			<CardHeader className='pb-2'>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='text-base font-display flex items-center gap-2'>
							<Activity className='h-4 w-4' />
							인기곡 월별 판매 추이
						</CardTitle>
						<p className='text-xs text-muted-foreground mt-0.5'>TOP 5 곡의 월별 판매 건수</p>
					</div>
					<Select
						value={String(selectedYear)}
						onValueChange={(v) => setMonthlySalesYear(Number(v))}
					>
						<SelectTrigger className='w-24 h-7 text-xs' aria-label='월별 판매 추이 연도 선택'>
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
				{!hasData ? (
					emptyState
				) : (
					<>
						<ChartContainer config={topProductConfig} className='w-full h-[240px]'>
							<LineChart
								data={topSongMonthlySales?.data ?? []}
								margin={{ left: 8, right: 8, top: 4, bottom: 4 }}
							>
								<CartesianGrid horizontal={true} vertical={false} strokeDasharray='3 3' />
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
					</>
				)}
			</CardContent>
		</Card>
	);
}
