import React, { useState, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { ExcelUploadDialog, type ExcelRow } from '@/components/ExcelUploadDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, DollarSign, BarChart3, FileSpreadsheet, CalendarDays, List } from 'lucide-react';
import { mockExcelData } from '@/mock/sales';
import Stats from '@/components/pages/sales/Stats';
import YearlyStats from '@/components/pages/sales/YearlyStats';
import SalesSummaryCard from '@/components/pages/sales/SalesSummaryCard';
import SalesAll from '@/components/pages/sales/SalesAll';
import { TabsContent } from '@radix-ui/react-tabs';

const tabItems = {
  all: { icon: BarChart3, label: '전체 분석', component: Stats },
  yearly: { icon: CalendarDays, label: '월별 분석', component: YearlyStats },
  raw: { icon: List, label: '전체 보기', component: SalesAll },
} satisfies Record<string, { icon: React.ElementType; label: string; component: React.ElementType }>;

const SalesStats = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [originData, setOriginData] = useState(mockExcelData);

  const handleExcelUpload = useCallback((data: ExcelRow[]) => setOriginData(data), []);

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
          value={19170000}
          percentage={12.5}
          compareKey='lastYear'
          isMoney
        />
        <SalesSummaryCard
          icon={FileSpreadsheet}
          title='총 판매건'
          value={1284}
          percentage={8.3}
          compareKey='lastYear'
        />
        <SalesSummaryCard
          icon={CalendarDays}
          title='지난달 매출'
          value={1760000}
          percentage={5.2}
          compareKey='lastMonth'
          isMoney
        />
        <SalesSummaryCard
          icon={FileSpreadsheet}
          title='지난달 판매건'
          value={98}
          percentage={3.1}
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
              {tab === 'raw' ? <SalesAll originData={originData} /> : <Component />}
            </TabsContent>
          );
        })}
      </Tabs>
    </AppLayout>
  );
};

export default SalesStats;
