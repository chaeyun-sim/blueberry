import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { statsQueries } from '@/api/stats/queries';
import { TrendingUp, TrendingDown, Minus, CalendarClock } from 'lucide-react';
import { getNetAmount } from '@/utils/getNetAmount';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

function SalesForecast() {
	const now = dayjs();
	const year = now.year();
	const monthIndex = now.month();
	const dayOfMonth = now.date();
	const totalDays = now.daysInMonth();
	const progress = dayOfMonth / totalDays;

	const { data: monthlySales = [] } = useQuery(
		statsQueries.getMonthlySales(year),
	);

	const current = monthlySales[monthIndex];
	if (!current) return null;

	const actualRevenue = getNetAmount(current.revenue);
	const lastYearRevenue = getNetAmount(current.prevRevenue);
	const projectedRevenue =
		progress > 0 ? Math.round(actualRevenue / progress) : 0;

	const vsLastYear =
		lastYearRevenue > 0
			? parseFloat(
					(((projectedRevenue - lastYearRevenue) / lastYearRevenue) * 100).toFixed(
						1,
					),
				)
			: null;

	const isUp = vsLastYear !== null && vsLastYear > 0;
	const isDown = vsLastYear !== null && vsLastYear < 0;

	const monthName = `${monthIndex + 1}월`;

	return (
		<Card className='border-border/50'>
			<CardHeader className='pb-2'>
				<CardTitle className='text-base font-display flex items-center gap-2'>
					<CalendarClock className='h-4 w-4 text-primary' />
					이번 달 매출 예측
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{/* 예상 매출 */}
					<div>
						<p className='text-xs text-muted-foreground mb-1'>이번 달 예상</p>
						<div className='flex items-end gap-2'>
							<p className='text-2xl font-bold tabular-nums'>
								₩{projectedRevenue.toLocaleString()}
							</p>
							{vsLastYear !== null && (
								<div
									className={cn(
										'flex items-center gap-0.5 text-sm font-semibold mb-0.5',
										isUp && 'text-green-600 dark:text-green-400',
										isDown && 'text-destructive',
										!isUp && !isDown && 'text-muted-foreground',
									)}
								>
									{isUp ? (
										<TrendingUp className='h-3.5 w-3.5' />
									) : isDown ? (
										<TrendingDown className='h-3.5 w-3.5' />
									) : (
										<Minus className='h-3.5 w-3.5' />
									)}
									{isUp ? '+' : ''}
									{vsLastYear}%
								</div>
							)}
						</div>
					</div>

					{/* 진행률 바 */}
					<div>
						<div className='flex justify-between text-xs text-muted-foreground mb-1'>
							<span>현재 ₩{actualRevenue.toLocaleString()}</span>
							<span>{Math.round(progress * 100)}% 경과</span>
						</div>
						<div className='h-1.5 bg-muted rounded-full overflow-hidden'>
							<div
								className='h-full bg-primary rounded-full'
								style={{ width: `${Math.round(progress * 100)}%` }}
							/>
						</div>
					</div>

					{/* 작년 동월 */}
					<div className='flex justify-between text-sm'>
						<span className='text-muted-foreground'>작년 {monthName}</span>
						<span className='font-medium tabular-nums'>
							₩{lastYearRevenue.toLocaleString()}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default SalesForecast;
