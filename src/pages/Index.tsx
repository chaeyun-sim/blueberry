import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { statsQueries } from '@/api/stats/queries';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AppLayout } from '@/components/layout/AppLayout';
import { ActiveCommissionsWidget } from '@/components/pages/dashboard/ActiveCommissionsWidget';
import { DeadlineWidget } from '@/components/pages/dashboard/DeadlineWidget';
import { DiscoverWidget } from '@/components/pages/dashboard/DiscoverWidget';
import MonthlyChart from '@/components/pages/dashboard/MonthlyChart';
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

	const lastMonthRevenue = salesSummary
		? getNetAmount(salesSummary.lastMonthRevenue ?? 0)
		: null;
	const revenueDelta = salesSummary?.revenueVsLastMonth ?? null;

	const greeting = getGreeting(clock.hour());
	const today = `${clock.month() + 1}월 ${clock.date()}일 (${WEEK_KOR[clock.day()]})`;

	return (
		<AppLayout>
			{/* ── Header ─────────────────────────────────────── */}
			<div className='mb-6'>
				<p className='text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
					{today}
				</p>
				<h1 className='mt-0.5 font-display text-2xl font-bold tracking-tight md:text-3xl'>
					{greeting}
				</h1>
			</div>

			{/* ── Floating 새 의뢰 버튼 (모바일 전용) ──────────── */}
			<button
				onClick={() => navigate('/new')}
				style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom) + 1rem)' }}
				className='fixed right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-xl transition-all hover:opacity-80 active:scale-95 md:hidden'
				aria-label='새 의뢰 등록'
			>
				<Plus className='h-6 w-6' />
			</button>

			<div className='flex flex-col gap-3 md:gap-4'>
				{/* Row 1: 마감 임박 히어로 */}
				<DeadlineWidget commissions={commissions} />

				{/* Row 2: 이번 달 현황 + 월별 처리량 */}
				<div className='grid gap-3 md:grid-cols-3 md:gap-4'>
					<StatusDonutWidget
						commissions={commissions}
						totalScores={totalScores}
						totalCompleted={totalCompleted}
						lastMonthRevenue={lastMonthRevenue}
						revenueDelta={revenueDelta}
					/>
					<div className='md:col-span-2'>
						<ErrorBoundary level='section'>
							<MonthlyChart />
						</ErrorBoundary>
					</div>
				</div>

				{/* Row 3: 작업 중 + 대기 큐 */}
				<div className='grid gap-3 md:gap-4 lg:grid-cols-2'>
					<ActiveCommissionsWidget
						commissions={commissions}
						isLoading={isLoading}
					/>
					<ErrorBoundary level='section'>
						<DiscoverWidget commissions={commissions} isLoading={isLoading} />
					</ErrorBoundary>
				</div>
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
