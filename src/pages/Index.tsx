import {
	CheckCircle2,
	ChevronRightIcon,
	Plus,
	Sparkles,
	TrendingDown,
	TrendingUp,
} from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { statsQueries } from '@/api/stats/queries';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AppLayout } from '@/components/layout/AppLayout';
import { ActiveCommissionsWidget } from '@/components/pages/dashboard/ActiveCommissionsWidget';
import { DeadlineWidget } from '@/components/pages/dashboard/DeadlineWidget';
import { DiscoverWidget } from '@/components/pages/dashboard/DiscoverWidget';
import MonthlyChart from '@/components/pages/dashboard/MonthlyChart';
import RollingNumber from '@/components/pages/dashboard/RollingNumber';
import { StatusDonutWidget } from '@/components/pages/dashboard/StatusDonutWidget';
import { WEEK_KOR } from '@/constants/week';
import { commissionQueries } from '@/features/commission/api';
import { scoreQueries } from '@/features/score/api';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import useLiveClock from '@/hooks/use-live-clock';
import { getNetAmount } from '@/utils/getNetAmount';

function getGreeting(hour: number) {
	if (hour < 6) return 'Good Night';
	if (hour < 12) return 'Good Morning';
	if (hour < 18) return 'Good Afternoon';
	return 'Good Evening';
}

