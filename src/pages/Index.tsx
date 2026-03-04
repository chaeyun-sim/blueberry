import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/pages/commission/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ClipboardList,
  Truck,
  CheckCircle,
  CheckCircle2,
  History,
  DollarSign,
  Music,
  Music2,
  Package2,
  Sun,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useLiveClock from '@/hooks/use-live-clock';
import { WEEK_KOR } from '@/constants/week';
import SummaryCard from '@/components/pages/dashboard/SummaryCard';
import RevenueSliderCard from '@/components/pages/dashboard/RevenueSliderCard';
import CommissionSummaryBar from '@/components/pages/dashboard/CommissionSummaryBar';
import MonthlyChart from '@/components/pages/dashboard/MonthlyChart';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { commissionQueries } from '@/api/commission/queries';
import dayjs from 'dayjs';
import { scoreQueries } from '@/api/score/queries';
import { statsQueries } from '@/api/stats/queries';
import { formatCurrency } from '@/utils/format-currency';

const summary = [
  {
    icon: Music,
    value: '24',
    description: '보유 악보',
    colorStatus: 'primary',
  },
  {
    icon: CheckCircle2,
    value: '156',
    description: '누적 완료',
    colorStatus: 'complete',
  },
  {
    icon: ClipboardList,
    value: '+22.4%',
    description: '전년 대비 성장',
    colorStatus: 'success',
  },
  {
    icon: DollarSign,
    value: '₩14,930',
    description: '평균 단가',
    colorStatus: 'warning',
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const clock = useLiveClock();

  const {
    data: commissions = [],
    isLoading,
    isError,
  } = useQuery(commissionQueries.getCommissions());
  const { data: scores = [] } = useQuery(scoreQueries.getSongs());
  const { data: salesSummary } = useQuery(statsQueries.getSalesSummary());

  const totalScores = scores.reduce((acc, score) => acc + (score.arrangements?.length ?? 0), 0);
  const totalCompleted = commissions.filter(
    c => c.status === 'complete' || c.status === 'delivered',
  ).length;
  const avgPrice =
    salesSummary && salesSummary.totalCount > 0
      ? formatCurrency(Math.round(salesSummary.totalRevenue / salesSummary.totalCount))
      : '-';
  const yoyGrowth = salesSummary
    ? `${salesSummary.revenueVsLastYear >= 0 ? '+' : ''}${salesSummary.revenueVsLastYear}%`
    : '-';

  const summaryValues = [
    { ...summary[0], value: totalScores ?? summary[0].value },
    { ...summary[1], value: totalCompleted ?? summary[1].value},
    { ...summary[2], value: yoyGrowth ?? summary[2].value},
    { ...summary[3], value: avgPrice ?? summary[3].value},
  ];

  const thisMonthCommissions = commissions.filter(c =>
    dayjs(c.created_at).isSame(dayjs(), 'month'),
  );

  const counts = thisMonthCommissions.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const workStatusConfig = {
    received: { label: '접수', icon: Package2, summary: counts.received ?? 0 },
    working: { label: '작업중', icon: Music2, summary: counts.working ?? 0 },
    complete: { label: '완료', icon: CheckCircle, summary: counts.complete ?? 0 },
    delivered: { label: '전달', icon: Truck, summary: counts.delivered ?? 0 },
  };

  const recentCommissions = [...commissions]
    .sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf())
    .slice(0, 3);

  const getGreeting = () => {
    const h = clock.hour();
    if (h < 6) return '🌙 Good Night';
    if (h < 12) return '☀️ Good Morning';
    if (h < 18) return '🌤️ Good Evening';
    return '🌙 Good Night';
  };

  const total = Object.values(workStatusConfig).reduce((acc, { summary }) => acc + summary, 0);

  return (
    <AppLayout>
      {/* Dashboard Header */}
      <div className='flex items-start justify-between mb-6 gap-6 py-2'>
        {/* Left: Greeting */}
        <div className='shrink-0'>
          <h1 className='text-3xl font-display font-bold tracking-tight'>{getGreeting()}</h1>
          <div className='flex flex-col md:flex-row md:items-center gap-2 md:gap-5 mt-2 text-sm text-muted-foreground'>
            <span className='flex items-center gap-1.5'>
              <Sun className='h-3.5 w-3.5 text-[hsl(var(--warning))]' />
              맑음 · 4°C
            </span>
            <span className='flex items-center gap-1.5'>
              <Music className='h-3.5 w-3.5' />
              진행 중인 의뢰{' '}
              <strong className='text-foreground ml-0.5'>
                {workStatusConfig.working.summary}건
              </strong>
            </span>
            <span className='flex items-center gap-1.5'>
              <History className='h-3.5 w-3.5 text-[hsl(var(--success))]' />
              최근 업데이트{' '}
              <strong className='text-foreground ml-0.5'>{recentCommissions.length}건</strong>
            </span>
          </div>
        </div>

        {/* Right: Clock */}
        <div className='hidden md:block shrink-0 text-right'>
          <p
            className='text-4xl font-bold tabular-nums tracking-tight'
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {clock.format('HH:mm')}
          </p>
          <p className='text-xs text-muted-foreground mt-1'>
            {`${clock.month() + 1}월 ${clock.date()}일 (${WEEK_KOR[clock.day()]})`}
          </p>
        </div>
      </div>
      {/* Bento Grid */}
      <div className='flex flex-col gap-4'>
        <div className='rounded-3xl shadow-sm overflow-hidden h-[180px]'>
          <img
            src="/backgrounds/background-768w.webp"
            srcSet="/backgrounds/background-480w.webp 480w, /backgrounds/background-768w.webp 768w, /backgrounds/background-1080w.webp 1080w"
            sizes="100vw"
            className='w-full h-full object-fill lg:object-center'
            alt=""
            fetchPriority='high'
          />
        </div>
        {/* Top Row */}
        <div className='grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-4'>
          {/* ③ Bottom-Left: Revenue + Commission Summary */}
          <div className='flex flex-col gap-4'>
            {/* Revenue Slider Card — green tint */}
            <Card className='border-[1px] shadow-sm'>
              <CardContent className='pb-0'>
                <RevenueSliderCard />
              </CardContent>
            </Card>

            {/* Commission Summary Card — lavender tint */}
            <Card className='border-[1px] shadow-sm flex-1'>
              <CardContent className='p-5'>
                <h2 className='text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider'>
                  이번 달 의뢰 요약
                </h2>
                <div className='grid grid-cols-4 gap-2'>
                  {Object.entries(workStatusConfig).map(([key, item]) => (
                    <button
                      key={key}
                      className='flex flex-col items-center p-3 rounded-2xl bg-background/60 hover:bg-background/90 cursor-pointer transition-colors'
                      onClick={() => navigate(`/commissions?status=${key}`)}
                    >
                      <item.icon
                        className='h-4 w-4 mb-1.5'
                        style={{ color: `hsl(var(--status-${key}))` }}
                      />
                      <p className='text-xl font-display font-bold'>
                        {isLoading ? '-' : item.summary}
                      </p>
                      <p className='text-[10px] text-muted-foreground'>{item.label}</p>
                    </button>
                  ))}
                </div>
                <div className='flex h-2.5 rounded-full overflow-hidden mt-4'>
                  {Object.values(workStatusConfig)
                    .map(el => el.summary)
                    .reduce((acc, curr) => acc + curr, 0) > 0 ? (
                    Object.entries(workStatusConfig).map(([key, { summary }]) => (
                      <CommissionSummaryBar
                        key={key}
                        status={key}
                        value={summary}
                        maxValue={total}
                      />
                    ))
                  ) : (
                    <div className='w-full bg-muted' />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ④ Bottom-Right: 최근 작업 — white card */}
          <Card className='border-[1px] shadow-sm'>
            <CardContent className='p-5 h-full flex flex-col'>
              <div className='flex items-center gap-2.5 mb-5'>
                <div className='w-9 h-9 rounded-2xl bg-foreground flex items-center justify-center shrink-0'>
                  <History className='h-4 w-4 text-background' />
                </div>
                <div>
                  <h2 className='font-display font-bold text-sm leading-tight'>최근 작업</h2>
                  <p className='text-[10px] text-muted-foreground'>최근 업데이트된 의뢰</p>
                </div>
              </div>
              <div className='space-y-2 flex-1'>
                {isError ? (
                  <p className='text-sm text-muted-foreground text-center py-6'>
                    데이터를 불러오지 못했습니다.
                  </p>
                ) : isLoading ? (
                  [0, 1, 2].map(i => (
                    <div
                      key={i}
                      className='h-[58px] rounded-2xl bg-muted/30 animate-pulse'
                    />
                  ))
                ) : recentCommissions.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-6'>
                    최근 의뢰가 없습니다.
                  </p>
                ) : (
                  recentCommissions.map(c => (
                    <button
                      type='button'
                      key={c.id}
                      className='flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-muted/30 cursor-pointer hover:bg-muted/60 transition-colors'
                      onClick={() => navigate(`/commissions/${c.id}`)}
                    >
                      <div className='min-w-0'>
                        <p className='font-semibold text-sm truncate'>
                          {c.songs?.title ?? c.title}
                        </p>
                        <p className='hidden md:block text-xs text-muted-foreground mt-0.5'>
                          {c.arrangement}
                        </p>
                      </div>
                      <div className='flex items-center gap-2 shrink-0'>
                        <StatusBadge status={c.status} />
                        <span className='text-[10px] text-muted-foreground'>
                          {c.deadline ? `${dayjs(c.deadline).format('MM/DD')} 마감` : '-'}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row: Monthly Chart */}
        <MonthlyChart />

        {/* Third Row: Quick Stats */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          {summaryValues.map(item => (
            <SummaryCard
              key={item.description}
              icon={item.icon}
              value={item.value}
              description={item.description}
              colorStatus={item.colorStatus as 'primary' | 'complete' | 'success' | 'warning'}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
