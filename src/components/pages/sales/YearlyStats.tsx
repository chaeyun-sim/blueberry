import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChartConfig } from '@/components/ui/chart';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useState } from 'react';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { statsQueries } from '@/api/stats/queries';
import GrowthRateChart from './charts/GrowthRateChart';
import CategoryGrowthRateChart from './charts/CategoryGrowthRateChart';
import MonthlyGrowthRateChart from './charts/MonthlyGrowthRateChart';
import { MONEY_RATIO } from '@/constants/money-ratio';
import { useAuth } from '@/hooks/use-auth';
import { categoryChartConfig } from '@/constants/status-config';

function YearlyStats() {
  const { isGuest } = useAuth();

  const { data: yearRange } = useQuery(statsQueries.getSalesYearRange());

  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const year = selectedYear ?? yearRange?.max ?? new Date().getFullYear();
  const yearOptions = yearRange
    ? Array.from({ length: yearRange.max - yearRange.min + 1 }, (_, i) => yearRange.max - i)
    : [year];

  const { data: salesData = [] } = useQuery(statsQueries.getMonthlySales(year));
  const { data: categoryData = [] } = useQuery(statsQueries.getMonthlyCategoryBreakdown(year));

  const avgCount = salesData.length
    ? Math.round(salesData.reduce((sum, d) => sum + d.count, 0) / salesData.length)
    : 0;
  const monthlySalesWithAvg = salesData.map(d => ({ ...d, revenue: isGuest ? d.revenue : d.revenue * MONEY_RATIO, prevRevenue: isGuest ? d.prevRevenue : d.prevRevenue * MONEY_RATIO }));

  const growthData = salesData.map(d => ({
    month: d.month,
    growth:
      d.prevRevenue === 0
        ? 0
        : parseFloat((((d.revenue - d.prevRevenue) / d.prevRevenue) * 100).toFixed(1)),
  }));

  const maxGrowth = growthData.length ? Math.max(...growthData.map(d => d.growth)) : 0;
  const minGrowth = growthData.length ? Math.min(...growthData.map(d => d.growth)) : 0;
  const range = maxGrowth - minGrowth;
  const zeroOffset = range === 0 ? '50%' : `${((maxGrowth / range) * 100).toFixed(1)}%`;

  const activeCategories = Object.keys(categoryChartConfig).filter(key =>
    categoryData.some(d => (d as Record<string, unknown>)[key])
  );

  const activeCategoryConfig: ChartConfig = Object.fromEntries(
    activeCategories.map(k => [k, categoryChartConfig[k]])
  );

  return (
    <div className='space-y-6'>
      <Card className='border-border/50 overflow-hidden'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between flex-wrap gap-3'>
            <CardTitle className='text-base font-display'>월별 매출</CardTitle>
            <div className='flex items-center gap-4'>
              <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <span className='w-2 h-2 rounded-full bg-primary inline-block' />
                올해
              </span>
              <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <span className='w-2 h-2 rounded-full bg-muted-foreground/40 inline-block' />전년도
              </span>
              <Select
                value={String(year)}
                onValueChange={v => setSelectedYear(Number(v))}
                aria-label='월별 매출 연도 선택'
              >
                <SelectTrigger className='w-24 h-7 text-xs'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(y => (
                    <SelectItem key={y} value={String(y)}>{y}년</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <MonthlyGrowthRateChart
            data={monthlySalesWithAvg}
            avgCount={avgCount}
          />
          <div className='border-t border-border/40 pt-4'>
            <div className='flex items-center justify-between mb-3'>
              <p className='text-sm font-medium text-muted-foreground'>카테고리별 매출 비중</p>
              <div className='hidden md:flex items-center gap-3'>
                {Object.entries(activeCategoryConfig).map(([key, cfg]) => (
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
            <CategoryGrowthRateChart
              data={categoryData}
              config={activeCategoryConfig}
            />
          </div>
        </CardContent>
      </Card>

      <Card className='border-border/50 overflow-hidden'>
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
  );
}

export default YearlyStats;
