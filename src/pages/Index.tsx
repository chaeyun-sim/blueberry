import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/PageHeader';
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MiniCalendar from '@/components/pages/dashboard/MiniCalendar';
import TodayCard from '@/components/pages/dashboard/TodayCard';
import SummaryCard from '@/components/pages/dashboard/SummaryCard';
import { mockCommissionSummary, mockRecentCommissions } from '@/mock/dashboard';
import RevenueSliderCard from '@/components/pages/dashboard/RevenueSliderCard';
import CommissionSummaryBar from '@/components/pages/dashboard/CommissionSummaryBar';

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

  const total = Object.values(mockCommissionSummary).reduce((acc, curr) => acc + curr, 0);

  return (
    <AppLayout>
      <PageHeader
        title='대시보드'
        description='의뢰 현황을 한눈에 확인하세요'
      />

      {/* Bento Grid */}
      <div className='flex flex-col gap-5'>
        {/* Top Row */}
        <div className='grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5'>
          {/* ① Top-Left: Today */}
          <Card className='border-border/50 overflow-hidden relative min-h-[180px]'>
            <TodayCard />
          </Card>

          {/* ② Top-Right: Mini Calendar */}
          <Card className='border-border/50'>
            <CardContent className='p-4 h-full'>
              <MiniCalendar />
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className='grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-5'>
          {/* ③ Bottom-Left: Revenue + Commission Summary */}
          <div className='flex flex-col gap-5'>
            {/* Revenue Slider Card */}
            <Card className='border-border/50'>
              <CardContent className='p-5'>
                <RevenueSliderCard />
              </CardContent>
            </Card>

            {/* Commission Summary Card */}
            <Card className='border-border/50 flex-1'>
              <CardContent className='p-5'>
                <h3 className='text-xs font-medium text-muted-foreground mb-3'>
                  이번 달 의뢰 요약
                </h3>
                <div className='grid grid-cols-4 gap-3'>
                  {workStatus.map(item => (
                    <div
                      key={item.status}
                      className='flex flex-col items-center p-2.5 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors'
                      onClick={() => navigate(`/commissions?status=${item.status}`)}
                    >
                      <item.icon className='h-4 w-4 text-muted-foreground mb-1.5' />
                      <p className='text-xl font-display font-bold'>{item.count}</p>
                      <p className='text-[10px] text-muted-foreground'>{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className='flex h-2 rounded-full overflow-hidden mt-3'>
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

          {/* ④ Bottom-Right: 최근 작업 */}
          <Card className='border-border/50'>
            <CardContent className='p-5 h-full flex flex-col'>
              <div className='flex items-center gap-2 mb-4'>
                <History className='h-5 w-5 text-foreground' />
                <h2 className='font-display font-semibold text-sm'>최근 작업</h2>
              </div>
              <div className='space-y-2.5 flex-1'>
                {mockRecentCommissions.map(c => (
                  <div
                    key={c.id}
                    className='flex items-center justify-between p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors'
                    onClick={() => navigate(`/commissions/${c.id}`)}
                  >
                    <div>
                      <p className='font-medium text-sm'>{c.title}</p>
                      <p className='text-xs text-muted-foreground'>{c.arrangement}</p>
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

        {/* Third Row: Quick Stats */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-5'>
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
