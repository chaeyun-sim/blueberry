import { AppLayout } from '@/components/layout/AppLayout';
import { useNavigate } from 'react-router-dom';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { commissionQueries } from '@/api/commission/queries';
import { scoreQueries } from '@/api/score/queries';
import { statsQueries } from '@/api/stats/queries';
import { MONEY_RATIO } from '@/constants/money-ratio';
import { formatCurrency } from '@/utils/format-currency';
import ErrorBoundary from '@/components/ErrorBoundary';
import RollingNumber from '@/components/pages/dashboard/RollingNumber';
import { ActiveCommissionsWidget } from '@/components/pages/dashboard/ActiveCommissionsWidget';
import { DeadlineWidget } from '@/components/pages/dashboard/DeadlineWidget';
import { StatusDonutWidget } from '@/components/pages/dashboard/StatusDonutWidget';
import { DiscoverWidget } from '@/components/pages/dashboard/DiscoverWidget';
import MonthlyChart from '@/components/pages/dashboard/MonthlyChart';
import useLiveClock from '@/hooks/use-live-clock';
import { WEEK_KOR } from '@/constants/week';
import { Plus, TrendingUp, TrendingDown, CheckCircle2, Sparkles } from 'lucide-react';
import dayjs from 'dayjs';

function getGreeting(hour: number) {
  if (hour < 6) return 'Good Night';
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

const DashboardContent = () => {
  const navigate = useNavigate();
  const clock = useLiveClock();

  const { data: commissions = [], isLoading } = useQuery(commissionQueries.getCommissions());
  const { data: scores = [] } = useQuery(scoreQueries.getSongsSummary());
  const { data: salesSummary } = useQuery(statsQueries.getSalesSummary());

  const totalScores = scores.reduce((acc, s) => acc + (s.arrangements?.length ?? 0), 0);
  const totalCompleted = commissions.filter((c) => c.status === 'complete').length;

  const thisMonthRevenue = (salesSummary?.lastMonthRevenue ?? 0) * MONEY_RATIO;
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
        <button
          onClick={() => navigate('/new')}
          className='flex items-center gap-2 bg-foreground text-background text-sm font-semibold px-4 py-2.5 rounded-2xl hover:opacity-80 transition-opacity'
        >
          <Plus className='h-4 w-4' />
          새 의뢰
        </button>
      </div>

      {/* ── Bento Grid ─────────────────────────────────── */}
      <div className='flex flex-col gap-4'>

        {/* Row 1: Active (2/3) + Deadline (1/3) */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          <div className='lg:col-span-2'>
            <ActiveCommissionsWidget commissions={commissions} isLoading={isLoading} />
          </div>
          <div>
            <DeadlineWidget commissions={commissions} />
          </div>
        </div>

        {/* Row 2: Donut (1/3) + Revenue (1/3) + Completed (1/3) */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          {/* Status Donut */}
          <StatusDonutWidget commissions={commissions} totalScores={totalScores} />

          {/* Revenue mini */}
          <div
            className='bg-card rounded-3xl p-6 border shadow-sm cursor-pointer hover:opacity-80 transition-opacity flex flex-col justify-between min-h-[160px]'
            onClick={() => navigate('/stats')}
          >
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>
                지난 달 매출
              </p>
              <p className='text-3xl font-display font-bold mt-3 tabular-nums'>
                {salesSummary ? (
                  <RollingNumber value={thisMonthRevenue} />
                ) : (
                  <span className='inline-block h-9 w-28 rounded-xl bg-muted animate-pulse' />
                )}
              </p>
              {vsLastMonth !== null && (
                <p className={`flex items-center gap-1 mt-2 text-xs font-semibold ${vsLastMonth >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {vsLastMonth >= 0
                    ? <TrendingUp className='h-3 w-3' />
                    : <TrendingDown className='h-3 w-3' />}
                  {vsLastMonth >= 0 ? '+' : ''}{vsLastMonth}% 전월 대비
                </p>
              )}
            </div>
            <p className='text-xs text-muted-foreground'>자세히 →</p>
          </div>

          {/* Total completed */}
          <div
            className='bg-card rounded-3xl p-6 border shadow-sm cursor-pointer hover:opacity-80 transition-opacity flex flex-col justify-between min-h-[160px]'
            onClick={() => navigate('/commissions?status=complete')}
          >
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>
                누적 완료
              </p>
              <p className='text-3xl font-display font-bold mt-3 tabular-nums'>
                {isLoading
                  ? <span className='inline-block h-9 w-16 rounded-xl bg-muted animate-pulse' />
                  : <>{totalCompleted}<span className='text-base text-muted-foreground font-normal ml-1'>건</span></>
                }
              </p>
              <div className='flex items-center gap-1.5 mt-2'>
                <CheckCircle2 className='h-3.5 w-3.5 text-success' />
                <span className='text-xs text-muted-foreground'>오늘까지 완료한 의뢰</span>
              </div>
            </div>
            <p className='text-xs text-muted-foreground'>전체 보기 →</p>
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
