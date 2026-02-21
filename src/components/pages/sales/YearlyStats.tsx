import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChartConfig } from '@/components/ui/chart';
import { monthlySalesByYear, monthlyCategoryByYear } from '@/mock/sales';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useState } from 'react';
import GrowthRateChart from './charts/GrowthRateChart';
import CategoryGrowthRateChart from './charts/CategoryGrowthRateChart';
import MonthlyGrowthRateChart from './charts/MonthlyGrowthRateChart';

const categoryChartConfig: ChartConfig = {
  CLASSIC: { label: 'CLASSIC', color: 'hsl(var(--status-complete))' },
  OST: { label: 'OST', color: 'hsl(var(--status-complete) / 0.72)' },
  ANI: { label: 'ANI', color: 'hsl(var(--status-complete) / 0.48)' },
  ETC: { label: 'ETC', color: 'hsl(var(--status-complete) / 0.28)' },
};

function YearlyStats() {
  const [selectedYear, setSelectedYear] = useState('2026');

  const salesData = monthlySalesByYear[selectedYear];
  const categoryData = monthlyCategoryByYear[selectedYear];

  const avgCount = Math.round(salesData.reduce((sum, d) => sum + d.count, 0) / salesData.length);
  const avgRevenue = Math.round(
    salesData.reduce((sum, d) => sum + d.revenue, 0) / salesData.length,
  );
  const monthlySalesWithAvg = salesData.map(d => ({ ...d, avgRevenue }));

  const growthData = salesData.map(d => ({
    month: d.month,
    growth:
      d.prevRevenue === 0
        ? 0
        : parseFloat((((d.revenue - d.prevRevenue) / d.prevRevenue) * 100).toFixed(1)),
  }));

  const maxGrowth = Math.max(...growthData.map(d => d.growth));
  const minGrowth = Math.min(...growthData.map(d => d.growth));
  const range = maxGrowth - minGrowth;
  const zeroOffset = range === 0 ? '50%' : `${((maxGrowth / range) * 100).toFixed(1)}%`;

  return (
    <>
      <div className='flex items-center gap-3 mb-2'>
        <Select
          value={selectedYear}
          onValueChange={setSelectedYear}
        >
          <SelectTrigger className='w-32'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='2026'>2026년</SelectItem>
            <SelectItem value='2025'>2025년</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className='border-border/50'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base font-display'>월별 매출 추이</CardTitle>
            <div className='flex items-center gap-4'>
              <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <span className='w-2 h-2 rounded-full bg-primary inline-block' />
                올해
              </span>
              <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <span className='w-2 h-2 rounded-full bg-muted-foreground/40 inline-block' />총 평균
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MonthlyGrowthRateChart
            data={monthlySalesWithAvg}
            avgCount={avgCount}
          />
        </CardContent>
      </Card>

      <div className='grid lg:grid-cols-2 gap-6'>
        <Card className='border-border/50'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base font-display'>카테고리별 월 매출 비중</CardTitle>
              <div className='flex items-center gap-3'>
                {Object.entries(categoryChartConfig).map(([key, cfg]) => (
                  <span
                    key={key}
                    className='flex items-center gap-1 text-xs text-muted-foreground'
                  >
                    <span
                      className='w-2 h-2 rounded-sm inline-block'
                      style={{ backgroundColor: cfg.color }}
                    />
                    {cfg.label}
                  </span>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CategoryGrowthRateChart
              data={categoryData}
              config={categoryChartConfig}
            />
          </CardContent>
        </Card>

        <Card className='border-border/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base font-display'>전년 대비 월별 성장률</CardTitle>
          </CardHeader>
          <CardContent>
            <GrowthRateChart
              data={growthData}
              offset={zeroOffset}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default YearlyStats;
