import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { statsQueries } from '@/api/stats/queries';
import { MONEY_RATIO } from '@/constants/money-ratio';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

const MONTH_EVENTS: Record<number, string[]> = {
	1: ['새해', '설날'],
	2: ['발렌타인데이', '졸업식 시즌'],
	3: ['입학식', '화이트데이', '봄 결혼 시즌'],
	4: ['부활절', '봄 결혼 시즌'],
	5: ['어린이날', '어버이날', '스승의날', '결혼 성수기'],
	6: ['결혼 성수기'],
	7: ['여름방학'],
	8: ['여름방학', '광복절'],
	9: ['추석', '가을 결혼 시즌'],
	10: ['가을 결혼 성수기', '할로윈'],
	11: ['수능', '가을 결혼 성수기'],
	12: ['크리스마스', '연말'],
};

function SeasonalHint() {
	const { data: months = [] } = useQuery(statsQueries.getSeasonalPattern());

	const currentMonth = new Date().getMonth() + 1;
	const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

	const activeMonth = selectedMonth ?? currentMonth;
	const activeData = months.find((m) => m.monthNum === activeMonth);
	const years = months.find((m) => m.years > 0)?.years ?? 0;
	const hasAnyData = months.some((m) => m.years > 0);

	return (
		<Card className='border-border/50'>
			<CardHeader className='pb-2'>
				<CardTitle className='text-base font-display flex items-center gap-2'>
					<CalendarDays className='h-4 w-4' />
					월별 인기곡 패턴
				</CardTitle>
				{years > 0 && (
					<p className='text-xs text-muted-foreground'>
						전체 데이터 기준 · 달을 클릭하면 그 달의 인기곡을 볼 수 있어요
					</p>
				)}
			</CardHeader>
			<CardContent className='space-y-4'>
				{!hasAnyData ? (
					<p className='text-sm text-muted-foreground py-6 text-center'>
						데이터가 없습니다. 매출 데이터를 업로드하면 패턴을 확인할 수 있어요.
					</p>
				) : (
					<>
						<ChartContainer config={{}} className='w-full h-[180px]'>
							<BarChart
								data={months.map((m) => ({
									...m,
									avgRevenue: m.avgRevenue * MONEY_RATIO,
								}))}
								margin={{ left: -8, right: 8, top: 4, bottom: 4 }}
								barSize={22}
								onClick={(e) =>
									e?.activePayload?.[0] &&
									setSelectedMonth(e.activePayload[0].payload.monthNum)
								}
							>
								<CartesianGrid vertical={false} strokeDasharray='3 3' />
								<XAxis
									dataKey='month'
									tickLine={false}
									axisLine={false}
									fontSize={11}
								/>
								<YAxis
									tickLine={false}
									axisLine={false}
									fontSize={11}
									tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
								/>
								<Bar
									dataKey='avgRevenue'
									radius={[4, 4, 0, 0]}
									style={{ cursor: 'pointer' }}
								>
									{months.map((entry) => (
										<Cell
											key={entry.monthNum}
											fill={
												entry.monthNum === activeMonth
													? 'hsl(var(--primary))'
													: entry.years === 0
														? 'hsl(var(--muted))'
														: 'hsl(var(--primary) / 0.3)'
											}
										/>
									))}
								</Bar>
							</BarChart>
						</ChartContainer>

						<div className='border-t border-border/40 pt-4 space-y-3'>
							<div className='flex items-center gap-2 flex-wrap'>
								<span className='text-sm font-semibold'>
									{activeData?.month}
									{activeData?.monthNum === currentMonth && (
										<span className='ml-1.5 text-xs font-normal text-primary'>
											이번달
										</span>
									)}
								</span>
								{MONTH_EVENTS[activeMonth]?.map((event) => (
									<span
										key={event}
										className='px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground'
									>
										{event}
									</span>
								))}
							</div>

							{!activeData || activeData.years === 0 ? (
								<p className='text-xs text-muted-foreground'>
									이 달의 데이터가 없습니다
								</p>
							) : activeData.topSongs.length === 0 ? (
								<p className='text-xs text-muted-foreground'>곡 정보 없음</p>
							) : (
								<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2'>
									{activeData.topSongs.map((song, i) => (
										<div
											key={song.title}
											className={cn(
												'rounded-[14px] px-3 py-2 space-y-0.5',
												i === 0 ? 'bg-primary/10' : 'bg-muted/40',
											)}
										>
											<p className='text-xs font-mono text-muted-foreground'>{i + 1}위</p>
											<p
												className={cn(
													'text-xs truncate',
													i === 0 ? 'font-semibold' : 'font-medium',
												)}
											>
												{song.title}
											</p>
											<p className='text-xs text-muted-foreground tabular-nums'>
												총 {song.avgCount}건
											</p>
										</div>
									))}
								</div>
							)}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}

export default SeasonalHint;
