import React, { useState, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ExcelUploadDialog } from '@/components/ExcelUploadDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, DollarSign, BarChart3, FileSpreadsheet, CalendarDays, List } from 'lucide-react';
import Stats from '@/components/pages/sales/Stats';
import YearlyStats from '@/components/pages/sales/YearlyStats';
import SalesSummaryCard from '@/components/pages/sales/SalesSummaryCard';
import SalesAll from '@/components/pages/sales/SalesAll';
import { TabsContent } from '@radix-ui/react-tabs';
import { statsMutations } from '@/api/stats/mutations';
import { useMutation } from '@tanstack/react-query';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { statsKeys } from '@/api/stats/queryKeys';
import { queryClient } from '@/utils/query-client';
import { statsQueries } from '@/api/stats/queries';
import { ExcelRow } from '@/types/excel';
import { MONEY_RATIO } from '@/constants/money-ratio';
import { toast } from 'sonner';

const tabItems = {
  all: { icon: BarChart3, label: '전체 분석', component: Stats },
  yearly: { icon: CalendarDays, label: '월별 분석', component: YearlyStats },
  raw: { icon: List, label: '전체 보기', component: SalesAll },
} satisfies Record<
  string,
  { icon: React.ElementType; label: string; component: React.ElementType }
>;

const SalesStats = () => {
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data: salesSummary } = useQuery(statsQueries.getSalesSummary());
  const { mutate: saveRows } = useMutation(statsMutations.saveSalesRows());

  const handleExcelUpload = useCallback(
    (data: ExcelRow[], name: string) => {
      saveRows(
        { rows: data, name },
        {
          onSuccess: (_, { rows }) => {
            queryClient.invalidateQueries({ queryKey: statsKeys.all });
            toast.success(`${rows.length}건이 저장되었습니다.`);
          },
          onError: e =>
            toast.error('저장에 실패했습니다.', { description: e instanceof Error ? e.message : undefined }),
        },
      );
    },
    [saveRows],
  );

  return (
    <AppLayout>
      <PageHeader
        title='매출 통계'
        description='엑셀 데이터 기반 매출 분석'
      >
        <Button
          variant='outline'
          className='gap-2'
          onClick={() => setUploadOpen(true)}
        >
          <Upload className='h-4 w-4' />
          엑셀 업로드
        </Button>
      </PageHeader>
      <ExcelUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={handleExcelUpload}
      />

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
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

      <Tabs
        defaultValue='all'
        className='space-y-6'
      >
        <TabsList className='grid w-full grid-cols-3 max-w-md'>
          {(Object.keys(tabItems) as Array<keyof typeof tabItems>).map(tab => {
            const Icon = tabItems[tab].icon;
            return (
              <TabsTrigger
                key={tab}
                value={tab}
                className='gap-1.5'
              >
                <Icon className='h-3.5 w-3.5' />
                {tabItems[tab].label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(tabItems) as Array<keyof typeof tabItems>).map(tab => {
          const Component = tabItems[tab].component;
          return (
            <TabsContent
              key={tab}
              value={tab}
              className='space-y-6'
            >
              <Component />
            </TabsContent>
          );
        })}
      </Tabs>
    </AppLayout>
  );
};

export default SalesStats;
