import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { mockMonthlyBestSellers, mockTopArrangements, monthlySalesData } from '@/mock/sales';
import { formatCurrency } from '@/utils/format-currency';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const barChartConfig: ChartConfig = {
  revenue: { label: '매출', color: 'hsl(var(--primary))' },
  prevRevenue: { label: '전년 매출', color: 'hsl(var(--muted-foreground) / 0.2)' },
};

function YearlyStats() {
  return (
    <>
      <div className='flex items-center gap-3 mb-2'>
        <Select defaultValue='2026'>
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
        <CardHeader className='pb-2'>
          <CardTitle className='text-base font-display'>월별 매출 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={barChartConfig}
            className='aspect-[2/1] w-full max-h-[300px]'
          >
            <BarChart data={monthlySalesData}>
              <CartesianGrid
                vertical={false}
                strokeDasharray='3 3'
              />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={v => `${(v / 10000).toFixed(0)}만`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, item) => (
                      <div className='flex flex-col'>
                        <span>{formatCurrency(value as number)}</span>
                        <span className='text-muted-foreground'>{item}건</span>
                      </div>
                    )}
                  />
                }
              />
              <Bar
                dataKey='prevRevenue'
                fill='var(--color-prevRevenue)'
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey='revenue'
                fill='var(--color-revenue)'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className='grid lg:grid-cols-2 gap-6'>
        <Card className='border-border/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base font-display'>월별 베스트셀러 곡</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {mockMonthlyBestSellers.map(song => (
                <div
                  key={song.rank}
                  className='flex items-center gap-3 p-3 rounded-lg bg-muted/30'
                >
                  <span className='text-lg font-display font-bold text-foreground w-8'>
                    {song.rank}
                  </span>
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium truncate'>{song.title}</p>
                    <p className='text-xs text-muted-foreground'>
                      {song.category} · {song.month} · {song.sales}건
                    </p>
                  </div>
                  <span className='text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary'>
                    {song.month}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className='border-border/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base font-display'>연간 인기 편성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {mockTopArrangements.slice(0, 5).map(arr => (
                <div
                  key={arr.rank}
                  className='flex items-center gap-3 p-3 rounded-lg bg-muted/30'
                >
                  <span className='text-lg font-display font-bold text-foreground w-8'>
                    {arr.rank}
                  </span>
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium truncate'>{arr.arrangement}</p>
                    <p className='text-xs text-muted-foreground'>{arr.sales}건</p>
                  </div>
                  <span className='text-sm font-medium tabular-nums'>
                    {formatCurrency(arr.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default YearlyStats;