const DashboardContent = () => {
	const navigate = useNavigate();
	const clock = useLiveClock();

	const { data: commissions = [], isLoading } = useQuery(
		commissionQueries.getCommissions(),
	);
	const { data: scores = [] } = useQuery(scoreQueries.getSongsSummary());
	const { data: salesSummary } = useQuery(statsQueries.getSalesSummary());

	const totalScores = useMemo(
		() => scores.reduce((acc, s) => acc + (s.arrangements?.length ?? 0), 0),
		[scores],
	);
	const totalCompleted = useMemo(
		() => commissions.filter((c) => c.status === 'complete').length,
		[commissions],
	);

	const thisMonthRevenue = getNetAmount(salesSummary?.lastMonthRevenue ?? 0);
	const vsLastMonth = salesSummary?.revenueVsLastMonth ?? null;

	const greeting = getGreeting(clock.hour());
	const today = `${clock.month() + 1}월 ${clock.date()}일 (${WEEK_KOR[clock.day()]})`;

	return (
		<AppLayout>
			{/* ── Header ─────────────────────────────────────── */}
			<div className='flex items-center justify-between mb-8'>
				<div>
					<p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>
						{today}
					</p>
					<h1 className='text-3xl font-display font-bold tracking-tight mt-0.5 flex items-center gap-2'>
						{greeting}
						<Sparkles className='h-5 w-5 text-primary opacity-60' />
					</h1>
				</div>
			</div>

			{/* ── Floating 새 의뢰 버튼 (sm ~ md only) ──────────── */}
			<button
				onClick={() => navigate('/new')}
				style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom) + 1rem)' }}
				className='md:hidden fixed right-6 z-50 w-14 h-14 rounded-full bg-foreground text-background shadow-xl flex items-center justify-center hover:opacity-80 active:scale-95 transition-all'
				aria-label='새 의뢰 등록'
			>
				<Plus className='h-6 w-6' />
			</button>

			{/* ── Bento Grid ─────────────────────────────────── */}
			<div className='flex flex-col gap-4'>
				{/* Row 1: 모바일 단일 컬럼 (Deadline → Active), lg에서 Deadline 전체 너비 */}
				<div className='flex flex-col gap-4'>
					<DeadlineWidget commissions={commissions} />
					<div className='lg:hidden'>
						<ActiveCommissionsWidget
							commissions={commissions}
							isLoading={isLoading}
						/>
					</div>
				</div>

				{/* Row 2: Donut (1/2→1/3) + Revenue (1/2→1/3) + Completed (hidden on mobile→1/3) */}
				<div className='grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4'>
					{/* Status Donut */}
					<StatusDonutWidget commissions={commissions} totalScores={totalScores} />

					{/* Revenue mini */}
					<div
						className='bg-card rounded-2xl md:rounded-3xl p-4 md:p-6 border shadow-sm cursor-pointer hover:opacity-80 transition-opacity flex flex-col justify-between'
						onClick={() => navigate('/stats')}
						onKeyDown={(e) => e.key === 'Enter' && navigate('/stats')}
						role='button'
						tabIndex={0}
					>
						<div>
							<p className='text-xs md:text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>
								지난 달 매출
							</p>
							<p className='text-2xl md:text-3xl font-display font-bold mt-2 md:mt-3 tabular-nums'>
								{salesSummary ? (
									<RollingNumber value={thisMonthRevenue} />
								) : (
									<span className='inline-block h-7 md:h-9 w-16 md:w-28 rounded-xl bg-muted animate-pulse' />
								)}
							</p>
							{vsLastMonth !== null && (
								<p
									className={`flex items-center gap-1 mt-1.5 md:mt-2 text-xs font-semibold ${vsLastMonth >= 0 ? 'text-success' : 'text-destructive'}`}
								>
									{vsLastMonth >= 0 ? (
										<TrendingUp className='h-3 w-3' />
									) : (
										<TrendingDown className='h-3 w-3' />
									)}
									{vsLastMonth >= 0 ? '+' : ''}
									{vsLastMonth}%
								</p>
							)}
						</div>
						<p className='text-xs text-muted-foreground mt-3 md:mt-0 flex items-center gap-1'>자세히 <ChevronRightIcon className="w-3.5 h-3.5 text-muted-foreground" /></p>
					</div>

					{/* Total completed — 모바일에서 숨김 */}
					<div
						className='hidden md:flex bg-card rounded-2xl md:rounded-3xl p-3 md:p-6 border shadow-sm cursor-pointer hover:opacity-80 transition-opacity flex-col justify-between'
						onClick={() => navigate('/commissions?status=complete')}
						onKeyDown={(e) =>
							e.key === 'Enter' && navigate('/commissions?status=complete')
						}
						role='button'
						tabIndex={0}
					>
						<div>
							<p className='text-[9px] md:text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>
								누적 완료
							</p>
							<p className='text-lg md:text-3xl font-display font-bold mt-1 md:mt-3 tabular-nums'>
								{isLoading ? (
									<span className='inline-block h-6 md:h-9 w-10 md:w-16 rounded-xl bg-muted animate-pulse' />
								) : (
									<>
										{totalCompleted}
										<span className='text-sm md:text-base text-muted-foreground font-normal ml-0.5 md:ml-1'>
											건
										</span>
									</>
								)}
							</p>
							<div className='flex items-center gap-1 mt-1 md:mt-2'>
								<CheckCircle2 className='h-3 w-3 md:h-3.5 md:w-3.5 text-success shrink-0' />
								<span className='text-[10px] md:text-xs text-muted-foreground hidden sm:block'>
									오늘까지 완료한 의뢰
								</span>
							</div>
						</div>
						<p className='text-[10px] md:text-xs text-muted-foreground mt-2 md:mt-0 flex items-center gap-1'>전체 보기 <ChevronRightIcon className="w-3.5 h-3.5 text-muted-foreground" /></p>
					</div>
				</div>

				{/* Row 3: Monthly Chart */}
				<ErrorBoundary level='section'>
					<MonthlyChart />
				</ErrorBoundary>

				{/* Row 4: Received queue */}
				<ErrorBoundary level='section'>
					<DiscoverWidget commissions={commissions} isLoading={isLoading} />
				</ErrorBoundary>
			</div>
		</AppLayout>
	);
};

const Dashboard = () => (
	<ErrorBoundary level='page'>
		<DashboardContent />
	</ErrorBoundary>
);

export default Dashboard;
