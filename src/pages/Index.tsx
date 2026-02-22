import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge, CommissionStatus } from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ClipboardList,
  Clock,
  Truck,
  CheckCircle2,
  History,
  DollarSign,
  Music,
  Sun,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useLiveClock from '@/hooks/use-live-clock';
import { WEEK_KOR } from '@/constants/week';
import SummaryCard from '@/components/pages/dashboard/SummaryCard';
import { mockCommissionSummary, mockRecentCommissions } from '@/mock/dashboard';
import RevenueSliderCard from '@/components/pages/dashboard/RevenueSliderCard';
import CommissionSummaryBar from '@/components/pages/dashboard/CommissionSummaryBar';
import MonthlyChart from '@/components/pages/dashboard/MonthlyChart';

const summary = [{
  icon: Music,
  value: '24',
  description: '보유 악보',
  colorStatus: 'primary',
}, {
  icon: CheckCircle2,
  value: '156',
  description: '누적 완료',
  colorStatus: 'complete',
}, {
  icon: ClipboardList,
  value: '+22.4%',
  description: '전년 대비 성장',
  colorStatus: 'success',
}, {
  icon: DollarSign,
  value: '₩14,930',
  description: '평균 단가',
  colorStatus: 'warning',
}];

const workStatus = [
  {
    label: '접수',
    count: mockCommissionSummary.received,
    status: 'received' as CommissionStatus,
    icon: ClipboardList,
  },
  {
    label: '작업중',
    count: mockCommissionSummary.working,
    status: 'working' as CommissionStatus,
    icon: Clock,
  },
  {
    label: '완료',
    count: mockCommissionSummary.complete,
    status: 'complete' as CommissionStatus,
    icon: CheckCircle2,
  },
  {
    label: '전달',
    count: mockCommissionSummary.delivered,
    status: 'delivered' as CommissionStatus,
    icon: Truck,
  },
];


const Dashboard = () => {
  const navigate = useNavigate();
  const clock = useLiveClock();

  const getGreeting = () => {
    const h = clock.hour();
    if (h < 6)  return '🌙 Good Night';
    if (h < 12) return '☀️ Good Morning';
    if (h < 18) return '🌤️ Good Evening';
    return '🌙 Good Night';
  };

  const total = Object.values(mockCommissionSummary).reduce((acc, curr) => acc + curr, 0);

  return (
    <AppLayout>
      {/* Dashboard Header */}
      <div className='flex items-start justify-between mb-6 gap-6 py-2'>
        {/* Left: Greeting */}
        <div className='shrink-0'>
          <h1 className='text-3xl font-display font-bold tracking-tight'>
            {getGreeting()}
          </h1>
          <div className='flex items-center gap-5 mt-2 text-sm text-muted-foreground'>
            <span className='flex items-center gap-1.5'>
              <Sun className='h-3.5 w-3.5 text-[hsl(var(--warning))]' />
              맑음 · 4°C
            </span>
            <span className='flex items-center gap-1.5'>
              <Music className='h-3.5 w-3.5' />
              진행 중인 의뢰 <strong className='text-foreground ml-0.5'>{mockCommissionSummary.working}건</strong>
            </span>
            <span className='flex items-center gap-1.5'>
              <History className='h-3.5 w-3.5 text-[hsl(var(--success))]' />
              최근 업데이트 <strong className='text-foreground ml-0.5'>{mockRecentCommissions.length}건</strong>
            </span>
          </div>
        </div>

        {/* Right: Clock */}
        <div className='hidden md:block shrink-0 text-right'>
          <p className='text-4xl font-bold tabular-nums tracking-tight' style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
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
          <img src='https://images.unsplash.com/photo-1771506364945-0b6566c6cd5f?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' className='w-full h-full object-fill lg:object-center' />
        </div>
        {/* Top Row */}
        <div className='grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-4'>
          {/* ③ Bottom-Left: Revenue + Commission Summary */}
          <div className='flex flex-col gap-4'>
            {/* Revenue Slider Card — green tint */}
            <Card className='border-[1px] shadow-sm'>
              <CardContent className="pb-0">
                <RevenueSliderCard />
              </CardContent>
            </Card>

            {/* Commission Summary Card — lavender tint */}
            <Card className='border-[1px] shadow-sm flex-1'>
              <CardContent className='p-5'>
                <h3 className='text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider'>
                  이번 달 의뢰 요약
                </h3>
                <div className='grid grid-cols-4 gap-2'>
                  {workStatus.map(item => (
                    <button
                      key={item.status}
                      className='flex flex-col items-center p-3 rounded-2xl bg-background/60 hover:bg-background/90 cursor-pointer transition-colors'
                      onClick={() => navigate(`/commissions?status=${item.status}`)}
                    >
                      <item.icon
                        className='h-4 w-4 mb-1.5'
                        style={{ color: `hsl(var(--status-${item.status}))` }}
                      />
                      <p className='text-xl font-display font-bold'>{item.count}</p>
                      <p className='text-[10px] text-muted-foreground'>{item.label}</p>
                    </button>
                  ))}
                </div>
                <div className='flex h-2.5 rounded-full overflow-hidden mt-4'>
                  {Object.entries(mockCommissionSummary).map(([key, value]) => (
                    <CommissionSummaryBar
                      key={key}
                      status={key}
                      value={value}
                      maxValue={total}
                    />
                  ))}
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
                {mockRecentCommissions.map(c => (
                  <div
                    key={c.id}
                    className='flex items-center justify-between p-3.5 rounded-2xl bg-muted/30 cursor-pointer hover:bg-muted/60 transition-colors'
                    onClick={() => navigate(`/commissions/${c.id}`)}
                  >
                    <div>
                      <p className='font-semibold text-sm'>{c.title}</p>
                      <p className='text-xs text-muted-foreground mt-0.5'>{c.arrangement}</p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <StatusBadge status={c.status} />
                      <span className='text-[10px] text-muted-foreground'>{c.updatedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row: Monthly Chart */}
        <MonthlyChart />

        {/* Third Row: Quick Stats */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          {summary.map(item => (
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
