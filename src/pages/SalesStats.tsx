import React, { useState, useCallback } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExcelUploadDialog } from '@/components/ExcelUploadDialog';
import { Upload, DollarSign, BarChart3, FileSpreadsheet, CalendarDays, List, Lightbulb } from 'lucide-react';
import Stats from '@/components/pages/sales/Stats';
import YearlyStats from '@/components/pages/sales/YearlyStats';
import SalesSummaryCard from '@/components/pages/sales/SalesSummaryCard';
import SalesAll from '@/components/pages/sales/SalesAll';
import SeasonalHint from '@/components/pages/sales/insights/SeasonalHint';
import TrendingSongs from '@/components/pages/sales/insights/TrendingSongs';
import ParetoChart from '@/components/pages/sales/insights/ParetoChart';
import { statsMutations } from '@/api/stats/mutations';
import { useMutation } from '@tanstack/react-query';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { statsKeys } from '@/api/stats/queryKeys';
import { queryClient } from '@/utils/query-client';
import { statsQueries } from '@/api/stats/queries';
import { ExcelRow } from '@/types/excel';
import { MONEY_RATIO } from '@/constants/money-ratio';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

const InsightsTab = () => (
  <div className='space-y-6'>
    <SeasonalHint />
    <div className='grid lg:grid-cols-2 gap-6'>
      <div className='min-w-0'><TrendingSongs /></div>
      <div className='min-w-0'><ParetoChart /></div>
    </div>
  </div>
);

const tabItems = [
  { key: 'all',     icon: BarChart3,      label: '전체 분석',  component: Stats },
  { key: 'yearly',  icon: CalendarDays,   label: '월별 분석',  component: YearlyStats },
  { key: 'insights',icon: Lightbulb,      label: '인사이트',   component: InsightsTab },
  { key: 'raw',     icon: List,           label: '전체 보기',  component: SalesAll },
] satisfies { key: string; icon: React.ElementType; label: string; component: React.ElementType }[];

const SalesStatsContent = () => {
  const { isGuest } = useAuth();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const { data: salesSummary } = useQuery(statsQueries.getSalesSummary());
  const { mutate: saveRows } = useMutation(statsMutations.saveSalesRows());

  const handleExcelUpload = useCallback(
    (data: ExcelRow[], name: string) => {
      if (isGuest) {
        toast.error('게스트 모드에서는 매출 데이터를 저장할 수 없습니다.');
        return;
      }
      saveRows(
        { rows: data, name },
        {
          onSuccess: (_, { rows }) => {
            queryClient.invalidateQueries({ queryKey: statsKeys.all });
            toast.success(`${rows.length}건이 저장되었습니다.`);
          },
          onError: (e) =>
            toast.error('저장에 실패했습니다.', { description: e instanceof Error ? e.message : undefined }),
        },
      );
    },
    [saveRows, isGuest],
  );

  const ActiveComponent = tabItems.find((t) => t.key === activeTab)?.component ?? Stats;

  return (
    <AppLayout>
      {/* ── Header ─────────────────────────────────── */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>
            매출 통계
          </p>
          <h1 className='text-3xl font-display font-bold tracking-tight mt-0.5'>
            Sales Analytics
          </h1>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className='flex items-center gap-1.5 bg-card border text-foreground text-xs font-semibold px-5 py-2 rounded-2xl shadow-sm hover:bg-muted/30 transition-colors'
        >
          <Upload className='h-3.5 w-3.5' />
          엑셀 업로드
        </button>
      </div>

      <ExcelUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={handleExcelUpload}
      />

      {/* ── Summary Cards ───────────────────────────── */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <SalesSummaryCard
          icon={DollarSign}
          title='총 매출'
          value={(salesSummary?.totalRevenue ?? 0) * MONEY_RATIO}
          isMoney
        />
        <SalesSummaryCard
          icon={FileSpreadsheet}
          title='총 판매건'
          value={salesSummary?.totalCount ?? 0}
        />
        <SalesSummaryCard
          icon={CalendarDays}
          title='지난달 매출'
          value={(salesSummary?.lastMonthRevenue ?? 0) * MONEY_RATIO}
          percentage={salesSummary?.revenueVsLastMonth ?? 0}
          compareKey='lastMonth'
          isMoney
        />
        <SalesSummaryCard
          icon={FileSpreadsheet}
          title='지난달 판매건'
          value={salesSummary?.lastMonthCount ?? 0}
          percentage={salesSummary?.countVsLastMonth ?? 0}
          compareKey='lastMonth'
        />
      </div>

      {/* ── Tabs ────────────────────────────────────── */}
      <div className='flex items-center gap-1 bg-card border rounded-2xl shadow-sm p-1 w-fit mb-6'>
        {tabItems.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl transition-colors',
              activeTab === key
                ? 'bg-foreground text-background font-semibold shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className='h-3.5 w-3.5' />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ─────────────────────────────── */}
      <ActiveComponent />
    </AppLayout>
  );
};

const SalesStats = () => (
  <ErrorBoundary level='page'>
    <SalesStatsContent />
  </ErrorBoundary>
);

export default SalesStats;
